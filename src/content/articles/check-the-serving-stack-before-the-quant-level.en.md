---
translationKey: serving-stack-before-quantization-coding-agents
lang: en
slug: check-the-serving-stack-before-the-quant-level
title: Check the serving stack before the quant level
publishDate: 20-11-2026
tags:
- agentic-coding
- llm-oss
- evaluation
category: essays
difficulty: 4
sources:
- label: 'Mehboob, Shafique, Qadeer and Farooq, Beyond Accuracy: How Quantization
    Affects Coding Agents (arXiv 2611.02368)'
  url: https://arxiv.org/abs/2611.02368
  date: 02-11-2026
- label: Edward J. Schwartz, Benchmarking Quantized LLMs for Local Coding Agents Part
    4
  url: https://edmcman.github.io/blog/2026-07-22--benchmarking-quantized-ll-ms-for-local-coding-agents-part-4-investigating-the-impact-of-thinking-on-qwen3-5-35-b-a3-b/
  date: 22-07-2026
- label: Edward J. Schwartz, Benchmarking Quantized LLMs for Local Coding Agents Part
    5
  url: https://edmcman.github.io/blog/2026-08-19--benchmarking-quantized-ll-ms-for-local-coding-agents-part-5-do-qwens-recommended-sampling-parameters-explain-the-thinking-penalty/
  date: 19-08-2026
- label: Edward J. Schwartz, Benchmarking Quantized LLMs for Local Coding Agents Part
    6
  url: https://edmcman.github.io/blog/2026-09-04--benchmarking-quantized-ll-ms-for-local-coding-agents-part-6-one-mystery-solved/
  date: 04-09-2026
contentHash: sha256:ea82878d836870eb
publishState: published
---


On a local coding agent, the quant level you download moves the final score less than the runtime that serves it, so check the stack before you compare quants. Most of the advice around local agents goes the other way: long threads about Q8 versus Q5, and almost nobody writing down which llama.cpp build produced the number. Two careful measurements from this year say that attention is pointed at the wrong knob, and one of them shows a version bump costing more than any quantization step ever did.

## Q5 beat Q8

Edward J. Schwartz [s16] has been running his own sweep of quantized models for local coding agents on his blog. With thinking turned off, his BF16 build resolved 54.6% of 500 tasks [s5], the Q8_0 build 52.0% [s6] and the Q5_K_M build 52.6% [s7]. Look at the order for a second. The 5-bit build beat the 8-bit one. If quantization were slowly eroding the model, you would expect the score to slide down as bits go away; what you get is a 2.6-point band whose middle is upside down, which is what noise looks like.

An arXiv paper by Mehboob et al. [s15] lands in the same place by a completely different route: no statistically significant accuracy loss for any of the coding agents it tested [s1]. Its agents ran Qwen2.5-Coder and Devstral models under 4-bit AWQ and GPTQ on OJBench problems [s3], so the two setups share little beyond the question being asked.

## A parsing bug worth thirteen points

In Part 4 of the series, the BF16 build with thinking enabled resolved 34.6% of the tasks [s8], some twenty points under the non-thinking BF16 run above. Part 5 went looking for an explanation in Qwen's recommended sampling parameters and still came out with the same verdict: non-thinking runs were consistently and significantly better than thinking runs [s9]. At that point the obvious reading is that thinking hurts this model and should be switched off.

Then Part 6 found the culprit, and it was in the runtime: upgrading llama.cpp fixed a bug in how the thinking output was parsed [s11]. In the before-and-after table, the thinking-general BF16 configuration goes from 37.4% to 50.8%, a jump of 13.4 points [s10]. It was the only number in that table that really moved, a gain of 67 tasks out of 500 [s14]. Put that next to the quantization band from the sweep: 13.4 points from a runtime upgrade against 2.6 points across every quant level tested, about five times as much. (That row is labelled "thinking-general-BF16" and the Part 4 one "thinking-BF16", so I stick to the before-and-after inside the Part 6 table instead of subtracting across posts.)

Yes, this is one run, by one author, on one model, and "fix your bugs first" is advice about bugs. I don't know how often a runtime version moves a coding-agent score by double digits, and neither source measures it; maybe this one was a freak. Look at what each mistake costs, though. Pasting the output of `llama-server --version` next to every result and re-running one baseline after an upgrade is cheap next to the sweep itself. A quant comparison run on a build that mangles thinking output is worthless at every quant level, and here the wrong conclusion survived two posts before anyone suspected the runtime.

The harness moved the score too. In the same Part 6 table, openhands resolved 54.8% [s12] and mini-swe-agent 61.6% [s13], so 6.8 points between two harnesses, again well over the entire quant band. I can't tell from the table alone whether every other setting stayed identical between those two rows, so take it as a strong hint about where to look and check it on your own setup before switching.

## Turns per solved task

Back to the paper. With AWQ, Qwen-7B went from 17 one-shot solves to 0, while solves that took a loop went from 10 to 25, and final accuracy can hide exactly that kind of shift [s2]: the quantized model reaches roughly the same total by trying, failing and trying again.

Each extra loop is more turns, so more tool calls, more tokens and more minutes on the clock per fix. If you pay per call to a hosted sandbox, or you sit at your desk waiting for the agent to finish, the cost of a solved task changed even though the score held.

So add a column. Next to the resolved count, log the number of turns (or tool calls) per resolved task, for every build you compare. The authors ask for something broader, trajectories, tool use and failure modes assessed alongside final accuracy [s4], but the turn count is the cheap part of that, and it would have caught the Qwen-7B shift.

None of this bounds aggressive quantization. The paper stops at 4-bit AWQ and GPTQ on models up to 32B, and the sweep stops at Q5_K_M on a single model. Go lower, to Q4, Q3 or 2-bit, or move to a model family neither source touched, and the quant level may well start to outweigh the runtime.
