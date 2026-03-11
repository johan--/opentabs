#!/bin/bash
# perfect-perfect-perfect-perfect-perfect.sh — Audit perfect-perfect-perfect-perfect.sh.
#
# perfect-perfect-perfect-perfect.sh audits perfect-perfect-perfect.sh.
# But what if its audit criteria are too vague? What if it missed something?
# What if its prompt drifts into philosophy instead of staying focused?
#
# This script audits perfect-perfect-perfect-perfect.sh. The recursion continues.
#
# Usage: bash .ralph/perfect-perfect-perfect-perfect-perfect.sh

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

read -r -d '' PROMPT <<'PROMPT_EOF' || true
You are auditing perfect-perfect-perfect-perfect.sh — the script that audits perfect-perfect-perfect.sh.

Your target is a single file: .ralph/perfect-perfect-perfect-perfect.sh

## Context

The OpenTabs project has a hierarchy of audit scripts:
- perfect-*.sh scripts audit different parts of the codebase
- perfect.sh runs all perfect-*.sh scripts in parallel
- perfect-perfect.sh audits those audit scripts
- perfect-perfect-perfect.sh audits perfect-perfect.sh
- perfect-perfect-perfect-perfect.sh audits perfect-perfect-perfect.sh
- YOU are auditing perfect-perfect-perfect-perfect.sh

## Step 1: Read the chain

1. Read .ralph/perfect-perfect-perfect-perfect.sh — your primary audit target
2. Read .ralph/perfect-perfect-perfect.sh — the script your target audits (for context)
3. Read .ralph/run-prompt.sh — to understand how prompts are executed
4. Read .ralph/perfect-prompt.md — the shared guidelines

## Step 2: Audit perfect-perfect-perfect-perfect.sh

Evaluate whether perfect-perfect-perfect-perfect.sh does its job well:

- **Completeness**: Does it instruct Claude to read all files needed to evaluate perfect-perfect-perfect.sh? Or does it assume context that might not be available?
- **Prompt specificity**: Are the audit criteria concrete and actionable? Or are they vague enough that Claude could satisfy them without finding real issues?
- **Meta-awareness**: Does it acknowledge the bootstrap problem — that it runs through the same run-prompt.sh infrastructure as the scripts it's auditing?
- **Scope discipline**: Does it stay focused on auditing perfect-perfect-perfect.sh, or does it wander into auditing the entire chain?
- **Shell correctness**: Does it have bugs in the same categories it asks Claude to look for?

## Step 3: Create PRD(s) using the ralph skill

Use the skill tool to load the "ralph" skill, then follow its instructions to create PRD(s).

Key parameters:
- Target project: "OpenTabs Platform" (root monorepo)
- Stories should target .ralph/perfect-perfect-perfect-perfect.sh only
- All stories: e2eCheckpoint: false
PROMPT_EOF

echo "=== perfect-perfect-perfect-perfect-perfect.sh ==="
echo "Launching Claude to audit perfect-perfect-perfect-perfect.sh..."
echo ""

echo "$PROMPT" | bash "$SCRIPT_DIR/run-prompt.sh"
