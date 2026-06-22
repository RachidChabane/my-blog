---
translationKey: glm-5-2-mit-1m-coding-open-weight
lang: en
slug: glm-5-2-mit-1m-context-open-weights
title: 'GLM-5.2: a 753B coding MoE with 1M context, MIT-licensed'
publishDate: 22-06-2026
kind: release
tags:
- oss
- inference
- long-context
- agents
- evaluation
summary: Z.ai shipped GLM-5.2, a 753B Mixture-of-Experts coding model with a 1M-token
  context and open weights under MIT, pairing IndexShare sparse attention with an
  improved MTP speculative-decoding layer.
sources:
- label: Hugging Face model card - zai-org/GLM-5.2
  url: https://huggingface.co/zai-org/GLM-5.2
  date: 13-06-2026
- label: Hugging Face config.json - zai-org/GLM-5.2
  url: https://huggingface.co/zai-org/GLM-5.2/blob/main/config.json
  date: 13-06-2026
- label: Z.AI Developer Docs - GLM-5.2 Overview
  url: https://docs.z.ai/guides/llm/glm-5.2
  date: 13-06-2026
- label: The Decoder - Zhipu's GLM-5.2 closes in on closed-source leaders
  url: https://the-decoder.com/zhipu-ais-glm-5-2-closes-in-on-closed-source-leaders-in-coding-marathons/
  date: 17-06-2026
- label: Simon Willison - GLM-5.2 is probably the most powerful text-only open weights
    LLM
  url: https://simonwillison.net/2026/jun/17/glm-52/
  date: 17-06-2026
- label: MarkTechPost - Z.ai Launches GLM-5.2 with usable 1M context, two thinking-effort
    levels
  url: https://www.marktechpost.com/2026/06/14/z-ai-launches-glm-5-2-with-a-usable-1m-token-context-two-thinking-effort-levels-and-no-benchmarks-at-launch/
  date: 14-06-2026
contentHash: sha256:47e2560f5d7e72d1
publishState: published
---

## What changed

On 13 June 2026, Zhipu/Z.ai announced GLM-5.2, a flagship coding-focused LLM available immediately across GLM Coding Plan tiers. The standalone API, Z.ai chatbot, and open weights followed the next week; as of 22 June 2026 the weights are live on Hugging Face (`zai-org/GLM-5.2` and the `GLM-5.2-FP8` variant) under the MIT license, with a ModelScope mirror. It is a roughly 753B-parameter Mixture-of-Experts model (with a reported ~40B active per token, per secondary sources) carrying a 1M-token context window (1,048,576) and 128K max output. Self-reported headline scores include Terminal-Bench 2.1 (Terminus-2) 81.0, SWE-bench Pro 62.1, FrontierSWE (Dominance) 74.4, AIME 2026 99.2, GPQA-Diamond 91.2, and HLE 40.5 (54.7 with tools).

## The schema

```json
{
  "architectures": ["GlmMoeDsaForCausalLM"],
  "model_type": "glm_moe_dsa",
  "num_hidden_layers": 78,
  "hidden_size": 6144,
  "num_attention_heads": 64,
  "num_key_value_heads": 64,
  "head_dim": 192,
  "n_routed_experts": 256,
  "num_experts_per_tok": 8,
  "n_shared_experts": 1,
  "moe_intermediate_size": 2048,
  "first_k_dense_replace": 3,
  "max_position_embeddings": 1048576,
  "index_topk": 2048,
  "index_topk_freq": 4,
  "rope_parameters": { "rope_theta": 8000000, "rope_type": "default" }
}
```

Two distinct mechanisms sit behind this config, and the sources conflate them. IndexShare is a sparse-attention scheme: the same indexer is reused across every four sparse-attention layers (`index_topk_freq: 4`), cutting per-token FLOPs by 2.9x at 1M context. Separately, an improved MTP layer drives speculative decoding, raising acceptance length by up to 20%. The `indexer_types` array marks periodic `full` layers (0, 6, 14, ...) among `shared` ones across the 78 layers.

## In practice

```python
from openai import OpenAI

client = OpenAI(
    base_url="https://api.z.ai/api/paas/v4",
    api_key="YOUR_ZAI_KEY",
)

resp = client.chat.completions.create(
    model="glm-5.2",            # 1M context, 128K max output
    messages=[
        {"role": "system", "content": "You are a coding agent."},
        {"role": "user", "content": "Refactor this 200k-token repo dump..."},
    ],
    stream=True,                # streaming, function calling, MCP, structured output supported
)
for chunk in resp:
    print(chunk.choices[0].delta.content or "", end="")
```

For local serving, the weights run on SGLang, vLLM, Transformers, and KTransformers; community GGUF quants (e.g. Unsloth) cover llama.cpp, Ollama, and LM Studio. The standard BF16 repo is ~1.51 TB; an FP8 variant is published, with a footprint of roughly half that (~756 GB at ~1 byte/parameter).

## Impact on your team

If you run long-horizon coding agents, GLM-5.2 is worth a real evaluation: an MIT license with no regional restrictions means you can self-host without legal review of usage limits, and the 1M context lets a single request hold a large repo dump instead of chunking. Weigh the hardware: ~1.51 TB at full precision or roughly half that in FP8 is a multi-GPU commitment, so most teams will start on the hosted `glm-5.2` API before deciding to bring it in-house.

> [!IMPORTANT]
> Treat the ~40B active-parameter figure as secondary: it is not stated in the model card or `config.json`. Size your serving budget from the 753B total and the FP8 footprint you can actually measure, not from the reported active count.
