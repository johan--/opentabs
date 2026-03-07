/**
 * MCP resource definitions for the OpenTabs server.
 *
 * Resources are static or dynamic documents that AI clients can fetch on demand
 * via `resources/read`. Unlike instructions (sent on every session), resources
 * are pull-based — clients discover them via `resources/list` and fetch content
 * when they need deeper context.
 *
 * Static resources return pre-built markdown content (guides, references).
 * The `opentabs://status` resource is dynamic — built from ServerState at read time.
 */

import type { ServerState } from './state.js';

/** A resource definition for MCP resources/list */
export interface ResourceDefinition {
  uri: string;
  name: string;
  description: string;
  mimeType: string;
}

/** A resolved resource for MCP resources/read */
export interface ResolvedResource {
  uri: string;
  mimeType: string;
  text: string;
}

/** All registered resources */
const RESOURCES: ResourceDefinition[] = [
  {
    uri: 'opentabs://guide/quick-start',
    name: 'Quick Start Guide',
    description: 'Installation, configuration, and first tool call',
    mimeType: 'text/markdown',
  },
  {
    uri: 'opentabs://guide/plugin-development',
    name: 'Plugin Development Guide',
    description: 'Full guide to building OpenTabs plugins (SDK, patterns, conventions)',
    mimeType: 'text/markdown',
  },
  {
    uri: 'opentabs://guide/troubleshooting',
    name: 'Troubleshooting Guide',
    description: 'Common errors and resolution steps',
    mimeType: 'text/markdown',
  },
  {
    uri: 'opentabs://reference/sdk-api',
    name: 'SDK API Reference',
    description: 'Plugin SDK API reference (utilities, errors, lifecycle hooks)',
    mimeType: 'text/markdown',
  },
  {
    uri: 'opentabs://reference/cli',
    name: 'CLI Reference',
    description: 'CLI command reference (opentabs, opentabs-plugin)',
    mimeType: 'text/markdown',
  },
  {
    uri: 'opentabs://reference/browser-tools',
    name: 'Browser Tools Reference',
    description: 'All browser tools organized by category',
    mimeType: 'text/markdown',
  },
  {
    uri: 'opentabs://status',
    name: 'Server Status',
    description: 'Live server state: loaded plugins, extension connectivity, tab states',
    mimeType: 'application/json',
  },
];

/** Resource URI → definition for O(1) lookup */
const RESOURCE_MAP = new Map(RESOURCES.map(r => [r.uri, r]));

/** Return all resource definitions for resources/list */
export const getAllResources = (_state: ServerState): ResourceDefinition[] =>
  RESOURCES.map(r => ({
    uri: r.uri,
    name: r.name,
    description: r.description,
    mimeType: r.mimeType,
  }));

/**
 * Resolve a resource by URI, returning its content.
 * Returns null if the URI is not recognized.
 */
export const resolveResource = (state: ServerState, uri: string): ResolvedResource | null => {
  const def = RESOURCE_MAP.get(uri);
  if (!def) return null;

  if (uri === 'opentabs://status') {
    return { uri, mimeType: 'application/json', text: buildStatusResource(state) };
  }

  // Static resources return placeholder content (populated in later stories)
  return { uri, mimeType: def.mimeType, text: `# ${def.name}\n\nContent coming soon.` };
};

/** Build the dynamic status resource JSON from server state */
const buildStatusResource = (state: ServerState): string => {
  const plugins = [...state.registry.plugins.values()].map(p => ({
    name: p.name,
    displayName: p.displayName,
    toolCount: p.tools.length,
    tools: p.tools.map(t => `${p.name}_${t.name}`),
    tabState: state.tabMapping.get(p.name)?.state ?? 'closed',
    tabs: (state.tabMapping.get(p.name)?.tabs ?? []).map(t => ({
      tabId: t.tabId,
      url: t.url,
      title: t.title,
      ready: t.ready,
    })),
  }));

  return JSON.stringify(
    {
      extensionConnected: state.extensionWs !== null,
      plugins,
      failedPlugins: [...state.registry.failures],
      browserToolCount: state.cachedBrowserTools.length,
      pluginToolCount: [...state.registry.plugins.values()].reduce((sum, p) => sum + p.tools.length, 0),
      skipPermissions: state.skipPermissions,
      uptime: Math.round((Date.now() - state.startedAt) / 1000),
    },
    null,
    2,
  );
};
