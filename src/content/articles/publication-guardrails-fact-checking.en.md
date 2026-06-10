---
# SEED, bootstrap corpus (task 7); replaced by the content pipeline (tasks 23-28). Safe to delete.
translationKey: publication-guardrails-factcheck
lang: en
slug: publication-guardrails-fact-checking
title: 'Publication guardrails: an automated fact-checking pipeline'
publishDate: '23-05-2026'
tags:
  - evaluation
  - qualite
sources:
  - label: 'Anthropic, Building effective agents'
    url: 'https://www.anthropic.com/research/building-effective-agents'
    date: '12-12-2024'
  - label: 'arXiv, ReAct: Synergizing Reasoning and Acting'
    url: 'https://arxiv.org/abs/2210.03629'
    date: '06-10-2022'
contentHash: 'seed-publication-guardrails-factcheck-en'
publishState: published
---

Before publishing, the agent must prove its claims, sources attached.

A publication guardrail treats every factual sentence as a claim that needs a
citation. The pipeline extracts claims, retrieves candidate sources, and refuses to
publish until each claim maps to a passage that actually supports it, not merely a
page that mentions the topic.

Tying the gate to evidence rather than tone is what makes it trustworthy. A draft
that reads well but cites nothing is held back, and the failure report points at the
exact unsupported sentence, so the fix is targeted instead of a full rewrite.
