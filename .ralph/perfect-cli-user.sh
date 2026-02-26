#!/bin/bash
# perfect-cli-user.sh — Invoke Claude to perform a fresh-user CLI experience test and create PRD(s) for frictions found.
#
# Usage: bash .ralph/perfect-cli-user.sh
#
# This script launches a single Claude session (default model) that:
#   1. Spins up a Docker container simulating a brand-new user environment
#   2. Installs the opentabs CLI from npm and exercises every command
#   3. Identifies UX frictions, confusing output, broken flows, and error handling gaps
#   4. Uses the ralph skill to generate PRD(s) targeting the root monorepo
#
# Prerequisites:
#   - Docker running (Docker Desktop or OrbStack)
#   - ralph-worker image built: bash .ralph/docker-build.sh
#   - ~/.npmrc with valid auth token for @opentabs-dev packages
#
# The ralph daemon (.ralph/ralph.sh) must be running to pick up the PRDs.
# This script does NOT start ralph — it only creates the PRD files.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

read -r -d '' PROMPT <<'PROMPT_EOF' || true
You are a QA engineer performing a fresh-user experience test of the OpenTabs CLI. Your job is to install and use the CLI exactly as a real new user would — someone who has never heard of OpenTabs before — identify every friction point, then use the ralph skill to create PRD(s) to fix them.

## Step 1: Read the rules and understand the project

1. Read CLAUDE.md (root) — overall platform architecture, key concepts, commands
2. Read platform/cli/CLAUDE.md — CLI commands, expected user workflow, config files
3. Read platform/cli/src/commands/start.ts — first-run setup logic, MCP client config output
4. Read platform/cli/src/commands/status.ts — status display logic
5. Read platform/cli/src/commands/doctor.ts — diagnostic checks
6. Read platform/cli/src/commands/plugin.ts — plugin search/install/create/remove logic
7. Read platform/cli/src/commands/config.ts — config management
8. Read platform/cli/src/commands/audit.ts — audit log display
9. Read platform/cli/src/commands/logs.ts — log tailing
10. Read platform/cli/src/commands/setup.ts — first-run initialization and extension install

Understanding the source is critical — you need to know the intended behavior to evaluate whether the actual behavior matches user expectations.

## Step 2: Set up a clean Docker environment

Launch a Docker container from the ralph-worker image to simulate a brand-new user machine. The container must:

- Use the `ralph-worker:latest` image (has Node.js, npm, Chromium pre-installed)
- Mount `~/.npmrc` read-only for npm auth (private @opentabs-dev packages)
- Set a clean HOME directory (e.g., /home/testuser) with no prior opentabs config
- Use `--network host` so the MCP server port is accessible
- Use `--init --ipc=host --shm-size=2g` for Chromium compatibility

Example:
```bash
docker run --rm -d \
  --name opentabs-ux-test \
  --init --ipc=host --shm-size=2g \
  --network host \
  -e "HOME=/home/testuser" \
  -v "$HOME/.npmrc:/tmp/staging/.npmrc:ro" \
  ralph-worker:latest \
  "mkdir -p /home/testuser && cp /tmp/staging/.npmrc /home/testuser/.npmrc 2>/dev/null; sleep 86400"
```

IMPORTANT: Clean up the container when done (docker kill + docker rm).

## Step 3: Walk through the COMPLETE new-user journey

Act as a new user. Exercise every command and workflow. Be thorough and methodical.

### Phase 1: Discovery (before install)
- What would a user search for? Try `npx create-opentabs-plugin` and `npx @opentabs-dev/create-plugin` to see if the scaffolding CLI is discoverable.

### Phase 2: Installation
- Install the CLI: `npm install -g @opentabs-dev/cli`
- Check `opentabs --version` and `opentabs --help`
- Try running `opentabs` with no arguments
- Try a typo like `opentabs strat` to see error handling

### Phase 3: First run
- Run `opentabs start` and capture the FULL first-time output
- Analyze the setup instructions: Are they clear? Complete? Correct?
- Does the printed MCP client config actually work? (check if auth headers are included)
- Stop the server and run `opentabs start` again — compare first-run vs second-run output

