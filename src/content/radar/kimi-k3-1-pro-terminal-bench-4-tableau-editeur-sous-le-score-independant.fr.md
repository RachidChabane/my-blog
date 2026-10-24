---
translationKey: kimi-k3-1-pro-terminal-bench-4-vendor-table-below-independent-score
lang: fr
slug: kimi-k3-1-pro-terminal-bench-4-tableau-editeur-sous-le-score-independant
title: Le tableau de Kimi place K3.1 Pro derrière Claude Opus 5.5 sur Terminal-Bench
  4.0, et Artificial Analysis lui donne le meilleur score de tous les modèles, à 67%
publishDate: 23-10-2026
kind: release
tags:
- Kimi K3.1 Pro
- Terminal-Bench
- evals
summary: 'Kimi a publié Kimi K3.1 Pro, une version post-entraînée de Kimi K3, sur
  ses applications et l''API Kimi, et annonce les poids complets pour le 4 novembre
  2026 au plus tard. Le tableau de Kimi le place à 65.7% sur Terminal-Bench 4.0, juste
  derrière Claude Opus 5.5 (66.4%), avec les autres scores repris à leur valeur maximale
  publiée ; Artificial Analysis, dans son analyse du 23 octobre 2026, lui donne 67%,
  le meilleur score de tous les modèles. Ma recommandation : classer sur la colonne
  de l''évaluateur externe, et tester kimi-k3.1-pro dans votre propre harnais.'
sources:
- label: 'Kimi, Kimi K3.1 Pro Tech Blog: Advancing Open Intelligence'
  url: https://www.kimi.ai/blog/kimi-k3-1-pro
  date: 24-10-2026
- label: Artificial Analysis, Kimi K3.1 Pro launches at 4th on the Intelligence Index
    and will lead open weights models
  url: https://artificialanalysis.ai/articles/kimi-k3-1-pro-launch-benchmarks
  date: 23-10-2026
contentHash: sha256:7021e4828c554d39
publishState: published
---

## Ce qui change

Kimi a publié Kimi K3.1 Pro, une version post-entraînée de Kimi K3 dotée d'une fenêtre de contexte de 1 million de jetons, sur Kimi.ai, Kimi Work, Kimi Code et l'API Kimi [s1]. Artificial Analysis a publié son analyse de lancement le 23 octobre 2026 et lui attribue 55 sur son Intelligence Index, derrière Claude Opus 5.5 à 58 [s2]. Kimi annonce les poids complets du modèle pour le 4 novembre 2026 au plus tard [s1].

## Deux tableaux, deux méthodes

Sur Terminal-Bench 4.0, l'éditeur classe son propre modèle plus bas que l'évaluateur externe :

| Qui l'a noté | K3.1 Pro | Concurrents affichés | Origine des scores concurrents |
| :--- | ---: | :--- | :--- |
| Kimi [s1] | 65.7% | Claude Opus 5.5 66.4%, GPT-6 Astra 58.2% | la valeur maximale publiée dans leurs billets de blog ou sur le classement officiel |
| Artificial Analysis [s2] | 67% | Claude Sonnet 5.5 64%, Kimi K3 13% | meilleur score de tous les modèles, selon Artificial Analysis |

> [!CONFIRMED]
> Kimi a évalué K3.1 Pro avec le harnais Claude-Code et a repris tous les autres scores à la valeur maximale publiée dans leurs billets de blog ou sur le classement officiel de Terminal-Bench 4.0 [s1].

> [!INFERRED]
> Ma lecture : une colonne qui retient le meilleur chiffre publié de chaque concurrent mesure leur meilleur jour ; ici, c'est donc le tableau de l'éditeur qui est prudent. Pour présélectionner un modèle d'agent de code, je classerais sur la colonne dont un seul évaluateur externe a produit tous les chiffres.

## L'objection la plus solide

Trois scores aussi serrés sur un seul benchmark relèvent du bruit, et y lire un classement serait l'erreur. Sur le classement, je suis d'accord : je ne dirais pas que K3.1 Pro bat Claude Opus 5.5. Ce qui résiste au bruit, c'est la méthode et l'étendue : sur l'Intelligence Index, plus large, Artificial Analysis place encore le modèle derrière Claude Opus 5.5, Claude Sonnet 5.5 et Muse Wonder Full [s2]. À mon avis, son terrain est le travail d'agent centré sur le terminal, et guère au-delà.

## Impact pour une équipe

Pour des agents de code centrés sur le terminal, inscrivez `kimi-k3.1-pro` sur la liste cette semaine et faites-le tourner via l'API Kimi dans votre propre harnais, sur vos propres tâches [s1]. Le 65.7% de Kimi vient du harnais Claude-Code : votre harnais est précisément la variable que ce chiffre ne couvre pas [s1]. Artificial Analysis indique un tarif de $2/$10/$0.20 par 1M de jetons en entrée, en sortie et en cache, 33% de moins que Kimi K3 sur les trois [s2]. Pour Kimi Enterprise, l'accès est désactivé par défaut au lancement [s1]. Pour la recherche de vulnérabilités, lisez la note de Kimi : il a retiré les données liées à la cybersécurité des deux étapes d'entraînement pour la version à poids ouverts, et sur son benchmark interne xdev-bench-hard, un checkpoint sans ces garde-fous résout 90.5% des problèmes en pass@3, contre 81.0% pour le K3.1 Pro final [s1]. Ma recommandation : ne planifiez aucun auto-hébergement avant la sortie des poids, encore non publiés selon Artificial Analysis [s2].
