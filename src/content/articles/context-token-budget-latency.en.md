---
# SEED, bootstrap corpus (task 7); replaced by the content pipeline (tasks 23-28). Safe to delete.
translationKey: context-token-budget-latency
lang: en
slug: context-token-budget-latency
title: 'Context isn’t free: token budget and latency'
publishDate: '15-05-2026'
tags:
  - agents
  - evaluation
sources:
  - label: 'Anthropic, Building effective agents'
    url: 'https://www.anthropic.com/research/building-effective-agents'
    date: '12-12-2024'
  - label: 'arXiv, ReAct: Synergizing Reasoning and Acting'
    url: 'https://arxiv.org/abs/2210.03629'
    date: '06-10-2022'
contentHash: 'seed-context-token-budget-latency-en'
publishState: published
---

Every context token is a trade-off between recall, cost and delay.

It is tempting to stuff the whole repository into the prompt, but every extra token
raises latency and bill while diluting attention. A larger window improves recall
only up to the point where the relevant passage is still easy to find among the
noise.

A token budget forces the useful question: what does the model actually need to
answer this turn? Retrieve the few passages that matter, summarize the rest, and
spend the saved tokens on the output, usually a better trade than a longer, slower,
costlier prompt.
