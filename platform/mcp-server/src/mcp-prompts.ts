/**
 * MCP prompt definitions for the OpenTabs server.
 *
 * Prompts are pre-built templates that help AI agents accomplish specific tasks.
 * Unlike instructions (sent on every session), prompts are pull-based — clients
 * fetch them on demand via `prompts/get` when the user invokes them.
 *
 * Current prompts:
 *   - `build_plugin`: Full workflow for building a new OpenTabs plugin
 */

/** A single prompt argument definition */
interface PromptArgument {
  name: string;
  description: string;
  required?: boolean;
}

/** A prompt definition for MCP prompts/list */
export interface PromptDefinition {
  name: string;
  description: string;
  arguments: PromptArgument[];
}

/** A resolved prompt message for MCP prompts/get */
export interface PromptMessage {
  role: 'user' | 'assistant';
  content: { type: 'text'; text: string };
}

/** Result of resolving a prompt */
export interface PromptResult {
  description: string;
  messages: PromptMessage[];
}

/** All registered prompts */
export const PROMPTS: PromptDefinition[] = [
  {
    name: 'build_plugin',
    description:
      'Step-by-step workflow for building a new OpenTabs plugin for a web application. ' +
      'Covers site analysis, auth discovery, API mapping, scaffolding, implementation, and testing. ' +
      'Use this when you want to create a plugin that gives AI agents access to a web app.',
    arguments: [
      {
        name: 'url',
        description: 'URL of the target web application (e.g., "https://app.example.com")',
        required: true,
      },
      {
        name: 'name',
        description: 'Plugin name in kebab-case (e.g., "my-app"). Derived from the URL if omitted.',
        required: false,
      },
    ],
  },
];

/** Prompt name → definition for O(1) lookup */
const PROMPT_MAP = new Map(PROMPTS.map(p => [p.name, p]));

/**
 * Resolve a prompt by name with the given arguments.
 * Returns null if the prompt name is not recognized.
 */
export const resolvePrompt = (name: string, args: Record<string, string>): PromptResult | null => {
  const def = PROMPT_MAP.get(name);
  if (!def) return null;

  if (name === 'build_plugin') {
    return resolveBuildPlugin(args);
  }

  return null;
};

// ---------------------------------------------------------------------------
// build_plugin prompt
// ---------------------------------------------------------------------------

const resolveBuildPlugin = (args: Record<string, string>): PromptResult => {
  const url = args.url ?? 'https://example.com';
  const name = args.name ?? '';

  return {
    description: `Build an OpenTabs plugin for ${url}`,
    messages: [
      {
        role: 'user',
        content: {
          type: 'text',
          text: buildPluginPromptText(url, name),
        },
      },
    ],
  };
};

