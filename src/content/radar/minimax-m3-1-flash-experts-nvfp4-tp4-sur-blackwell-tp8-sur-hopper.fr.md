---
translationKey: minimax-m3-1-flash-nvfp4-experts-blackwell-tp4-hopper-tp8
lang: fr
slug: minimax-m3-1-flash-experts-nvfp4-tp4-sur-blackwell-tp8-sur-hopper
title: MiniMax M3.1 Flash stocke ses experts en NVFP4, et vLLM et SGLang le servent
  en TP4 sur Blackwell ou sur un nœud Hopper complet en TP8
publishDate: 26-10-2026
kind: release
tags:
- MiniMax
- vLLM
- SGLang
- inference
summary: 'Le commit initial des poids de MiniMax M3.1 Flash sur Hugging Face est horodaté
  du 23 octobre 2026. Selon la fiche du modèle, les experts MoE routés sont quantifiés
  pendant l''entraînement, et vLLM indique qu''ils sont stockés en NVFP4. Les recettes
  de vLLM et de SGLang le servent en TP4 sur Blackwell et en TP8 sur Hopper, où les
  experts passent par Marlin et où DSpark n''est pas disponible. Ma recommandation
  : sur Hopper, prévoyez un nœud complet par réplica, mesurez sans décodage spéculatif
  et ne requantifiez pas les experts.'
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
contentHash: sha256:d24f152b47e5b8ab
publishState: published
---

## Ce qui change

Selon Let's Data Science, MiniMax a lancé M3.1 Flash le 19 octobre 2026 sur son API, en annonçant les poids pour plus tard [s1]. Sur Hugging Face, le commit initial des poids par MiniMax est horodaté du 23 octobre 2026 [s2]. La fiche du modèle indique que les experts MoE routés et les chemins d'attention sont quantifiés pendant l'entraînement [s3], et `config.json` fixe `moe_quant_algo` à `NVFP4` [s4]. vLLM et SGLang publient tous deux des recettes de déploiement, et elles divergent selon la génération de GPU [s5][s6].

## La précision est dans les poids

À mon avis, ce qui compte, c'est la précision que MiniMax a intégrée aux poids dès l'entraînement : elle fait entrer la génération de GPU dans le choix du modèle. Selon vLLM, les experts NVFP4 font passer le checkpoint de 451.5 GB (MiniMax-M3-MXFP8) à 250.1 GB [s7], et sa recette décrit des couches denses en MXFP8 et des experts en NVFP4 [s5]. Voici les trois champs de quantification de la configuration [s4] :

```text
"quant_method": "mxfp8",
"moe_quant_algo": "NVFP4",
"moe_quant_format": "nvfp4-pack-quantized"
```

Selon moi, un script d'inventaire qui ne lit que `quant_method` classera ce checkpoint en MXFP8 et ratera les experts.

## Mêmes poids, deux chemins de déploiement

vLLM cite GB200, GB300, B200 ou B300 pour Blackwell et H100 ou H200 pour Hopper [s5] ; les recettes vérifiées de SGLang font tourner B300 en `--tp 4` et H200 en `--tp 8` [s6].

| | Blackwell | Hopper |
| --- | --- | --- |
| Parallélisme de tenseurs | TP4 (vLLM, SGLang) [s5][s6] | TP8 sur un nœud complet (vLLM, SGLang) [s5][s6] |
| Experts NVFP4 | natifs sur les cœurs tensoriels FP4 (vLLM) [s5] | noyau MoE Marlin (vLLM) [s5], Marlin W4A16 (SGLang) [s6] |
| Décodage spéculatif DSpark | SGLang exige Blackwell pour le DSpark NVFP4 [s6] | non activé (vLLM) [s5], rejeté à la résolution des arguments (SGLang) [s6] |

> [!CONFIRMED]
> Selon la recette de vLLM, Hopper n'a pas de cœurs tensoriels FP4, et les experts NVFP4 y tournent sur le noyau MoE Marlin [s5].

> [!INFERRED]
> Ma lecture : pour ce checkpoint, Blackwell est la cible native et Hopper un chemin de compatibilité.

## L'objection la plus solide

Les limites sur Hopper ressemblent à des réglages. Les recettes H200 de SGLang fixent `--context-length 140000` [s6], et la fiche du modèle précise que la longueur de contexte utilisable dépend de la mémoire GPU et de la configuration de déploiement [s3]. Sur la longueur de contexte, je suis d'accord. À mon sens, un contexte plus long laisse en place le nœud TP8 et l'absence de DSpark, car les deux moteurs imposent ce comportement sur Hopper [s5][s6].

## Impact pour une équipe

Ma recommandation : sur un parc Hopper, prévoyez un nœud complet en TP8 par réplica et mesurez-le sans décodage spéculatif, puisque c'est ainsi que les deux moteurs le font tourner [s5][s6]. Sur Blackwell, partez de la recette TP4. Si vous comptiez requantifier les experts pour Hopper, je m'en abstiendrais : la fiche du modèle indique que ses résultats valent pour les poids officiels et que des quantifications tierces peuvent différer [s3]. Et indexez l'inventaire de votre parc sur `moe_quant_algo`.
