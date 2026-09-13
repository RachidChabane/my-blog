---
translationKey: rtk-gain-counter-versus-terminal-bench-bill
lang: en
slug: rtk-gain-counter-versus-terminal-bench-bill
title: rtk gain counts bash output, and two agent cost benchmarks found no saving
  to match
publishDate: 13-09-2026
kind: benchmark
tags:
- RTK
- Claude Code
- Terminal-Bench
- DeepSeek
- evals
summary: 'Quesma published a Terminal-Bench 2.1 study of RTK on 11 September 2026:
  rtk gain reports 349.2 million tokens saved on DeepSeek, whose cost per task still
  rose 17% on average. JetBrains had measured the same direction on SkillsBench. I
  think rtk gain belongs on no cost report; the runs used RTK 0.45.0, and the current
  release is 0.49.0.'
sources:
- label: Quesma, RTK reports huge token savings, but our cost benchmarks disagree
  url: https://quesma.com/blog/does-rtk-make-ai-coding-cheaper/
  date: 11-09-2026
- label: JetBrains AI blog, Does rtk skill really cut agent tokens? We tested it
  url: https://blog.jetbrains.com/ai/2026/07/rtk-claude-code-token-savings/
  date: 20-07-2026
- label: RTK README, Commands section
  url: https://raw.githubusercontent.com/rtk-ai/rtk/master/README.md
  date: 22-07-2026
- label: rtk-ai/rtk v0.49.0 release
  url: https://github.com/rtk-ai/rtk/releases/tag/v0.49.0
  date: 11-09-2026
contentHash: sha256:7c5b3ad56e2d62b2
publishState: published
---

## What changed

Quesma published a cost study of RTK on 11 September 2026: Terminal-Bench 2.1, Claude Code on Fable 5.0 and OpenCode on DeepSeek V4 Pro 0813, 1,740 attempts with and without the tool [s1]. Across the 445 DeepSeek attempts with RTK, rtk gain reported 349.2 million tokens saved, an 89% reduction [s1]. The bill did not follow [s1].

| With RTK | Fable 5.0, Claude Code | DeepSeek V4 Pro 0813, OpenCode |
| :--- | ---: | ---: |
| Total cost | -5% | +5% |
| Average cost per task | +1% (no clear difference) | +17% |

## A counter in the wrong unit

The miss sits in what the counter measures. RTK documents rtk gain as raw minus filtered command output, in bytes, divided by 4 [s1], and its own README scopes those percentages to bash output rather than to your bill [s3]. Nothing in that formula sees the rest of the loop. On DeepSeek each turn carried 7% less input, but there were 18% more turns [s1], so shorter observations bought extra round-trips. The hook also sees less than people assume. Read, Grep and Glob are separate tools that bypass RTK, and terminal output was only about 7% of Fable's context [s1]. A deep cut to that thin a slice was never going to show on the invoice.

JetBrains got there first, on different ground. In July, on SkillsBench with Claude Code and claude-sonnet-5, RTK came out 7.6% more expensive at low reasoning effort and flat at high effort [s2]. The direction held across harness, model and benchmark.

> [!IMPORTANT]
> Quesma tested RTK 0.45.0. The current release is 0.49.0, published 11 September 2026 with a new recall store [s4], and I have found no cost measurement on it. Read these results as a verdict on 0.45.0.

## Impact on your team

If you put RTK behind a Claude Code hook after the June radar brief, which relayed its savings table, take rtk gain off every cost report. It counts bytes of bash output, and I think a number in the wrong unit does more damage than no number. Replace it with cost per passing task, with and without the hook, on your own tasks: Quesma's per-task gap on DeepSeek (+17% [s1]) runs well above what the total showed (+5% [s1]). If you run OpenCode on DeepSeek V4 Pro, that comparison alone decides whether the hook stays. Do not wait for a rerun on 0.49.0 either [s4]: the recall store changes what RTK does, so only your own measurement on the version you deploy counts.
