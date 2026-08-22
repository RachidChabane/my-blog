---
translationKey: arc-agi-3-public-set-scope-travels-with-the-figure
lang: en
slug: arc-agi-3-public-set-scope-travels-with-the-figure
title: ARC Prize puts Claude Opus 5 at 30.2 percent on the ARC-AGI-3 public set, and
  NVIDIA says its AVO run is not a measurement of AVO
publishDate: 22-08-2026
kind: benchmark
tags:
- NVIDIA
- ARC-AGI-3
- Claude
- agents
- benchmark
summary: I think a benchmark figure's scope is part of the claim it makes. NVIDIA's
  post on its AVO run on the ARC-AGI-3 public set, dated August 21, 2026, says as
  much about its own numbers, while ARC Prize's July analysis puts Claude Opus 5 at
  30.2 percent on that same public set at high reasoning effort.
sources:
- label: NVIDIA Technical Blog, AVO on the ARC-AGI-3 public set
  url: https://developer.nvidia.com/blog/nvidia-avo-reaches-100-on-arc-agi-3-demonstrating-a-frontier-level-general-purpose-architecture-for-long-horizon-autonomous-agents/
  date: 21-08-2026
- label: The New Stack, on ARC Prize's July ARC-AGI analysis
  url: https://thenewstack.io/nvidia-avo-arcagi3-benchmark/
  date: 21-08-2026
contentHash: sha256:f39627403559051b
publishState: published
---

## What changed

NVIDIA's Technical Blog posted its AVO run on the ARC-AGI-3 public set on August 21, 2026 [s1]. With Claude Opus 5, AVO cleared that 25-environment public set at a 100.00 RHAE score, all 183 levels in 6,624 environment actions, against VISTA's 7,542 [s1]. ARC Prize's July analysis puts Claude Opus 5 at 30.2 percent on that public set at high reasoning effort [s2].

## The limit is published with the number

I think a figure's task set, metric and reasoning-effort setting are part of the claim; a citation that drops them makes a different one. NVIDIA says as much in the same passage as the ARC Prize baseline: the run used the same model family under a different reasoning setting and a substantially different agent system and evaluation setup, so the numbers should not be read as a direct measurement of what AVO contributes [s1]. It also declines to call the AVO against VISTA comparison a controlled ablation; among the differences it names are agent backend, observation representation, memory and context management [s1]. The New Stack renders the same run as one move: AVO elevating Claude Opus 5 from a reported 30.2 percent model baseline to 100 percent as the complete agent system [s2]. That piece is also where the precise 30.2 comes from [s2].

| Figure | Scope | Origin |
| --- | --- | --- |
| 100.00 RHAE, 183 levels, 6,624 actions | AVO on the 25-environment ARC-AGI-3 public set | NVIDIA's post [s1] |
| 7,542 environment actions | VISTA, same model, same 183 public-set levels | NVIDIA's post [s1] |
| 30.2 percent at high reasoning effort | Claude Opus 5 on the ARC-AGI-3 public set | ARC Prize's July analysis [s2] |

> [!IMPORTANT]
> The limit on reading these figures is the vendor's own, published beside the run record [s1].
> Keep the task set, the metric and the reasoning effort in the same sentence as the score.

## Impact on your team

Anyone citing an ARC-AGI-3 number this week is exposed, as is anyone comparing agent harnesses. Hold the model and the level set fixed, record actions per solved level beside the score, and write down the reasoning effort [s1]. The risk: quoting a public-set figure as a plain ARC-AGI-3 figure, a distinction the primary keeps itself [s1]. Wait for a controlled ablation; the post says plainly this run is not one [s1]. Nobody has measured the memory system alone.
