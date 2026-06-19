---
lang: en
translationKey: agent-pass-at-1-long-horizon-reliability
slug: pass-at-1-is-blind-to-long-horizon-reliability
title: "Your agent's pass@1 score is blind to long-horizon reliability"
tags: [agents, evaluation]
category: essays
difficulty: 3
---

Select an agent for long autonomous work by its pass@1 score and you optimize the wrong number: capability and reliability match at horizon one but diverge as the horizon grows, so a short-task leader can rank among the least reliable on a long job. The cost is measurable, not rhetorical. In one enterprise simulation spanning 23 LLMs and four agent frameworks, only 15.4% of trials survive the full horizon [s2], and larger models do not reliably beat smaller ones. A pass@1 leaderboard cannot show you that, because it never samples the variable that decides the outcome.

The defense of pass@1 is that it is cheap and honest: it asks whether a model can produce a correct output once on a bounded task, and for a single completion, one tool call, or a RAG answer it predicts what users feel. I am not arguing against that. I am arguing that the moment your agent runs unattended across many steps, the number you trusted stops ranking the models you care about, and the leaderboard gives you no warning.

## Why pass@1 and reliability diverge

Capability and reliability are two different properties, and they come apart systematically as task duration grows; pass@1 on short tasks is structurally blind to that divergence [s1]. The mechanism is multiplication, not mystery. Per-step competence compounds over a trajectory, so a small gap in per-step error rate that is invisible at length one dominates at length fifty. The failure modes that decide long jobs, error accumulation, context drift, a botched recovery, corrupted tool state, are barely sampled by a task that ends after one step.

At horizon one, capability and reliability are the same quantity, which is exactly why a short-task score feels trustworthy. The achievable task length is itself a function of the reliability bar you demand, and an independent longitudinal measurement makes that concrete: the task length frontier model agents complete autonomously at 50% reliability has been doubling roughly every 7 months [s4]. Read that the other way and the point is sharp. Hold the reliability bar higher than 50% and the length you can trust shrinks; the horizon is not a fixed property of the model, it is a function of how reliable you need it to be, and a single pass@1 fixes the reliability bar at "once" without telling you so.

## The measured cost

The clearest evidence is not a thought experiment. In an enterprise resource-allocation simulation run across 23 LLMs and four agent frameworks, only 15.4% of trials survive the full horizon, larger models do not reliably outperform smaller ones, and failures cascade across observation, action timing, and capital sizing [s2]. The headline is the survival rate, but the load-bearing detail is the second clause: size, the axis most leaderboards are sorted by, does not buy reliability here.

> [!CONFIRMED]
> Across 23 LLMs and four agent frameworks, only 15.4% of trials survive the full horizon, and larger models do not reliably outperform smaller ones [s2].
>
> [!INFERRED]
> I read the survival collapse plus the absence of any size benefit to mean a pass@1 leaderboard can seat a fragile model in first place: the property that decides a long job is the one a short-task score never measures.

If reliability tracked capability, the bigger models would survive longer and a capability score would be a usable proxy. They do not, so the proxy breaks precisely where you need it. This is the rank inversion the thesis predicts: not "long jobs are harder" (everyone knows that), but that the order of models can change when you switch the metric from one-shot capability to survival over a horizon.

## Structural, not bad luck

A natural retreat is to call the survival rate a tail of bad luck, an artifact of one hard benchmark. The diagnostic record says otherwise. A study collecting more than 3100 trajectories across four representative agentic domains characterizes horizon-dependent degradation patterns [s3], which means the breakage has a shape: it recurs across domains, it tracks horizon length, and it can be located rather than shrugged off. A failure you can diagnose is structural by definition, not a roll of the dice you can average away with more samples of a short task.

That matters for what you do next. If degradation were noise, the fix would be variance reduction. Because it is structural and horizon-dependent, the fix is to measure along the axis it lives on, which is horizon length.

## The steelman, and the answer

The strongest objection is not that the thesis is false but that its bite is narrow. pass@1 is cheap, and for the modal workload, a bounded task where horizon one is the whole job, capability and reliability are the same number, so a short-task score correlates with what users experience. On that reading the prescription "report a curve, not a number" lands only on long-horizon autonomy teams, who already run end-to-end evals and already distrust a single score. For everyone else the curve is expensive to produce and adds little, so the claim looks either trivial (long jobs are harder) or overreaching (short-task leaderboards are fine for what they measure).

That objection concedes the load-bearing premise. It grants that capability and reliability coincide at horizon one and diverge as length grows; granting that is granting the thesis, and the remaining dispute is about how wide the affected audience is, not whether the effect is real. The triviality charge fails too, because the claim is falsifiable beyond "long jobs are harder": it predicts that model rank order changes with horizon, that a pass@1 leader can lose on survival. Monotone difficulty does not imply rank inversion; inversion is a contingent fact that could have come out false. The survival collapse with no size benefit [s2] and the multi-domain degradation record [s3] are exactly the evidence that it did not. The honest residue is the scope boundary, and the claim should carry it out loud rather than imply short-task scores are broadly invalid.

## What to do

Scope the rule honestly. If you ship bounded short tasks, a short-task score is fine and a curve is wasted effort. The moment your horizon is long enough that per-step errors compound, select on a reliability-over-horizon curve, with named failure modes, and treat a bare pass@1 as silent about long-horizon behavior rather than reassuring.

| Dimension | pass@1 on short tasks | Reliability-over-horizon curve |
| :--- | :--- | :--- |
| What it measures | one-shot success at horizon one | survival as the horizon grows |
| Horizon sampled | a single short length | a range of lengths |
| Predicts long-job survival | no | yes |

The curve is not exotic: run the agent at several horizon lengths, fix a reliability bar, and report the length it sustains at that bar, plus the failure modes that end the runs. That is more work than copying a number off a leaderboard. It is also the only artifact that ranks the models the way your production workload will.

> [!WARNING]
> A single pass@1 number is silent about long-horizon behavior, not evidence of it. Choosing the higher of two pass@1 scores for a long autonomous job means choosing on a metric that does not sample the horizon you are buying.
