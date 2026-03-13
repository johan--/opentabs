# Meticulous

OpenTabs plugin for Meticulous — gives AI agents access to Meticulous through your authenticated browser session.

## Install

```bash
opentabs plugin install meticulous
```

Or install globally via npm:

```bash
npm install -g @opentabs-dev/opentabs-plugin-meticulous
```

## Setup

1. Open [app.meticulous.ai](https://app.meticulous.ai) in Chrome and log in
2. Open the OpenTabs side panel — the Meticulous plugin should appear as **ready**

## Tools (26)

### User (1)

| Tool | Description | Type |
|---|---|---|
| `get_current_user` | Get the current user profile | Read |

### Organizations (2)

| Tool | Description | Type |
|---|---|---|
| `list_organizations` | List organizations | Read |
| `list_organization_members` | List org members | Read |

### Projects (3)

| Tool | Description | Type |
|---|---|---|
| `list_projects` | List projects | Read |
| `get_project` | Get project details | Read |
| `get_project_pull_request` | Get PR test status | Read |

### Integrations (1)

| Tool | Description | Type |
|---|---|---|
| `list_github_repositories` | List connected GitHub repos | Read |

### Test Runs (11)

| Tool | Description | Type |
|---|---|---|
| `get_test_run` | Get test run details | Read |
| `get_test_run_screenshots` | Get test run screenshot diffs | Read |
| `get_test_run_diffs` | Get replay diffs for a test run | Read |
| `get_test_run_test_cases` | Get test case results | Read |
| `get_test_run_coverage` | Get test run coverage | Read |
| `get_test_run_source_code` | Get source code for a test run commit | Read |
| `get_test_run_pr_description` | Get PR description for a test run | Read |
| `accept_all_diffs` | Approve all diffs in a test run | Write |
| `check_for_flakes` | Check for flaky tests | Read |
| `create_label_action` | Label a screenshot diff | Write |
| `upsert_diff_approval` | Bulk approve/reject diffs | Write |

### Replays (4)

| Tool | Description | Type |
|---|---|---|
| `get_replay` | Get replay details | Read |
| `list_replays` | List replays for a project | Read |
| `get_replay_screenshots` | Get screenshots for a replay | Read |
| `compare_replays` | Compare replays in a test run | Write |

### Sessions (4)

| Tool | Description | Type |
|---|---|---|
| `list_sessions` | List sessions for a project | Read |
| `get_session` | Get session details | Read |
| `search_sessions` | Search sessions | Read |
| `get_session_events` | Get user events in a session | Read |

## How It Works

This plugin runs inside your Meticulous tab through the [OpenTabs](https://opentabs.dev) Chrome extension. It uses your existing browser session — no API tokens or OAuth apps required. All operations happen as you, with your permissions.

## License

MIT
