---
translationKey: kimi-k3-ranked-endpoint-not-weights
lang: en
slug: kimi-k3-ranks-fourth-nobody-measured-the-weights
title: Kimi K3 ranks fourth, and nobody has measured the model you would run
publishDate: 23-07-2026
tags:
- llm-oss
- evaluation
category: briefings
difficulty: 3
sources:
- label: Artificial Analysis, Kimi K3 model page
  url: https://artificialanalysis.ai/models/kimi-k3
  date: 23-07-2026
- label: Simon Willison, hands-on with Kimi K3
  url: https://simonwillison.net/2026/Jul/16/kimi-k3/
  date: 16-07-2026
- label: Nathan Lambert, Interconnects
  url: https://www.interconnects.ai/p/kimi-k3-the-open-weights-escalation
  date: 20-07-2026
contentHash: sha256:1d4c682914eaea61
publishState: published
---


Every public number attached to Kimi K3 describes a rented API, not the weight file that is supposed to land on July 27. Artificial Analysis scores the model 57 on its Intelligence Index, ranks it fourth of 186, measures 35.2 output tokens per second, and prices the endpoint it measured at $3.00 per million input tokens and $15.00 per million output tokens [s1]. The same page lists Kimi K3 as proprietary, weights not publicly available [s1]. Simon Willison's hands-on carries that price sheet and the promised open weight release by July 27, 2026 [s2]. I take the promise at face value. The problem survives it.

## The leaderboard scored a configuration

A rank is a property of a served configuration: specific hardware, a specific precision, a batching and routing policy, a price sheet. It is not a property of a weight file. For most models that distinction stays academic, because the two objects track each other closely enough that the leaderboard row works as a proxy. Kimi K3 is where the proxy breaks, and the cleanest evidence is the measuring institution itself: Artificial Analysis ranks the model fourth of 186 while filing it in the proprietary column, weights not publicly available [s1]. Nathan Lambert describes the arriving artifact as a 2.8 trillion parameter mixture-of-experts model, weights due July 27, the closest open models will have been to the frontier since DeepSeek R1 [s3]. At that size the distance between the vendor's serving stack and anything a normal team can afford is not a tuning delta. It is a different quantization and a different memory hierarchy, so it is a different quality and cost profile, and no leaderboard row covers it.

> [!WARNING]
> The failure mode has a name and a document: the procurement case that puts 35.2 output tokens per second next to a hardware budget. That figure came off a vendor endpoint tuned for aggregate throughput under concurrency; the budget buys a quantized deployment paging experts through slower memory. Nothing published connects the two, so the plan commits to a throughput nobody has observed.

## The strongest case against this

Put the objection at its best. A ranking published before a weight release measured the only artifact that existed, which is true of every staged launch, and nobody writes a memo about those. Moonshot has committed to a date [s2]. If the weights ship on July 27, the complaint expires in four days and reads as cynicism about a vendor that did exactly what it said.

That objection would land if my claim were about sincerity. It is not. Grant the release, on schedule, byte for byte. What does not arrive on July 27 is a measurement of the object being released: leaderboards are not re-run at your precision on your cards, and the figure that keeps circulating as the model's identity will go on being the endpoint's.

There is also a tempting version of my own argument that is simply wrong, so I will kill it here. 35.2 output tokens per second is not a ceiling for local reproduction. A latency-optimized single-stream deployment can beat an endpoint tuned for concurrency, and a memory-constrained one offloading experts can land an order of magnitude below it. The honest statement is weaker and more useful: the number does not transfer in either direction, and neither does the quality-derived rank once the precision changes.

> [!CONFIRMED]
> Artificial Analysis ranks Kimi K3 fourth of 186 at 35.2 output tokens per second, on an API priced at $3.00 per million input tokens and $15.00 per million output tokens, and lists the model as proprietary with weights not publicly available [s1].

> [!INFERRED]
> My read: that row describes a served configuration, so it sets neither a floor nor a ceiling for a self-hosted 2.8 trillion parameter mixture-of-experts model. Announced open weights are an unpriced option here, not a delivered capability.

## What I would do on Monday

Price the migration against the API you can benchmark today, not against weights you cannot yet run. Run your own evaluation through the endpoint priced at $3 and $15 per million tokens [s2], keep the result, and label it an API number. When the weights land, measure output tokens per second and cost per million on your own harness, at the quantization you would actually buy, single-stream first and then under your real concurrency, before anyone signs anything. Until that measurement exists, the honest line in the migration doc is one sentence: open weights is an option whose price nobody has published, the vendor included.

My prediction: the gap between the ranked object and the runnable one widens with every frontier-scale open weight release, and the indexes will keep scoring the endpoint, because the endpoint is the only thing they can call.
