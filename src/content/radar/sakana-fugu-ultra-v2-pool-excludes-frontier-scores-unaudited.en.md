---
translationKey: sakana-fugu-ultra-v2-pool-excludes-frontier-scores-unaudited
lang: en
slug: sakana-fugu-ultra-v2-pool-excludes-frontier-scores-unaudited
title: Sakana's Fugu Ultra v2 leaves Fable 5 and GPT-6-Astra out of a pool you can
  neither see nor narrow
publishDate: 15-09-2026
kind: release
tags:
- Sakana AI
- Fugu
- agents
- evals
summary: Sakana AI released Fugu Ultra v2 (fugu-ultra-v2.0) on September 11, 2026.
  The orchestrator sits behind an OpenAI-compatible API, draws on a fixed pool that
  leaves out Fable 5, Fable 5.1 and GPT-6-Astra, and does not say which models answered.
  OrcaRouter notes that the benchmark figures are vendor-reported and that none has
  been independently reproduced. I think the swappable pool sold against vendor lock-in
  creates a lock-in of its own, because Sakana does the swapping.
sources:
- label: Sakana AI blog, Introducing Fugu Max and Fugu Ultra v2
  url: https://sakana.ai/fugu-max-release/
  date: 11-09-2026
- label: Sakana console, Supported models
  url: https://console.sakana.ai/models
  date: 11-09-2026
- label: Sakana console, Pricing
  url: https://console.sakana.ai/pricing
  date: 11-09-2026
- label: Sakana Fugu product page and FAQ
  url: https://sakana.ai/fugu/
  date: 11-09-2026
- label: OrcaRouter blog, a competing router that does not carry Fugu, Fugu Ultra
    v2 explained by Alistair Wren
  url: https://www.orcarouter.ai/blog/fugu-ultra-v2-explained
  date: 11-09-2026
contentHash: sha256:1965e092513a83c6
publishState: published
---

## What changed

Sakana AI released Fugu Ultra v2 on September 11, 2026, alongside Fugu Max, behind its OpenAI-compatible API [s1]. The model id is `fugu-ultra-v2.0`, and the `fugu-ultra` alias now defaults to it [s2]. Sakana states that Fable 5, Fable 5.1 and GPT-6-Astra are not in the v2 model pool [s1]. Pricing for `fugu-ultra-v2.0` is fixed per 1M tokens [s3]:

| Token type, per 1M | Standard | Context above 272K |
| :--- | ---: | ---: |
| Input | $5 | $10 |
| Output | $30 | $45 |
| Cached input | $0.50 | $1.00 |

## A swappable pool you do not swap

Sakana's pitch is that a swappable pool of open and specialized models protects users from vendor lock-in, API revocations and sudden service cutoffs [s1]. Its FAQ settles who does the swapping. The Ultra pool is fixed, while the base Fugu model lets you opt out of specific models from the console [s4]. Sakana does not expose which models answered a request, by design [s4]. I think that turns the lock-in argument around. You trade a frontier vendor you can name for a pool you cannot list, and when Sakana moves a model in or out, your outputs can shift with nothing in the response to tell you why.

## No harness, no reproduction recipe

Sakana claims the best or joint-best score on five of eight benchmarks, in its own evaluation [s1]. OrcaRouter, a competing router that does not carry Fugu, notes that Sakana has released no evaluation harness, no per-task score grid and no reproduction recipe, and that there is no Artificial Analysis page for any Fugu model [s5]. It also relays that independent testers flagged latency variance: on easy tasks, the coordinator's deliberation is pure overhead [s5]. With the pool hidden, I see no way to rerun those scores on your tasks.

> [!IMPORTANT]
> Sakana's product page says Fugu is not yet available in the EU/EEA while it works toward GDPR compliance [s4]. If your users or data sit there, I would not start a pilot.

## Impact on your team

If you already call Fugu, pin `fugu-ultra-v2.0` instead of the `fugu-ultra` alias, which now defaults to v2 [s2]. Sakana calls the upgrade a single-line parameter change [s1], and an alias makes it for you. Before any pilot, run evals on the tasks you serve and log latency next to cost for each call. I would budget on output, billed at $30 per 1M tokens and $45 above 272K of context [s3]. Treat Sakana's benchmark claims as a hypothesis to test, and keep a fallback wired to a model you call directly, because the day quality drifts, you will not be able to see which models answered [s4].
