import { defineTool, getLocalStorage, getSessionStorage } from '@opentabs-dev/plugin-sdk';
import { z } from 'zod';

/**
 * Tests removeLocalStorage and removeSessionStorage SDK utilities.
 *
 * The published SDK (v0.0.16) does not export removeLocalStorage or
 * removeSessionStorage — those were added in local source. This tool
 * implements the removal logic inline (try/catch around removeItem) to
 * test the full dispatch pipeline without depending on unpublished exports.
 */
export const sdkRemoveStorage = defineTool({
  name: 'sdk_remove_storage',
  displayName: 'SDK Remove Storage',
  description: 'Tests storage removal — removes a key from localStorage or sessionStorage',
  icon: 'trash',
  input: z.object({
    storageType: z.enum(['local', 'session']).describe('Which storage to remove from'),
    key: z.string().describe('The storage key to remove'),
  }),
  output: z.object({
    existed: z.boolean().describe('Whether the key existed before removal'),
    afterRemoval: z.boolean().describe('Whether the key still exists after removal (should be false)'),
  }),
  handle: async params => {
    const getter = params.storageType === 'local' ? getLocalStorage : getSessionStorage;
    const existed = getter(params.key) !== null;

    // Inline removal logic (removeLocalStorage/removeSessionStorage not in published SDK)
    try {
      if (params.storageType === 'local') {
        localStorage.removeItem(params.key);
      } else {
        sessionStorage.removeItem(params.key);
      }
    } catch {
      // Silently fail on SecurityError (matches SDK pattern)
    }

    const afterRemoval = getter(params.key) !== null;
    return { existed, afterRemoval };
  },
});
