---
# SEED — bootstrap corpus (task 7); replaced by the content pipeline (tasks 23-28). Safe to delete.
translationKey: context-token-budget-latency
lang: fr
slug: contexte-budget-tokens-latence
title: 'Le contexte n’est pas gratuit : budget de tokens et latence'
publishDate: '15-05-2026'
tags:
  - agents
  - evaluation
sources:
  - label: 'Anthropic — Building effective agents'
    url: 'https://www.anthropic.com/research/building-effective-agents'
    date: '12-12-2024'
  - label: 'arXiv — ReAct: Synergizing Reasoning and Acting'
    url: 'https://arxiv.org/abs/2210.03629'
    date: '06-10-2022'
contentHash: 'seed-context-token-budget-latency-fr'
publishState: published
---

Chaque token de contexte est un arbitrage entre rappel, coût et délai.

Il est tentant d’injecter tout le dépôt dans le prompt, mais chaque token
supplémentaire augmente la latence et la facture tout en diluant l’attention. Une
fenêtre plus large n’améliore le rappel que jusqu’au point où le passage pertinent
reste facile à trouver dans le bruit.

Un budget de tokens force la bonne question : de quoi le modèle a-t-il vraiment
besoin pour répondre à ce tour ? Récupérer les quelques passages utiles, résumer le
reste, et dépenser les tokens économisés sur la sortie — souvent un meilleur
compromis qu’un prompt plus long, plus lent et plus cher.
