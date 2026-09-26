---
translationKey: claude-opus-5-5-cache-read-price-cut-and-max-output-tokens
lang: fr
slug: claude-opus-5-5-lectures-cache-effort-max-cout
title: Claude Opus 5.5 baisse de 60 % le prix des lectures en cache, mais, en effort
  max, Artificial Analysis le mesure au niveau d'Opus 5 par tâche
publishDate: 26-09-2026
kind: release
tags:
- Claude
- Claude Opus 5.5
- Anthropic
- agents
- pricing
summary: Anthropic a publié Claude Opus 5.5 le 22 septembre 2026 à 4 $ par million
  de jetons en entrée et 20 $ en sortie, avec des lectures en cache en baisse de 60
  %, et annonce un coût inférieur de 40 % à celui d'Opus 5 avec les réglages par défaut.
  En effort max, Artificial Analysis le mesure au niveau d'Opus 5 en max pour le coût
  par tâche, malgré 1,6 fois plus de jetons de sortie.
sources:
- label: Anthropic, "Introducing Claude Opus 5.5"
  url: https://www.anthropic.com/claude-opus-5-5
  date: 22-09-2026
- label: Artificial Analysis, "Claude Opus 5.5 takes the top spot on the Artificial
    Analysis Intelligence Index"
  url: https://artificialanalysis.ai/articles/claude-opus-5-5
  date: 22-09-2026
- label: Simon Willison, "Claude Opus 5.5, GPT-6 Sol, GPT-6 Luna, and a new price
    war"
  url: https://simonwillison.net/2026/Sep/22/opus-and-sol-and-luna/
  date: 22-09-2026
contentHash: sha256:bd2dd8aead47a494
publishState: published
---

## Ce qui change

Anthropic a publié Claude Opus 5.5 le 22 septembre 2026 : sous l'identifiant `claude-opus-5-5` sur la Claude Platform, et chez Amazon Web Services, Google Cloud et Microsoft Azure [s1]. Entrée et sortie coûtent 20 % de moins qu'avec Opus 5, les lectures en cache 60 % de moins [s1]. L'économie annoncée a un périmètre précis : 40 % de moins qu'Opus 5 sur des charges typiques, avec les réglages par défaut [s1].

## Où tombe la remise

| Prix par million de jetons | Opus 5 | Opus 5.5 |
| :--- | ---: | ---: |
| Lectures en cache [s1] | 0,50 $ | 0,20 $ |
| Entrée [s1] | 5 $ | 4 $ |
| Sortie [s1] | 25 $ | 20 $ |

C'est la ligne du cache qui compte. Anthropic indique que les lectures en cache forment la majorité des coûts du travail agentique et du code [s1], et Simon Willison note que plus de 90 % des jetons d'entrée d'une longue conversation agentique sont facturés au tarif du cache [s3]. Artificial Analysis y voit une remise de 95 % par rapport à l'entrée hors cache, contre 90 % pour les Opus précédents [s2]. Je pense que l'effet de second ordre compte davantage : un défaut de cache coûte désormais relativement plus cher, donc tout ce qui casse votre préfixe (un horodatage dans le prompt système, des outils réordonnés) ronge davantage l'économie.

## L'effort max consomme la remise

Max a ses arguments. En effort max, Artificial Analysis donne à Opus 5.5 un score de 58 sur son Intelligence Index, le meilleur qu'il ait mesuré, avec plusieurs points d'avance [s2]. La facture suit. En max, Opus 5.5 consomme environ 119k jetons de sortie par tâche de l'index, contre environ 73k pour Opus 5 en max, ce qui le place au niveau d'Opus 5 en coût par tâche [s2]. Les 40 % valent pour les réglages par défaut, où l'effort est medium [s1].

Simon Willison a lancé max sur une seule requête : deux fois, le modèle a buté sur la limite de 128 000 jetons de sortie (commune aux autres modèles Claude) en plein raisonnement [s3]. Chaque échec lui a coûté 2,56 $ et près de 20 minutes [s3]. Il soupçonne max d'être inutile en pratique [s3]. Sur une seule requête, je n'irais pas jusque-là, mais je n'en ferais pas un réglage par défaut.

## Impact pour une équipe

Opus 5.5 n'est plus disponible avec le mode thinking désactivé [s1] : toute requête qui le coupe est à modifier avant de basculer sur `claude-opus-5-5`. Pour un compte API créé à partir du 31 août 2026, le mécanisme preserved thinking s'applique ; il empêche les utilisateurs de l'API de modifier le contexte antérieur de Claude pour tenter d'en extraire le raisonnement [s1]. Je testerais en premier tout harnais qui réécrit ou élague les tours précédents de l'assistant. Côté budget, partez de medium, le réglage par défaut, et ne routez vers max que les tâches où vos évaluations montrent un gain : en max, Artificial Analysis ne mesure aucune économie par tâche face à Opus 5 en max [s2]. Et suivez votre taux de succès du cache, car votre part de la baisse en dépend.
