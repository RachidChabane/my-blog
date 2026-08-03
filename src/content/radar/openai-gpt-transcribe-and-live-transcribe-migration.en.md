---
translationKey: gpt-transcribe-live-transcribe-split
lang: en
slug: openai-gpt-transcribe-and-live-transcribe-migration
title: OpenAI ships gpt-transcribe and gpt-live-transcribe, and the migration costs
  more than a model id
publishDate: 03-08-2026
kind: release
tags:
- OpenAI
- GPT Transcribe
- Realtime API
- speech-to-text
- voice agents
summary: 'OpenAI shipped GPT Transcribe and GPT Live Transcribe on July 28, a file
  model at $0.0045 per minute and a streaming model at $0.017 per minute. Changing
  the model id is the easy part: the language hint field changes, and timestamps,
  subtitles and speaker labels move to other models.'
sources:
- label: Primary - OpenAI developer changelog, Jul 28 GPT Transcribe release
  url: https://developers.openai.com/api/docs/changelog
  date: 28-07-2026
- label: Primary - OpenAI API pricing, transcription and realtime audio rows
  url: https://developers.openai.com/api/docs/pricing
  date: 28-07-2026
- label: Primary - OpenAI model page, gpt-transcribe endpoints and price
  url: https://developers.openai.com/api/docs/models/gpt-transcribe
  date: 28-07-2026
- label: Primary - OpenAI model page, gpt-live-transcribe endpoints and price
  url: https://developers.openai.com/api/docs/models/gpt-live-transcribe
  date: 28-07-2026
- label: Primary - OpenAI realtime transcription guide, session config and delay levels
  url: https://developers.openai.com/api/docs/guides/realtime-transcription
  date: 28-07-2026
- label: Primary - OpenAI transcription guide, workflow and capability matrix
  url: https://developers.openai.com/api/docs/guides/transcription
  date: 28-07-2026
- label: Corroboration - Microsoft Foundry blog, GPT Transcribe availability
  url: https://techcommunity.microsoft.com/blog/azure-ai-foundry-blog/introducing-gpt-transcribe-and-gpt-live-transcribe-in-microsoft-foundry/4541740
  date: 29-07-2026
- label: Corroboration - yellow.com, launch pricing and third-party accuracy index
  url: https://yellow.com/news/openai-cuts-transcription-prices-25-percent
  date: 30-07-2026
contentHash: sha256:d4e172aed91d6744
publishState: published
---

## What changed

OpenAI released GPT Transcribe and GPT Live Transcribe on July 28 [s1]. The file model bills $0.0045 per minute and the streaming one $0.017 per minute [s2]; Microsoft listed both in Foundry the next day [s7]. The rewritten transcription guide now routes each workflow to one recommended starting model [s6].

## Three things move at once

Reading this as a version bump is fair on the surface: same vendor, same task, a newer id on the same call. It still breaks: the hint field renames, the endpoints split [s3][s4], and the outputs you consume move elsewhere.

| Capability | `gpt-transcribe` | `gpt-live-transcribe` |
| :--- | :--- | :--- |
| Price per minute | $0.0045 [s2] | $0.017 [s2] |
| File endpoint | `v1/audio/transcriptions` [s3] | not supported [s4] |
| Realtime endpoint | `v1/realtime/transcription_sessions` [s3] | `v1/realtime/transcription_sessions` [s4] |
| Word timestamps, speaker labels | routed to `whisper-1` or `gpt-4o-transcribe-diarize` [s6] | none returned [s5] |
| Language hint field | `languages` [s6] | `languages` [s5] |

The rename is cheap and fails at runtime rather than at review time.

The expensive break sits downstream. Anything consuming word timestamps, subtitles, or speaker labels stays on `whisper-1` or `gpt-4o-transcribe-diarize` [s6], because `gpt-live-transcribe` returns none of them [s5]. There the upgrade means rewriting the consumer. I would adopt on the file path where the product only needs text, and keep the old model wherever the transcript feeds a timeline.

A streaming session carries the context hints in one object [s5]:

```json
"transcription": {
  "model": "gpt-live-transcribe",
  "prompt": "A customer support call about a premium plan and account AC-42.",
  "keywords": ["premium plan", "AC-42", "billing"],
  "languages": ["en", "fr"],
  "delay": "low"
}
```

> [!IMPORTANT]
> These models read `languages`, a list, where the 4o transcription models read `language`, a string [s6], and the guide says not to send both [s5].

## Where the price cut actually lands

The quarter-below-its-predecessor headline [s8] describes one of the two models: $0.0045 against $0.006 for `gpt-4o-transcribe` [s2]. `gpt-4o-mini-transcribe` still bills $0.003 [s2], so the recommended path costs half again as much per minute as the tier OpenAI does not recommend for new integrations [s6]. And `gpt-realtime-whisper` bills the same $0.017 [s2]: the streaming meter is not new. Artificial Analysis measured a 3.31% word error rate, ninth among the roughly 50 systems it tracks [s8]. Size your accuracy expectations to that rank.

## Impact on your team

There is no deadline, and that is the useful part: the 4o models keep working for existing integrations [s6], so read "recommended starting model" as routing advice for new work. Before any model id changes, grep the transcription call sites for `language:` and for every consumer of word timestamps or speaker labels; those two greps decide whether this is a one-line change or a sprint. Keep `gpt-4o-mini-transcribe` for bulk batch where $0.003 beats $0.0045 [s2]. If you open streaming sessions, benchmark `delay` on your own telephony audio: the docs name starting points from `minimal` to `xhigh` and publish no milliseconds [s5].
