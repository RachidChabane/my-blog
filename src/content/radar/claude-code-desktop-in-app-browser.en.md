---
translationKey: claude-code-desktop-in-app-browser
lang: en
slug: claude-code-desktop-in-app-browser
title: Claude Code Desktop adds an in-app browser, and splits agent browsing by who
  owns the cookies
publishDate: 13-07-2026
kind: release
tags:
- Claude
- Claude Code
- agents
- browser-use
summary: 'In Week 28 (July 6-10, 2026) Claude Code on desktop gained a built-in browser
  with a clean, isolated profile and no saved logins. The real change is the split:
  you now have two browser surfaces, and you pick by whether the agent should see
  your authenticated identity.'
sources:
- label: Primary - Claude Code 'What's new' docs, Week 28 digest
  url: https://code.claude.com/docs/en/whats-new
  date: 10-07-2026
- label: Corroboration - 9to5Mac, 'Anthropic highlights Claude Code's in-app browser
    on the desktop'
  url: https://9to5mac.com/2026/07/10/anthropic-highlights-claude-codes-in-app-browser-on-the-desktop/
  date: 10-07-2026
- label: Corroboration - Digital Trends, 'Claude Code can now browse the web without
    opening Chrome'
  url: https://www.digitaltrends.com/cool-tech/claude-code-can-now-browse-the-web-without-opening-chrome/
  date: 10-07-2026
contentHash: sha256:ce30868f7099d23e
publishState: published
---

## What changed

Claude Code on desktop shipped a built-in browser in Week 28 (July 6-10, 2026), versions v2.1.202-v2.1.206 [s1]. Claude can pull up docs, designs, issue trackers, internal web apps, or virtually any other site, then read page contents, click links, and interact with elements the same way it already drives your local dev-server previews [s1][s3]. The load-bearing detail is not that it browses, it is how: the Browser pane runs a clean, isolated profile with none of your saved logins or history, it is sandboxed, and you choose whether sessions persist [s2][s3]. This is a shipped Desktop feature that is live now, not a preview.

## The two surfaces

One week earlier, in Week 27 (June 29-July 3, 2026), Anthropic made "Claude in Chrome" generally available, and that extension drives your real Chrome with your real sessions [s1]. So there are now two browser surfaces with different trust models, and the interesting fact is the split, not either feature alone: you pick the browser by whether the task should see your authenticated identity.

| Surface | Identity / logins | Best for |
| :--- | :--- | :--- |
| Claude in Chrome extension | Your real Chrome, your real sessions | Tasks needing authenticated access [s2] |
| In-app browser (Desktop) | Clean, isolated profile, no saved logins | Build-and-verify, sites that don't need your identity [s2] |

The so-what: the in-app browser closes the build-and-verify loop (open the docs, drive the running app, read the issue tracker) without ever handing an autonomous agent your production cookies, so the safe default for build-and-verify work is now the identity-free surface.

> [!IMPORTANT]
> A clean profile with no saved logins cannot test a login-gated path in your own app; that still needs the Chrome extension or seeded throwaway credentials [s2]. The sandbox is a capability boundary, not just a safety nicety.

## Impact on your team

When you wire an agent to a browser, the decision that changed is which surface. Default your build-and-verify work to the identity-free in-app browser on Desktop, and reserve the Chrome extension for the authenticated paths: login-gated end-to-end tests, anything that needs your real session [s2]. The concrete move is to adopt the in-app browser now for docs, dev-server, and issue-tracker loops, keep the extension for authenticated flows, and never point an autonomous, click-happy agent at your live cookies when the task does not need them.
