---
lang: en
translationKey: agentic-coding-harness-eval
slug: agentic-coding-harness-eval
title: Evaluating agentic coding harnesses
tags:
  - agentic
  - evaluation
---

Agentic coding harnesses run tool-use loops over a task suite [s1]. This post is a
hands-on look at how they are actually evaluated.

## The tool-use loop

Per the source, a harness chains tool calls and result checks at each step [s1]. The
mechanism matters more than the model.

---

## Measuring success

Benchmarks measure pass rate across multi-step coding tasks [s2]. The number to watch
is end-to-end task completion, not per-step accuracy.
