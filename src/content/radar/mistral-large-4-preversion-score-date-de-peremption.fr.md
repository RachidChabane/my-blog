---
translationKey: mistral-large-4-preview-still-in-training-measured-at-half-price
lang: fr
slug: mistral-large-4-preversion-score-date-de-peremption
title: Mistral Large 4 ouvre sa préversion avec 50 % de remise pendant deux semaines
  et un apprentissage par renforcement toujours en cours, et Artificial Analysis note
  cette version 38
publishDate: 07-10-2026
kind: release
tags:
- Mistral
- Mistral Large 4
- evals
- pricing
summary: Mistral ouvre mistral-large-4 en Public Preview avec 50 % de remise de lancement
  pendant deux semaines, et précise que l'apprentissage par renforcement derrière
  ce modèle est toujours en cours. Artificial Analysis mesure la préversion à 38 sur
  son Intelligence Index, pour 0,57 $ par tâche avec la remise et 1,13 $ au tarif
  standard. Je lancerais mes propres évaluations dès maintenant, je budgéterais au
  tarif standard et je les relancerais avant d'envoyer du trafic de production.
sources:
- label: Mistral docs, "Changelog"
  url: https://docs.mistral.ai/getting-started/changelog
  date: 06-10-2026
- label: Mistral docs, "Mistral Large 4" model card
  url: https://docs.mistral.ai/models/mistral-large-4-0
  date: 06-10-2026
- label: Mistral, "Introducing Mistral Large 4"
  url: https://mistral.ai/news/mistral-large-4/
  date: 06-10-2026
- label: Artificial Analysis, "Mistral has released Mistral Large 4"
  url: https://artificialanalysis.ai/articles/mistral-large-4-france-ai
  date: 06-10-2026
contentHash: sha256:a8da54a80eb47e1e
publishState: published
---

## Ce qui change

Le 6 octobre 2026, Mistral a ouvert Mistral Large 4 en Public Preview sur son API, sous l'identifiant `mistral-large-4` [s1][s2]. Le tarif de lancement applique 50 % de remise pendant deux semaines : 0,68 $ par million de jetons en entrée et 2,09 $ par million de jetons en sortie, contre 1,36 $ et 4,18 $ au tarif standard [s1][s2]. Artificial Analysis attribue 38 à cette préversion sur son Intelligence Index, aux côtés de GPT-6 Luna (max, 38) et de DeepSeek V4.1 Flash (max, 39) [s4].

## Un score avec une date de péremption

Je pense que le chiffre à manier avec prudence est le 38 qu'Artificial Analysis donne à la préversion, parce que le modèle noté bouge encore. Selon Mistral, l'apprentissage par renforcement derrière cette préversion est toujours en cours, et l'éditeur attend des améliorations importantes et rapides dans les semaines et les mois qui viennent [s3].

> [!IMPORTANT]
> Artificial Analysis mesure, pour la préversion, 0,57 $ par tâche de l'Intelligence Index avec la remise de lancement, et 1,13 $ au tarif standard [s4]. Un modèle de coûts bâti sur le premier chiffre devient faux le jour où la remise prend fin.

Les deux chiffres qu'une équipe utiliserait cette semaine décrivent donc une version du modèle à un prix donné. Le prix a un horizon fixe de deux semaines ; ni Mistral ni Artificial Analysis ne donnent de date de fin au score.

On objectera que tout modèle hébergé évolue sous un identifiant stable, et qu'une préversion qui bouge n'apprend donc rien à personne. La différence tient à ce que l'éditeur le dit lui-même de cette version précise, dans son billet de lancement, tandis que la fenêtre de prix figure dans son changelog [s1][s3]. Il faut le traiter comme un calendrier.

## Impact pour une équipe

Si vous décidez s'il faut router du trafic vers Mistral Large 4, ces deux semaines de remise sont une fenêtre d'évaluation, et c'est ainsi que je les utiliserais. Lancez votre propre suite d'évaluations sur `mistral-large-4` dès cette semaine, notez la date de chaque exécution à côté du score obtenu, et chiffrez le coût au tarif standard par jeton [s1]. Ma recommandation : aucun routage en production tant que la même suite n'a pas tourné de nouveau après la fin du tarif de lancement, puisque c'est la première exécution dont vous paierez vraiment le prix.

Le mode de défaillance que je surveillerais est plus discret : un tableau comparatif interne qui affiche encore, des semaines plus tard, le 38 et les 0,57 $ par tâche de l'Intelligence Index qu'Artificial Analysis a mesurés pour la préversion, alors que la remise a expiré et que l'apprentissage par renforcement que Mistral décrivait comme toujours en cours a eu le temps d'aboutir.
