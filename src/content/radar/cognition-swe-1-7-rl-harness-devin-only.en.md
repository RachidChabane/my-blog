---
translationKey: cognition-swe-1-7-rl-harness
lang: en
slug: cognition-swe-1-7-rl-harness-devin-only
title: 'Cognition''s SWE-1.7: the moat moved from the base weights to the RL harness,
  and it ships only inside Devin'
publishDate: 14-07-2026
kind: release
tags:
- Cognition
- Devin
- SWE-1.7
- agents
- coding
summary: 'On 08-07-2026 Cognition shipped SWE-1.7: near-frontier agentic coding whose
  gains came from a second RL pass on a Kimi K2.7 base, not a new base, and it runs
  only inside Devin.'
sources:
- label: 'Cognition blog - SWE-1.7: Frontier Intelligence at a Fraction of the Cost'
  url: https://cognition.com/blog/swe-1-7
  date: 08-07-2026
- label: VKTR - Cognition Ships SWE-1.7 Coding Model Into Devin Via Cerebras
  url: https://www.vktr.com/ai-news/cognition-debuts-swe17-coding-model-in-devin/
  date: 09-07-2026
- label: WinBuzzer - Cognition Launches SWE-1.7 in Devin, Near-Frontier Coding at
    a Discount
  url: https://winbuzzer.com/2026/07/09/cognition-swe-17-adds-near-frontier-coding-scores-to-devin-xcxwbn/
  date: 09-07-2026
contentHash: sha256:848366af52d278b4
publishState: published
---

## What changed

On 08-07-2026 Cognition shipped SWE-1.7, an agentic coding model that lands within a few points of the closed frontier on software-engineering benchmarks [s1]. The lineage is the interesting part: it was trained from a Kimi K2.7 base that had already gone through extensive RL post-training, then Cognition ran its own additional RL on top [s1][s2]. It is available today only inside Devin (Web, Desktop, and CLI), served via Cerebras at 1000 tokens per second [s1][s2].

## The moat moved to the RL harness

The value here did not come from a new base model. Cognition trained SWE-1.7 from a Kimi K2.7 base that was already RL-heavy, and its second RL pass still bought large gains, which the team reads as evidence against a "post-training ceiling" [s1]. For any team that cannot afford to pre-train, that is the load-bearing signal: returns still live in the harness and the post-training, not only in the weights.

Keep the scores honest [s1]:

| Benchmark               | SWE-1.7 | GPT-5.5 | Opus 4.8 |
| :---                    |    ---: |    ---: |     ---: |
| FrontierCode 1.1 Main   |   42.3% |   43.0% |    46.5% |
| Terminal-Bench 2.1      |   81.5% |   84.2% |    86.9% |
| SWE-Bench Multilingual  |   77.8% |   76.8% |    84.4% |

This is near-frontier, not frontier. SWE-1.7 trails both GPT-5.5 and Opus 4.8 on FrontierCode Main and Terminal-Bench, and only edges GPT-5.5 on SWE-Bench Multilingual (77.8% versus 76.8%). The pitch is cost and 1000-TPS throughput on the Pareto curve, not a new capability crown.

> [!IMPORTANT]
> SWE-1.7 runs only inside the Devin harness; no standalone SWE-1.7 API surfaced at launch [s1][s2]. The "fraction of the cost" line is real only if your workflow is already Devin. If you want a callable low-cost coding model for your own orchestration, there is nothing to wire up here yet.

## Impact on your team

If you are choosing a cheap coding model to drop into your own agent stack, SWE-1.7 gives you nothing today: it is Devin-only, with no API to call [s1][s2]. If you already run Devin, the decision is a dollars-per-task and throughput trade on the Pareto curve, not a capability upgrade, since it still trails Opus 4.8 and GPT-5.5 on two of three benchmarks [s1].

The result worth watching is the method, not the model. The cheapest path to near-frontier agentic coding this cycle was a second RL pass on someone else's open base plus a proprietary harness, not a fresh pre-train [s1]. Until a callable API shows up, treat the cost story as Devin-internal economics rather than your invoice, and hold any bake-off in your own stack.
