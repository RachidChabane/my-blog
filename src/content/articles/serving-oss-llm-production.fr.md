---
# SEED — bootstrap corpus (task 7); replaced by the content pipeline (tasks 23-28). Safe to delete.
translationKey: serving-oss-llm-production-cost
lang: fr
slug: servir-llm-open-source-production
title: 'Servir un LLM open-source en production : le coût réel'
publishDate: '04-05-2026'
tags:
  - llm-oss
  - retrieval
sources:
  - label: 'vLLM — Documentation'
    url: 'https://docs.vllm.ai/en/latest/'
    date: '01-06-2024'
  - label: 'Hugging Face — Quantization overview'
    url: 'https://huggingface.co/docs/transformers/main/en/quantization/overview'
    date: '15-04-2024'
contentHash: 'seed-serving-oss-llm-production-cost-fr'
publishState: published
---

vLLM, batching continu, KV-cache : où part vraiment la VRAM.

Les poids du modèle ne sont qu’une partie de la facture mémoire. Au moment du
service, le cache clé-valeur grandit avec chaque requête simultanée et chaque token
de contexte : c’est souvent lui — pas les paramètres — qui décide du nombre
d’utilisateurs qu’un seul GPU peut tenir.

Le batching continu garde le matériel occupé en admettant de nouvelles requêtes à
mesure que les anciennes se terminent, ce qui élève le débit bien au-dessus d’un
service naïf requête par requête. Dimensionner un déploiement, c’est arbitrer le
cache contre la taille de lot et la longueur de contexte, puis mesurer les tokens par
seconde sous une charge réaliste.
