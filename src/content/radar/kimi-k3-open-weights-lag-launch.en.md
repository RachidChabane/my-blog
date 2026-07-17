---
translationKey: kimi-k3-open-weight-weights-lag
lang: en
slug: kimi-k3-open-weights-lag-launch
title: 'Kimi K3: the largest open-weight model announced, and the weights lag the
  launch by 11 days'
publishDate: 17-07-2026
kind: release
tags:
- Kimi K3
- Moonshot
- open weights
- agents
- coding
summary: On 16-07-2026 Moonshot shipped Kimi K3, a 2.8T-parameter open-weight MoE,
  but only on its own hosted infra; the downloadable weights are due 27-07-2026, at
  Sonnet-5-class pricing.
sources:
- label: 'MarkTechPost - Moonshot AI Releases Kimi K3: A 2.8 Trillion Parameter Open
    MoE Model With Kimi Delta Attention and 1M Context'
  url: https://www.marktechpost.com/2026/07/16/moonshot-ai-releases-kimi-k3-a-2-8-trillion-parameter-open-moe-model-with-kimi-delta-attention-and-1m-context/
  date: 16-07-2026
- label: 'Trilogy AI - Kimi K3 Is Live: Pricing, Benchmarks, and the Wait for Public
    Weights'
  url: https://trilogyai.substack.com/p/kimi-k3-is-live-pricing-benchmarks
  date: 17-07-2026
- label: The Decoder - Kimi's open model K3 nears GPT-5.6 Sol and Fable 5 while signaling
    the end of super cheap Chinese AI
  url: https://the-decoder.com/kimis-open-model-k3-nears-gpt-5-6-sol-and-fable-5-while-signaling-the-end-of-super-cheap-chinese-ai/
  date: 16-07-2026
- label: Simon Willison - Kimi K3, and what we can still learn from the pelican benchmark
  url: https://simonwillison.net/2026/Jul/16/kimi-k3/
  date: 16-07-2026
- label: OpenRouter - Kimi K3 model page
  url: https://openrouter.ai/moonshotai/kimi-k3
  date: 16-07-2026
- label: 'latent.space AINews - Kimi K3 2.8T-A50B: the largest open model ever released;
    Opus 4.8-class at Sonnet 5 pricing'
  url: https://www.latent.space/p/ainews-kimi-k3-28t-a50b-the-largest
  date: 17-07-2026
contentHash: sha256:de9a36219e64e2b1
publishState: published
---

## What changed

Moonshot AI released Kimi K3 on 16-07-2026 [s1], live the same day only on Moonshot's own infrastructure: the API, kimi.com, the mobile apps, Kimi Work, Kimi Code, plus a listing on OpenRouter [s2][s5]. It is a 2.8-trillion-parameter sparse Mixture-of-Experts model, activating 16 of 896 experts [s1] (roughly 50B active per latent.space [s6]), with a 1M-token context window (1,048,576) [s2]. The full weights are not out: Moonshot set 27-07-2026 for the open-weight checkpoint in an official WeChat announcement [s2][s4], so today you get an endpoint, not a download. On independent measurement, Artificial Analysis places K3 at 57.1 on its Intelligence Index, fourth of 189 models, on par with Opus 4.8 and GPT-5.5 and behind Fable 5 and GPT-5.6 Sol [s2][s3].

## Open, but not yet

Here is the tension the release notes will not draw for you. The whole reason to reach for an open-weight frontier model, to self-host it, drop the vendor lock, keep your data off a third party, is exactly what is missing on launch day. For roughly eleven days you are benchmarking a proprietary endpoint wearing an open-weight label, and the hosted checkpoint you test this week is not guaranteed to be the one that ships on the 27th.

The part worth copying is not the size. What makes a 2.8T model at 1M context servable is the attention work: Kimi Delta Attention, a hybrid linear-attention scheme Moonshot claims gives up to 6.3x faster decoding in million-token contexts, and Attention Residuals, which it says buy roughly 25% higher training efficiency at under 2% added cost [s1]. Those are Moonshot's own figures, not independent measurements, but the mechanism, not the headline parameter count, is what rivals will study.

> [!IMPORTANT]
> Two traps before you wire K3 into anything. First, the weights land 27-07-2026, so do not treat today's hosted endpoint as your self-host or data-residency option yet. Second, K3 exposes only one reasoning effort, `max`, "and it shows" [s4]: it burns reasoning tokens by default, so a naive integration is expensive.

## The price floor moved

| Per 1M tokens        | K2.6 [s3] | K3 [s1][s2][s3] |
| :------------------- | --------: | --------------: |
| Input (cache hit)    |     $0.16 |           $0.30 |
| Input (cache miss)   |     $0.95 |           $3.00 |
| Output               |     $4.00 |          $15.00 |

That is Sonnet-5-class pricing, "comparable to Western mid-range models like Sonnet 5" [s3], not the loss-leader tier that made Chinese open weights a reflex pick. At about $0.94 per task on Artificial Analysis, close to GPT-5.6 Sol at $1.04 and roughly half of Opus 4.8 at $1.80 [s3], K3 is a Western-mid-range cost decision now. If your routing math still assumes "just use the cheap Chinese open model", it is stale.

## Impact on your team

Name the decision you are actually making. If you chose K3 for self-hosting or data residency, wait for 27-07-2026 and do not benchmark today's hosted endpoint as your on-prem candidate, since it may not be the shipped checkpoint. If K3 is a hosted-API routing option, re-price it as Sonnet-5-class rather than sub-dollar, and cap the reasoning-effort cost (only `max` today) before it reaches a hot path. Whatever you decide about the weights, the attention architecture is the transferable idea to watch.
