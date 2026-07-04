---
translationKey: gemini-interactions-api-ga
lang: en
slug: gemini-interactions-api-general-availability
title: Gemini's Interactions API hits GA and becomes the default way to build
publishDate: 04-07-2026
kind: release
tags:
- Gemini
- Google
- agents
- API
summary: Google moved its Interactions API to general availability on 2026-06-22 and
  made it the default, primary way to build on Gemini models and agents; the legacy
  generateContent API stays supported, but new agent capabilities are expected to
  land there exclusively.
sources:
- label: Google blog - Interactions API general availability
  url: https://blog.google/innovation-and-ai/technology/developers-tools/interactions-api-general-availability/
  date: 22-06-2026
- label: DEV Community - Google makes the Interactions API the default way to build
    with Gemini agents
  url: https://dev.to/damogallagher/google-makes-interactions-api-the-default-way-to-build-with-gemini-agents-4dnm
  date: 22-06-2026
contentHash: sha256:73061552a99ce49a
publishState: published
---

## What changed

Google announced on 2026-06-22 that its Interactions API has reached general availability and is now the primary way to build on Gemini models and agents [s1][s2]. The documentation defaults to it and Google recommends it for every new project [s1]. The older generateContent API is not going anywhere: it stays fully supported and keeps receiving new mainline Gemini models for the foreseeable future [s1]. The catch sits in one sentence: Google expects frontier capabilities for long-running models and agents to land increasingly exclusively on the Interactions API [s1]. It ships through the Python and JavaScript SDKs [s1], and is reported to have been in public beta since December 2025.

## A default, not a deadline

Read that carefully and the news is a default, not a deadline. Nothing forces you to rewrite anything this week; generateContent has no announced sunset and still gets the mainline models. What changed is the surface every new integration is nudged toward, and where the agent roadmap points. So the real decision is where you start. Begin on generateContent and, as the DEV Community write-up frames it, you risk building on the path that gets the new agent features "later, or not at all" [s2]. Begin on the Interactions API and you take on a new request shape today: Google describes the change only as going "From Roles to Steps" [s1], the surface it names for Managed Agents, background execution, mixing built-in tools with custom functions, and Deep Research [s1].

> [!IMPORTANT]
> generateContent is not deprecated and has no sunset. Treat this GA as a shift in the default surface, not a forced migration.

## Impact on your team

If you are wiring up a new Gemini integration this week, default to the Interactions API so you sit on the path where the long-running and agent capabilities are set to land [s1]. If you already run on generateContent, do not scramble: there is no deadline and it still receives mainline models [s1]. Budget instead for the step-based request shape and the SDK change the next time you reach for Managed Agents, background execution, or Deep Research [s1]. Plan for that schema and SDK cost as the concrete work, and watch the "increasingly exclusively" wording as the signal, since Google is stating a direction, not a cutoff [s1][s2].
