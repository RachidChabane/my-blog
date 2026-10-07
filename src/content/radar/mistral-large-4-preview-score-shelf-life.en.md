---
translationKey: mistral-large-4-preview-still-in-training-measured-at-half-price
lang: en
slug: mistral-large-4-preview-score-shelf-life
title: Mistral Large 4 previews at 50% off for two weeks with its reinforcement learning
  run still in flight, and Artificial Analysis scores the snapshot at 38
publishDate: 07-10-2026
kind: release
tags:
- Mistral
- Mistral Large 4
- evals
- pricing
summary: Mistral opened mistral-large-4 in Public Preview with launch pricing at 50%
  off for two weeks, and says the reinforcement learning run behind it is still in
  flight. Artificial Analysis measures the preview at 38 on its Intelligence Index
  and $0.57 per task with the discount, $1.13 at standard pricing. I would run my
  own evals now, budget at standard pricing, and re-run them before routing production
  traffic.
sources:
- label: Mistral docs, "Changelog"
  url: https://docs.mistral.ai/getting-started/changelog
  date: 06-10-2026
- label: Mistral docs, "Mistral Large 4" model card
  url: https://docs.mistral.ai/models/mistral-large-4-0
  date: 06-10-2026
- label: Mistral, "Introducing Mistral Large 4"
  url: https://mistral.ai/news/mistral-large-4/
  date: 06-10-2026
- label: Artificial Analysis, "Mistral has released Mistral Large 4"
  url: https://artificialanalysis.ai/articles/mistral-large-4-france-ai
  date: 06-10-2026
contentHash: sha256:3855ffcd19b7be5c
publishState: published
---

## What changed

On October 6, 2026, Mistral put Mistral Large 4 in Public Preview on its API under the id `mistral-large-4` [s1][s2]. Launch pricing is 50% off for two weeks: $0.68 per million input tokens and $2.09 per million output tokens, against $1.36 and $4.18 at standard pricing [s1][s2]. Artificial Analysis scores the preview 38 on its Intelligence Index, alongside GPT-6 Luna (max, 38) and DeepSeek V4.1 Flash (max, 39) [s4].

## A score with an expiry date

I think the number to handle with care is the 38 Artificial Analysis gives the preview, because the model it scored is still moving. The reinforcement learning run behind this preview is still in flight, Mistral writes, and it expects large and rapid improvements in the weeks and months to come [s3].

> [!IMPORTANT]
> Artificial Analysis measures $0.57 per Intelligence Index task for the preview with the launch discount, and $1.13 at standard pricing [s4]. A cost model built on the first figure breaks the day the discount ends.

So the two figures a team would act on this week describe one build at one price. The price has a fixed two-week horizon; neither Mistral nor Artificial Analysis gives the score an end date.

The fair objection is that every hosted model drifts under a stable id, so a preview that moves tells you nothing new. The difference is that the vendor says it about this build, in its launch post, while the price window sits in its changelog [s1][s3]. Treat it as a schedule.

## Impact on your team

If you are deciding whether to route traffic to Mistral Large 4, the two-week discount is an eval window, and that is how I would spend it. Run your own eval suite against `mistral-large-4` this week, store the run date next to every score, and cost it at standard token rates [s1]. My call: no production routing until the same suite has run again after the launch pricing ends, because that is the first run whose price you will actually pay.

The failure mode I would guard against is quieter: an internal comparison sheet that still shows, weeks later, the 38 and the $0.57 per Intelligence Index task that Artificial Analysis measured for the preview, after the discount has expired and the reinforcement learning run Mistral described as still in flight has had time to land.
