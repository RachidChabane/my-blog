---
translationKey: gpt-6-1-terra-omniscience-guess-rate-and-accuracy
lang: fr
slug: gpt-6-1-terra-omniscience-taux-de-devinette-et-precision
title: GPT-6.1 Terra sort à 1 $/5 $ par million de jetons, et Artificial Analysis
  mesure qu'il devine sur 38 % des questions dont il ignore la réponse, contre 88
  % pour GPT-5.6 Terra
publishDate: 28-10-2026
kind: release
tags:
- OpenAI
- GPT-6
- Artificial Analysis
- evals
summary: 'OpenAI a publié GPT-6.1 Terra, accessible dans son API sous l''identifiant
  gpt-6.1-terra. Artificial Analysis date la sortie du 26 octobre 2026 et relève un
  prix de 1 $/5 $ par million de jetons en entrée/sortie, contre 2 $/12 $ pour GPT-5.6
  Terra. Selon OpenAI, le taux d''erreur sur son benchmark interne de prompts conçus
  pour induire des erreurs passe de 53,6 % à 16,7 % en effort de raisonnement bas.
  Selon Artificial Analysis, le modèle devine sur 38 % des questions d''AA-Omniscience
  dont il ignore la réponse, contre 88 % auparavant, avec une précision en hausse
  de 2 points. Ma recommandation : prévoyez un chemin pour les champs laissés vides,
  puis relancez vos évaluations d''extraction en effort bas et en effort maximal avant
  de migrer.'
sources:
- label: OpenAI, Introducing GPT-6.1 Terra
  url: https://openai.com/index/introducing-gpt-6-1-terra/
  date: 26-10-2026
- label: Artificial Analysis, GPT-6.1 Terra pushes the cost efficiency frontier
  url: https://artificialanalysis.ai/articles/gpt-6-1-terra-pushes-the-cost-efficiency-frontier
  date: 26-10-2026
contentHash: sha256:b01d399666416cdc
publishState: published
---

## Ce qui change

OpenAI a publié GPT-6.1 Terra, accessible dans l'API OpenAI sous l'identifiant `gpt-6.1-terra` [s1]. Artificial Analysis date la sortie du 26 octobre 2026 et relève un prix de 1 $/5 $ par million de jetons en entrée/sortie, contre 2 $/12 $ pour GPT-5.6 Terra [s2]. OpenAI facture l'entrée en cache 0,05 $ par million de jetons [s1]. Les deux billets mesurent moins de réponses fausses, chacun sur son propre test [s1][s2].

## Où sont passés les 50 points

À mon avis, pour le travail auquel OpenAI destine ce modèle, lire les factures entrantes et en saisir le détail dans un logiciel de comptabilité [s1], la factualité compte plus que le prix. Selon Artificial Analysis, GPT-6.1 Terra devine dans 38 % des cas quand il ignore la réponse à une question d'AA-Omniscience, contre 88 % pour GPT-5.6 Terra [s2].

> [!CONFIRMED]
> Artificial Analysis associe cette baisse de 50 points du taux d'hallucination à une hausse de 2 points de la précision sur AA-Omniscience [s2].

> [!INFERRED]
> Ma lecture : le modèle en sait à peine plus et renonce bien plus souvent à répondre, si bien qu'un pipeline d'extraction verra moins de valeurs fausses affirmées avec aplomb et davantage de champs vides.

Le test d'OpenAI ajoute un second réglage. Sur son benchmark interne de prompts conçus pour induire des erreurs, OpenAI annonce un taux d'erreur de 16,7 % en effort de raisonnement bas, contre 53,6 % avec GPT-5.6 Terra, et de 4,3 % en effort maximal [s1]. Selon moi, l'effort de raisonnement devient donc pour ce modèle un réglage de factualité autant qu'un réglage de coût.

## L'objection la plus solide

Aucun des deux tests ne mesure l'extraction. Artificial Analysis présente AA-Omniscience comme son benchmark privé de connaissances et d'hallucination [s2], OpenAI parle d'un benchmark interne de prompts conçus pour induire des erreurs [s1], or la saisie de factures lit ses réponses dans un document fourni en contexte. Je suis d'accord, et un modèle qui devine moins ne dispense pas de valider les champs. Je retiens donc des deux tests la direction, et je laisse vos propres évaluations en donner l'ampleur.

## Impact pour une équipe

Ma recommandation, si vous faites tourner de l'extraction de documents sur GPT-5.6 Terra : avant de migrer, prévoyez un chemin explicite pour un champ que le modèle laisse vide, car un parseur qui attend chaque champ rempli transforme la baisse des valeurs fausses en jobs en échec. Relancez alors vos évaluations d'extraction en effort bas et en effort maximal, et comptez à part les champs vides et les champs faux. Choisissez l'effort sur la foi de ce run : les chiffres d'OpenAI montrent que ce réglage fait bouger le taux d'erreur [s1]. Je ne migrerais pas sur le seul argument du prix.
