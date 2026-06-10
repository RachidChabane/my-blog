---
translationKey: context-budget
lang: en
slug: your-context-window-is-a-ceiling
title: Your Context Window Is a Ceiling, Not a Budget
publishDate: 10-06-2026
tags:
- retrieval
- llm-oss
category: briefings
sources:
- label: 'NoLiMa: Long-Context Evaluation Beyond Literal Matching (Modarressi et al.,
    ICML 2025)'
  url: https://arxiv.org/abs/2502.05167
  date: 10-06-2026
- label: 'RULER: What''s the Real Context Size of Your Long-Context Language Models?
    (Hsieh et al.)'
  url: https://arxiv.org/abs/2404.06654
  date: 10-06-2026
- label: 'Lost in the Middle: How Language Models Use Long Contexts (Liu et al., TACL
    2024)'
  url: https://aclanthology.org/2024.tacl-1.9/
  date: 10-06-2026
- label: 'Context Rot: How Increasing Input Tokens Impacts LLM Performance (Chroma
    Research, July 2025)'
  url: https://www.trychroma.com/research/context-rot
  date: 10-06-2026
- label: Prompt caching with Claude (Anthropic, August 2025)
  url: https://claude.com/blog/prompt-caching
  date: 10-06-2026
- label: Gemini 2.5 models now support implicit caching (Google Developers Blog, May
    2025)
  url: https://developers.googleblog.com/gemini-2-5-models-now-support-implicit-caching/
  date: 10-06-2026
contentHash: sha256:21ab29a13adbd446
publishState: published
---


The context length printed on a model's spec sheet is a marketing ceiling, not an operating budget, so I size a prompt for what the model can actually use, not for what caching now lets me cheaply afford to send. Accuracy collapses well before the window fills [s1][s2]. The ceiling sells the model; the budget builds the system.

## The accuracy evidence

The number that matters is not the window size, it is how far accuracy has already slid by the time you reach it. NoLiMa makes the cut clean by testing retrieval that needs inference rather than literal string matching: GPT-4o, one of the strongest models, drops from an almost-perfect 99.3% to 69.7% at 32K, and 11 models fall below half their short-length baseline at that same length [s1]. RULER tells the same story from a different angle. Every model it tests claims a window of 32K or more, yet only four (GPT-4, Command-R, Yi-34B, and Mixtral) actually hold satisfactory performance there [s2].

Position adds a second penalty on top of length. Lost in the Middle found that a model uses information best when it sits at the beginning or end of the prompt and significantly worse when the relevant fact is buried in the middle, even for models built explicitly for long context [s3]. That is the named failure mode to watch: the same fact, moved from the edge to the center of a long prompt, gets used worst.

This is not a legacy artifact from small windows. Context Rot evaluates 18 current-generation LLMs, including GPT-4.1, Claude 4, Gemini 2.5, and Qwen3 [s4], and reproduces the same length-driven degradation on the frontier models you are shipping with today, not the ones you retired last year.

## The economics pulling the other way

The incentive runs exactly opposite to that evidence. Prompt caching cuts cost by up to 90% and latency by up to 85% on long prompts, and cached input costs only 10% of the base token price, against a one-time cache write at 25% above base [s5]. Google passes the same 75% discount through Gemini 2.5 implicit caching [s6]. So filling the window feels nearly free, and the rational-looking move is to stop pruning context by hand and let the model sort the relevant from the irrelevant.

## The sting

Cheap tokens are not useful tokens. Caching changes what a long prompt costs; it changes nothing about what the model does with the tokens once they arrive, and the accuracy argument stands even if caching did not exist. The steelman deserves a real answer, though, because frontier models now advertise 200K to 1M windows and post near-perfect long-context scores. The catch is what those scores measure: they are overwhelmingly needle-in-a-haystack retrieval, exact strings planted in filler. A high needle score at 1M is consistent with this thesis, not a refutation of it, because the degradation only shows up once retrieval needs inference rather than a literal match [s1]. The bigger window widens the gap between the ceiling and the usable budget unless a model is shown to hold inference-style retrieval at that length.

I am not going to put a number on that gap for a 1M-token model, because the evidence does not support a frontier-scale figure; the claim is directional, not a magnitude. What I will say from experience is the operating rule: budget for usable context, not affordable context. Measure what a given model demonstrably uses on inference-style retrieval at your target length, treat the advertised window as a hard ceiling you rarely approach, and spend the caching savings on sending the right tokens rather than more of them.
