---
translationKey: 'mcp-secrets-vault'
lang: 'en'
slug: 'mcp-secrets-vault'
name: 'MCP Secrets Vault — AI-Safe Secret Management'
summary: 'A published npm MCP server that lets AI assistants use secrets — API keys, tokens, credentials — to perform authorized actions without ever exposing the secret values.'
stack:
  - 'TypeScript'
  - 'MCP SDK'
  - 'Zod'
  - 'Vitest'
  - 'GitHub Actions'
status: 'shipped'
links:
  - label: 'npm'
    url: 'https://www.npmjs.com/package/mcp-secrets-vault'
publishState: 'published'
---

MCP Secrets Vault sits between an AI assistant (Claude Desktop or any MCP-compatible client) and the secret store. When the assistant needs to call an API, it invokes a vault tool by name; the server resolves the secret from environment variables, injects it into the request, and returns only the sanitized response — the raw secret value never appears in the model context. Policy-based access control, configurable rate limiting, and an audit log are built in. The package is MIT-licensed, published on npm, and ships with CI coverage badges and a demo walkthrough.
