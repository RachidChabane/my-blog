---
translationKey: relay-bench-multi-domain-chains
lang: en
slug: relay-bench-composite-prompts-gpt-5-5
title: Relay-Bench holds GPT-5.5 at 43.3% by chaining subtasks into one prompt
publishDate: 26-07-2026
kind: benchmark
tags:
- Relay-Bench
- GPT-5.5
- evals
- agents
summary: Relay-Bench was posted to arXiv on 20-07-2026 with a test set made only of
  composite items, two to thirteen single-domain subproblems chained into one prompt,
  and its leading model, GPT-5.5 at xHigh effort, scores 43.3%.
sources:
- label: 'Primary - arXiv, Relay-Bench: Evaluating LLMs on Multi-Domain Reasoning
    Chains'
  url: https://arxiv.org/abs/2607.18438
  date: 20-07-2026
- label: Independent corroboration - Zaikei Shimbun, Japanese trade outlet reporting
    the paper
  url: https://www.zaikei.co.jp/article/20260723/862514.html
  date: 23-07-2026
contentHash: sha256:ff0b7bed1bfbc193
publishState: published
---

## What changed

Relay-Bench went up on arXiv on 20 July 2026, posted by Liam Swayne against benchmark saturation [s1][s2]. Its author calls it an "unsaturated, holistic, text-only benchmark" [s1]. The item shape is the interesting part: the test set consists entirely of composite problems, two to thirteen single-domain subproblems strung into one prompt, with further layers added through prompt encoding and deliberate context bloat [s1]. Domains span visual reasoning, coding, math, web-search-heavy information extraction, problem-solving, general knowledge and data analysis, and the harness restricts nothing; code execution, web search and every available tool are explicitly encouraged [s1]. GPT-5.5 at xHigh effort leads at 43.3% [s1][s2].

## The number to compare it against

That 43.3% only takes on meaning next to what the same model, GPT-5.5 at xHigh, scores when the work arrives one task at a time. Zaikei Shimbun set up exactly that comparison when it covered the paper on 23 July [s2].

| Benchmark | Score | Reported by |
| :--- | ---: | :--- |
| Relay-Bench | 43.3% | the paper [s1][s2] |
| Terminal-Bench 2.0 | 82.7% | Zaikei Shimbun [s2] |
| FrontierMath Tiers 1 to 3 | 51.7% | Zaikei Shimbun [s2] |

I read that spread as a fact about task shape rather than about raw capability. The model that clears a terminal-agent benchmark is the same model that stalls once its own step three becomes step four's premise. That reading is mine; neither source names a mechanism.

## What this changes in an eval suite

Teams copy per-capability suites because vendors publish them and they are cheap to assemble. They measure a model doing one thing with a clean context, which is not the shape anything you ship actually runs in. The fix is not a bigger suite. Add one composite item: three or four of your real subtasks chained into a single prompt, scored end to end, pass or fail on the final answer only. Per-step accuracy will look healthy while that item fails; that gap is the number worth tracking.

> [!IMPORTANT]
> This is a single-author preprint at v1, with one reported headline score, no captured independent replication and no peer review. Read it as evidence about how to design an eval, not as a leaderboard to optimise against.

## Impact on your team

If your agent is gated on a per-step accuracy target today, that gate is the thing to change this quarter, before the next model upgrade decision. Two concrete moves: one composite end-to-end item in the suite, and a verification checkpoint between chained steps so a wrong intermediate result never becomes the premise of the next one. What to ignore: 43.3% as a model-ranking signal. One preprint, one author and one score rank nothing.
