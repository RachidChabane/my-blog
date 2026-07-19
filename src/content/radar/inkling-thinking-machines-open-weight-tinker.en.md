---
translationKey: inkling-thinking-machines-open-weight
lang: en
slug: inkling-thinking-machines-open-weight-tinker
title: Thinking Machines opens Inkling's weights under Apache 2.0, and keeps Tinker
publishDate: 19-07-2026
kind: release
tags:
- Thinking Machines
- Inkling
- Tinker
- open-weight
- agents
summary: 'On 2026-07-15 Thinking Machines Lab published Inkling under Apache 2.0:
  975B total parameters, 41B active, weights live on launch day. The lab concedes
  the model is not the strongest available, and keeps Tinker, the fine-tuning loop,
  proprietary.'
sources:
- label: Primary - Thinking Machines Lab, Inkling model card
  url: https://thinkingmachines.ai/model-card/inkling/
  date: 15-07-2026
- label: 'Primary - Thinking Machines Lab, ''Inkling: Our open-weights model'''
  url: https://thinkingmachines.ai/news/introducing-inkling/
  date: 15-07-2026
- label: Primary - Hugging Face repo, thinkingmachines/Inkling
  url: https://huggingface.co/thinkingmachines/Inkling
  date: 15-07-2026
- label: Corroboration - TechCrunch, on Thinking Machines' first open model
  url: https://techcrunch.com/2026/07/15/thinking-machines-amps-up-its-bet-against-one-size-fits-all-ai-with-its-first-open-model-inkling/
  date: 15-07-2026
- label: Corroboration - Simon Willison, 'Inkling'
  url: https://simonwillison.net/2026/Jul/16/inkling/
  date: 16-07-2026
- label: Independent eval - Artificial Analysis, Inkling model page
  url: https://artificialanalysis.ai/models/inkling
  date: 16-07-2026
- label: Availability check - Databricks blog
  url: https://www.databricks.com/blog/inkling-thinking-machines-lab-now-databricks
  date: 15-07-2026
contentHash: sha256:ab7d8da99fec7931
publishState: published
---

## What changed

Thinking Machines Lab published Inkling on 2026-07-15: 975B total parameters, 41B active, a 66-layer decoder-only transformer whose feed-forward backbone is a sparse Mixture-of-Experts routing each token to 6 of 256 experts plus 2 shared, with context to 1M tokens [s1][s2][s3]. That 975B model's weights went live the same day at `thinkingmachines/Inkling` on Hugging Face under Apache 2.0, with Transformers, vLLM and SGLang listed as runtimes [s3]. Simon Willison puts the training run at 45 trillion tokens of text, images, audio and video [s5]. As of 2026-07-15 it is also served on Databricks through Unity AI Gateway [s7].

## The bet

What the lab kept matters more than what it gave away. It hands over 975B parameters under the most permissive license there is, says in its announcement that "Inkling is not the strongest overall model available today, open or closed" [s2][s4], then adds that Inkling is available for fine-tuning on Tinker today [s2]. Tinker stays proprietary. The weights are the advertisement; the customization loop is the product. I think that beats renting a frontier model behind an API: it charges for the step where the customer's data enters.

The counter: a model its own maker will not call frontier-grade is a non-event next to the frontier. Artificial Analysis scores Inkling 41 on its Intelligence Index, #10 of 97 [s6]. The median for open-weight models of that size is 25 [s6]. And 41B active out of 975B is the practical story, servable where a dense model of that size is not. TechCrunch, relaying a lab claim rather than an independent test, reports Inkling matching Nvidia's Nemotron 3 Ultra on coding for a third of the tokens [s4]. A vendor number, but if it holds on your workload it compounds the serving-cost argument.

## In practice

Two identifiers to start, the repo and the fine-tuning endpoint [s3][s5]:

```
# weights (Apache 2.0)
thinkingmachines/Inkling
# fine-tune loop, OpenAI-compatible
https://tinker.thinkingmachines.dev/services/tinker-prod/oai/api/v1/chat/completions
```

The model card lists BF16, MXFP8 and NVFP4 as numeric formats [s1]. That line decides whether your serving stack can hold it.

> [!IMPORTANT]
> Inkling-Small (276B total, 12B active) is announced, not shipped: the lab says it is finishing testing and will release the full weights once that work is complete [s2][s5]. Every "weights on launch day" claim above is about the 975B model only. Do not size a deployment around a 12B-active model you cannot download.

## Impact on your team

This changes your fine-tuning base, not what you call for hard general questions. If you were already going to specialize a model on your own data, Apache 2.0 at 41B active removes both the license negotiation and the serving-cost objection [s1][s3]. If you need the best available answer, the lab itself pointed elsewhere [s2]. Wait on Inkling-Small: at 12B active it is the variant most teams will actually run, and until those weights land only the 975B model is evaluable.