const buildPluginPromptText = (url: string, name: string): string => {
  const nameClause = name ? `The plugin name should be \`${name}\`.` : '';

  return `Build a production-ready OpenTabs plugin for ${url}. ${nameClause}

Follow the complete workflow below. Each phase builds on the previous one — do not skip phases.

---

## Prerequisites

- The user has the target web app open in a browser tab at ${url}
- The MCP server is running (you are connected to it)
- You have access to the filesystem for creating plugin source files

### Browser Tool Permissions

Plugin development requires heavy use of browser tools (\`browser_execute_script\`, \`browser_navigate_tab\`, \`browser_get_tab_content\`, etc.). By default, tools have permission \`'off'\` (disabled) or \`'ask'\` (requires human approval).

Ask the user if they want to enable \`skipPermissions\` to bypass approval prompts during development. Set the env var: \`OPENTABS_DANGEROUSLY_SKIP_PERMISSIONS=1\`. Warn them this bypasses human approval and should only be used during active plugin development.

---

## Phase 1: Research the Codebase

Before writing any code, study the existing plugin infrastructure using the filesystem:

1. **Study the Plugin SDK** — read \`platform/plugin-sdk/CLAUDE.md\` and key source files (\`src/index.ts\`, \`src/plugin.ts\`, \`src/tool.ts\`). Understand:
   - \`OpenTabsPlugin\` abstract base class (name, displayName, description, urlPatterns, tools, isReady)
   - \`defineTool({ name, displayName, description, icon, input, output, handle })\` factory
   - \`ToolError\` static factories: \`.auth()\`, \`.notFound()\`, \`.rateLimited()\`, \`.timeout()\`, \`.validation()\`, \`.internal()\`
   - SDK utilities: \`fetchJSON\`, \`postJSON\`, \`getLocalStorage\`, \`waitForSelector\`, \`retry\`, \`sleep\`, \`log\`
   - All plugin code runs in the **browser page context** (not server-side)

2. **Study an existing plugin** (e.g., \`plugins/slack/\`) as the canonical reference:
   - \`src/index.ts\` — plugin class, imports all tools
   - \`src/slack-api.ts\` — API wrapper with auth extraction + error classification
   - \`src/tools/\` — one file per tool, shared schemas
   - \`package.json\` — the opentabs field, dependency versions, scripts

3. **Study \`plugins/CLAUDE.md\`** — plugin isolation rules and conventions

---

## Phase 2: Explore the Target Web App

This is the most critical phase. Use browser tools to understand how the web app works.

### Step 1: Find the Tab

\`\`\`
plugin_list_tabs  or  browser_list_tabs  →  find the tab for ${url}
\`\`\`

### Step 2: Analyze the Site

\`\`\`
plugin_analyze_site(url: "${url}")
\`\`\`

This gives you a comprehensive report: auth methods, API endpoints, framework detection, storage keys, and concrete tool suggestions.

### Step 3: Enable Network Capture and Explore

\`\`\`
browser_enable_network_capture(tabId, urlFilter: "/api")
\`\`\`

Navigate around in the app to trigger API calls, then read them:

\`\`\`
browser_get_network_requests(tabId)
\`\`\`

Study the captured traffic to understand:
- API base URL
- Whether the API is same-origin or cross-origin (critical for CORS)
- Request format (JSON body vs form-encoded)
- Required headers (content-type, custom headers)
- Response shapes for each endpoint
- Error response format

### Step 4: Check CORS Policy (for Cross-Origin APIs)

If the API is on a different subdomain, verify CORS behavior:

\`\`\`bash
curl -sI -X OPTIONS https://api.example.com/endpoint \\
  -H "Origin: ${url}" \\
  -H "Access-Control-Request-Method: GET" \\
  -H "Access-Control-Request-Headers: Authorization,Content-Type" \\
  | grep -i "access-control"
\`\`\`

### Step 5: Discover Auth Token

**First, always check cookies with \`browser_get_cookies\`** to understand the auth model. Then probe the page:

- **localStorage**: Direct access or iframe fallback if the app deletes \`window.localStorage\`
- **Page globals**: \`window.__APP_STATE__\`, \`window.boot_data\`, \`window.__NEXT_DATA__\`
- **Webpack module stores**: For React/webpack SPAs
- **Cookies**: \`document.cookie\` for non-HttpOnly tokens
- **Script tags**: Inline \`<script>\` tags with embedded config

### Step 6: Test the API

Once you have the token, make a test API call with \`browser_execute_script\`:

\`\`\`javascript
const resp = await fetch('https://example.com/api/v2/me', {
  headers: { Authorization: 'Bearer ' + token },
  credentials: 'include',
});
const data = await resp.json();
return data;
\`\`\`

### Step 7: Map the API Surface

Discover the key endpoints: user/profile, list resources, get single resource, create/update/delete, search, messaging, reactions.

---

## Phase 3: Scaffold the Plugin

\`\`\`bash
cd plugins/
opentabs plugin create <name> --domain <domain> --display <DisplayName> --description "OpenTabs plugin for <DisplayName>"
\`\`\`

After scaffolding, compare \`package.json\` with an existing plugin (e.g., \`plugins/slack/package.json\`) and align:
- Package name: \`@opentabs-dev/opentabs-plugin-<name>\` for official plugins
- Version: Match the current platform version
- Add: \`publishConfig\`, \`check\` script
- Dependency versions: Match \`@opentabs-dev/plugin-sdk\` and \`@opentabs-dev/plugin-tools\` versions

---

## Phase 4: Implement

### File Structure

\`\`\`
src/
  index.ts              # Plugin class — imports all tools, implements isReady()
  <name>-api.ts         # API wrapper — auth extraction + error classification
  tools/
    schemas.ts          # Shared Zod schemas + defensive mappers
    send-message.ts     # One file per tool
    ...
\`\`\`

### API Wrapper Pattern (\`<name>-api.ts\`)

The API wrapper handles auth extraction, request construction, and error classification:

\`\`\`typescript
import { ToolError } from '@opentabs-dev/plugin-sdk';

interface AppAuth {
  token: string;
}

const getAuth = (): AppAuth | null => {
  // Check globalThis persistence first (survives adapter re-injection)
  // Then try localStorage, page globals, cookies
  // Return null if not authenticated
};

export const isAuthenticated = (): boolean => getAuth() !== null;

export const waitForAuth = (): Promise<boolean> =>
  new Promise((resolve) => {
    let elapsed = 0;
    const interval = 500;
    const maxWait = 5000;
    const timer = setInterval(() => {
      elapsed += interval;
      if (isAuthenticated()) { clearInterval(timer); resolve(true); return; }
      if (elapsed >= maxWait) { clearInterval(timer); resolve(false); }
    }, interval);
  });

export const api = async <T extends Record<string, unknown>>(
  endpoint: string,
  options: { method?: string; body?: Record<string, unknown>; query?: Record<string, string | number | boolean | undefined> } = {},
): Promise<T> => {
  const auth = getAuth();
  if (!auth) throw ToolError.auth('Not authenticated — please log in.');

  let url = \\\`https://example.com/api\\\${endpoint}\\\`;
  if (options.query) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(options.query)) {
      if (value !== undefined) params.append(key, String(value));
    }
    const qs = params.toString();
    if (qs) url += \\\`?\\\${qs}\\\`;
  }

  const headers: Record<string, string> = { Authorization: \\\`Bearer \\\${auth.token}\\\` };
  let fetchBody: string | undefined;
  if (options.body) {
    headers['Content-Type'] = 'application/json';
    fetchBody = JSON.stringify(options.body);
  }

  let response: Response;
  try {
    response = await fetch(url, {
      method: options.method ?? 'GET', headers, body: fetchBody,
      credentials: 'include', signal: AbortSignal.timeout(30_000),
    });
  } catch (err: unknown) {
    if (err instanceof DOMException && err.name === 'TimeoutError')
      throw ToolError.timeout(\\\`API request timed out: \\\${endpoint}\\\`);
    throw new ToolError(
      \\\`Network error: \\\${err instanceof Error ? err.message : String(err)}\\\`,
      'network_error', { category: 'internal', retryable: true },
    );
  }

  if (!response.ok) {
    const errorBody = (await response.text().catch(() => '')).substring(0, 512);
    if (response.status === 429) throw ToolError.rateLimited(\\\`Rate limited: \\\${endpoint}\\\`);
    if (response.status === 401 || response.status === 403)
      throw ToolError.auth(\\\`Auth error (\\\${response.status}): \\\${errorBody}\\\`);
    if (response.status === 404) throw ToolError.notFound(\\\`Not found: \\\${endpoint}\\\`);
    throw ToolError.internal(\\\`API error (\\\${response.status}): \\\${endpoint} — \\\${errorBody}\\\`);
  }

  if (response.status === 204) return {} as T;
  return (await response.json()) as T;
};
\`\`\`

### Tool Pattern (one file per tool)

\`\`\`typescript
import { defineTool } from '@opentabs-dev/plugin-sdk';
import { z } from 'zod';
import { api } from '../<name>-api.js';

export const sendMessage = defineTool({
  name: 'send_message',
  displayName: 'Send Message',
  description: 'Send a message to a channel. Supports markdown formatting.',
  summary: 'Send a message to a channel',
  icon: 'send',
  input: z.object({
    channel: z.string().describe('Channel ID to send the message to'),
    content: z.string().describe('Message text content'),
  }),
  output: z.object({
    id: z.string().describe('Message ID'),
  }),
  handle: async (params) => {
    const data = await api<Record<string, unknown>>(
      '/channels/' + params.channel + '/messages',
      { method: 'POST', body: { content: params.content } },
    );
    return { id: (data.id as string) ?? '' };
  },
});
\`\`\`

### Plugin Class Pattern (\`index.ts\`)

\`\`\`typescript
import { OpenTabsPlugin } from '@opentabs-dev/plugin-sdk';
import type { ToolDefinition } from '@opentabs-dev/plugin-sdk';
import { isAuthenticated, waitForAuth } from './<name>-api.js';
import { sendMessage } from './tools/send-message.js';

class MyPlugin extends OpenTabsPlugin {
  readonly name = '<name>';
  readonly description = 'OpenTabs plugin for <DisplayName>';
  override readonly displayName = '<DisplayName>';
  readonly urlPatterns = ['*://*.example.com/*'];
  readonly tools: ToolDefinition[] = [sendMessage];

  async isReady(): Promise<boolean> {
    if (isAuthenticated()) return true;
    return waitForAuth();
  }
}

export default new MyPlugin();
\`\`\`

---

## Phase 5: Build and Test

### Build

\`\`\`bash
cd plugins/<name>
npm install
npm run build
\`\`\`

### Verify Plugin Loaded

\`\`\`
plugin_list_tabs(plugin: "<name>")
\`\`\`

Must show \`state: "ready"\` for the matching tab.

### Test Each Tool

Systematically test read-only tools first (list, get, search), then write tools (send, create, delete). Test error cases: invalid IDs, missing permissions.

### Full Check Suite

\`\`\`bash
npm run check  # build + type-check + lint + format:check
\`\`\`

---

## Key Conventions

- **One file per tool** in \`src/tools/\`
- **Every Zod field gets \`.describe()\`** — this is what AI agents see in the tool schema
- **\`description\` is for AI clients** — detailed, informative. \`summary\` is for humans — short, under 80 chars
- **Defensive mapping** with fallback defaults (\`data.field ?? ''\`) — never trust API shapes
- **Error classification is critical** — use \`ToolError\` factories, never throw raw errors
- **\`credentials: 'include'\`** on all fetch calls
- **30-second timeout** via \`AbortSignal.timeout(30_000)\`
- **\`.js\` extension** on all imports (ESM requirement)
- **No \`.transform()\`/\`.pipe()\`/\`.preprocess()\`** in Zod schemas (breaks JSON Schema serialization)

---

## Common Gotchas

1. **All plugin code runs in the browser** — no Node.js APIs
2. **SPAs hydrate asynchronously** — \`isReady()\` must poll (500ms interval, 5s max)
3. **Some apps delete browser APIs** — use iframe fallback for \`localStorage\`
4. **Tokens must persist on \`globalThis.__openTabs.tokenCache.<pluginName>\`** — module-level variables reset on extension reload
5. **HttpOnly cookies are invisible to plugin code** — use \`credentials: 'include'\` for the browser to send them automatically, detect auth status from DOM signals
6. **Parse error response bodies before classifying by HTTP status** — many apps reuse 403 for both auth and permission errors
7. **Cross-origin API + cookies: check CORS before choosing fetch strategy**
8. **Always run \`npm run format\` after writing code** — Biome config uses single quotes`;
};
