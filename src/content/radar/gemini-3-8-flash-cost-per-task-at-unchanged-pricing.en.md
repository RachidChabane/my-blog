---
translationKey: gemini-3-8-flash-cost-per-task-rose-at-unchanged-token-pricing
lang: en
slug: gemini-3-8-flash-cost-per-task-at-unchanged-pricing
title: Gemini 3.8 Flash costs about 40 percent more per task at unchanged token pricing
publishDate: 05-09-2026
kind: release
tags:
- Gemini
- Google
- Artificial Analysis
- agents
- inference
summary: Google DeepMind released Gemini 3.8 Flash on 2 September 2026 at Gemini 3.7
  Flash's rates, and Artificial Analysis measures it at $0.58 per task, about 40 percent
  above its predecessor [s1][s2]. The rate carrying that cost is a discount stated
  as running only until the end of the year [s1].
sources:
- label: Artificial Analysis independent evaluation of Gemini 3.8 Flash
  url: https://artificialanalysis.ai/articles/gemini-3-8-flash
  date: 02-09-2026
- label: The Register report on the Gemini 3.8 Flash release
  url: https://www.theregister.com/ai-and-ml/2026/09/02/with-gemini-38-flash-google-reminds-everyone-its-still-in-the-race/5294049
  date: 02-09-2026
contentHash: sha256:d81de5504739ffe1
publishState: published
---

## What changed

Google DeepMind released Gemini 3.8 Flash on 2 September 2026 at the same rates as Gemini 3.7 Flash, which Artificial Analysis records as discounted pricing running until the end of the year [s1]. The cost per task did not hold still. Artificial Analysis puts it on the Intelligence vs. Cost per Task Pareto frontier at $0.58 per task, about 40 percent above its predecessor, driven by a 30 percent rise in average output tokens per task to 48k and more turns on agentic evaluations [s1]. The Register reports the same rise, quoting Doshi and Popa: "3.8 Flash works harder" [s2].

## A durable behaviour on a dated rate

Read the two halves of that price line against each other. The extra token burn ships inside the model, and neither page names a switch that turns it off. The only lever either gestures at is effort, in passing [s2]. The rate absorbing it carries a date: Artificial Analysis records $0.75/$3.75 as discounted pricing until the end of the year [s1], and neither page says what comes after.

| Gemini 3.8 Flash | value | against 3.7 Flash |
| :--- | ---: | :--- |
| price per 1M input / output | $0.75 / $3.75 [s1] | unchanged, discounted to year end [s1] |
| average output tokens per task | 48k [s1] | up 30 percent [s1] |
| cost per task, Artificial Analysis | $0.58 [s1] | about 40 percent higher [s1][s2] |

So $0.58 was measured under relief with an announced end [s1], and I think the token multiplier behind it rides with the model id.

> [!IMPORTANT]
> That 40 percent comes from Artificial Analysis's own task set [s1], not your loop. In my experience it lands on long tool-calling traffic and mostly misses short single-shot calls. I read $0.58 as a shape to check on my own traces, since that ratio moves more per product than per model.

## Impact on your team

Two dates matter here and only one is the release. If Flash-tier traffic is a line in your 2027 budget, go and get the post-discount rate: the discount runs until the end of the year [s1], and the 30 percent token increase [s1] does not expire with it. I would not treat the model id swap as price-neutral either, since nothing on the price page moved and the measured cost per task is about 40 percent higher [s1][s2]. Log output tokens per task on your 3.7 Flash traffic now, so that when you move you can tell 3.8's diligence apart from your own prompt growth. Then split the tiers on whether that diligence is worth buying: 3.8 Flash on long tool-calling runs, 3.7 Flash on short extraction and classification calls.
