import { parseManifest } from './manifest-schema.js';
import { describe, expect, test } from 'bun:test';

/** Minimal valid manifest JSON for testing. Override fields as needed. */
const makeManifest = (overrides: Record<string, unknown> = {}): string =>
  JSON.stringify({
    name: 'test-plugin',
    version: '1.0.0',
    description: 'A test plugin',
    url_patterns: ['*://example.com/*'],
    tools: [
      {
        name: 'test_tool',
        description: 'A test tool',
        input_schema: { type: 'object' },
        output_schema: { type: 'object' },
      },
    ],
    ...overrides,
  });

describe('parseManifest', () => {
  test('parses valid manifest', () => {
    const manifest = parseManifest(makeManifest(), 'test.json');
    expect(manifest.name).toBe('test-plugin');
    expect(manifest.tools).toHaveLength(1);
  });

  test('rejects invalid JSON', () => {
    expect(() => parseManifest('{bad', 'test.json')).toThrow('Invalid JSON');
  });

  test('rejects missing required fields', () => {
    expect(() => parseManifest(JSON.stringify({}), 'test.json')).toThrow('Invalid plugin manifest');
  });

  describe('description length limits', () => {
    test('rejects tool description exceeding 1000 characters', () => {
      const longDesc = 'a'.repeat(1001);
      const raw = makeManifest({
        tools: [
          {
            name: 'test_tool',
            description: longDesc,
            input_schema: { type: 'object' },
            output_schema: { type: 'object' },
          },
        ],
      });
      expect(() => parseManifest(raw, 'test.json')).toThrow('Tool description must be at most 1000 characters');
    });

    test('accepts tool description at exactly 1000 characters', () => {
      const exactDesc = 'a'.repeat(1000);
      const raw = makeManifest({
        tools: [
          {
            name: 'test_tool',
            description: exactDesc,
            input_schema: { type: 'object' },
            output_schema: { type: 'object' },
          },
        ],
      });
      const manifest = parseManifest(raw, 'test.json');
      const firstTool = manifest.tools[0];
      expect(firstTool).toBeDefined();
      expect(firstTool?.description).toBe(exactDesc);
    });

    test('rejects plugin description exceeding 500 characters', () => {
      const longDesc = 'b'.repeat(501);
      const raw = makeManifest({ description: longDesc });
      expect(() => parseManifest(raw, 'test.json')).toThrow('Plugin description must be at most 500 characters');
    });

    test('accepts plugin description at exactly 500 characters', () => {
      const exactDesc = 'b'.repeat(500);
      const raw = makeManifest({ description: exactDesc });
      const manifest = parseManifest(raw, 'test.json');
      expect(manifest.description).toBe(exactDesc);
    });
  });
});
