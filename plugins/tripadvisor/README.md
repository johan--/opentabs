# Tripadvisor

OpenTabs plugin for Tripadvisor — gives AI agents access to Tripadvisor through your authenticated browser session.

## Install

```bash
opentabs plugin install tripadvisor
```

Or install globally via npm:

```bash
npm install -g @opentabs-dev/opentabs-plugin-tripadvisor
```

## Setup

1. Open [tripadvisor.com](https://www.tripadvisor.com) in Chrome and log in
2. Open the OpenTabs side panel — the Tripadvisor plugin should appear as **ready**

## Tools (12)

### Account (1)

| Tool | Description | Type |
|---|---|---|
| `get_current_user` | Get your TripAdvisor profile | Read |

### Navigation (1)

| Tool | Description | Type |
|---|---|---|
| `get_breadcrumbs` | Get location hierarchy | Read |

### Search (1)

| Tool | Description | Type |
|---|---|---|
| `get_neighborhood` | Get neighborhood info | Read |

### Restaurants (3)

| Tool | Description | Type |
|---|---|---|
| `list_restaurants` | List restaurants in an area | Read |
| `get_restaurant` | Get restaurant details | Read |
| `get_restaurant_awards` | Get MICHELIN and other awards | Read |

### Hotels (2)

| Tool | Description | Type |
|---|---|---|
| `list_hotels` | List hotels in an area | Read |
| `get_hotel` | Get hotel details | Read |

### Attractions (2)

| Tool | Description | Type |
|---|---|---|
| `list_attractions` | List things to do in an area | Read |
| `get_attraction` | Get attraction details | Read |

### Reviews (1)

| Tool | Description | Type |
|---|---|---|
| `get_reviews` | Get location reviews | Read |

### Saves (1)

| Tool | Description | Type |
|---|---|---|
| `check_saved` | Check if a place is saved | Read |

## How It Works

This plugin runs inside your Tripadvisor tab through the [OpenTabs](https://opentabs.dev) Chrome extension. It uses your existing browser session — no API tokens or OAuth apps required. All operations happen as you, with your permissions.

## License

MIT
