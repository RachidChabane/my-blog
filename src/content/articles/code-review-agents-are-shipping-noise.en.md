---
translationKey: code-review-agents-signal-to-noise
lang: en
slug: code-review-agents-are-shipping-noise
title: Code Review Agents Are Optimizing the Wrong Metric
publishDate: 12-07-2026
tags:
- agents
- evaluation
category: essays
difficulty: 3
sources:
- label: 'From Industry Claims to Empirical Reality: Code Review Agents in Pull Requests
    (arXiv 2604.03196v1)'
  url: https://arxiv.org/html/2604.03196v1
  date: 03-04-2026
- label: Agent pull requests are everywhere. Here's how to review them. (GitHub Blog)
  url: https://github.blog/ai-and-ml/generative-ai/agent-pull-requests-are-everywhere-heres-how-to-review-them/
  date: 07-05-2026
contentHash: sha256:384204179e1795ce
publishState: published
---


The pitch for a code review agent is that it reads every pull request so you do not have to. An empirical study of 13 of them inverts that pitch: 60.2% of agent-only PRs land in the bottom 0 to 30 percent signal band, and 12 of the 13 run below a 60% signal ratio [s1]. My take is that coverage was never the objective worth optimizing. The binding constraint is the reviewer's attention, and an agent that floods it past the point where a human keeps reading has a delivered recall of zero, however many real defects it nominally surfaced. An exhaustive review agent is a productivity tax, and its abstain path is what sets its real value.

## The pitch versus the measurement

Start with what the tool is sold as doing and then look at what it emits. The vendor framing treats coverage as the product: point the agent at a diff and it will comment on everything a tired human would miss. The measurement says the opposite is happening. In a study of 13 agents, 60.2% of closed agent-only PRs fell into the 0 to 30 percent signal band, and 12 of the 13 agents averaged a signal ratio under 60% [s1]. Read it as a distribution. The modal comment from these tools is noise, and that noise is where most of the mass sits; it is not a thin tail you can tune away.

I do not think this is a bug in one bad agent that a competitor will fix. It is what you get when the objective function is coverage. If the agent is rewarded for saying something about every hunk, it will say something about every hunk, and most hunks do not warrant a comment. The metric the field optimizes and the metric a reviewer needs have come apart.

## The outcome that noise buys

A low signal ratio could be a taste complaint. The same study gives it a harder edge. Agent-only PRs merged at 45.20% against 68.37% for human-only ones, a 23.17 point gap, with markedly higher abandonment [s2]. So the noise is not free annoyance that sits quietly in a thread; it tracks a worse shipping outcome.

I want to be careful with this number rather than lean on it. Merge rate is a contaminated proxy: agent-authored PRs may merge less because they were lower-quality changes to begin with, not because reviewer noise sank them. I read s2 as corroboration, not proof. It rebuts the dismissal that low signal is only subjective, and it stops there. The prescription that follows does not need the causal reading; it stands on the signal distribution and the attention mechanism, and s2 just closes off the "so what, filtering is cheap" exit.

## Why this is already the default

If this were a fringe experiment you could file it under early-days and move on. It is not. More than one in five code reviews on GitHub now involve an agent [s3]. That is the number that turns a curiosity into a systems problem. The low-signal behavior the study measured is not a property of a few labs; it is the median experience of a fifth of the review traffic on the largest code host, compounding across every repository that switched the feature on by default.

The scale flips the cost accounting. A noisy tool used by ten enthusiasts is a rounding error. The same tool wired into a fifth of an ecosystem's reviews is a standing tax on attention, paid by every reviewer who has learned to scroll past the bot before reading a word it wrote.

## The reframe: attention is the budget

Here is the move the coverage framing misses. A code review agent does not compete for CPU or for a token budget; it competes for a fixed, scarce resource, which is human reviewer attention, and that resource has a trust threshold. Below a certain signal ratio the reviewer mutes the tool, collapses its comments by reflex, or stops reading them, and at that moment the agent's delivered recall drops to zero no matter how many genuine defects it technically flagged [s1] [s2] [s3]. Recall you do not read is not recall.

