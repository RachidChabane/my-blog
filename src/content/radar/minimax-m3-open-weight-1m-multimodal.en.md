---
translationKey: minimax-m3-open-weight-multimodal
lang: en
slug: minimax-m3-open-weight-1m-multimodal
title: 'MiniMax-M3: an open-weight 1M-context multimodal MoE on sparse attention'
publishDate: 22-06-2026
kind: release
tags:
- open-weight
- llm-release
- long-context
- multimodal
- sparse-attention
summary: 'MiniMax shipped M3 on 1 June 2026: an open-weight ~428B / ~23B-active MoE
  pairing a 1M-token context with native text, image, and video input and a new sparse-attention
  operator (MSA), scoring 59.0% on SWE-Bench Pro.'
sources:
- label: MiniMaxAI/MiniMax-M3 official Hugging Face model card
  url: https://huggingface.co/MiniMaxAI/MiniMax-M3
  date: 01-06-2026
- label: DataNorth news - MiniMax launches M3
  url: https://datanorth.ai/news/minimax-launches-m3
  date: 01-06-2026
contentHash: sha256:dec18d79f4733bef
publishState: published
---

## What changed

MiniMax, the Shanghai lab, released MiniMax-M3 on 1 June 2026 as open weights under the minimax-community license. It is a Mixture-of-Experts model of roughly 428B total parameters with about 23B active per token, and it pairs a 1M-token context with native multimodality: text, image, and video go in, text comes out. The headline for engineers is not the size but the attention operator. M3 drops grouped-query attention for MiniMax Sparse Attention (MSA), and reports 59.0% on SWE-Bench Pro at roughly 100 tokens per second.

## How MSA changes the math

<figure class="rc-diagram"><svg viewBox="0 0 560 170" role="img" aria-label="The MSA index branch selects two of five past-token blocks for the main attention path; the unselected blocks are skipped"><text x="16" y="44" style="fill: var(--fg); font-family: var(--font-mono)" font-size="13">query</text><line x1="68" y1="40" x2="108" y2="40" style="stroke: var(--accent)" stroke-width="1.5"/><rect x="108" y="22" width="96" height="36" rx="5" style="fill: none; stroke: var(--accent)" stroke-width="1.5"/><text x="124" y="44" style="fill: var(--fg); font-family: var(--font-mono)" font-size="12">index</text><text x="250" y="16" style="fill: var(--fg); font-family: var(--font-mono)" font-size="11">past-token blocks</text><rect x="250" y="26" width="44" height="26" rx="3" style="fill: var(--accent); stroke: var(--accent)"/><rect x="300" y="26" width="44" height="26" rx="3" style="fill: none; stroke: var(--fg-subtle)"/><rect x="350" y="26" width="44" height="26" rx="3" style="fill: var(--accent); stroke: var(--accent)"/><rect x="400" y="26" width="44" height="26" rx="3" style="fill: none; stroke: var(--fg-subtle)"/><rect x="450" y="26" width="44" height="26" rx="3" style="fill: none; stroke: var(--fg-subtle)"/><line x1="204" y1="40" x2="250" y2="40" style="stroke: var(--accent)" stroke-width="1.5"/><line x1="272" y1="52" x2="272" y2="110" style="stroke: var(--accent)" stroke-width="1.5"/><line x1="372" y1="52" x2="372" y2="110" style="stroke: var(--accent)" stroke-width="1.5"/><rect x="250" y="110" width="194" height="34" rx="5" style="fill: none; stroke: var(--accent)" stroke-width="1.5"/><text x="266" y="132" style="fill: var(--fg); font-family: var(--font-mono)" font-size="12">attention (selected blocks)</text><line x1="444" y1="127" x2="486" y2="127" style="stroke: var(--accent)" stroke-width="1.5"/><text x="492" y="131" style="fill: var(--fg); font-family: var(--font-mono)" font-size="12">out</text></svg><figcaption>MSA's index branch reads only the blocks it selects; the rest are skipped.</figcaption></figure>

MSA runs a lightweight index branch beside the main attention path: for each query it selects which blocks of past tokens actually need attention, instead of scanning the full sequence. That is the whole trick, and it is why a million-token context stops being a memory-bandwidth wall. MiniMax reports MSA cuts per-token compute to about one-twentieth of the prior generation, with more than 9x faster prefill and more than 15x faster decode than M2 at a 1M context. The lesson the field keeps relearning: long context is an attention-operator problem before it is a hardware problem.

## The spec sheet

| Field | MiniMax-M3 |
| :--- | :--- |
| Parameters | ~428B total, ~23B active (MoE) |
| Context window | 1,000,000 tokens |
| Attention | MiniMax Sparse Attention (MSA) |
| Modalities | text + image + video in, text out |
| License | minimax-community |
| SWE-Bench Pro | 59.0% |
| Output speed | ~100 tokens/sec |

## Impact on your team

If you self-host long-context agents or multimodal pipelines, M3 is the first open-weight model to bundle frontier-grade coding, a 1M window, and native image and video input in one set of weights, so a workflow that today wires a coding LLM to a separate vision model could collapse into a single deployment. Before you plan a migration, weigh two things. The license is minimax-community, not MIT or Apache, so read its terms before any commercial use. And the dramatic figures, the 9x and 15x speedups, the compute cut to one-twentieth, the output rated 3x faster than Claude Opus, are vendor-reported: benchmark MSA on your own 1M-token traffic before you size hardware around them.

> [!IMPORTANT]
> MSA's speedups and the SWE-Bench Pro score are MiniMax's own numbers. The model card does not confirm layer or expert counts, so do not size a serving budget from an assumed architecture. Measure prefill and decode latency at your real context length before committing GPUs.
