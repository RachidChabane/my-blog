---
translationKey: claude-tag-slack-ai-teammate
lang: en
slug: claude-tag-slack-ai-teammate
title: 'Claude Tag: Anthropic''s always-on AI teammate in your Slack channels'
publishDate: 26-06-2026
kind: tool
tags:
- Claude
- Anthropic
- Slack
- agents
summary: On 23-06-2026 Anthropic launched Claude Tag, an always-on Claude that joins
  a Slack workspace as one shared team identity everyone sees, not a per-user chatbot.
sources:
- label: Anthropic news - Introducing Claude Tag
  url: https://www.anthropic.com/news/introducing-claude-tag
  date: 23-06-2026
- label: TechCrunch
  url: https://techcrunch.com/2026/06/23/anthropics-claude-tag-is-learning-your-company-one-slack-message-at-a-time/
  date: 23-06-2026
- label: SiliconANGLE
  url: https://siliconangle.com/2026/06/23/anthropic-debuts-claude-tag-capable-ai-teammate-lives-within-slack/
  date: 23-06-2026
contentHash: sha256:65c58320fabe3ce6
publishState: published
---

## What changed

On 23-06-2026 Anthropic launched Claude Tag, a beta, always-on Claude that lives inside Slack. You tag `@Claude` in a channel (a DM works too) to hand it a task; it breaks the task into stages and works through them with whatever tools an admin has granted, remembers context from the channels it sits in, and can plan tasks to run later [s1]. Within a channel there is one shared Claude identity that everyone sees, so anyone can pick up where the last person left off [s2]. It runs on Opus 4.8 and is limited to Claude Enterprise and Claude Team customers [s1].

## The shift, and the catch

An AI in Slack is not the new part; teams have had bots and per-user assistants for years. The change is where the agent sits: not in your private thread but as one channel-level identity with its own persistent memory across the channels it joins, and access scoped by an admin rather than by you [s1]. That is an architectural decision a platform team owns, not a toggle an individual flips.

The catch lives in ambient mode. With it on, Claude proactively jumps into the chat of its own accord to post updates, flag things from across the org, and chase forgotten threads [s2][s3]. Useful, but an unprompted agent carrying cross-channel memory is at once a signal-to-noise problem and a data-surface one: what can the shared identity read, and who authorized it. That is exactly why the governance controls ship alongside the product, not as an afterthought.

> [!IMPORTANT]
> The governance surface is the thing to configure first. Before ambient mode goes on, scope which channels `@Claude` joins, set the token-spend limits, and lean on the log of everything `@Claude` has done [s1]. The agent identity access model is what you provision against; treat it as the gate, not the paperwork.

## Impact on your team

This lands as a platform or IT rollout, not an individual adoption. It is beta, on Opus 4.8, Enterprise and Team only, so the decision sits with whoever owns the workspace, not with the engineer who wants to try it [s1][s2]. The concrete move: pilot `@Claude` in a couple of channels with ambient mode off and token-spend limits set, read the audit log for a week, and only then decide whether the shared identity goes org-wide. The capability is real; the order of operations is where teams will get it wrong.
