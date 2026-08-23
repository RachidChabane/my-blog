---
translationKey: mlperf-client-2-0-tool-time-inside-the-score
lang: fr
slug: mlperf-client-2-0-le-temps-des-outils-dans-le-score
title: MLPerf Client 2.0 fait entrer le temps d'exécution des outils dans le score
  agentique, et retire Phi 3.5 de la base
publishDate: 23-08-2026
kind: release
tags:
- MLPerf
- MLCommons
- benchmark
- agents
summary: MLCommons a publié MLPerf Client v2.0 le 18 août 2026, avec une catégorie
  agentique dont les tests chronomètrent l'exécution des outils en même temps que
  l'inférence LLM [s1]. Le changement qui compte, à mon sens, tient à ce qu'un score
  agentique mesure la pile locale entière plutôt que le modèle seul.
sources:
- label: MLCommons, MLPerf Client v2.0 release notes
  url: https://github.com/mlcommons/mlperf_client/releases/tag/v2.0
  date: 18-08-2026
- label: Tom's Hardware, on the MLPerf Client 1.0 model lineup
  url: https://www.tomshardware.com/software/mlperf-client-1-0-ai-benchmark-released-new-testing-toolkit-sports-a-gui-covers-more-models-and-tasks-and-supports-more-hardware-acceleration-paths
  date: 01-08-2025
contentHash: sha256:ca5029d6b86d94af
publishState: published
---

## Ce qui change

MLCommons a publié MLPerf Client v2.0 le 18 août 2026, avec une catégorie Agentic AI Benchmarking dont les tâches Software Engineering (SWE) et Data Analyst sont mesurées de bout en bout, temps d'exécution des outils compris [s1]. La liste des modèles bouge aussi, et le tableau ci-dessous en donne le détail [s1]. Une catégorie dédiée à l'image arrive, avec Flux 2 Klein 4B en expérimental [s1].

## Ce que le score contient désormais

La frontière de la mesure quitte le modèle pour englober toute la pile locale. Les tests agentiques chronomètrent l'exécution des outils en même temps que l'inférence, si bien que le score appartient à la machine et à tout ce qui fait tourner les tâches SWE et Data Analyst [s1]. Or les notes nomment ces deux familles de tâches sans nommer ni le harnais d'agent ni les outils qui les exécutent [s1]. Un an plus tôt, l'article sur la 1.0 citait Llama 2 7B Chat et Phi 3.5 Mini Instruct parmi les modèles testés [s2] ; la v2.0 retire Phi 3.5 et fait passer Phi 4 Reasoning 14B dans la catégorie étendue [s1].

| Modèle | Nommé dans l'article sur la 1.0, un an plus tôt [s2] | Statut en v2.0 [s1] |
| --- | --- | --- |
| Llama 3.1 8B Instruct | testé | base obligatoire |
| Phi 3.5 Mini Instruct | testé | retiré |
| Phi 4 Reasoning 14B | expérimental | déplacé vers la catégorie étendue |
| Llama 2 7B Chat | testé | non nommé dans les notes v2.0 |
| Phi 4 Mini Instruct | absent des modèles que cet article nomme | base obligatoire |
| Qwen 3 8B | absent des modèles que cet article nomme | test expérimental |

> [!IMPORTANT]
> Les tests agentiques chronomètrent l'exécution des outils en même temps que l'inférence LLM [s1].
> Une machine dotée du meilleur accélérateur peut donc afficher le moins bon score agentique si la couche d'outils autour d'elle est plus lente. C'est là le piège, je pense.

## Impact pour une équipe

Cela vise quiconque achète, publie ou chronomètre des chiffres d'AI PC. Reprenez une base de référence sur la v2.0 au lieu de comparer avec une archive v1.x : Phi 3.5 a disparu du socle obligatoire [s1], et la liste que cet article documentait [s2] n'est pas celle de la v2.0 [s1]. Quand un fournisseur avance un score agentique, exigez la famille de tâches et la couche d'outils qui va avec avant de comparer deux machines [s1]. Refaites le test vous-même ou ce n'est pas votre chiffre.
