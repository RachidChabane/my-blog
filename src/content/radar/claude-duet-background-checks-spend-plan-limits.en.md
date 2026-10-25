---
translationKey: claude-duet-background-checks-spend-plan-limits
lang: en
slug: claude-duet-background-checks-spend-plan-limits
title: Claude Duet checks your connected accounts every few hours, and its background
  checks count toward your Pro or Max plan limits
publishDate: 25-10-2026
kind: release
tags:
- Claude
- Claude Duet
- agents
summary: 'Anthropic opened a research preview of Claude Duet on October 21, 2026,
  by waitlist for Pro and Max users in the US. Anthropic says Duet checks connected
  accounts every few hours, because checking nonstop would use up plan limits much
  faster, and that its background checks count toward those limits; MacRumors reports
  the same cadence and limits. My call: the interval is a budget line on your plan,
  so keep Duet off any queue where a reply is due within the hour.'
sources:
- label: Anthropic, Introducing Claude Duet
  url: https://claude.com/resources/articles/claude-duet
  date: 21-10-2026
- label: Anthropic, Claude Duet Safety, Privacy, and Security
  url: https://claude.com/resources/articles/claude-duet-safety-privacy-and-security
  date: 23-10-2026
- label: MacRumors, Anthropic Launches Claude Duet, a Proactive AI Agent
  url: https://macrumors.com/2026/10/21/anthropic-claude-duet/
  date: 21-10-2026
- label: Bots in Production, Claude Duet, Reviewed by Someone Who Built One by Hand
    First
  url: https://botsinproduction.com/blog/claude-duet-review-from-someone-who-built-one-by-hand/
  date: 22-10-2026
contentHash: sha256:9c6662573126cde3
publishState: published
---

## What changed

On October 21, 2026, Anthropic opened a research preview of Claude Duet, a proactive agent app, by waitlist for Pro and Max users in the US [s1][s3]. Anthropic says Duet checks your connected accounts every few hours, because checking nonstop would use up your plan's limits much faster, and that its background checks count toward those limits [s1]. MacRumors reported the same cadence and limits that day [s3].

## The interval is the price

I think the most useful sentence in this launch is about cost: every few hours is a polling interval, chosen to protect your plan's limits [s1].

> [!CONFIRMED]
> Anthropic says Duet uses the same usage limits as the rest of Claude, and that larger tasks require more model turns and background work [s1].

> [!INFERRED]
> My reading: freshness and spend sit on one dial, and the vendor set it for you.

## The strongest objection

Polling on an interval is an old trade-off that every mail client and cron job already makes. On the trade-off, I agree. The difference is that each poll counts against the user's plan limits [s1].

## A design worth copying

If you build an agent that acts on user accounts, I would copy the design in Anthropic's safety post: credentials such as a sign-in token never enter the machine where the agent works, because a placeholder sits there and a proxy outside that machine puts in the real value only as a request is made [s2]. Anthropic pairs it with an action check that runs outside the model doing the work, and with a distinct User-Agent header plus published IP addresses, so sites can decide how to treat the agent [s2]. I think a compromised agent machine should hold no real credential.

## Impact on your team

If you work from a Pro or Max account, a Duet on that account draws on the same limits as your other Claude use [s1]. My call: keep Duet off any queue where a reply is due within the hour. Bots in Production, which says it has not used Claude Duet but runs a hand-built equivalent, calls every few hours the right default for an inbox and a calendar and the wrong default for anything customer-facing [s4]. You can tell Duet what you want to hear about and how often [s1], which shapes what it sends you; no source I read says the background check interval itself can be changed.
