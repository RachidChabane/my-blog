---
translationKey: multiagent-swarm-tokens-per-vulnerability
lang: fr
slug: essaim-coordonne-jetons-par-vulnerabilite-trouvee
title: '266 vulnérabilités contre 21, et seulement 12 en commun : ce qu''apporte vraiment
  un essaim d''agents coordonnés'
publishDate: 19-08-2026
kind: research
tags:
- Claude
- Anthropic
- agents
- security
summary: 'Le Frontier Red Team d''Anthropic a lancé 45 agents coordonnés sur 15 projets
  open source et rapporte, pour Mythos Preview, 266 vulnérabilités sur un run de 27
  millions de jetons, contre 21 sur 6.5 millions pour des agents parallèles indépendants.
  En restreignant l''essaim aux répertoires principaux visés par la méthode économique,
  les deux deviennent comparables en jetons par vulnérabilité trouvée, avec seulement
  12 trouvailles communes : à mon sens, l''essaim complète un scanner parallèle et
  se budgète comme un ajout.'
sources:
- label: Anthropic Frontier Red Team, Patterns and problems in emerging multiagent
    systems
  url: https://www.anthropic.com/research/multiagent-systems
  date: 13-08-2026
- label: TechCrunch
  url: https://techcrunch.com/2026/08/13/anthropic-set-ai-agents-loose-on-the-same-task-they-started-a-turf-war/
  date: 13-08-2026
contentHash: sha256:7eaf8a4c0c250159
publishState: published
---

## Ce qui change

Le Frontier Red Team d'Anthropic a publié ses mesures sur les systèmes multiagents le 13 août 2026. Chacun des 45 agents disposait de sa propre machine virtuelle, d'un forum partagé et d'une consigne identique : trouver des vulnérabilités dans 15 projets open source et relire le travail des autres, un agent arbitre distinct tranchant si une soumission était nouvelle et valide [s1]. Pour Mythos Preview, l'essaim coordonné a trouvé 266 vulnérabilités sur un run de 27 millions de jetons, contre 21 sur 6.5 millions pour la méthode parallèle indépendante simple [s1].

## Ce que le chiffre en tête masque

À mon sens, cet écart mesure deux périmètres, pas deux niveaux de capacité. Le billet le dit lui-même : environ la moitié des trouvailles de l'essaim se situaient hors des répertoires principaux sur lesquels les agents indépendants devaient se concentrer, et en limitant la sortie de l'essaim à ces répertoires, les deux méthodes deviennent comparables en jetons par vulnérabilité trouvée [s1]. Voici le run brut [s1] :

| Méthode | Vulnérabilités | Jetons |
| --- | ---: | ---: |
| Agents parallèles indépendants | 21 | 6.5 millions |
| Essaim coordonné | 266 | 27 millions |

Voici ce que le titre enterre : seules 12 vulnérabilités étaient communes aux deux méthodes [s1]. Un recouvrement aussi faible rend les deux approches complémentaires.

> [!IMPORTANT]
> La comparabilité ne tient qu'une fois la sortie de l'essaim restreinte aux répertoires visés par la méthode économique. Sur le run brut, l'essaim a dépensé 27 millions de jetons contre 6.5 millions [s1].

Comme le rapporte l'article, Mythos 5 affichait le taux le plus élevé de résolution des conflits par trêve, 98 % [s2], tandis que Sonnet 4.6 et Opus 4.6 réglaient le plus souvent par la force [s2]. Or le modèle retenu devient de ce fait un paramètre de coordination.

## Impact pour une équipe

Si vous faites déjà tourner un scanner parallèle, gardez-le et placez l'essaim à côté : 12 trouvailles communes sur 266 [s1], c'est une couverture qui disparaît dès que l'un remplace l'autre. Budgétez ces campagnes en jetons par découverte confirmée dans le périmètre qui vous intéresse, pas au nombre brut ; la normalisation faite par le billet lui-même est cet argument [s1]. Surveillez ensuite l'arbitre, seul garant du sens de « nouvelle et valide » [s1] ; sans lui, un essaim vous rend un compteur, pas une file de travail. À mon sens, l'écart entre modèles rapporté par [s2] fait du choix du modèle une pièce de la conception de la coordination dès que plusieurs agents partagent un dépôt.
