---
translationKey: gemini-3-6-flash-cheaper-workhorse
lang: en
slug: gemini-3-6-flash-cheaper-agentic-workhorse
title: Gemini 3.6 Flash cuts the output price and burns 17% fewer tokens per agentic
  task
publishDate: 24-07-2026
kind: release
tags:
- Gemini
- Google
- agents
- inference
summary: Google shipped Gemini 3.6 Flash on 21 July 2026 at $7.50 per million output
  tokens and 17% fewer output tokens per task than 3.5 Flash. The two levers stack,
  so the real per-task cost drops by more than the sticker price alone.
sources:
- label: Google, Introducing Gemini 3.6 Flash, 3.5 Flash-Lite, and 3.5 Flash Cyber
  url: https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-3-6-flash-3-5-flash-lite-3-5-flash-cyber/
  date: 21-07-2026
- label: 'Fello AI, Gemini 3.6 Flash: Pricing, Benchmarks & What''s New'
  url: https://felloai.com/gemini-3-6-flash/
  date: 21-07-2026
contentHash: sha256:ef1dd96373c83160
publishState: published
---

## What changed

Google shipped Gemini 3.6 Flash on 21 July 2026 at $1.50 per million input tokens and $7.50 per million output tokens, live the same day in Google AI Studio, Android Studio, Google Antigravity, and the Gemini app [s1]. Google's own metric is 17% fewer output tokens than Gemini 3.5 Flash to finish the same work, measured on the Artificial Analysis Index [s1]. Fello AI reports the $7.50 output price is down from $9.00 on 3.5 Flash, with input unchanged at $1.50, and the knowledge cutoff moving from January 2025 to March 2026 [s2].

## Where the savings actually land

The interesting part is not the sticker cut; it is that two levers stack. A lower output price and 17% fewer output tokens per task multiply instead of substituting. Run the arithmetic over the two cited figures: 7.50/9.00, times the 17% token reduction, is 0.833 x 0.83, about 0.69. On output-heavy work the real per-task cost falls by roughly a third, not by the ~17% the price line alone suggests.

| Per 1M tokens | 3.5 Flash | 3.6 Flash |
| :--- | ---: | ---: |
| input | $1.50 [s2] | $1.50 [s1] |
| output | $9.00 [s2] | $7.50 [s1] |

That number only holds when output dominates the bill.

> [!IMPORTANT]
> Input still costs $1.50 per million [s1], so a workload dominated by long retrieved contexts, a big RAG pipeline for instance, sees little of this drop. The compounding bites in output-heavy agentic loops, chains of tool calls and generated text, not in input-heavy retrieval. Price your own token mix before you assume a third off.

## Impact on your team

If you route high-volume agent traffic through the Flash tier, this is worth re-pricing this week, because the win is concentrated exactly where agent loops spend: output. It is opt-in, not a deprecation, so there is no deadline and no forced migration; 3.6 Flash is available today with no waitlist [s1]. Two cautions before you flip production. No quality benchmark for 3.6 Flash was captured here, and Google leads with cost and lower latency rather than a task-accuracy delta, so validate on your own evals before assuming 3.5 Flash parity. And the longer knowledge cutoff, March 2026 [s2], changes what the model knows without you touching a prompt, which can shift behavior on recency-sensitive tasks. Re-price now, re-benchmark before you commit.
