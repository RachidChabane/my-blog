---
translationKey: coding-agent-scaffold-confound
lang: en
slug: scaffold-not-model-swe-bench-score
title: The scaffold, not the model, decides your SWE-bench score
publishDate: 18-06-2026
tags:
- evaluation
- agentic-coding
- agents
category: essays
difficulty: 3
sources:
- label: 'Inside the Scaffold: A Source-Code Taxonomy of Coding Agent Architectures
    (arXiv:2604.03515)'
  url: https://arxiv.org/abs/2604.03515
  date: 03-04-2026
- label: 'SWE-bench in 2026: Benchmarks vs Scaffolding Reality (Digital Applied)'
  url: https://www.digitalapplied.com/blog/swe-bench-verified-june-2026-benchmark-vs-scaffolding-analysis
  date: 16-06-2026
contentHash: sha256:357170b5576860a0
publishState: published
---


Most teams read a SWE-bench number off a leaderboard and treat it as a property of the model, but for the comparison that actually drives procurement, choosing between adjacent near-frontier coding models, that number does not identify the ranking. The reason is concrete: three different agent systems each ran the same Claude Opus 4.5 against SWE-bench Pro and produced scores from 50.2% to 55.4% [s2]. The model never changed; only the scaffold around it did. I think that spread, just over five points with the model held fixed, is the single most under-reported fact in agent evaluation, because on a near-peer leaderboard it is the same size as the gap you are trying to read between two rows.

For coarse capability sorting, a frontier model against a two-year-old one, the model signal dominates and a bare number ranks them correctly. That is not the decision a team makes when it has already shortlisted three current models whose self-reported scores sit within a few points of each other. That is the decision this essay is about, and in that regime a model-name-only number is noise.

## The same model, a five-point spread

Someone already ran the cleanest possible version of this experiment, three systems on one pinned Claude Opus 4.5 [s2], so the only open question is what produced the spread. Nothing in the model's weights moved. What moved was the control loop, the tool set the model was allowed to call, and how each system compacted context when the task outgrew the window.

A swing of that size is not a rounding artifact. On a leaderboard where current coding models cluster, two adjacent rows are often separated by less than five points. So the harness variance, measured here with the model pinned, is comparable to or larger than the between-model gap a buyer is trying to resolve. When the noise on a single measurement is as wide as the signal you want from comparing two measurements, the ranking those two rows imply is not identifiable. You cannot tell whether row A beats row B because its model is better or because someone wrote it a better scaffold.

## The scaffold is a large hidden design space

The natural objection is that the scaffold is a thin, near-fixed wrapper, so the variance should be small and predictable. The source code says otherwise. A taxonomy built directly from the source of real coding-agent systems found that control strategies range from fixed pipelines to Monte Carlo Tree Search, tool counts range from 0 to 37, and context compaction spans seven distinct strategies [s1]. That is not a wrapper; it is a design space with enough degrees of freedom to move a benchmark by the five points we just saw.

> [!CONFIRMED]
> A source-code taxonomy of coding-agent systems found tool counts ranging from 0 to 37 and context compaction spanning seven distinct strategies [s1].
>
> [!INFERRED]
> In my experience that range means a single model name maps to a score distribution, not a point, so two adjacent leaderboard rows are not rank-identifiable from the model name alone.

The practical consequence is that "Claude Opus 4.5 scores X on SWE-bench" is an incomplete sentence. The same model name, dropped into a zero-tool fixed pipeline or a 37-tool search-driven loop with aggressive compaction, produces different numbers, and the leaderboard records only one of them with no field telling you which scaffold it came from.

## The number you trust is almost never audited

There is a second defect, and it is independent of the first. The harness confound is about variance; this one is about whether anyone checked the number at all. Of the 100 models listed on llm-stats as of June 16, 2026, only one carries an independent verification badge; the other 99 scores were submitted by the model vendors themselves [s3]. So the comparison teams trust is almost entirely unaudited, and a vendor reporting its own score also chooses the scaffold it reports under.

These two defects compound rather than coincide. Self-reporting does not by itself prove a number wrong; a vendor can run a clean, reproducible protocol. But stack it on top of an undisclosed scaffold and you get the worst case: a number whose largest source of variance is the one thing the report omits, produced by the party with the strongest incentive to pick a flattering harness, and verified by no one. The buyer cannot reconstruct the harness from the report and cannot appeal to an audit, so the confound is both large and unobservable.

## The steelman: doesn't the model still dominate?

The strongest counter is worth stating at full strength. A five-point harness swing does not make the model signal noise if model effects dominate harness effects across the full range of models. A weak model in an excellent scaffold still loses to a strong model in a mediocre one. The same-model spread above is measured with the model held fixed, so it shows within-model harness variance and says nothing, on its own, about between-model variance, which on SWE-bench spans tens of points from older to frontier models. If between-model gaps swamp the harness swing, a bare leaderboard number still ranks models correctly for the decision most people think they are making, and calling it noise is an overclaim.

That counter is correct, and it narrows where my claim applies without overturning it. Across a wide capability gap, model signal does dominate; a bare number will rank a frontier model above a two-year-old one almost every time. But the leaderboard decision that actually bites is the near-peer one: a team has shortlisted current models whose scores sit within a few points of each other, and it is reading the order off those few points. That is exactly the regime where the within-model harness swing is the same size as the between-model gap, where the taxonomy shows the confound is large and undisclosed, and where self-reporting means it cannot be checked. The model dominates the coarse sort; on the fine sort, which is the one procurement actually runs, it stops being identifiable from the number.

## What to do

The fix is a reporting convention, not a new benchmark. Treat any SWE-bench figure as incomplete until it names its harness: the control loop, the tool count, and the compaction strategy. A score with that disclosure is a measurement you can compare; a bare model-name score is a data point whose error bars you were never shown.

> [!WARNING]
> The named failure mode is picking the higher of two adjacent self-reported SWE-bench numbers whose gap is smaller than the harness swing. You are not choosing a better model; you are choosing a better-reported scaffold, and you will not reproduce the number in your own.

So the rule I follow: for near-peer selection, report the harness alongside any score and prefer numbers that carry an independent verification badge. When neither is available, treat the bare model-name number as noise and decide on something you can actually observe, your own scaffold running your own tasks. The leaderboard tells you who is roughly in the frontier club. It does not tell you who wins inside it, and no amount of staring at the third decimal place will change that.
