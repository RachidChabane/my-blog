---
translationKey: inkling-2-small-terminal-bench-4-row-and-tinker-context-rows
lang: en
slug: inkling-2-small-terminal-bench-4-row-and-tinker-context-rows
title: Inkling 2 Small launches on Tinker with closed weights, and Artificial Analysis
  measures it at 13% on Terminal-Bench 4.0 against 30% for Claude Sonnet 5.5 (medium)
publishDate: 07-11-2026
kind: release
tags:
- Inkling
- Thinking Machines
- Tinker
- agents
- evals
summary: 'Thinking Machines Lab released Inkling 2 Small on Tinker with closed weights,
  and its announcement plans Apache 2.0 weights for next week. Artificial Analysis
  measures it at 25% on FrontierCode 2.0 against 11% for Claude Sonnet 5.5 (medium),
  but 13% on Terminal-Bench 4.0 against 30%. My call: use it for code generation and
  fine-tuning, and keep your terminal agent on the model it runs today.'
sources:
- label: Thinking Machines Lab, Inkling 2 Small announcement
  url: https://thinkingmachines.ai/news/inkling-2-small/
  date: 05-11-2026
- label: Thinking Machines Lab, Inkling 2 Small model card
  url: https://thinkingmachines.ai/model-card/inkling-2-small/
  date: 05-11-2026
- label: Artificial Analysis, Inkling 2 Small article
  url: https://artificialanalysis.ai/articles/thinking-machines-releases-inkling-2-small-highest-scoring-open-weights-model-outside-of-chinia-upon-weights-release-it
  date: 05-11-2026
- label: Thinking Machines Lab, Tinker docs, Models and pricing
  url: https://tinker-docs.thinkingmachines.ai/tinker/models/models_and_pricing/
  date: 07-11-2026
contentHash: sha256:f3dd42e7999c36a8
publishState: published
---

## What changed

Thinking Machines Lab's announcement describes Inkling 2 Small as a Mixture-of-Experts model with 594B total parameters and 17B active [s1], and its model card gives November 5, 2026 as the date of release [s2]. The announcement says the model is available through Tinker with closed weights, and that the lab intends to make the full weights available under an Apache 2.0 license next week, after external safety testing and red-teaming [s1]. Artificial Analysis lists that weights release as planned, date unconfirmed [s3]. Tinker's price list carries `thinkingmachines/Inkling-2-Small` at 64K and `thinkingmachines/Inkling-2-Small:peft:262144` at 256K, each at $0.30 prefill, $0.03 cached and $1.00 sample [s4].

## Two coding numbers, one measurer

Artificial Analysis frames the split itself, as different coding strengths from Claude Sonnet 5.5 (medium), and its article gives these figures [s3]:

| Artificial Analysis measure | Inkling 2 Small | Claude Sonnet 5.5 (medium) |
| :--- | ---: | ---: |
| FrontierCode 2.0 | 25% | 11% |
| Terminal-Bench 4.0 | 13% | 30% |
| Output tokens per Intelligence Index task | ~150K | ~31K |
| Cost per Intelligence Index task | $1.18 | $10.02 |

In my reading, the Terminal-Bench row lines up with the Limitations section of the announcement, which says the model does not always choose the best tools for the job, especially in codebases with a large number of skills [s1]. I think the two sources together describe what an agent harness meets first: a model that writes code well and does not always reach for the right tool.

## The objection

The strongest objection is the announcement's Coding and Autoresearch table, with 72.1% on DeepSWE v1.1 and 86.3% on SWEBench Pro v2 (Hard), each the second-highest score in its row [s1]. I agree the model writes code well, and the FrontierCode row of Artificial Analysis points the same way [s3]. In my view a shell-driving agent loop sits closer to Terminal-Bench, and the other columns of the announcement's table are GLM-5.3-Flash, DeepSeek-V4.1-Flash-1017, Muse Spark Open and Kimi K3 [s1]. The bill is the stronger case for it. The cost row of Artificial Analysis still favours it, even with far more output tokens per task [s3].

## Impact on your team

If you route agent work by model, my call: try Inkling 2 Small on Tinker for code generation and as a fine-tuning base, since the model card lists API access for fine-tuning and inference [s2], and keep your terminal agent on the model it runs today. The announcement says checkpoints will be downloadable with the release of the weights [s1], so in my reading a fine-tune you start now stays on Tinker until then. Rerun your own harness when the weights land: the announcement says next week [s1], and Artificial Analysis says date unconfirmed [s3]. I would size jobs to the 64K and 256K rows on Tinker's price list before planning on the 1M window of the model card [s2], since the price list's train column reads $1.50 at 64K and $3.00 at 256K [s4].
