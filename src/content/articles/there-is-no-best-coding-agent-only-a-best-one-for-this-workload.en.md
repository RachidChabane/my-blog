---
translationKey: harness-over-model-has-no-global-ordering
lang: en
slug: there-is-no-best-coding-agent-only-a-best-one-for-this-workload
title: The Harness Beat the Model by 4.6 Points of Almost Nothing
publishDate: 15-07-2026
tags:
- agents
- evaluation
- agentic-coding
category: essays
difficulty: 3
sources:
- label: 'Cui et al., PERFOPT-Bench: Evaluating Coding Agents on Software Performance
    Optimization'
  url: https://arxiv.org/abs/2607.07744
  date: 08-07-2026
- label: Braintrust, Using Braintrust to eval agentic setups from large-scale Hugging
    Face data
  url: https://www.braintrust.dev/blog/hf-agent-traces
  date: 24-06-2026
- label: 'Gorinova et al., Position: Coding Benchmarks Are Misaligned with Agentic
    Software Engineering'
  url: https://arxiv.org/abs/2606.17799
  date: 16-06-2026
contentHash: sha256:636d37f382b8133d
publishState: published
---


The analysis everyone cites to prove the harness beats the model puts the harness at about 5.3% of the variation in success and the model at 0.7% [s2], a ranking that dwarfs nothing. The entire model-versus-harness argument is a fight over roughly 6% of the outcome. I have argued the harness side of that fight myself, and I now think the two results the field cites together are jointly incompatible with the conclusion it cites them for.

## The number that crowned the harness also demotes it

Braintrust, analyzing large-scale Hugging Face agent traces, reports that the harness explains about 5.3% of the variation in success while the model explains about 0.7%, across 1,781 runs and 49k child spans [s2]. Quote that as a ratio and you get the slogan: the harness is more than seven times the model, so stop agonizing over model choice and go fix your scaffold. Read the same decomposition left to right instead and it says something the slogan suppresses. Those two figures sum to about 6, which leaves roughly 94% of the variation in success explained by neither knob.

That is the sentence I want to sit with, because it is the one the ratio hides. The field took a decomposition in which both terms are small, kept the comparison, and threw away the magnitudes. Nobody saying "the harness matters more than the model" means the harness explains most of what happens; they mean it outranks the other thing on the shortlist. The shortlist is the problem. It has two items on it, they are the two items with public leaderboards, and together they account for about a sixteenth of the outcome.

What lives in the other 94%? I do not know, and neither does anyone else, which is precisely my point. My candidates, offered as inference and not as a finding: how the work gets decomposed before an agent ever sees it, the quality of the prompt and the context it arrives with, the tooling and test harness around the repo, the data, and above all the difficulty distribution of the tasks themselves. None of that has a leaderboard. All of it is where I would expect the outcome to actually live.

## No global order to disclose

PERFOPT-Bench put 7 agent stacks, built from different LLMs and different agent frameworks, on 7 long-horizon optimization tasks, and found that performance is workload-dependent rather than determined by model identity alone: no single stack dominates, and changing the agent framework can materially change the same LLM's per-task speedup profile [s1].

This is a stronger and stranger result than the one it resembles. The familiar finding is that harness choice moves the score a lot, which is a variance claim: pin the model, swap the scaffold, watch the number jump. That complaint has an obvious remedy, and I have made it: report your harness, because the score without it is unidentifiable. PERFOPT-Bench is not making a variance claim. It is a reordering claim. The ranking of stacks changes with the workload, so there is no stable order underneath the noise. Disclosure cannot fix that. Disclosure fixes an undisclosed harness; it has nothing to say about a harness ranking that does not exist to be disclosed.

Gorinova and colleagues close the last exit. A coding agent in practice is not a model but a composite of models, harnesses, contexts, environments, and feedback signals, any one of which can move the benchmark score by margins comparable to those between adjacent model generations; and their third symptom is that the absence of signal at the level of individual harness components makes the end-to-end system score difficult to iterate on [s3]. So you cannot buy your way to the best harness, and you cannot iterate your way there either, because the score you would iterate against does not decompose. The procurement frame has no fallback.

