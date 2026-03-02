/**
 * Permission bypass detection — determined once at startup.
 *
 * The --dangerously-skip-permissions flag (or OPENTABS_SKIP_PERMISSIONS=1
 * env var) bypasses all browser tool confirmation prompts. This is a
 * dangerous option that disables human-in-the-loop safety for sensitive
 * browser operations. It exists for CI/testing environments where no human
 * is available to approve tool calls.
 *
 * The config.json `skipPermissions` field is checked separately at reload
 * time and combined with this flag in state.skipPermissions.
 */

const cliSkipPermissions =
  process.argv.includes('--dangerously-skip-permissions') || process.env['OPENTABS_SKIP_PERMISSIONS'] === '1';

/** Whether the CLI flag or env var requests permission bypass */
export const isCliSkipPermissions = (): boolean => cliSkipPermissions;
