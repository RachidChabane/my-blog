---
translationKey: qwen4-max-hosted-only-open-weights-for-smaller-models
lang: en
slug: qwen4-max-is-hosted-only
title: Qwen4-Max is hosted only
publishDate: 19-11-2026
kind: release
tags:
- Qwen
- Alibaba
- open-weight
- pricing
summary: Alibaba released Qwen4-Max on 16 November 2026 on QwenCloud. The open weights
  it promises are for smaller Qwen4 models, with no date.
sources:
- label: Alibaba Cloud, Alibaba Unveils Qwen4-Max
  url: https://www.alibabacloud.com/press-room/alibaba-unveils-qwen4-max
  date: 16-11-2026
- label: TechNode, Alibaba launches Qwen4-Max with lower API prices and a million-token
    context window
  url: https://technode.com/2026/11/16/alibaba-launches-qwen4-max-with-lower-api-prices-and-a-million-token-context-window/
  date: 16-11-2026
contentHash: sha256:7a60b36c0dc2b84d
publishState: published
---

Alibaba released Qwen4-Max on 16 November 2026, and you cannot download it: the model is available on QwenCloud through the Token Plan and the API, and the open weights Alibaba announces are for "smaller-scale models from the Qwen4 series", due "soon" [s1]. No date, no sizes.

If you self-host Qwen, that last line is the one for you. What you will be able to run is a smaller Qwen4, whenever it comes. The weights of this one would not have helped many of us anyway: Qwen4-Max is a mixture-of-experts model with 2.4 trillion total parameters, of which 71 billion are active per token [s1]. Few teams have the hardware for that.

The number Alibaba leads with is cost. On Work360, its own benchmark, Qwen4-Max beats Qwen3.8-Max overall while using 35% fewer tokens at High reasoning effort, and the average cost per task drops by around 60% [s1]. TechNode gives the amounts behind the percentage: RMB 26.58 per task before, RMB 11.16 now [s2]. That makes 58%, which is close enough.

Those two figures let you split the saving. A task that costs 42% of its old price on 65% of the tokens means the average cost per token fell by about a third as well. The arithmetic is mine, and it assumes the cost and the token count come from the same runs, which neither page says. If it holds, the two factors are about equal, each close to 0.65, and only the first is a property of the model. The second is a price list, or a different mix of input and output tokens; the pages do not say which.

Both figures come from Work360, Alibaba's own benchmark across 721 specialized fields [s1], so read them as a trend and no more. Before moving traffic I would replay a day of my own requests against the API and count tokens. The one-million-token context window [s2] is the other thing to test before believing: I found no recall figure at that length in the announcement.
