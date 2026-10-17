---
translationKey: beam-dflash2-drafter-low-latency-recipe-disabled-for-high-throughput
lang: en
slug: reflection-beam-dflash2-drafter-sglang-vllm-per-deployment-switch
title: Reflection's Beam ships with a DFlash2 speculative drafter, and SGLang's High-Throughput
  recipe disables it
publishDate: 17-10-2026
kind: release
tags:
- Reflection
- Beam
- vLLM
- SGLang
- inference
summary: 'Reflection released Beam on October 16, 2026, with a DFlash2 speculative
  decoding drafter that checks 7 drafted tokens per verification step at the recommended
  block size of 8. SGLang''s Low-Latency recipe uses the drafter and its High-Throughput
  recipe disables it; vLLM says it speeds up decoding most at low concurrency and
  adds about 1.7 GB per GPU, which reduces KV-cache capacity. My call: the drafter
  for interactive coding agents, batch fleets without it, and a benchmark of both
  setups on your own recorded traces before you commit.'
sources:
- label: Reflection, "Beam is now available"
  url: https://reflection.ai/blog/beam-is-available
  date: 16-10-2026
- label: AlphaSignal, "Reflection AI Drops Beam, a 501B Open-Weight Agent Model for
    Coding"
  url: https://alphasignal.ai/news/reflection-ai-drops-beam-a-501b-open-weight-agent-model-for-coding
  date: 16-10-2026
- label: Hugging Face, reflection/Beam-1.0-501B-A23B-DFlash2 model card
  url: https://huggingface.co/reflection/Beam-1.0-501B-A23B-DFlash2
  date: 16-10-2026
- label: SGLang Cookbook, "Reflection Beam 1.0"
  url: https://docs.sglang.io/cookbook/autoregressive/Reflection/Beam-1_0
  date: 16-10-2026
- label: vLLM Recipes, "reflection/Beam-1.0-501B-A23B"
  url: https://recipes.vllm.ai/reflection/Beam-1.0-501B-A23B?features=reasoning%2Ctool_calling%2Cspec_decoding
  date: 16-10-2026
contentHash: sha256:59492199d647fa1e
publishState: published
---

## What changed

Reflection released Beam on October 16, 2026 [s1]. The weights ship in BF16, FP8 and NVFP4, plus a speculative decoding drafter [s2]. That drafter, `reflection/Beam-1.0-501B-A23B-DFlash2`, runs beside Beam, which verifies every drafted token [s3]. At the recommended serving block size of 8, each verification step checks 7 drafted tokens [s3].

## A switch per deployment

I think the drafter is a per-deployment setting, and the engine recipes already say which way to set it. SGLang's cookbook uses it in the Low-Latency recipe at block size 8 and disables it in the High-Throughput recipe [s4]. vLLM's recipe recommends 7 speculative tokens and says the drafter speeds up decoding most at low concurrency and adds about 1.7 GB per GPU, which reduces KV-cache capacity [s5]. These are the drafter flags from SGLang's Low-Latency recipe [s4]:

```text
--speculative-algorithm DFLASH
--speculative-draft-model-path reflection/Beam-1.0-501B-A23B-DFlash2
--speculative-dflash-block-size 8
```

> [!CONFIRMED]
> On Reflection's DeepSWE agentic coding traces, mean acceptance length is 5.72 tokens per verification step for prompts of 0 to 2k tokens, and between 4.22 and 4.58 in each bucket from 16k to 128k [s3].

> [!INFERRED]
> In my reading, long coding sessions are squeezed from both sides: they want the KV-cache room the drafter takes, and those buckets get fewer tokens per step than short prompts.

## The strongest objection

vLLM's recipe offers a counterweight: with `enable_adaptive_verification`, vLLM verifies only the draft tokens worth the compute, which raises throughput under load [s5]. I agree that SGLang's default proves nothing about the drafter under load. My answer is to measure, and vLLM names the trap: acceptance depends on natural-language input, so benchmark with a real-text dataset instead of `--dataset-name random` [s5].

## Impact on your team

My call: run an interactive coding agent with few concurrent sessions on the Low-Latency recipe with the drafter, and run batch evaluation and offline agent fleets without it. If you keep the drafter, size the KV cache knowing that about 1.7 GB per GPU is already gone [s5]. Replay your own recorded agent traces through both setups before you choose, because Reflection measured on NVFP4 with tensor parallelism 4 on B300 GPUs [s3]. On vLLM, Beam runs from the `vllm/vllm-openai:reflection-beam` image because support has not shipped in a vLLM release yet [s5]; treat that image as temporary and wait for a tagged release before you pin it in production.
