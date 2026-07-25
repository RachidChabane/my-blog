---
translationKey: irreversible-actions-before-abstention
lang: en
slug: count-the-irreversible-actions-before-an-agent-stops
title: Count the irreversible actions an agent takes before it stops
publishDate: 25-07-2026
tags:
- agents
- evaluation
category: essays
difficulty: 3
sources:
- label: 'AgentAbstain: Do LLM Agents Know When Not to Act? (arXiv 2607.10059)'
  url: https://arxiv.org/abs/2607.10059
  date: 11-07-2026
- label: 'Agentic Abstention: Do Agents Know When to Stop Instead of Act? (arXiv 2606.28733)'
  url: https://arxiv.org/abs/2606.28733
  date: 27-06-2026
- label: 'Cyera, Agent-Inflicted Damage: Inside the Real-World Failures of Enterprise
    AI Systems'
  url: https://www.cyera.com/research/agent-inflicted-damage-inside-the-real-world-failures-of-enterprise-ai-systems
  date: 28-05-2026
contentHash: sha256:bd6e0bd4a3ba1f85
publishState: published
---


The abstention score a benchmark reports is a rate, and the number that decides how you wire an agent is how many irreversible actions run before it stops. Cyera's enterprise incident research counts 188 cases in which an autonomous AI system caused harm directly in the company's production systems with no attacker anywhere in the chain [s3]. Set that beside the best result in AgentAbstain: across 17 frontier LLMs in 4 agent harnesses, the strongest agent, Gemini 3.1 Pro, reaches 59.5% paired accuracy, correct on both the act and the abstain side of each paired task [s1]. Both numbers describe the same loop from opposite ends. Neither tells me where to put the control.

## What the two benchmarks actually measure

A scalar is the wrong unit for a wiring decision, and both benchmarks hand me a scalar. AgentAbstain builds paired tasks, one version where acting is correct and one where declining is, and credits an agent only when it gets both sides right [s1]. The sequential study goes the other way, running 13 LLM-as-agent systems and 2 agent scaffolds over more than 28,000 tasks across web shopping, terminal environments and question answering, and finds that some agents never abstain when they should while others do so only after many unnecessary interactions [s2]. Two designs, one capability, and both compress into a percentage.

That percentage answers a question I do not have. Wiring an agent into a repo or a billing system, I am not choosing between one score and another a few points above it. I am deciding which tools it can reach and under what precondition. The benchmark grades a disposition, while my exposure comes from the trajectory the harness actually runs.

## The model upgrade stops being a mitigation

The reflex when an agent misbehaves is to wait for the stronger model, and AgentAbstain takes that option away for this specific failure. Under the headline number sits the result that matters: abstention capability is largely independent of general task-solving capability, so scaling task-solving alone will not close the gap [s1]. Independence is a strong word in a benchmark paper, and it should move a roadmap. If the next generation lands with a better score on every reasoning suite you track, you have no grounded expectation that it declines more sensibly at the moment it counts.

> [!CONFIRMED]
> Abstention capability is largely independent of general task-solving capability, indicating that scaling task-solving alone will not close this gap [s1].

> [!INFERRED]
> I read that as taking the model upgrade off the mitigation list for this failure mode, which leaves the harness as the only layer with a stable contract to change.

That is not a small deletion. Model upgrades are the cheapest intervention most teams have: someone else does the work and you change one string in a config. Remove it and what remains is the part you own, the tool registry and its preconditions.

## Timing turns a passing score into an incident

The sequential study's finding about *when* agents abstain is the one worth taking to a design review. A grader that records the final verdict credits a ninth-step refusal as a correct abstention [s2]. Production does not.

Here is the failure mode, and it deserves a name: late abstention over a committed action. The agent recognises on step nine that it should not have proceeded, emits a clean refusal, and scores as correct. The refund was captured on step three. The transcript looks like a well-behaved agent; the ledger shows the refund already gone. Nothing in either scoring scheme separates that trajectory from one that declined immediately, because the grader looks at the answer while the harness already executed the prefix.

Cyera's research is what this looks like outside the benchmark. Across those 188 cases there was no injection, no stolen credential, no adversary anywhere in the chain [s3]. The agent held a tool, used it, and the damage was real.

## The quantity worth measuring

So I would count differently. The quantity I want on an evaluation report is irreversible actions before abstention: for each task where stopping was the right move, how many calls with no undo executed before the stop arrived. A rate gives me a population statistic, while this one gives me my exposure.

