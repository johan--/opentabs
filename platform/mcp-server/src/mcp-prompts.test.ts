import { describe, expect, test } from 'vitest';
import { PROMPTS, resolvePrompt } from './mcp-prompts.js';

describe('PROMPTS — prompt definitions', () => {
  test('contains build_plugin prompt', () => {
    const names = PROMPTS.map(p => p.name);
    expect(names).toContain('build_plugin');
  });

  test('build_plugin has a non-empty description', () => {
    const prompt = PROMPTS.find(p => p.name === 'build_plugin');
    expect(prompt).toBeDefined();
    expect(prompt?.description.length).toBeGreaterThan(0);
  });

  test('build_plugin has url argument marked as required', () => {
    const prompt = PROMPTS.find(p => p.name === 'build_plugin');
    const urlArg = prompt?.arguments.find(a => a.name === 'url');
    expect(urlArg).toBeDefined();
    expect(urlArg?.required).toBe(true);
  });

  test('build_plugin has name argument marked as optional', () => {
    const prompt = PROMPTS.find(p => p.name === 'build_plugin');
    const nameArg = prompt?.arguments.find(a => a.name === 'name');
    expect(nameArg).toBeDefined();
    expect(nameArg?.required).toBe(false);
  });

  test('all prompts have unique names', () => {
    const names = PROMPTS.map(p => p.name);
    expect(new Set(names).size).toBe(names.length);
  });

  test('all prompt arguments have descriptions', () => {
    for (const prompt of PROMPTS) {
      for (const arg of prompt.arguments) {
        expect(arg.description.length, `${prompt.name}.${arg.name} missing description`).toBeGreaterThan(0);
      }
    }
  });
});

describe('resolvePrompt — build_plugin', () => {
  test('returns result with url substituted into messages', () => {
    const result = resolvePrompt('build_plugin', { url: 'https://app.slack.com' });
    expect(result).not.toBeNull();
    expect(result?.description).toContain('https://app.slack.com');
    expect(result?.messages).toHaveLength(1);
    const msg = result?.messages[0];
    expect(msg?.role).toBe('user');
    expect(msg?.content.type).toBe('text');
    expect(msg?.content.text).toContain('https://app.slack.com');
  });

  test('includes plugin name in output when name argument is provided', () => {
    const result = resolvePrompt('build_plugin', { url: 'https://slack.com', name: 'slack' });
    expect(result?.messages[0]?.content.text).toContain('`slack`');
  });

  test('omits name clause when name argument is empty', () => {
    const result = resolvePrompt('build_plugin', { url: 'https://slack.com' });
    const text = result?.messages[0]?.content.text ?? '';
    expect(text).not.toContain('The plugin name should be');
  });

  test('uses default url when url argument is missing', () => {
    const result = resolvePrompt('build_plugin', {});
    expect(result?.messages[0]?.content.text).toContain('https://example.com');
  });

  test('includes key workflow phases', () => {
    const result = resolvePrompt('build_plugin', { url: 'https://example.com' });
    const text = result?.messages[0]?.content.text ?? '';
    expect(text).toContain('Phase 1');
    expect(text).toContain('Phase 2');
    expect(text).toContain('Phase 3');
    expect(text).toContain('Phase 4');
    expect(text).toContain('Phase 5');
  });

  test('includes plugin_analyze_site tool reference with provided URL', () => {
    const result = resolvePrompt('build_plugin', { url: 'https://linear.app' });
    const text = result?.messages[0]?.content.text ?? '';
    expect(text).toContain('plugin_analyze_site');
    expect(text).toContain('https://linear.app');
  });

  test('includes SDK references and code patterns', () => {
    const result = resolvePrompt('build_plugin', { url: 'https://example.com' });
    const text = result?.messages[0]?.content.text ?? '';
    expect(text).toContain('OpenTabsPlugin');
    expect(text).toContain('defineTool');
    expect(text).toContain('ToolError');
    expect(text).toContain('isReady');
  });

  test('includes common gotchas', () => {
    const result = resolvePrompt('build_plugin', { url: 'https://example.com' });
    const text = result?.messages[0]?.content.text ?? '';
    expect(text).toContain('Common Gotchas');
    expect(text).toContain('credentials');
  });

  test('description reflects the target URL', () => {
    const result = resolvePrompt('build_plugin', { url: 'https://my-app.io' });
    expect(result?.description).toBe('Build an OpenTabs plugin for https://my-app.io');
  });
});

describe('resolvePrompt — unknown prompts', () => {
  test('returns null for unknown prompt name', () => {
    expect(resolvePrompt('nonexistent', {})).toBeNull();
  });

  test('returns null for empty prompt name', () => {
    expect(resolvePrompt('', {})).toBeNull();
  });
});
