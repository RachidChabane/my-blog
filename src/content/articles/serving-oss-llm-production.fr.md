---
# SEED, bootstrap corpus (task 7); replaced by the content pipeline (tasks 23-28). Safe to delete.
translationKey: serving-oss-llm-production-cost
lang: fr
slug: servir-llm-open-source-production
title: 'Servir un LLM open-source en production : le coût réel'
publishDate: '04-05-2026'
tags:
  - llm-oss
  - retrieval
difficulty: 3
sources:
  - label: 'vLLM, Documentation'
    url: 'https://docs.vllm.ai/en/latest/'
    date: '01-06-2024'
  - label: 'Hugging Face, Quantization overview'
    url: 'https://huggingface.co/docs/transformers/main/en/quantization/overview'
    date: '15-04-2024'
contentHash: 'seed-serving-oss-llm-production-cost-fr'
publishState: published
---

vLLM, batching continu, cache KV : où part vraiment la VRAM.

Les poids du modèle ne représentent qu'une partie de la facture mémoire. Au moment du
service, le cache KV grossit à chaque requête concurrente et à chaque token de
contexte ; c'est souvent lui, et non les paramètres, qui détermine le nombre
d'utilisateurs simultanés qu'un seul GPU peut servir.

> [!IMPORTANT]
> C'est souvent le cache KV, et non les paramètres, qui détermine le nombre
> d'utilisateurs simultanés qu'un seul GPU peut servir.

Le batching continu maintient le GPU pleinement occupé en admettant de nouvelles
requêtes au fur et à mesure que les anciennes s'achèvent, ce qui fait grimper le débit
bien au-delà d'un traitement séquentiel, requête par requête. Dimensionner un
déploiement revient à arbitrer entre le cache, la taille de lot et la longueur de
contexte, puis à mesurer les tokens par seconde sur un échantillon de requêtes
réaliste plutôt que sur un seul prompt.

> [!TIP]
> Mesurez les tokens par seconde sur un échantillon de requêtes réaliste plutôt que
> sur un seul prompt.
