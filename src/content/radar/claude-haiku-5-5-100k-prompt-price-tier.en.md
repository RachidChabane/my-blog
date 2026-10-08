---
translationKey: claude-haiku-5-5-prompt-length-price-tier-at-100k
lang: en
slug: claude-haiku-5-5-100k-prompt-price-tier
title: Claude Haiku 5.5 prices prompts over 100k tokens 5x higher, and Artificial
  Analysis says its provisional cost figures do not include the step up cost
publishDate: 08-10-2026
kind: release
tags:
- Claude
- Claude Haiku 5.5
- Anthropic
- pricing
summary: 'Anthropic released claude-haiku-5-5 with tiered pricing: $0.10 input and
  $0.50 output per million tokens for prompts up to 100k tokens, $0.50 and $2.50 above.
  Artificial Analysis says its provisional cost figures for Haiku 5.5 do not include
  the step up cost, and Simon Willison measured around 1.25x as many tokens on the
  same long prompt as with Haiku 4.5. I would put a token count in front of every
  compaction call, and compact or split any prompt that would cross 100k.'
sources:
- label: Anthropic, "Introducing Claude Haiku 5.5"
  url: https://www.anthropic.com/claude-haiku-5-5
  date: 07-10-2026
- label: Artificial Analysis, "Anthropic has released Claude Haiku 5.5"
  url: https://artificialanalysis.ai/articles/claude-haiku-5-5
  date: 07-10-2026
- label: Simon Willison, "Claude Haiku 5.5"
  url: https://simonwillison.net/2026/Oct/7/claude-haiku-5-5/
  date: 07-10-2026
contentHash: sha256:33e34d02208af41b
publishState: published
---

## What changed

On October 7, 2026, Anthropic released Claude Haiku 5.5, available now on all platforms; on the Claude Platform its id is `claude-haiku-5-5` [s1]. Its price per million tokens depends on prompt length: input costs $0.10 and output $0.50 for prompts up to 100k tokens, against $0.50 and $2.50 over 100k [s1]. Artificial Analysis and Simon Willison both report the same 5x step above 100k [s2][s3].

## The line to design around

I think the number to design around is the 100k line, more than the headline cut. Anthropic pitches Haiku 5.5 for summaries, compactions and work as a subagent on coding work [s1]. Those are the calls whose prompts grow with the session.

Anthropic's own table, per million tokens [s1]:

| Rate | Haiku 5.5, up to 100k | Haiku 5.5, over 100k | Haiku 4.5 |
| :--- | ---: | ---: | ---: |
| Input | $0.10 | $0.50 | $1.00 |
| Output | $0.50 | $2.50 | $5.00 |
| Cache reads | $0.01 | $0.05 | $0.10 |
| Cache writes | $0.125 | $0.625 | $1.25 |

The tokenizer moves prompts toward that line with the template unchanged. Anthropic says the updated tokenizer uses slightly more tokens per task [s1], and Simon Willison measured around 1.25x as many tokens on the same long prompt with Haiku 5.5 compared to Haiku 4.5 [s3]. So I treat any prompt budget sized on Haiku 4.5 counts as stale. The step shows up on the invoice. No test fails.

> [!IMPORTANT]
> Artificial Analysis says its site does not yet reflect tiered pricing, so its provisional cost figures for Haiku 5.5 do not include the step up cost [s2]. Until its Cost per Task coverage ships, price any workload with prompts over 100k from your own token counts.

The fair objection: Anthropic says 90% of requests to Haiku 4.5 fell under 100,000 tokens [s1], so the step touches a tail. I think that figure answers a different question. It describes Haiku 4.5's request mix, and a compaction call sits in the tail by design, since it runs when the context is at its longest.

## Impact on your team

If you run Haiku 5.5 as a compaction or subagent model, the decision this week is where you cut. My call: put a token count in front of every `claude-haiku-5-5` call [s1], measured with the new model's tokenizer, and compact or split anything that would cross 100k.

The failure mode I would watch for is a cost forecast built on Anthropic's average of around 75% less to run [s1], applied to an agent whose compaction prompts sit over the line. For requests over 100,000 tokens, Anthropic's own figure is 50% lower than Haiku 4.5 [s1].
