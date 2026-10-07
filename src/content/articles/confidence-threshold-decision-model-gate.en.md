---
translationKey: decision-model-confidence-gate
lang: en
slug: confidence-threshold-decision-model-gate
title: A confidence threshold should not carry a decision-model gate alone
publishDate: 07-10-2026
tags:
- evaluation
- agents
category: essays
difficulty: 3
sources:
- label: TypeSafe blog, introducing System One models and Jev, calibrated decisions
    claim
  url: https://typesafe.ai/blog/introducing-system-one-models-and-jev
  date: 15-09-2026
- label: Synthpop, does a decision model know when it is guessing, audit subject
  url: https://www.synthpop.ai/resources/does-a-decision-model-know-when-it-is-guessing-post-1
  date: 01-10-2026
- label: arXiv 2610.01006, Beyond Answer Confidence, preprint by the Synthpop audit
    authors, abstract
  url: https://arxiv.org/abs/2610.01006
  date: 01-10-2026
- label: TypeSafe docs, Confidence, high-confidence range
  url: https://docs.typesafe.ai/confidence
  date: 07-10-2026
- label: TypeSafe docs, Jev 1.13 jaggedness, failure-mode table row on choice option
    order
  url: https://docs.typesafe.ai/model-jaggedness/jev-1.13
  date: 07-10-2026
- label: Bartosz Mikulski, TypeSafe's Jev can't see, test setup
  url: https://mikulskibartosz.name/typesafe-jev-guess-what-i-drew
  date: 19-09-2026
contentHash: sha256:34dee03e501073f4
publishState: published
---


I think a confidence threshold should not carry the weight of a decision-model gate, because the inputs a gate exists to stop are where the number often stays high. The team that audited TypeSafe's Jev reports that confidence tracked accuracy on familiar closed-choice tasks, yet often stayed high when the prompt held no basis for an answer [s5]. Those are two problems with two different fixes, and in my reading only one of them can be closed before the model is asked.

## The threshold carries the weight where the number means least

In my experience the routing table a vendor ships is the gate teams copy, so I start there. It arrives with the model and turns a probability into an action in one line of configuration. TypeSafe's confidence page says to act automatically at high confidence, because the model has a clear read and you can proceed without human involvement [s12]. The same page reads low confidence as the model telling you it does not have enough information, and says to route those cases to a human or fall back to another system [s13].

That table assumes the no-information case announces itself as low confidence. The audit gives me no reason to trust that: the authors find Jev's confidence useful on familiar ground and unreliable beyond it, and they add that correcting the number afterwards does not help [s8]. If your act-automatically band starts below where the number sits on a prompt with no basis for an answer, that prompt goes straight through to an automated action, and nothing in the logs marks it.

I would not build a gate on that hope.

## What TypeSafe promises

The launch post promises calibrated decisions: answers with epistemically honest probabilities on System One tasks [s1]. Its case for automation is sharper, and I agree with it: if a model can do a task 95% of the time but does not say when it is in the 5%, it cannot automate that task [s2].

Those are two different properties, and in my reading the launch post runs them together. Calibration is a statement about averages: across many answers given at a stated probability, about that share should be right. The automation argument is about individual answers, and a gate acts on one answer at a time. A model can be well calibrated over a benchmark and still answer confidently on the one input where it had nothing to go on. The team's paper draws the same line between average behaviour and the single case [s9].

I take the automation argument at its word, which is why I care where the misses hide.

## What the audit of Jev measured

The audit comes from Synthpop. The team writes that it tested the best-known decision model, Jev from TypeSafe AI [s3]. They report putting both of TypeSafe's claims through about 575,000 Jev calls [s4]. Everything below is the team's own report on one model.

On familiar closed-choice tasks, the team reports, confidence tracked accuracy well and supported useful filtering; when the prompt contained no basis for an answer, or the question fell beyond the observed knowledge boundary, confidence often stayed high [s5]. The second part is where a gate earns its keep or fails.

One of their tests shows what that looks like. The authors report that Jev was still 32 to 36% sure of its top pick on average, while an even split across the options would be about 1%, which is roughly how often it was right [s6].

Picture that result on an operations dashboard. It reads as a moderate answer from a model weighing its options, and nobody pages an engineer for a moderate answer. Whether a threshold lets it through depends on where you set it, and I think that is why the threshold should not be the control for this case.

## Why an answer that survives reordering proves nothing about grounds

When I worry that a model is guessing, the check I reach for first is to shuffle the options and see whether the answer moves. TypeSafe's documentation lists the same check, reordering the options and checking the answer is consistent, as its remedy for option-order bias [s15]. The page offers it for that bias. Stretching it into a guess detector is my move, and I doubt I am alone in making it.

