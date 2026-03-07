# AI Documentation Skill

Audit and improve the AI-facing documentation that the OpenTabs MCP server serves to connected AI clients.

---

## Core Philosophy

OpenTabs is a platform for AI clients. Every user — whether a normal user, plugin developer, or platform contributor — interacts through an AI agent connected to the MCP server. The MCP server is the primary documentation layer for AI; the docs/ site is the secondary layer for humans.

The MCP protocol provides three mechanisms for server-to-AI communication, each with a distinct purpose:

| Mechanism | Delivery | Purpose | When AI sees it |
|---|---|---|---|
| **Instructions** | Push (initialize handshake) | Injected into system prompt. Concise rules, security guidance, capability overview. Always present. | Every conversation, automatically |
| **Resources** | Pull (resources/read) | AI-readable reference docs fetched on demand. Detailed guides, API references, live state. | When the AI decides it needs context |
| **Prompts** | Pull (prompts/get) | Task-oriented workflows the user invokes. Step-by-step procedures with specific tool calls. | When user triggers a workflow |

**The key insight:** Instructions are expensive (always in context), resources are cheap (fetched when needed), prompts are user-initiated (explicit workflows). Content placement matters — putting a 500-line SDK reference in instructions wastes tokens on every conversation. Putting a security rule in a resource means the AI might not read it before acting.

### What Goes Where

**Instructions** (always in context — keep under 120 lines / 6000 chars):
- What OpenTabs is (1-2 sentences)
- Tool categories and naming conventions
- Security rules (critical — must be in every conversation)
- Permission model overview
- Plugin review flow summary
- Error pattern quick-reference
- List of available resources and prompts (URIs + 1-line descriptions)

**Resources** (fetched on demand — can be long and detailed):
- Installation and setup guides
- Plugin development guides (SDK, patterns, conventions)
- Troubleshooting guides (error → cause → resolution)
- API references (SDK utilities, CLI commands, browser tools)
- Live server status (dynamic: plugins, tabs, extensions, permissions)

**Prompts** (user-triggered workflows):
- `build_plugin` — full plugin creation workflow
- `troubleshoot` — guided debugging with specific tool calls
- `setup_plugin` — install, configure, review an existing plugin

---

## The Job

When this skill is invoked, follow this workflow:

### Phase 1: Audit What Exists

Read the current AI-facing documentation layer:

1. **Instructions** — read `platform/mcp-server/src/mcp-setup.ts` and find the `SERVER_INSTRUCTIONS` constant. Assess: Is it concise? Does it cover security? Does it mention available resources and prompts? Is it under the 120-line budget?

2. **Resources** — read `platform/mcp-server/src/mcp-resources.ts` (if it exists). List every resource URI, its name, and whether the content is populated or placeholder. Check: are resources declared in `createMcpServer` capabilities?

3. **Prompts** — read `platform/mcp-server/src/mcp-prompts.ts`. List every prompt, its arguments, and the length of its resolved content. Assess quality: are prompts actionable with specific tool calls?

4. **Tool descriptions** — sample 5-10 browser tools from `platform/mcp-server/src/browser-tools/` and check their `description` fields. Are they informative enough for an AI to use correctly?

5. **Capabilities** — in `mcp-setup.ts`, check the `capabilities` object in `createMcpServer`. What's declared? What's missing?

### Phase 2: Verify Accuracy Against Source Code

Every fact in the AI-facing docs must match the actual codebase. Cross-reference:

| AI doc claim | Verify against |
|---|---|
| CLI command formats | `platform/cli/src/commands/*.ts` |
| Config key formats | `platform/cli/src/commands/config.ts` (SUPPORTED_KEYS constant) |
| SDK utility functions | `platform/plugin-sdk/src/sdk.ts` (all exports) |
| ToolError factories | `platform/plugin-sdk/src/errors.ts` |
| Lifecycle hooks | `platform/plugin-sdk/src/plugin.ts` |
| WebSocket protocol messages | `platform/mcp-server/src/extension-protocol.ts` (handleExtensionMessage) |
| Health endpoint fields | `platform/mcp-server/src/http-routes.ts` (handleHealth) |
| Permission model | `platform/mcp-server/src/state.ts` (getToolPermission) |
| Browser tool count | `platform/mcp-server/src/browser-tools/index.ts` (browserTools array) |
| ToolDefinition interface | `platform/plugin-sdk/src/index.ts` |
| PluginPermissionConfig | `platform/shared/src/index.ts` |
| Confirmation response | `platform/shared/src/index.ts` (ConfirmationResponse interface) |

