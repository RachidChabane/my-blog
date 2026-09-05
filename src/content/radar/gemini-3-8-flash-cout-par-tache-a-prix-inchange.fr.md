---
translationKey: gemini-3-8-flash-cost-per-task-rose-at-unchanged-token-pricing
lang: fr
slug: gemini-3-8-flash-cout-par-tache-a-prix-inchange
title: Gemini 3.8 Flash coûte environ 40 % de plus par tâche à tarif par token inchangé
publishDate: 05-09-2026
kind: release
tags:
- Gemini
- Google
- Artificial Analysis
- agents
- inference
summary: Google DeepMind a publié Gemini 3.8 Flash le 2 septembre 2026 aux tarifs
  de Gemini 3.7 Flash, et Artificial Analysis le mesure à 0,58 $ par tâche, environ
  40 % au-dessus de son prédécesseur [s1][s2]. Le tarif qui porte ce coût est une
  remise annoncée jusqu'à la fin de l'année seulement [s1].
sources:
- label: Artificial Analysis independent evaluation of Gemini 3.8 Flash
  url: https://artificialanalysis.ai/articles/gemini-3-8-flash
  date: 02-09-2026
- label: The Register report on the Gemini 3.8 Flash release
  url: https://www.theregister.com/ai-and-ml/2026/09/02/with-gemini-38-flash-google-reminds-everyone-its-still-in-the-race/5294049
  date: 02-09-2026
contentHash: sha256:aa27d206889a622f
publishState: published
---

## Ce qui change

Google DeepMind a publié Gemini 3.8 Flash le 2 septembre 2026 aux mêmes tarifs que Gemini 3.7 Flash, qu'Artificial Analysis présente comme un prix remisé courant jusqu'à la fin de l'année [s1]. Le coût par tâche, lui, a bougé. Artificial Analysis le place sur sa frontière de Pareto Intelligence vs. Cost per Task à 0,58 $ par tâche, environ 40 % au-dessus de son prédécesseur, sous l'effet d'une hausse de 30 % des tokens de sortie moyens par tâche, portés à 48k, et de tours plus nombreux sur les évaluations agentiques [s1]. The Register rapporte la même hausse et cite Doshi et Popa : « 3.8 Flash works harder » [s2].

## Un comportement durable sur un tarif daté

Mettez les deux moitiés de cette ligne de prix face à face. La consommation supplémentaire de tokens est embarquée dans le modèle, et aucune des deux pages ne mentionne d'interrupteur pour la couper. Le seul levier évoqué est l'effort, et seulement en passant [s2]. Le tarif qui l'absorbe, en revanche, porte une date : Artificial Analysis enregistre 0,75 $ / 3,75 $ comme un prix remisé jusqu'à la fin de l'année [s1], sans dire ce qui vient ensuite.

| Gemini 3.8 Flash | valeur | face à 3.7 Flash |
| :--- | ---: | :--- |
| prix par 1M en entrée / sortie | 0,75 $ / 3,75 $ [s1] | inchangé, remisé jusqu'à fin d'année [s1] |
| tokens de sortie moyens par tâche | 48k [s1] | en hausse de 30 % [s1] |
| coût par tâche, Artificial Analysis | 0,58 $ [s1] | environ 40 % de plus [s1][s2] |

Les 0,58 $ ont donc été mesurés sous une remise dont la fin est annoncée [s1], et à mon sens le multiplicateur de tokens voyage avec l'identifiant du modèle.

> [!IMPORTANT]
> Ces 40 % viennent du jeu de tâches propre à Artificial Analysis [s1], pas de votre boucle. D'expérience, ils frappent le trafic long à appels d'outils et manquent l'essentiel des appels courts en un seul tour. Je lis 0,58 $ comme un ordre de grandeur à vérifier sur mes propres traces, car ce ratio varie plus d'un produit à l'autre que d'un modèle à l'autre.

## Impact pour une équipe

Deux dates comptent ici, et la sortie n'est que la première. Si le palier Flash est une ligne de votre budget 2027, le chiffre à réclamer est le tarif d'après remise : la remise court jusqu'à la fin de l'année [s1], et la hausse de 30 % des tokens [s1] ne s'arrête pas avec elle. Je ne traiterais pas non plus le changement d'identifiant de modèle comme neutre en prix : rien n'a bougé sur la page tarifaire, et le coût par tâche mesuré est supérieur d'environ 40 % [s1][s2]. Enregistrez dès maintenant les tokens de sortie par tâche sur votre trafic 3.7 Flash, pour distinguer le jour venu la diligence de 3.8 de la dérive de vos propres prompts. Puis répartissez les paliers selon que cette diligence vaut son prix : 3.8 Flash sur les longues exécutions à appels d'outils, 3.7 Flash sur les extractions et classifications courtes.
