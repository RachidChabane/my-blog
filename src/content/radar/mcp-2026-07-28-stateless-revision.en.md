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
contentHash: sha256:f0f7ed362a9425d1
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

## The round-trip

Server-initiated calls (`roots/list`, `sampling/createMessage`, `elicitation/create`) become Multi Round-Trip Requests: instead of pushing a separate request, the server answers the client's call with `input_required`, and the client re-sends carrying the answer. Statelessly, one logical tool call becomes a sequence of self-contained round-trips, each message carrying its own `_meta` (SEP-2322). All results now declare a required `resultType` of `"complete"` or `"input_required"`.

<figure class="rc-diagram">
<svg viewBox="0 0 660 296" role="img" aria-label="Sequence diagram: a stateless MCP tool call that needs server-side input takes multiple round-trips. The client sends tools/call with _meta; the server replies result input_required with inputRequests; the client retries with inputResponses; the server replies result complete.">
<rect x="58" y="10" width="124" height="34" rx="8" style="fill: var(--surface); stroke: var(--border)"></rect>
<text x="120" y="32" text-anchor="middle" style="fill: var(--fg); font-family: var(--font-mono); font-size: 13px">Client</text>
<rect x="478" y="10" width="124" height="34" rx="8" style="fill: var(--surface); stroke: var(--border)"></rect>
<text x="540" y="32" text-anchor="middle" style="fill: var(--fg); font-family: var(--font-mono); font-size: 13px">Server</text>
<line x1="120" y1="46" x2="120" y2="288" style="stroke: var(--border-subtle)" stroke-dasharray="3 4"></line>
<line x1="540" y1="46" x2="540" y2="288" style="stroke: var(--border-subtle)" stroke-dasharray="3 4"></line>
<text x="330" y="80" text-anchor="middle" style="fill: var(--fg-muted); font-family: var(--font-mono); font-size: 12px">tools/call + _meta</text>
<line x1="120" y1="90" x2="532" y2="90" style="stroke: var(--accent)" stroke-width="1.5"></line>
<polygon points="532,85 543,90 532,95" style="fill: var(--accent)"></polygon>
<text x="330" y="130" text-anchor="middle" style="fill: var(--fg-muted); font-family: var(--font-mono); font-size: 12px">result: input_required + inputRequests</text>
<line x1="540" y1="140" x2="128" y2="140" style="stroke: var(--accent)" stroke-width="1.5" stroke-dasharray="5 4"></line>
<polygon points="128,135 117,140 128,145" style="fill: var(--accent)"></polygon>
<text x="330" y="190" text-anchor="middle" style="fill: var(--fg-muted); font-family: var(--font-mono); font-size: 12px">retry + inputResponses</text>
<line x1="120" y1="200" x2="532" y2="200" style="stroke: var(--accent)" stroke-width="1.5"></line>
<polygon points="532,195 543,200 532,205" style="fill: var(--accent)"></polygon>
<text x="330" y="240" text-anchor="middle" style="fill: var(--fg-muted); font-family: var(--font-mono); font-size: 12px">result: complete</text>
<line x1="540" y1="250" x2="128" y2="250" style="stroke: var(--accent)" stroke-width="1.5" stroke-dasharray="5 4"></line>
<polygon points="128,245 117,250 128,255" style="fill: var(--accent)"></polygon>
</svg>
<figcaption>One stateless tool call that needs server-side input: repeated round-trips, each message self-contained. No session, no handshake to resume.</figcaption>
</figure>

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
