---
translationKey: agent-session-budget-inflection-point
lang: en
slug: size-the-agent-session-before-you-split-the-token-budget
title: Size the agent session before you split the token budget
publishDate: 15-09-2026
tags:
- agents
- evaluation
category: essays
difficulty: 3
sources:
- label: Elo-per-token study of agent test-time strategies, method
  url: https://arxiv.org/abs/2609.15309
  date: 14-09-2026
- label: General AgentBench test-time scaling study, setup
  url: https://arxiv.org/abs/2602.18998
  date: 22-02-2026
- label: Token consumption in agentic coding tasks, cost against accuracy
  url: https://arxiv.org/abs/2604.22750
  date: 24-04-2026
contentHash: sha256:ad236570bf2eaa20
publishState: published
---


Treat an agent's per-session token cap as a tuned value: past a measurable point extra tokens buy less than fresh samples, and splitting the budget needs a cheap scorer. In an Elo-per-token study, agents can initially turn tokens into Elo faster than independent sampling, then their marginal gains diminish and eventually fall below that reference [s2]. Across runs on the same task, a separate study finds that accuracy often peaks at intermediate cost [s7]. Where the cap sits is a decision. So is whether to divide it.

## What an Elo-per-token curve records

I think it is the method that makes a turning point measurable at all. The Elo-per-token analysis tracks the best solution found at each token budget and uses a Bradley-Terry model to aggregate within-task orderings into Elo ratings across tasks with different score scales [s1]. That aggregation is what lets a single curve span tasks whose raw scores cannot be compared. The authors apply it to four general-purpose agents on four open-ended benchmarks, with sessions of up to 100M tokens [s1].

Those are open-ended optimization benchmarks. Nothing in the abstract makes them repository work, and I keep that boundary in view for the rest of this piece, because a turning point measured on one task family does not travel for free to another.

The yardstick is the part I find most useful. Independent sampling provides a reference for which Elo grows linearly with log compute [s2]. An agent that keeps working inside its session is therefore compared with the simplest alternative: spend the same tokens on fresh, unrelated attempts. While the session stays above that line, the context it has built is paying for itself. Once it drops under the line, that context has become a cost.

My reading of the method adds one thing the abstract does not spell out. Tracking the best solution found means every candidate has to be ranked against the others, and the sampling reference inherits the same assumption: a pile of independent attempts is only worth its best member if something can tell which member that is. Both the agent curve and the yardstick therefore assume a way to score work before it is finished. Hold on to that.

## One measured turning point, two studies consistent with it

Only one of the three sources measures the crossover from the lead directly [s2], and I keep the other two in a weaker role.

A study of token consumption in agentic coding tasks looks along a different axis: it compares whole runs with each other. Runs on the same task can differ by up to 30x in total tokens [s7], and higher token usage does not translate into higher accuracy, since accuracy often peaks at intermediate cost and saturates at higher costs [s7]. That shape fits a turning point. It does not measure one, because a cost curve built across runs says nothing about the marginal rate within a single session.

General AgentBench is used to study test-time scaling under sequential scaling (iterative interaction) and parallel scaling (sampling multiple trajectories) [s5]. Its authors name a context ceiling as the limit of sequential scaling [s6]. The abstract gives no budget curve for it.

| Study | What it compares | Scope | What it says about a turning point |
| :--- | :--- | :--- | :--- |
| Elo-per-token [s1] | Best solution at each token budget against an independent-sampling reference [s2] | Inside one session | Marginal gains start above the reference and fall below it [s2] |
| Token consumption in agentic coding tasks [s7] | Token totals and accuracy on the same task [s7] | Across runs | Accuracy often peaks at intermediate cost [s7] |
| General AgentBench [s5] | Sequential and parallel test-time scaling [s5] | No budget curve | Names a context ceiling as the limit of sequential scaling [s6] |

The scope column is my own classification of the three abstracts. It is why I call the second and third rows consistent with the first rather than evidence for where the turning point sits.

I call the failure mode this predicts the overrun session: a run that keeps spending past the point where the next block of tokens buys less than a fresh independent run would.

