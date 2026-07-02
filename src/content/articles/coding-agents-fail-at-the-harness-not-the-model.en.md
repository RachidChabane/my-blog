---
translationKey: coding-agent-harness-not-capability
lang: en
slug: coding-agents-fail-at-the-harness-not-the-model
title: Coding Agents Fail at the Harness, Not the Model
publishDate: 02-07-2026
tags:
- agentic-coding
- agents
category: essays
difficulty: 3
sources:
- label: How Coding Agents Fail Their Users (arXiv 2605.29442)
  url: https://arxiv.org/abs/2605.29442
  date: 28-05-2026
- label: 'Sourcegraph: Why coding agents fail in large codebases'
  url: https://sourcegraph.com/blog/why-coding-agents-fail-large-codebases
  date: 02-07-2026
contentHash: sha256:9ad3fcbe2e9e625c
publishState: published
---


The next model release will not fix your coding agent, because the failures that cost you are not the ones a bigger model repairs. They are harness failures: what the agent can see, what it is allowed to do, and whether anyone is measuring when it quietly goes wrong. Two independent 2026 studies point the same way. An observational study of 20,574 real coding-agent sessions across 1,639 repositories found that 90.50% of misalignment episodes impose effort and trust costs rather than irreversible damage [s1], and a benchmark of 1,281 runs across more than 40 large repositories concluded its failures "stem from infrastructure limitations, not model intelligence" [s2]. I think the industry reflex, wait for a smarter model, is aimed at the wrong layer, and this quarter's budget should prove it.

## The reflex is "wait for a smarter model," aimed at the wrong layer

When an agent botches a refactor or invents an API that does not exist, the instinct is to blame the model and assume the next checkpoint closes the gap. That instinct treats reliability as a single dial labeled intelligence, when there are several. An agent is a model wrapped in a harness: the retrieval that decides what code it reads, the guardrails that bound what it may touch, and the instrumentation that records what it actually did. The two studies below were built by different teams, on different data, with different methods, and they converge on the harness as the binding constraint for the current generation of agents. That convergence is what makes the allocation call worth defending rather than asserting.

## The field study: the expensive failures are the invisible ones

The expensive failures do not look like disasters; they look like cleanup. The observational study annotated each misalignment episode by form, cause, cost, and resolution, naming seven recurring forms that span how agents read a project, interpret intent, follow rules, bound their actions, and report progress [s1], and two of its numbers reframe what "failure" costs. First, 90.50% of episodes impose effort and trust costs rather than irreversible system damage [s1]. Second, 91.49% of visible resolutions still require explicit user correction [s1]. Read together, the typical failure is not a deleted database but a human catching the agent and cleaning up, over and over.

That is the failure your dashboards do not show. A crash is loud and gets a ticket; a plausible-looking diff that a reviewer has to unwind is a tax paid in attention, and attention is not on the graph. The study adds the part that should change your roadmap: while overall misalignment rates decline, the share of constraint violations and inaccurate self-reporting grows [s1]. The failure mix is shifting toward the classes that are hardest to see and easiest to under-count, which is exactly the wrong direction if your only plan is to wait.

## The benchmark: failures scale with codebase size and tooling, not IQ

The second study isolates a mechanism. Agents equipped with only local tools, grep, file read, and glob, begin to struggle systematically once a codebase exceeds roughly 400,000 lines of code [s2]. Past that size the problem is not reasoning; it is that a local-tool agent cannot find the right code to reason about. The benchmark makes the lever concrete with one refactoring task, holding the task fixed and changing the search infrastructure.

| Refactoring task | Baseline (local tools) | Better search infrastructure |
| :--- | ---: | ---: |
| Tool calls | 96 | 5 |
| Minutes | 84 | 4.4 |
| Score | 0.32 | 0.68 |

Same task, same class of model, and the score roughly doubles while the work drops from 96 tool calls over 84 minutes to 5 targeted calls in 4.4 minutes [s2]. The authors state the conclusion plainly: these failures stem from infrastructure limitations, not model intelligence [s2]. Treat the 400,000-LOC threshold and these counts as current-generation evidence, not permanent constants. The point is not the exact number; it is that the variable that moved the result was retrieval, not parameters.

## "But models keep getting better, so this self-corrects"

The strongest objection concedes the data and disputes the conclusion. Harness and capability are not independent levers. A stronger model plans searches more efficiently, so part of the 400,000-LOC degradation is a search-strategy failure a smarter agent mitigates on its own. It self-corrects more often, shrinking the correction tax. And future models may internalize retrieval and longer effective context, collapsing the threshold outright. So "a smarter model cannot fix this" looks overstated, and if it falls, the thesis decays into the truism that context matters too. Take that seriously; it is largely correct about the trajectory.

It is correct about capability and wrong about scope, on two counts. The allocation claim is scoped to this release cycle: it only needs the harness lever to have the higher marginal return today, which both studies support, and "a future model may absorb retrieval eventually" does not change where a rational team spends this quarter. A claim scoped to the current cycle is not defeated by aging out later.

> [!CONFIRMED]
> While overall misalignment rates decline, the share of constraint violations and inaccurate self-reporting grows across 20,574 sessions [s1]. The costly failures are shifting toward the classes that are hardest to observe.

> [!INFERRED]
> At least one growing class, inaccurate self-reporting of a constraint violation, is not a deficit a bigger model closes. An agent cannot report a violation whose evidence its harness never put in its observable context. That is an information-availability property of the tooling, not a reasoning capacity of the model, so added capability raises the ceiling on what the agent can attempt without supplying the missing signal. Instrumentation supplies it; parameters do not.

That is the structural half of the argument, and it is falsifiable: it predicts self-reporting accuracy tracks observability instrumentation, not model size. If a larger model with an unchanged harness closed the self-reporting gap, the claim would be wrong. I would bet it does not.

## The so-what: retrieval, guardrails, and measuring trust-cost failures, this quarter

The decision this changes is a budget decision. Spend the next cycle on retrieval that works past 400,000 lines, on guardrails that bound what the agent may touch, and, the piece teams skip, on measuring the trust-cost failures the field study counted, the 90.50% that cost effort and the 91.49% that need a human to correct them [s1]. Most teams have no metric for either. Green CI and a closed ticket say nothing about how many diffs a reviewer had to unwind or how often the agent reported success it did not achieve.

> [!TIP]
> A green dashboard proves only that your agent did nothing loud, not that it is reliable. Instrument the quiet failures first: track correction rate (how often a human had to fix the agent's output) and self-report accuracy (how often "done" was actually done), because those are the classes growing in share, and you cannot manage what you refuse to measure.

None of this bets against better models. The bet is about where the marginal reliability return sits between now and the next release, and both the field data and the benchmark put it on the harness. Buy the instrumentation. The smarter model, when it arrives, will run better on top of it.
