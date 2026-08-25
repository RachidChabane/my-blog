---
translationKey: gemma-4-31b-groq-3-lpx-sram-sizing
lang: en
slug: 31-billion-parameter-model-single-groq-3-lpx-rack
title: A 31 billion parameter model fits a single Groq 3 LPX rack whatever the data
  type
publishDate: 25-08-2026
kind: benchmark
tags:
- NVIDIA
- Groq 3 LPX
- inference
- benchmark
- agents
summary: NVIDIA's post reported on 24 August 2026 that Artificial Analysis measured
  3,431 output tokens/second running its 100K context benchmark on Gemma 4 31B on
  Groq 3 LPX [s1]. For The Register, that same model fits a single LPX rack whatever
  the data type chosen for the weights [s2].
sources:
- label: NVIDIA Technical Blog, Groq 3 LPX long-context interactivity
  url: https://developer.nvidia.com/blog/how-nvidia-groq-3-lpx-unlocks-ultrafast-interactivity-at-long-context-on-nvidia-vera-rubin/
  date: 24-08-2026
- label: The Register, on the Groq 3 LPX benchmark numbers
  url: https://www.theregister.com/systems/2026/08/24/what-nvidias-first-groq-3-lpu-benchmarks-do-and-dont-tell-us-about-its-20b-gamble/5291880
  date: 24-08-2026
contentHash: sha256:dd9840e796566f56
publishState: published
---

## What changed

Artificial Analysis ran its 100K context benchmark on the Gemma 4 31B model on Groq 3 LPX and measured 3,431 output tokens/second, a figure NVIDIA's post reported on 24 August 2026 [s1]. The same day The Register worked out what that model occupies on the hardware: a little over 31 GB, or just under 64 LPUs of SRAM capacity, with NVIDIA running it at FP8 [s2]. NVIDIA's post pairs Groq 3 LPX with Vera Rubin NVL72 to serve multiagent systems powered by 2T+ parameter models [s1].

## What one rack actually holds

At 31 billion parameters, The Register's own arithmetic puts the model inside a single LPX rack regardless of the data type used to store the weights [s2]. What decides the fit at this size, I think, is the rack's SRAM budget, and precision starts to matter for sizing only at the boundary where a model stops fitting a rack. The concrete quantity behind that is just under 64 LPUs of SRAM capacity at FP8 [s2]. The table below sets the figures side by side.

| Figure | Value | Where it originates |
| --- | --- | --- |
| Interactivity, 100K context benchmark | 3,431 output tokens/second | NVIDIA's post, reporting Artificial Analysis' run [s1] |
| Benchmarked model | Gemma 4 31B | NVIDIA's post [s1] |
| Weights at FP8 | a little over 31 GB | The Register's own derivation [s2] |
| SRAM capacity needed | just under 64 LPUs | The Register's own derivation [s2] |
| Footprint | a single LPX rack, regardless of data type | The Register's own derivation [s2] |

> [!IMPORTANT]
> Nothing published links the throughput figure to the precision. NVIDIA's post gives 3,431 output tokens/second on the 100K context benchmark [s1]; The Register says NVIDIA is running the model at FP8 [s2]. Neither page says the benchmark ran at that precision, so ask before you assume it.

## Impact on your team

This lands on anyone picking an inference provider for long-context work, and on anyone sizing a rack around a model they already run. In my experience the useful move is to compute your own model's weight footprint at your own precision and check it against the accelerator's SRAM budget before you quote anybody's tokens-per-second, because on this hardware capacity is bought in accelerator count. What that changes is the shortlist: a provider that cannot hold your model in one rack sits in a different bracket from one that is merely slower. Sizing comes before speed.
