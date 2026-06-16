---
translationKey: slopcodebench-iterative-maintainability
lang: en
slug: agents-erode-the-code-they-keep-editing
title: Agents Erode the Code They Keep Editing
publishDate: 16-06-2026
tags:
- agents
- benchmarks
- ai-assisted-coding
category: essays
difficulty: 3
sources:
- label: 'SlopCodeBench: Benchmarking How Coding Agents Degrade Over Long-Horizon
    Iterative Tasks (arXiv 2603.24755)'
  url: https://arxiv.org/abs/2603.24755
  date: 25-03-2026
- label: GitClear, AI Copilot Code Quality 2025 Research
  url: https://www.gitclear.com/ai_assistant_code_quality_2025_research
  date: 16-06-2026
contentHash: sha256:73f0947815d73d79
publishState: published
---


Single-shot pass@1 and iterative maintainability measure different things, and on the axis that mirrors real software work, today's strongest coding agents are weak and get weaker on their own code. The best one passes only 14.8% of an extend-your-own-solution benchmark's checkpoints [s1], and that failure is invisible to the leaderboard most teams trust.

## The single-shot mirage

Coding agents are sold on one number: pass@1 on an isolated issue, one problem in, one patch out. That number answers a narrow question: can the agent produce one passing patch against a fresh task? On that question the headline scores now crowd the top of the chart. The work those scores are used to justify is different in kind. You do not hand an agent one sealed ticket and walk away; you let it extend code it already wrote, then extend that, and the decision that actually matters is how much autonomy you grant it over a living codebase. A leaderboard built from sealed tickets measures the easy case and stays silent on the one that decides the question.

The whole pitch for agentic coding is sustained, multi-step work, and every step after the first lands on top of the agent's own prior output. If quality moves as the agent iterates on its own code, a metric that only ever sees the first step is measuring the wrong thing for the decision it is being used to make.

## What SlopCodeBench measures

SlopCodeBench is built to break that silence. It runs 36 problems across 196 checkpoints where agents repeatedly extend their own solutions, so the harness scores the loop teams actually run rather than a one-shot snapshot [s1]. Evaluated across 15 coding agents spanning open and closed models, the result is blunt: no agent fully solves any problem end to end, and the best passes only 14.8% of checkpoints [s1]. Read that against the near-saturated pass@1 headlines and the gap is the whole point. The same models that look finished on single issues fall apart once the task is to keep building on what they just shipped.

The checkpoint loop is what produces this result. Rather than scoring one patch against one fixed task, the benchmark feeds the agent its own previous solution and asks it to go further, checkpoint after checkpoint. That single loop is enough to expose the gap between starting a problem and sustaining it.

## The compounding failure mode

The failure is not a wrong answer on a hard problem; it is slow rot. SlopCodeBench tracks two forms of degradation as the agent works: structural erosion, where complexity concentrates into a few overloaded spots, and verbosity, where redundant code accumulates. Both climb across checkpoints: structural erosion rises in 77% of trajectories and verbosity in 75.5% [s1]. The longer the agent edits its own output, the worse the shape of that output gets.

That trend means the tenth self-edit costs more to review than the first, not less, and it is the kind of damage that is easy to miss. Each individual diff can look reasonable; the rot is in the accumulation, in the file that keeps growing a new branch instead of a refactor, in the helper that gets copied rather than shared. That is exactly the trend a single patch can never reveal.

## Agents versus human repositories

All code degrades; entropy is not an agent problem, so a degradation curve on its own proves little. The human baseline is what makes the degradation specific to how these agents build rather than a property of software in general. Measured against 473 open-source Python repositories, agent code is 2.3x more verbose and 2.0x more eroded, and the human repositories degrade less often and by smaller margins across their git histories [s1].

That comparison is the spine of the causal argument. It rules out the "all code rots" null: humans editing real projects over real histories rot slower and shallower than agents editing their own output. The gap between agent and human degradation is the thing an autonomy decision should price in.

## The steelman, answered

Here is the strongest case against the take, and it is a fair one. Pass@1 on isolated issues is not a trick; plenty of real work genuinely is one-shot. A bug ticket, a small feature, a self-contained refactor handed to an agent and reviewed by a human is a single-patch task, and a benchmark that scores single patches is a fair proxy for it. By that reading single-shot leaderboards are not misleading at all; they measure a real and common mode of use, and the iterative benchmark is just a harder, narrower test that most production tasks never reach.

The iterative failure mode is invisible to a single-shot eval by construction, because erosion and verbosity only appear once the agent edits its own prior output, and a pass@1 harness never asks it to. The quality that compounds downward is precisely the quality a single patch cannot exhibit. That is why the two metrics cannot substitute for each other: a high single-shot score tells you the agent can land one good patch, and tells you nothing about what its tenth edit does to the code around it. For the one-shot ticket, pass@1 is fine. For sustained autonomy, it is the wrong instrument pointed at the wrong axis.

## Independent, observational corroboration

A second, weaker leg points the same way. GitClear's analysis of real-world git histories finds the refactoring share of changed lines fell from 25% in 2021 to under 10% in 2024, while cloned (copy/pasted) lines rose from 8.3% to 12.3% [s2]. Less restructuring, more duplication: the same drift SlopCodeBench produces under controlled conditions, now visible in production repositories over the window AI assistants went mainstream.

I treat this as consistent with the thesis, not proof of it. The signal is observational and cannot isolate agent authorship; the same years carry hiring slumps, velocity pressure, and shifting team composition, any of which dents refactoring discipline on its own. The controlled, human-baselined comparison in SlopCodeBench carries the causal weight. GitClear corroborates that the lab result is not a benchmark artifact.

> [!CONFIRMED]
> Against 473 human Python repositories, agent code is 2.0x more eroded and 2.3x more verbose, and the human repos degrade less often and by smaller margins [s1].

> [!INFERRED]
> In my experience that gap is the tell that matters for autonomy: the risk is not a bad first patch, which review catches, but a slow structural drift across the agent's own edits that no single diff looks bad enough to stop.

## A calibrated verdict

The bounded conclusion is narrower than the leaderboard implies and sharper than "agents are bad." An agent that cannot land one good patch is disqualified; one that can has cleared only the easy bar, not the one that decides autonomy. The gate that is missing is measured maintainability across many sequential self-edits, the axis SlopCodeBench scores and the one pass@1 cannot see.

> [!WARNING]
> Do not grant an agent sustained autonomy over a codebase on the strength of a pass@1 number alone. That number is silent on the failure mode that decides the outcome.

When you hand an agent a long-horizon task, track the trend across its own edits, not the quality of the first patch. Is complexity concentrating into a few files it keeps reopening? Is it pasting variants instead of refactoring the shared path? Those are the early shape of the 77% and 75.5% curves [s1], and they show up at edit number ten, not edit number one. Gate on that, and pass@1 goes back to being what it always was: a real but partial signal, not a license for autonomy.
