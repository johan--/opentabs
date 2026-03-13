# MongoDB Atlas

OpenTabs plugin for MongoDB Atlas — gives AI agents access to MongoDB Atlas through your authenticated browser session.

## Install

```bash
opentabs plugin install mongodb-atlas
```

Or install globally via npm:

```bash
npm install -g @opentabs-dev/opentabs-plugin-mongodb-atlas
```

## Setup

1. Open [cloud.mongodb.com](https://cloud.mongodb.com) in Chrome and log in
2. Open the OpenTabs side panel — the MongoDB Atlas plugin should appear as **ready**

## Tools (20)

### Account (1)

| Tool | Description | Type |
|---|---|---|
| `get_current_user` | Get authenticated user profile | Read |

### Organizations (4)

| Tool | Description | Type |
|---|---|---|
| `get_organization` | Get current organization details | Read |
| `list_organization_members` | List organization members | Read |
| `list_organization_projects` | List projects in the organization | Read |
| `list_organization_teams` | List teams in the organization | Read |

### Projects (1)

| Tool | Description | Type |
|---|---|---|
| `get_project` | Get current project details | Read |

### Clusters (2)

| Tool | Description | Type |
|---|---|---|
| `list_clusters` | List clusters in the project | Read |
| `get_cluster` | Get cluster details by name | Read |

### Database Access (3)

| Tool | Description | Type |
|---|---|---|
| `list_database_users` | List database users in the project | Read |
| `create_database_user` | Create a database user | Write |
| `delete_database_user` | Delete a database user | Write |

### Network Access (4)

| Tool | Description | Type |
|---|---|---|
| `list_ip_access_list` | List IP access list entries | Read |
| `add_ip_access_entry` | Add an IP to the access list | Write |
| `delete_ip_access_entry` | Remove an IP from the access list | Write |
| `list_network_peering` | List network peering connections | Read |

### Alerts (2)

| Tool | Description | Type |
|---|---|---|
| `list_alerts` | List project alerts | Read |
| `list_alert_configs` | List alert configurations | Read |

### Deployment (1)

| Tool | Description | Type |
|---|---|---|
| `get_deployment_status` | Get deployment status | Read |

### Billing (1)

| Tool | Description | Type |
|---|---|---|
| `get_billing_plan` | Get organization billing plan | Read |

### Security (1)

| Tool | Description | Type |
|---|---|---|
| `get_user_security` | Get project security settings | Read |

## How It Works

This plugin runs inside your MongoDB Atlas tab through the [OpenTabs](https://opentabs.dev) Chrome extension. It uses your existing browser session — no API tokens or OAuth apps required. All operations happen as you, with your permissions.

## License

MIT
