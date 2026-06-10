---
translationKey: 'mcp-secrets-vault'
lang: 'en'
slug: 'mcp-secrets-vault'
name: 'MCP Secrets Vault: AI-Safe Secret Management'
summary: 'A published npm MCP server that lets AI assistants use secrets (API keys, tokens, credentials) to perform authorized actions without ever exposing the secret values.'
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
relatedArticles:
  - 'evaluating-tool-using-agents'
  - 'deterministic-agent-workflows'
publishState: 'published'
year: '2025'
highlights:
  - 'Sits between an AI assistant (Claude Desktop or any MCP-compatible client) and the secret store, invoked as a vault tool by name'
  - 'Resolves the secret from environment variables, injects it into the request, and returns only the sanitized response'
  - 'The raw secret value never appears in the model context'
  - 'Policy-based access control, configurable rate limiting, and an audit log are built in'
metrics:
  - value: '3'
    label: 'built-in controls'
  - value: 'MIT'
    label: 'license'
  - value: 'npm'
    label: 'published'
architecture:
  caption: 'Request flow, client to sanitized response'
  layers:
    - label: 'Client'
      nodes:
        - 'Claude Desktop'
        - 'MCP-compatible client'
    - label: 'Tool invocation'
      nodes:
        - 'vault tool by name'
    - label: 'Secret resolution'
      nodes:
        - 'environment variables'
        - 'inject into request'
    - label: 'Controls'
      nodes:
        - 'policy-based access control'
        - 'configurable rate limiting'
        - 'audit log'
    - label: 'Response'
      nodes:
        - 'sanitized response'
---

MCP Secrets Vault sits between an AI assistant (Claude Desktop or any MCP-compatible client) and the secret store. When the assistant needs to call an API, it invokes a vault tool by name; the server resolves the secret from environment variables, injects it into the request, and returns only the sanitized response; the raw secret value never appears in the model context. Policy-based access control, configurable rate limiting, and an audit log are built in. The package is MIT-licensed, published on npm, and ships with CI coverage badges and a demo walkthrough.
