---
translationKey: ripple-65b-terminal-bench-lead-and-in-house-terminus-2-rerun
lang: fr
slug: ripple-65b-avance-terminal-bench-autodeclaree-execution-terminus-2-interne
title: L'avance de Ripple-65B Preview sur Reflection Beam au Terminal-Bench 2.1 est
  autodéclarée ; dans l'exécution Terminus 2 que Ricursive mène en interne sur ses
  concurrents, Beam est à 70.8
publishDate: 05-11-2026
kind: release
tags:
- Ripple-65B
- Ricursive
- Terminal-Bench
- open-weight
- evals
summary: 'Ricursive Intelligence a publié Ripple-65B Preview, un modèle Transformer
  dense de 65 milliards de paramètres sous licence apache-2.0 selon sa fiche Hugging
  Face, et son billet de lancement revendique l''état de l''art des modèles open-weight
  américains (80.52) sur TerminalBench 2.1, devant Reflection Beam 501B (80.1). Dans
  la fiche de Ricursive, la ligne Terminus 2 place Beam à 70.8 d''après le flux d''évaluation
  interne de Ricursive, quand Ripple garde 80.5, et Beam mène sur SWE-bench Verified
  avec 81.6 contre 76.5. La revue d''Orca juge la sortie entièrement déclarée par
  l''éditeur au 5 novembre. Ma recommandation : relancez votre propre suite avec un
  seul harness pour les deux modèles, et vérifiez le context_length que sert votre
  fournisseur.'
sources:
- label: 'Ricursive Intelligence, launch post: Introducing Ripple-65B Preview, a Frontier
    Open-Weight Model Achieving U.S. Open-Weight SOTA on Agentic Coding'
  url: https://www.ricursive.com/ripple
  date: 04-11-2026
- label: Ricursive Intelligence, Hugging Face model card ricursiveAI/Ripple-65B-Preview
  url: https://huggingface.co/ricursiveAI/Ripple-65B-Preview/raw/e27e171792f303d74c048184e8259ba663cfa0d5/README.md
  date: 04-11-2026
- label: 'Orca (Elias Hawthorne), Ripple-65B Preview: Apache 2.0 Weights, a 1M-Token
    Claim and a 16K API'
  url: https://www.orcarouter.ai/blog/ripple-65b-preview-launch-review
  date: 04-11-2026
- label: OpenRouter, endpoint listing API for ricursiveai/ripple-65b-preview-20261104
  url: https://openrouter.ai/api/v1/models/ricursiveai/ripple-65b-preview-20261104/endpoints
  date: 04-11-2026
contentHash: sha256:65de6cf05009151d
publishState: published
---

## Ce qui change

Ricursive Intelligence a publié Ripple-65B Preview, un modèle Transformer dense de 65 milliards de paramètres qui accepte jusqu'à 1M de tokens de contexte, sous `license: apache-2.0`, selon sa fiche Hugging Face [s2]. Le billet de lancement de Ricursive revendique l'état de l'art des modèles open-weight américains (80.52) sur TerminalBench 2.1, devant Reflection Beam 501B (80.1) [s1]. La revue d'Orca, publiée le 4 novembre 2026, juge la sortie entièrement déclarée par l'éditeur au 5 novembre [s3].

## Deux lignes, deux auteurs

La fiche de Ricursive affiche deux fois Terminal-Bench 2.1, et précise qu'elle reprend les scores officiels des fiches de modèles quand ils existent, puis son propre flux d'évaluation interne, en italique, pour ceux qui manquent [s2] :

| Ligne de la fiche | Ripple | Beam | Cellule de Beam, selon la fiche |
| :--- | ---: | ---: | :--- |
| Terminal-Bench 2.1 (self-reported) [s2] | 80.5 | 80.1 | fiche officielle du modèle |
| Terminal-Bench 2.1 (Terminus 2) [s2] | 80.5 | 70.8 | interne à Ricursive |
| SWE-bench Verified [s2] | 76.5 | 81.6 | fiche officielle du modèle |

Je pense que la cellule qui compte est l'auteur du second chiffre de Beam : le 70.8 de la fiche vient d'une exécution interne de Ricursive sur un concurrent [s2]. À ma lecture, la fiche donne aussi la raison, puisque Ricursive y écrit que les scores Terminal-Bench 2.1 étaient uniformément plus bas, sauf pour Muse Spark Open, avec le harness officiel Terminus 2 à une longueur de séquence de 128K avec résumé [s2]. La revue d'Orca ajoute que, d'après Ricursive, les scores ont bougé presque partout sauf le sien [s3].

## L'objection

L'objection la plus solide : Ricursive n'était pas obligé de publier la ligne Terminus 2, et Orca, qui parle d'un labo qui corrige sa propre copie, concède que l'écart va dans le bon sens [s3]. Je suis d'accord : publier les deux lignes relève d'une vraie transparence. À mon sens, la même fiche borne pourtant le titre : Beam mène sur SWE-bench Verified avec 81.6 contre 76.5 pour Ripple [s2], et la revue d'Orca indique qu'Artificial Analysis n'a aucune entrée pour ce modèle [s3].

## Impact pour une équipe

Si l'un de vos agents de terminal tourne sur Reflection Beam 501B et qu'un modèle dense de 65 milliards de paramètres vous tente, ma recommandation : relancez votre propre suite de tâches avec un seul harness pour les deux avant de basculer, car l'avance Terminal-Bench 2.1 de la fiche dépend de la ligne retenue [s2]. Vérifiez aussi le contexte que sert votre fournisseur : selon la revue d'Orca, le premier endpoint commercial portant le même checkpoint annonce 16 384 [s3], alors que la liste d'endpoints d'OpenRouter affiche `GMICloud` à `"context_length":1048576` [s4]. La panne que je surveillerais : les exécutions Terminus 2 de la fiche tournent à 128K de séquence avec résumé [s2], donc à mon sens un agent sur l'endpoint à 16 384 qu'a vu Orca [s3] ne reproduit le cadre d'aucune des deux lignes.
