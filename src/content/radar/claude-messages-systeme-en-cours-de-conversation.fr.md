---
translationKey: claude-mid-conversation-system-messages
lang: fr
slug: claude-messages-systeme-en-cours-de-conversation
title: Le rôle système de Claude arrive sur trois modèles, et deux docs éditeurs se
  contredisent
publishDate: 21-07-2026
kind: spec-change
tags:
- Claude
- Anthropic API
- prompt-caching
- agents
summary: 'L''entrée de notes de version du 2026-07-15 documente les messages système
  en cours de conversation sur Claude Fable 5, Claude Mythos 5 et Claude Opus 4.8,
  sans en-tête bêta, tandis que la page Bedrock, consultée le 2026-07-21, annonce
  toujours Opus 4.8 uniquement : conditionnez la fonctionnalité à un drapeau de capacité,
  pas à une liste de modèles figée.'
sources:
- label: Anthropic - Claude Platform release notes, July 15 2026 entry
  url: https://platform.claude.com/docs/en/release-notes/api
  date: 15-07-2026
- label: Anthropic - Mid-conversation system messages docs page
  url: https://platform.claude.com/docs/en/build-with-claude/mid-conversation-system-messages
  date: 21-07-2026
- label: AWS - Amazon Bedrock user guide, Mid-conversation system messages
  url: https://docs.aws.amazon.com/bedrock/latest/userguide/claude-messages-mid-conversation-system.html
  date: 21-07-2026
- label: 'simonw/llm-anthropic issue #73'
  url: https://github.com/simonw/llm-anthropic/issues/73
  date: 28-05-2026
contentHash: sha256:68a1917aa8d7924b
publishState: published
---

## Ce qui change

Le diff tient en une ligne et déplace toute la boucle : quand les instructions changent en session, on ajoute un message `{"role": "system"}` dans `messages` au lieu de modifier le champ `system` de premier niveau ; le préfixe mis en cache reste identique octet pour octet et la requête suivante le relit [s2][s3]. Les notes de version d'Anthropic du 2026-07-15 la documentent sur Claude Fable 5, Claude Mythos 5 et Claude Opus 4.8, sur l'API Claude, Bedrock et Google Cloud, sans en-tête bêta, en précisant qu'elles « corrigent des notes de disponibilité antérieures » [s1]. Le 2026-05-28, le périmètre se limitait à Opus 4.8 [s1][s4] ; aucune source captée ne date l'élargissement.

Je l'adopterais pour le gain de cache, conditionné à un drapeau de capacité plutôt qu'à une liste de modèles figée. Car cette liste dépend aujourd'hui de la page éditeur consultée.

## Deux docs, deux matrices

| Dimension | Doc Anthropic, 2026-07-21 [s2] | Doc Bedrock, 2026-07-21 [s3] |
| :--- | :--- | :--- |
| Modèles pris en charge | Fable 5, Mythos 5, Opus 4.8 ; pas Sonnet 5 | Opus 4.8 uniquement |
| Messages système consécutifs | Acceptés, fondus en une seule section système | Interdits |
| Modèle non pris en charge | Non précisé | `400 invalid_request_error` |

Deux pages éditeurs vivantes, le même jour, qui se contredisent sur les deux points dont dépend une migration. Je ne tranche pas, et votre code non plus : une liste blanche recopiée de l'une ou l'autre est un pari qu'une mise à jour de doc annule sans préavis.

## Le placement

La position intéressante suit les résultats d'outils, dans une boucle agentique [s2] :

```json
"messages": [
  {"role": "user", "content": [
    {"type": "tool_result", "tool_use_id": "toolu_01A", "content": "3 files changed"}
  ]},
  {"role": "system", "content": "The user sent the following message while you were working: also update the changelog before you finish."}
]
```

Toute autre position, dont l'intervalle entre un `tool_use` et son `tool_result`, renvoie une 400, que Bedrock nomme `400 invalid_request_error` [s2][s3].

> [!IMPORTANT]
> Ne faites jamais transiter par un message système une sortie d'outil brute, un document récupéré ou du contenu web : Anthropic indique que cela lui confère une autorité de niveau opérateur [s2]. Le relais ci-dessus reste sain car il porte ce que l'utilisateur a tapé, pas la sortie d'un outil. Et le gain de cache se demande : sans `cache_control`, rien n'est mis en cache [s2].

## Impact pour une équipe

Une décision concrète. Si votre boucle bascule d'Opus 4.8 vers Sonnet 5 pour les coûts, un seul message système injecté en session transforme ce repli en requête rejetée : Anthropic exclut Sonnet 5 et renvoie au champ `system` de premier niveau [s2]. Gardez ce chemin vivant sur la branche Sonnet 5, ou supprimez le repli pour ces sessions. Et sur Bedrock, ne lisez pas la matrice d'Anthropic comme une autorisation : cette page annonce toujours Opus 4.8 uniquement et interdit les messages système consécutifs [s3]. Testez une requête par modèle sur votre compte et laissez l'API, pas la doc, trancher.
