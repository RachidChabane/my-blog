---
translationKey: diffusiongemma-26b-a4b-text-diffusion
lang: en
slug: diffusiongemma-open-text-diffusion-model
title: 'DiffusionGemma 26B-A4B: Google''s first open text-diffusion model'
publishDate: 23-06-2026
kind: release
tags:
- open-weight
- llm-release
- text-diffusion
- inference
- long-context
summary: 'Google DeepMind released DiffusionGemma 26B-A4B on 2026-06-10, an open-weight
  MoE (25.2B total / 3.8B active) on the Gemma 4 backbone that drops autoregressive
  decoding for discrete text diffusion, denoising a 256-token canvas in parallel at
  over 1000 tokens/sec on one H100. The speed costs quality: 77.6% on MMLU Pro against
  Gemma 4''s 82.6%. It ships under Apache 2.0.'
sources:
- label: Google Hugging Face model card - google/diffusiongemma-26B-A4B-it
  url: https://huggingface.co/google/diffusiongemma-26B-A4B-it
  date: 10-06-2026
- label: MarkTechPost - independent coverage of DiffusionGemma
  url: https://www.marktechpost.com/2026/06/10/google-ai-releases-diffusiongemma-a-26b-moe-open-model-using-text-diffusion-for-up-to-4x-faster-generation/
  date: 10-06-2026
contentHash: sha256:a07736474badffb0
publishState: published
---

## What changed

The serving model changes here, not just a benchmark line. On 2026-06-10 Google DeepMind released DiffusionGemma 26B-A4B (`google/diffusiongemma-26B-A4B-it`), an open-weight MoE with 25.2B total and 3.8B active parameters on the Gemma 4 backbone, and it drops autoregressive decoding for discrete text diffusion. Throughput is no longer governed by left-to-right token emission; it is governed by the number of denoising steps and how many tokens each forward pass commits.

## The speed/quality trade

DiffusionGemma denoises a 256-token canvas in parallel and finalizes roughly 15 to 20 tokens per forward pass, which is where the speed comes from. The cost lands on quality.

| Dimension | DiffusionGemma 26B-A4B | Gemma 4 26B-A4B |
| :--- | :--- | ---: |
| Decoding | discrete text diffusion (parallel canvas) | autoregressive |
| MMLU Pro | 77.6% | 82.6% |
| GPQA Diamond | 73.2% | (not stated) |
| Throughput (H100, FP8) | 1100+ tok/s | (autoregressive baseline) |
| Context | 256K tokens | - |
| License | Apache 2.0 | - |

The throughput figure has two sources that disagree on the floor: the model card reports over 1100 tokens per second on an H100 with FP8, while the independent MarkTechPost writeup reports 1000+ tokens per second on a single H100 and 700+ on an RTX 5090. Either way, this is roughly the regime where one accelerator serves what a multi-GPU autoregressive setup would.

> [!IMPORTANT]
> This is quality traded for speed, not a free lunch: 77.6% on MMLU Pro against Gemma 4's 82.6% is a real five-point drop. The card calls the method "block-autoregressive multi-canvas sampling," so it is not fully non-sequential; treat the parallelism as block-level. And the card lists Text and Image input with text output only, so do not plan around a video modality that some aggregators report.

## Impact on your team

If you run latency-bound or high-throughput inference, this is worth an eval this week. The decision is concrete: 1000+ tokens per second on a single H100 against a roughly five-point MMLU Pro drop. Benchmark it on your own latency-sensitive workload behind the same harness before swapping anything; a leaderboard delta rarely matches what your traffic sees. It ships under Apache 2.0, so there is no usage-limit legal review to clear, and you can self-host on one H100, or on an RTX 5090 at 700+ tokens per second for a smaller budget. It is a release, not a deprecation, so there is no deadline: scope it as an experiment, not a migration.
