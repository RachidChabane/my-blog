---
translationKey: grok-4-5
lang: en
slug: grok-4-5-cursor-coding-agentic
title: Grok 4.5 is a price-performance play for agentic coding, not a new frontier
  crown
publishDate: 11-07-2026
kind: release
tags:
- Grok
- xAI
- Cursor
- coding
- agents
summary: xAI shipped Grok 4.5 on 2026-07-08 for coding and agentic work at $2/$6 per
  million tokens. On its own four self-reported benchmarks it splits 2-2 with Opus
  4.8 while Fable 5 leads all four, so it reads as a price-performance play rather
  than a frontier win, and it is not yet in the EU.
sources:
- label: Origin-adjacent - Tech.Yahoo / SiliconANGLE wire, 'xAI launches Grok 4.5,
    its most intelligent model built for coding and agentic tasks'
  url: https://tech.yahoo.com/ai/articles/xai-launches-grok-4-5-coding-agentic
  date: 08-07-2026
- label: Corroboration - roo.beehiiv, independent benchmark analysis of the Grok 4.5
    launch
  url: https://roo.beehiiv.com/p/grok-4-5-coding-benchmarks
  date: 08-07-2026
- label: 'Corroboration - apidog, ''Grok 4.5 API: pricing, benchmarks and the OpenAI-compatible
    surface'''
  url: https://apidog.com/blog/grok-4-5-api/
  date: 09-07-2026
contentHash: sha256:498a983877386a1f
publishState: published
---

## What changed

xAI shipped Grok 4.5 on Wednesday 2026-07-08, its first model built specifically for coding and agentic tasks [s1]. It exposes an OpenAI-compatible API surface under the reference `grok-4.5`, documented at docs.x.ai/developers/grok-4-5 [s3], priced at $2 per million input tokens and $6 per million output tokens [s1] and running at roughly 80 tokens per second [s3]. It is live now through Grok Build, Cursor on every plan, the SpaceXAI console, and OpenRouter [s1][s2]. Musk called it "an Opus-class model, but faster, more token-efficient and lower cost" [s1]. That is his framing. The measured results are the interesting part.

## The benchmark split

Every benchmark xAI published is self-reported, and there are exactly four. Against Opus 4.8 they land 2-2, and Claude Fable 5 leads all four [s2].

| Benchmark (xAI self-reported [s2]) | Grok 4.5 | Opus 4.8 |
| :--- | :--: | :--: |
| DeepSWE 1.0 | 62.0 | 55.75 |
| DeepSWE 1.1 | 53 | 59 |
| Terminal-Bench 2.1 | 83.3 | 78.9 |
| SWE-Bench Pro | 64.7 | 69.2 |

Grok 4.5 wins DeepSWE 1.0 and Terminal-Bench 2.1, loses DeepSWE 1.1 and SWE-Bench Pro [s2]. It ranks 4th on the Artificial Analysis Intelligence Index, above every open-weight and Gemini model [s3]. "Opus-class" survives as a fair label for the tier; it does not survive as "beats Opus".

## The data flywheel

What will still matter in a year is the training data, more than any benchmark line. xAI says it folded real Cursor developer session data, debugging traces, multi-file diffs, and user corrections, into supplemental training [s2]. That is developer-session exhaust from a live agentic-coding product, tuned on the actual shape of the work rather than a generic code corpus. It is xAI's own phrasing, not something I can independently verify, but if it holds it is the advantage a competitor cannot cheaply copy: you need a product like Cursor feeding you before you can train on it.

> [!IMPORTANT]
> Two caveats gate any adoption. Every benchmark above is xAI's own number, so treat them as vendor claims and re-run your own agent evals before trusting them. And the model is not yet available in the EU; xAI expects mid-July 2026, so an EU team cannot adopt it today [s1][s2].

## Impact on your team

If you are a non-EU team already in Cursor, `grok-4.5` is worth a trial as a cheaper agentic default at $2/$6 per million tokens [s1], but treat it as a price-performance play: re-baseline it on your own agent eval suite, because the four numbers that sell it are self-reported and split 2-2 [s2]. If you are in the EU, there is nothing to do yet but wait for the mid-July window [s1]. The one thing to ignore is the "Opus-class" adjective taken as a verdict; the split, and your own traces, are the numbers that matter.
