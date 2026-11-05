---
translationKey: ripple-65b-terminal-bench-lead-and-in-house-terminus-2-rerun
lang: en
slug: ripple-65b-terminal-bench-lead-and-in-house-terminus-2-rerun
title: Ripple-65B Preview's Terminal-Bench 2.1 lead over Reflection Beam is self-reported;
  in Ricursive's own Terminus 2 run of its rivals, Beam sits at 70.8
publishDate: 05-11-2026
kind: release
tags:
- Ripple-65B
- Ricursive
- Terminal-Bench
- open-weight
- evals
summary: 'Ricursive Intelligence released Ripple-65B Preview, a 65B parameter dense
  Transformer model under apache-2.0 per its Hugging Face card, and its launch post
  claims U.S. open-weight state-of-the-art (80.52) on TerminalBench 2.1 over Reflection
  Beam 501B (80.1). In Ricursive''s card, the Terminus 2 row puts Beam at 70.8 from
  Ricursive''s own in-house eval flow while Ripple keeps 80.5, and Beam leads SWE-bench
  Verified at 81.6 against 76.5. Orca''s review finds the release entirely vendor-reported
  as of 5 November. My call: rerun your own suite under one harness for both models,
  and read the context_length your provider serves.'
sources:
- label: 'Ricursive Intelligence, launch post: Introducing Ripple-65B Preview, a Frontier
    Open-Weight Model Achieving U.S. Open-Weight SOTA on Agentic Coding'
  url: https://www.ricursive.com/ripple
  date: 04-11-2026
- label: Ricursive Intelligence, Hugging Face model card ricursiveAI/Ripple-65B-Preview
  url: https://huggingface.co/ricursiveAI/Ripple-65B-Preview/raw/e27e171792f303d74c048184e8259ba663cfa0d5/README.md
  date: 04-11-2026
- label: 'Orca (Elias Hawthorne), Ripple-65B Preview: Apache 2.0 Weights, a 1M-Token
    Claim and a 16K API'
  url: https://www.orcarouter.ai/blog/ripple-65b-preview-launch-review
  date: 04-11-2026
- label: OpenRouter, endpoint listing API for ricursiveai/ripple-65b-preview-20261104
  url: https://openrouter.ai/api/v1/models/ricursiveai/ripple-65b-preview-20261104/endpoints
  date: 04-11-2026
contentHash: sha256:49144fee28aaac29
publishState: published
---

## What changed

Ricursive Intelligence has released Ripple-65B Preview, which its Hugging Face card describes as a 65B parameter dense Transformer model with support for up to 1M context length, under `license: apache-2.0` [s2]. Ricursive's launch post claims U.S. open-weight state-of-the-art (80.52) on TerminalBench 2.1, ahead of Reflection Beam 501B (80.1) [s1]. Orca's review of the launch, published November 4, 2026, finds the release entirely vendor-reported as of 5 November [s3].

## Two rows, two producers

Ricursive's card prints Terminal-Bench 2.1 twice, and says it shows official model card scores where available and its own in-house eval flow, in italics, for missing evals [s2]:

| Card row | Ripple | Beam | Beam's cell, per the card |
| :--- | ---: | ---: | :--- |
| Terminal-Bench 2.1 (self-reported) [s2] | 80.5 | 80.1 | official model card |
| Terminal-Bench 2.1 (Terminus 2) [s2] | 80.5 | 70.8 | Ricursive in-house |
| SWE-bench Verified [s2] | 76.5 | 81.6 | official model card |

I think the cell that matters is the producer of Beam's second number: the card's 70.8 is Ricursive's own run of a rival [s2]. In my reading the card also gives the reason, since it found Terminal-Bench 2.1 scores universally lower (with the exception of Muse Spark Open) under the official Terminus 2 harness at 128K sequence length with summarization [s2]. Orca's review adds that Ricursive reports scores moved almost everywhere except its own [s3].

## The objection

The strongest objection: Ricursive did not have to print the Terminus 2 row, and Orca, which describes a lab grading its own homework, grants that the gradient runs the right way [s3]. I agree that printing both rows is a real disclosure. In my view the same card bounds the headline anyway: Beam leads SWE-bench Verified at 81.6 against Ripple's 76.5 [s2], and Orca's review says Artificial Analysis has no entry for the model [s3].

## Impact on your team

If a terminal agent of yours runs on Reflection Beam 501B and a 65B dense model tempts you, my call: rerun your own task suite under one harness for both before you swap, since the card's Terminal-Bench 2.1 lead depends on which row you read [s2]. Read the context your provider serves too: Orca's review says the first commercial endpoint carrying the same checkpoint advertises 16,384 [s3], while OpenRouter's endpoint listing shows `GMICloud` at `"context_length":1048576` [s4]. The failure I would watch for: the card's Terminus 2 runs use 128K sequence length with summarization [s2], so in my view an agent on the 16,384 endpoint Orca saw [s3] runs neither row's setup.
