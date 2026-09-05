---
translationKey: repair-guidance-loses-to-resampling
lang: en
slug: your-repair-loop-is-buying-samples-it-already-had
title: Your repair loop is buying samples it already had
publishDate: 05-09-2026
tags:
- agentic-coding
- evaluation
- agents
category: essays
difficulty: 3
sources:
- label: arXiv 2609.00854, a placebo-controlled study of test-guided code repair
  url: https://arxiv.org/abs/2609.00854
  date: 01-09-2026
- label: arXiv 2609.01106, evaluating skills transfer from hints in code generation
  url: https://arxiv.org/abs/2609.01106
  date: 01-09-2026
contentHash: sha256:5bd5a99f13729c73
publishState: published
---


Localize the fault, infill the suspect span, and you lose to one more plain sample at the same attempt count [s3]; the delivery step costs more than the signal is worth. I think that reframes the whole build-or-skip decision, and the applicability ceiling underneath it is worse than the effect size [s2].

The reflex in a repair loop is to spend engineering effort on the signal: better tests, a better spectrum, a better hint, a sharper guess at the failing line. That effort buys a targeted edit, and the targeted edit is supposed to beat a blind retry because it knows something the retry does not. Two teams checked that assumption against the cheapest control available to them, and the control held both times. I now start from a negative prior for this shape of stage, and the interesting question is where that prior stops applying.

## The control arm both teams ran

Both papers do the same unglamorous thing: they hold the budget fixed and add an arm that receives no guidance. The repair study applies three arms to the same failed candidate: blind whole-solution resampling, spectrum-based localization followed by suspect-span infilling, and same-length infilling at a disjoint random code span [s1]. That third arm is a placebo. It edits the same amount of code in the wrong place, which is what separates the value of the edit shape from the value of knowing where to edit.

The hint study asks the matching question one stage earlier, in generation rather than repair. When a hint turns a failing generated program into a passing one, does it provide missing information, or does it merely steer the model toward a solution it could already produce [s8]? Framing the question that way makes the control obvious. If the model could already produce the solution, more plain samples ought to find it.

In my experience that arm rarely survives contact with a production repair loop. The loop gets built, the guidance gets tuned, and the comparison that would price the stage against plain resampling at the same budget is the experiment that keeps getting postponed. I think that habit is the expensive one, and it is why two narrow negative results deserve more attention than their abstracts will get.

## Most failures never qualify for guidance

Before effect size there is a prior question: how often can the stage fire? The repair study reports that only 9.0% of failing candidates expose a failing public test with a usable spectrum [s2]. That is a ceiling on the entire intervention, fixed before any argument about how well localization performs.

A ceiling like that changes the arithmetic of building the stage. Engineering cost is paid once for the pipeline and again on each failure that flows through it, while the benefit is collected on a thin slice of traffic. I think this is the number to compute first against your own failure corpus, because it is cheap to measure and it can end the discussion before anyone writes a line of localization code.

> [!WARNING]
> I think the applicability question comes first: before you price a stage on how well it performs, ask what share of your failures it can even fire on.

The share is corpus-specific, so treat the reported figure as a shape rather than a constant. What travels between corpora is the ordering of the two questions.

## Where the loss actually comes from

Now the effect size, and it runs backwards. Among the 177 candidates localizable from a strong suite, localized infilling loses decisively to blind resampling at a matched attempt count [s3]. That is not parity: it is a loss, at equal budget, against the least sophisticated baseline in the building. The loss replicates in a third model family at 11.3 points [s3], so it is hard to write off as a quirk of one checkpoint.

The natural objection is that attempts are the wrong unit, because a span edit is far cheaper than a whole solution. Repricing in tokens narrows the gap without closing it: a span attempt spends 21.7 generated tokens against 371.1, yet 16 localized attempts reach 6.8% while one blind attempt already reaches 10.1% [s5]. Sixteen cheap shots lose to one expensive shot.

| Arm | What one attempt costs | What the budget reaches |
| :--- | :--- | :--- |
| Blind whole-solution resampling | 371.1 generated tokens [s5] | one attempt already reaches 10.1% [s5] |
| Spectrum plus suspect-span infilling | 21.7 generated tokens [s5] | 16 attempts reach 6.8% [s5] |
| Same-length infill at a random span | the placebo arm [s1] | localized infilling leads pooled, suggestive only [s4] |

