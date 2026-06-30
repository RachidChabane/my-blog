---
translationKey: prompt-caching-prefix-stability
lang: en
slug: prompt-caching-can-slow-your-agent-down
title: Prompt Caching Can Make Your Agent Slower
publishDate: 30-06-2026
tags:
- agents
- retrieval
category: briefings
difficulty: 3
sources:
- label: 'Don''t Break the Cache: An Evaluation of Prompt Caching for Long-Horizon
    Agentic Tasks (arXiv 2601.06007)'
  url: https://arxiv.org/abs/2601.06007
  date: 09-01-2026
- label: 'Spheron: Context Engineering for Production AI Agents (KV cache, prefix
    caching)'
  url: https://www.spheron.network/blog/context-engineering-production-ai-agents-kv-cache-long-context/
  date: 17-06-2026
contentHash: sha256:ee427d3d0cd33685
publishState: published
---


You flip on prompt caching expecting the bill to fall and the latency to drop, and most of the time it does. But the first controlled cross-provider study of caching on long-horizon agent tasks found a case the marketing never mentions: naive full-context caching can make a request slower, not faster [s1]. Caching is not a config toggle you switch on once; it is a prompt-architecture decision, and the variable that decides the sign of the payoff is how much of your prompt stays byte-identical from one turn to the next.

## Where the saving actually lives

The whole win is reused prefill. When a server already holds the key-value tensors for a prefix it computed last turn, it skips recomputing them: a 90 percent KV-cache hit rate skips 90 percent of the prefill work and cuts effective per-request compute by 80 to 90 percent [s2]. That number is the ceiling on what caching can buy you, and it is gated by one thing: the length of the prefix that is identical to last turn. The lever is not the on/off switch. It is where the cache boundary falls, because the boundary sits at the first token that changed.

## The case that loses

The existence proof that breaks the monotonic-savings belief sits in the same study. It reports real upside under discipline, 41 to 80 percent lower cost and 13 to 31 percent faster time to first token, but only with strategic cache-block control: placing dynamic content at the end of the system prompt and keeping changing tool results out of the cached span [s1]. Without that discipline, naive full-context caching can increase latency [s1]. The mechanism is unforgiving. Put a tool result or a function definition that changes every turn early in the context, and each turn moves the cache boundary forward; you re-prefill the suffix and pay the cache-write premium with no read benefit. In an agent loop, where tool outputs and state land in context on every step, the default layout is exactly the cache-breaking one. That is the named failure mode: volatile content interleaved into the prefix, invalidating it every turn.

> [!WARNING]
> The agent-loop default, splicing each fresh tool result into the running context as it arrives, is precisely the layout that breaks caching. Convenience and cache stability pull in opposite directions here.

## "Just turn it on, the provider handles it"

Providers cache for you now. OpenAI does automatic prefix caching, Gemini ships implicit caching, and every vendor guide already tells you to front-load static content. If the advice reduces to "put volatile content last," it is documented best practice, not a finding. The measured regression is the answer to that. If caching could only help or do nothing, a controlled study would not catch it raising latency [s1]; the belief most teams operate under, that the bill only goes down, is false. And automatic caching does not rescue a badly ordered prompt. Platform caching matches only the longest byte-identical prefix, so if your volatile content sits early, implicit caching still cannot reach past it, and by removing the explicit breakpoint it leaves you less control over where the boundary falls. Provider drift makes prompt order more decisive, not less.

> [!CONFIRMED]
> The first controlled cross-provider study measured 41 to 80 percent lower cost and 13 to 31 percent faster time to first token with cache-block control, while naive full-context caching can raise latency [s1].

> [!INFERRED]
> So the question to ask before enabling caching is not "is caching on?" but "is my prefix stable across turns, and is my volatile content last?" If you cannot answer yes, measure the cache-hit rate before you trust the savings.
