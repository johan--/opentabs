import { SIDE_PANEL_WINDOWS_KEY } from './constants.js';

/** Write the set of window IDs with open side panels to chrome.storage.local (best-effort). */
export const persistOpenWindows = (windowIds: Set<number>): void => {
  chrome.storage.local.set({ [SIDE_PANEL_WINDOWS_KEY]: [...windowIds] }).catch(() => {});
};

/**
 * Read stored window IDs from chrome.storage.local, validate each against
 * currently open windows, reopen side panels in valid windows, and return
 * the set of window IDs that were successfully reopened.
 */
export const restoreSidePanels = async (): Promise<Set<number>> => {
  const data: Record<string, unknown> = await chrome.storage.local.get(SIDE_PANEL_WINDOWS_KEY);
  const stored = data[SIDE_PANEL_WINDOWS_KEY];
  if (!Array.isArray(stored) || stored.length === 0) return new Set();

  const allWindows = await chrome.windows.getAll();
  const validWindowIds = new Set(allWindows.map(w => w.id).filter((id): id is number => id !== undefined));

  const restored = new Set<number>();
  for (const windowId of stored) {
    if (typeof windowId !== 'number' || !validWindowIds.has(windowId)) continue;
    try {
      await chrome.sidePanel.open({ windowId });
      restored.add(windowId);
    } catch {
      // Window may have closed between the getAll check and the open call
    }
  }

  // Write back the cleaned-up set (removes stale IDs)
  persistOpenWindows(restored);
  return restored;
};

/** Remove the side panel state from chrome.storage.local. */
export const clearSidePanelState = (): void => {
  chrome.storage.local.remove(SIDE_PANEL_WINDOWS_KEY).catch(() => {});
};
