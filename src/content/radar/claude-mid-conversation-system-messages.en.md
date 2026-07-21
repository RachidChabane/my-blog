---
translationKey: claude-mid-conversation-system-messages
lang: en
slug: claude-mid-conversation-system-messages
title: Claude's system role lands on three models, and two vendor docs disagree on
  which
publishDate: 21-07-2026
kind: spec-change
tags:
- Claude
- Anthropic API
- prompt-caching
- agents
summary: 'The 2026-07-15 release-note entry documents mid-conversation system messages
  on Claude Fable 5, Claude Mythos 5 and Claude Opus 4.8 with no beta header, while
  the Bedrock page, fetched 2026-07-21, still says Opus 4.8 only: gate the feature
  on a capability flag, not on a hardcoded model list.'
sources:
- label: Anthropic - Claude Platform release notes, July 15 2026 entry
  url: https://platform.claude.com/docs/en/release-notes/api
  date: 15-07-2026
- label: Anthropic - Mid-conversation system messages docs page
  url: https://platform.claude.com/docs/en/build-with-claude/mid-conversation-system-messages
  date: 21-07-2026
- label: AWS - Amazon Bedrock user guide, Mid-conversation system messages
  url: https://docs.aws.amazon.com/bedrock/latest/userguide/claude-messages-mid-conversation-system.html
  date: 21-07-2026
- label: 'simonw/llm-anthropic issue #73'
  url: https://github.com/simonw/llm-anthropic/issues/73
  date: 28-05-2026
contentHash: sha256:80705ef8f09feeac
publishState: published
---

## What changed

The diff is one line and it moves the whole loop: when instructions change mid-session, you append a `{"role": "system"}` message to `messages` instead of editing the top-level `system` field, so the cached prefix stays byte for byte identical and the next request still reads it from cache [s2][s3]. Anthropic's 2026-07-15 release-note entry documents it on Claude Fable 5, Claude Mythos 5 and Claude Opus 4.8, across the Claude API, Bedrock and Google Cloud, with no beta header, and adds that it "corrects earlier availability notes" [s1]. What shipped on 2026-05-28 was Opus 4.8 alone [s1][s4]; nothing captured dates the expansion.

I would adopt it for the cache win, then gate it on a capability flag I can flip rather than a hardcoded model list. Today the supported list depends on which vendor page you read.

## Two docs, two matrices

| Dimension | Anthropic docs, fetched 2026-07-21 [s2] | Bedrock docs, fetched 2026-07-21 [s3] |
| :--- | :--- | :--- |
| Supported models | Fable 5, Mythos 5, Opus 4.8; explicitly not Sonnet 5 | Claude Opus 4.8 only |
| Consecutive system messages | Accepted, treated as a single system section | Not allowed |
| Unsupported model | Not stated | `400 invalid_request_error` |

Two live vendor pages, same day, contradicting each other on the two things a migration depends on. I am not picking a winner, and neither should your code: an allowlist copied from either page is a guess a doc edit can void without notice.

## Placement

The position that earns its keep is the one right after the tool results, in an agentic loop [s2]:

```json
"messages": [
  {"role": "user", "content": [
    {"type": "tool_result", "tool_use_id": "toolu_01A", "content": "3 files changed"}
  ]},
  {"role": "system", "content": "The user sent the following message while you were working: also update the changelog before you finish."}
]
```

Any other position, including between an `assistant` `tool_use` block and the `tool_result` that answers it, returns a 400; Bedrock names it `400 invalid_request_error` [s2][s3].

> [!IMPORTANT]
> Never route raw tool output, retrieved documents or web content through a system message: Anthropic's page says that gives it operator-level authority [s2]. The relay above stays safe because it carries what the user typed, not what a tool returned. And the cache payoff is opt-in: with no `cache_control`, nothing is cached and every turn pays full input price [s2].

## Impact on your team

One concrete decision. If your loop cost-routes from Opus 4.8 down to Sonnet 5, a single mid-session system message turns that fallback into a rejected request: Anthropic excludes Sonnet 5 and sends you back to the top-level `system` field [s2]. Keep that path alive on the Sonnet 5 branch, or drop the fallback for sessions that inject constraints. And on Bedrock, do not read Anthropic's matrix as permission: that page still says Opus 4.8 only and still forbids consecutive system messages [s3]. Probe one request per model on your own account and let the API, not the docs, settle it.