### Phase 4: Server running — test all commands
Start the server in the background, then test every command:
- `opentabs status` and `opentabs status --json`
- `opentabs doctor`
- `opentabs logs` and `opentabs logs --lines 10`
- `opentabs audit` and `opentabs audit --file`
- `opentabs config show` and `opentabs config show --json` and `opentabs config show --json --show-secret`
- `opentabs config path`
- `opentabs config set port 8080` then `opentabs config set port 9515` (reset)
- `opentabs config set tool.` (list tools)
- `opentabs config set invalidkey foo` (error handling)
- `opentabs config set port notanumber` (validation)
- `opentabs config reset` (without --confirm)
- `opentabs config rotate-secret` (without --confirm)
- `opentabs plugin --help`
- `opentabs plugin search` (no query)
- `opentabs plugin search slack`
- `opentabs plugin search nonexistent-thing-12345`
- `opentabs plugin list` and `opentabs plugin list --json`
- `opentabs plugin install slack`
- `opentabs plugin list` (after install — verify it shows up)
- `opentabs status` (after install — verify tool count changed)
- `opentabs plugin remove slack` (without --confirm)
- `opentabs plugin remove slack --confirm`
- `opentabs plugin create test-plugin --domain .example.com --display "Test" --description "A test"` (in a temp dir)
- Try `cd` into the scaffolded plugin and run `npm install && npm run build`
- Verify the built plugin auto-registers with the running server
- `opentabs config set localPlugins.add /tmp/nonexistent-path` (warning behavior)
- `opentabs config set localPlugins.remove /tmp/nonexistent-path`
- `opentabs update`

### Phase 5: Server stopped — test offline behavior
Kill the server and test every command again:
- `opentabs status` — should say "not running"
- `opentabs doctor` — should degrade gracefully
- `opentabs audit` — should handle gracefully
- `opentabs logs` — should still work (reads from file)
- `opentabs plugin list` — should work in offline mode
- `opentabs config show` — should work without server

### Phase 6: Edge cases
- Run `opentabs start` when server is already running (port conflict)
- Run `opentabs start --port 3000` then `opentabs status --port 3000`
- Test `opentabs config set browser-tool.execute_script disabled`
- Test every `--help` flag on every subcommand

### Phase 7: Cleanup
- Kill and remove the Docker container

## Step 4: Evaluate every interaction for friction

For each command tested, evaluate:

1. **Clarity**: Is the output clear to a new user? Would they understand what to do next?
2. **Correctness**: Does the output match reality? Are configs functional? Are counts accurate?
3. **Completeness**: Is any important information missing?
4. **Error handling**: Do errors provide actionable guidance?
5. **Consistency**: Are patterns consistent across commands? (e.g., --json flags, --help, error format)
6. **Noise**: Is there unnecessary output that distracts from what matters?
7. **Discoverability**: Can the user find features they need? Are important flags documented?
8. **Progressive disclosure**: Does the CLI show the right amount of info for beginners vs power users?

### Categories of friction to look for:

- **Broken flows**: Output that leads users to do the wrong thing (e.g., copy config that won't work)
- **Confusing output**: Numbers, labels, or messages that don't make sense without insider knowledge
- **Missing information**: Important details not shown when they should be
- **Excessive information**: Output that overwhelms or buries the important stuff
- **Inconsistent behavior**: Commands that behave differently than similar commands
- **Silent failures**: Things that fail without telling the user
- **Missing validation**: Accepting invalid input without warning
- **Poor error messages**: Errors that don't tell the user how to fix the problem
- **Discoverability gaps**: Features that exist but users would never find

## Step 5: Create PRD(s) using the ralph skill

After completing all testing, compile your findings and use the skill tool to load the "ralph" skill, then create PRD(s).

Key parameters:
- Target project: "OpenTabs Platform" (root monorepo)
- Do NOT set workingDirectory or qualityChecks (root monorepo uses defaults)
- Group related fixes into the same PRD to avoid merge conflicts (fixes to the same file go together)
- All stories: e2eCheckpoint: false (CLI changes are not browser-observable)
- Always use small stories (1-3 files per story)
- Include repo-root-relative file paths and approximate line numbers in the notes field
- Every story must have concrete, verifiable acceptance criteria
- Skip clarifying questions — this prompt provides all the context needed

Severity triage:
- **HIGH**: Broken flows (user copies output that doesn't work), silent data loss, crashes
- **MEDIUM**: Confusing output, missing information, poor discoverability
- **LOW**: Cosmetic issues, minor inconsistencies, edge case polish

Only create PRDs for HIGH and MEDIUM issues. Document LOW issues in the PRD description field as known minor issues but do not create stories for them.

Do NOT create stories for:
- Stylistic preferences about CLI output formatting
- Features that work correctly but you would design differently
- Issues that are infeasible to fix (e.g., npm search not returning private packages — if there's no good workaround)

DO create stories for:
- Output that misleads users into incorrect actions
- Missing or incorrect information in critical flows (first-run, MCP config)
- Error messages that don't help the user fix the problem
- Commands that behave unexpectedly compared to documented or help text behavior
- Inconsistent patterns across the CLI surface area
PROMPT_EOF

echo "=== perfect-cli-user.sh ==="
echo "Launching Claude to test CLI user experience and create PRD(s)..."
echo ""

echo "$PROMPT" | bash "$SCRIPT_DIR/run-prompt.sh"
