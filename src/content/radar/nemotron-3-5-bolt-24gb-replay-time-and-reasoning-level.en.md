---
translationKey: nemotron-3-5-bolt-24gb-replay-time-and-reasoning-level
lang: en
slug: nemotron-3-5-bolt-24gb-replay-time-and-reasoning-level
title: Nemotron 3.5 Bolt 24GB trails Qwen3.6 and Gemma 4 on replay time in NVIDIA's
  own table, and medium reasoning cut Classmethod's 10 Japanese tasks from 356 to
  91 seconds
publishDate: 20-10-2026
kind: release
tags:
- NVIDIA
- Nemotron
- llama.cpp
- local inference
- quantization
summary: 'NVIDIA released Nemotron 3.5 Bolt 74B-A9B 24GB on October 15, 2026, claiming
  higher accuracy than Qwen3.6 35B-A3B and Gemma 4 26B-A4B, yet its own table gives
  Bolt an AgentPerf Local replay of 600.80 s against 453.97 s and 480.68 s, on Artificial
  Analysis''s replay tool, which holds each turn''s tokens fixed. The chat template
  adds a medium_effort switch, off by default, and on 10 Japanese tasks Classmethod
  kept an 8/9 score while time fell from 356 to 91 seconds. My call: benchmark Bolt
  with medium_effort against Qwen3.6 on your own tasks, and watch for runs that exhaust
  the output budget.'
sources:
- label: NVIDIA Research, "NVIDIA Nemotron 3.5 Bolt 74B-A9B 24GB" technical blog
  url: https://research.nvidia.com/labs/nemotron/Nemotron-3.5-Bolt-24GB/
  date: 15-10-2026
- label: Hugging Face model card, nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-24GB-GGUF
  url: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-24GB-GGUF
  date: 15-10-2026
- label: Artificial Analysis, "First AA-AgentPerf-Local results for an NVIDIA RTX
    Spark N1X laptop"
  url: https://artificialanalysis.ai/articles/nvidia-rtx-spark-agentperf-local
  date: 15-10-2026
- label: Artificial Analysis, "NVIDIA Releases Nemotron 3.5 Super and Nemotron 3.5
    Bolt"
  url: https://artificialanalysis.ai/articles/nemotron-3-5-super-and-bolt
  date: 15-10-2026
- label: Classmethod (Hiroshi Morishige), "I ran the 2-bit quantized MoE Nemotron
    3.5 Bolt 74B-A9B on DGX Spark"
  url: https://dev.classmethod.jp/en/articles/dgx-spark-nemotron-3-5-bolt-74b-a9b-first-touch/
  date: 16-10-2026
- label: Hugging Face, chat_template.jinja in nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-24GB
  url: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-24GB/raw/main/chat_template.jinja
  date: 15-10-2026
contentHash: sha256:8f8dc169f4dbaf3b
publishState: published
---

## What changed

NVIDIA released Nemotron 3.5 Bolt 74B-A9B 24GB on October 15, 2026 [s1][s2], designed to fit into 24GB of memory and decode at a speed of at least 80 TPS [s1]. Its experts are compressed to 2.0625 bits per element IQ2_XXS, and NVIDIA claims higher accuracy than Qwen3.6 35B-A3B and Gemma 4 26B-A4B across many benchmarks [s1].

## What the replay row measures

I think the number to read is in NVIDIA's own speed table, measured with llama.cpp on the same RTX Spark hardware [s1].

| Model and build, as NVIDIA lists them | SPEED-Bench-Coding TPS | AgentPerf Local replay (s) |
| :--- | ---: | ---: |
| Nemotron 3.5 Bolt 74B-A9B 24GB IQ2_XXS w. LiLiCorr | 83.99 [s1] | 600.80 [s1] |
| Qwen3.6 35B-A3B UD-Q4_K_M w. MTP | 96.63 [s1] | 453.97 [s1] |
| Gemma 4 26B-A4B UD-Q4_K_M w. MTP | 100.56 [s1] | 480.68 [s1] |
| Qwen3.8 27B UD-Q4_K_M w. DFlash | 28.26 [s1] | 1043.28 [s1] |

> [!CONFIRMED]
> In NVIDIA's own table, Bolt's replay takes 600.80 s against 453.97 s for Qwen3.6 35B-A3B and 480.68 s for Gemma 4 26B-A4B [s1], and Artificial Analysis says its replay generates exactly the number of tokens recorded for each turn [s3].

> [!INFERRED]
> My reading: the replay prices the same work at each model's speed, so it is silent on how many tokens Bolt spends, which in a live agent loop is the other half of the bill.

On that count the independent sources point different ways. Artificial Analysis, without naming the build it scored, measures Bolt at 82k output tokens per Intelligence Index task, 1.8x Nemotron 3.5 Super VL [s4]; Classmethod writes that Bolt thinks noticeably shorter than Lightning [s5]. Neither compares it with Qwen3.6 or Gemma 4.

## The reasoning level is the lever

The chat template in `nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-24GB` sets `medium_effort`, off by default [s6]:

```jinja
{%- set enable_thinking = enable_thinking if enable_thinking is defined else True %}
{%- set medium_effort = medium_effort if medium_effort is defined else False %}
```

Set to True, `medium_effort` appends `{reasoning effort: efficient}` to the last user turn [s6]. Classmethod ran the medium level on a DGX Spark over 10 Japanese tasks, at `--parallel 8` without speculative decoding: medium kept the automated score at 8/9 while total tokens fell from 13,413 to 3,240 and time from 356 to 91 seconds [s5]. The high total includes one task that exhausted the 8,192-token budget and produced no body text, a task medium answered [s5].

## The strongest objection

A replay that holds tokens equal is the fair speed test, and an accuracy lead can be worth the wait. I agree, and that is exactly why the replay cannot price your loop: once the model sets its own output length, the reasoning level moves the clock.

## Impact on your team

My call, if you run Bolt locally behind an agent harness: benchmark it with `medium_effort` on against Qwen3.6 35B-A3B on your own tasks before you keep the high default, and log every run that spends the whole output budget without an answer. Classmethod's result, on 10 Japanese tasks [s5], is a hypothesis to test. Size the machine for a single concurrent sequence, which both model card recipes assume: the 32GB recipe targets RTX Spark 128GB or a 48GB+ discrete GPU, the 28GB recipe RTX Spark 64GB or a 32GB+ one [s2].
