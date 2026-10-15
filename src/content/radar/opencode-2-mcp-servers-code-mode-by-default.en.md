---
translationKey: opencode-2-mcp-servers-code-mode-by-default
lang: en
slug: opencode-2-mcp-servers-code-mode-by-default
title: OpenCode 2.0 opts all MCP servers into code mode by default, so the agent can
  call your tools from a script
publishDate: 15-10-2026
kind: release
tags:
- OpenCode
- MCP
- agents
- coding
summary: 'Anomaly''s OpenCode 2.0 note, dated October 12, 2026, opts all MCP servers
  into code mode by default: each becomes a function that a script written by the
  agent can call, chaining tool calls in a single round trip. Release 1.19.0, published
  October 11, 2026, bridges to 2.0 through opencode upgrade --major and no longer
  installs updates automatically; 1.0 plugins will not work in 2.0 and the server
  API is completely different. I would audit which MCP servers have write access before
  upgrading.'
sources:
- label: Anomaly notes index
  url: https://anoma.ly/notes/
  date: 12-10-2026
- label: Anomaly, "OpenCode 2.0" release note
  url: https://anoma.ly/notes/opencode-2-0/
  date: 12-10-2026
- label: GitHub, anomalyco/opencode release v1.19.0
  url: https://github.com/anomalyco/opencode/releases/tag/v1.19.0
  date: 11-10-2026
- label: 'explainx.ai, "OpenCode 2.0: Code Mode, Background Agents and a Shared Server,
    and How to Upgrade"'
  url: https://explainx.ai/blog/opencode-2-0-code-mode-background-agents-shared-server-sdk-upgrade-guide-2026
  date: 12-10-2026
contentHash: sha256:d168c8bdd158b177
publishState: published
---

## What changed

Anomaly's OpenCode 2.0 note, dated October 12, 2026 [s1], says all MCP servers in 2.0 are opted into code mode by default [s2]. Code Mode is a minimal JavaScript interpreter shipped as `@opencode/codemode`, and it turns MCP servers and OpenAPI endpoints into callable functions [s4]. Release 1.19.0, published October 11, 2026, is the bridge [s4]: from it, `opencode upgrade --major` moves you to OpenCode 2, and updates are no longer installed automatically [s3].

## The default is the part to review

I think the default deserves your attention before the upgrade, more than the interpreter itself. Code mode lets your agent write scripts that call a tool, map over the results and call another tool, in a single round trip instead of calling them one at a time [s2]. Anomaly's own demo shows an `execute` step that calls `tools.github.list_issues` and `tools.linear.save_issue` [s2]. In my reading, a model turn can now be a script, and the default extends that to every server you have configured.

> [!IMPORTANT]
> explainx.ai, which says it has not run 2.0 itself, warns that if you attach a server with write access, Code Mode can call it in a loop [s4].

What I could not find in the note is how permission prompts behave inside a script: once per tool call, or once per `execute` step. Until that is documented, I would assume the looser of the two.

## The strongest objection

Code mode is only a calling convention: the tools and their permissions are the ones a 1.x agent could already reach, so nothing new is exposed. I agree about the tool set. What changes is how much one turn can do with it, and on how many servers at once. With every server opted in by default [s2], the review that an opt-in would have forced one server at a time now has to happen in one pass before the upgrade, in my view.

## Impact on your team

My call: since 1.19.0 no longer installs updates automatically, OpenCode 2 waits until you run `opencode upgrade --major` or `/update` [s3], so put the audit on the same ticket. Before you upgrade, list the MCP servers with write access, remove the ones the agent does not need, and keep permission prompts on for destructive tools, as explainx.ai advises [s4]. Port your plugins and anything scripted against the 1.x server in the same change: 1.0 plugins will not work in 2.0, and the server API is completely different [s2].
