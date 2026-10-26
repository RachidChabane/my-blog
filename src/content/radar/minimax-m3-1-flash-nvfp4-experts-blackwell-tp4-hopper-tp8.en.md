---
translationKey: minimax-m3-1-flash-nvfp4-experts-blackwell-tp4-hopper-tp8
lang: en
slug: minimax-m3-1-flash-nvfp4-experts-blackwell-tp4-hopper-tp8
title: MiniMax M3.1 Flash stores its experts in NVFP4, and vLLM and SGLang serve it
  at TP4 on Blackwell or across a full Hopper node at TP8
publishDate: 26-10-2026
kind: release
tags:
- MiniMax
- vLLM
- SGLang
- inference
summary: 'MiniMax''s initial Hugging Face commit of the M3.1 Flash weights is timestamped
  October 23, 2026. The model card says the routed MoE experts are quantized during
  training, and vLLM says they are stored in NVFP4. The vLLM and SGLang recipes serve
  it at TP4 on Blackwell and at TP8 on Hopper, where the experts go through Marlin
  and DSpark is unavailable. My call: on Hopper, budget a full node per replica, benchmark
  with speculation off, and do not re-quantize the experts.'
sources:
- label: Let's Data Science, MiniMax Launches M3.1 Flash
  url: https://letsdatascience.com/news/minimax-cuts-m31-flash-token-prices-dbc14153
  date: 19-10-2026
- label: MiniMax, MiniMaxAI/MiniMax-M3.1-Flash commit history on Hugging Face
  url: https://huggingface.co/api/models/MiniMaxAI/MiniMax-M3.1-Flash/commits/main
  date: 23-10-2026
- label: MiniMax, MiniMaxAI/MiniMax-M3.1-Flash model card on Hugging Face
  url: https://huggingface.co/MiniMaxAI/MiniMax-M3.1-Flash
  date: 23-10-2026
- label: MiniMax, MiniMaxAI/MiniMax-M3.1-Flash config.json at revision 54e4e69
  url: https://huggingface.co/MiniMaxAI/MiniMax-M3.1-Flash/resolve/54e4e69dfc452b1e94a426c24a4fdeeaa8e3ad5e/config.json
  date: 23-10-2026
- label: vLLM Recipes, MiniMax-M3.1-Flash on vLLM
  url: https://recipes.vllm.ai/MiniMaxAI/MiniMax-M3.1-Flash
  date: 23-10-2026
- label: SGLang Cookbook, MiniMax-M3.1 deployment config
  url: https://raw.githubusercontent.com/sgl-project/sglang/f36ee5de93e979e70bdbfbf996cab6ac2b4e0dbf/docs/src/snippets/configs/MiniMaxAI/minimax-m3.1.jsx
  date: 23-10-2026
- label: vLLM Blog, vLLM Delivers Day-0 Support for MiniMax-M3.1-Flash
  url: https://vllm.ai/blog/2026-10-23-minimax-m31-flash
  date: 23-10-2026
contentHash: sha256:3c8a1a9b075e56ab
publishState: published
---

## What changed

Let's Data Science reported that MiniMax launched M3.1 Flash on October 19, 2026, through its API, and said the weights would come later [s1]. MiniMax's initial commit of the weights to Hugging Face is timestamped October 23, 2026 [s2]. The model card says the routed MoE experts and the attention paths are quantized during training [s3], and `config.json` sets `moe_quant_algo` to `NVFP4` [s4]. vLLM and SGLang both publish serving recipes, and they split on GPU generation [s5][s6].

## The precision ships in the weights

I think the news is the precision MiniMax trained into the weights, because it makes the GPU generation part of the model choice. vLLM says the NVFP4 experts shrink the checkpoint from 451.5 GB (MiniMax-M3-MXFP8) to 250.1 GB [s7], and its recipe describes MXFP8 dense layers and NVFP4 experts [s5]. These are the three quantization fields in the config [s4]:

```text
"quant_method": "mxfp8",
"moe_quant_algo": "NVFP4",
"moe_quant_format": "nvfp4-pack-quantized"
```

In my view, an inventory script that reads only `quant_method` will file this checkpoint as MXFP8 and miss the experts.

## Same weights, two serving paths

vLLM lists GB200, GB300, B200 or B300 for Blackwell and H100 or H200 for Hopper [s5]; SGLang's verified recipes run B300 at `--tp 4` and H200 at `--tp 8` [s6].

| | Blackwell | Hopper |
| --- | --- | --- |
| Tensor parallelism | TP4 (vLLM, SGLang) [s5][s6] | TP8 on a full node (vLLM, SGLang) [s5][s6] |
| NVFP4 experts | native on FP4 tensor cores (vLLM) [s5] | Marlin MoE kernel (vLLM) [s5], Marlin W4A16 (SGLang) [s6] |
| DSpark speculative decoding | SGLang requires Blackwell for NVFP4 DSpark [s6] | not enabled (vLLM) [s5], rejected at argument resolution (SGLang) [s6] |

> [!CONFIRMED]
> vLLM's recipe says Hopper has no FP4 tensor cores, and that the NVFP4 experts run on the Marlin MoE kernel there [s5].

> [!INFERRED]
> My reading: for this checkpoint, Blackwell is the native target and Hopper is the compatibility path.

## The strongest objection

The Hopper limits look like settings. SGLang's H200 recipes set `--context-length 140000` [s6], and the model card says usable context length depends on GPU memory and the serving configuration [s3]. On the context number, I agree. In my view, a longer setting leaves the TP8 node and the missing DSpark path where they are, because both engines ship that behaviour on Hopper [s5][s6].

## Impact on your team

My call: on a Hopper fleet, budget one full node at TP8 per replica and benchmark it with speculation off, which is how both engines run it [s5][s6]. On Blackwell, start from the TP4 recipe. If you planned to re-quantize the experts for Hopper, I would not: the model card says its results are for the official weights and that third-party quantizations may differ [s3]. And key your fleet inventory on `moe_quant_algo`.
