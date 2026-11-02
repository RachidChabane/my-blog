---
translationKey: lfm3-256k-window-versus-ruler-128k-recall
lang: en
slug: lfm3-256k-window-versus-ruler-128k-recall
title: In Liquid AI's own table, LFM3-1.7B is level with Qwen3.5 4B on AA-LCR (52.83
  against 52.67) and trails it on RULER 128K (65.56 against 84.63); Local AI Zone
  says Qwen's full-attention models retrieve better at 128K
publishDate: 02-11-2026
kind: release
tags:
- Liquid AI
- LFM3
- Ollama
- long-context
summary: 'Liquid AI published LFM3 on October 27, 2026, and says LFM3-1.7B is a text
  model for local agents and specialized applications with a 256K-token context window.
  In Liquid AI''s own table, LFM3-1.7B is level with Qwen3.5 4B on AA-LCR (52.83 against
  52.67) and trails it on RULER 128K (65.56 against 84.63). Local AI Zone says Qwen''s
  full-attention models retrieve better at 128K, and that no fully independent benchmark
  replications exist yet. My call: run lfm3 through Ollama for background agents,
  keep long transcripts behind retrieval, and measure recall on your own traces before
  you lean on the far end of the window.'
sources:
- label: Liquid AI on Hugging Face, Build specialized multimodal models with LFM3
  url: https://huggingface.co/blog/LiquidAI/lfm3
  date: 27-10-2026
- label: 'Liquid AI, Introducing LFM3: Every Modality for Specialized Intelligence'
  url: https://www.liquid.ai/blog/lfm3
  date: 27-10-2026
- label: Ollama, Release v0.40.12
  url: https://github.com/ollama/ollama/releases/tag/v0.40.12
  date: 27-10-2026
- label: Ollama, Release v0.40.13
  url: https://github.com/ollama/ollama/releases/tag/v0.40.13
  date: 28-10-2026
- label: 'Local AI Zone, LFM3: A Technical Deep Dive into Liquid AI''s Tri-Hybrid
    2B Multimodal Family'
  url: https://local-ai-zone.github.io/blog/lfm3-deep-dive.html
  date: 28-10-2026
contentHash: sha256:e82ad5d088523388
publishState: published
---

## What changed

Liquid AI published LFM3 on October 27, 2026, with open-weight base and post-trained models on Hugging Face [s1][s2]. Liquid AI says LFM3-1.7B is a text model for local agents and specialized applications with a 256K-token context window, and that the text model fits in about 1 GB at 4-bit precision [s2]. Ollama added lfm3 in Release v0.40.12 on Apple hardware, then Linux and Windows in Release v0.40.13 [s3][s4].

## Two rows, one window

I think the 256K window is room for agent state, and recall at 128K is something to test before you rely on it. Liquid AI's own table draws that line [s2]:

| Benchmark | LFM3-1.7B | Qwen3.5 4B | Qwen3.5 9B | Reported by |
| :--- | ---: | ---: | ---: | :--- |
| AA-LCR | 52.83 | 52.67 | 62.00 | Liquid AI [s2] |
| RULER 128K | 65.56 | 84.63 | 87.11 | Liquid AI [s2] |

Local AI Zone reads the same rows: it says the 256K window is cheap to run, but Qwen's full-attention models retrieve better at 128K, and that AA-LCR (52.83) is much closer to the pack [s5]. In my reading, that RULER row stops at 128K, half the 256K window, so the table gives no RULER figure for the far half.

> [!IMPORTANT]
> Both rows come from Liquid AI's own table. Local AI Zone flags its mechanical account of the retrieval gap as a hypothesis, and says no fully independent benchmark replications exist yet [s5].

## Where the objection lands

The strongest objection is that RULER is one test, and on AA-LCR the model holds level with Qwen3.5 4B. I agree that a single row is thin evidence. In my view it is still the row closest to a background agent's job: the agent fills its window with tool output, then needs one value from deep inside it. Liquid AI says dozens of agents can run continuously in the background [s2], and I think that is where the RULER row matters.

## Impact on your team

If you build local agents on small open models, my call: run lfm3 through Ollama for the background work Liquid AI pitches, and keep long transcripts behind retrieval. The Ollama command is `ollama run lfm3`, and on Linux or Windows it needs Release v0.40.13 [s3][s4]. Before an agent leans on anything past 128K, I would measure recall on your own traces at the depth you plan to fill. The failure I would watch for is an agent that ends a long run having acted on the wrong tool result, with nothing in the log to say so.