So the real choice is muted-channel versus open-channel. An agent tuned to protect its signal ratio keeps the human reading, and a channel that stays open delivers more realized recall on the findings that matter than a firehose the reviewer has already learned to ignore. Coverage is a vanity metric. The abstain path and the narrowness of scope are the levers that actually set the tool's value.

> [!CONFIRMED]
> In a study of 13 code review agents, 60.2% of closed agent-only PRs fell in the 0 to 30 percent signal band and 12 of the 13 ran below a 60% signal ratio [s1].

> [!INFERRED]
> So coverage is a vanity metric. Because the number a reviewer will actually read is capped by a trust threshold, the lever that sets an agent's delivered value is its abstain path.

## The objection I owe this argument

The strongest attack on this thesis is not that noise is fine. It is that for code review specifically, false negatives and false positives are asymmetric in the direction that sinks my argument. A dismissed false positive costs a reviewer seconds. A missed critical defect, an injection, an auth bypass, a data-loss race, is exactly what review exists to catch and can cost catastrophically. An agent tuned to stay silent unless confident will, by construction, abstain on the ambiguous, novel, hard-to-prove cases, and that is precisely where the highest-severity bugs live and where human reviewers are weakest too. On that reading, trading recall for signal ratio optimizes the metric while degrading the one thing review is for.

I take that seriously, because a naive "abstain unless confident" policy does exactly what the objection says. Two moves answer it, and they refine the thesis rather than retreat from it.

First, severity-tiering. "Abstain unless confident" is a policy over the low-to-mid-severity majority band, the mass sitting in that 0 to 30 percent signal range [s1], not a blanket gag order. The correct design never abstains on a high-confidence, high-severity detector. A confirmed injection is both high-confidence and high-severity, so a confidence gate keeps it; it does not drop it. The recall you sacrifice is recall over the plentiful, low-value, hard-to-confirm long tail, not over critical findings.

Second, the attention mechanism answers the "catch everything" intuition on its own terms. A maximal-recall noisy agent does not actually deliver that recall, because past the trust threshold the human stops reading and effective recall goes to zero. The quiet, severity-tiered agent delivers more realized recall on the findings that matter, precisely because the channel stays open. The asymmetric-cost objection assumes the noisy agent's nominal recall is real. That assumption is exactly what the attention mechanism denies.

| Dimension | Exhaustive agent | Abstain-by-default, severity-tiered agent |
| :--- | :--- | :--- |
| Signal ratio | Low; most comments in the 0 to 30 percent band [s1] | High; protected as the design target |
| Reviewer trust | Erodes; the channel gets muted | Preserved; the channel stays open |
| Delivered recall on critical findings | Approaches zero once muted | Higher; critical detectors never abstain |
| Merge outcome | Tracks worse shipping [s2] | Not directly measured; the mechanism predicts better |

## What I would ship

Concretely, I would ship fewer, higher-confidence comments and an abstain-by-default posture. Three levers do the work. Pin the scope to the changed lines and their immediate call sites, so the agent is not free-associating about the rest of the repository. Put a confidence threshold in front of every comment, and let a detector stay silent when it is under that bar. Then break the abstain policy into severity tiers, so a critical-severity detector is exempt from the silence rule and always speaks, while the low-value long tail is gated hard.

The failure mode to design against has a name: the muted channel. Once a reviewer has learned to reflexively dismiss the bot, your effective recall is zero, and you do not get the trust back by shipping a better model next quarter. You get it back by having never spent it. That is why the abstain path is not a nice-to-have setting buried in a config; it is the feature that determines whether anyone reads the tool at all.

If you run a review agent, stop asking whether it covers everything. Ask what signal ratio it holds in front of a reviewer who has the option to mute it, and whether its loudest comments are also its most-confident ones. Coverage is the metric the tools optimize. It is the wrong one.
