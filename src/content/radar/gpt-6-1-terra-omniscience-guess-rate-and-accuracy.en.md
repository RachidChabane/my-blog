---
translationKey: gpt-6-1-terra-omniscience-guess-rate-and-accuracy
lang: en
slug: gpt-6-1-terra-omniscience-guess-rate-and-accuracy
title: GPT-6.1 Terra launches at $1/$5 per million tokens, and Artificial Analysis
  measures it guessing on 38% of the questions it does not know, down from GPT-5.6
  Terra's 88%
publishDate: 28-10-2026
kind: release
tags:
- OpenAI
- GPT-6
- Artificial Analysis
- evals
summary: 'OpenAI has released GPT-6.1 Terra, available in its API as gpt-6.1-terra.
  Artificial Analysis dates the release October 26, 2026, and puts its price at $1/$5
  per million input/output tokens against $2/$12 for GPT-5.6 Terra. OpenAI says the
  error rate on its internal benchmark of error-inducing prompts fell from 53.6% to
  16.7% at low reasoning effort. Artificial Analysis says the model guesses on 38%
  of the AA-Omniscience questions it does not know, down from 88%, with accuracy up
  2 points. My call: add a path for fields the model leaves empty, then rerun your
  extraction evals at low and at maximum effort before migrating.'
sources:
- label: OpenAI, Introducing GPT-6.1 Terra
  url: https://openai.com/index/introducing-gpt-6-1-terra/
  date: 26-10-2026
- label: Artificial Analysis, GPT-6.1 Terra pushes the cost efficiency frontier
  url: https://artificialanalysis.ai/articles/gpt-6-1-terra-pushes-the-cost-efficiency-frontier
  date: 26-10-2026
contentHash: sha256:49ff0ea04e9a5c4c
publishState: published
---

## What changed

OpenAI has released GPT-6.1 Terra, and developers can call it through the OpenAI API as `gpt-6.1-terra` [s1]. Artificial Analysis dates the release October 26, 2026, and puts its price at $1/$5 per million input/output tokens against $2/$12 for GPT-5.6 Terra [s2]. OpenAI lists cached input at $0.05 per million tokens [s1]. Both posts report a lower rate of wrong answers, each on its own test [s1][s2].

## Where the 50 points went

I think factuality matters more than the price for the work OpenAI pitches this model at: reading incoming invoices and entering their details into accounting software [s1]. Artificial Analysis reports that GPT-6.1 Terra guesses 38% of the time when it does not know the answer to an AA-Omniscience question, against 88% for GPT-5.6 Terra [s2].

> [!CONFIRMED]
> Artificial Analysis couples that 50 point drop in hallucination rate with a 2 point increase in AA-Omniscience accuracy [s2].

> [!INFERRED]
> My reading: the model knows only a little more and declines far more often, so an extraction pipeline will see fewer confident wrong values and more empty fields.

OpenAI's own test adds a second dial. On its internal benchmark of error-inducing prompts, OpenAI puts the error rate at 16.7% at low reasoning effort, down from 53.6% with GPT-5.6 Terra, and at 4.3% at maximum effort [s1]. In my view that makes reasoning effort a factuality setting for this model as well as a cost setting.

## The strongest objection

Neither test measures extraction. Artificial Analysis calls AA-Omniscience its private knowledge and hallucination benchmark [s2], and OpenAI describes an internal benchmark of error-inducing prompts [s1], while invoice entry reads its answers off a document in context. I agree, and a model that guesses less is no licence to drop field validation. That is why I take the direction from the two tests and leave the size to your own evals.

## Impact on your team

My call, if you run document extraction on GPT-5.6 Terra: before migrating, add an explicit path for a field the model leaves empty, because a parser that expects every field filled turns fewer wrong values into failed jobs. Then rerun your extraction evals at low and at maximum reasoning effort, and count empty fields separately from wrong ones. Pick the effort level from that run: OpenAI's own figures say the setting moves the error rate [s1]. I would not migrate on the price alone.
