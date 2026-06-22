---
translationKey: glm-5-2-mit-1m-coding-open-weight
lang: fr
slug: glm-5-2-mit-contexte-1m-poids-ouverts
title: 'GLM-5.2 : un MoE de codage 753B, contexte 1M, sous licence MIT'
publishDate: 22-06-2026
kind: release
tags:
- oss
- inference
- long-context
- agents
- evaluation
summary: Z.ai a livre GLM-5.2, un modele de codage Mixture-of-Experts de 753B avec
  un contexte d'1M de tokens et des poids ouverts sous MIT, associant l'attention
  parcimonieuse IndexShare a une couche MTP amelioree pour le decodage speculatif.
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
contentHash: sha256:b58ef8fbf179c2d8
publishState: published
---

## Ce qui change

Le 13 juin 2026, Zhipu/Z.ai a annonce GLM-5.2, un LLM phare oriente codage, disponible immediatement sur les paliers du GLM Coding Plan. L'API autonome, le chatbot Z.ai et les poids ouverts ont suivi la semaine suivante ; au 22 juin 2026, les poids sont en ligne sur Hugging Face (`zai-org/GLM-5.2` et la variante `GLM-5.2-FP8`) sous licence MIT, avec un miroir ModelScope. C'est un modele Mixture-of-Experts d'environ 753B parametres (avec ~40 Md actifs par token selon des sources secondaires) dote d'une fenetre de contexte d'1M de tokens (1 048 576) et d'une sortie maximale de 128K. Les scores en tete affiches par l'editeur : Terminal-Bench 2.1 (Terminus-2) 81.0, SWE-bench Pro 62.1, FrontierSWE (Dominance) 74.4, AIME 2026 99.2, GPQA-Diamond 91.2 et HLE 40.5 (54.7 avec outils).

## Le schéma

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

Deux mecanismes distincts se cachent derriere cette config, et les sources les confondent. IndexShare est un schema d'attention parcimonieuse : le meme indexeur est reutilise toutes les quatre couches d'attention parcimonieuse (`index_topk_freq: 4`), reduisant les FLOPs par token de 2,9x a un contexte d'1M. Separement, une couche MTP amelioree pilote le decodage speculatif et augmente la longueur d'acceptation jusqu'a 20 %. Le tableau `indexer_types` marque des couches `full` periodiques (0, 6, 14, ...) parmi les couches `shared`, sur les 78 couches.

## En pratique

```python
from openai import OpenAI

client = OpenAI(
    base_url="https://api.z.ai/api/paas/v4",
    api_key="VOTRE_CLE_ZAI",
)

resp = client.chat.completions.create(
    model="glm-5.2",            # contexte 1M, sortie max 128K
    messages=[
        {"role": "system", "content": "Tu es un agent de codage."},
        {"role": "user", "content": "Refactorise ce dump de depot de 200k tokens..."},
    ],
    stream=True,                # streaming, function calling, MCP, sortie structuree pris en charge
)
for chunk in resp:
    print(chunk.choices[0].delta.content or "", end="")
```

En local, les poids tournent sur SGLang, vLLM, Transformers et KTransformers ; des quantifications GGUF communautaires (par ex. Unsloth) couvrent llama.cpp, Ollama et LM Studio. Le depot standard BF16 pese ~1,51 To ; une variante FP8 est publiee, avec une empreinte d'environ la moitie (~756 Go a ~1 octet par parametre).

## Impact pour une équipe

Si vous exploitez des agents de codage a long horizon, GLM-5.2 merite une vraie evaluation : une licence MIT sans restriction regionale permet l'auto-hebergement sans revue juridique des limites d'usage, et le contexte d'1M laisse une seule requete contenir un gros dump de depot plutot que de le decouper. Pesez le materiel : ~1,51 To en pleine precision ou environ la moitie en FP8 est un engagement multi-GPU, donc la plupart des equipes commenceront sur l'API hebergee `glm-5.2` avant de decider de l'internaliser.

> [!IMPORTANT]
> Considerez le chiffre de ~40 Md de parametres actifs comme secondaire : il n'apparait ni dans la fiche du modele ni dans `config.json`. Dimensionnez votre budget de service a partir du total de 753B et de l'empreinte FP8 reellement mesurable, pas du nombre actif rapporte.
