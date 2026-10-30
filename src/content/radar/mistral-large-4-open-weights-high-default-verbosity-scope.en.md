---
translationKey: mistral-large-4-open-weights-high-default-verbosity-scope
lang: en
slug: mistral-large-4-open-weights-high-default-verbosity-scope
title: Mistral Large 4's open weights are out, and Artificial Analysis measures its
  High setting at 110M tokens on the Intelligence Index, somewhat verbose, where Mistral
  cites 47% fewer tokens than GLM-5.3 on the Coding Agent Index
publishDate: 30-10-2026
kind: release
tags:
- Mistral
- Mistral Large 4
- Artificial Analysis
- evals
summary: 'Mistral has released the weights of Mistral Large 4, and Artificial Analysis
  dates the release October 29, 2026. Mistral says it scores 48% on the Artificial
  Analysis Coding Agent Index, effectively tied with GLM-5.3 while using 47% fewer
  tokens per task. On its Intelligence Index, Artificial Analysis measures the High
  setting at 110M tokens, somewhat verbose against the median of 100M, and Medium
  at 73M. Mistral''s model card makes high the default reasoning effort. My call:
  log output tokens per task on your own mix at medium and at high before you size
  a budget or set reasoning_effort.'
sources:
- label: Mistral, Mistral Large 4 (Le Chonk) is now open weight
  url: https://mistral.ai/news/mistral-large-4-oss/
  date: 29-10-2026
- label: Artificial Analysis, Mistral Large 4 (High) model page
  url: https://artificialanalysis.ai/models/mistral-large-4
  date: 29-10-2026
- label: Hugging Face, mistralai/Mistral-Large-4-1T-A52B model card
  url: https://huggingface.co/mistralai/Mistral-Large-4-1T-A52B
  date: 29-10-2026
- label: Artificial Analysis, Mistral Large 4 (Medium) model page
  url: https://artificialanalysis.ai/models/mistral-large-4-medium
  date: 29-10-2026
contentHash: sha256:b74968ef60dcfa62
publishState: published
---

## What changed

Mistral has released the weights of Mistral Large 4 under the Mistral Ecosystem Open-Weight license, a modified MIT license [s1]. Artificial Analysis says Mistral Large 4 (High) was released on October 29, 2026, and that its weights can be downloaded for self-hosting [s2]. Mistral's model card describes a 1 trillion-parameter Mixture-of-Experts model with 49 billion active parameters per token, and high as the default reasoning effort [s3].

## Two token figures, two indexes

I think the token claim needs a slow read. Mistral says that on the Artificial Analysis Coding Agent Index, the model scores 48%, effectively tied with GLM-5.3 while using 47% fewer tokens per task on average, and its chart plots that 48 as Mistral Large 4 - High [s1]. Artificial Analysis measures the High setting on its Intelligence Index: 26 points, 110M tokens, somewhat verbose against the median of 100M, and $2.06 per task to evaluate [s2]. On the same index, Artificial Analysis gives Medium 23 points, 73M tokens, fairly concise, and $1.41 per task to evaluate [s4].

> [!CONFIRMED]
> Mistral's model card says the default reasoning effort is high, and that `max_completion_tokens` includes reasoning tokens as well as visible output tokens [s3].

> [!INFERRED]
> My reading: if the card's high is the High that Artificial Analysis measured, keeping the default runs every request at the setting graded somewhat verbose, and a `max_completion_tokens` sized for the answer alone can run out on reasoning first.

## Both figures hold

The strongest objection is that the two figures are compatible. Mistral's 47% is measured against GLM-5.3 on the Coding Agent Index, while Artificial Analysis grades verbosity against a median token count on its Intelligence Index [s1][s2]. I agree. That is why I would not size a budget on either one: neither was measured on your tasks, and Mistral's figure is relative to another model.

## Impact on your team

My call, if you plan to serve the weights with vLLM or SGLang as Mistral suggests [s1]: before you size a node or a token budget, run your own task mix at medium and at high, and log output tokens per task next to the score. Then set `reasoning_effort` per request from that log, and size `max_completion_tokens` for reasoning plus answer. I would not copy Mistral's 47% fewer tokens than GLM-5.3 on the Coding Agent Index into a capacity plan before your own log shows it.
