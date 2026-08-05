---
translationKey: mcp-2026-07-28-version-header-tasks-extension
lang: en
slug: mcp-2026-07-28-version-header-tasks-extension
title: MCP 2026-07-28 negotiates the protocol in a request header, and AWS's gateway
  answers a header-less request as 2025-03-26
publishDate: 05-08-2026
kind: spec-change
tags:
- MCP
- AWS AgentCore Gateway
- agents
summary: The shipped MCP 2026-07-28 revision moves Tasks into the io.modelcontextprotocol/tasks
  extension and negotiates the protocol per request via an Mcp-Protocol-Version header.
  Omit that header on AWS's AgentCore Gateway and you are not rejected, you are served
  2025-03-26.
sources:
- label: Model Context Protocol maintainers, specification release post
  url: https://blog.modelcontextprotocol.io/posts/2026-07-28/
  date: 28-07-2026
- label: AWS Machine Learning Blog, AgentCore Gateway implementation
  url: https://aws.amazon.com/blogs/machine-learning/how-agentcore-gateway-supports-the-mcp-2026-07-28-spec/
  date: 28-07-2026
contentHash: sha256:8834716cac92f53c
publishState: published
---

## What changed

Announced on 28 July 2026, the shipped MCP `2026-07-28` revision settles what its release candidate left open, and its quietest answer is the one that surprised me. Tasks moved out of the experimental core into the `io.modelcontextprotocol/tasks` extension, with a poll-based `tasks/get` and a new `tasks/update` (SEP-2663) [s1]. Change notifications moved off the old HTTP GET endpoint onto a single `subscriptions/listen` stream that clients opt into per notification type [s1]. And the protocol version now travels in a request header: every request carries `Mcp-Protocol-Version` [s2].

## The header decides which protocol you get

Covering the release candidate, I assumed any version disagreement would announce itself. On AWS's gateway, one kind of disagreement does not. AWS describes what its AgentCore Gateway does with that header [s2]:

| Request | What the gateway does |
| :--- | :--- |
| Version listed in `supportedVersions` | Serves the request in that version |
| Version not supported | HTTP 400, code -32022, and the supported list |
| No header at all | Defaults to `2025-03-26` |

Two rows are loud. The third costs a day: a client that forgets the header gets no error there, just a working connection to a revision from sixteen months earlier, with every capability it was written against quietly missing.

> [!IMPORTANT]
> A rejection from the gateway is cheap: the 400 hands back the list you should have sent [s2]. A missing header is expensive, because nothing fails at connect time and the first symptom is a tool call behaving like an older revision. Log the header you send, and alert on any peer answering as `2025-03-26` [s2].

## Tasks are surface you have to ask for

An extension is negotiated, not assumed. Long-running work modelled on the core task primitives now depends on the peer implementing `io.modelcontextprotocol/tasks` [s1], and `tasks/update` is API you have never called [s1]. Notifications cut the other way: one `subscriptions/listen` stream with per-type opt-in [s1] is less code than an endpoint you poll.

## Impact on your team

If you ship an MCP client, send `Mcp-Protocol-Version` on every request this week and assert it in a test, because the failure it prevents is silent [s2]. If you ship a server, return your supported versions on the rejection rather than a bare 400, as that gateway does [s2]. On Tasks I would not port yet: wait until the peers you call advertise the extension, then adopt `tasks/get` before `tasks/update` [s1]. The notification move is worth doing now, since `subscriptions/listen` replaces polling code you already maintain [s1].
