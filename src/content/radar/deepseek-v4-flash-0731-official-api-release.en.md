---
translationKey: deepseek-v4-flash-0731-official-api
lang: en
slug: deepseek-v4-flash-0731-official-api-release
title: DeepSeek ships V4-Flash 0731 as its official API release, and the benchmark
  harness is not out yet
publishDate: 04-08-2026
kind: release
tags:
- DeepSeek
- OpenCode
- agents
- open-weight
summary: 'DeepSeek moved V4-Flash out of preview on July 31, 2026 with the 0731 build:
  same architecture, new post-training. The headline agent scores were measured on
  a DeepSeek harness that has not shipped, so the number you would route traffic on
  is the one you cannot reproduce.'
sources:
- label: DeepSeek API change log
  url: https://api-docs.deepseek.com/updates/
  date: 31-07-2026
- label: Developers Digest hands-on writeup
  url: https://www.developersdigest.tech/blog/deepseek-v4-flash-0731-opencode-guide
  date: 31-07-2026
contentHash: sha256:8344d5697d07d477
publishState: published
---

## What changed

DeepSeek moved V4-Flash out of preview on July 31, 2026 with the 0731 build, an official API release its own change log calls a public beta [s1]. The build keeps the same architecture and size as V4-Flash-Preview and was only re-post-trained [s1]. It now supports the Responses API format natively and is adapted for Codex, while V4-Pro and the app and web models stay untouched [s1].

## The scores ride on a harness you cannot download

DeepSeek reports Terminal Bench 2.1 at 82.7, NL2Repo at 54.2, Cybergym at 76.7, DeepSWE at 54.4 and Toolathlon verified at 70.3 [s1]. Those code-agent scores were measured with DeepSeek Harness minimal mode, which the same note says is still to be released, at the max effort level with topp=0.95 and temperature=1.0 [s1]. Until that harness ships, those scores are a claim I have to take on trust. The baseline is picked too: the comparison is V4-Pro-Preview [s1], the preview of the larger sibling [s2], not the Flash preview this build replaces.

> [!IMPORTANT]
> The new post-training arrives as an upgrade to the existing V4-Flash API, not as a separate model [s1]. If your eval baseline was measured on V4-Flash-Preview, it now describes weights you no longer call, and nothing in your code changed to warn you.

## What I would run

The stack has not moved since April 24, 2026: a 284B MoE with 13B active per token, a 1M-token context window, MIT-licensed weights [s2]. Those weights are why this one earns an hour where a hosted-only launch would not, since you can pin them the day the hosted build shifts again. In OpenCode it lands as `opencode-go/deepseek-v4-flash` with two reasoning variants, `high` and `max`, selected with `--variant` [s2]. Developers Digest, running it as its default, puts `max` on multi-step agent loops and `high` on single-file edits and review passes [s2].

## Impact on your team

If an agent of yours runs on V4-Flash, re-run your eval suite this week: the weights changed behind an API upgrade [s1], and the vendor scores came off a harness nobody outside DeepSeek has [s1]. Start multi-step work on `--variant max` [s2], and keep `high` for review passes where latency is the real cost [s2]. What I would not do this week is rewrite a Codex integration onto the native Responses API path [s1]: it is a public beta [s1], and the harness that would let you verify the upgrade has no ship date [s1].
