---
# SEED, bootstrap corpus (task 7); replaced by the content pipeline (tasks 23-28). Safe to delete.
translationKey: publication-guardrails-factcheck
lang: fr
slug: garde-fous-publication-fact-checking
title: 'Garde-fous de publication : un pipeline de fact-checking automatisé'
publishDate: '23-05-2026'
tags:
  - evaluation
  - qualite
difficulty: 2
sources:
  - label: 'Anthropic, Building effective agents'
    url: 'https://www.anthropic.com/research/building-effective-agents'
    date: '12-12-2024'
  - label: 'arXiv, ReAct: Synergizing Reasoning and Acting'
    url: 'https://arxiv.org/abs/2210.03629'
    date: '06-10-2022'
contentHash: 'seed-publication-guardrails-factcheck-fr'
publishState: published
---

Avant de publier, l’agent doit prouver ce qu’il avance, sources à l’appui.

Un garde-fou de publication traite chaque phrase factuelle comme une affirmation qui
exige une citation. Le pipeline extrait les affirmations, récupère des sources
candidates et refuse de publier tant que chaque affirmation ne pointe pas vers un
passage qui la soutient réellement, pas seulement une page qui évoque le sujet.

Lier le contrôle à la preuve plutôt qu’au ton, c’est ce qui le rend fiable. Un
brouillon bien tourné mais sans citation est retenu, et le rapport d’échec désigne la
phrase non étayée : la correction est ciblée plutôt qu’une réécriture complète.
