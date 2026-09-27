---
translationKey: gpt-6-luna-automationbench-up-coding-agent-index-down
lang: en
slug: gpt-6-sol-luna-price-cut-coding-agent-split
title: GPT-6 Sol and Luna halve GPT-5.6 promotional prices, and Artificial Analysis
  measures Luna at max 2 points lower on its Coding Agent Index
publishDate: 27-09-2026
kind: release
tags:
- OpenAI
- GPT-6
- agents
- evals
summary: OpenAI's GPT-6 Sol and Luna cost half their GPT-5.6 promotional prices. At
  max, Artificial Analysis measures Sol up 2 points on its Coding Agent Index and
  Luna down 2, so I would move coding agents on GPT-5.6 Sol to GPT-6 Sol now and route
  Luna by workload, before the 25% GPT-5.6 price increase Simon Willison reports for
  November.
sources:
- label: OpenAI, "Introducing GPT-6 Sol and Luna"
  url: https://openai.com/index/introducing-gpt-6-sol-and-luna/
  date: 22-09-2026
- label: Artificial Analysis, "GPT-6 Sol and Luna push the cost efficiency frontier"
  url: https://artificialanalysis.ai/articles/gpt-6-sol-and-luna-push-the-cost-efficiency-frontier
  date: 22-09-2026
- label: Simon Willison, "Claude Opus 5.5, GPT-6 Sol, GPT-6 Luna, and a new price
    war"
  url: https://simonwillison.net/2026/Sep/22/opus-and-sol-and-luna/
  date: 22-09-2026
contentHash: sha256:abcba9ff0004da2c
publishState: published
---

## What changed

OpenAI released GPT-6 Sol and GPT-6 Luna on September 22, 2026 [s2][s3], in the API as `gpt-6-sol` and `gpt-6-luna` [s1]. OpenAI calls it a 50% cut from GPT-5.6 promotional pricing: Sol falls from $4 to $2 per million input tokens and from $20 to $10 per million output tokens, Luna from $0.20 to $0.10 and from $1.20 to $0.50 [s1]. Artificial Analysis finds both level with GPT-5.6 on its Intelligence Index, with progress in some evaluations and regressions in others [s2].

## Where Sol and Luna split

| GPT-6 vs GPT-5.6 (Artificial Analysis) | Sol | Luna |
| :--- | ---: | ---: |
| Coding Agent Index, max [s2] | 57 (+2) | 41 (-2) |
| SWE-Atlas-QnA, max [s2] | 58% vs 54% | 44% vs 49% |
| AutomationBench-AA [s2] | 62% vs 60% | 53% vs 50% |
| Cost per Intelligence Index task, max [s2] | $1.06 vs $1.99 | $0.07 vs $0.18 |

For coding agents, Sol at max is the easy upgrade. In OpenAI's Codex harness it scores 57 on the Coding Agent Index, up 2 points, at $2.99 per task on that index, about 50% less than GPT-5.6 Sol at max [s2].

Luna is a routing decision. OpenAI says that at high effort it improves on its predecessor by 5.4 percentage points on AutomationBench [s1]. Artificial Analysis also measures a gain on its own AutomationBench-AA [s2]. On coding it slips: at max, 41 on the Coding Agent Index, 2 points below GPT-5.6 Luna at max, with lower SWE-Atlas-QnA and DeepSWE v1.1 scores [s2]. On the Intelligence Index, its lower cost per task is driven by the price cut: at max it spends more output tokens per task than GPT-5.6 Luna, 51k against 41k [s2].

Both models regress on GDPval-AA v2.1 at max effort, which Artificial Analysis ties to shorter deliverables that more often omit required elements [s2]. I think this is the failure mode to test before any swap: a report or spec generator that reads fine in a spot check and ships with a required section missing.

## Impact on your team

Simon Willison notes that GPT-5.6 has a scheduled 25% price increase for November [s3]. In my view that settles the Luna question for coding agents: holding on to GPT-5.6 Luna to dodge the 2-point dip already costs more per task at max, and will cost more again after November. The trade left is Luna's lower bill against Sol's higher Coding Agent Index score at max.

My call: move coding agents that run on GPT-5.6 Sol to `gpt-6-sol` now. Point `gpt-6-luna` at workflow automation and query tools first. Willison has moved his Datasette Agent demo to GPT-6 Luna and writes that it seems fast and competent at SQL queries [s3]. For jobs that produce deliverables, add an eval that checks every required element is present before Luna or Sol takes over, and finish it before November.
