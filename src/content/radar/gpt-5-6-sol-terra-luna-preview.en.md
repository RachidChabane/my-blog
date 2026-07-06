---
translationKey: gpt-5-6-sol-terra-luna
lang: en
slug: gpt-5-6-sol-terra-luna-preview
title: GPT-5.6 previews as three tiers, and quietly rewrites the prompt-caching bill
publishDate: 06-07-2026
kind: release
tags:
- GPT-5.6
- OpenAI
- Codex
- inference
summary: 'OpenAI opened a limited GPT-5.6 preview on 2026-06-26 as three tiers, Sol,
  Terra and Luna. The real engineering news is the caching change: cache writes now
  cost 1.25x the uncached input rate.'
sources:
- label: OpenAI release notes - Previewing GPT-5.6 Sol
  url: https://releasebot.io/updates/openai
  date: 26-06-2026
- label: 'DataCamp - GPT-5.6 Sol, Terra, and Luna: OpenAI''s Next-Gen Model Family'
  url: https://www.datacamp.com/blog/gpt-5-6-sol-luna-terra
  date: 26-06-2026
- label: 'edenai - GPT-5.6 Sol: Benchmarks, Pricing and API Access Guide 2026'
  url: https://www.edenai.co/post/gpt-5-6-sol-benchmarks-pricing-api-access-guide
  date: 29-06-2026
contentHash: sha256:05e40e91912e9d72
publishState: published
---

## What changed

OpenAI opened a limited preview of GPT-5.6 on 2026-06-26, and the headline is not one model but three: Sol, the flagship for complex reasoning and long-horizon agentic work; Terra, the balanced default; and Luna, the cheap, fast tier for high-volume, latency-sensitive jobs [s1][s2]. During the preview the models reach only selected partners through the API and Codex, with general availability described as coming in the following weeks [s1][s3]. Alongside the split, OpenAI quietly rewrote how prompt caching is billed [s1].

## The price ladder

| Tier | Input / 1M | Output / 1M | For |
| :--- | ---: | ---: | :--- |
| Sol | $5.00 | $30.00 | complex reasoning, agentic, coding [s3] |
| Terra | $2.50 | $15.00 | the default; GPT-5.5-competitive at ~half the cost [s3] |
| Luna | $1.00 | $6.00 | high-volume, latency-sensitive [s3] |

The tiering itself is not the news. Gemini and Claude already ship a price-performance ladder, so OpenAI splitting its flagship into three billed tiers mainly means model selection is now an explicit routing decision for OpenAI users too, not a default you inherit.

## The caching contract changed

This is the part to actually read. For GPT-5.6 and later, cache writes are billed at 1.25x the model's uncached input rate, while cache reads keep the 90% cached-input discount; you also get explicit cache breakpoints and a guaranteed 30-minute minimum cache life [s1][s2]. That flips prompt caching from a passive discount into something you architect. A breakpoint placed badly on a long system prompt now carries a measurable write cost, not just a foregone saving. The gain is predictability: with a 30-minute floor you can reason about whether a cached prefix survives between requests instead of guessing.

> [!IMPORTANT]
> You cannot call these models today. The preview is gated to selected partners via the API and Codex; a general account has no access, and OpenAI only says general availability is "in the coming weeks." Treat this as a contract change to plan for, not a tool to adopt this week.

## Impact on your team

Two concrete moves. If you are an OpenAI shop, start pricing your workloads against the three tiers now: route bulk classification and chat to Luna, keep agentic and coding on Sol, and default the rest to Terra rather than paying flagship rates everywhere. Second, before GPT-5.6 lands, audit where you place cache breakpoints: a write is no longer free, so caching a prefix you rarely re-read can cost more than it saves. One thing to wait on: OpenAI says it will run Sol on Cerebras at up to 750 tokens per second in July [s1][s2], so if throughput is your constraint, that date, not the preview, is the one to watch.
