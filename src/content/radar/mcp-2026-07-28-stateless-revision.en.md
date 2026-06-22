---
translationKey: mcp-2026-07-28-stateless-revision
lang: en
slug: mcp-2026-07-28-stateless-revision
title: 'MCP goes stateless: the 2026-07-28 revision drops the handshake'
publishDate: 22-06-2026
kind: spec-change
tags:
- mcp
- agents
- spec-change
- transport
- oss
summary: The 2026-07-28 MCP revision, in release candidate since 21 May 2026, removes
  sessions and the initialize handshake and moves all protocol state into _meta on
  every request.
sources:
- label: Model Context Protocol specification - draft Key Changes / changelog
  url: https://modelcontextprotocol.io/specification/draft/changelog
  date: 21-05-2026
- label: Model Context Protocol official blog - The 2026-07-28 MCP Specification Release
    Candidate
  url: https://blog.modelcontextprotocol.io/posts/2026-07-28-release-candidate/
  date: 21-05-2026
- label: GitHub - modelcontextprotocol/modelcontextprotocol Releases
  url: https://github.com/modelcontextprotocol/modelcontextprotocol/releases
  date: 29-05-2026
- label: 'Context Studios blog - MCP v2 Alpha: The July 28 Protocol Shift to Plan
    For'
  url: https://www.contextstudios.ai/blog/mcp-v2-alpha-the-july-28-protocol-shift-to-plan-for
  date: 14-06-2026
contentHash: sha256:14e3a05e4d7580be
publishState: published
---

## What changed

The Model Context Protocol is shipping its `2026-07-28` revision, the next stable after `2025-11-25`. The release candidate was published on the official MCP blog on 21 May 2026 and tagged on GitHub as the `MCP 2026-07-28 RC` pre-release; the final specification is scheduled for 28 July 2026. The headline change makes the protocol stateless: the `initialize`/`notifications/initialized` handshake and the `Mcp-Session-Id` header are removed from the Streamable HTTP transport (SEP-2575, SEP-2567). Protocol version, client identity, and client capabilities now travel in `_meta` on every request. Roots, Sampling, and Logging are formally deprecated (SEP-2577) under a new feature-lifecycle policy with a minimum twelve-month deprecation window (SEP-2596).

## The schema

Per-connection handshake state is gone. Every request now carries the context that was previously exchanged once at connect time, using reserved `_meta` keys (SEP-2575):

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "search",
    "arguments": { "query": "invoices Q3" },
    "_meta": {
      "io.modelcontextprotocol/protocolVersion": "2026-07-28",
      "io.modelcontextprotocol/clientInfo": { "name": "acme-agent", "version": "1.4.0" },
      "io.modelcontextprotocol/clientCapabilities": {},
      "io.modelcontextprotocol/logLevel": "info"
    }
  }
}
```

Server-initiated calls (`roots/list`, `sampling/createMessage`, `elicitation/create`) become Multi Round-Trip Requests: the server returns `InputRequiredResult` with `resultType: "input_required"` and an `inputRequests` field; the client retries the original request with `inputResponses` (SEP-2322). All results now carry a required `resultType` of `"complete"` or `"input_required"`.

## In practice

The new required headers and the version-mismatch behaviour change every POST. Send `Mcp-Method` and `Mcp-Name` on Streamable HTTP requests (SEP-2243):

```bash
curl -X POST https://mcp.example.com/rpc \
  -H "Content-Type: application/json" \
  -H "Mcp-Method: tools/call" \
  -H "Mcp-Name: search" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/call",
       "params":{"name":"search","arguments":{"query":"x"},
       "_meta":{"io.modelcontextprotocol/protocolVersion":"2026-07-28"}}}'
# version mismatch -> UnsupportedProtocolVersionError
```

Servers must implement the new `server/discover` RPC to advertise supported versions and capabilities; clients may call it for up-front version selection.

## Impact on your team

If you maintain an MCP server or client, you have roughly a ten-week window from the RC to validate before the 28 July 2026 final. The stateless model is good news for horizontally scaled HTTP servers: with `Mcp-Session-Id` gone, any replica can serve any request and `tools/list` no longer varies per connection, so list results become cacheable via the new `CacheableResult` interface (`ttlMs`, `cacheScope`, SEP-2549).

> [!IMPORTANT]
> If you rely on Roots, Sampling, or Logging, plan migrations now: pass directories via tool params instead of Roots, call your LLM provider directly instead of Sampling, and log to stderr or OpenTelemetry instead of Logging. A minimum twelve-month deprecation window applies. SSE stream resumability (`Last-Event-ID`) is also removed, so broken streams must be re-issued with a new request ID rather than redelivered.
