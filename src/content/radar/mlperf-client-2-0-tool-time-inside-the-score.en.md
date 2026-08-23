---
translationKey: mlperf-client-2-0-tool-time-inside-the-score
lang: en
slug: mlperf-client-2-0-tool-time-inside-the-score
title: MLPerf Client 2.0 puts tool execution time inside the agentic score, and drops
  Phi 3.5 from the base lineup
publishDate: 23-08-2026
kind: release
tags:
- MLPerf
- MLCommons
- benchmark
- agents
summary: MLCommons tagged MLPerf Client v2.0 on August 18, 2026, adding an agentic
  category whose benchmarks time tool execution alongside LLM inference [s1]. The
  change that matters, I think, is that an agentic score now measures the whole local
  stack rather than the model alone.
sources:
- label: MLCommons, MLPerf Client v2.0 release notes
  url: https://github.com/mlcommons/mlperf_client/releases/tag/v2.0
  date: 18-08-2026
- label: Tom's Hardware, on the MLPerf Client 1.0 model lineup
  url: https://www.tomshardware.com/software/mlperf-client-1-0-ai-benchmark-released-new-testing-toolkit-sports-a-gui-covers-more-models-and-tasks-and-supports-more-hardware-acceleration-paths
  date: 01-08-2025
contentHash: sha256:fb930fc052a5b2aa
publishState: published
---

## What changed

MLCommons tagged MLPerf Client v2.0 on August 18, 2026, adding an Agentic AI Benchmarking category whose Software Engineering (SWE) and Data Analyst tasks track end-to-end performance including tool execution time [s1]. The LLM lineup moved with it, and the table below carries the detail [s1]. A new image generation category features Flux 2 Klein 4B, experimental [s1].

## What the score now contains

The measurement boundary moved off the model and onto the whole local stack. The agentic benchmarks time tool execution alongside inference, so the score belongs to the device plus whatever runs the SWE and Data Analyst tasks [s1]. The notes name both task families and name neither the agent harness nor the tools behind them [s1]. A year earlier the 1.0 writeup named Llama 2 7B Chat and Phi 3.5 Mini Instruct among the models it tested [s2]; v2.0 removes Phi 3.5 and moves Phi 4 Reasoning 14B into the extended category [s1].

| Model | Named in the 1.0 writeup, a year earlier [s2] | Status in v2.0 [s1] |
| --- | --- | --- |
| Llama 3.1 8B Instruct | tested | mandatory base benchmark |
| Phi 3.5 Mini Instruct | tested | removed |
| Phi 4 Reasoning 14B | experimental | moved to the extended category |
| Llama 2 7B Chat | tested | not named in the v2.0 notes |
| Phi 4 Mini Instruct | not among the models that writeup names | mandatory base benchmark |
| Qwen 3 8B | not among the models that writeup names | experimental test |

> [!IMPORTANT]
> The agentic benchmarks time tool execution alongside LLM inference [s1].
> A device with the faster accelerator can therefore post the slower agentic number when the tool layer around it is slower. I think that is the trap.

## Impact on your team

This lands on anyone buying or publishing AI PC numbers, or timing an agent workload. Re-baseline on v2.0 rather than diffing a v1.x archive: Phi 3.5 is gone from the base set [s1], and the lineup that writeup documented [s2] is not v2.0's [s1]. When a vendor quotes an agentic score, demand the task family and the tool layer behind it before you compare two devices [s1]. Re-run it yourself or it is not your number.