> [!WARNING]
> An overrun session looks like diligence. The agent is still working, the cap has not been hit, and every extra block of tokens buys less progress than a fresh start would have. A generous cap lets that run continue unseen.

## Splitting the budget, and what the split assumes

The split result is real and specific, and the way it was built tells you what it needs. The authors define the scaling inflection point as the per-session budget where marginal Elo gains match the independent-sampling reference [s4]. General AgentBench, from another group, compares sequential and parallel scaling [s5], and its finding sits next to the split in the card below.

> [!CONFIRMED]
> Sizing each session at the inflection point and splitting 100M tokens across parallel sessions on FrontierCS Polyomino Packing gains +264 Elo over one long session and +355 over ten short sessions [s4]. In the other study, neither scaling methodology yields effective performance improvements in practice, and the authors name a verification gap as the limit of parallel scaling [s6].

> [!INFERRED]
> I read the split as a selection step. Several sessions run, the best one counts, and that only works when something can rank unfinished work cheaply. The verification gap is consistent with that limit, though nothing here tests it, and ten short sessions losing to well-sized ones tells me session size matters as much as the split.

A split is a bet that you can pick a winner, and the sampling yardstick it is sized against makes the same bet; the scorer requirement rests on that. The two studies run on different benchmarks, so the verification gap is one candidate explanation for the parallel result among several.

## What I would do with a token cap

My position is size first, split second. Find the turning point for your own task, set the per-session cap there, and only then ask whether dividing the budget pays. The order matters because the ten short sessions in that experiment lost to well-sized ones [s4], so cutting a budget into pieces that are too small is its own way to waste it.

Splitting needs a cheap scorer for intermediate work: a test suite, an objective function, or a checker that returns a number. With one in place, logging makes the turning point visible on your own task. This is the loop I would run:

```text
for each run of the task:
    score every candidate the agent submits with your checker
    log (tokens_spent, best_score_so_far)
compare the gain per extra token with what a fresh independent run gains for the same tokens
cap each session where the fresh run starts to gain more
split the remaining budget into sessions of that size only if the checker is cheap
```

This logging loop is my own practice and comes from none of the studies. Its purpose is to find the turning point on your task, so you are not borrowing a number from a packing benchmark.

The comparison line is the step teams skip, and it costs little. Run a few independent attempts at small budgets on the same task, keep the best score of each group, and plot it against total tokens next to the long session. The long session justifies its extra context only while it stays above that line.

Without a scorer, I expect a split to pay no better than one long session, because nothing picks the winner.

What I would ignore is the headline Elo gain carried over to a task with no checker. The split kept the best of several sessions, which I read as a ranking step, and a task with no checker gives you nothing to rank with.

## The strongest objection, and where I stop

The strongest case against me has three parts, and each one is fair. The split rests on one packing task from one group. Nothing in the abstracts says the verification gap was measured on the agents or the kind of task the split used, and a stronger verifier could narrow it. And a split might pay without any scorer at all, through majority voting or self-consistency, which would make my precondition wrong.

My answer is to keep the claim narrow. The turning point inside one session rests on one direct measurement [s2], with two studies consistent with it [s6] [s7]; the split rests on one task [s4]. That is why the rule is conditional. If someone shows a split that pays through majority voting with no scorer, on a task like this one, the rule breaks and I would drop the scorer condition.

The authors also compare agents with human contestants: the strongest historical human contestants improve superlinearly over contest time on shared AtCoder Heuristic Contest tasks, which the authors present as evidence of substantial headroom after agents slow down [s3]. My reading is that the slowdown belongs to the agents measured, so the turning point will move as agents change. That is one more reason to measure it per task and never hard-code it.

I first read the token-consumption study and General AgentBench as confirmation of the turning point, and I have kept them in the weaker role since.

This blog has already compared strategies at a fixed budget: multi-agent orchestration at equal thinking tokens, and a repair loop against resampling at a fixed attempt count. This piece asks a different question, where inside one session the budget stops buying more than a fresh sample, and what has to exist before dividing it helps.

> [!NOTE]
> Treat the logging loop above as the way to find your own turning point rather than a number to copy.
