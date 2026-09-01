---
translationKey: qwen38-27b-runtime-build-and-file-revision
lang: en
slug: qwen3-8-27b-runtime-build-and-file-revision
title: Running Qwen3.8 27B at 4-bit takes 17 GB and a current llama.cpp build
publishDate: 01-09-2026
kind: benchmark
tags:
- Qwen
- llama.cpp
- Ollama
- local inference
- quantization
summary: Two independent runs of Qwen3.8 27B, published on 26 and 27 August 2026,
  agree that the 4-bit Q4_K_M file weighs 17 GB and that an older llama.cpp build
  will not run the model at all [s1][s2]. I think the scarce ingredient for a fresh
  open-weight drop is now a current runtime.
sources:
- label: Quesma Blog, benchmarking Qwen3.8 27B quantizations
  url: https://quesma.com/blog/qwen38-27b-quantizations-benchmarked/
  date: 26-08-2026
- label: TerminalBytes, Qwen3.8 27B measured on a Mac Studio M3 Ultra
  url: https://terminalbytes.com/run-qwen-3-8-27b-locally/
  date: 27-08-2026
contentHash: sha256:ea2c29b5754f2902
publishState: published
---

## What changed

Two independent measurements of Qwen3.8 27B landed a day apart, on setups with nothing in
common. On 26 August 2026 Quesma published task-level scores across the Unsloth GGUF
quantizations, at around $3,000 of Modal GPU time [s1]. On 27 August 2026 TerminalBytes
published five-run Ollama timings for the same model on a Mac Studio M3 Ultra [s2]. Both
land on 17 GB for the 4-bit Q4_K_M file [s1][s2], and both report that an older llama.cpp
build will not run the model at all [s1][s2].

## The agreement neither run set out to make

Quesma used a llama.cpp build from 16 August 2026, because earlier builds do not work for
this model [s1]. TerminalBytes says you need a build from the last couple of weeks, and
that older ones fail with `unknown model architecture: 'qwen35'` [s2]. Two engineers, two
harnesses, two machines, one wall. The GGUF architecture tag is the tell, and I think it
generalizes: for an open-weight model this fresh, the runtime is the scarce ingredient.

| Same machine, same 17 GB Q4_K_M quant [s2] | qwen3.6:27b | qwen3.8:27b |
| --- | ---: | ---: |
| Generation speed, 5-run average | 28.6 tok/s | 14.0 tok/s |
| Tokens used per answer | 1,950-3,340 | 890-1,090 |

Those timings cut against the obvious reading. Generation speed halved between the two
model versions on one machine, and the newer model answers the same prompts in roughly a
third the tokens, so wall-clock per finished answer is close to a tie [s2]. Compare
finished answers before you compare tokens per second.

The reproducibility cost is the part that lasts. Quesma records that Unsloth replaced the
v2 quantization files on 19 August 2026, so the exact files behind most of its scores are
no longer available [s1].

> [!IMPORTANT]
> Both of these runs were measured against artifacts that no longer exist in that form: a
> llama.cpp build tied to a particular week [s1][s2], and Unsloth v2 files replaced on 19
> August 2026 [s1]. I think a local-model benchmark now has a shelf life of about a
> fortnight, so read one published without its build date and its file revision as undated.

## Impact on your team

This is a decision for anyone pinning a local-inference image this quarter. Pin three
things together: the llama.cpp or Ollama build, the exact GGUF file revision, and the
reasoning effort. Quesma warns that the effort setting matters a lot, that the default is
xhigh, and that it can overthink [s1]; leave it out and your numbers stop meaning anything.
The migration trap runs backwards from the usual one: no card got smaller, so a capacity
plan built on 17 GB still holds [s1][s2], while the container you baked in July refuses the
model outright [s1][s2]. Rebuild the runtime first, then benchmark.
