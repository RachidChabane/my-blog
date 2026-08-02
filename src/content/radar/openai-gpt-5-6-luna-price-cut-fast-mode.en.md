---
translationKey: gpt-5-6-price-cut-fast-mode
lang: en
slug: openai-gpt-5-6-luna-price-cut-fast-mode
title: OpenAI cuts GPT-5.6 Luna by 80% and renames Priority Processing to Fast mode
publishDate: 02-08-2026
kind: release
tags:
- OpenAI
- GPT-5.6
- Responses API
- inference
- pricing
summary: 'OpenAI cut GPT-5.6 Luna to $0.20 / $1.20 per million tokens on July 30 2026
  and Terra to $2.00 / $12.00, leaving Sol unchanged, while Priority Processing became
  Fast mode. The floor matters more than the discount: fanning out across cheap calls,
  per-chunk reranking included, now fits budgets that refused it a month ago.'
sources:
- label: Primary - OpenAI developer changelog, Jul 30 pricing and Fast mode
  url: https://developers.openai.com/api/docs/changelog
  date: 30-07-2026
- label: Primary - OpenAI API pricing, standard and Fast tables
  url: https://developers.openai.com/api/docs/pricing
  date: 30-07-2026
- label: Primary - OpenAI Fast mode guide
  url: https://developers.openai.com/api/docs/guides/fast-mode
  date: 30-07-2026
- label: Corroboration - InfoWorld, OpenAI drops GPT-5.6 Luna and Terra API prices
    by up to 80%
  url: https://www.infoworld.com/article/4203865/openai-drops-gpt-5-6-luna-and-terra-api-prices-by-up-to-80.html
  date: 31-07-2026
- label: Corroboration - CNBC, OpenAI price cut
  url: https://www.cnbc.com/2026/07/30/open-ai-price-cut-gpt.html
  date: 30-07-2026
contentHash: sha256:0fb0080f107600ef
publishState: published
---

## What changed

OpenAI repriced the GPT-5.6 family on July 30 2026: Luna costs 80% less, Terra 20% less, and Sol did not move [s1][s5]. The change lands on `v1/responses` and `v1/chat/completions` [s1]. Priority Processing was renamed Fast mode the same day, and requests still sending `service_tier: "priority"` keep working [s1][s3].

## The new floor

| Model | Before | After |
| :--- | ---: | ---: |
| gpt-5.6-sol | $5.00 / $30.00 | unchanged [s2][s5] |
| gpt-5.6-terra | $2.50 / $15.00 [s4] | $2.00 / $12.00 [s2] |
| gpt-5.6-luna | $1.00 / $6.00 [s4] | $0.20 / $1.20 [s2] |

(input / output per 1M tokens, short context.)

A floor that falls fivefold barely discounts the invoice you already pay. It changes what you can afford to run at all, which I think is the real story here: per-chunk reranking on every retrieval stops being an experiment you have to justify. Luna sits 3.75x under the last generation's mid tier, `gpt-5.4-mini` at $0.75 / $4.50 [s2], on both sides of the meter.

The fan-out arithmetic flips sign. On input, Luna cost $1.00 per Mtok [s4] against $2.50 for Terra [s4], so five Luna calls came to five times $1.00, twice the price of one Terra call. At $0.20 [s2] against $2.00 [s2], five times $0.20 is half that single call. Fanning out was the expensive option; it is now the cheap one.

The objection is fair: an 80% cut on a tier your task cannot use saves nothing, and a cascade still costs engineering time plus an eval harness. Neither point survives the sign flip above, which changes which experiments fit the budget rather than trimming the calls you already make.

## Fast mode is a flat 2x

Fast mode bills exactly twice standard on input and output across all three 5.6 tiers, luna at $0.40 / $2.40 and sol at $10.00 / $60.00 [s2]. The 2.5x speedup is tied to one named model, `gpt-5.6-sol` [s1][s3], though the guide's opening line promises up to 2.5x faster without naming a tier [s3]. Read that as where the number is anchored rather than as a complaint about silence: the doubling is certain everywhere, the measurement is not, so on Terra and Luna I measure before flipping the flag. Two traps sit underneath. The response object reports `priority` for GPT-5.6 and earlier even when the request said `fast` [s3], so telemetry keyed on `"fast"` never fires; long context, fine-tuned models, and embeddings are out of scope entirely [s3].

> [!IMPORTANT]
> Settings > Project > General > Project Service Tier set to Fast bills every request that omits `service_tier` at 2x, batch jobs included, which is why the guide advises keeping large ETL and batch work off Fast mode [s3]. Past 1M TPM with a jump of more than 50% inside 15 minutes, requests can drop silently to standard speed and standard rates, returning `service_tier: "default"` [s3].

## Impact on your team

Re-run tier selection this week instead of banking the cut on paper: anything parked on Terra purely for headroom now pays ten times Luna's input price, and the saving lands only if the router moves. Audit `service_tier` at the project level before the next invoice, because a project default of Fast doubles every unlabelled request while the response object still says `priority`, so the dashboard will not tell you [s3]. What I would ignore is Fast mode as a general latency fix outside Sol, where the 2x is certain and the 2.5x is anchored to another model [s1][s3].
