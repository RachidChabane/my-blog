---
translationKey: muse-wonder-api-model-and-subscription-only-full
lang: en
slug: meta-muse-wonder-api-model-full-subscription-only
title: Meta's Model API serves muse-wonder-1.0 at $4/$20 per million tokens, and Muse
  Wonder Full stays inside Muse Code subscriptions
publishDate: 13-10-2026
kind: release
tags:
- Meta
- Muse Wonder
- Muse Spark
- agents
- coding
summary: On October 12, 2026, Meta put Muse Wonder on Meta Model API as muse-wonder-1.0,
  in preview, at $4.00 per million input tokens and $20.00 output in Standard mode,
  while Muse Wonder Full stays in Muse Code on the Power Usage and Maximum Usage plans.
  On Model API, Contributor mode, the discount for letting Meta train on your content,
  stops at Muse Spark. I would keep Contributor workloads on Spark and price any move
  to Wonder on both input rates, cached and uncached.
sources:
- label: Meta Developers blog, "Put your ideas to work with Muse Wonder and Muse Wonder
    Full"
  url: https://dev.meta.ai/resources/blog/build-with-muse-wonder
  date: 12-10-2026
- label: Meta Model API docs (undated page), "Models"
  url: https://dev.meta.ai/docs/models
  date: 12-10-2026
- label: Meta Model API docs (undated page), "Pricing and rate limits"
  url: https://dev.meta.ai/docs/pricing-rate-limits
  date: 12-10-2026
- label: 'Artificial Analysis, "Muse Wonder and Muse Wonder Full: a material jump
    in intelligence over previous Meta models"'
  url: https://artificialanalysis.ai/articles/muse-wonder
  date: 12-10-2026
- label: 'The Rundown, "Muse Wonder: How to Use Meta''s New AI for Work"'
  url: https://app.therundown.ai/guides/muse-wonder-guide
  date: 12-10-2026
contentHash: sha256:5b162d42c1b9db22
publishState: published
---

## What changed

On October 12, 2026, Meta launched Muse Wonder on Meta Model API and in Muse Code at $4 input and $20 output per million tokens, and made Muse Wonder Full available exclusively by subscription in Muse Code [s1]. On the API the model is `muse-wonder-1.0`, in Standard mode only, while Full is listed as not available there and sits on the Power Usage and Maximum Usage plans [s2].

## Where the discount ends

I think the row to read on this launch is the empty one. Meta's price sheet for Model API, per million tokens [s3]:

| Model | Mode | Cached input | Input | Output |
| :--- | :--- | ---: | ---: | ---: |
| `muse-wonder-1.0` | Standard | $0.20 | $4.00 | $20.00 |
| `muse-wonder-1.0` | Contributor | Not available | Not available | Not available |
| `muse-spark-1.3` | Standard | $0.15 | $1.25 | $4.25 |
| `muse-spark-1.3-contributor` | Contributor | $0.002 | $0.10 | $0.20 |

On Model API, Contributor mode runs the same models at heavily discounted token prices in exchange for permission to use your content to train future Meta models, and it isn't available for Muse Wonder [s3]. Artificial Analysis puts input, cached input included, at 76% of the cost of a Muse Wonder (max) task on its Intelligence Index [s4]; in my reading, both input columns are the ones to price.

## Wonder against Full

Meta's strongest argument is that the API loses little: its blog says Muse Wonder "brings comparable performance to Muse Wonder Full" [s1].

> [!CONFIRMED]
> Artificial Analysis scores Muse Wonder at 52 and Muse Wonder Full at 56 on its Intelligence Index v4.3, both at max reasoning effort [s4].

> [!INFERRED]
> In my reading, that gap matters less than the fact that no API price exists for Full.

Artificial Analysis notes that Full is not priced per token, so it publishes no cost per task for it [s4], and The Rundown's price table lists no public per-token rate for Full [s5]. A Full run inside Muse Code tells you what the subscription buys. It tells you nothing about an API bill.

## Impact on your team

If an agent runs on `muse-spark-1.3-contributor` today, switching the model to `muse-wonder-1.0` moves its rates from $0.002 to $0.20 per million cached input tokens and from $0.10 to $4.00 per million input tokens, with no Contributor variant to fall back on [s3]. My call: leave the Contributor workloads on Spark, and send to Wonder only the jobs that already pay Standard rates. If you need Full, the route is a Muse Code subscription on Power Usage or Maximum Usage [s2]. Before migrating an audio pipeline, note that Meta says audio-dependent use cases require confirmation of audio support on the release surface [s1]. The model is in preview [s2], so I would not lock a budget to these rates yet.
