---
# SEED — bootstrap corpus (task 7); replaced by the content pipeline (tasks 23-28). Safe to delete.
translationKey: serving-oss-llm-production-cost
lang: en
slug: serving-oss-llm-production
title: 'Serving an open-source LLM in production: the real cost'
publishDate: '04-05-2026'
tags:
  - llm-oss
  - retrieval
sources:
  - label: 'vLLM — Documentation'
    url: 'https://docs.vllm.ai/en/latest/'
    date: '01-06-2024'
  - label: 'Hugging Face — Quantization overview'
    url: 'https://huggingface.co/docs/transformers/main/en/quantization/overview'
    date: '15-04-2024'
contentHash: 'seed-serving-oss-llm-production-cost-en'
publishState: published
---

vLLM, continuous batching, KV-cache: where the VRAM really goes.

The model weights are only part of the memory bill. At serving time the key-value
cache grows with every concurrent request and every token of context, and it is
usually the cache — not the parameters — that decides how many users a single GPU can
hold.

Continuous batching keeps the device busy by admitting new requests as old ones
finish, which lifts throughput far above naive per-request serving. Sizing a
deployment means budgeting cache against batch size and context length, then
measuring tokens per second under a realistic mix rather than a single prompt.
