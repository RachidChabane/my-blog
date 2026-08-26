---
translationKey: failure-record-in-context-drives-the-repeat
lang: en
slug: what-the-harness-writes-back-after-a-failed-call
title: What the harness writes back after a failed call
publishDate: 26-08-2026
tags:
- agents
- agentic-coding
- qualite
category: essays
difficulty: 4
sources:
- label: 'Feedback That Backfires: Why Small Language Model Agents Repeat the Call
    They Just Watched Fail (arXiv:2608.23651)'
  url: https://arxiv.org/abs/2608.23651
  date: 24-08-2026
- label: 'Outcome Monitors: Recovery Affordances for Silent Tool Failures (arXiv:2608.19303)'
  url: https://arxiv.org/abs/2608.19303
  date: 19-08-2026
- label: 'Don''t Repeat Yourself: Stopping Verbatim Loops at Sampling Time (arXiv:2608.22761)'
  url: https://arxiv.org/abs/2608.22761
  date: 24-08-2026
- label: 'When Not to Imitate: Boundary-Aware Skill Memory for Reliable Tool-Use LLM
    Agents (arXiv:2608.22339)'
  url: https://arxiv.org/abs/2608.22339
  date: 23-08-2026
- label: 'ToolRobustBench: Stage-Wise Perturbation Evaluation and Failure Diagnosis
    for Tool-Calling Agents (arXiv:2608.23635)'
  url: https://arxiv.org/abs/2608.23635
  date: 23-08-2026
contentHash: sha256:5cffb5fcc31d6ea2
publishState: published
---


I think the design variable in a coding-agent harness is what the failure record says, and the two things I have shipped both put the wrong text in it. The reflex is to log the failed tool call verbatim so the model can see exactly what went wrong. Over a fixed candidate set the probability of repeating that call rises from 0.06 to 0.54 once the call is sitting in context [s3], on 6 checkpoints spanning 135M to 1.7B across 4 model families [s2]. The record I wrote to help the model recover is the thing that makes it repeat itself.

## What the harness does after a failure

The harnesses I have built all do the same thing. They record a failed tool call and its error message in the transcript and ask the model to continue, on the assumption that the error is corrective information [s1]. It is a comfortable assumption, and I never audited it.

There is a structural reason nobody else does either. Clean end-to-end success cannot identify where a tool-use failure originates or how it propagates through a call [s17]. The number you optimise is silent about the mechanism you are debugging, so the assumption sits under the harness for years, untested, while the transcript keeps growing.

## The verbatim record raises the odds of the repeat

Because the transcript functions as a prompt, everything the runtime appends to it competes for attention on the next step, and a failed call written out in full is a well-formed candidate sitting exactly where the model looks for one. The failure is demonstrated to the model, not merely reported to it.

The measurement splits the damage in a way I did not expect. Surface form accounts for 83% of the damage, while the semantic contribution of marking the call failed is small and inconsistent in sign across environments [s4], on the same 6 checkpoints from 135M to 1.7B across 4 families [s2]. So the part I thought was doing the work, the annotation that says this went wrong, is close to inert. The part I thought was neutral, the literal bytes of the call, is carrying nearly all of it.

That is the instinct to give up: a faithful record is not automatically a safe record. The corrective gain is negative for every instruction-tuned model tested, across two environments including MBPP program repair [s2]. Not small. Negative. I was paying context budget for fidelity, and fidelity is not the term the measurement rewards.

## Clearing the context is the other wrong lever

The second reflex is the opposite move, and it fails for a reason that took me a while to accept. Deleting the failed attempt to retry from a clean context, the standard prescription for context contamination, is the worst harness measured for repetition, because it restores the context that produced the failure [s6].

> [!WARNING]
> Clearing the context does not reset the trajectory. It reinstates the exact state that produced the failure, which is why it ranks worst for repetition [s6]. The ranking is over that one metric and nothing wider.

The cheap alternative acts on the same term without touching the budget. Replacing the verbatim call with a runtime-generated description of the failure removes 76% of the inversion at no token cost, and making previously-failed strings unreachable at the decoder acts on the same term [s5], measured over the same 135M to 1.7B checkpoint range across 4 families [s2]. One of those is a prompt-assembly change and the other is a decoder change, which is a useful thing to notice: the term is available at two different layers of the stack.

