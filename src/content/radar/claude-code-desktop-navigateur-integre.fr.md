---
translationKey: claude-code-desktop-in-app-browser
lang: fr
slug: claude-code-desktop-navigateur-integre
title: Claude Code Desktop ajoute un navigateur intégré, et sépare la navigation agentique
  selon qui détient les cookies
publishDate: 13-07-2026
kind: release
tags:
- Claude
- Claude Code
- agents
- browser-use
summary: 'En semaine 28 (du 6 au 10 juillet 2026), Claude Code sur ordinateur a reçu
  un navigateur intégré, doté d''un profil isolé et vierge sans aucune connexion enregistrée.
  Le vrai changement, c''est la séparation : vous disposez désormais de deux surfaces
  de navigation, et vous choisissez selon que l''agent doit voir votre identité authentifiée
  ou non.'
sources:
- label: Primary - Claude Code 'What's new' docs, Week 28 digest
  url: https://code.claude.com/docs/en/whats-new
  date: 10-07-2026
- label: Corroboration - 9to5Mac, 'Anthropic highlights Claude Code's in-app browser
    on the desktop'
  url: https://9to5mac.com/2026/07/10/anthropic-highlights-claude-codes-in-app-browser-on-the-desktop/
  date: 10-07-2026
- label: Corroboration - Digital Trends, 'Claude Code can now browse the web without
    opening Chrome'
  url: https://www.digitaltrends.com/cool-tech/claude-code-can-now-browse-the-web-without-opening-chrome/
  date: 10-07-2026
contentHash: sha256:1c28ae2490d9bb66
publishState: published
---

## Ce qui change

En semaine 28 (du 6 au 10 juillet 2026), Claude Code sur ordinateur a reçu un navigateur intégré, versions v2.1.202 à v2.1.206 [s1]. Claude peut ouvrir la documentation, des maquettes, un gestionnaire de tickets, des applications web internes ou pratiquement n'importe quel autre site, puis lire le contenu des pages, cliquer sur les liens et manipuler les éléments comme il pilote déjà l'aperçu de votre serveur de développement local [s1][s3]. Le détail déterminant n'est pas qu'il navigue, c'est la manière : le panneau Browser s'appuie sur un profil isolé et vierge, sans aucun de vos identifiants ni de votre historique, il est cloisonné, et vous décidez si les sessions persistent [s2][s3]. C'est une fonctionnalité livrée pour l'application Desktop, active dès maintenant, pas une préversion.

## Les deux surfaces

Une semaine plus tôt, en semaine 27 (du 29 juin au 3 juillet 2026), Anthropic avait rendu "Claude in Chrome" accessible à tous, et cette extension pilote votre vrai Chrome avec vos vraies sessions [s1]. Il existe donc désormais deux surfaces de navigation aux modèles de confiance distincts, et le fait intéressant, c'est la séparation, pas l'une ou l'autre prise isolément : vous choisissez le navigateur selon que la tâche doit voir votre identité authentifiée.

| Surface | Identité / connexions | Idéale pour |
| :--- | :--- | :--- |
| Extension Claude in Chrome | Votre vrai Chrome, vos vraies sessions | Les tâches exigeant un accès authentifié [s2] |
| Navigateur intégré (Desktop) | Profil isolé et vierge, aucune connexion enregistrée | Construire et vérifier, sites qui n'ont pas besoin de votre identité [s2] |

La conséquence concrète : le navigateur intégré referme la boucle de construction et de vérification (ouvrir la documentation, piloter l'application qui tourne, lire le gestionnaire de tickets) sans jamais confier vos cookies de production à un agent autonome ; la valeur par défaut sûre pour ce travail est désormais la surface sans identité.

> [!IMPORTANT]
> Un profil vierge sans identifiants enregistrés ne peut pas tester un parcours protégé par authentification dans votre propre application ; cela passe encore par l'extension Chrome ou par des identifiants jetables semés à l'avance [s2]. Le bac à sable est une limite de capacité, pas seulement un confort de sécurité.

## Impact pour une équipe

Quand vous reliez un agent à un navigateur, la décision qui change, c'est laquelle des deux surfaces. Orientez par défaut votre travail de construction et de vérification vers le navigateur intégré sans identité (Desktop), et réservez l'extension Chrome aux parcours authentifiés : tests de bout en bout protégés par connexion, tout ce qui exige votre vraie session [s2]. Le geste concret : adoptez dès maintenant le navigateur intégré pour les boucles documentation, serveur de développement et gestionnaire de tickets, gardez l'extension pour les flux authentifiés, et ne pointez jamais un agent autonome et prompt à cliquer vers vos cookies actifs quand la tâche n'en a pas besoin.
