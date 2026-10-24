---
translationKey: kimi-k3-1-pro-terminal-bench-4-vendor-table-below-independent-score
lang: en
slug: kimi-k3-1-pro-terminal-bench-4-vendor-table-below-independent-score
title: Kimi's own table puts K3.1 Pro behind Claude Opus 5.5 on Terminal-Bench 4.0,
  and Artificial Analysis scores it highest of any model at 67%
publishDate: 23-10-2026
kind: release
tags:
- Kimi K3.1 Pro
- Terminal-Bench
- evals
summary: 'Kimi released Kimi K3.1 Pro, a post-trained version of Kimi K3, on its apps
  and the Kimi API, and says the full weights will be released by Nov 4, 2026. Kimi''s
  own table puts it at 65.7% on Terminal-Bench 4.0, narrowly behind Claude Opus 5.5
  (66.4%), with the other scores taken at the maximum value reported; Artificial Analysis,
  in its October 23, 2026 analysis, scores it 67%, the highest of any model. My call:
  rank on the outside evaluator''s column, and test kimi-k3.1-pro in your own harness.'
sources:
- label: 'Kimi, Kimi K3.1 Pro Tech Blog: Advancing Open Intelligence'
  url: https://www.kimi.ai/blog/kimi-k3-1-pro
  date: 24-10-2026
- label: Artificial Analysis, Kimi K3.1 Pro launches at 4th on the Intelligence Index
    and will lead open weights models
  url: https://artificialanalysis.ai/articles/kimi-k3-1-pro-launch-benchmarks
  date: 23-10-2026
contentHash: sha256:4dbd29c2a4b05bfb
publishState: published
---

## What changed

Kimi released Kimi K3.1 Pro, a post-trained version of Kimi K3 with a 1-million-token context window, on Kimi.ai, Kimi Work, Kimi Code and the Kimi API [s1]. Artificial Analysis published its launch analysis on October 23, 2026 and puts the model at 55 on its Intelligence Index, behind Claude Opus 5.5 at 58 [s2]. Kimi says the full model weights will be released by Nov 4, 2026 [s1].

## Two tables, two methods

On Terminal-Bench 4.0, the vendor ranks its own model lower than the outside evaluator does:

| Who scored it | K3.1 Pro | Rivals shown | Where the rival figures come from |
| :--- | ---: | :--- | :--- |
| Kimi [s1] | 65.7% | Claude Opus 5.5 66.4%, GPT-6 Astra 58.2% | the maximum value reported in their blog posts or the official leaderboard |
| Artificial Analysis [s2] | 67% | Claude Sonnet 5.5 64%, Kimi K3 13% | highest score of any model, per Artificial Analysis |

> [!CONFIRMED]
> Kimi evaluated K3.1 Pro with the Claude-Code harness and took all remaining scores as the maximum value reported in either their blog posts or the official Terminal-Bench 4.0 leaderboard [s1].

> [!INFERRED]
> My reading: a rival column built from each competitor's best reported figure measures their best day, so here the vendor table is the conservative one. To shortlist a coding-agent model, I would rank on the column where one outside evaluator produced every number.

## The strongest objection

Three scores this close on one benchmark are noise, and reading a ranking into them is the mistake. On the ranking I agree: I would not claim K3.1 Pro beats Claude Opus 5.5. What survives the noise is the method and the breadth: on the broader Intelligence Index, Artificial Analysis still has the model behind Claude Opus 5.5, Claude Sonnet 5.5 and Muse Wonder Full [s2]. I think its case is terminal-heavy agent work, and little beyond it.

## Impact on your team

For terminal-heavy coding agents, put `kimi-k3.1-pro` on the shortlist this week and run it through the Kimi API inside your own harness, on your own tasks [s1]. Kimi's 65.7% came from the Claude-Code harness, so your harness is exactly the variable that figure does not cover [s1]. Artificial Analysis gives pricing of $2/$10/$0.20 per 1M input/output/cache hit tokens, 33% lower than Kimi K3 on all three rates [s2]. Kimi Enterprise access is off by default at launch [s1]. For vulnerability research, read Kimi's own note: it removed cyber-related data from both training stages for the open-weight release, and on its in-house xdev-bench-hard a checkpoint without those measures solves 90.5% of problems at pass@3 against 81.0% for the final K3.1 Pro [s1]. My call: plan no self-hosting until the weights are out; Artificial Analysis lists them as currently not published [s2].
