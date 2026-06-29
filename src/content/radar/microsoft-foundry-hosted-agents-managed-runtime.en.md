---
translationKey: microsoft-foundry-hosted-agents
lang: en
slug: microsoft-foundry-hosted-agents-managed-runtime
title: 'Foundry Hosted Agents: a framework-agnostic managed runtime for production
  agents (preview, GA end of June 2026)'
publishDate: 29-06-2026
kind: tool
tags:
- Microsoft Foundry
- Azure
- agents
- deployment
summary: Microsoft Foundry's Hosted Agents is a managed, framework-agnostic runtime
  for your own agent code, callable today in public preview across 20 Azure regions,
  with GA targeted for end of June 2026 and not yet shipped.
sources:
- label: Microsoft Foundry blog - What's New in Hosted Agents in Foundry Agent Service
  url: https://devblogs.microsoft.com/foundry/hosted-agents-build26/
  date: 02-06-2026
- label: Microsoft Learn - Hosted agents in Foundry Agent Service
  url: https://learn.microsoft.com/en-us/azure/foundry/agents/concepts/hosted-agents
  date: 25-06-2026
- label: InfoQ - Microsoft Foundry Adds Runtime, Tooling, and Governance for Production
    Agents
  url: https://www.infoq.com/news/2026/06/microsoft-foundry-agents/
  date: 09-06-2026
contentHash: sha256:fc598851caffa366
publishState: published
---

## What changed

The adoptable agent development this cycle is a runtime, not a model. While GPT-5.6 sits behind a roughly 20-partner limited preview and Gemini 3.5 Pro stays limited-preview, Microsoft Foundry's Hosted Agents (Foundry Agent Service) is a managed, framework-agnostic runtime that runs your own agent code, packaged from any framework, on Microsoft-managed infrastructure [s1][s2]. It is callable today in public preview across 20 Azure regions, and Microsoft targets General Availability by end of June 2026 [s1]; the Microsoft Learn concept page, updated 25-06-2026, still labels it "currently in preview" [s2], so the honest framing is preview-now, not GA-shipped. The core fact is dual-sourced: the docs and an independent InfoQ write-up both describe managed sandboxed sessions with persisted state and filesystem access, multiple-framework support, and a stateful Responses API plus a lighter Invocations protocol [s2][s3].

## The runtime layer

In my read, the agent stack is bifurcating into three layers - model, framework, and runtime - and the runtime (where the agent actually executes: isolation, identity, persisted state, scaling) is becoming a product you rent rather than hand-build. The engineering substance backs that up. Each session runs in its own VM- or hypervisor-isolated sandbox with a persistent `$HOME` filesystem, enabling scale-to-zero with stateful resume [s1][s2]. Every deployed agent is auto-assigned its own Microsoft Entra ID (agent identity) and a dedicated endpoint at deploy time [s1][s2]. And you deploy from source, no hand-built container required [s2]:

```bash
# Deploy agent source directly (no container packaging required)
azd deploy
# Each deployed agent is auto-assigned a Microsoft Entra ID (agent identity)
# and a dedicated endpoint at deploy time.
# Protocols exposed: Responses (OpenAI-compatible /responses), Invocations (JSON).
```

## The operational envelope

These are Microsoft-documented numbers, single-sourced to the Learn docs and not independently corroborated; treat them as a starting point to verify against your own load.

| Limit or knob | Documented value |
| :--- | :--- |
| Idle timeout | 15 minutes [s2] |
| Session lifetime | deleted after 30 days inactivity [s2] |
| Default quota | 50 concurrent active sessions per subscription per region [s2] |
| Sandbox sizes | 0.5/1/2 vCPU (1/2/4 GiB) [s2] |
| Per-session disk | up to 20 GiB (~20% reserved for system) [s2] |

> [!IMPORTANT]
> Billing is per active session across CPU and memory, so the docs warn that oversizing "multiplies cost by your concurrency" [s2]. The runtime is convenient, but right-sizing the sandbox is now your job, not the platform's.

## Impact on your team

If you hand-build agent hosting today (isolation, identity, state, scaling), this is the layer it replaces, and unlike this cycle's gated model drops it is callable now, so it is worth a spike. The catch is where the lock-in goes. The agent code stays genuinely framework-agnostic (Agent Framework, LangGraph, Semantic Kernel, or custom Python/C#), but the runtime and identity are hard-wired to Azure and Microsoft Entra, so the lock-in moves from your code to your runtime and IAM. That is the real architecture decision, not the demo. Two concrete watch-items before any rollout: it is preview, with GA only targeted for end of June 2026, so do not put a production SLA on it yet; and because billing scales per session, you right-size the sandboxes first, not after.
