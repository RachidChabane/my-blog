---
translationKey: clef-flash-24k-hosted-context-truncates-long-state
lang: en
slug: clef-flash-24k-context-truncates-long-state
title: Cloudflare cuts Clef-flash to $0.038 per million tokens and 24K of hosted context,
  and a longer text state is truncated to fit
publishDate: 12-10-2026
kind: release
tags:
- Cloudflare
- Clef
- Workers AI
- decision models
summary: On October 9, 2026, Cloudflare cut Clef-flash on Workers AI to $0.038 per
  million input tokens and its hosted context window from 64K to 24K tokens. A text
  state over the limit is truncated to fit, while a request whose media tokens and
  questions exceed the window fails. I would budget string states below 24K before
  each call and route larger ones to Clef, which keeps 64K, or to self-hosted weights.
sources:
- label: Cloudflare Changelog, "Clef-omni adds audio and video input, Clef-flash is
    now cheaper, and Clef is faster"
  url: https://developers.cloudflare.com/changelog/post/2026-10-09-clef-omni-workers-ai/
  date: 09-10-2026
- label: Cloudflare docs source, clef-flash.json model definition at commit 970ac72
  url: https://raw.githubusercontent.com/cloudflare/cloudflare-docs/970ac7295d27cc146b7d88ed29f4463a4f02b78d/src/content/workers-ai-models/clef-flash.json
  date: 09-10-2026
- label: Cloudflare docs source, "How media inputs are billed" partial for the Clef
    model pages at commit 970ac72
  url: https://raw.githubusercontent.com/cloudflare/cloudflare-docs/970ac7295d27cc146b7d88ed29f4463a4f02b78d/src/content/partials/workers-ai/clef-media-input-pricing.mdx
  date: 09-10-2026
- label: 'DataStudios, "Cloudflare Clef-omni: 30B Multimodal Model, Benchmarks & Pricing"'
  url: https://www.datastudios.org/post/cloudflare-clef-omni-30b-audio-video-ai-decisions
  date: 11-10-2026
contentHash: sha256:4533d49412bdc2f7
publishState: published
---

## What changed

On October 9, 2026, Cloudflare cut the price of Clef-flash on Workers AI from $0.090 to $0.038 per million input tokens, and to offer that price it cut the hosted context window from 64K to 24K tokens [s1]. The model definition now sets `context_window` to 24576 [s2]. Clef keeps its 64K window, and the Clef-flash weights on Hugging Face support up to 256K if you self-host [s1].

The changelog lists the three hosted models side by side [s1]:

| Model | Price per million input tokens | Context window |
| :--- | ---: | ---: |
| `@cf/cloudflare/clef-flash` | $0.038 | 24K tokens |
| `@cf/cloudflare/clef` | $0.240 | 64K tokens |
| `@cf/cloudflare/clef-omni` | $0.150 | 64K tokens |

## Truncated or rejected

I think the context cut is the part of this release that changes code already in production. The billing notes split the outcome in two: media tokens count toward the window together with the questions, a request where they exceed it fails, and otherwise the text `state` is truncated to fit the remaining space [s3]. DataStudios reads the docs the same way [s4].

> [!CONFIRMED]
> A text `state` too long for the window is truncated to fit, while a request whose media tokens and questions exceed it fails [s3].

> [!INFERRED]
> In my reading, a string state between 24K and 64K tokens, which the old window held, now gets probabilities computed on part of its input.

Each image counts for up to 1,024 tokens against the same window, leaving that much less room for the state [s3]. The output schema returns `model`, `answers` and `usage` [s2]; I find no field among them that reports a truncation.

## The 0.24% argument

The strongest case for the cut is Cloudflare's own: only 0.24% of requests exceed 24K input tokens, and anyone who needs more is pointed to Clef [s1]. I agree for the aggregate. My objection is narrower. I think that aggregate says nothing about a workload that passes long transcripts or documents as a string state, which can sit entirely above 24K.

## Impact on your team

If you send long string states to `@cf/cloudflare/clef-flash`, the hosted window is already 24K [s1]. My call: budget the text state below 24K tokens before each call, images and questions included, and send anything larger to Clef at 64K or to the self-hosted weights at up to 256K [s1]. Clef costs $0.240 per million input tokens against $0.038 [s1]; that difference is the price of an answer computed on the whole state. I would also log the `input_tokens` count in `usage` and investigate values near 24576 [s2]. The definition does not say whether that count precedes truncation, so I treat it as a tripwire, with the budget check as the guard.
