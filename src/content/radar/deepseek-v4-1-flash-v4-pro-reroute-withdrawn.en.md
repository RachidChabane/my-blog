---
translationKey: deepseek-v4-1-flash-v4-pro-reroute-withdrawn
lang: en
slug: deepseek-v4-1-flash-v4-pro-reroute-withdrawn
title: DeepSeek withdrew the V4 Pro reroute it had set for September 14, and deepseek-v4-flash
  now names a different model
publishDate: 14-09-2026
kind: release
tags:
- DeepSeek
- DeepSeek V4.1
- open-weight
- inference
summary: 'DeepSeek''s V4.1-Flash news post still announces a deepseek-v4-pro reroute
  on September 14, but its pricing page, rewritten on 11 September, keeps V4 Pro with
  no end date. The change that did ship is quieter: since the 10 September 2026 release,
  the legacy deepseek-v4-flash names point at V4.1-Flash. I think that alias is what
  breaks your evals.'
sources:
- label: DeepSeek news, Introducing DeepSeek-V4.1-Flash
  url: https://www.deepseek.com/en/news/deepseek-v4-1-flash/
  date: 10-09-2026
- label: Hugging Face model card, deepseek-ai/DeepSeek-V4.1-Flash
  url: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash
  date: 10-09-2026
- label: SiliconANGLE, DeepSeek releases V4.1-Flash, says it outperforms flagship
    V4-Pro
  url: https://siliconangle.com/2026/09/10/deepseek-releases-v4-1-flash-says-it-outperforms-flagship-v4-pro/
  date: 10-09-2026
- label: DeepSeek API docs, Models and Pricing
  url: https://api-docs.deepseek.com/quick_start/pricing
  date: 11-09-2026
- label: Wayback Machine, DeepSeek pricing page captured at 07:47 UTC on 11 September
    2026
  url: https://web.archive.org/web/20260911074742/https://api-docs.deepseek.com/quick_start/pricing/
  date: 11-09-2026
- label: Wayback Machine, DeepSeek pricing page captured at 16:55 UTC on 11 September
    2026
  url: https://web.archive.org/web/20260911165508/https://api-docs.deepseek.com/quick_start/pricing/
  date: 11-09-2026
- label: TokenCost, DeepSeek V4.1 Flash pricing and the V4-Pro routing correction
  url: https://tokencost.app/blog/deepseek-v4-1-flash-pricing-v4-pro-routing
  date: 12-09-2026
contentHash: sha256:9a5e3563a641ab92
publishState: published
---

## What changed

DeepSeek released V4.1-Flash on 10 September 2026 under the API name `deepseek-flash`, retired V4-Flash and V4-Flash-Vision-Exp, and temporarily pointed their names at the new model [s1]. The same post says every `deepseek-v4-pro` request routes to V4.1-Flash from 04:00 UTC on Sept 14, 2026 [s1]. It still says so. The pricing page says the opposite: its footnote now keeps V4 Pro running after September 14, with billing unchanged [s4]. Two Wayback captures on 11 September, at 07:47 and 16:55 UTC, bracket the edit [s5][s6], and TokenCost published a dated correction on 12 September [s7].

| Model name you send | Served by, per the pricing page [s4] |
| :--- | :--- |
| `deepseek-flash` | DeepSeek-V4.1-Flash |
| `deepseek-v4-flash`, `deepseek-v4-flash-vision-exp` | DeepSeek-V4.1-Flash, legacy names |
| `deepseek-v4-pro` | DeepSeek-V4-Pro-0813 |

## The swap that did happen

I think the Pro deadline drew the attention while the Flash alias is the change that bites. When V4-Flash left preview in July, this radar noted that only its post-training had changed. This time the architecture changes too: V4.1-Flash is a causal encoder-decoder that activates 8B parameters per token in prefill and 16B in decode [s2], with 552B in total against 284B for V4-Flash [s3]. A request that still sends `deepseek-v4-flash` is accepted and served by that model [s4]. An eval score, a latency budget or a cost baseline keyed on the name now describes a model you no longer call.

## A reprieve with no end date

Before the edit, the same footnote said V4.1 Flash had surpassed V4 Pro and that DeepSeek planned to retire V4 Pro in an orderly manner [s5]. The new text sets no end date and only promises further notice of any change [s6]. I read it as a reprieve on notice, and I would not plan a quarter around it.

> [!IMPORTANT]
> Ignore the news post's 04:00 UTC deadline. The pricing page still maps `deepseek-v4-pro` to DeepSeek-V4-Pro-0813 [s4], and I have found no DeepSeek page that dates an end to that service.

## Impact on your team

If you pinned `deepseek-v4-pro`, change nothing today. Spend the reprieve running your own tasks on `deepseek-flash` and `deepseek-v4-pro` side by side while the two names still reach distinct models [s4], so the comparison is ready the day DeepSeek gives notice. If your stack still sends `deepseek-v4-flash`, rename it to `deepseek-flash` now and re-baseline: the legacy names are a temporary compatibility route [s1], and every result recorded under them since the release measures V4.1-Flash. Log, next to each eval run, the model version the pricing page lists, because the name alone has changed meaning twice since July.
