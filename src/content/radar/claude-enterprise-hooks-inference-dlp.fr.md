---
translationKey: claude-enterprise-inference-hooks-dlp
lang: fr
slug: claude-enterprise-hooks-inference-dlp
title: Claude Enterprise envoie chaque invite gouvernée vers votre propre serveur
  de sécurité, et contrôle au retour la réponse de l'outil MCP
publishDate: 06-08-2026
kind: release
tags:
- Claude
- Anthropic
- MCP
- security
- agents
summary: Les inference hooks d'Anthropic envoient chaque invite, et chaque réponse
  d'appel d'outil, vers le serveur de sécurité de l'organisation, qui rend un verdict
  allow ou deny avant que Claude ne poursuive. Ce verdict ne caviarde pas, les pièces
  jointes purement visuelles échappent à l'inspection, et l'accès via Claude Platform,
  Amazon Bedrock ou Google Cloud reste hors périmètre.
sources:
- label: Anthropic announcement blog
  url: https://claude.com/blog/claude-enterprise-inference-hooks
  date: 05-08-2026
- label: Unite.AI cybersecurity desk
  url: https://www.unite.ai/anthropic-puts-inline-data-loss-prevention-inside-claude-enterprise/
  date: 05-08-2026
- label: The Next Web
  url: https://thenextweb.com/news/anthropic-inference-hooks-dlp-claude-enterprise
  date: 05-08-2026
contentHash: sha256:cf3239601c66a949
publishState: published
---

## Ce qui change

Anthropic a annoncé les inference hooks le 5 août 2026, et leur portée s'arrête aux surfaces Claude Enterprise [s2]. Une fois activés, Claude transmet l'invite et son contexte à votre propre serveur de sécurité avant toute génération, et n'avance qu'une fois le verdict rendu, allow ou deny [s1]. Le contrôle vaut aussi pour les appels d'outils : la réponse d'un outil, via MCP, skill ou plugin, est vérifiée avant de repartir vers le modèle [s1]. Le transport est un protocole à base de webhooks doté d'un schéma publié, pensé pour l'infrastructure DLP en place [s3].

## La réponse de l'outil, voilà la surface neuve

Filtrer les invites, votre éditeur DLP vous le vend déjà ; la sonde descend d'un cran. Le retour d'outil, lui, change de nature. Un serveur MCP que votre agent appelle écrit directement dans le contexte du modèle, et rien ne s'intercale dans la plupart des stacks que je vois : la décision de politique y est une surface neuve. Reste l'enveloppe, étroite, telle que l'éditeur la décrit lui-même.

| Surface | Couverte par un hook aujourd'hui |
| :--- | :--- |
| L'invite, avant inférence | Oui, seul événement au lancement [s1][s2] |
| Les réponses d'outils via MCP, skills, plugins | Oui [s1] |
| Ce que le modèle renvoie | Non, événement ultérieur [s2] |
| Pièces jointes purement visuelles (capture d'un document) | Non, elles arrivent en métadonnées et texte extrait [s2] |
| L'accès API via Claude Platform, Amazon Bedrock, Google Cloud | Non [s2] |

> [!IMPORTANT]
> Le verdict vaut allow ou deny ; le serveur ne peut ni réécrire ni caviarder une invite [s2]. Chaque règle livrée aujourd'hui en caviardage par votre équipe DLP devient ici un blocage, et un blocage, l'utilisateur le voit. Ce chantier appartient à qui écrit les règles, et il pèse plus lourd que le branchement du connecteur.

## Impact pour une équipe

Si votre discours de conformité affirme que toute interaction Claude est inspectée, la phrase devient fausse dès qu'une équipe passe par l'API Claude Platform, Amazon Bedrock ou Google Cloud [s2]. Corrigez la phrase avant d'acheter. Dans le périmètre, démarrez en mode shadow, qui laisse tout passer [s3], et comptez les invites qu'une règle de caviardage transformerait en refus : ce décompte dit si votre politique tient face à un verdict binaire. Deux chantiers que je ne repousserais pas : une règle pour les pièces jointes purement visuelles, non inspectées [s2], et un inventaire des serveurs MCP que vos agents atteignent, car un contrôle au retour ne vaut que ce que vous savez du serveur qui répond.
