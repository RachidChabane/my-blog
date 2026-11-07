---
translationKey: inkling-2-small-terminal-bench-4-row-and-tinker-context-rows
lang: fr
slug: inkling-2-small-terminal-bench-4-ligne-et-lignes-de-contexte-tinker
title: Inkling 2 Small sort sur Tinker avec des poids fermés, et Artificial Analysis
  le mesure à 13% sur Terminal-Bench 4.0 contre 30% pour Claude Sonnet 5.5 (medium)
publishDate: 07-11-2026
kind: release
tags:
- Inkling
- Thinking Machines
- Tinker
- agents
- evals
summary: 'Thinking Machines Lab a sorti Inkling 2 Small sur Tinker avec des poids
  fermés, et son annonce prévoit les poids sous Apache 2.0 la semaine prochaine. Artificial
  Analysis le mesure à 25% sur FrontierCode 2.0 contre 11% pour Claude Sonnet 5.5
  (medium), mais à 13% sur Terminal-Bench 4.0 contre 30%. Ma recommandation : prenez-le
  pour générer du code et pour le fine-tuning, et gardez votre agent de terminal sur
  son modèle actuel.'
sources:
- label: Thinking Machines Lab, Inkling 2 Small announcement
  url: https://thinkingmachines.ai/news/inkling-2-small/
  date: 05-11-2026
- label: Thinking Machines Lab, Inkling 2 Small model card
  url: https://thinkingmachines.ai/model-card/inkling-2-small/
  date: 05-11-2026
- label: Artificial Analysis, Inkling 2 Small article
  url: https://artificialanalysis.ai/articles/thinking-machines-releases-inkling-2-small-highest-scoring-open-weights-model-outside-of-chinia-upon-weights-release-it
  date: 05-11-2026
- label: Thinking Machines Lab, Tinker docs, Models and pricing
  url: https://tinker-docs.thinkingmachines.ai/tinker/models/models_and_pricing/
  date: 07-11-2026
contentHash: sha256:268216f1de8ceb0c
publishState: published
---

## Ce qui change

L'annonce de Thinking Machines Lab présente Inkling 2 Small comme un modèle Mixture-of-Experts de 594B paramètres au total, dont 17B actifs [s1], et sa fiche modèle donne le 5 novembre 2026 comme date de sortie [s2]. Selon l'annonce, le modèle est disponible via Tinker avec des poids fermés, et le laboratoire compte publier les poids complets sous licence Apache 2.0 la semaine prochaine, une fois achevés les tests de sécurité externes et le red-teaming [s1]. Artificial Analysis note cette publication des poids comme prévue, date non confirmée [s3]. La grille tarifaire de Tinker liste `thinkingmachines/Inkling-2-Small` en 64K et `thinkingmachines/Inkling-2-Small:peft:262144` en 256K, chacun à $0.30 en prefill, $0.03 en cache et $1.00 en sample [s4].

## Deux chiffres de code, un seul mesureur

Artificial Analysis lit lui-même l'écart comme des forces différentes en code face à Claude Sonnet 5.5 (medium), et son article donne ces chiffres [s3] :

| Mesure d'Artificial Analysis | Inkling 2 Small | Claude Sonnet 5.5 (medium) |
| :--- | ---: | ---: |
| FrontierCode 2.0 | 25% | 11% |
| Terminal-Bench 4.0 | 13% | 30% |
| Tokens de sortie par tâche de l'Intelligence Index | ~150K | ~31K |
| Coût par tâche de l'Intelligence Index | $1.18 | $10.02 |

À ma lecture, la ligne Terminal-Bench rejoint la section Limitations de l'annonce, selon laquelle le modèle ne choisit pas toujours les meilleurs outils pour la tâche, surtout dans les bases de code qui comptent beaucoup de skills [s1]. Je pense que ces deux sources décrivent ensemble ce qu'un harness d'agent rencontre en premier : un modèle qui écrit bien le code et ne prend pas toujours le bon outil.

## L'objection

L'objection la plus solide tient au tableau Coding and Autoresearch de l'annonce, avec 72.1% sur DeepSWE v1.1 et 86.3% sur SWEBench Pro v2 (Hard), chaque fois le deuxième meilleur score de sa ligne [s1]. Je suis d'accord, le modèle écrit bien le code, et la ligne FrontierCode d'Artificial Analysis va dans le même sens [s3]. À mon sens, une boucle d'agent qui pilote un shell ressemble davantage à Terminal-Bench, et les autres colonnes du tableau de l'annonce sont GLM-5.3-Flash, DeepSeek-V4.1-Flash-1017, Muse Spark Open et Kimi K3 [s1]. La facture plaide mieux en sa faveur. La ligne de coût d'Artificial Analysis lui reste favorable, malgré bien plus de tokens de sortie par tâche [s3].

## Impact pour une équipe

Si vous répartissez le travail d'agent entre modèles, ma recommandation : essayez Inkling 2 Small sur Tinker pour la génération de code et comme base de fine-tuning, puisque la fiche modèle mentionne un accès API pour le fine-tuning et l'inférence [s2], et laissez votre agent de terminal sur son modèle actuel. L'annonce précise que les checkpoints seront téléchargeables à la sortie des poids [s1] ; à ma lecture, un fine-tuning lancé maintenant reste donc sur Tinker jusque-là. Relancez votre propre harness quand les poids sortiront : l'annonce dit la semaine prochaine [s1], Artificial Analysis dit date non confirmée [s3]. Je dimensionnerais les tâches sur les lignes 64K et 256K de la grille de Tinker avant de compter sur la fenêtre de 1M de la fiche modèle [s2], car la colonne train de la grille affiche $1.50 en 64K et $3.00 en 256K [s4].