The mechanism sits in the same paper, and it is the part I keep coming back to. Infilling reproduces the removed span verbatim in 48.9% of attempts, which is why more budget does not help [s6]. Handed a hole where the bug is, the model writes the bug back. That is a named failure mode rather than a tuning problem, and it explains the curve: adding attempts multiplies a step whose modal output is its own input.

Be exact about what loses here. The losing arm is a delivery mechanism: locate a suspect span, then rewrite that span at the same length. The result indicts that delivery step rather than the idea of knowing where the fault is, and the strongest counter-argument to my reading turns on precisely that distinction.

## What a hint actually transmits

The second paper runs the same experimental shape on hints, and its numbers are blunt. Phi-3.5-mini shows the pattern clearly: relevant hints rescue 42 of 101 failures, an unrelated hint rescues 17, and unhinted sampling solves 57, including 36 of the 42 relevant-hint rescues [s10].

Read the unrelated-hint column before the relevant one. A hint with no bearing on the bug still rescues a meaningful number of failures, which is difficult to explain if hints are carrying task information. Mechanistic tests on Qwen identify a stable activation direction shared by relevant and unrelated hints [s12]. One direction, two kinds of hint, and the direction does not know which kind it received.

> [!CONFIRMED]
> For Qwen2.5-3B-Instruct, adaptive relevant hints rescue 36 of 79 selected failures, an unrelated hint rescues 19, and eight unhinted samples recover 31 of those 36 rescues [s9].
> The authors conclude that most rescued solutions are already reachable through ordinary sampling [s13].

> [!INFERRED]
> I think that is a pricing signal rather than a null result: the hint is buying attempts, so I would spend the same attempts on plain samples before I build a hint stage.

The authors stop short of the stronger claim, and they are right to: what they establish is that the internal interventions tested do not establish task-general capability transfer [s13]. The engineering reading is blunter. If a hint stage and an equal budget of plain samples recover the same failures, the hint stage is paying for infrastructure to reach solutions the sampler was going to reach anyway.

## Where my case is weakest

The strongest case against my reading is in the papers themselves, and it deserves stating before I answer it.

Start with the placebo arm, because it cuts against me. Against the random-span placebo, localized infilling leads pooled, and the authors report the location effect as suggestive rather than established [s4]. Location is doing something. A reader who leaves believing fault localization has been refuted has read past the paper's own hedge, and has taken a result about one delivery mechanism for a result about a signal.

The scope is narrow too. The repair study restricts its localization conclusions to the 24-32B models tested [s7], which is a genuine bound: a stronger model with better span-level editing could plausibly invert the token accounting. The hint study concedes its own limit as well, that because its hint conditions use different attempt budgets, the comparisons do not isolate a purely semantic effect [s11]. That concession is not decorative; unequal budgets are the exact confound my argument spends its time avoiding.

Here is why I hold the position anyway. The applicability ceiling is a prior question the efficacy dispute cannot reach: when the stage fires on 9.0% of failing candidates [s2], a favourable resolution of the placebo argument still moves a thin slice of outcomes. And the unequal-budget caveat [s11] cuts against a semantic reading of the hint effect; it leaves the redundancy count untouched, because that count is plain arithmetic over which failures unhinted sampling recovers. The bound I accept is therefore narrow, and I would rather state it than smuggle it: for these two mechanisms, at these scales, the correct default prior is negative rather than neutral, and it points at the delivery step rather than at the signal.

## What I do before adding a stage

The practical version fits in three questions, and answering them takes less time than building the thing.

What share of my failures can this stage fire on? Measure it against a recorded failure corpus before writing the stage, because that ratio caps the value of everything downstream of it.

What does the same budget buy in plain samples? This is the arm to run, and it is cheap: no new machinery, a loop and a counter. Its absence is what makes a pass-rate improvement uninterpretable, since a stage that adds attempts has been handed two advantages and credited with one.

If the stage does win, does it win on the signal or on the delivery? A placebo arm answers that, and it is the least expensive experiment in either paper: same edit shape, wrong location.

My quarrel is not with localization signal or with hints. It is with the step that converts a signal into an edit, which is where the value leaks, and the leak is measurable with an arm you can build in an afternoon. Price the guidance against the samples you already know how to buy, and let the comparison decide.
