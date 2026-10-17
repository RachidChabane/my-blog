---
translationKey: beam-dflash2-drafter-low-latency-recipe-disabled-for-high-throughput
lang: fr
slug: reflection-beam-drafter-dflash2-sglang-vllm-reglage-par-deploiement
title: Beam, de Reflection, arrive avec un drafter spéculatif DFlash2, et la recette
  High-Throughput de SGLang le désactive
publishDate: 17-10-2026
kind: release
tags:
- Reflection
- Beam
- vLLM
- SGLang
- inference
summary: 'Reflection a publié Beam le 16 octobre 2026, avec un drafter de décodage
  spéculatif DFlash2 qui contrôle 7 tokens proposés par étape de vérification à la
  taille de bloc recommandée de 8. La recette Low-Latency de SGLang utilise le drafter
  et sa recette High-Throughput le désactive ; selon vLLM, il accélère surtout le
  décodage à faible concurrence et ajoute environ 1.7 GB par GPU, ce qui réduit la
  capacité du cache KV. Ma recommandation : le drafter pour les agents de code interactifs,
  sans lui pour les flottes par lots, et une mesure des deux configurations sur vos
  propres traces avant de trancher.'
sources:
- label: Reflection, "Beam is now available"
  url: https://reflection.ai/blog/beam-is-available
  date: 16-10-2026
- label: AlphaSignal, "Reflection AI Drops Beam, a 501B Open-Weight Agent Model for
    Coding"
  url: https://alphasignal.ai/news/reflection-ai-drops-beam-a-501b-open-weight-agent-model-for-coding
  date: 16-10-2026
- label: Hugging Face, reflection/Beam-1.0-501B-A23B-DFlash2 model card
  url: https://huggingface.co/reflection/Beam-1.0-501B-A23B-DFlash2
  date: 16-10-2026
- label: SGLang Cookbook, "Reflection Beam 1.0"
  url: https://docs.sglang.io/cookbook/autoregressive/Reflection/Beam-1_0
  date: 16-10-2026
- label: vLLM Recipes, "reflection/Beam-1.0-501B-A23B"
  url: https://recipes.vllm.ai/reflection/Beam-1.0-501B-A23B?features=reasoning%2Ctool_calling%2Cspec_decoding
  date: 16-10-2026
contentHash: sha256:a486b36123d323f2
publishState: published
---

## Ce qui change

Reflection a publié Beam le 16 octobre 2026 [s1]. Les poids sont livrés en BF16, FP8 et NVFP4, avec un drafter de décodage spéculatif [s2]. Ce drafter, `reflection/Beam-1.0-501B-A23B-DFlash2`, tourne à côté de Beam, qui vérifie chaque token proposé [s3]. Avec la taille de bloc recommandée en service, 8, chaque étape de vérification contrôle 7 tokens proposés [s3].

## Un réglage par déploiement

Je pense que le drafter se règle déploiement par déploiement, et les recettes des moteurs disent déjà dans quel sens. Le cookbook de SGLang l'utilise dans la recette Low-Latency, avec une taille de bloc de 8, et le désactive dans la recette High-Throughput [s4]. La recette de vLLM recommande 7 tokens spéculatifs et indique que le drafter accélère surtout le décodage à faible concurrence et ajoute environ 1.7 GB par GPU, ce qui réduit la capacité du cache KV [s5]. Voici les flags du drafter dans la recette Low-Latency de SGLang [s4] :

```text
--speculative-algorithm DFLASH
--speculative-draft-model-path reflection/Beam-1.0-501B-A23B-DFlash2
--speculative-dflash-block-size 8
```

> [!CONFIRMED]
> Sur les traces de code agentique DeepSWE de Reflection, la longueur d'acceptation moyenne vaut 5.72 tokens par étape de vérification pour les prompts de 0 à 2k tokens, et se situe entre 4.22 et 4.58 dans chaque tranche de 16k à 128k [s3].

> [!INFERRED]
> Selon ma lecture, les longues sessions de code sont prises en étau : elles ont besoin de la place que le drafter retire au cache KV, et ces tranches obtiennent moins de tokens par étape que les prompts courts.

## L'objection la plus solide

La recette de vLLM offre un contrepoids : avec `enable_adaptive_verification`, vLLM ne vérifie que les tokens proposés qui valent le calcul, ce qui augmente le débit sous charge [s5]. Je l'admets, le choix par défaut de SGLang ne prouve rien sur le drafter sous charge. Ma réponse est de mesurer, et vLLM nomme le piège : l'acceptation dépend d'une entrée en langage naturel, donc il faut mesurer avec un jeu de données de texte réel au lieu de `--dataset-name random` [s5].

## Impact pour une équipe

Ma recommandation : servez un agent de code interactif, avec peu de sessions simultanées, sur la recette Low-Latency avec le drafter, et faites tourner l'évaluation par lots et les flottes d'agents hors ligne sans lui. Si vous gardez le drafter, dimensionnez le cache KV en comptant environ 1.7 GB par GPU déjà pris [s5]. Rejouez vos propres traces d'agents dans les deux configurations avant de choisir, car Reflection a mesuré en NVFP4 avec un parallélisme de tenseurs de 4 sur des GPU B300 [s3]. Côté vLLM, Beam tourne sur l'image `vllm/vllm-openai:reflection-beam`, car le support n'est pas encore sorti dans une version de vLLM [s5] ; considérez cette image comme provisoire et attendez une version publiée avant de la figer en production.
