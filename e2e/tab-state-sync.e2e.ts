/**
 * Tab state sync E2E tests — verify the extension correctly tracks and reports
 * tab state transitions to the MCP server across various scenarios:
 *
 * - Navigate away from matching URL → state transitions to 'closed'
 * - Multi-tab resilience → plugin stays ready when one matching tab is closed
 * - Rapid close/reopen → state recovers correctly
 * - Server restart reconnect → tab state re-synced via tab.syncAll
 */

import { test, expect } from './fixtures.js';
import { setupToolTest } from './helpers.js';

// ---------------------------------------------------------------------------
// US-003: Navigate away → closed transition
// ---------------------------------------------------------------------------

test.describe('Tab state sync — navigate away', () => {
  test('tab state transitions to closed when navigating away from matching URL', async ({
    mcpServer,
    testServer,
    extensionContext,
    mcpClient,
  }) => {
    // 1. Open a matching tab and wait for ready state
    const page = await setupToolTest(mcpServer, testServer, extensionContext, mcpClient);

    // 2. Verify the server reports 'ready' state
    await expect
      .poll(
        async () => {
          const res = await fetch(`http://localhost:${mcpServer.port}/health`);
          const body = (await res.json()) as {
            pluginDetails?: Array<{ name: string; tabState: string }>;
          };
          return body.pluginDetails?.find(p => p.name === 'e2e-test')?.tabState;
        },
        { timeout: 15_000, message: 'Server tab state for e2e-test should be ready' },
      )
      .toBe('ready');

    // 3. Navigate the tab to a non-matching URL.
    // The e2e-test plugin matches http://localhost/* — navigating to a
    // different origin causes the extension to detect no matching tabs.
    await page.goto('https://example.com', { waitUntil: 'load' });

    // 4. Poll /health until tabState becomes 'closed'
    await expect
      .poll(
        async () => {
          const res = await fetch(`http://localhost:${mcpServer.port}/health`);
          const body = (await res.json()) as {
            pluginDetails?: Array<{ name: string; tabState: string }>;
          };
          return body.pluginDetails?.find(p => p.name === 'e2e-test')?.tabState;
        },
        {
          timeout: 30_000,
          message: 'Server tab state for e2e-test did not transition to closed after navigating away',
        },
      )
      .toBe('closed');

    // 5. Verify tool dispatch returns an error when no matching tab is open
    const result = await mcpClient.callTool('e2e-test_echo', { message: 'should fail' });
    expect(result.isError).toBe(true);

    await page.close();
  });
});