## What moved a number was naming the recovery affordance

The second line comes from a different design entirely, and I would have filed it under better error messages if the ablation had not been in the paper. On a violation, the monitor preserves the result and issues a nonbinding receipt naming the violated property and public recovery tools [s7]. So what happens instead of blocking the agent? It gets handed a note about what it can reach next.

Outcome Monitors raise ToolMaze completion from 10.9% to 28.1% across four models in two provider families and replicate in a third [s8]. That is a real move on a real benchmark, and on its own it says nothing about why.

The ablation says why. Removing the recovery-tool list eliminates the measured gain and restoring it recovers the effect, while diagnostic detail and timing produce no detectable differences [s9], and recovery tools are the active receipt content in these controls [s10].

> [!CONFIRMED]
> The recovery-tool list is the term that moves the number. Remove it and the gain goes; restore it and the gain returns; diagnostic detail and timing change nothing [s9] [s10].

> [!INFERRED]
> I read that as the receipt working because it points forward. The faithful half of the note, what happened and when it happened, is the half that measures inert, and that is the same split the harness work found by a completely different method.

A third paper enumerates applicability conditions, risk cues, avoidance rules, and recovery notes [s16]. Every item on that list points forward rather than back. That enumeration measures nothing, so I am using it as vocabulary and not as evidence: it is a name for the category the ablation picked out.

## Where a memory of successes turns into a wrong-tool margin

Here is an analogy from somewhere with no failed calls in it at all. Prevailing agent self-evolution paradigms typically rely on a core assumption, that equipping LLMs with skill memories derived from successful trajectories will monotonically improve their problem-solving capabilities [s14]. Write down what worked, the agent gets better. It sounds unarguable.

Procedure skills raise the wrong-tool margin by 47 percent over a memory-free baseline [s15]. A faithful record of what worked, written down and handed back, moves a failure metric the wrong way.

I am not claiming this measures my design variable. It is a different benchmark on a different task set and no arithmetic joins the two. What it does is put the same instinct under a light. Writing down what happened, success or failure, is not what makes context useful. What makes it useful is what it tells the agent to do on the next step, and a transcript of a past trajectory answers a different question than an affordance does.

## The steelman, and what I will not claim

The strongest objection is not the one about model size. It is that my two lines are not the same manipulation. On the harness side the winning arm subtracts a string. On the receipt side the winning arm adds a list. Nobody ran the crossed cell: no reported arm keeps the verbatim call and adds a recovery-tool list, and none replaces the call with neutral filler that points nowhere. So what I am calling one design variable may be two unrelated effects, one subtractive and one additive.

I concede the cell is missing. What answers the objection on its own terms is that each line carries its own fidelity arm, and both of them measure inert: marking the call failed contributes little and is inconsistent in sign across environments [s4], and diagnostic detail and timing produce no detectable differences [s9]. Two methods, two fidelity arms, both flat.

Size is the second objection and it stands. The negative corrective gain is measured on 6 checkpoints from 135M to 1.7B across 4 families [s2], and a frontier model may well absorb a failed call differently. My answer is partial: the receipt result runs across four models in two provider families and replicates in a third [s8], and tool-output/observation perturbation is the dominant bottleneck in the measured robustness degradation [s18], which puts the observation channel where I claim it is even at larger scale.

I will not claim the mechanism is settled. The nearest thing to one, and I read it as suggestive rather than as evidence, is a sampling-time study of open-ended generation where models repeat spans already present in context [s11]. In that same sampling-time setting, my reading is that the usual defenses miss the shape of the problem, because repetition, presence and frequency penalties and n-gram blocking act on token recurrence rather than the sequential structure of a loop [s12]. An intervention-matched placebo produces no comparable reduction there, identifying suffix matching as the operative mechanism [s13], and I think that open-ended-generation scope is exactly why the result cannot be lifted onto a failed tool call without calling it what it is, my inference.

So the change I made in my own harness is small, and it is not a rewrite of the loop. When a call fails, the runtime no longer appends the call. It appends what the agent can reach next. That may turn out to be two effects rather than one. Either way, the text written back after a failure is a design decision, and in every stack I have opened it was being made by whoever wrote the default logger.
