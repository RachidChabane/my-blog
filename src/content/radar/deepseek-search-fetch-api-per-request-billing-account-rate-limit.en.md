---
translationKey: deepseek-search-fetch-request-billing-and-account-level-qps
lang: en
slug: deepseek-search-fetch-api-per-request-billing-account-rate-limit
title: DeepSeek opens Search and Fetch APIs priced per request, each rate-limited
  per account across all of its API keys
publishDate: 18-10-2026
kind: release
tags:
- DeepSeek
- Claude Code
- Codex
- agents
- rag
summary: 'DeepSeek opened its Search and Fetch APIs on October 17, 2026, each at $0.75
  per 1,000 successful requests and each limited to 5 requests per second, calculated
  at the account level regardless of which API key is used. A search for 50 results
  costs the same as a search for 1, and failed requests are not billed. Server-side
  tool calls from Claude Code or Codex on the DeepSeek API are free until 16:00 UTC
  on October 31, 2026. My call: ask for 50 results, filter on rerank_score and authority,
  and count your agents'' server-side searches before billing starts.'
sources:
- label: DeepSeek API Docs, "Search & Fetch" guide
  url: https://api-docs.deepseek.com/guides/search/
  date: 17-10-2026
- label: DeepSeek API Docs, Change Log entry "Opening up the in-house search API"
  url: https://api-docs.deepseek.com/updates
  date: 17-10-2026
- label: 'DeepSeek API Docs news, "DeepSeek-V4.1-Flash-1017: Wish-Driven Programming
    Made Real"'
  url: https://api-docs.deepseek.com/news/news261017/
  date: 17-10-2026
- label: PPC Land (Luis Rijo), "DeepSeek prices web search for AI agents at $0.75
    per 1,000 calls"
  url: https://ppc.land/deepseek-prices-web-search-for-ai-agents-at-0-75-per-1-000-calls/
  date: 17-10-2026
- label: Startup Fortune (Dave Barr), "DeepSeek Opens Its Search and Fetch APIs at
    $0.75 per 1,000 Calls"
  url: https://startupfortune.com/deepseek-opens-its-search-and-fetch-apis-at-075-per-1000-calls/
  date: 18-10-2026
contentHash: sha256:dccd569647ca79ff
publishState: published
---

## What changed

DeepSeek opened its Search and Fetch APIs on October 17, 2026 [s1][s2]. Search, at `POST https://api.deepseek.com/v1/tools/search`, takes a `count` between 1 and 50, and Fetch returns a single web page as Markdown [s1]. Each costs $0.75 per 1,000 successful requests and is limited to 5 requests per second per account [s1].

## One request, two budgets

I think the request is the unit to design around, because DeepSeek counts it for both the bill and the rate limit. `count` only controls how many results are returned and does not affect the per-request price [s1], so my call is to ask once for 50 and filter in your own code on `rerank_score` (1.5 or above counts as high quality) and `authority` (3 or above marks a highly authoritative source) [s1]:

```json
{
  "query": "...",
  "count": 50,
  "need_content": false
}
```

> [!CONFIRMED]
> The QPS limits are calculated at the account level, regardless of which API key is used, and requests above the limit receive HTTP 429; a request is billable only when it returns HTTP 200 and produces a result [s1].

> [!INFERRED]
> In my reading, handing each subagent its own key buys no headroom, and a rate-limited retry costs latency while adding nothing to the bill.

## The strongest objection

PPC Land offers the counterweight: five requests per second amounts to 432,000 calls a day at sustained maximum, a ceiling it calls suited to individual applications and coding agents [s4]. I agree for one agent doing one lookup at a time. The daily total hides bursts, though: a planner that launches its subagents together sends their searches in the same second, and the guide's answer to HTTP 429 is to wait and retry [s1], which turns the limit into latency.

## Impact on your team

Server-side tool calls from DeepSeek Harness, Claude Code or Codex on the DeepSeek API already hit Search and Fetch for free [s1], and billing starts at 16:00 UTC on October 31, 2026 [s3]. PPC Land calls the billing change narrow, since it affects DeepSeek API customers who route these tools through DeepSeek [s4], and Startup Fortune adds that it is not a free search feature for Claude Code or Codex users in general [s5]. My call: before that date, count the server-side searches your sessions on the DeepSeek API make in a typical week, and compare one search with `need_content` set to true against a search plus Fetch calls on your own queries, because the guide does not say how complete the returned content is [s1]. The guide also does not say whether server-side calls count against your account's limits, so budget each API's limit across every agent on the account.
