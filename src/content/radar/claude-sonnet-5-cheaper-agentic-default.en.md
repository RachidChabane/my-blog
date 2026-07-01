---
translationKey: claude-sonnet-5
lang: en
slug: claude-sonnet-5-cheaper-agentic-default
title: 'Claude Sonnet 5: near-Opus agentic coding at a lower price, GA on day one'
publishDate: 01-07-2026
kind: release
tags:
- Claude
- Anthropic
- agents
- inference
summary: Anthropic shipped Claude Sonnet 5 on 2026-06-30, generally available day
  one at an introductory $2/$10 per million tokens through 2026-08-31, landing within
  six points of Opus 4.8 on agentic coding at a lower price than Opus 4.8, GPT-5.5,
  and Gemini 3.1 Pro.
sources:
- label: Anthropic - Introducing Claude Sonnet 5
  url: https://www.anthropic.com/news/claude-sonnet-5
  date: 30-06-2026
- label: TechCrunch - Anthropic launches Claude Sonnet 5 as a cheaper way to run agents
  url: https://techcrunch.com/2026/06/30/anthropic-launches-claude-sonnet-5-as-a-cheaper-way-to-run-agents/
  date: 30-06-2026
contentHash: sha256:3718d23d62bc767d
publishState: published
---

## What changed

Anthropic shipped Claude Sonnet 5 on 2026-06-30, and unlike this week's gated frontier drops it is generally available the same day: the default model for Free and Pro, available on Max, Team, and Enterprise, and callable in the API as `claude-sonnet-5` [s1][s2]. The load-bearing, dual-sourced facts are availability and price: an introductory $2 per million input tokens and $10 per million output tokens through 2026-08-31, then standard $3 in / $15 out [s1][s2]. TechCrunch notes that undercuts Opus 4.8 as well as GPT-5.5 and Gemini 3.1 Pro [s2]. Anthropic frames it as its most agentic Sonnet yet and says it "narrows the gap" to Opus 4.8 rather than matching it [s1].

## The price/quality math

Here is the number that moves the decision: on agentic coding Anthropic reports Sonnet 5 at 63.2%, against Opus 4.8's 69.2% and Sonnet 4.6's 58.1% [s2]. Six points behind the flagship, and TechCrunch puts Sonnet 5 below Opus 4.8, GPT-5.5, and Gemini 3.1 Pro on price [s2]. Read those two facts together and the default cost basis for running agents in production drops, so reaching for Opus becomes an escalation for the hardest judgment calls, not the everyday driver.

| Metric (Anthropic-reported [s2]) | Sonnet 5 | Opus 4.8 | Sonnet 4.6 |
| :--- | :--: | :--: | :--: |
| Agentic coding | 63.2% | 69.2% | 58.1% |

> [!IMPORTANT]
> The agentic-coding numbers above are Anthropic's own benchmarking data, reported via TechCrunch, single-org and not independently corroborated here [s2]. Treat them as a vendor claim to verify on your own agent traces, not a settled result. The same caution applies to Anthropic's safety claim of better refusal and prompt-injection resistance [s1]: asserted, not independently benchmarked.

## Impact on your team

If your agent loops default to Opus 4.8 today, the concrete decision this forces is whether to re-baseline them on Sonnet 5 before 2026-08-31. That date is the real deadline: the $2/$10 introductory rate is a discount on input and output that expires then and reverts to $3/$15 [s1][s2], so any cost projection you build now should assume the standard rate, not the promo. What I would actually do: run your existing agent eval suite against `claude-sonnet-5`, and if the quality delta on your tasks is smaller than the price delta, flip the default and keep Opus as a targeted fallback for the cases where six points of coding accuracy earns its keep. Do not drag GPT-5.5 or Gemini 3.1 Pro into this call; they are only Anthropic's pricing baselines here, not the choice in front of you.
