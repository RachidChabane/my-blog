---
translationKey: cloudflare-kitesurf-agent-browser-workers
lang: en
slug: cloudflare-kitesurf-agent-browser-cdp-parameter
title: Cloudflare's Kitesurf swaps Chromium behind one CDP parameter, at the cost
  of slower tasks
publishDate: 08-08-2026
kind: tool
tags:
- Cloudflare
- Kitesurf
- Browser Run
- agents
summary: Kitesurf is an agent-first browser you reach by adding browser=kitesurf to
  the Browser Run CDP endpoint, so Puppeteer, Playwright and chrome-remote-interface
  clients keep working untouched. In Cloudflare's own tests it used 3.1 to 3.8 times
  less CPU and 4.7 to seven times less memory than Chromium, and took 1.7 to 1.8 times
  longer per task.
sources:
- label: Cloudflare blog, Kitesurf launch post
  url: https://blog.cloudflare.com/kitesurf/
  date: 06-08-2026
- label: TechRepublic report
  url: https://www.techrepublic.com/article/news-cloudflare-kitesurf-browser-ai-agents/
  date: 07-08-2026
contentHash: sha256:74fcb1b390810ee8
publishState: published
---

## What changed

Cloudflare announced Kitesurf on 6 August 2026: a browser engine written for agents instead of for people, reachable through the Browser Run CDP endpoint your code already calls. "All you need to do is add the browser=kitesurf parameter to our endpoints" [s1], and Puppeteer, Playwright, chrome-remote-interface and any AI agent that speaks MCP and CDP keep working untouched [s1]. The numbers Cloudflare published put a price on that convenience [s2].

| Dimension | Kitesurf against Chromium, in Cloudflare's own tests |
| :--- | :--- |
| CPU | 3.1 to 3.8 times less [s2] |
| Memory | 4.7 to seven times less [s2] |
| Time per task | 1.7 to 1.8 times longer [s2] |

## The trade you are actually making

Read the three rows together and they argue about fleet capacity rather than about speed. Memory drops by more than time rises, so the sessions you hold per gigabyte go up even though each one finishes later. I read Kitesurf as a concurrency lever: reach for it where your headless fleet is bounded by RAM per worker and nobody is watching a spinner. Put it in front of a user waiting on a single scrape and you have bought a slower p95 for nothing.

## In practice

```diff
  $BROWSER_RUN_CDP_ENDPOINT
+ browser=kitesurf
```

That one parameter is the whole migration [s1], and deleting it is the whole rollback. Join it with `?` or `&`, depending on what your endpoint URL already carries. Route one job class through it and compare on your own task mix.

> [!IMPORTANT]
> Every figure here comes from Cloudflare's own tests [s2], on Cloudflare's own task mix. I have not seen a third-party Kitesurf benchmark, so treat 1.7 to 1.8 times as an order of magnitude and measure your own.

## Impact on your team

One query parameter [s1] is too cheap for a meeting; what you owe your team is a routing rule. Split browser jobs by whether a human is waiting: batch crawls, eval harnesses and wide agent fan-out go to Kitesurf, interactive paths stay on Chromium. Check your timeouts before you flip anything, because that is where this bites first: limits calibrated against Chromium now sit on top of a browser Cloudflare measured at 1.7 to 1.8 times slower [s2], and your first Kitesurf run surfaces as a wave of timeouts that reads like an outage. Raise them, run a week, then read the CPU and memory bill. If your fleet is short of neither RAM nor CPU today, skip this one.
