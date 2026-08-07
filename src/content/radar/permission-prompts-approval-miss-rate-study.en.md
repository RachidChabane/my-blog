---
translationKey: human-in-the-loop-approval-miss-rate-study
lang: en
slug: permission-prompts-approval-miss-rate-study
title: Players approving agent commands missed 1 in 3 threats, and that 66.3% is the
  optimistic number
publishDate: 07-08-2026
kind: research
tags:
- Claude Code
- Claude
- Anthropic
- agents
- security
summary: 'A permission game logged over 40,000 runs and 409,000 approve/deny decisions:
  the average player missed 1 in 3 threats, a mean accuracy of 66.3%, and 7% approved
  every single prompt. Anthropic''s Claude Code telemetry puts real-world approval
  at around 93 percent, so treat 66.3% as the ceiling on human vigilance.'
sources:
- label: Scale X study
  url: https://scalex.dev/blog/ai-agent-permissions-stats/
  date: 05-08-2026
- label: The Register
  url: https://www.theregister.com/ai-and-ml/2026/08/06/humans-in-the-loop-miss-a-third-of-dangerous-ai-coding-agent-requests/5284236
  date: 06-08-2026
contentHash: sha256:6cae5280873f84bb
publishState: published
---

## What changed

Scale X published the data behind its agent-permission game on 5 August 2026: over 40,000 runs and 409,000 individual approve/deny decisions, framed as a test of the human-in-the-loop, "our last line of defence against rogue agents" [s1]. The average player missed 1 in 3 threats, a mean accuracy of 66.3% [s1]. And 32.9% of sessions ended on a negative score, penalties from approved threats and blocked safe commands outweighing everything done right [s1].

## 66.3% is an optimistic number

Those players were primed. They knew a score was being kept, they knew threats had been planted, and vigilance was the entire task. Production offers none of that. Anthropic's own Claude Code telemetry, quoted from a May post, puts approval at around 93 percent of permission prompts [s2], and the company names the mechanism: "The more approvals a user sees, the less attention they pay to each" [s2]. Read together, the study stops measuring production vigilance and fixes the upper bound on it. I would treat 66.3% as the best your reviewers will ever do.

| Outcome | Share |
| :--- | ---: |
| Mean accuracy over all decisions | 66.3% [s1] |
| Sessions ending on a negative score | 32.9% [s1] |
| Caught every threat | 35.2% [s1] |
| Same, while blocking at most 1 in 5 safe commands | 20.8% [s1] |
| Approved every single prompt | 7% [s1] |

> [!IMPORTANT]
> Of the 35.2% who caught every threat, only 20.8% managed it while blocking at most 1 in 5 of the safe commands; the rest got there partly by blocking everything, the "Human Bottleneck" title [s1]. A reviewer who denies by reflex looks safe on a dashboard and ships nothing, and no team I know measures that cost.

## Impact on your team

Move the approval prompt out of the controls column of your threat model and into the speed-bumps column. Then cut the volume, because volume is what erodes attention [s2]: allowlist the boring majority so what reaches a human is rare enough to be read. Measure your own approve rate this week; if it sits near 93 percent [s2], your team already runs `--dangerously-skip-permissions` in practice, which is what the 7% cohort did by hand [s1]. The budget you were about to spend on approval UX belongs in controls that do not decay: sandboxed execution, egress allowlists, scoped credentials. Those stay as strict on the four-hundredth prompt as on the first, and no human here did.
