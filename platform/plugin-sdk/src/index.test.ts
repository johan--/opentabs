import { ToolError, defineTool, validatePluginName, validateUrlPattern, NAME_REGEX, RESERVED_NAMES } from './index.js';
import { describe, expect, test } from 'bun:test';
import { z } from 'zod';

describe('ToolError', () => {
  test('constructor sets message, code, and name', () => {
    const err = new ToolError('Channel not found', 'CHANNEL_NOT_FOUND');
    expect(err.message).toBe('Channel not found');
    expect(err.code).toBe('CHANNEL_NOT_FOUND');
    expect(err.name).toBe('ToolError');
  });

  test('instanceof Error returns true', () => {
    const err = new ToolError('fail', 'ERR');
    expect(err).toBeInstanceOf(Error);
  });
});

describe('defineTool', () => {
  const input = z.object({ msg: z.string() });
  const output = z.object({ ok: z.boolean() });

  const tool = defineTool({
    name: 'send_message',
    description: 'Send a message',
    input,
    output,
    handle: () => Promise.resolve({ ok: true }),
  });

  test('returns the same config object passed in (identity function)', () => {
    const config = {
      name: 'test_tool',
      description: 'A test tool',
      input,
      output,
      handle: () => Promise.resolve({ ok: true }),
    };
    expect(defineTool(config)).toBe(config);
  });

  test('returned object has name, description, input, output, handle properties', () => {
    expect(tool.name).toBe('send_message');
    expect(tool.description).toBe('Send a message');
    expect(tool.input).toBe(input);
    expect(tool.output).toBe(output);
    expect(typeof tool.handle).toBe('function');
  });
});

describe('re-exports from @opentabs-dev/shared', () => {
  test('validatePluginName is a function', () => {
    expect(typeof validatePluginName).toBe('function');
  });

  test('validateUrlPattern is a function', () => {
    expect(typeof validateUrlPattern).toBe('function');
  });

  test('NAME_REGEX is a RegExp', () => {
    expect(NAME_REGEX).toBeInstanceOf(RegExp);
  });

  test('RESERVED_NAMES is a Set', () => {
    expect(RESERVED_NAMES).toBeInstanceOf(Set);
  });
});
