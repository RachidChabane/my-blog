---
translationKey: ai-evaluation-compute-cost
lang: en
slug: evaluation-is-the-new-compute-bottleneck
title: Evaluation is the new compute bottleneck
publishDate: 17-06-2026
tags:
- evaluation
- agents
category: essays
difficulty: 3
sources:
- label: 'Hugging Face: AI evals are becoming the new compute bottleneck'
  url: https://huggingface.co/blog/evaleval/eval-costs-bottleneck
  date: 29-04-2026
- label: Yehudai et al., A Survey on Evaluation of LLM-based Agents (arXiv 2503.16416)
  url: https://arxiv.org/abs/2503.16416
  date: 17-06-2026
contentHash: sha256:ddafaa28e42bdf53
publishState: published
---


Most teams budget training runs to the dollar and treat evaluation as effectively free. Then a single agent sweep on the Holistic Agent Leaderboard runs about $40,000 [s1], and the same task lands 33x cheaper or dearer depending only on scaffold choices [s1]. My take: an agent eval that reports accuracy without a cost column is an incomplete measurement, not merely an under-documented one. The number you publish was produced by a scaffold whose budget moves the result, and leaving that budget out of the table is not a cosmetic omission.

## What a single benchmark run actually costs

The magnitudes are not rounding error. The Holistic Agent Leaderboard spent about $40,000 on a single sweep of 21,730 agent rollouts across 9 models and 9 benchmarks [s1]. One GAIA run on a frontier model can cost $2,829 before any caching [s1]. Put those next to a small fine-tune and they sit in the same budget bracket, which is the whole point: a thorough agentic evaluation is now a compute line item you plan for, not an afterthought you expense. And you pay it again on every rerun: a regression check after a prompt change, a re-evaluation on a newer model, a sweep to tune the scaffold itself, each one drawing from the same budget.

You are not paying for one forward pass per question; you are paying for a scaffold to loop, retry, call tools, and sample across thousands of rollouts, and that loop is where the bill is set. The shape of that loop is usually invisible on the leaderboard, even though it is what the score was bought with.

## Why cost is a property of the result, not a footnote

The same identical tasks show a 33x cost spread across agent configurations [s1]. Change the tool loop, the retry policy, the sampling budget, or the caching, and you change the price by more than an order of magnitude. Often you change the accuracy too. The scaffold is not a delivery detail sitting underneath the number; it is a variable that produces the number, which is what turns a budgeting nuisance into a measurement problem.

Concretely: a best-of-N sampling loop with k tool retries will tend to outscore a single-shot run on a hard benchmark, and it will also cost a large multiple more per task. Report only the score and the two look like the same agent at different skill levels. Report the cost beside it and they read as what they are, one model run under two budgets.

That makes a bare accuracy figure hard to use. If I cannot see your scaffold, I cannot tell whether your score came from a frugal loop or a $2,829 one, and I certainly cannot reproduce it on my budget. A capability number you cannot afford to rerun, or whose configuration you cannot inspect, is not a comparable signal. It is a screenshot. The survey literature reaches the same place from the academic side: current evaluations overlook cost and efficiency and lean on coarse, end-to-end success metrics that gauge overall performance but say little about how the result was produced [s2].

The concrete failure mode is a leaderboard rank that flips under a scaffold swap at equal accuracy. Two agents tie on score; one costs 33x more to get there; the ranking that ignores cost calls them equivalent and ships the wrong default to everyone downstream.

> [!CONFIRMED]
> A single HAL sweep cost about $40,000 across 21,730 rollouts, one GAIA run ran $2,829 before caching, and identical tasks showed a 33x cost spread across configurations [s1].

> [!INFERRED]
> I read that to mean an accuracy number whose scaffold and budget you cannot see is not a comparable signal, because the same task at the same score can differ by more than an order of magnitude in what it cost to produce.

## "That's just measurement hygiene" and "dollars are the wrong unit"

"Report the variable that changes your result" is textbook measurement hygiene; no methodologist disputes it, so dressing it up as a contestable take is close to a tautology. And even granting that cost belongs in the table, dollars are a bad unit. Prices fall, caching policies differ, and self-hosted versus API serving diverges by orders of magnitude, so a dollar figure is a drifting, non-portable proxy for the thing that actually needs disclosing, which is the scaffold and rollout budget.

On hygiene: this is not consensus practice. Major leaderboards still rank on accuracy alone, with cost absent or relegated to prose, and the survey literature has to flag the omission as a gap [s2]. A claim that names current standard practice as incomplete is, by definition, not trivial, however obvious it sounds once stated. On the unit objection: it sharpens the thesis instead of defeating it. The fix is not to crown the dollar as the canonical unit. It is to report a normalized cost alongside its drivers, so the column is reproducible rather than a perishable price snapshot. In my experience the dollar is what a budget conversation actually runs on, and the drivers (tokens, rollouts, caching policy) are what let that figure survive a price change instead of expiring with it.

## What a cost-aware eval looks like in practice

Budget rollouts the way you budget a training run: set the sampling budget before you launch, not after you see the bill. Cache aggressively; the GAIA figure is explicitly the pre-caching number [s1], and caching is the difference between a sweep you can repeat and one you run once and screenshot. Then report cost as a first-class column beside accuracy, normalized to its drivers.

| Eval report | Accuracy | Cost | Drivers disclosed |
| :--- | :---: | :---: | :--- |
| Accuracy-only | published | absent | none |
| Cost-aware | published | normalized | tokens / rollouts / samples, scaffold config, caching policy |

Log tokens in and out, tool-call count, retries, and cache hits per rollout, then aggregate those beside the score in the same run. The cost column then has the same provenance as the accuracy column instead of being reconstructed from a cloud invoice three weeks later, and the marginal engineering is a counter on the loop that already produces the answer. The drivers column is the part that makes the figure reproducible: tokens and rollouts and samples are portable across price regimes where a raw dollar figure is not, and the scaffold config plus caching policy let someone else hit your number or explain why they cannot.

When I read a new leaderboard now, the first thing I look for is the cost column. If it is absent, I treat the ranking as unpriced until someone shows me what it took to produce, the same way I would not trust a training result quoted with no compute budget attached.
