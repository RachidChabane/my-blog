---
translationKey: kimi-k2-7-copilot
lang: en
slug: kimi-k2-7-code-github-copilot-open-weight
title: 'GitHub Copilot''s first open-weight pick: Kimi K2.7 Code'
publishDate: 03-07-2026
kind: tool
tags:
- Kimi
- GitHub Copilot
- Moonshot
- open-weight
- coding
summary: GitHub made Kimi K2.7 Code generally available in Copilot on 2026-07-01,
  the first open-weight model in the picker, hosted on Azure and billed under usage-based
  credits, and the same weights you can self-host under a Modified MIT License.
sources:
- label: Primary - GitHub Changelog, Kimi K2.7 Code is generally available in GitHub
    Copilot
  url: https://github.blog/changelog/2026-07-01-kimi-k2-7-is-now-available-in-github-copilot/
  date: 01-07-2026
- label: Corroboration - The Stack, GitHub picks China's Kimi for low-cost Copilot
    option
  url: https://www.thestack.technology/github-china-kimi-copilot/
  date: 02-07-2026
- label: Hugging Face model card, moonshotai/Kimi-K2.7-Code
  url: https://huggingface.co/moonshotai/Kimi-K2.7-Code
  date: 12-06-2026
contentHash: sha256:e5bfa5ac69c96ea4
publishState: published
---

## What changed

On 2026-07-01 GitHub made Kimi K2.7 Code generally available in Copilot, the first open-weight model offered as a selectable option in the model picker [s1]. It is beginning to roll out to Copilot Pro, Pro+, and Max plans, hosted by GitHub on Microsoft Azure so you stand up no inference of your own, and billed at provider list pricing under usage-based billing [s1]. The Stack, reporting independently the next day, framed it as Microsoft opening Copilot to open-weight models for the first time and called Kimi the cheapest non-lightweight option outside GitHub's fine-tuned Raptor mini [s2].

## The open-weight bridge

Here is the part the release notes do not say out loud: the copy Copilot hosts on Azure and the copy you can download are the same weights. Kimi K2.7 Code is Moonshot AI's coding model, a Mixture-of-Experts with 1T total parameters and 32B active and a 256K context window, published on Hugging Face under a Modified MIT License [s3]. That collapses a decision AI engineers usually agonize over. You can prototype against GitHub's hosted copy today, then, if data governance or cost pushes you to self-host, stand up the identical weights without switching models or re-baselining behavior. The card's own numbers are base-model figures, not Copilot scores: Kimi Code Bench v2 rises from 50.9 to 62.0 between K2.6 and K2.7 Code, with roughly 30% fewer thinking tokens than K2.6 [s3].

| Copilot plan | Kimi K2.7 Code |
| :--- | :--: |
| Pro, Pro+, Max | rolling out [s1] |
| Business, Enterprise | off by default, admin must enable [s1] |

> [!IMPORTANT]
> Usage-based credit billing means you pay per use, not per seat, and GitHub publishes only "provider list pricing" with no per-token figure [s1]. The "cheapest non-lightweight" line is The Stack's characterization, not GitHub's, so treat it as a claim to verify on your own workload rather than a settled price [s2].

## Impact on your team

If you are on Copilot Business or Enterprise, nobody can pick Kimi until an admin flips it on: it is off by default and a plan administrator has to enable the Kimi K2.7 Code policy in Copilot settings [s1]. That is the first concrete action, before any evaluation. For teams eyeing self-hosting for data governance, the practitioner call is to prototype against the Copilot-hosted copy now and only stand up your own inference once the traces justify the operational cost, since the weights are identical [s1][s3]. And watch the billing: a model that reads cheap per token can still run expensive per developer at volume under usage-based credits, so meter it before you make it the team default [s1][s2].
