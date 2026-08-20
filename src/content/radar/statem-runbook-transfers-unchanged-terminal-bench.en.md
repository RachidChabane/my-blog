---
translationKey: statem-runbook-portability-terminal-bench
lang: en
slug: statem-runbook-transfers-unchanged-terminal-bench
title: 'StateM reads as a portability result: the runbook transfers unchanged to GPT-5.6'
publishDate: 20-08-2026
kind: research
tags:
- Terminal-Bench
- GPT-5.6
- agents
- evals
summary: A preprint posted on August 15, 2026 introduces StateM, an agent-native runtime
  built on durable states, phase-local context, checked transitions and versioned
  runbooks, and reports Terminal-Bench 2.1 results for GPT-5.5 and GPT-5.6. I think
  the durable part of the result is the runbook, which the paper says transfers unchanged
  to GPT-5.6.
sources:
- label: arXiv 2608.15089, StateM harness scaling preprint
  url: https://arxiv.org/abs/2608.15089
  date: 15-08-2026
- label: Terminal-Bench 2.1 leaderboard, tbench.ai
  url: https://www.tbench.ai/leaderboard/terminal-bench/2.1
  date: 12-08-2026
contentHash: sha256:ee5b85beabfc6ed0
publishState: published
---

## What changed

A preprint posted on August 15, 2026 bets on harness scaling: improve the execution system around an agent without changing its model weights [s1]. It introduces StateM, an agent-native runtime organized around durable states, phase-local context, checked transitions, recoverable runbooks and versioned procedural practices [s1]. It reports Terminal-Bench 2.1 runs for GPT-5.5 xhigh, GPT-5.6 Sol xhigh and GPT-5.6 Luna [s1], the three runs this brief argues from.

## What survives a model upgrade

A runbook that still works after the model underneath it changes is what I would put in version control this week. The runbook transfers unchanged to GPT-5.6 [s1], and the frozen profile raises GPT-5.6 Luna from 76.7 to 85.4 percent [s1]. The published reuse spans one model generation and the tiers inside it.

| Run | Reported accuracy |
| --- | --- |
| StateM with GPT-5.6 Sol xhigh [s1] | 95.3 percent across 445 trials |
| GPT-5.6 Luna under the frozen profile [s1] | 76.7 to 85.4 percent |

The case against reading this as a portability result is that it is one lab's arithmetic on its own runs. The Terminal-Bench 2.1 leaderboard reports the accuracy with a confidence interval, 83.8 percent plus or minus 1.2 for the rank-1 run, Claude Code with Fable 5 [s2]; StateM reports single point estimates from its own runs [s1]. I think the design stays retrofittable whether or not those estimates hold, which is why Impact asks you to reuse the structure and re-measure on your own tasks.

> [!IMPORTANT]
> I would put the runbook under version control before quoting the paper's headline accuracy. That the runbook moved to the next model unchanged [s1] is also the cheap part to test in your own repo.

## Impact on your team

Do not rebuild your runtime on a five-day-old preprint. What is retrofittable this week is the design: durable state, phase-local context, checked transitions, and a runbook you version like code [s1].

Record how much of your harness survives your next model upgrade: re-run the runbook unchanged and write down what you had to rewrite.

Try it on your own task set first. The transfer evidence covers one model generation, so a general guarantee beyond that is, I think, your bet to place.
