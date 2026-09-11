---
translationKey: agents-api-self-hosted-sandbox-ownership
lang: en
slug: openai-agents-api-self-hosted-sandbox
title: OpenAI's Agents API runs its harness against a sandbox you own
publishDate: 11-09-2026
kind: release
tags:
- OpenAI
- Agents API
- E2B
- agents
- sandboxes
summary: 'OpenAI released the Agents API in public beta on September 10, 2026, and
  its session config takes `type: "self_hosted"` with your own `workspace_directory`
  [s1][s3]. The split inverts the usual bargain: OpenAI keeps orchestration, compaction
  and recovery, you keep the box where the code runs [s2][s3].'
sources:
- label: OpenAI Agents API overview guide
  url: https://developers.openai.com/api/docs/guides/agents-api/overview.md
  date: 10-09-2026
- label: E2B, agent workbench on the Agents API
  url: https://e2b.dev/resources/build-an-agent-workbench-on-openais-agents-api
  date: 10-09-2026
- label: OpenAI developer changelog, Sep 10 Agents API public beta entry
  url: https://developers.openai.com/api/docs/changelog
  date: 10-09-2026
contentHash: sha256:bca73e17a50fa0b4
publishState: published
---

## What changed

OpenAI released the Agents API in public beta on September 10, 2026: a managed Codex harness where OpenAI handles session orchestration, context compaction, and recovery [s3]. The same entry offers a choice: an OpenAI-hosted sandbox, or one connected from your own infrastructure [s3]. In the session config that choice is one field: `environment`, `type: "self_hosted"`, your own `workspace_directory` [s1]. E2B, a sandbox provider the Agents API connects to, states the split in its own words: OpenAI owns the model, the harness and session lifecycle, E2B owns where the agent's code executes [s2].

## The half you keep is the expensive half

That split inverts the usual hosted-agent bargain. Normally a vendor rents the sandbox and you keep the loop, portable to another model next quarter. The Agents API hands you the other half. OpenAI keeps orchestration, compaction, and recovery [s3], the part that is cheap to write and expensive to be locked into. You keep the box where code runs, cheap to reason about and expensive to operate. The sandbox tier is where the real bill sits: base images, egress policy, secret injection, and the cleanup job nobody writes until the first container leaks.

```js
environment: {
  type: "self_hosted",
  workspace_directory: "/workspace",
  capability_directories: ["/workspace/capabilities/skills"],
}
```

`capability_directories` is the line I would stare at [s1]. The agent loads its capabilities from a path on your filesystem, so self-hosting moves that supply chain to your side too. Good, if you already review that directory. A new hole, if it is a mount somebody scripted last year.

> [!IMPORTANT]
> Self-hosted is not self-governed. Session orchestration, context compaction, and recovery stay on OpenAI's side [s3], and the surface is still `client.beta.agents` [s1].

## Impact on your team

The real question is whether you are already a sandbox operator. If you run that tier today, images, network policy, cleanup, then `type: "self_hosted"` [s1] costs one config block and buys a boundary you can audit. If you do not run it, the hosted sandbox is the honest default: taking `self_hosted` to satisfy a policy nobody has written down converts a config field into a new on-call rotation. This is public beta under `client.beta.agents` [s1], so pin the namespace and expect breakage. And if you take `self_hosted`, put `capability_directories` in your review queue this quarter [s1]: a code path into your agent that no gate on OpenAI's side covers.
