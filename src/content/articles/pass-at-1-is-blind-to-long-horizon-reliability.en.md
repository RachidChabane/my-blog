---
translationKey: agent-pass-at-1-long-horizon-reliability
lang: en
slug: pass-at-1-is-blind-to-long-horizon-reliability
title: Your agent's pass@1 score is blind to long-horizon reliability
publishDate: 19-06-2026
tags:
- agents
- evaluation
category: essays
difficulty: 3
sources:
- label: 'Beyond pass@1: A Reliability Science Framework for Long-Horizon LLM Agents
    (arXiv:2603.29231)'
  url: https://arxiv.org/abs/2603.29231
  date: 31-03-2026
- label: Can LLM Agents Be CFOs? Benchmarking Long-Horizon Resource Allocation in
    an Uncertain Enterprise Environment (arXiv:2603.23638)
  url: https://arxiv.org/abs/2603.23638
  date: 24-03-2026
- label: The Long-Horizon Task Mirage? Diagnosing Where and Why Agentic Systems Break
    (arXiv:2604.11978)
  url: https://arxiv.org/abs/2604.11978
  date: 19-06-2026
- label: Measuring AI Ability to Complete Long Tasks (METR)
  url: https://metr.org/blog/2025-03-19-measuring-ai-ability-to-complete-long-tasks/
  date: 19-03-2025
contentHash: sha256:7ae019bd645e0122
publishState: published
---


Select an agent for long autonomous work by its pass@1 score and you optimize the wrong number: capability and reliability match at horizon one but diverge as the horizon grows, so a short-task leader can rank among the least reliable on a long job. The cost is measurable, not rhetorical. In one enterprise simulation spanning 23 LLMs and four agent frameworks, only 15.4% of trials survive the full horizon [s2], and larger models do not reliably beat smaller ones. A pass@1 leaderboard cannot show you that, because it never samples the variable that decides the outcome.

The defense of pass@1 is that it is cheap and honest: it asks whether a model can produce a correct output once on a bounded task, and for a single completion, one tool call, or a RAG answer it predicts what users feel. I am not arguing against that. I am arguing that the moment your agent runs unattended across many steps, the number you trusted stops ranking the models you care about, and the leaderboard gives you no warning.

## Why pass@1 and reliability diverge

The mechanism is multiplication. Per-step competence compounds over a trajectory, so a small gap in per-step error rate that is invisible at length one dominates at length fifty. That compounding is why capability and reliability, a single property at horizon one, come apart as duration grows, and why pass@1 on short tasks is structurally blind to the divergence [s1]. And the failure modes that end long jobs, error accumulation and context drift, are the ones a task that stops after one step never samples.

The achievable task length is itself a function of the reliability bar you demand, and an independent longitudinal measurement makes that concrete: the task length frontier model agents complete autonomously at 50% reliability has been doubling roughly every 7 months [s4]. Read that the other way and the point is sharp. Hold the reliability bar higher than 50% and the length you can trust shrinks; the horizon is not a fixed property of the model, it is a function of how reliable you need it to be, and a single pass@1 fixes the reliability bar at "once" without telling you so.

## The measured cost

In an enterprise resource-allocation simulation run across 23 LLMs and four agent frameworks, only 15.4% of trials survive the full horizon, larger models do not reliably outperform smaller ones, and failures cascade across observation, action timing, and capital sizing [s2]. The headline is the survival rate, but the load-bearing detail is the second clause: size, the axis most leaderboards are sorted by, does not buy reliability here.

> [!CONFIRMED]
> Across 23 LLMs and four agent frameworks, only 15.4% of trials survive the full horizon, and larger models do not reliably outperform smaller ones [s2].
>
> [!INFERRED]
> I read the survival collapse plus the absence of any size benefit to mean a pass@1 leaderboard can seat a fragile model in first place: the property that decides a long job is the one a short-task score never measures.

If reliability tracked capability, the bigger models would survive longer; they do not, so the proxy breaks precisely where you need it. This is the rank inversion the data shows: not "long jobs are harder" (everyone knows that), but that the order of models can change when you switch the metric from one-shot capability to survival over a horizon.

## Structural, not bad luck

A natural retreat is to call the survival rate a tail of bad luck, an artifact of one hard benchmark. The diagnostic record says otherwise. A study collecting more than 3100 trajectories across four representative agentic domains characterizes horizon-dependent degradation patterns [s3], which means the breakage has a shape: it recurs across domains, it tracks horizon length, and it can be located rather than shrugged off. If degradation were noise, the fix would be variance reduction. Because it is structural and horizon-dependent, the fix is to measure along the axis it lives on, which is horizon length.

## The steelman, and the answer

The strongest objection is not that the thesis is false but that its bite is narrow. pass@1 is cheap, and for the modal workload, a bounded task where horizon one is the whole job, capability and reliability are the same number, so a short-task score correlates with what users experience. On that reading the prescription "report a curve, not a number" lands only on long-horizon autonomy teams, who already run end-to-end evals and already distrust a single score. For everyone else the curve is expensive to produce and adds little, so the claim looks either trivial (long jobs are harder) or overreaching (short-task leaderboards are fine for what they measure).

That objection grants the core claim. It accepts that capability and reliability coincide at horizon one and diverge as length grows, so the remaining dispute is about how wide the affected audience is, not whether the effect is real. The triviality charge fails because the claim is falsifiable beyond "long jobs are harder": it predicts that model rank order changes with horizon, that a pass@1 leader can lose on survival, and monotone difficulty alone does not predict that. The survival collapse with no size benefit [s2] and the multi-domain degradation record [s3] are exactly the evidence that the inversion is real. The scope limit is real too: the argument applies to long-horizon autonomy workloads, not bounded tasks, and the claim should say so rather than imply short-task scores are broadly invalid.

## What to do

If you ship bounded short tasks, a short-task score is fine and a curve is wasted effort. The moment your horizon is long enough that per-step errors compound, select on a reliability-over-horizon curve, with named failure modes, and treat a bare pass@1 as silent about long-horizon behavior rather than reassuring.

| Dimension | pass@1 on short tasks | Reliability-over-horizon curve |
| :--- | :--- | :--- |
| What it measures | one-shot success at horizon one | survival as the horizon grows |
| Horizon sampled | a single short length | a range of lengths |
| Predicts long-job survival | no | yes |

The curve is not exotic: run the agent at several horizon lengths, fix a reliability bar, and report the length it sustains at that bar, plus the failure modes that end the runs. It also surfaces the crossover a leaderboard hides, the horizon past which a cheaper model that holds its reliability overtakes a pricier one that degrades, which is the comparison procurement actually needs. That is more work than copying a number off a leaderboard, and it is the only artifact that ranks the models the way your production workload will.

> [!WARNING]
> A single pass@1 number is silent about long-horizon behavior, not evidence of it. Choosing the higher of two pass@1 scores for a long autonomous job means choosing on a metric that does not sample the horizon you are buying.
