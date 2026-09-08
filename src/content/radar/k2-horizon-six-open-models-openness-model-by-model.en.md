---
translationKey: k2-horizon-six-model-fleet-and-per-model-open-artifacts
lang: en
slug: k2-horizon-six-open-models-openness-model-by-model
title: K2 Horizon ships six open models from 0.9B to 375B, and the openness arrives
  model by model
publishDate: 08-09-2026
kind: release
tags:
- IFM
- MBZUAI
- K2 Horizon
- open weights
- agents
summary: 'MBZUAI''s Institute of Foundation Models launched K2 Horizon on 3 September
  2026, six models from 0.9 billion to 375 billion parameters, and the announcement
  states that every one is released fully open [s1]. A reading of the published model
  cards puts that on a gradient: the 3.7B and 7B ship with data, recipe and code,
  while the 375B-A23B and 36B-A4B cards say those artifacts will be released [s2].'
sources:
- label: Institute of Foundation Models launch announcement
  url: https://mbzuai.ac.ae/news/mbzuais-institute-of-foundation-models-launches-k2-horizon-the-worlds-largest-fully-open-ai-models-in-history/
  date: 03-09-2026
- label: CellCog reading of the published model cards
  url: https://cellcog.ai/blog/k2-horizon/
  date: 04-09-2026
- label: Moor Insights and Strategy analyst account
  url: https://moorinsightsstrategy.com/mbzuai-ifm-launches-6-k2-horizon-frontier-models-doubles-down-on-openness-analyst-insight/
  date: 03-09-2026
contentHash: sha256:377c564abd03ac5a
publishState: published
---

## What changed

MBZUAI's Institute of Foundation Models launched K2 Horizon on 3 September 2026: six models from 0.9 billion to 375 billion parameters sharing one architecture [s1]. The announcement states that every model is released fully open, with weights, code, training data and methodology, and calls it the largest fully open release in AI history [s1]. CellCog records Apache 2.0 for weights and code, and day-zero support in vLLM, SGLang and Ollama [s2].

## Openness, model by model

The claim is checkable, and somebody checked it. CellCog read the published model cards and found the fleet-level headline does not hold model by model [s2]:

| model | what its card says today [s2] |
| --- | --- |
| 3.7B and 7B | data, recipe and code ship now |
| 32B | a Stage 1 checkpoint, the final one still to come |
| 36B-A4B and 375B-A23B | intermediate checkpoints, data and training code will be released |

That reading covers five of the six models [s2]. I read the gradient as the opposite of a broken promise: the cards publish the schedule for what is missing, so the gap is declared rather than found. Moor Insights names the artifact that matters, a per-model development tree of intermediate checkpoints and post-training branches showing how a base model becomes the reasoning and agentic variants [s3]. That tree is what the two largest models still owe you.

> [!IMPORTANT]
> The Openness Index figures on record are for IFM's previous release, not for K2 Horizon: the analyst checked them the day before this launch and found four of the five models scoring 89, the top score, were MBZUAI IFM models [s3]. Do not carry that over. Liu's line in the same piece is the standard to hold it to: "Openness isn't a slogan we ask you to accept. It's a list we ask you to check." [s3]

## Impact on your team

Decide which end of the fleet you are buying. If you want a model you can rerun, the 3.7B and 7B are the only two whose data, recipe and code are on the table today [s2]: a real on-device tier, and small. If you want the 375B-A23B or the 36B-A4B, you are taking Apache 2.0 weights [s2] plus a published intention, which beats most open-weight drops and is still not reproducibility. Keep "fully open" out of a procurement document for those two until the checkpoints land.

The deadline is not IFM's, it is yours: pick a date to re-read the 375B-A23B and 32B cards, because nobody notifies you when a Stage 1 checkpoint becomes final [s2]. Day-zero serving support [s2] makes the evaluation an afternoon: run the 7B against whatever open model you serve today.
