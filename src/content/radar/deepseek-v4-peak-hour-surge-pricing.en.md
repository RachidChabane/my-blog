---
translationKey: deepseek-v4-peak-hour-surge-pricing
lang: en
slug: deepseek-v4-peak-hour-surge-pricing
title: DeepSeek adds peak-hour surge pricing to its V4 API, and time-of-day becomes
  a routing dimension
publishDate: 11-07-2026
kind: release
tags:
- DeepSeek
- DeepSeek-V4
- inference
- pricing
- routing
summary: 'DeepSeek told API subscribers on 2026-06-30 that its V4 API switches to
  peak and off-peak pricing at the mid-July GA: calls in two daily Beijing windows
  bill at 2x. The real change is that time-of-day is now a routing dimension your
  gateway has to reason about.'
sources:
- label: Origin-adjacent - TechNode, 'DeepSeek to launch V4 in mid-July with new peak-time
    API pricing'
  url: https://technode.com/2026/06/30/deepseek-to-launch-v4-in-mid-july-with-new-peak-time-api-pricing/
  date: 30-06-2026
- label: Corroboration - South China Morning Post, 'After triggering price war, DeepSeek
    reverses course with surcharge on peak-hour API use'
  url: https://www.scmp.com/tech/big-tech/article/3358868/after-triggering-price-war-deepseek-reverses-course-surcharge-peak-hour-api-use
  date: 30-06-2026
- label: Corroboration - TheRouter.ai, 'DeepSeek V4 Peak-Hour Pricing Makes Time-of-Day
    a Routing Dimension Every AI Gateway Must Support'
  url: https://therouter.ai/news/deepseek-v4-peak-hour-pricing-routing/
  date: 06-07-2026
- label: Primary - DeepSeek API Docs, 'DeepSeek V4 Preview Release'
  url: https://api-docs.deepseek.com/news/news260424/
  date: 24-04-2026
contentHash: sha256:88447de525e0c67f
publishState: published
---

## What changed

DeepSeek emailed API subscribers on 2026-06-30 that its V4 API will switch to peak and off-peak pricing when the model leaves preview for general availability in mid-July 2026 [s1]. During two daily windows, 09:00 to 12:00 and 14:00 to 18:00 Beijing time, calls bill at twice the off-peak rate [s1]; for `deepseek-v4-pro`, output goes from 6 yuan to 12 yuan (about US$1.77) per million tokens [s2]. This is a reversal: the same lab triggered a price war in May 2026 with a permanent 75% cut on V4 access that forced ByteDance and Tencent to follow [s2], and now it adds a surcharge it frames as "better distribution of resources and to enhance service stability" [s2].

## The clock inside the bill

| Beijing window | Multiplier | `deepseek-v4-pro` output |
| :--- | :--: | ---: |
| 09:00-12:00 and 14:00-18:00 | 2x [s1] | 12 yuan / Mtok [s2] |
| all other hours | 1x | 6 yuan / Mtok [s2] |

The facts are small; the consequence is not. A daily clock now sits inside the cost of every DeepSeek call, so any router or agent loop that fans out many requests has to reason about the provider's local time to keep its bill flat. Time-of-day joins model quality and per-token cost as a routing dimension, which is exactly the call an independent gateway analyst already made: routing tables now need a clock [s3]. A gateway that arbitrates only on a static per-token price will systematically overpay, because the cheapest provider at 03:00 Beijing is not the cheapest at 10:00.

Read the surcharge as a tell, not a footnote. The lab that set the price-war floor is the first to walk it back, which says the discounted floor for serving 1M-context MoE inference [s4] was not holding.

> [!IMPORTANT]
> As of this brief the surcharge is announced, not billing. It lands with the mid-July GA, and V4 is still in preview [s1][s4]. This is a prepare-now brief, not an adopt-now one: nothing changes on your invoice today.

## Impact on your team

If you route production traffic through `deepseek-v4-pro`, you have a mid-July deadline, not a decision to defer. Three concrete moves before GA. Shift deferrable batch work such as evals, backfills, and offline enrichment to off-peak Beijing hours, so it never touches the 2x window. Add a peak-window fallback: send latency-tolerant calls to `deepseek-v4-flash` or a rival during the two windows, and keep `deepseek-v4-pro` for work that justifies the surge. And make your router time-zone-aware now [s3]: if it reasons only about model and static price, it will quietly overpay from the day billing starts. What to ignore for now: the speculation that rivals will match the surge [s3]. None has, so plan around DeepSeek's clock alone, not an industry-wide one.
