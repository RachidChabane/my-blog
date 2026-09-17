---
translationKey: typesafe-jev-workflow-evals-scored-against-frontier-reference
lang: en
slug: typesafe-jev-workflow-evals-scored-against-frontier-reference
title: TypeSafe's Jev ties sonnet 5 at 67.8% in workflow evals scored against GPT-6
  Astra and Fable 5.1
publishDate: 17-09-2026
kind: release
tags:
- TypeSafe
- Jev
- structured outputs
- evals
summary: TypeSafe AI opened early access to Jev, a model that answers typed questions,
  on September 15, 2026, at $0.042 per MTok of input with free output tokens. In TypeSafe's
  own workflow evals, Jev ties sonnet 5 at 67.8% for $0.0004 and 0.4 s, against a
  reference answer averaged from GPT-6 Astra and Fable 5.1. Every comparison model
  there scores higher as a workflow than as one prompt, and Jev has no prompt row
  at all. I think the decomposition is the part to adopt now, while the confidence
  score waits for your own calibration.
sources:
- label: TypeSafe AI, Introducing System One Models and Jev
  url: https://typesafe.ai/blog/introducing-system-one-models-and-jev
  date: 15-09-2026
- label: TypeSafe docs, API reference
  url: https://docs.typesafe.ai/api
  date: 15-09-2026
- label: TypeSafe workflow evals
  url: https://evals.typesafe.ai/
  date: 15-09-2026
- label: 'Anthony Maio, Jev: The Language Model That Won''t Talk'
  url: https://anthonymaio.substack.com/p/jev-the-language-model-that-wont
  date: 16-09-2026
contentHash: sha256:a7b49bf2dfc4bd3c
publishState: published
---

## What changed

TypeSafe AI opened early access to Jev on September 15, 2026, and developers are still coming off a waitlist [s1]. You send `model` set to `jev-latest` and a `questions` map to `POST https://api.typesafe.ai/v1/systemone` [s2]. `Choice` and `Score` answers carry a `confidence` between 0 and 1, and a yes/no answer comes back as `noul`, from 0 (no) to 1 (yes) [s2]. Input costs $0.042 per MTok and output tokens are free [s1].

## The row Jev does not have

TypeSafe's eval site averages accuracy, cost and time over four workflows, and runs each comparison model twice, as an explicit workflow and as one prompt [s3]:

| Model | Prompt | Workflow | Workflow cost | Workflow time |
| :--- | ---: | ---: | ---: | ---: |
| haiku 4.5 | 18.1% | 53.6% | $0.0195 | 12.5 s |
| sonnet 5 | 60.4% | 67.8% | $0.1174 | 78.1 s |
| opus 5 | 64.8% | 73.1% | $0.1761 | 37.8 s |
| sol | 63.4% | 74.1% | $0.0836 | 23.3 s |
| Jev | no row | 67.8% | $0.0004 | 0.4 s |

Anthony Maio reads this as every comparison model getting more accurate, faster and cheaper inside the workflow [s4]. I checked all eight pairs, and it holds on all three axes [s3]. Jev appears only as a workflow row [s3]. I think that is its real adoption cost: a model that only takes typed questions forces the decomposition that already took haiku 4.5 from 18.1% to 53.6% [s3]. Jev ties the sonnet 5 workflow row at 67.8% and trails sol and opus 5 [s3]. What it wins is $0.0004 and 0.4 s against $0.1174 and 78.1 s for sonnet 5 [s3].

> [!IMPORTANT]
> For these workflows, TypeSafe uses as its reference answer the average of GPT-6 Astra and Fable 5.1, which it says biases answers towards OpenAI and Anthropic [s1]. That 67.8% measures, as I read it, how often Jev agrees with two frontier models.

## Impact on your team

If you route, triage or score with one long prompt, split it into typed questions now, on the model you already pay for. In my reading that is where TypeSafe's table puts the gain, and it needs no waitlist [s3]. Keep the labels the split forces you to write, then test Jev against them when access arrives. Do not gate escalations on `confidence` yet. The launch post says all answers come with calibrated probabilities and confidence scores [s1], the docs derive `confidence` from `probabilities` [s2], and yet TypeSafe has not said which statistic, and its calibration methodology is undisclosed [s4]. Typing fixes the shape of an answer and leaves the judgment unconstrained, as Maio puts it [s4], so plot `confidence` against your own labels first.
