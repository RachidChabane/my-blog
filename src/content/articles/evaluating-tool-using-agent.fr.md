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

Un agent qui mène la tâche à bien mais corrompt l’état n’a rien réussi du tout.

Le taux de réussite, pris isolément, masque justement les échecs qui pèsent le plus en production. Un agent peut renvoyer la bonne réponse tout en supprimant un fichier, en laissant une migration à moitié appliquée ou en consommant dix fois plus de tokens que nécessaire : un score binaire réussite/échec y verra pourtant une réussite.

Une évaluation digne de ce nom note la trajectoire, et pas seulement la destination : l’agent a-t-il contenu ses effets de bord, su récupérer après un appel d’outil échoué et respecté son budget ?

> [!IMPORTANT]
> Notez la trajectoire, et pas seulement la destination. Un score binaire réussite/échec
> qui fait abstraction du chemin parcouru verra une réussite dans une exécution où l’agent
> a pourtant corrompu l’état pour y parvenir.

À chaque échec de production que le score binaire passe sous silence correspond un contrôle de trajectoire qui aurait dû être effectué :

| Échec masqué par le taux de réussite | Contrôle de trajectoire |
| --- | :--: |
| Supprimer un fichier | Effets de bord contenus |
| Laisser une migration à moitié appliquée | Récupération après un appel d’outil échoué |
| Consommer dix fois plus de tokens que nécessaire | Budget respecté |

Journaliser chaque étape rend ces contrôles possibles et transforme une régression floue en un problème précis et réparable.
