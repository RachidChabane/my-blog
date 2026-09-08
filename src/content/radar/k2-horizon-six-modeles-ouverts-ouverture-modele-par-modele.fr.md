---
translationKey: k2-horizon-six-model-fleet-and-per-model-open-artifacts
lang: fr
slug: k2-horizon-six-modeles-ouverts-ouverture-modele-par-modele
title: K2 Horizon publie six modèles ouverts de 0,9 à 375 milliards de paramètres,
  et l'ouverture arrive modèle par modèle
publishDate: 08-09-2026
kind: release
tags:
- IFM
- MBZUAI
- K2 Horizon
- open weights
- agents
summary: 'L''Institute of Foundation Models de MBZUAI a lancé K2 Horizon le 3 septembre
  2026, six modèles de 0,9 à 375 milliards de paramètres, et l''annonce affirme que
  chacun est publié entièrement ouvert [s1]. Une lecture des cartes de modèles publiées
  nuance : les 3.7B et 7B sortent avec données, recette et code, tandis que les cartes
  des 375B-A23B et 36B-A4B annoncent ces artefacts comme à venir [s2].'
sources:
- label: Institute of Foundation Models launch announcement
  url: https://mbzuai.ac.ae/news/mbzuais-institute-of-foundation-models-launches-k2-horizon-the-worlds-largest-fully-open-ai-models-in-history/
  date: 03-09-2026
- label: CellCog reading of the published model cards
  url: https://cellcog.ai/blog/k2-horizon/
  date: 04-09-2026
- label: Moor Insights and Strategy analyst account
  url: https://moorinsightsstrategy.com/mbzuai-ifm-launches-6-k2-horizon-frontier-models-doubles-down-on-openness-analyst-insight/
  date: 03-09-2026
contentHash: sha256:0c4deeae7480064d
publishState: published
---

## Ce qui change

L'Institute of Foundation Models de MBZUAI a lancé K2 Horizon le 3 septembre 2026 : six modèles de 0,9 à 375 milliards de paramètres partageant une même architecture [s1]. L'annonce affirme que chaque modèle est publié entièrement ouvert, poids, code, données d'entraînement et méthodologie compris, et la présente comme la plus grande publication de ce type de l'histoire de l'IA [s1]. CellCog relève la licence Apache 2.0 sur les poids et le code, et la prise en charge dès le premier jour dans vLLM, SGLang et Ollama [s2].

## L'ouverture, modèle par modèle

La promesse est vérifiable, et quelqu'un l'a vérifiée. CellCog a lu les cartes de modèles publiées et constate que le titre au niveau de la flotte ne tient pas modèle par modèle [s2] :

| modèle | ce que dit sa carte aujourd'hui [s2] |
| --- | --- |
| 3.7B et 7B | données, recette et code disponibles |
| 32B | un checkpoint Stage 1, le définitif restant à venir |
| 36B-A4B et 375B-A23B | checkpoints intermédiaires, données et code d'entraînement à venir |

Cette lecture couvre cinq des six modèles [s2]. J'y vois l'inverse d'une promesse trahie : les cartes publient elles-mêmes le calendrier de ce qui manque, donc le manque est déclaré et non découvert. Moor Insights nomme l'artefact qui compte : un arbre de développement par modèle, checkpoints intermédiaires et branches de post-entraînement, qui montre comment le modèle de base devient les variantes de raisonnement et agentiques [s3]. Cet arbre, les deux plus gros modèles vous le doivent encore.

> [!IMPORTANT]
> Les scores de l'Openness Index au dossier concernent la publication précédente d'IFM, pas K2 Horizon : l'analyste les a vérifiés la veille du lancement, et quatre des cinq modèles notés 89, le meilleur score, étaient des modèles de MBZUAI IFM [s3]. Ne le reportez pas sur la nouvelle flotte. La formule de Liu dans le même article donne la règle : l'ouverture n'est pas un slogan à accepter, c'est une liste à vérifier [s3].

## Impact pour une équipe

Décidez quel bout de la flotte vous achetez. Si vous voulez un modèle que vous pouvez rejouer, les 3.7B et 7B sont les deux seuls dont les données, la recette et le code sont disponibles [s2] : un vrai palier embarqué, et c'est petit. Si vous visez le 375B-A23B ou le 36B-A4B, vous prenez des poids sous Apache 2.0 [s2] plus une intention publiée, ce qui vaut mieux que la plupart des sorties en poids ouverts sans être de la reproductibilité. Gardez la mention entièrement ouvert hors de tout document d'achat tant que les checkpoints ne sont pas arrivés.

L'échéance n'est pas celle d'IFM, c'est la vôtre : fixez une date pour relire les cartes du 375B-A23B et du 32B, car personne ne vous préviendra quand un checkpoint Stage 1 deviendra définitif [s2]. La prise en charge dès le premier jour [s2] fait tenir l'évaluation en une après-midi : faites tourner le 7B contre le modèle ouvert que vous servez déjà.
