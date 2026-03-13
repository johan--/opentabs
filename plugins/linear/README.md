# Linear

OpenTabs plugin for Linear — gives AI agents access to Linear through your authenticated browser session.

## Install

```bash
opentabs plugin install linear
```

Or install globally via npm:

```bash
npm install -g @opentabs-dev/opentabs-plugin-linear
```

## Setup

1. Open [linear.app](https://linear.app) in Chrome and log in
2. Open the OpenTabs side panel — the Linear plugin should appear as **ready**

## Tools (21)

### Issues (7)

| Tool | Description | Type |
|---|---|---|
| `search_issues` | Search and filter issues | Read |
| `get_issue` | Get details of a single issue | Read |
| `create_issue` | Create a new issue in Linear | Write |
| `update_issue` | Update an existing issue | Write |
| `delete_issue` | Move an issue to the trash | Write |
| `archive_issue` | Archive an issue | Write |
| `list_issue_relations` | List issue dependencies and relations | Read |

### Comments (3)

| Tool | Description | Type |
|---|---|---|
| `create_comment` | Add a comment to an issue | Write |
| `update_comment` | Update a comment | Write |
| `list_comments` | List comments on an issue | Read |

### Projects (4)

| Tool | Description | Type |
|---|---|---|
| `list_projects` | List all projects | Read |
| `get_project` | Get details of a project | Read |
| `create_project` | Create a new project | Write |
| `update_project` | Update a project | Write |

### Teams & Users (3)

| Tool | Description | Type |
|---|---|---|
| `list_teams` | List teams in the workspace | Read |
| `get_viewer` | Get the current user's profile | Read |
| `list_users` | List all users in the organization | Read |

### Workflow (3)

| Tool | Description | Type |
|---|---|---|
| `list_workflow_states` | List workflow states for a team | Read |
| `list_labels` | List all issue labels | Read |
| `list_cycles` | List cycles for a team | Read |

### Labels (1)

| Tool | Description | Type |
|---|---|---|
| `create_label` | Create a new label | Write |

## How It Works

This plugin runs inside your Linear tab through the [OpenTabs](https://opentabs.dev) Chrome extension. It uses your existing browser session — no API tokens or OAuth apps required. All operations happen as you, with your permissions.

## License

MIT
