---
translationKey: relay-bench-multi-domain-chains
lang: fr
slug: relay-bench-invites-composites-gpt-5-5
title: Relay-Bench maintient GPT-5.5 à 43,3 % en enchaînant les sous-tâches dans une
  seule invite
publishDate: 26-07-2026
kind: benchmark
tags:
- Relay-Bench
- GPT-5.5
- evals
- agents
summary: 'Relay-Bench a été déposé sur arXiv le 20-07-2026 : chaque item du jeu de
  test enchaîne de deux à treize sous-problèmes mono-domaine dans une seule invite,
  et le meilleur modèle, GPT-5.5 en effort xHigh, plafonne à 43,3 %.'
sources:
- label: 'Primary - arXiv, Relay-Bench: Evaluating LLMs on Multi-Domain Reasoning
    Chains'
  url: https://arxiv.org/abs/2607.18438
  date: 20-07-2026
- label: Independent corroboration - Zaikei Shimbun, Japanese trade outlet reporting
    the paper
  url: https://www.zaikei.co.jp/article/20260723/862514.html
  date: 23-07-2026
contentHash: sha256:e901c08e253e25f9
publishState: published
---

## Ce qui change

Relay-Bench a été déposé sur arXiv le 20 juillet 2026 par Liam Swayne, en réponse à la saturation des benchmarks [s1][s2]. Son auteur le décrit comme « non saturé, holistique, uniquement textuel » [s1]. Le format des items fait tout l'intérêt : le jeu de test ne contient que des problèmes composites, de deux à treize sous-problèmes mono-domaine enchaînés dans une seule invite, avec des couches d'encodage de l'invite et de gonflement délibéré du contexte [s1]. Les domaines couvrent le raisonnement visuel, le code, les mathématiques, l'extraction d'information axée recherche web, la résolution de problèmes, la culture générale et l'analyse de données ; le harnais n'impose aucune restriction et encourage explicitement l'exécution de code, la recherche web et tout outil disponible [s1]. GPT-5.5 en effort xHigh domine avec 43,3 % [s1][s2].

## Le chiffre auquel le comparer

Ces 43,3 % ne prennent leur sens qu'à côté de ce que le même modèle, GPT-5.5 en xHigh, obtient quand le travail arrive une tâche à la fois. Zaikei Shimbun a posé cette comparaison le 23 juillet [s2].

| Benchmark | Score | Rapporté par |
| :--- | ---: | :--- |
| Relay-Bench | 43,3 % | l'article [s1][s2] |
| Terminal-Bench 2.0 | 82,7 % | Zaikei Shimbun [s2] |
| FrontierMath Tiers 1 à 3 | 51,7 % | Zaikei Shimbun [s2] |

Je lis cet écart comme un fait sur la forme des tâches, pas sur la capacité brute. Le modèle qui franchit un banc d'essai d'agent en terminal est celui-là même qui cale dès que son étape trois devient la prémisse de l'étape quatre. C'est mon interprétation : aucune des deux sources ne nomme de mécanisme.

## Ce que cela change dans une suite d'évaluation

Les équipes recopient les suites par capacité, parce que les fournisseurs les publient et qu'elles coûtent peu à assembler. Elles mesurent un modèle qui fait une seule chose dans un contexte propre, or ce n'est jamais la forme sous laquelle tourne ce que vous mettez en production. Inutile d'élargir la suite. Ajoutez-y un item composite : trois ou quatre de vos vraies sous-tâches enchaînées dans une seule invite, évaluées de bout en bout, réussite ou échec sur la seule réponse finale. La précision par étape restera bonne pendant que cet item échoue ; c'est cet écart qu'il faut suivre.

> [!IMPORTANT]
> Il s'agit d'une préimpression d'un seul auteur, en v1, avec un unique score annoncé, sans réplication indépendante capturée ni relecture par les pairs. À lire comme un enseignement sur la conception des évaluations, pas comme un classement à optimiser.

## Impact pour une équipe

Si votre agent est aujourd'hui conditionné à un seuil de précision par étape, c'est ce seuil qu'il faut revoir ce trimestre, avant la prochaine décision de montée de version. Deux gestes concrets : un item composite évalué de bout en bout dans la suite, et un point de vérification entre les étapes enchaînées, pour qu'un résultat intermédiaire faux ne devienne pas la prémisse du suivant. Ce qu'il faut ignorer : les 43,3 % comme signal de classement des modèles. Un article, un auteur, un score ne classent rien.
