---
translationKey: cli-agent-productivity-proxy-choice
lang: en
slug: plus-24-percent-and-minus-19-percent-are-both-true
title: Plus 24 Percent and Minus 19 Percent Are Both True
publishDate: 18-07-2026
tags:
- agentic-coding
- evaluation
- qualite
category: essays
difficulty: 3
sources:
- label: arXiv 2607.01418v1, Microsoft CLI coding agent rollout study
  url: https://arxiv.org/abs/2607.01418
  date: 01-07-2026
- label: METR randomized controlled trial, experienced open-source developers
  url: https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/
  date: 10-07-2025
contentHash: sha256:4f004d63d0ab4aaa
publishState: published
---


There is no portable productivity number for coding agents: in this evidence base the instrument outweighs the tool, and proxy choice sets the sign of the headline. A study of tens of thousands of Microsoft engineers reports that adopters of a command-line coding agent merged roughly 24% more pull requests than they would have otherwise [s1]. A randomized controlled trial at METR reports that experienced developers took 19% longer to complete issues when they were allowed to use AI tools [s2]. Both results are true. Neither is the number you can carry into your own rollout.

## What each study actually measured

Put the two designs side by side and the apparent contradiction stops being about AI at all. Three choices are doing the work, and every one of them was made before either team collected a byte: who ends up in the sample, what code those people work on, and what counts as output.

| Dimension | Microsoft rollout | METR trial |
| --- | --- | --- |
| Population | tens of thousands of engineers who adopted the agent themselves [s1] | experienced open-source developers assigned to conditions [s2] |
| Substrate | organisation-wide work | issues in the developer's own repository [s2] |
| Scored unit | merged pull requests [s4] | wall-clock time to complete an issue [s2] |
| Window | four months [s4] | one issue at a time [s2] |

Read that table as a specification of two different quantities, not as two attempts at one. The rollout number answers a question about supply: when engineers who wanted this tool get it, how much more merge-shaped work appears across the organisation? The trial number answers a question about cost: when a developer who already holds a repository in their head is handed AI tools on their own issues, how long does the work take? Those are not one question with a disputed answer. They are two questions, and each design answers only its own.

The tool is the one thing held roughly constant across the pair. Everything that differs is instrumentation.

## The proxy is the finding

A merged pull request and a wall-clock minute cannot be averaged. They are not two noisy readings of one latent quantity; they are two different scored units, and the team that picks one has already picked most of its conclusion. What makes the rollout study worth taking seriously is that it says so itself, stating its proxy and its limitation in the same sentence [s4].

> [!CONFIRMED]
> The rollout study uses merged pull requests as its proxy for output and acknowledges that a merged pull request is not the same as the value it delivers, with the lift persisting across a four-month window [s4].

> [!INFERRED]
> I read that concession as the whole argument in miniature. A rollout priced on either headline alone is priced on instrumentation rather than on an effect, because the scored unit had already fixed the sign of the number before anyone installed the tool.

There is a trivial version of this point, and I want to disown it before someone hands it back to me. The trivial version is that study designs differ, which nobody denies and which changes no decision. My claim is comparative and empirical: for coding agents, at the present state of the evidence, the variance attributable to instrument choice is larger than the variance attributable to the tool. That is a bet about magnitudes. It can lose, and the closing section says exactly how.

## The steelman: scale is real

The strongest counter is not that METR is wrong. It is that METR is small. Tens of thousands of engineers observed across a four-month window [s1] [s4] is a different order of evidence from a few dozen developers on a few hundred issues, and the rollout also measures a more recent generation of tools. On that reading, the 24% lift is the signal and the 19% slowdown is a small-sample artefact of an unrepresentative population that happens to be unusually good at its own codebase.

Concede the scale. It is real, and I would not trade it away for a cleaner story. Then notice what scale does not fix.

The rollout study's own findings describe how people got into the sample. First use spread primarily through social networks, and retention was associated more with engineers' coding activity than with demographics [s1]. That is a description of a selection process, not of a random assignment. The adopters were the socially connected and the already-active, which is precisely the population you would expect to merge more pull requests over four months with or without an agent. A larger sample does not repair selection. It makes a selected estimate more precise.

The scored unit stays where it was, too. More merged pull requests is a fact about merge events, and the paper declines to equate that with value [s4]. Scale buys you a tighter estimate of a quantity whose authors have told you not to read as the thing you care about.

## The self-report trap

Here is the named failure mode, and it is why I rank the three available signals instead of treating them as symmetric. METR's participants forecast that AI would speed them up by 24%, and even after experiencing the slowdown they still believed AI had sped them up by 20% [s3], against a measured 19% longer to completion [s2]. That is not noise around a true value. It is a signal that moved in the opposite direction from its referent, under conditions about as favourable to accurate perception as you could arrange: expert practitioners, their own code, a task they had just finished.

Now the narrowing, because the broad version of this claim is wrong and I do not want to defend it. Developers report preference honestly. They report friction honestly, where the tool gets in the way, whether they would keep it. What the gap discredits is self-reported time saved as an estimate of time saved.

That distinction is not academic, because the substitution it forbids is the one every rollout business case makes. A satisfaction survey gets read as a throughput estimate. Engineers saying they feel faster is a real fact about how the tool feels, and on this evidence it is not a fact about hours.

## What I would instrument instead

Pick the scored unit before you pick the tool, and hold it fixed while the population changes. That is the decision I would defend in a rollout review, and it costs nothing to make early. If you can fund exactly one measurement, measure wall-clock time to completion on a task type your team actually ships, on the same people, before and after. It is unglamorous, it will not produce a quotable percentage for a slide, and that is the feature rather than the bug.

> [!WARNING]
> Do not benchmark your rollout against a published percentage from another organisation. You would be comparing your population, your substrate and your scored unit against three of someone else's at once, so any gap you find is unattributable by construction.

The refusals matter as much as the measurement. Refuse self-reported time saved as evidence about time saved [s3]. Refuse a proxy chosen after the data arrives. Refuse a merge-count comparison between an opt-in group and everyone else, which is the shape the rollout study's own selection finding warns about [s1].

And here is what would change my mind, stated in advance so the position stays losable. Hold the proxy fixed and vary the population: measure wall-clock completion time on both self-selected adopters and assigned developers. Or hold population and substrate fixed and vary the proxy: score one group of engineers on merged pull requests and on completion time over the same window. If the sign holds in either experiment, the headline is tracking the tool and not the instrument, and I am wrong. Until somebody runs one of those, "how much faster do coding agents make us" has no portable answer, and the only useful one is a measurement you own.
