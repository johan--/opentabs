#!/bin/bash
# perfect-perfect-perfect.sh — Audit the script that audits the audit scripts.
#
# perfect-perfect.sh audits the perfect-*.sh scripts. But what if
# perfect-perfect.sh itself has bugs in its audit prompt? What if it
# misses entire categories of shell scripting issues? What if its
# scope boundaries are wrong?
#
# This script audits perfect-perfect.sh. The recursion is intentional.
#
# Usage: bash .ralph/perfect-perfect-perfect.sh

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

read -r -d '' PROMPT <<'PROMPT_EOF' || true
You are auditing perfect-perfect.sh — the script that audits the audit scripts.

This is a meta-audit. Your target is a single file: .ralph/perfect-perfect.sh

## Context

The OpenTabs project has a hierarchy of audit scripts:
- perfect-*.sh scripts audit different parts of the codebase
- perfect.sh runs all perfect-*.sh scripts in parallel
- perfect-perfect.sh audits those audit scripts
- YOU are auditing perfect-perfect.sh

## Step 1: Read the full chain

1. Read .ralph/perfect-perfect.sh — your primary audit target
2. Read .ralph/perfect.sh — to understand what perfect-perfect.sh is supposed to audit
3. Read .ralph/run-prompt.sh — to understand how prompts are executed
4. Read .ralph/perfect-prompt.md — the shared guidelines
5. Skim 2-3 of the perfect-*.sh scripts to understand the pattern

## Step 2: Audit perfect-perfect.sh

Evaluate whether perfect-perfect.sh does its job well:

- **Completeness**: Does it actually instruct Claude to read ALL the files it claims to audit? Or does it list files but the prompt is vague enough that Claude might skip some?
- **Prompt specificity**: Are the audit criteria specific enough? "Look for shell bugs" is vague. "Check for unquoted $VARIABLE in arithmetic contexts" is specific. Which side does the prompt fall on?
- **Meta-awareness**: Does perfect-perfect.sh account for the fact that it runs through the same run-prompt.sh and perfect-prompt.md infrastructure it's auditing? If run-prompt.sh has a bug, perfect-perfect.sh's own execution is compromised. Does it acknowledge this bootstrap problem?
- **Scope creep risk**: Could the prompt cause Claude to wander into auditing the codebase itself instead of staying focused on the audit scripts?
- **Shell correctness**: Does perfect-perfect.sh itself have the same categories of bugs it asks Claude to find in others? That would be ironic.

## Step 3: Create PRD(s) using the ralph skill

Use the skill tool to load the "ralph" skill, then follow its instructions to create PRD(s).

Key parameters:
- Target project: "OpenTabs Platform" (root monorepo)
- Stories should target .ralph/perfect-perfect.sh only
- All stories: e2eCheckpoint: false
PROMPT_EOF

echo "=== perfect-perfect-perfect.sh ==="
echo "Launching Claude to audit the auditor's auditor..."
echo "Quis custodiet ipsos custodes? And who custodiet THEM?"
echo ""

echo "$PROMPT" | bash "$SCRIPT_DIR/run-prompt.sh"
