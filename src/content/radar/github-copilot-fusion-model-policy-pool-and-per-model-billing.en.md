---
translationKey: github-copilot-fusion-model-policy-pool-and-per-model-billing
lang: en
slug: github-copilot-fusion-model-policy-pool-and-per-model-billing
title: GitHub Copilot Fusion is generally available and picks the models for each
  prompt from the pool your model policies enable, and Artificial Analysis says token
  costs follow the underlying models
publishDate: 29-10-2026
kind: release
tags:
- GitHub Copilot
- Artificial Analysis
- Claude
- GPT-6
- agents
summary: 'GitHub says GitHub Copilot Fusion is generally available, and Artificial
  Analysis dates the release October 28, 2026. GitHub says that for each prompt Copilot
  Fusion determines which models to use, and that it only uses the models enabled
  in your enterprise and organization model policies. Artificial Analysis says token
  costs are charged based on the underlying models used, and reports $5.59 per task
  for Copilot Fusion at its max setting in GitHub Copilot CLI against $11.42 for Claude
  Code with Opus 5.5 (max). My call: decide which models Copilot Fusion may pick from
  before making it the default, then compare a week of billed usage at Fusion Standard,
  adding back the 30% discount GitHub offers for a limited time.'
sources:
- label: GitHub Changelog, Route and orchestrate models with GitHub Copilot Fusion
  url: https://github.blog/changelog/2026-10-28-route-and-orchestrate-models-with-github-copilot-fusion/
  date: 28-10-2026
- label: Artificial Analysis, GitHub Copilot Fusion orchestrates Anthropic and OpenAI
    models to balance performance and cost
  url: https://artificialanalysis.ai/articles/github-copilot-fusion-orchestrates-anthropic-and-openai-models-to-balance-performance-and-cost
  date: 28-10-2026
contentHash: sha256:6d8f0123e9f92c0f
publishState: published
---

## What changed

GitHub says GitHub Copilot Fusion is generally available [s1]. Artificial Analysis dates the release October 28, 2026 [s2]. You select Copilot Fusion and choose a level of effort (Fusion Standard, Fusion High or Fusion Max), and GitHub says that for each prompt it determines which models to use and how they work together [s1].

## Who picks the model now

I think the change that matters for a team is who picks the model. GitHub says Copilot Fusion only uses the models that are enabled in your enterprise and organization model policies, and that administrators control which models it can use and whether it is the default [s1]. Artificial Analysis says token costs are charged based on the underlying models used to complete a request, and names Claude Opus 5.5, Claude Sonnet 5.5, GPT-6 Astra and GPT-6 Sol among the models Copilot Fusion chooses between [s2].

> [!CONFIRMED]
> GitHub lists a workflow where an efficient model drafts a response and a quality check accepts it or escalates to a stronger model, and another where one model drafts, another model reviews it and the original model revises [s1].

> [!INFERRED]
> My reading: one prompt can run on two models, so what it costs depends on which models your policy leaves in the pool.

## What the cost figure covers

The strongest objection is the measured result. Artificial Analysis benchmarked Copilot Fusion at its max setting in GitHub Copilot CLI and reports $5.59 per task, against $11.42 for Claude Code with Opus 5.5 (max) [s2]. I agree that orchestration can cost less, and that gap is real. It covers one setting in one client, though: neither source gives a cost figure for Fusion Standard or Fusion High, the levels GitHub points at everyday coding and challenging tasks [s1][s2].

## Impact on your team

My call, if you administer Copilot: before you make Copilot Fusion the default, open your model policies and decide which models it may pick from, because that list now bounds what a prompt can cost. Then run Fusion Standard for a week on one team and compare its billed model usage with that team's current model. GitHub gives users on paid Copilot plans a 30% discount on model costs when using Copilot Fusion, for a limited time [s1], so add the discount back before you compare, or the trial week will flatter Copilot Fusion. I would not make it the default on a benchmark of its max setting alone.
