---
translationKey: diffusiongemma-26b-a4b-text-diffusion
lang: fr
slug: diffusiongemma-modele-diffusion-texte-ouvert
title: 'DiffusionGemma 26B-A4B : le premier modèle ouvert de Google à diffusion de
  texte'
publishDate: 23-06-2026
kind: release
tags:
- open-weight
- llm-release
- text-diffusion
- inference
- long-context
summary: 'Le 2026-06-10, Google DeepMind a publié DiffusionGemma 26B-A4B, un MoE à
  poids ouverts (25,2 G au total / 3,8 G actifs) bâti sur le squelette Gemma 4, qui
  troque le décodage autoregressif contre une diffusion de texte discrète : il débruite
  en parallèle un canevas de 256 tokens à plus de 1000 tokens/s sur un seul H100.
  La vitesse se paie en qualité : 77,6 % sur MMLU Pro contre 82,6 % pour Gemma 4.
  Le tout sous licence Apache 2.0.'
sources:
- label: Google Hugging Face model card - google/diffusiongemma-26B-A4B-it
  url: https://huggingface.co/google/diffusiongemma-26B-A4B-it
  date: 10-06-2026
- label: MarkTechPost - independent coverage of DiffusionGemma
  url: https://www.marktechpost.com/2026/06/10/google-ai-releases-diffusiongemma-a-26b-moe-open-model-using-text-diffusion-for-up-to-4x-faster-generation/
  date: 10-06-2026
contentHash: sha256:4e13b24f0d5ccd35
publishState: published
---

## Ce qui change

Ce qui bouge ici, c'est le modèle de service, pas seulement une ligne de benchmark. Le 2026-06-10, Google DeepMind a publié DiffusionGemma 26B-A4B (`google/diffusiongemma-26B-A4B-it`), un MoE à poids ouverts de 25,2 milliards de paramètres au total et 3,8 milliards actifs, bâti sur le squelette Gemma 4, qui abandonne le décodage autoregressif au profit d'une diffusion de texte discrète. Le débit ne tient plus à l'émission des tokens de gauche à droite ; il tient au nombre d'étapes de débruitage et au nombre de tokens validés à chaque passe avant.

## Le compromis vitesse-qualité

DiffusionGemma débruite en parallèle un canevas de 256 tokens et fige environ 15 à 20 tokens par passe avant : c'est de là que vient la vitesse. La facture, elle, tombe sur la qualité.

| Dimension | DiffusionGemma 26B-A4B | Gemma 4 26B-A4B |
| :--- | :--- | ---: |
| Décodage | diffusion de texte discrète (canevas parallèle) | autoregressif |
| MMLU Pro | 77,6 % | 82,6 % |
| GPQA Diamond | 73,2 % | (non précisé) |
| Débit (H100, FP8) | 1100+ tok/s | (référence autoregressive) |
| Contexte | 256K tokens | - |
| Licence | Apache 2.0 | - |

Le chiffre de débit provient de deux sources qui divergent sur le plancher : la fiche du modèle annonce plus de 1100 tokens par seconde sur un H100 en FP8, alors que l'article indépendant de MarkTechPost relève 1000+ tokens par seconde sur un seul H100 et 700+ sur une RTX 5090. Dans les deux cas, on est à peu près dans le régime où un seul accélérateur sert ce qu'une configuration autoregressive multi-GPU servirait.

> [!IMPORTANT]
> C'est de la qualité échangée contre de la vitesse, pas un gain gratuit : 77,6 % sur MMLU Pro contre 82,6 % pour Gemma 4, soit cinq points perdus bien réels. La fiche parle de "block-autoregressive multi-canvas sampling" : le procédé n'est donc pas entièrement non séquentiel, la parallélisation se joue au niveau du bloc. Et la fiche liste Text et Image en entrée, texte en sortie uniquement ; n'anticipez aucune modalité vidéo, malgré ce qu'avancent certains agrégateurs.

## Impact pour une équipe

Si vous exploitez de l'inférence sensible à la latence ou à fort débit, le modèle mérite une évaluation cette semaine. L'arbitrage est net : 1000+ tokens par seconde sur un seul H100 contre une baisse d'environ cinq points sur MMLU Pro. Mesurez-le sur votre propre charge sensible à la latence, derrière le même harnais, avant de remplacer quoi que ce soit ; un écart de classement reflète rarement ce que voit votre trafic réel. La licence Apache 2.0 dispense de toute revue juridique sur les limites d'usage, et vous pouvez l'héberger vous-même sur un seul H100, ou sur une RTX 5090 à 700+ tokens par seconde pour un budget plus serré. C'est une sortie, pas une dépréciation : aucune échéance, donc traitez-la comme une expérimentation, pas comme une migration.
