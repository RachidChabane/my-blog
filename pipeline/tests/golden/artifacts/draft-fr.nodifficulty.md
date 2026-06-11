---
lang: fr
translationKey: agentic-coding-harness-eval
slug: evaluer-harnais-codage-agentique
title: Évaluer les harnais de codage agentique
category: explainers
tags:
  - agentic
  - evaluation
---

Les harnais de codage agentique exécutent des boucles d'outils sur une suite de tâches
[s1]. Cet article montre, de façon concrète, comment on les évalue.

## La boucle d'outils

D'après la source, un harnais enchaîne appels d'outils et vérifications à chaque étape
[s1]. Le mécanisme compte davantage que le modèle.

---

## Mesurer la réussite

Les benchmarks mesurent le taux de réussite sur des tâches multi-étapes [s2]. Le chiffre
à suivre est l'achèvement de la tâche de bout en bout.
