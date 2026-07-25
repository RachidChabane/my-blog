---
translationKey: claude-opus-5-effort-cost-lever
lang: en
slug: claude-opus-5-effort-cost-lever
title: Claude Opus 5 ships at unchanged Opus pricing with the effort setting as the
  cost lever
publishDate: 25-07-2026
kind: release
tags:
- Claude
- Claude Opus 5
- Anthropic
- agentic coding
- effort
summary: Anthropic released Claude Opus 5 on 24 July 2026 at $5 per million input
  tokens and $25 per million output tokens, the same price as Opus 4.8. The cost decision
  now lives in the per-request effort setting, and CodeRabbit's own review benchmark
  shows that raising it costs recall and tokens.
sources:
- label: Anthropic news, Claude Opus 5
  url: https://www.anthropic.com/news/claude-opus-5
  date: 24-07-2026
- label: Fortune, Anthropic debuts Claude Opus 5 with a feature that lets users toggle
    between cost and capability
  url: https://fortune.com/2026/07/24/anthropic-debuts-claude-opus-5-with-feature-that-lets-users-toggle-between-cost-and-capability/
  date: 24-07-2026
- label: CodeRabbit, Claude Opus 5 benchmarks for AI code review
  url: https://www.coderabbit.ai/blog/opus-5-model-review
  date: 24-07-2026
- label: 'MarkTechPost, Meet the new Claude Opus 5: frontier-class agentic coding
    and computer use at unchanged Opus pricing'
  url: https://www.marktechpost.com/2026/07/24/meet-the-new-claude-opus-5-frontier-class-agentic-coding-and-computer-use-at-unchanged-opus-pricing/
  date: 24-07-2026
contentHash: sha256:e1ec1e510490b326
publishState: published
---

## What changed

Anthropic released Claude Opus 5 on 24 July 2026 at $5 per million input tokens and $25 per million output tokens, unchanged from Opus 4.8 [s1][s4], under the model id `claude-opus-5` on the Claude API [s1]. Anthropic says it comes close to the frontier intelligence of Claude Fable 5 at half that model's price [s1][s2]. What moved is a per-request effort setting that trades capability against tokens [s1][s2][s3][s4]. Fortune frames it as a response to growing concerns from enterprise customers about expensive AI bills [s2].

## What the effort setting actually costs

The cost story left the model id and moved into a value you set on every call, so capacity planning is now a per-request decision rather than a routing-table entry. CodeRabbit put Opus 5 through its own code-review benchmark against the production reviewer it already runs, and the setting is no free quality knob [s3].

| CodeRabbit review benchmark | production baseline | Opus 5 |
| :--- | ---: | ---: |
| precision, actionable subset, x-high | 35.2% [s3] | 39.3% [s3] |
| input tokens per review | ~40,500 [s3] | ~60,500 [s3] |
| output tokens per review | ~5,800 [s3] | ~9,500 [s3] |

Read the rows together. At x-high, CodeRabbit got a cleaner actionable subset while catching fewer known issues and generating four times as many nitpicks [s3]. Opus 5 also cost more on that workload: roughly 60,500 input tokens per review against roughly 40,500 for the baseline [s3], a ratio near 1.49, so about 50% more input per review. Precision up, recall down, bill up.

> [!IMPORTANT]
> The outlets disagree on how many effort levels exist. Fortune describes low, medium or high [s2], Anthropic's own post references a `max` level [s1], MarkTechPost also references `max` [s4], and CodeRabbit benchmarked a configuration it calls `x-high` [s3]. Treat any complete ladder as unverified. MarkTechPost also reports that thinking is on by default and that disabling it above `high` effort returns a 400 error [s4], the trap a config carried over from Opus 4.8 walks into.

## Impact on your team

If `claude-opus-4-8` sits in a routing config, swapping in `claude-opus-5` [s1] is a price-neutral line change [s1][s4], and that is the trap: it looks free. Sweep effort on your own evals before the swap, because the only independent measurement captured here covers one review harness on one workload [s3]. Budget for an input-token delta rather than parity, the way CodeRabbit measured it on its own workload [s3], and treat every effort value inherited from Opus 4.8 as unset. Fast mode is a separate lever, latency: Anthropic says it runs around 2.5 times the default speed at twice Opus 5's base price [s1]. Nothing is deprecated and no deadline is pushing you, so the useful move this week is that sweep.