**Common drift patterns** (things that get refactored but docs don't update):
- Permission model changes (enabled/disabled → off/ask/auto)
- Config key format changes (tool.X → tool-permission.X)
- Health endpoint field renames (confirmationBypassed → skipPermissions)
- WebSocket method renames (setToolEnabled → setToolPermission)
- New SDK utility functions not documented
- New ToolDefinition fields (summary, group) not documented

### Phase 3: Identify Gaps

For each of the three actor types, ask: if an AI client connected right now and the user asked it to do X, would the AI have enough information?

**Normal user scenarios:**
- "Install OpenTabs and set it up" — does quick-start resource exist and cover this?
- "What plugins are available?" — does the AI know about `opentabs plugin search`?
- "This tool isn't working" — does troubleshooting resource cover common errors?
- "How do I approve a tool call?" — does the AI understand the ask/auto/off model?

**Plugin developer scenarios:**
- "Build a plugin for Jira" — does the build_plugin prompt + plugin-development resource cover the full workflow?
- "What SDK utilities are available?" — does the SDK reference resource list all functions?
- "How do I handle auth?" — does the plugin-development resource cover auth patterns?
- "How do I publish my plugin?" — is publishing documented in a resource?

**Platform contributor scenarios:**
- "How is the codebase structured?" — is there a resource covering architecture?
- "How do I run the dev server?" — does any resource cover dev setup?
- "What's the dispatch pipeline?" — is server internals documented?

### Phase 4: Write or Update Content

Based on the gaps found, create or update the relevant files. Follow these guidelines:

#### Writing for AI Consumption (not humans)

AI-optimized documentation differs from human documentation:

| Human docs | AI docs |
|---|---|
| Friendly, hand-holding tone | Direct, information-dense |
| Progressive disclosure | All facts upfront |
| Narrative explanations | Structured tables and lists |
| Screenshots and illustrations | Code blocks and exact commands |
| "Click the button" | Exact CLI commands with flags |
| Conceptual overview first | Working example first, then explain |

**Structure rules:**
- Lead with a working code example or command, then explain
- Use tables for reference data (function → signature → description)
- Use fenced code blocks with language tags for all code
- Include exact expected output where helpful
- Use headers aggressively — AI parses structure better than paragraphs
- No filler words, no encouragement, no "let's get started"

#### Resource Content Size Guidelines

| Resource type | Target lines | Rationale |
|---|---|---|
| Guide (quick-start) | 150-250 | Enough for complete setup walkthrough |
| Guide (plugin-dev) | 300-400 | Dense reference covering full SDK |
| Guide (troubleshooting) | 100-150 | Error → cause → fix tables |
| Reference (SDK API) | 150-250 | All functions with signatures |
| Reference (CLI) | 100-200 | All commands with usage |
| Reference (browser tools) | 150-200 | All 40 tools by category |
| Status (dynamic) | N/A | JSON from ServerState |

#### Instructions Budget

The `SERVER_INSTRUCTIONS` string is injected into every conversation. Keep it under 120 lines / 6000 characters. Content that exceeds this budget belongs in a resource.

Current section allocation:
- Tool categories: ~10 lines
- Security rules: ~30 lines (non-negotiable — must stay in instructions)
- Plugin review flow: ~10 lines
- Multi-tab targeting: ~5 lines
- Permission states: ~5 lines
- Error handling: ~10 lines
- Available resources list: ~15 lines
- Available prompts list: ~5 lines

### Phase 5: Verify

After making changes:

```bash
npm run build           # Must pass — server must compile
npm run type-check      # TypeScript check
npm run lint            # Biome lint
npm run knip            # Unused code detection
npm run test            # Unit tests
npm run test:e2e        # E2E tests (if server behavior changed)
```

Then verify the AI-facing output manually:

1. Start the MCP server: `npm run dev:mcp`
2. Connect an MCP client (Claude Code, OpenCode, etc.)
3. Ask the AI: "What resources are available?" — it should list them from the instructions
4. Ask it to fetch a resource: "Read the quick-start guide" — it should call resources/read
5. Ask it to use a prompt: "Help me troubleshoot" — it should invoke the troubleshoot prompt

---

## Key Source Files

| File | Contains |
|---|---|
| `platform/mcp-server/src/mcp-setup.ts` | Server creation, capabilities, instructions, handler registration |
| `platform/mcp-server/src/mcp-resources.ts` | Resource definitions and content |
| `platform/mcp-server/src/mcp-prompts.ts` | Prompt definitions and resolver functions |
| `platform/mcp-server/src/state.ts` | ServerState interface (for dynamic status resource) |
| `platform/mcp-server/src/mcp-tool-dispatch.ts` | Tool dispatch (for understanding error messages) |
| `platform/mcp-server/src/browser-tools/index.ts` | Browser tool registry |
| `platform/mcp-server/src/browser-tools/definition.ts` | BrowserToolDefinition interface |
| `platform/mcp-server/src/http-routes.ts` | Health endpoint (reference for status resource) |

## MCP SDK Reference

The server uses `@modelcontextprotocol/sdk` (check `platform/mcp-server/package.json` for version). Key imports:

```typescript
// Schemas for request handlers (from @modelcontextprotocol/sdk/types.js)
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
  ListResourcesRequestSchema,      // For resources/list
  ReadResourceRequestSchema,        // For resources/read
  ListResourceTemplatesRequestSchema, // For parameterized resources (optional)
} from '@modelcontextprotocol/sdk/types.js';

// Server class (from @modelcontextprotocol/sdk/server/index.js)
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
```

### Handler Registration Pattern

```typescript
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return { resources: getAllResources(state) };
});

server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const { uri } = request.params;
  const resource = resolveResource(state, uri);
  if (!resource) throw new Error(`Resource not found: ${uri}`);
  return { contents: [resource] };
});
```

### Capabilities Declaration

```typescript
const server = new Server(
  { name: 'opentabs', version },
  {
    capabilities: {
      tools: { listChanged: true },
      logging: {},
      prompts: { listChanged: true },
      resources: {},                    // Static resources (no subscribe/listChanged needed)
    },
    instructions: SERVER_INSTRUCTIONS,
  },
);
```

### Resource Response Format

```typescript
// resources/list response
{ resources: [{ uri: string, name: string, description?: string, mimeType?: string }] }

// resources/read response
{ contents: [{ uri: string, mimeType?: string, text: string }] }
```

### Prompt Response Format

```typescript
// prompts/list response
{ prompts: [{ name: string, description?: string, arguments?: [{ name, description, required? }] }] }

// prompts/get response
{ description?: string, messages: [{ role: 'user' | 'assistant', content: { type: 'text', text: string } }] }
```

---

## Common Issues to Check

1. **Stale permission terminology** — The codebase uses `off/ask/auto`. Older docs may reference `enabled/disabled` or `allow_once/allow_always/deny`. Search for these stale terms.

2. **Config key format drift** — The actual CLI format is `tool-permission.<plugin>.<tool>` and `plugin-permission.<plugin>`. Older docs may show `tool.<plugin>_<tool>` or `browser-tool.<name>`.

3. **Health endpoint field renames** — The field is `skipPermissions`, not `confirmationBypassed`. The `discoveryErrors` array is present in code but sometimes missing from doc examples.

4. **Missing ToolDefinition fields** — `summary`, `group`, `icon` are optional fields that docs sometimes omit from the interface definition.

5. **WebSocket method renames** — Actual methods are `config.setToolPermission`, `config.setPluginPermission`, `config.setSkipPermissions`. Stale docs may show `config.setToolEnabled`, `config.setAllToolsEnabled`, etc.

6. **SDK utility function additions** — New utilities get added to the SDK but not documented. Always read `platform/plugin-sdk/src/sdk.ts` for the full list.

7. **Browser tool count** — Currently 40. If tools are added or removed, all references to "40 browser tools" need updating.

8. **`reviewedVersion` field** — Part of `PluginPermissionConfig` in `platform/shared/src/index.ts`. Often missing from config reference docs.

9. **Confirmation response structure** — `{ id, decision: 'allow' | 'deny', alwaysAllow?: boolean }`. Stale docs may show `allow_once/allow_always/deny`.

10. **Resource content accuracy** — If resource content references CLI commands, SDK functions, or server behavior, verify each claim against the source code. Resource content is just as prone to drift as the docs/ site.
