---
translationKey: claude-fable-5-mythos-5
lang: en
slug: claude-fable-5-mythos-tier-fallback
title: 'Claude Fable 5: a top tier at 2x Opus, with a silent Opus fallback'
publishDate: 26-06-2026
kind: release
tags:
- Claude
- Anthropic
- llm-release
- agentic
summary: 'Anthropic shipped Claude Fable 5 on 2026-06-09, the first public Mythos-class
  model, a tier above Opus, topping GDPval-AA at 1932. The catch for teams already
  on Claude is not the benchmark: it lists at double Opus 4.8, and on sensitive turns
  it silently re-serves from Opus 4.8.'
sources:
- label: Anthropic news - Claude Fable 5 and Claude Mythos 5
  url: https://www.anthropic.com/news/claude-fable-5-mythos-5
  date: 09-06-2026
- label: TechCrunch - independent coverage
  url: https://techcrunch.com/2026/06/09/anthropic-released-claude-fable-5-its-most-powerful-model-publicly-days-after-warning-ai-is-getting-too-dangerous/
  date: 09-06-2026
- label: Artificial Analysis - independent benchmark outlet
  url: https://artificialanalysis.ai/articles/claude-fable-5-mythos
  date: 09-06-2026
- label: Claude Cookbook - classifier fallback and billing for Fable 5
  url: https://platform.claude.com/cookbook/fable-5-fallback-billing-guide
  date: 09-06-2026
contentHash: sha256:c9cdaf09feffd5d2
publishState: published
---

## What changed

Anthropic put its most capable model in public hands on 2026-06-09. Claude Fable 5 is the first generally available release from the new Mythos-class tier, a rung above the Opus class, and Anthropic calls it state-of-the-art on nearly all tested benchmarks; Artificial Analysis records a GDPval-AA score of 1932, the top spot. For a team already on Claude, the benchmark is not the news. The price, and a guardrail that can change which model actually answers, are.

## Paying twice for the top of the range

Fable 5 lists at $10 per million input tokens and $50 per million output tokens, which TechCrunch flags as double the price of Opus 4.8. That is the adoption decision in one line. Fable 5 is not a drop-in upgrade you flip on everywhere; at 2x, it is a model you route to, reserved for the work where the extra capability pays for itself. Defaulting your bulk traffic to it is the easy way to double a bill without doubling the value.

## The fallback you should instrument

Fable 5 ships with a guardrail Opus does not advertise. On high-risk topics (Anthropic names cybersecurity, biology, chemistry, and distillation) it blocks and re-serves the answer from Claude Opus 4.8, which Anthropic says happens in fewer than 5% of sessions on average. So on a small slice of exactly your most sensitive turns, your top-tier model silently becomes a cheaper one. The Claude cookbook exposes this as a server-side fallback you opt into and can read back:

```
# the response tells you which model actually answered
message.model            # "claude-opus-4-8" on a fallback turn
# the request names the fallback target explicitly
"fallbacks": [{"model": "claude-opus-4-8"}]
```

> [!IMPORTANT]
> Treat any security, bio, or chemistry workload on Fable 5 as non-deterministic on model identity. Log `message.model` per turn; if you assumed Fable answered every request, your evals and your costs are both off on the blocked slice.

## Impact on your team

If you run on Claude, re-price this week, do not re-default. Decide which workloads justify $10/$50 and route only those to Fable 5; leave the rest on Opus 4.8. If you build anything in the blocked categories, instrument `message.model` now so you can see the Opus fallback, and re-run your safety-sensitive evals against the model that actually answers rather than the one you requested. There is no deprecation deadline here; the cost of waiting is only the cost of every bulk call you misroute to the top tier in the meantime.