> [!CONFIRMED]
> On a question about a fair die, where nothing favours "one" [s10], the authors report Jev picked "one" in all 720 orders of the six options, with 0.80 on average [s7].

> [!INFERRED]
> That answer passes the reorder-and-compare check every time. What the check measures is whether the model agrees with itself, and I would not read grounds into it.

In my reading, the die result takes away the cheapest guess detector I had. A model that has learned a preference for one option can hold it in every order you try, and the consistency check rewards it. The team's paper names the underlying gap: calibration makes the probabilities useful on average, but does not establish whether low confidence reflects chance or missing knowledge [s9]. If the output cannot tell you whether the model had grounds, the check for grounds has to look at the input.

## The case for the threshold, and my answer

The strongest case against me is TypeSafe's own: a model that does not say when it is in the 5% cannot automate the task [s2], so a model that does say it is exactly what a gate needs. On familiar ground the team found that confidence did that job and supported useful filtering [s5]. TypeSafe's docs then tell you to start with conservative thresholds, test with your own data, and adjust as you observe results [s14]. Follow that advice and you get a filter that works on the traffic you have seen.

I have two answers. First, familiar ground was never where the threshold struggled: the authors place the failure beyond it [s8], so tuning on more of the same data sharpens the filter where it already works. Second, "your own data" means labelled data. In my experience a labelled set rarely holds questions that have no answer, because nobody labels a case with nothing in it. The no-basis case is usually absent from the very data the threshold is tuned on, so careful tuning has little chance to see it.

So I keep the threshold, and on familiar ground I would use it exactly as TypeSafe describes. I just would not let it stand alone between a blank input and an automated action.

## Check the input first, then measure the leak

The structure I would build on separates failures that look identical in a log line: a confident answer, an automated action, no flag.

| Case | Where it lives | What the evidence shows | Control I would use |
| :--- | :--- | :--- | :--- |
| No basis in the prompt | the input | confidence often stayed high [s5] | deterministic checks before the model |
| Beyond what the model knows | the model | confidence often stayed high [s5] | a person on cases outside the validated range |
| A pull toward one answer | the answer distribution | "one" in all 720 orders [s7]; airplane for 209 of 400 drawings [s17] | an answer-share alarm |
| Familiar ground | neither | confidence tracked accuracy [s5] | the threshold |

The gate I would ship:

```python
def route(case, model, threshold):
    if missing_required_fields(case) or not case.retrieved_evidence:
        return "human"  # nothing to decide on: never ask the model
    answer = model.decide(case)
    if answer.confidence < threshold:
        return "human"
    return answer

def leak(cases, model, threshold):
    stripped = [strip_evidence(case) for case in cases]
    return [c for c in stripped if model.decide(c).confidence >= threshold]
```

The order matters. The input checks are cheap, deterministic and impossible for the model to argue with: a required field is present or absent, and retrieval returned documents or came back empty. A case with nothing to decide on never reaches the threshold at all. `leak()` measures what happens without that layer: it strips real cases of their evidence and runs the threshold alone on the copies. Every copy it returns is traffic the threshold would automate on nothing. I read any nonzero count as a measurement of that leak, and I would run it in CI whenever the model version or the threshold changes.

A presence check catches an empty field, but a field filled with irrelevant text passes it untouched. So I would also strip by substitution, swapping the evidence for unrelated text of the same shape, and I would expect that variant to slip past both checks. That is where the residual begins.

An outside tester saw the third row of the table from another angle. Bartosz Mikulski turned his drawings into text and had Jev guess what he had drawn [s16]; Jev answered airplane for 209 of the 400 drawings [s17]. In my reading that is the same pull toward one answer the die showed, visible in the answer distribution without reading a single probability. That gives me the third control: track the share each answer takes of live traffic, and page someone when one option takes an outsized share. It is deterministic, it sits outside the model, and the model cannot talk its way past it.

> [!WARNING]
> The failure mode I would name is the confident blank: an input with nothing to go on, a probability that reads like knowledge, and an automated action nobody reviews.

## What neither control closes

The second row of the table is the hard one. The fields are present, retrieval returns something, and the model still does not know the answer. This is the beyond-boundary case from the audit's finding above, where the team saw confidence often stay high as well [s5]; it is also the ground where the authors found the number unreliable [s8]. Input checks pass it, and a threshold often lets it through.

My recommendation is to keep a person on decisions outside the task range the gate was validated on, and to treat that traffic as a bounded residual with a named owner. Naming it is what lets someone budget for it.

> [!NOTE]
> This argument rests on one model tested by one team. The authors say other versions and model families may behave differently [s11], and the post marks a disclosure of any commercial relationship with TypeSafe as pending author confirmation [s18]. Run `leak()` on your own model before you trust its number.

A gate that has never seen a blank input has not been tested.
