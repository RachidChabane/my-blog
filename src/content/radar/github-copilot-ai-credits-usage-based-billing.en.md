---
translationKey: github-copilot-ai-credits-usage-billing
lang: en
slug: github-copilot-ai-credits-usage-based-billing
title: GitHub Copilot moves to usage-based AI Credits
publishDate: 22-06-2026
kind: spec-change
tags:
- agents
- security
- oss
summary: On June 1, 2026, GitHub replaced Copilot premium-request units with token-metered
  AI Credits priced at 1 credit = $0.01, billing every model feature except code completions
  and Next Edit Suggestions.
sources:
- label: GitHub Changelog - Updates to GitHub Copilot billing and plans
  url: https://github.blog/changelog/2026-06-01-updates-to-github-copilot-billing-and-plans/
  date: 01-06-2026
- label: GitHub Docs - Models and pricing for GitHub Copilot
  url: https://docs.github.com/en/copilot/reference/copilot-billing/models-and-pricing
  date: 01-06-2026
- label: GitHub Docs - Usage-based billing for organizations and enterprises
  url: https://docs.github.com/en/copilot/concepts/billing/usage-based-billing-for-organizations-and-enterprises
  date: 01-06-2026
- label: Visual Studio Magazine - Devs Sound Off on Usage-Based Copilot Pricing Change
  url: https://visualstudiomagazine.com/articles/2026/04/27/devs-sound-off-on-usage-based-copilot-pricing-change-you-will-get-less-but-pay-the-same-price.aspx
  date: 27-04-2026
contentHash: sha256:2cf4c4b9f48761d8
publishState: published
---

## What changed

On June 1, 2026, GitHub moved every Copilot plan to usage-based billing. The previous "premium request" units (PRUs) were retired and replaced by GitHub AI Credits, metered by token consumption. Each plan now ships with a monthly credit allotment; consumption is priced per model from published per-1M-token API rates, then converted at a fixed rate of 1 AI credit = $0.01 USD. The change was first pre-announced on April 27, 2026, and took effect via the GitHub Changelog dated June 1, 2026.

## The schema

```text
# Models and pricing reference (USD per 1,000,000 tokens)
# Conversion: 1 AI credit = $0.01 USD

Model     | Release status | Category    | Tier         | Threshold (input tokens) | Input  | Cached input | Output
----------|----------------|-------------|--------------|--------------------------|--------|--------------|--------
GPT-5 mini| GA             | Lightweight | Default      | Not applicable           | $0.25  | $0.025       | $2.00
GPT-5.4   | GA             | Versatile   | Default      | <= 272K                  | $2.50  | $0.25        | $15.00
GPT-5.5   | GA             | Powerful    | Long context | > 272K                   | $10.00 | $1.00        | $45.00

# Per-request cost mechanism (no single closed form is printed; this is the stated mechanism):
# USD = ((input x InputRate) + (cached x CachedInputRate) + (output x OutputRate)) / 1_000_000
# credits = USD / 0.01
# Note: Anthropic models add a cache-write dimension (e.g. $6.25 / 1M for the Claude Opus class).
```

## In practice

```python
# AI-credit cost for one Copilot Chat turn on GPT-5.4 (Default tier, <= 272K input)
INPUT_RATE, CACHED_RATE, OUTPUT_RATE = 2.50, 0.25, 15.00  # USD per 1M tokens
CREDIT_USD = 0.01

input_tokens, cached_tokens, output_tokens = 12_000, 8_000, 1_500

usd = (input_tokens * INPUT_RATE
       + cached_tokens * CACHED_RATE
       + output_tokens * OUTPUT_RATE) / 1_000_000
credits = usd / CREDIT_USD

print(f"${usd:.4f} -> {credits:.2f} credits")
# $0.0545 -> 5.45 credits

# Copilot Business seat: 1,900 included credits/month (3,000 in the Jun 1 - Sep 1 promo).
# Pooled at the billing entity: 100 Business seats => 190,000-credit shared pool.
# Code completions and Next Edit Suggestions stay unlimited and bill 0 credits.
```

## Impact on your team

If your org runs Copilot Business or Enterprise, the cost driver is no longer a per-seat request count but token volume across Chat, Copilot CLI, the cloud/coding agent, Spaces, Spark, and third-party agents. Code completions and Next Edit Suggestions still cost nothing, so completion-heavy users barely move the meter while agent-heavy users can burn the included allotment quickly.

> [!IMPORTANT]
> Included credits are pooled at the billing entity level: 100 Business seats share a 190,000-credit pool. Adding licenses mid-cycle grows the pool immediately; removing them takes effect only next cycle.

Action items: set user-level budgets (now GA for orgs and enterprises) and the enterprise/cost-center spending-limit hierarchy before agent usage scales. Watch a second meter for Copilot code review, which consumes Actions minutes on top of AI credits. The June 1 to September 1 promotional bonus (Business 3,000 credits, Enterprise 7,000) masks steady-state consumption, so size budgets against the lower included allotments, not the promo.
