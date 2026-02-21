// ---------------------------------------------------------------------------
// Page state utilities for plugin authors
// ---------------------------------------------------------------------------

/**
 * Overloaded call signature for getPageGlobal — returns `T | undefined` when
 * an explicit generic is provided, `unknown` otherwise.
 */
export type GetPageGlobal = {
  (path: string): unknown;
  <T>(path: string & { __brand?: T }): T | undefined;
};

/**
 * Safe deep property access on `globalThis` using dot-notation path.
 * Returns `undefined` if any segment in the path is missing or if a getter
 * throws. Supports a generic type parameter for ergonomic typing at the
 * call site without requiring `as` casts.
 *
 * @example
 * const token = getPageGlobal<string>('TS.boot_data.api_token'); // string | undefined
 */
export const getPageGlobal: GetPageGlobal = (path: string): unknown => {
  try {
    const segments = path.split('.');
    let current: unknown = globalThis;
    for (const segment of segments) {
      if (current === null || current === undefined || typeof current !== 'object') return undefined;
      current = (current as Record<string, unknown>)[segment];
    }
    return current;
  } catch {
    return undefined;
  }
};

/**
 * Returns the current page URL (`window.location.href`).
 */
export const getCurrentUrl = (): string => window.location.href;

/**
 * Returns the current page title (`document.title`).
 */
export const getPageTitle = (): string => document.title;
