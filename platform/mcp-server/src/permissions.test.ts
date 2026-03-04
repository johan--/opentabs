import { describe, expect, test } from 'vitest';
import { evaluatePermission, getToolTier, matchDomain, matchesDomainList, TOOL_TIERS } from './permissions.js';
import { createState } from './state.js';

describe('matchDomain', () => {
  test('exact match', () => {
    expect(matchDomain('example.com', 'example.com')).toBe(true);
  });

  test('exact mismatch', () => {
    expect(matchDomain('example.com', 'other.com')).toBe(false);
  });

  test('wildcard matches subdomain', () => {
    expect(matchDomain('sub.example.com', '*.example.com')).toBe(true);
  });

  test('wildcard matches deep subdomain', () => {
    expect(matchDomain('a.b.example.com', '*.example.com')).toBe(true);
  });

  test('wildcard does not match the root domain itself', () => {
    expect(matchDomain('example.com', '*.example.com')).toBe(false);
  });

  test('wildcard does not match unrelated domain', () => {
    expect(matchDomain('notexample.com', '*.example.com')).toBe(false);
  });
});

describe('matchesDomainList', () => {
  test('matches any pattern in the list', () => {
    expect(matchesDomainList('sub.example.com', ['localhost', '*.example.com'])).toBe(true);
  });

  test('returns false when no pattern matches', () => {
    expect(matchesDomainList('evil.com', ['localhost', '*.example.com'])).toBe(false);
  });

  test('handles empty list', () => {
    expect(matchesDomainList('anything.com', [])).toBe(false);
  });
});

describe('getToolTier', () => {
  test('observe tier for list_tabs', () => {
    expect(getToolTier('browser_list_tabs')).toBe('observe');
  });

  test('interact tier for click_element', () => {
    expect(getToolTier('browser_click_element')).toBe('interact');
  });

  test('sensitive tier for execute_script', () => {
    expect(getToolTier('browser_execute_script')).toBe('sensitive');
  });

  test('sensitive tier for get_cookies', () => {
    expect(getToolTier('browser_get_cookies')).toBe('sensitive');
  });

  test('sensitive tier for get_storage', () => {
    expect(getToolTier('browser_get_storage')).toBe('sensitive');
  });

  test('unknown tools default to interact', () => {
    expect(getToolTier('browser_unknown_tool')).toBe('interact');
  });

  test('all known browser tools are classified', () => {
    const knownTools = Object.keys(TOOL_TIERS);
    expect(knownTools.length).toBeGreaterThan(30);
  });
});

describe('evaluatePermission — default tier behavior', () => {
  test('observe tier tools default to allow', () => {
    const state = createState();
    expect(evaluatePermission('browser_list_tabs', 'example.com', state)).toBe('allow');
  });

  test('interact tier tools default to ask', () => {
    const state = createState();
    expect(evaluatePermission('browser_click_element', 'example.com', state)).toBe('ask');
  });

  test('sensitive tier tools default to ask', () => {
    const state = createState();
    expect(evaluatePermission('browser_execute_script', 'example.com', state)).toBe('ask');
  });

  test('null domain uses tier default without trusted domain check', () => {
    const state = createState();
    // interact tier with null domain — tier default is 'ask', no trusted domain check
    expect(evaluatePermission('browser_click_element', null, state)).toBe('ask');
  });
});

describe('evaluatePermission — bypass flag', () => {
  test('skipPermissions bypasses all permissions', () => {
    const state = createState();
    state.skipPermissions = true;
    expect(evaluatePermission('browser_execute_script', 'evil.com', state)).toBe('allow');
  });
});

describe('evaluatePermission — trusted domain override (hardcoded defaults)', () => {
  test('trusted domain (localhost) upgrades interact tier from ask to allow', () => {
    const state = createState();
    expect(evaluatePermission('browser_click_element', 'localhost', state)).toBe('allow');
  });

  test('trusted domain (127.0.0.1) upgrades sensitive tier from ask to allow', () => {
    const state = createState();
    expect(evaluatePermission('browser_execute_script', '127.0.0.1', state)).toBe('allow');
  });

  test('non-trusted domain does not get upgrade', () => {
    const state = createState();
    expect(evaluatePermission('browser_click_element', 'example.com', state)).toBe('ask');
  });
});