> [!CONFIRMED]
> PERFOPT-Bench evaluated 7 agent stacks across 7 long-horizon optimization tasks and found no single stack dominates: hold the LLM fixed, swap the agent framework, and that same model's per-task speedup profile can materially change [s1].

> [!INFERRED]
> I read that as fatal to the procurement frame rather than as a caveat on it. What that buys you in practice: a stack topping someone else's benchmark tells you nothing you can act on, and the reporting convention I used to demand would not have rescued it.

## I argued the other side of this

I have written that the marginal reliability return sits on the harness and that the instrumentation is what you should buy. I was wrong about what the evidence licensed, and I want to be specific about the error rather than quietly restate it with softer verbs. My mistake was to treat a ranking as a mandate. The decomposition that made the harness the bigger term is the same decomposition that makes both terms small, and the benchmark that made the harness look decisive is the one that says its ranking flips across workloads. Taking my own position at its word is what breaks it.

## The strongest case against this

The best objection turns my own citation against my antecedent, and it comes in two halves that deserve full weight.

First: the argument needs the harness to dominate, and 5.3% against 0.7% is not domination. It is one near-negligible term a bit over seven times another near-negligible term, with roughly 94% unexplained by either. The payoff from routing is bounded by the size of the term you route over, so building per-workload eval infrastructure to capture some fraction of 5.3% is not an uncomfortable-but-correct conclusion but a category error: optimizing the third-order term because it happens to be the one somebody benchmarked.

Second: strip the numbers out and the move is generic. "No option dominates across all workloads, therefore selection is workload-conditional, therefore measure, therefore route only where volume justifies the cost" is equally true of compilers, databases, ORMs, and cloud regions. It is no-free-lunch with a new noun, and a thesis indistinguishable from the boring prior is the boring prior with a citation attached.

The first half lands, and conceding it is the whole point. Any version of this essay that ends in "therefore build routing infrastructure" is genuinely refuted by its own source, so I am not going to write that version. The routing frame is where this argument was heading, and it dies on the same number that killed procurement. But routing was never the load-bearing claim. If 5.3% is too small to route on, it is exactly as too small to standardize on. "Buy the good harness" dies alongside "route to the right harness", and the procurement conclusion people actually draw is unlicensed either way. The objection is not a refutation of my thesis; it is my thesis, stated by someone who thinks they are disagreeing.

The second half does not land, for one structural reason. No-free-lunch says the best tool varies, so measure, and it leaves the procurement frame standing with an asterisk taped to it. My claim is different in kind: two results that get cited in sequence, as complementary support for the same instruction, are jointly incompatible with it. Elevating the harness term and discovering that the harness term has no global ordering are not two caveats you stack. The first is what makes the second fatal. Had the model turned out to be the big term, workload-conditional harness rankings would be a footnote. The received wisdom manufactured its own undoing by promoting the one knob with no stable ranking. And unlike "your mileage may vary", which has no falsifier at all, this one does: show me that harness rankings are stable across workload classes and the argument is dead.

## What this actually licenses

Less than you would like. Pick a defensible default and stop. Route only where a workload is both high-volume and independently measurable, which is a small minority of teams and probably not yours; that narrowing is not a hedge but the only thing effect sizes this size support, and conceding it is what separates the argument from the platitude. Then spend the attention you were going to spend on stack selection on the 94% nobody is benchmarking.

There is one measurement worth running, and it costs a weekend rather than a quarter. Pin the model, swap only the framework, and read the per-task speedup spread across your own workload instead of a mean. If a stack wins on average while reordering task by task, you have reproduced the no-dominant-stack finding in your own numbers [s1], and you have learned the one thing a leaderboard structurally cannot tell you: whether the winner is winning on your work or on someone else's.

> [!WARNING]
> Cui's warning cuts against the instinct it triggers: raw speedup is unsafe as a benchmark score, because some large gains come from benchmark-specific shortcut exploitation [s1]. The stack with the best number is the stack most worth distrusting.

That is why the leaderboard cannot quietly stand in for the eval you never built: the score you would be shopping is partly a measure of how well a stack games the thing measuring it. Stop shopping the ranking, by all means, but treat that as a consequence, not the payload. The payload is that "the harness matters more than the model" was never a finding you could act on. It is a finding that revokes the action people take on it, and the honest response is to stop taking it.
