---
# SEED, bootstrap corpus (task 7); replaced by the content pipeline (tasks 23-28). Safe to delete.
translationKey: evaluating-tool-using-agents
lang: fr
slug: evaluer-agent-outille
title: 'Évaluer un agent outillé : au-delà du taux de réussite'
publishDate: '12-05-2026'
tags:
  - agents
  - evaluation
difficulty: 2
sources:
  - label: 'Anthropic, Building effective agents'
    url: 'https://www.anthropic.com/research/building-effective-agents'
    date: '12-12-2024'
  - label: 'arXiv, ReAct: Synergizing Reasoning and Acting'
    url: 'https://arxiv.org/abs/2210.03629'
    date: '06-10-2022'
contentHash: 'seed-evaluating-tool-using-agents-fr'
publishState: published
---

Un agent qui réussit la tâche mais saccage l’état n’a pas réussi.

Le taux de réussite seul masque les échecs qui comptent le plus en production. Un
agent peut renvoyer la bonne réponse tout en supprimant un fichier, en laissant une
migration à moitié appliquée ou en brûlant dix fois les tokens nécessaires, et un
score binaire réussite/échec appellera cela une victoire.

Une évaluation utile note la trajectoire, pas seulement la destination : a-t-il
respecté les limites d’effets de bord, récupéré après un appel d’outil raté et tenu
son budget ?

> [!IMPORTANT]
> Notez la trajectoire, pas seulement la destination. Un score binaire réussite/échec
> qui ignore le chemin appellera une exécution une victoire même si l’agent a saccagé
> l’état pour y parvenir.

Chaque échec en production que le score binaire masque correspond à un contrôle de
trajectoire qu’il aurait dû effectuer à la place :

| Échec masqué par le taux de réussite | Contrôle de trajectoire |
| --- | :--: |
| Supprimer un fichier | Limites d’effets de bord respectées |
| Laisser une migration à moitié appliquée | Récupération après un appel d’outil raté |
| Brûler dix fois les tokens nécessaires | Budget tenu |

Journaliser chaque étape rend ces contrôles possibles et transforme une régression
floue en une régression précise et corrigeable.
