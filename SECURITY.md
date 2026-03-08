# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in OpenTabs, please report it responsibly. **Do not open a public GitHub issue for security vulnerabilities.**

Email: **ralph@opentabs.dev**

Include:

- A description of the vulnerability
- Steps to reproduce
- The potential impact
- Any suggested fix (optional)

We will acknowledge receipt within 48 hours and aim to provide a resolution timeline within 7 days.

## Scope

The following are in scope for security reports:

- **MCP server** — authentication bypass, unauthorized tool execution, secret leakage
- **Chrome extension** — adapter injection into unintended origins, cross-origin data access, permission escalation
- **Plugin SDK** — vulnerabilities in SDK utilities that could be exploited by malicious web pages
- **Plugin review system** — bypasses that allow unreviewed code to execute

The following are out of scope:

- Vulnerabilities in third-party web applications that plugins interact with
- Issues that require the user to have already granted full permissions (`OPENTABS_DANGEROUSLY_SKIP_PERMISSIONS`)
- Social engineering attacks

## Disclosure Policy

We follow coordinated disclosure. Once a fix is available, we will:

1. Release a patched version
2. Credit the reporter (unless they prefer to remain anonymous)
3. Publish a brief advisory describing the issue and the fix
