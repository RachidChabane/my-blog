---
translationKey: nemotron-3-5-transcribe-headline-wer-versus-deepinfra-row
lang: en
slug: nemotron-3-5-transcribe-headline-wer-versus-deepinfra-row
title: Artificial Analysis puts Nemotron 3.5 Transcribe at 2.8% AA-WER, and lists
  its DeepInfra deployment at 3.4%
publishDate: 01-11-2026
kind: benchmark
tags:
- NVIDIA
- Nemotron
- Artificial Analysis
- speech-to-text
summary: 'NVIDIA published Nemotron 3.5 Transcribe on October 28, 2026 under the OpenMDW-1.1
  license and says it ties for first among open-weight models at 2.8% AA-WER. Artificial
  Analysis lists it at AA-WER 2.8%, and the leaderboard table on the same page lists
  its DeepInfra deployment at 3.4%. Cekura says Artificial Analysis does not say why,
  and that hosting changes scores. My call: use it for batch transcription of recordings,
  score your own audio on the endpoint you will call before budgeting against 2.8%,
  and keep a streaming model for live calls.'
sources:
- label: 'NVIDIA Research, NVIDIA Nemotron 3.5 Transcribe: Intelligent Transcription
    with a Speech LLM'
  url: https://research.nvidia.com/labs/nemotron/NVIDIA-Nemotron-3.5-Transcribe/
  date: 28-10-2026
- label: 'NVIDIA on Hugging Face, NVIDIA Nemotron 3.5 Transcribe and Granary v2: Intelligent
    Multilingual Transcription You Can Prompt and Adapt'
  url: https://huggingface.co/blog/nvidia/nemotron-transcribe-granary
  date: 28-10-2026
- label: Artificial Analysis, Speech to Text leaderboard
  url: https://artificialanalysis.ai/speech-to-text
  date: 28-10-2026
- label: 'Cekura, Nemotron 3.5 Transcribe: Specs, Accuracy, Languages, Setup'
  url: https://www.cekura.ai/blogs/nemotron-3-5-transcribe
  date: 29-10-2026
contentHash: sha256:857e9154e3256ab6
publishState: published
---

## What changed

NVIDIA Research published Nemotron 3.5 Transcribe on October 28, 2026, under the OpenMDW-1.1 license, with BF16, FP8 and NVFP4 checkpoints of NVIDIA-Nemotron-3.5-Transcribe-30B-A4B [s1]. NVIDIA says it ties for first among open-weight models at 2.8% AA-WER, with about 4B active parameters versus 24B for the model it ties [s2]. Artificial Analysis lists it at AA-WER 2.8% in its open weights ranking, and the leaderboard table on the same page lists its DeepInfra deployment at a 3.4% word error rate [s3].

## The host is part of the score

I think the figure to budget a transcription pipeline against is the one measured on the endpoint you will call. Cekura says the leaderboard row measures the DeepInfra deployment and shows 3.4%, and that Artificial Analysis does not say why [s4]. Cekura also says hosting changes scores, and reads the same table [s4]:

| Model | Which figure | WER | Reported by |
| :--- | :--- | ---: | :--- |
| Nemotron 3.5 Transcribe | AA-WER ranking | 2.8% | Artificial Analysis [s3] |
| Nemotron 3.5 Transcribe | DeepInfra row | 3.4% | Artificial Analysis [s3] |
| Whisper Large v3 | fal.ai row | 4.1% | Cekura [s4] |
| Whisper Large v3 | Replicate row | 10.1% | Cekura [s4] |

In my reading the Whisper rows are the precedent: one model, two hosts, two very different scores, and nothing in the 2.8% tells you which host your traffic will land on.

## Which figure to budget against

The strongest objection is that 2.8% is an Artificial Analysis measurement as well, so the weights can reach it. I agree. That is why I read 2.8% as what the model can do and 3.4% as what one hosted deployment delivered. NVIDIA says to serve the available checkpoint with vLLM, or to use a hosted endpoint from Baseten, DeepInfra or Simplismart [s2]. In my view each of those is a separate deployment to score, and I would not assume any of them inherits the 2.8%.

## Impact on your team

If you transcribe recordings in batch, my call: shortlist Nemotron 3.5 Transcribe, then score a sample of your own audio on the exact endpoint you will buy before you size a budget on 2.8%. Artificial Analysis lists the DeepInfra deployment at 2.00 USD per 1,000 minutes [s3], so I think that test is cheap next to a contract sized on a figure your endpoint does not reach. For live calls I would keep your current streaming model: NVIDIA says Transcribe is built for recorded audio [s2], and the 1.8% it reports on AA-AgentTalk, the voice-agent speech set, does not change that scope.
