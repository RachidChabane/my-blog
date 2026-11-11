---
translationKey: fireworks-notifies-impacted-customers-notion-insights-transcripts-zdr-scope
lang: en
slug: fireworks-notifies-impacted-customers-notion-insights-transcripts-zdr-scope
title: Fireworks is notifying customers whose data was impacted, and Notion says the
  dataset Fireworks gave it held Notion AI chat transcripts used for Insights
publishDate: 11-11-2026
kind: security
tags:
- Fireworks AI
- Notion
- security
- inference
summary: 'Fireworks AI''s November 9, 2026 update says it is notifying customers whose
  data was impacted and reports impact to secrets, datasets and incomplete models
  for a limited set of accounts, while it has not detected any impact to the products
  it names as zero data retention by default. Notion says the dataset Fireworks gave
  it on November 8 included Notion AI chat transcripts used for its Insights feature,
  for which Notion ran classification jobs on Fireworks. My call: list every path
  where your data sits at rest with an inference provider, and ask whether its ZDR
  terms name that product.'
sources:
- label: Fireworks AI, Update on October 2026 security incident, last updated November
    9, 2026
  url: https://fireworks.ai/security/bulletins/october-2026-security-incident-update
  date: 09-11-2026
- label: Notion, Fireworks AI incident security advisory, updated November 11, 2026
  url: https://www.notion.com/security/advisories/security-incident-involving-a-third-party-ai-vendor
  date: 11-11-2026
contentHash: sha256:6e48cf433426030b
publishState: published
---

## What changed

Fireworks AI updated its October 2026 security incident bulletin on November 9, 2026: Fireworks says it is notifying customers whose data was impacted, and reports impact to secrets, datasets and incomplete models for a limited set of accounts [s1]. Notion's advisory, updated November 11, 2026, says the dataset Fireworks gave it on November 8 included Notion AI chat transcripts used for its Insights feature [s2].

## Where zero retention stops

I think this incident reads best as a map of what a provider keeps at rest. Fireworks names Inference, Training SDK and Nexus as zero data retention (ZDR) by default, and has not detected any impact to them [s1]. The same Fireworks bulletin also reports impact to account and billing information [s1]. Fireworks adds that the Training SDK remains available with ZDR, meaning no training data stored at rest [s1]. In my reading, that clause draws the line: everything on the impact list is something stored, and the ZDR list names paths that keep nothing by default.

## The objection

The strongest objection: ZDR by default covers the products a team calls in production, and a stored dataset is one the customer chose to upload. I agree for a team that uploads its own training data. Notion is the case that answer misses: Notion used Fireworks for classification jobs behind Insights, a feature that helps customers understand their own AI usage, and the dataset Fireworks gave it held Notion AI chat transcripts used for Insights [s2]. Neither page says which Fireworks product held those transcripts, and I would not guess. In my reading, the people whose chats sat in that dataset made no choice about where Notion processed them.

## Impact on your team

If your data reaches an inference provider through anything other than a live request, my call is to list those paths now: batch jobs, uploaded datasets, fine-tuning inputs, stored secrets, and side features that send user text to a vendor. For each one, ask the provider in writing whether its ZDR terms name that product. If you run Batch Inference or dataset-based training on Fireworks, Fireworks has disabled the self-serve dataset uploads and downloads they use while it investigates [s1]. For Notion AI, Notion advises affected customers to rotate passwords, API keys or other credentials pasted into Notion AI during the timeframe of the incident [s2]. Notion disconnected its systems from Fireworks by the morning of November 3, out of an abundance of caution [s2]. I would copy that reflex and widen the scope later, since Fireworks and Notion both say their investigation is ongoing [s1] [s2].
