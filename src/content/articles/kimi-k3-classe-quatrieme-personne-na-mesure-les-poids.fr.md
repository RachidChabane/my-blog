---
translationKey: kimi-k3-ranked-endpoint-not-weights
lang: fr
slug: kimi-k3-classe-quatrieme-personne-na-mesure-les-poids
title: Kimi K3 est classé quatrième, et personne n'a mesuré le modèle que vous feriez
  tourner
publishDate: 23-07-2026
tags:
- llm-oss
- evaluation
category: briefings
difficulty: 3
sources:
- label: Artificial Analysis, Kimi K3 model page
  url: https://artificialanalysis.ai/models/kimi-k3
  date: 23-07-2026
- label: Simon Willison, hands-on with Kimi K3
  url: https://simonwillison.net/2026/Jul/16/kimi-k3/
  date: 16-07-2026
- label: Nathan Lambert, Interconnects
  url: https://www.interconnects.ai/p/kimi-k3-the-open-weights-escalation
  date: 20-07-2026
contentHash: sha256:cd6fdbed91782fec
publishState: published
---


Tous les chiffres publics de Kimi K3 décrivent une API louée, pas le fichier de poids attendu pour le 27 juillet. Artificial Analysis attribue au modèle un score de 57 sur son Intelligence Index, le place quatrième sur 186, mesure 35,2 jetons de sortie par seconde et facture l'API mesurée 3,00 dollars le million de jetons en entrée, 15,00 dollars le million en sortie [s1]. La même fiche range Kimi K3 parmi les modèles propriétaires, poids non disponibles publiquement [s1]. Simon Willison reprend cette grille tarifaire et la promesse d'une publication des poids ouverts d'ici au 27 juillet 2026 [s2]. Je prends la promesse au sérieux. Le problème lui survit.

## Le classement a noté une configuration

Un rang se rapporte à une configuration servie : un matériel donné, une précision donnée, une politique de lots et de routage, une grille tarifaire. Pas à un fichier de poids. Pour la plupart des modèles, la nuance reste théorique : les deux objets se suivent d'assez près pour que la ligne du classement tienne lieu d'approximation. Kimi K3 est le cas où l'approximation casse, et la meilleure preuve vient de l'institution qui mesure : Artificial Analysis classe le modèle quatrième sur 186 tout en le rangeant en propriétaire, poids non disponibles publiquement [s1]. Nathan Lambert décrit l'artefact à venir comme un mixture-of-experts de 2 800 milliards de paramètres, poids publiés le 27 juillet, au plus près de la frontière depuis DeepSeek R1 [s3]. À cette échelle, l'écart entre la pile de service du fournisseur et ce qu'une équipe normale peut s'offrir ne relève plus du réglage fin. Changement de quantification, changement de hiérarchie mémoire, donc changement de profil de qualité et de coût, qu'aucune ligne de classement ne couvre.

> [!WARNING]
> Le mode de défaillance porte un nom et tient dans un document : le dossier d'achat qui aligne 35,2 jetons de sortie par seconde en face d'un budget matériel. Le chiffre sort d'une API du fournisseur réglée pour le débit agrégé sous forte concurrence ; le budget, lui, paie un déploiement quantifié qui fait transiter ses experts par de la mémoire lente. Rien de publié ne relie les deux, et le dossier s'engage donc sur un débit que personne n'a constaté.

## L'objection la plus solide

Prenons l'objection sous sa forme la plus forte. Un classement publié avant la sortie des poids a mesuré le seul objet qui existait, ce qui vaut pour tout lancement échelonné. Moonshot s'est engagé sur une date [s2]. Si les poids sortent le 27 juillet, la remarque expire en quatre jours et passe pour un procès d'intention fait à un fournisseur qui a tenu parole.

L'objection porterait si ma thèse visait la sincérité de l'éditeur, ce qui n'est pas le cas. Admettons la publication à la date promise, octet pour octet : ce qui n'arrivera pas le 27 juillet, c'est une mesure de l'objet publié. Les classements ne sont pas rejoués à votre précision sur vos cartes, et le chiffre qui circule comme l'identité du modèle restera celui de l'API.

Une version tentante de mon propre argument est fausse, autant l'abattre tout de suite. Les 35,2 jetons par seconde ne constituent pas un plafond pour une reproduction locale. Un déploiement mono-flux optimisé pour la latence peut faire mieux qu'une API réglée pour la concurrence ; un déploiement contraint en mémoire, qui décharge ses experts, peut tomber un ordre de grandeur plus bas. L'énoncé honnête est plus faible et plus utile : le chiffre ne se transporte dans aucun sens, et le rang, dérivé de la qualité, ne s'y transporte pas non plus dès que la précision change.

> [!CONFIRMED]
> Artificial Analysis place Kimi K3 quatrième sur 186, à 35,2 jetons de sortie par seconde, sur une API facturée 3,00 dollars le million de jetons en entrée et 15,00 dollars le million en sortie, et range le modèle en propriétaire, poids non disponibles publiquement [s1].

> [!INFERRED]
> Mon interprétation : cette ligne décrit une configuration servie, elle ne fixe donc ni plancher ni plafond pour un mixture-of-experts de 2 800 milliards de paramètres auto-hébergé. Les poids ouverts annoncés relèvent ici de l'option non valorisée, pas de la capacité livrée.

## Ce que je ferais lundi matin

Chiffrez la migration sur l'API testable aujourd'hui, pas sur des poids que vous ne pouvez pas encore faire tourner. Faites passer votre évaluation par l'API facturée 3 et 15 dollars le million de jetons [s2], gardez le résultat, et étiquetez-le pour ce qu'il est : un chiffre d'API. Quand les poids sortiront, mesurez les jetons par seconde et le coût par million sur votre banc, à la quantification que vous achèteriez vraiment, d'abord en mono-flux puis sous votre concurrence réelle, avant la moindre signature. Tant que cette mesure n'existe pas, la ligne honnête du dossier tient en une phrase : les poids ouverts sont une option dont personne n'a publié le prix, l'éditeur compris.

Ma prédiction : l'écart entre l'objet classé et l'objet exécutable se creusera à chaque publication de poids au niveau de la frontière, et les index continueront de noter l'API, faute de pouvoir appeler autre chose.
