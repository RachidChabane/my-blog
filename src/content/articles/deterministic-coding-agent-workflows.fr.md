---
# SEED, bootstrap corpus (task 7); replaced by the content pipeline (tasks 23-28). Safe to delete.
translationKey: deterministic-agent-workflows
lang: fr
slug: orchestrer-agents-code-deterministes
title: 'Orchestrer des agents de code avec des workflows déterministes'
publishDate: '30-05-2026'
tags:
  - agents
  - agentic-coding
difficulty: 2
sources:
  - label: 'Anthropic, Building effective agents'
    url: 'https://www.anthropic.com/research/building-effective-agents'
    date: '12-12-2024'
  - label: 'arXiv, ReAct: Synergizing Reasoning and Acting'
    url: 'https://arxiv.org/abs/2210.03629'
    date: '06-10-2022'
contentHash: 'seed-deterministic-agent-workflows-fr'
publishState: published
---

Découper une tâche d'ingénierie en étapes vérifiables, et laisser l'agent échouer tôt plutôt que tard.

Un workflow déterministe nomme chaque étape, ses entrées et une vérification qui doit passer avant de lancer la suivante. L'agent assure toujours le travail créatif, mais c'est le harnais, pas le modèle, qui décide si une étape a réussi : un écart de trajectoire est détecté au point de contrôle plutôt que trois étapes plus loin.

> [!IMPORTANT]
> C'est le harnais, pas le modèle, qui décide si une étape a réussi : ainsi un écart de trajectoire est détecté au point de contrôle plutôt que trois étapes plus loin.

Le gain, c'est la facilité de débogage : chaque exécution laisse une trace auditable de la vérification qui a échoué, et de la raison. Les relances reprennent à la dernière étape au vert plutôt que de tout réexécuter, ce qui maintient le coût des tâches longues sous contrôle et rend les comportements instables (flaky) reproductibles.

> [!TIP]
> Faites reprendre les relances à la dernière étape au vert plutôt que de tout réexécuter : cela maîtrise le coût des tâches longues et rend les comportements instables reproductibles.
