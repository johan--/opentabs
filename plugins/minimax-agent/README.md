# MiniMax Agent

OpenTabs plugin for MiniMax Agent — AI assistant platform for chat, experts, and agent automation — gives AI agents access to MiniMax Agent through your authenticated browser session.

## Install

```bash
opentabs plugin install minimax-agent
```

Or install globally via npm:

```bash
npm install -g @opentabs-dev/opentabs-plugin-minimax-agent
```

## Setup

1. Open [agent.minimax.io](https://agent.minimax.io) in Chrome and log in
2. Open the OpenTabs side panel — the MiniMax Agent plugin should appear as **ready**

## Tools (31)

### Account (3)

| Tool | Description | Type |
|---|---|---|
| `get_current_user` | Get the authenticated user profile | Read |
| `get_membership_info` | Get membership plan and credit details | Read |
| `get_credit_details` | List credit transaction history | Read |

### Chats (7)

| Tool | Description | Type |
|---|---|---|
| `list_chats` | List chat conversations | Read |
| `get_chat_detail` | Get chat details and messages | Read |
| `new_session` | Create a new chat session | Write |
| `send_message` | Send a message to a chat | Write |
| `rename_chat` | Rename a chat | Write |
| `delete_chat` | Delete a chat | Write |
| `search_chats` | Search chats by keyword | Read |

### Experts (7)

| Tool | Description | Type |
|---|---|---|
| `list_experts` | List your AI experts | Read |
| `get_expert` | Get expert details | Read |
| `delete_expert` | Delete an expert | Write |
| `pin_expert` | Pin or unpin an expert | Write |
| `vote_expert` | Vote on an expert | Write |
| `list_expert_tags` | List expert tags | Read |
| `list_homepage_experts` | List homepage experts | Read |

### Gallery (3)

| Tool | Description | Type |
|---|---|---|
| `list_gallery_categories` | List gallery categories | Read |
| `list_gallery_feed` | Browse gallery feed | Read |
| `get_gallery_detail` | Get gallery item details | Read |

### Schedules (6)

| Tool | Description | Type |
|---|---|---|
| `list_cron_jobs` | List scheduled jobs | Read |
| `get_cron_job` | Get scheduled job details | Read |
| `create_cron_job` | Create a scheduled job | Write |
| `update_cron_job` | Update a scheduled job | Write |
| `execute_cron_job` | Run a scheduled job now | Write |
| `list_cron_executions` | List cron job executions | Read |

### MCP Servers (3)

| Tool | Description | Type |
|---|---|---|
| `list_mcp_servers` | List added MCP servers | Read |
| `add_mcp_server` | Add an MCP server | Write |
| `remove_mcp_server` | Remove an MCP server | Write |

### Workspace (2)

| Tool | Description | Type |
|---|---|---|
| `get_workspace` | Get workspace details | Read |
| `list_workspace_members` | List workspace members | Read |

## How It Works

This plugin runs inside your MiniMax Agent tab through the [OpenTabs](https://opentabs.dev) Chrome extension. It uses your existing browser session — no API tokens or OAuth apps required. All operations happen as you, with your permissions.

## License

MIT
