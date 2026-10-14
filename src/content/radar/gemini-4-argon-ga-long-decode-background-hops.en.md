---
translationKey: gemini-4-argon-ga-long-decode-background-hops
lang: en
slug: gemini-4-argon-ga-long-decode-background-hops
title: Gemini 4 Argon is GA, and on the Interactions API a response longer than 64K
  tokens runs as background hops
publishDate: 14-10-2026
kind: release
tags:
- Gemini
- Gemini 4 Argon
- Google
- inference
- API
summary: On October 13, 2026, Google made Gemini 4 Argon generally available on the
  Gemini API. Past 65,536 output tokens, long decode with background execution on
  the Interactions API runs in hops of up to 64K tokens, and the client must join
  every model_output step; without max_output_tokens, the server stops after 64K tokens.
  Client-side continuation is available in the GenerateContent API and coming soon
  to the Interactions API. Explicit caching is not supported, temperature, top_p and
  top_k are ignored, and the rates move from $2 and $10 to $4 and $20 per 1M tokens
  on December 1, 2026. I would budget at the December rates now.
sources:
- label: Gemini API docs, "Release notes"
  url: https://ai.google.dev/gemini-api/docs/changelog
  date: 13-10-2026
- label: Gemini API docs, "What's new in Gemini 4 Argon"
  url: https://ai.google.dev/gemini-api/docs/latest-model
  date: 13-10-2026
- label: Gemini API docs, "Gemini 4 Argon" model page
  url: https://ai.google.dev/gemini-api/docs/models/gemini-4-argon
  date: 13-10-2026
- label: Gemini API docs, "Gemini Developer API pricing"
  url: https://ai.google.dev/gemini-api/docs/pricing
  date: 13-10-2026
- label: ComputingForGeeks, "Gemini 4 Argon Pricing, Benchmarks and API Tested"
  url: https://computingforgeeks.com/gemini-4-argon-released-features-benchmarks/
  date: 13-10-2026
contentHash: sha256:6bbde0844675f103
publishState: published
---

## What changed

On October 13, 2026, Google made Gemini 4 Argon (`gemini-4-argon`) generally available on the Gemini API [s1]. Max output is 65,536 tokens by default on a synchronous call and up to 1,048,576 with long decode [s3]. On the Interactions API, background execution with `max_output_tokens` greater than 65,536 generates that response in hops of up to 64K tokens, and Google's servers run the hops for you [s2].

## Long decode is a job you poll

I think long decode is the part of this release that reaches your code. Google calls background execution the easiest way to run it [s2], and on that path an answer past 64K tokens becomes a background interaction you poll until it completes. Each hop adds a `model_output` step to `interaction.steps`, so you join the text across all `model_output` steps when the interaction completes [s2]. Google's curl example does the join with jq once the status is neither `in_progress` nor `queued` [s2]:

```bash
jq -r '[.steps[]? | select(.type == "model_output") | .content[]? | select(.type == "text") | .text] | join("")'
```

In my reading, a client that reads only the last step keeps only the last hop.

> [!IMPORTANT]
> If you set `background: true` without defining `max_output_tokens`, the server stops after 64K tokens [s2].

## The strongest objection

Long decode is opt-in, so an app whose answers stay short could ignore all of this. I would not, because thinking eats the same limit: Google tells existing apps with a limit lower than 32K to raise `max_output_tokens` to at least 32,768, since Argon can spend more of the limit on thinking [s2]. Output is billed including thinking tokens [s4]. ComputingForGeeks reports that Argon at high spent three tokens thinking for every one it showed [s5]. In my reading, a higher `max_output_tokens` raises the ceiling on the bill as much as on the answer. Paid tier rates, per 1M tokens in USD [s4]:

| Paid tier | Through November 30, 2026 | From December 1, 2026 |
| :--- | ---: | ---: |
| Input | $2.00 | $4.00 |
| Output (including thinking tokens) | $10.00 | $20.00 |

## Impact on your team

My call: put long decode behind one helper that always sets `max_output_tokens` and joins every `model_output` step. Client-side continuation, already in the GenerateContent API and coming soon to the Interactions API [s2], can slot in there later. In the same change, remove the calls that create or reference `cached_content`, because explicit caching is not supported on Argon, and drop `temperature`, `top_p` and `top_k`, which are ignored [s2]. Test each workload at the low, medium and high thinking levels [s3], and budget at $4 input and $20 output per 1M tokens, the rates that start on December 1, 2026 [s4].
