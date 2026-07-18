---
translationKey: openai-responses-multi-agent
lang: en
slug: openai-responses-api-multi-agent-orchestration
title: OpenAI moves multi-agent orchestration server-side, and defaults the fan-out
  to 3
publishDate: 18-07-2026
kind: release
tags:
- OpenAI
- GPT-5.6
- Responses API
- agents
- orchestration
summary: 'On July 9, 2026 OpenAI shipped Multi-agent orchestration as a beta feature
  of the Responses API, hosting the subagent tree server-side behind one field. The
  tell is the throttle: max_concurrent_subagents defaults to 3, a narrow fan-out where
  Claude Code''s lineage pushes hundreds.'
sources:
- label: OpenAI developer changelog - GPT-5.6 adds Programmatic Tool Calling and Multi-agent
    orchestration
  url: https://developers.openai.com/api/docs/changelog
  date: 09-07-2026
- label: OpenAI Responses API multi-agent guide
  url: https://developers.openai.com/api/docs/guides/responses-multi-agent
  date: 09-07-2026
- label: OpenAI Programmatic Tool Calling guide
  url: https://developers.openai.com/api/docs/guides/tools-programmatic-tool-calling
  date: 09-07-2026
- label: aiagentstore.ai - Agent Collaboration news, week ending 2026-07-14
  url: https://aiagentstore.ai/ai-agent-news/topic/agent-collaboration/2026-07-14
  date: 14-07-2026
contentHash: sha256:312650ceea25a1c5
publishState: published
---

## What changed

On July 9, 2026 OpenAI shipped Multi-agent orchestration as a beta feature of the Responses API, alongside the GPT-5.6 family [s1][s2]. You turn it on with one field, `multi_agent.enabled`, behind the beta flag `OpenAI-Beta: responses_multi_agent=v1` (in the SDK, `client.beta.responses` with `betas=["responses_multi_agent=v1"]`) [s2]. The same day OpenAI shipped its token-side companion, Programmatic Tool Calling [s1][s3], and an independent tracker corroborated both ships [s4]. This is a current beta across all GPT-5.6 models, not GA.

## The tree, server-side

The part that matters is where the orchestration now lives. Coordinating a tree of subagents on OpenAI used to mean the Agents SDK, LangGraph, or a hand-rolled loop you owned and debugged. Now the tree is hosted: a root agent named `/root` spawns subagents on hierarchical paths like `/root/researcher` and `/root/reviewer/tester`, and six hosted actions surface as `multi_agent_call` items in the stream: `spawn_agent`, `send_message`, `followup_task`, `wait_agent`, `interrupt_agent`, and `list_agents` [s2]. Your own tools still work the plain way: any agent may emit a `function_call`, and your app returns a matching `function_call_output` [s2].

```python
from openai import OpenAI

client = OpenAI()
resp = client.beta.responses.create(
    model="gpt-5.6",
    betas=["responses_multi_agent=v1"],
    multi_agent={"enabled": True, "max_concurrent_subagents": 3},
    input="Research and review the migration plan.",
)
# The /root agent emits spawn_agent actions as multi_agent_call items.
```

## The default is 3, not hundreds

`max_concurrent_subagents` defaults to 3, which OpenAI calls "recommended for most workloads" [s2]. Read that as a design position, not a footnote. The Claude Code lineage pushes wide swarms and ships a per-session ceiling of 200 subagents precisely because runaway delegation is its failure mode; OpenAI's built-in fan-out is narrow and tells you to stay there. If your mental model of multi-agent is the wide swarm, this primitive is a different, deliberately throttled shape, and porting a wide-fan-out design onto it will surprise you. Raise the number on purpose, or design for three.

> [!IMPORTANT]
> This is beta (`responses_multi_agent=v1`) and a lock-in trade. You swap a portable, inspectable client-side graph for a hosted orchestrator you cannot move to another provider, and the surface can shift under the flag. Keep the orchestration layer thin if provider-independence matters.

## Impact on your team

If you already run a client-side agent graph, the question this raises is not whether the feature works but who owns the control loop. Three concrete calls. If you are an OpenAI shop doing narrow fan-out, this removes real orchestration glue today: worth a spike, but pin to the beta flag and expect churn. If your design assumes Claude-Code-style wide swarms, do not lift-and-shift; the default of 3 is the shape, so re-architect or raise `max_concurrent_subagents` deliberately. Pair the tree with Programmatic Tool Calling [s3]: the model writes JavaScript in a hosted runtime, calling tools in parallel and keeping intermediate results server-side, so the tree does not round-trip every tool output through the model. What to wait on is portability: there is no way to move a hosted tree off OpenAI, so keep that layer thin if it matters.
