---
translationKey: claude-opus-5-5-cache-read-price-cut-and-max-output-tokens
lang: en
slug: claude-opus-5-5-cache-reads-max-effort-cost
title: Claude Opus 5.5 cuts cache reads by 60%, but at max effort Artificial Analysis
  measures it level with Opus 5 per task
publishDate: 26-09-2026
kind: release
tags:
- Claude
- Claude Opus 5.5
- Anthropic
- agents
- pricing
summary: Anthropic released Claude Opus 5.5 on September 22, 2026 at $4/$20 per million
  input/output tokens, with cache reads down 60%, and says it costs 40% less than
  Opus 5 at default settings. At max effort, Artificial Analysis measures it level
  with Opus 5 at max on cost per task, with 1.6x the output tokens.
sources:
- label: Anthropic, "Introducing Claude Opus 5.5"
  url: https://www.anthropic.com/claude-opus-5-5
  date: 22-09-2026
- label: Artificial Analysis, "Claude Opus 5.5 takes the top spot on the Artificial
    Analysis Intelligence Index"
  url: https://artificialanalysis.ai/articles/claude-opus-5-5
  date: 22-09-2026
- label: Simon Willison, "Claude Opus 5.5, GPT-6 Sol, GPT-6 Luna, and a new price
    war"
  url: https://simonwillison.net/2026/Sep/22/opus-and-sol-and-luna/
  date: 22-09-2026
contentHash: sha256:4d650f092b313e1c
publishState: published
---

## What changed

Anthropic released Claude Opus 5.5 on September 22, 2026: on the Claude Platform as `claude-opus-5-5`, and on Amazon Web Services, Google Cloud and Microsoft Azure [s1]. Input and output tokens drop 20% below Opus 5, and cache reads drop 60% [s1]. The headline saving is scoped: at default settings, 40% less than Opus 5 on typical workloads [s1].

## Where the discount lands

| Price per 1M tokens | Opus 5 | Opus 5.5 |
| :--- | ---: | ---: |
| Cache reads [s1] | $0.50 | $0.20 |
| Input [s1] | $5 | $4 |
| Output [s1] | $25 | $20 |

The uneven line is the one that matters. Anthropic says cache reads make up the majority of agentic and coding work costs [s1], and Simon Willison notes that in longer agentic conversations 90%+ of input tokens are processed at cached prices [s3]. Artificial Analysis puts the new cache-read price at a 95% discount on uncached input, up from 90% on previous Opus models [s2]. I think the second-order effect matters more: a cache miss now costs relatively more, so anything that breaks your prefix (a timestamp in the system prompt, a reordered tool list) eats a bigger share of the saving.

## Max effort spends the discount

The case for max is real. At max effort, Artificial Analysis scores Opus 5.5 at 58 on its Intelligence Index, the highest score it has measured by several points [s2]. The bill follows. At max, Opus 5.5 uses about 119k output tokens per Intelligence Index task against about 73k for Opus 5 at max, which leaves it level with Opus 5 on cost per task [s2]. The 40% belongs to default settings, where the effort is medium [s1].

Simon Willison ran max on one prompt and hit the 128,000 maximum output token limit (shared by the other Claude models) while the model was still reasoning, twice [s3]. Each failure cost him $2.56 and nearly 20 minutes [s3]. He suspects max is effectively useless [s3]. On one prompt I would not go that far, but I would not make it a default either.

## Impact on your team

Opus 5.5 is no longer available with thinking mode switched off [s1], so any request that switches thinking off has to change before you move to `claude-opus-5-5`. If your API account was created on or after August 31, 2026, preserved thinking applies; it stops API users from editing Claude's prior context in an attempt to extract Claude's reasoning [s1]. I would test any harness that rewrites or trims earlier assistant turns first. Budget on medium, the default, and route a task to max only where your evals show the gain: at max, Artificial Analysis measures no per-task saving against Opus 5 at max [s2]. And track your cache hit rate: your share of the cut depends on it.
