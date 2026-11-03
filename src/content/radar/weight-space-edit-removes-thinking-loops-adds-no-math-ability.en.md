---
translationKey: weight-space-edit-removes-thinking-loops-adds-no-math-ability
lang: en
slug: weight-space-edit-removes-thinking-loops-adds-no-math-ability
title: GPT-6 Astra's weight edit lifted Qwen3.5-0.8B on MATH-500 by removing thinking
  loops, its MIT CSAIL authors and Sean Goedecke agree, and on Gemma 3 270M, which
  rarely loops, the authors report that no edit moved MATH-500 by more than about
  a point
publishDate: 03-11-2026
kind: research
tags:
- GPT-6
- Qwen
- Gemma
- Hugging Face
- evals
summary: 'On November 2, 2026, Takehi, Teoh, Zhang and Khattab of MIT CSAIL published
  Sparks of Weight-Space Programming, in which the authors give GPT-6 Astra a Python
  kernel over the weights of Qwen3.5-0.8B. The authors report that MATH-500 rose from
  7.9% to 48.1% as the share of MATH-500 answers that hit the 32,768-token limit fell
  from 93% to 33%, and that on Gemma 3 270M, which rarely loops, none of Astra''s
  edits moved MATH-500 by more than about a point. Sean Goedecke describes a patch
  that stopped the Qwen model from looping, and calls it exactly what a competent
  human researcher could have and would have done. My call: log the share of answers
  that hit your token limit before you swap a small thinking model for a bigger one.'
sources:
- label: 'Takehi, Teoh, Zhang and Khattab (MIT CSAIL), Sparks of Weight-Space Programming:
    LLMs can natively read and write neural network weights'
  url: https://rikiyat.github.io/blog/weight-space-programming/
  date: 02-11-2026
- label: Hugging Face model card, RikiyaT/Qwen3.5-0.8B-weight-space-programming
  url: https://huggingface.co/RikiyaT/Qwen3.5-0.8B-weight-space-programming
  date: 02-11-2026
- label: Sean Goedecke, LLMs are not superhuman at reading and writing neural network
    weights
  url: https://www.seangoedecke.com/llms-are-not-superhuman-at-reading-and-writing-neural-network-weights/
  date: 03-11-2026
contentHash: sha256:9ec7c80a25d85e32
publishState: published
---

## What changed

On November 2, 2026, Takehi, Teoh, Zhang and Khattab of MIT CSAIL published Sparks of Weight-Space Programming, in which the authors give GPT-6 Astra a Python kernel over the weights of Qwen3.5-0.8B [s1]. The authors report that Astra traced the model's looping to one direction written by the MLPs of layers 15 and 19, and subtracted it from 64 output columns in each, 131,072 weights [s1]. Their Hugging Face model card says the checkpoint was edited by an LLM with no training, and that only two tensors differ from Qwen/Qwen3.5-0.8B [s2].

## A score for unfinished answers

The authors evaluate with thinking on, up to 32,768 tokens; their table, trimmed to three columns [s1]:

| Qwen3.5-0.8B | MATH-500 (%) | GSM8K (%) | Hit token limit (%) | Reported by |
| :--- | ---: | ---: | ---: | :--- |
| Base | 7.9 | 13.8 | 93.0 | Authors [s1] |
| Edited, 10 forward passes | 12.3 | 25.7 | 87.2 | Authors [s1] |
| Edited, 25 forward passes | 14.1 | 25.1 | 86.4 | Authors [s1] |
| Edited, 50 forward passes | 48.1 | 67.1 | 33.1 | Authors [s1] |

In my reading, MATH-500 stays at 14.1% or below while 86.4% or more of answers hit the limit, and jumps to 48.1% only when that share falls to 33.1%, so the base model's 7.9% is the score of a model that rarely reaches an answer. The authors write that fixing loops lets the model finish answers it could already work out, and that on Gemma 3 270M, where only 8.5% of its answers reach its token limit, none of Astra's edits moved MATH-500 by more than about a point [s1].

> [!IMPORTANT]
> The table is the authors' own measurement. A re-run on their Hugging Face model card, built by akhaliq, reports that the edited model scored 51.0%, with 31.6% of answers hitting the token limit [s2]. The authors thank Ahsen Khaliq at Hugging Face for re-running its evaluation [s1]. I count it as a credited re-run, on the authors' side.

## Where the objection lands

The strongest objection is that the authors moved MATH-500 by editing 0.016% of the weights, and a gain is a gain [s1]. I agree that it is real, and the authors release the complete logs [s1]. In my view it is a loop fix, and Sean Goedecke reads it the same way: he describes a patch that stopped the Qwen model from looping, says he would try steering, and calls it exactly what a competent human researcher could have and would have done [s3].

## Impact on your team

If you serve a small thinking model under a token cap, my call: log the share of answers that hit the limit before you swap it for a bigger model, and treat a high share as the first thing to fix. I would start from the re-run settings on the Hugging Face model card, `vLLM, thinking on, temperature 0.6, top_p 0.95, top_k 20, presence_penalty 1.5, max 32,768 new tokens, seed 0` [s2], and diff the two tensors it names, `model.language_model.layers.15.mlp.down_proj.weight` and `model.language_model.layers.19.mlp.down_proj.weight`. The failure I would watch for: a benchmark that scores a truncated answer as wrong, so a looping model reads as one that cannot reason.
