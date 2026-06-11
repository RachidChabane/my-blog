---
# SEED, bootstrap corpus (task 7); replaced by the content pipeline (tasks 23-28). Safe to delete.
translationKey: deterministic-agent-workflows
lang: en
slug: deterministic-coding-agent-workflows
title: 'Orchestrating coding agents with deterministic workflows'
publishDate: '30-05-2026'
tags:
  - agents
  - agentic-coding
difficulty: 2
sources:
  - label: 'Anthropic, Building effective agents'
    url: 'https://www.anthropic.com/research/building-effective-agents'
    date: '12-12-2024'
  - label: 'arXiv, ReAct: Synergizing Reasoning and Acting'
    url: 'https://arxiv.org/abs/2210.03629'
    date: '06-10-2022'
contentHash: 'seed-deterministic-agent-workflows-en'
publishState: published
---

Break an engineering task into verifiable steps, and let the agent fail early rather than late.

A deterministic workflow names each step, its inputs, and a check that must pass
before the next step runs. The agent still does the creative work, but the harness,
not the model, decides whether a step succeeded, so a wrong turn surfaces at the
gate instead of three steps downstream.

The payoff is debuggability: every run leaves an auditable trail of which check
failed and why. Re-runs resume from the last green step rather than restarting,
which keeps long tasks affordable and makes flaky behaviour reproducible.
