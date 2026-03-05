/**
 * E2E tests for security protections: DNS rebinding (Host header validation),
 * CORS/Origin protection, concurrency limits, rate limiting, and more.
 */

import http from 'node:http';
import { cleanupTestConfigDir, createTestConfigDir, expect, startMcpServer, test } from './fixtures.js';
import { parseToolResult, setupToolTest } from './helpers.js';

// ---------------------------------------------------------------------------
// Helper: HTTP request with custom Host header
// ---------------------------------------------------------------------------

/**
 * Send an HTTP request using `node:http` so we can override the Host header.
 * Node.js `fetch` treats Host as a forbidden header and silently ignores it.
 */
function requestWithHost(
  port: number,
  pathname: string,
  hostHeader: string,
): Promise<{ status: number; body: string; headers: http.IncomingHttpHeaders }> {
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: '127.0.0.1',
        port,
        path: pathname,
        method: 'GET',
        headers: { Host: hostHeader },
      },
      res => {
        let body = '';
        res.on('data', (chunk: Buffer) => {
          body += chunk.toString();
        });
        res.on('end', () => {
          resolve({ status: res.statusCode ?? 0, body, headers: res.headers });
        });
      },
    );
    req.on('error', reject);
    req.setTimeout(5_000, () => {
      req.destroy(new Error('Request timed out'));
    });
    req.end();
  });
}

// ---------------------------------------------------------------------------
// US-001: DNS rebinding protection rejects non-localhost Host headers
// ---------------------------------------------------------------------------

test.describe('DNS rebinding protection — Host header validation', () => {
  let configDir = '';

  test.beforeEach(() => {
    configDir = createTestConfigDir();
  });

  test.afterEach(() => {
    if (configDir) cleanupTestConfigDir(configDir);
  });

  test('rejects requests with evil Host headers (403)', async () => {
    const server = await startMcpServer(configDir, true);
    try {
      await server.waitForHealth(h => h.status === 'ok');

      const evilHosts = ['evil.com', 'localhost.evil.com', 'evil.com:8080'];

      for (const host of evilHosts) {
        const res = await requestWithHost(server.port, '/health', host);
        expect(res.status, `Host: ${host} should be rejected`).toBe(403);
        expect(res.body).toContain('invalid Host header');
      }
    } finally {
      await server.kill();
    }
  });

  test('accepts requests with valid localhost Host headers', async () => {
    const server = await startMcpServer(configDir, true);
    try {
      await server.waitForHealth(h => h.status === 'ok');

      const validHosts = [
        'localhost',
        `localhost:${server.port}`,
        '127.0.0.1',
        `127.0.0.1:${server.port}`,
        `[::1]:${server.port}`,
      ];

      for (const host of validHosts) {
        const res = await requestWithHost(server.port, '/health', host);
        expect(res.status, `Host: ${host} should be accepted`).toBe(200);
      }
    } finally {
      await server.kill();
    }
  });

  test('rejects requests with IPv6-like malicious hosts', async () => {
    const server = await startMcpServer(configDir, true);
    try {
      await server.waitForHealth(h => h.status === 'ok');

      // Malformed IPv6 and non-localhost IPv6 addresses
      const maliciousHosts = ['[::2]:8080', '[evil'];

      for (const host of maliciousHosts) {
        const res = await requestWithHost(server.port, '/health', host);
        expect(res.status, `Host: ${host} should be rejected`).toBe(403);
        expect(res.body).toContain('invalid Host header');
      }
    } finally {
      await server.kill();
    }
  });

  test('accepts IPv4-mapped IPv6 localhost address', async () => {
    const server = await startMcpServer(configDir, true);
    try {
      await server.waitForHealth(h => h.status === 'ok');

      const res = await requestWithHost(server.port, '/health', `[::ffff:127.0.0.1]:${server.port}`);
      expect(res.status).toBe(200);
    } finally {
      await server.kill();
    }
  });
});

// ---------------------------------------------------------------------------
// US-002: CORS protection rejects browser Origin headers
// ---------------------------------------------------------------------------

