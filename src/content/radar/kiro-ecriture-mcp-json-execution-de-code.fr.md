---
translationKey: kiro-mcp-config-write-rce-approval-bypass
lang: fr
slug: kiro-ecriture-mcp-json-execution-de-code
title: Une page web piégée a réécrit la configuration MCP de Kiro et exécuté du code
  sans passer par l'autorisation
publishDate: 27-07-2026
kind: security
tags:
- Kiro
- AWS
- MCP
- prompt injection
- agent security
summary: 'Kodem Security et Intezer ont divulgué le 19 juillet 2026 une chaîne d''injection
  de prompt dans Kiro, l''IDE agentique d''AWS : une page web récupérée pousse l''agent
  à écrire le serveur d''un attaquant dans ~/.kiro/settings/mcp.json, que Kiro recharge
  et démarre. Selon la chronologie de Kodem, AWS a corrigé le 3 avril 2026 et Amazon
  a attribué CVE-2026-10591 le 22 juillet ; l''actualité, c''est donc la chaîne publiée
  et la leçon sur les écritures d''agent qui méritent un garde-fou.'
sources:
- label: Primary - Kodem Security with Intezer, disclosure writeup on the Kiro MCP
    configuration chain
  url: https://www.kodemsecurity.com/resources/aws-kiro-agentic-ide-rce-prompt-injection-mcp-config-vulnerability
  date: 19-07-2026
- label: Independent corroboration - The Hacker News, reported coverage of the Kiro
    disclosure
  url: https://thehackernews.com/2026/07/aws-kiro-flaw-let-poisoned-web-page.html
  date: 21-07-2026
contentHash: sha256:e0b0958a2af43804
publishState: published
---

## Ce qui change

Le 19 juillet 2026, Kodem Security, en recherche conjointe avec Intezer, a publié une chaîne d'injection de prompt visant Kiro, l'IDE de codage agentique d'AWS. Des instructions dissimulées dans une page que l'utilisateur demande à Kiro de récupérer amènent l'agent à écrire l'entrée d'un serveur contrôlé par l'attaquant dans `~/.kiro/settings/mcp.json` ; Kiro recharge cette configuration automatiquement et démarre le serveur décrit, si bien que le code de l'attaquant s'exécute avec les privilèges du développeur, sans qu'aucune demande d'autorisation soit présentée. The Hacker News, qui couvre la recherche le 21 juillet 2026, indique qu'AWS a corrigé la faille et qu'elle est suivie sous CVE-2026-10591. La chronologie de Kodem situe le correctif bien en amont : ticket HackerOne le 11 février 2026, confirmation par AWS du déploiement des correctifs le 3 avril 2026, attribution du numéro de CVE par Amazon le 22 juillet.

## Le clic d'autorisation a porté sur la mauvaise action

Kiro a bien demandé l'autorisation, et l'utilisateur l'a bien accordée, puisque la demande portait sur la récupération d'URL qu'il venait lui-même de réclamer. L'étape qui portait la charge utile était une écriture de fichier. Écrire dans `~/.kiro/settings/mcp.json`, c'est écrire un chemin d'exécution.

Kodem le dit sans détour : le contenu de ce fichier, ce sont des commandes qui s'exécutent sur la machine avec les privilèges de l'utilisateur. The Hacker News décrit le même fichier comme la liste des serveurs Model Context Protocol de Kiro, accompagnée de la commande exacte qui démarre chacun d'eux.

```text
~/.kiro/settings/mcp.json
  <nom du serveur> -> <commande que Kiro exécute pour le démarrer>
```

> [!WARNING]
> Classez les chemins accessibles en écriture à un agent selon ce qui les relit, jamais selon leur extension. Tout chemin qu'un runtime recharge et exécute est un outil shell déguisé en fichier de configuration, et il relève du même garde-fou que l'outil shell. Configuration MCP, tâches de l'éditeur, hooks, fichiers rc du shell.

## Deux numéros de version qui se contredisent

Kodem retient la v0.11.130 comme la version dont il a confirmé la correction. The Hacker News rapporte qu'AWS déclare vulnérable tout ce qui précède la 0.11.34. Les deux chiffres diffèrent et aucune source publique ne les réconcilie.

## Impact pour une équipe

Si vos développeurs utilisent Kiro, retenez la borne haute, vérifiez dès aujourd'hui les versions installées face à la v0.11.130 et considérez l'écart entre les deux chiffres comme non tranché. Si vous livrez votre propre agent, listez chaque chemin qu'il peut écrire sans seconde validation, puis nommez le processus qui le relit. Tout ce qui répond « un runtime, automatiquement » est une primitive d'exécution que vous traitiez jusqu'ici comme du stockage.
