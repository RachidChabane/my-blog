---
translationKey: muse-spark-1-1-meta-paid-api
lang: en
slug: meta-muse-spark-1-1-first-paid-api
title: Meta ships Muse Spark 1.1 behind its first paid API, and drops the open-weight
  lever
publishDate: 12-07-2026
kind: release
tags:
- Muse Spark
- Meta
- MCP
- agents
- coding
summary: 'On 2026-07-09 Meta launched Muse Spark 1.1 and opened the Meta Model API
  in public preview, its first paid, closed model. The real change is the reversal:
  the lab whose open weights commoditized the base-model layer is now metering tokens.'
sources:
- label: Primary - Meta AI blog, 'Introducing Muse Spark 1.1'
  url: https://ai.meta.com/blog/introducing-muse-spark-meta-model-api/
  date: 09-07-2026
- label: Corroboration - TechCrunch, 'Meta enters the crowded AI coding battle with
    Muse Spark 1.1'
  url: https://techcrunch.com/2026/07/09/meta-enters-the-crowded-ai-coding-battle-with-muse-spark-1-1/
  date: 09-07-2026
- label: 'Corroboration - DataCamp, ''Muse Spark 1.1: Meta''s Agentic Model and API'''
  url: https://www.datacamp.com/blog/muse-spark-1-1
  date: 09-07-2026
- label: Corroboration - Fortune, 'Meta releases latest update of AI model Muse Spark'
  url: https://fortune.com/2026/07/09/meta-muse-spark-1-1-release-alexandr-wang-superintelligence-labs-mark-zuckerberg/
  date: 09-07-2026
contentHash: sha256:bc9c56d79871bcdf
publishState: published
---

## What changed

Meta launched Muse Spark 1.1 and opened the Meta Model API in public preview on 2026-07-09 [s1][s4]. It takes up to 1M tokens of multimodal input (text, images, and other media) and returns text only [s1][s3], and it is built for agentic work: Meta says its tool use zero-shot generalizes to native tools, MCP servers, and custom skills, that it runs computer-use workflows across multiple applications, orchestrates multi-agent systems, and codes on large, complex codebases including bug fixing and large migrations [s1]. The API is OpenAI-compatible; US developers get immediate access, with a waitlist for everyone else [s1][s3]. This is public preview, not GA.

## The price, in context

At $1.25 per million input tokens and $4.25 per million output tokens, with $20 in free credits [s2][s3], Muse Spark 1.1 lands next to Claude Haiku 4.5 and GPT-5.6 Luna; TechCrunch puts it "in line with (albeit slightly above)" that pair [s2]. Read the number, not the launch copy: this is the fourth cheap-tier agentic coder to sit at the same price floor. What makes it a routing decision rather than a project is the surface. The API is OpenAI-compatible with native MCP tool use [s1][s3], so adding it to a cost-aware router is a base-url swap and one routing-table row, not a client migration.

## The strategy flip

Here is the part the spec sheet buries. Meta made open-weight Llama the free default and used it to commoditize the base-model layer; now it is metering tokens and, per Fortune, "competing on Anthropic and OpenAI's turf" [s4]. Zuckerberg frames the focus as "strong agentic and multimodal models at very low cost" [s4]. This is Meta's first paid, closed model, which is a bigger signal than one more row on the price list: the free-weights-as-strategy era at Meta is the thing that changed.

> [!IMPORTANT]
> The caveats the announcement soft-pedals: it is public preview and US-only, output is text-only, and Meta declined to benchmark it against Anthropic's or OpenAI's latest flagships. Its only volunteered head-to-head is beating Google's latest Gemini on coding and reasoning, and Fortune reports it still lags the newest flagships on some coding metrics [s4].

## Impact on your team

If you run a cost-aware model router, this is a candidate cheap tier you can trial today: US-only, on $20 in free credits, reachable through your existing MCP tools with a base-url swap [s1][s3]. The concrete move is to benchmark it on your own agentic, bug-fix, and migration workload before trusting Meta's framing, because Meta dodged the flagship comparison [s4]. What to wait on: do not treat the third-party SWE-Bench or Terminal-Bench numbers as official, and do not build on GA assumptions, since it is preview, US-only, and text-out. The strategic read matters more than the spec: the era of free open weights from Meta is what ended here, not just the arrival of one more model on the price list.
