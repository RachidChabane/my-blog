---
translationKey: deepinfer-offline-engine-without-kv-cache-and-data-parallel-load-balancing
lang: en
slug: deepinfer-offline-engine-without-kv-cache-and-data-parallel-load-balancing
title: DeepSeek's DeepInfer ships as an offline engine for SM100 and Ascend 950, without
  the KV cache system or the data-parallel load balancing behind its service
publishDate: 21-10-2026
kind: tool
tags:
- DeepSeek
- DeepInfer
- vLLM
- inference
summary: 'DeepSeek released DeepInfer on October 20, 2026, under the Apache License
  2.0, as an offline inference engine for DeepSeek-V4.1-Flash on NVIDIA SM100 GPUs
  and Huawei Ascend 950 NPUs. Its README lists a KV cache system, VE/Prefill/Decode
  disaggregation and load balancing across data-parallel replicas as not included,
  and DeepSeek''s deployment Q&A says its KV cache management and load balancing components
  are tightly coupled to its internal infrastructure. One contributor''s unmerged
  pull request reports a ~1.4 s TTFT floor in a serving setting from the engine default
  of 100. My call: read it as reference code until a server lands.'
sources:
- label: DeepSeek, DeepInfer README.md
  url: https://raw.githubusercontent.com/deepseek-ai/DeepInfer/9bd9cf243fc53ef9afbf8f04d391d989117d6ab9/README.md
  date: 20-10-2026
- label: DeepSeek, DeepSeek V4.1 Flash Inference Deployment Q&A
  url: https://raw.githubusercontent.com/deepseek-ai/DeepInfer/9bd9cf243fc53ef9afbf8f04d391d989117d6ab9/doc/inference_deployment_qa.md
  date: 20-10-2026
- label: DeepSeek, deepinfer/environ.py in deepseek-ai/DeepInfer
  url: https://raw.githubusercontent.com/deepseek-ai/DeepInfer/9bd9cf243fc53ef9afbf8f04d391d989117d6ab9/deepinfer/environ.py
  date: 20-10-2026
- label: SiliconANGLE (Duncan Riley), DeepSeek open-sources DeepInfer, the inference
    framework behind its production services
  url: https://siliconangle.com/2026/10/20/deepseek-open-sources-deepinfer-the-inference-framework-behind-its-production-services/
  date: 20-10-2026
- label: The Next Web, DeepSeek open-sources DeepInfer, the engine that runs its AI
    models
  url: https://thenextweb.com/news/deepseek-deepinfer-open-source-inference-engine
  date: 20-10-2026
- label: GitHub pull request 147 on deepseek-ai/DeepInfer (open, unmerged), Add a
    minimal OpenAI-compatible chat server over the offline engine
  url: https://github.com/deepseek-ai/DeepInfer/pull/147
  date: 21-10-2026
contentHash: sha256:1471b9fe744df5e4
publishState: published
---

## What changed

DeepSeek released DeepInfer under the Apache License 2.0 on October 20, 2026 [s1][s5]. Its README calls the release offline inference for DeepSeek-V4.1-Flash on NVIDIA SM100 GPUs or Huawei Ascend 950 NPUs, and says DeepInfer was originally built primarily on vLLM [s1].

## What ships and what is missing

I think the line to read first is the README's list of what this release leaves out. Its parallelism is Attention DP / balanced CP and MoE EP + EPLB [s1]. DeepSeek's deployment Q&A lists retaining KV cache for more than 72 hours to cut repeated prefill computation on a cache hit [s2].

> [!CONFIRMED]
> The README lists a KV cache system, VE/Prefill/Decode disaggregation and load balancing across data-parallel replicas as not included in this release [s1], and DeepSeek's deployment Q&A says its KV cache management and load balancing components are tightly coupled to its internal infrastructure, so that code is not yet fully open-sourced [s2].

> [!INFERRED]
> My reading: the cache reuse DeepSeek describes depends on the KV cache system this release leaves out, so a team can read the kernels and the scheduler here and still cannot rebuild DeepSeek's service from this repository.

## Where a server stalls

The engine sets this default in `deepinfer/environ.py` [s3]:

```python
DEEPINFER_PREFILL_ANY_ATTEMPT_INTERVAL = EnvVar.int(default=100)
```

One contributor's open, unmerged pull request, which adds a minimal OpenAI-compatible chat server over the offline engine, reports that with the engine default of 100, a rank whose peers are idle admits a waiting prompt only every 100 decode steps, a ~1.4 s TTFT floor on every request in a serving setting [s6]. I read it as one person's measurement, to verify on your own setup.

## The strongest objection

The kernels and the scheduler are the hard part, and opening them is real value for anyone building an engine. I agree, and that is why my call is reference code: the kernels repay study today, and the serving layer is yours to build.

## Impact on your team

My call: treat DeepInfer as reference code until a server and a KV cache system land in the repository. SiliconANGLE notes that Hopper and other older Nvidia architectures are not on the list [s4]. On SM100, self-hosting with it means building the KV cache system and the data-parallel load balancing yourself, and finishing the disaggregation, where the README says most required engine functionality is already implemented [s1]. If you wrap the engine in a server, measure TTFT on your own traffic before you keep the default of 100 [s3][s6]. The Next Web, citing Bloomberg's Saritha Rai, writes that there is no independent benchmarking of DeepInfer's gains yet [s5].
