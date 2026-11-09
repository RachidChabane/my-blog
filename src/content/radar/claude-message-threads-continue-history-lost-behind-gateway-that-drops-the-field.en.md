---
translationKey: claude-message-threads-continue-history-lost-behind-gateway-that-drops-the-field
lang: en
slug: claude-message-threads-continue-history-lost-behind-gateway-that-drops-the-field
title: Claude message threads send only the new messages, and on a plain turn a gateway
  that drops the thread field answers 200 with the history gone
publishDate: 09-11-2026
kind: release
tags:
- Claude
- Claude Code
- LiteLLM
- Vercel AI Gateway
- agents
summary: 'Anthropic''s blog puts message threads in public beta on November 2, 2026:
  after the first request, each turn sends only the new messages. A vercel/ai report
  and two LiteLLM pull requests describe intermediaries that drop the thread field:
  a plain user turn comes back with the history gone, with a 200 on LiteLLM, and a
  turn holding only a tool_result fails with a 400. My call: behind any proxy, run
  a two-turn probe through the real path before you turn threads on.'
sources:
- label: Anthropic, Make long-running agents faster with message threads
  url: https://claude.com/blog/message-threads
  date: 02-11-2026
- label: Anthropic docs, Message threads
  url: https://platform.claude.com/docs/en/build-with-claude/message-threads.md
  date: 02-11-2026
- label: vercel/ai issue 24425, AI Gateway report
  url: https://github.com/vercel/ai/issues/24425
  date: 03-11-2026
- label: LiteLLM pull request 49755
  url: https://github.com/BerriAI/litellm/pull/49755
  date: 03-11-2026
- label: LiteLLM pull request 49048
  url: https://github.com/BerriAI/litellm/pull/49048
  date: 29-10-2026
- label: Pi pull request 11545, earendil-works/pi
  url: https://github.com/earendil-works/pi/pull/11545
  date: 28-10-2026
contentHash: sha256:6e5c7e4316c0779e
publishState: published
---

## What changed

Anthropic's blog, dated November 2, 2026, puts message threads in public beta on the Claude Platform [s1]. Per the docs, the first request carries the full conversation and `"thread": {"type": "create"}`; each later `continue` request sends only the messages since the previous response and that response's id, with the `message-threads-2026-08-12` beta header [s2]. Anthropic's blog reports that with message threads on by default for most Claude Code users, requests with 500k to 1M tokens see median TTFT drop by about 35% [s1].

## The turn that still answers 200

I think this release matters most for whatever sits between you and Anthropic. In my reading, a full request carries its own history, so a proxy that strips an unknown field loses only that field; on a `continue` request the same strip loses the conversation. The vercel/ai report [s3] and LiteLLM pull requests 49755 [s4] and 49048 [s5] record it on two products:

| Request | Vercel AI Gateway, issue 24425 | LiteLLM `/v1/messages`, pull requests 49755 and 49048 |
| :--- | :--- | :--- |
| Create, id returned | `aitxt-` on the AI SDK route, `gen_` on the Messages route [s3] | `msg_01...` [s4] |
| Continue, plain user turn | Ran as a fresh conversation, 17 input tokens, `warnings` empty, on the AI SDK route [s3] | 200, "I don't have access to information about your name" [s4] |
| Continue, only a `tool_result` | 400 on the Messages route [s3] | 400 [s5] |
| Continue, made-up or stale id | 200 on the Messages route, as a new conversation [s3] | 200 chat reply, where the SDK waits for a 404 `thread_not_found` [s4] |

In my reading, the 400 is the useful failure, and in these reports it appears on tool turns. The docs' recovery, which the SDK thread helper also runs, starts from a 404 with `thread_not_found` [s2]. I think a success response starts nothing. Forwarding the field is not enough: LiteLLM pull request 49755 also has to stop `error.details.error_code` being flattened into a string, which broke SDK replay [s4].

## The objection

The strongest objection: these are two young defects in two products, and a patch closes each one. I agree for those two. In my view the exposure outlasts them: Pi pull request 11545 defaults threads on only for the anthropic provider on api.anthropic.com, because gateways that drop unknown fields would lose the conversation [s6], and a collaborator on the vercel/ai issue wrote "we will not be able to support it through gateway today, due to zero-retention policy and user insulation", adding that it would only work with BYOK [s3].

## Impact on your team

If your application reaches the Claude API through any proxy, my call: before you turn threads on, run the vercel/ai report's two-turn probe through the real path, stating a fact on the create turn and asking for it on the continue turn [s3]. I would not trust the create id: LiteLLM pull request 49755 shows `msg_01...` on a path that still lost the turn [s4]. I would alert on a continue whose token count, summed over cached and uncached input, is sized to the newest message, since Anthropic's blog says token usage stays the same [s1]. For Claude Code behind LiteLLM, pull request 49048 reports the earlier conversation lost mid-session in its reproduction [s5], so one clean session proves little. I would keep threads off under zero data retention: the docs say message threads are not ZDR eligible [s2].
