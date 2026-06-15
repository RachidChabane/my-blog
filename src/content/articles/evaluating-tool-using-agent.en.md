---
# SEED, bootstrap corpus (task 7); replaced by the content pipeline (tasks 23-28). Safe to delete.
translationKey: evaluating-tool-using-agents
lang: en
slug: evaluating-tool-using-agent
title: 'Evaluating a tool-using agent: beyond success rate'
publishDate: '12-05-2026'
tags:
  - agents
  - evaluation
difficulty: 2
sources:
  - label: 'Anthropic, Building effective agents'
    url: 'https://www.anthropic.com/research/building-effective-agents'
    date: '12-12-2024'
  - label: 'arXiv, ReAct: Synergizing Reasoning and Acting'
    url: 'https://arxiv.org/abs/2210.03629'
    date: '06-10-2022'
contentHash: 'seed-evaluating-tool-using-agents-en'
publishState: published
---

An agent that completes the task but wrecks the state hasn’t succeeded.

Success rate alone hides the failures that matter most in production. An agent can
return the right answer while deleting a file, leaving a half-applied migration, or
burning ten times the necessary tokens, and a binary pass/fail score will happily
call that a win.

A useful evaluation scores the trajectory, not just the destination: did it respect
side-effect boundaries, recover from a failed tool call, and stay within budget?

> [!IMPORTANT]
> Score the trajectory, not just the destination. A binary pass/fail that ignores the
> path will call a run a win even when the agent wrecked the state to get there.

Each production failure the binary score hides maps to a trajectory check it should
have run instead:

| Failure the success rate hides | Trajectory check |
| --- | :--: |
| Deleting a file | Respected side-effect boundaries |
| Leaving a half-applied migration | Recovered from a failed tool call |
| Burning ten times the necessary tokens | Stayed within budget |

Logging each step makes these checks possible and turns a vague regression into a
specific, fixable one.