test.describe('CORS protection — Origin header validation', () => {
  let configDir = '';

  test.beforeEach(() => {
    configDir = createTestConfigDir();
  });

  test.afterEach(() => {
    if (configDir) cleanupTestConfigDir(configDir);
  });

  test('rejects requests with non-chrome-extension Origin headers (403)', async () => {
    const server = await startMcpServer(configDir, true);
    try {
      await server.waitForHealth(h => h.status === 'ok');

      const evilOrigins = ['https://evil.com', 'http://localhost:3000', 'https://attacker.io', 'http://127.0.0.1:8080'];

      for (const origin of evilOrigins) {
        const res = await fetch(`http://localhost:${server.port}/health`, {
          headers: { Origin: origin },
        });
        expect(res.status, `Origin: ${origin} should be rejected`).toBe(403);
        expect(await res.text()).toContain('browser requests are not allowed');
      }
    } finally {
      await server.kill();
    }
  });

  test('accepts requests with chrome-extension:// Origin', async () => {
    const server = await startMcpServer(configDir, true);
    try {
      await server.waitForHealth(h => h.status === 'ok');

      const res = await fetch(`http://localhost:${server.port}/health`, {
        headers: { Origin: 'chrome-extension://abcdefghijklmnop' },
      });
      expect(res.status).toBe(200);
    } finally {
      await server.kill();
    }
  });

  test('accepts requests with no Origin header (MCP clients)', async () => {
    const server = await startMcpServer(configDir, true);
    try {
      await server.waitForHealth(h => h.status === 'ok');

      const res = await fetch(`http://localhost:${server.port}/health`);
      expect(res.status).toBe(200);
    } finally {
      await server.kill();
    }
  });
});

// ---------------------------------------------------------------------------
// US-003: Per-plugin concurrency limit rejects 6th concurrent dispatch
// ---------------------------------------------------------------------------

test.describe('Per-plugin concurrency limit', () => {
  test('rejects 6th concurrent dispatch with concurrency error', async ({
    mcpServer,
    testServer,
    extensionContext,
    mcpClient,
  }) => {
    // Multiple concurrent slow tool calls — mark as slow for extended timeout
    test.slow();

    const page = await setupToolTest(mcpServer, testServer, extensionContext, mcpClient);

    // Fire 6 concurrent slow_with_progress calls (limit is 5 per plugin).
    // Each call sleeps for 10s with 2 progress steps — long enough to keep
    // all 5 dispatch slots occupied while the 6th is checked.
    const promises = Array.from({ length: 6 }, () =>
      mcpClient.callTool('e2e-test_slow_with_progress', { durationMs: 10_000, steps: 2 }, { timeout: 30_000 }),
    );
    const results = await Promise.all(promises);

    const successes = results.filter(r => !r.isError);
    const failures = results.filter(r => r.isError);

    // Exactly 5 should succeed and 1 should fail with the concurrency limit error
    expect(successes).toHaveLength(5);
    expect(failures).toHaveLength(1);
    expect(failures[0]?.content).toContain('Too many concurrent dispatches');
    expect(failures[0]?.content).toContain('e2e-test');
    expect(failures[0]?.content).toContain('limit: 5');

    await page.close();
  });

  test('frees dispatch slot after tool completes, allowing new calls', async ({
    mcpServer,
    testServer,
    extensionContext,
    mcpClient,
  }) => {
    test.slow();

    const page = await setupToolTest(mcpServer, testServer, extensionContext, mcpClient);

    // Fill all 5 slots with short-lived calls (2s each)
    const fillPromises = Array.from({ length: 5 }, () =>
      mcpClient.callTool('e2e-test_slow_with_progress', { durationMs: 2000, steps: 2 }, { timeout: 30_000 }),
    );

    // Wait for all 5 to complete — all slots are now free
    const fillResults = await Promise.all(fillPromises);
    for (const r of fillResults) {
      expect(r.isError).toBe(false);
      const output = parseToolResult(r.content);
      expect(output.completed).toBe(true);
    }

    // A new call should succeed (slots freed)
    const result = await mcpClient.callTool(
      'e2e-test_slow_with_progress',
      { durationMs: 1000, steps: 1 },
      { timeout: 30_000 },
    );
    expect(result.isError).toBe(false);
    const output = parseToolResult(result.content);
    expect(output.completed).toBe(true);

    await page.close();
  });
});
