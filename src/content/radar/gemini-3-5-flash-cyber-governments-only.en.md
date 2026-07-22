---
translationKey: gemini-3-5-flash-cyber-restricted-access
lang: en
slug: gemini-3-5-flash-cyber-governments-only
title: 'Google''s best V8 bug finder is a model you cannot call: 55 issues, governments
  only'
publishDate: 22-07-2026
kind: release
tags:
- Gemini
- CodeMender
- security
- agents
- evals
summary: 'Gemini 3.5 Flash Cyber found 55 unique confirmed issues on the V8 engine
  against 47 for its own mainline base and 36 for Claude Opus 4.6, then shipped only
  to governments and trusted partners via CodeMender. The gap that matters is 55 versus
  47: the moat is the post-training recipe, not the weights.'
sources:
- label: Google DeepMind - Introducing Gemini 3.5 Flash Cyber
  url: https://deepmind.google/blog/introducing-gemini-3-5-flash-cyber/
  date: 21-07-2026
- label: The Hacker News - Google Launches Gemini 3.5 Flash Cyber AI to Find and Fix
    Software Vulnerabilities
  url: https://thehackernews.com/2026/07/google-launches-gemini-35-flash-cyber.html
  date: 21-07-2026
- label: Gemini API pricing documentation
  url: https://ai.google.dev/gemini-api/docs/pricing
  date: 22-07-2026
contentHash: sha256:e2e60dc638e1d365
publishState: published
---

## What changed

Google DeepMind announced Gemini 3.5 Flash Cyber on 2026-07-21, published its benchmark numbers, then declined to sell it. On the V8 JavaScript engine the fine-tune found 55 unique confirmed issues, against 47 for mainline Gemini 3.5 Flash and 36 for Claude Opus 4.6, including 10 the other two models missed [s1][s2]. Distribution runs through CodeMender, the vulnerability discovery and patching agent Google unveiled in October 2025 [s2], and only for "governments and trusted partners", in "a limited-access pilot program" [s1]. Google's stated reason: "Given the dual-use nature of this technology, we have taken an intentional approach to how we deploy 3.5 Flash Cyber" [s1].

| Model | Unique confirmed issues on V8 |
| :--- | ---: |
| Gemini 3.5 Flash Cyber | 55 [s1][s2] |
| Gemini 3.5 Flash (mainline) | 47 [s1][s2] |
| Claude Opus 4.6 | 36 [s1][s2] |

## What the benchmark actually says

Read that table from the middle row. 55 against 47 is one model against itself: same base, same target, separated by post-training alone. I think that comparison, not the frontier scalp, is the real result, and it undercuts the fence. What earns the extra findings is a training recipe and an evaluation harness, and a recipe is the one asset a lab cannot lock in a datacentre. Gating distribution buys time. It does not buy safety.

The strongest case against me is that the containment here is architectural rather than contractual: because the model runs solely inside CodeMender, guardrails can enable the agent's defensive functions and disable other cyber activity at the agent boundary [s2]. That beats a policy sentence in a system prompt, and I would build it the same way. It protects these weights. It does not protect the capability, which lives in a pipeline a well-funded team can rebuild.

The asymmetry lands on defenders. Wiz and Cloud CISO Security Engineering test from inside the pilot [s1] and work from the 55-issue pass over V8. Everyone else auditing the same public open-source code is working from 47 and 36.

> [!IMPORTANT]
> Checked 2026-07-22: the Gemini API pricing documentation carries no Flash Cyber entry, no public model id and no price, and there is no waitlist a developer can join [s3]. That page is Google's own, so it is a currency check on availability, not independent confirmation of the benchmark; only [s2] corroborates the numbers.

## Impact on your team

Build the harness, not a shortlist of models you hope to get access to. The distance between 55 and 47 is the useful measurement here, because it prices the part you control: what task-specific post-training and a validation loop buy you over a base model, on your code. Start from something callable. The Gemini API pricing page lists mainline `gemini-3.5-flash` and `gemini-3.6-flash` at 1.50 dollars per 1M input tokens [s3], and the mainline row of that table is the 47. Point it at a repository whose bugs you already know, keep only what a reproducer confirms, and count confirmed issues rather than raw output. That count is your baseline, and Google's own numbers say it is movable.
