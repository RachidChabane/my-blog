---
translationKey: bonsai-2-5-27b-llama-server-slot-default-costs-vram-headroom
lang: en
slug: bonsai-2-5-27b-one-llama-server-slot
title: Ternary Bonsai 2.5 27B wants one llama-server slot
publishDate: 27-11-2026
tags:
- llm-oss
category: briefings
difficulty: 3
sources:
- label: Prism ML, Ternary Bonsai 2.5 27B GGUF model card
  url: https://huggingface.co/prism-ml/Ternary-Bonsai-2.5-27B-GGUF
  date: 27-11-2026
- label: Hugging Face discussion "KV Cache Tip" on the Bonsai 2.5 GGUF repo
  url: https://huggingface.co/prism-ml/Ternary-Bonsai-2.5-27B-GGUF/discussions/1
  date: 27-11-2026
- label: 'llama.cpp PR #16736, server: support unified cache across slots'
  url: https://github.com/ggml-org/llama.cpp/pull/16736
  date: 23-10-2025
- label: 'llama.cpp issue #17989, "--parallel 1" initializes 4 slots'
  url: https://github.com/ggml-org/llama.cpp/issues/17989
  date: 13-12-2025
- label: Prism ML, Ternary Bonsai 2.5 27B announcement
  url: https://prismml.com/news/bonsai-2-5-27b
  date: 24-11-2026
contentHash: sha256:53a8e316e829b912
publishState: published
---


If you run Ternary Bonsai 2.5 27B on a 10 GB card, the llama-server slot count is the first setting to look at, because the one memory report so far disagrees with what llama.cpp's design predicts. The model's whole pitch is its size: 1.76 bits per weight and 5.93 GB on disk, against 53.8 GB for the FP16 weights [s1]. A file that small is supposed to leave room on a consumer GPU, and the default way of serving it spends some of that room for reasons nobody has pinned down yet.

## Four slots for one person

Unless told otherwise, llama-server starts with four slots and one unified KV cache [s8] (on Macs, iPhones and iPads the model runs through MLX instead [s11], which none of these reports measured). That is a sensible default for a server answering several clients at once. On a desktop card serving one chat window, three of those slots sit idle. The first community report on Bonsai has the line in its server log [s4]:

```
I srv load_model: initializing, n_slots = 4, n_ctx_slot = 32000, kv_unified = 'true'
```

The same user, on an RTX 3080 with 10 GB, added `-np 1` and saw total VRAM go from about 9.5 GB to about 7.8 GB, desktop included [s6] [s3]. The model card has since added the same `-np 1` advice for one request at a time on a limited card [s2].

That is one pair of runs on one machine with the desktop counted in [s3], and I have not reproduced it. And 9.5 GB still fits on a 10 GB card, so the model loads either way; what is at stake is the room left for a longer context or for anything else you keep on the GPU.

What makes the number worth a second look is that llama.cpp's own description leads you to expect a much smaller change. The pull request that introduced the unified cache shares the whole `-c N` context among all slots, and `-np N` still caps the number of parallel jobs but no longer changes the per-slot context [s9]. The user's log fits that description: with four slots, each one reports `n_ctx_slot = 32000` [s4], the full window. So whatever grew between the two runs, it was not the per-slot context the pull request talks about. Prism does not know what it was either. Its reply in the thread asks for the exact build, the launch command and the CUDA buffer allocation lines from both runs, to find which buffers account for the difference [s7].

## Reading the log before trusting the flag

The trap is believing the server runs one slot when it runs four, for instance because a wrapper script rebuilt the command line without `-np 1`. Every memory number you write down afterwards then describes the default. The startup output settles it in a few seconds:

```
llama-server -m <model.gguf> -np 1 2>&1 | grep -E "n_slots|n_parallel|kv_unified"
```

You want `n_slots` to read 1. The four-slot line has a second form, which someone posted in a [llama.cpp issue](https://github.com/ggml-org/llama.cpp/issues/17989): `main: setting n_parallel = 4 and kv_unified = true (add -kvu to disable this)` [s10]. If either of the four-slot lines shows up after you passed `-np 1`, the setting did not take effect, whatever your command line says. Keep the full output of both runs while you are at it, allocation lines included, since that is exactly the evidence the publisher asked for [s7]. Two starts of the server and a diff would answer the open question better than this post can.

The user who found this thinks the default should be `-np 1`, or 2 at most, for a model meant for low-VRAM devices [s5]. For this model I agree, and the fix belongs one step earlier than where it landed. Prism put the advice in a Known issues note on the card [s7], which is the section people read after something has gone wrong. The launch command on the card is the line people actually copy, and it should carry `-np 1` for the single-user case.