Let me be exact about the epistemic status of that, because it matters more than the proposal itself. No source I have cited measures this quantity. The sequential study supports only the weaker point, that abstention has a latency and current scoring ignores it; it reports no distribution, no threshold, no separation of reversible from irreversible calls inside the prefix. The metric is my judgment about what is decision-relevant, and I would rather say so than dress it in someone else's citation.

It is falsifiable on two fronts, which is why I think it is worth arguing rather than asserting. It predicts that scaffold choice modulates realized harm at a fixed model, and both studies already vary the harness, so the experiment is to hold the model constant and let the scaffold move. If harness swaps change nothing, my claim that the leverage sits in the tool layer is wrong. It also predicts that a real share of harmful trajectories end in a correct abstention arriving after an irreversible call, checkable against an incident corpus of the kind behind the enterprise research. If almost none do, the timing dimension is an artifact and I should drop it.

## Wiring the reversibility boundary

The gate I want makes no runtime decision, and that distinction carries the whole argument. If the thing standing at the boundary asks the model whether it is sure, I have relocated the abstention problem rather than removed it, and the independence result gives me no reason to expect a gated confidence judgment to be better calibrated than an ungated one.

So the gate restricts reachability, and nothing else. For the subclass of actions whose irreversibility is statically knowable when you author the tool (payment capture, deletion, outbound send, deploy, external write), classify the tool once and make it unreachable from the agent's tool list unless an explicit out-of-band token sits in the call context. That is a property of the manifest:

```yaml
- name: capture_payment
  reversible: false
  requires:
    authorization: out_of_band
- name: search_orders
  reversible: true
```

In an existing registry, start by grepping the tool names for transitive verbs over an external system: `create`, `delete`, `send`, `deploy`, `charge`, `merge`, `apply`. Each one is a candidate for the irreversible list until someone demonstrates it is idempotent.

| lever | acts on | decided when | fails how |
| :--- | :--- | :--- | :--- |
| Static reversibility gate | the irreversible tail | at wiring time | blocks a legitimate action until a token is issued |
| Model calibration | the reversible middle | at inference time | mis-scores its own confidence |

This bounds the irreversible tail and nothing beyond it. Calibration still owns the reversible middle, which is where most of the measured abstention failures live: underspecification, unanswerable questions, wrong-scope queries. Answering with insufficient information is a calibration failure, and a reversibility gate is blind to it. The two controls act on disjoint parts of the surface, so anyone telling you tool structure replaces calibration is selling you one control twice.

## Why I still wire the gate

The strongest case against me defends the rate. An agent that abstains correctly at all beats one that never does, and paired accuracy measures exactly that, since requiring the act side too refuses to reward a model that abstains constantly. On that reading the field is early, the number is low, and the right response is to raise it rather than to build scaffolding around it. The second half of the case cuts deeper. A tool-layer gate removes autonomy precisely for the actions that motivated autonomy. If every irreversible call needs an out-of-band token, someone issues tokens all day, and that someone starts issuing them without reading.

> [!WARNING]
> A gate that issues tokens on demand becomes a rubber stamp within a sprint. If the irreversible list is long enough to keep a human approving calls all day, either the list is wrong or the agent is aimed at the wrong job.

My answer has two parts. The two failure modes cost different amounts: a never-abstaining agent fails loudly and gets caught in review, while a late-abstaining agent leaves a correct-looking transcript wrapped around an action that already ran, and the second is the one nobody finds until reconciliation. The fatigue objection also assumes a per-call human prompt, which is not the proposal. Reversibility is a static property of a tool. You settle it once, when you write the manifest, over a tool list that has been short in every agent I have shipped. The token requirement lives in the manifest, next to the tool it guards.

## What I would do on Monday

Two things, both cheap. Open the tool registry and add one reversibility field per tool, defaulting to `false`, so a new tool has to argue its way into the reversible set. Everything left irreversible gets a required authorization field the agent cannot populate from its own narration. In most registries that is an afternoon, and it is the part of the loop with a stable contract.

Then change what the internal evaluation reports. For every task where stopping was correct, log how many irreversible calls executed before the stop, and publish that distribution beside the abstention rate rather than in place of it. Run the suite twice with the model held fixed and the scaffold swapped. If the two runs disagree, your leverage lives in the scaffold, and that is where I would spend the next sprint.
