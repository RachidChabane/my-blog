---
translationKey: opencode-2-mcp-servers-code-mode-by-default
lang: fr
slug: opencode-2-serveurs-mcp-code-mode-par-defaut
title: 'OpenCode 2.0 place par défaut tous les serveurs MCP en code mode : l''agent
  peut appeler vos outils depuis un script'
publishDate: 15-10-2026
kind: release
tags:
- OpenCode
- MCP
- agents
- coding
summary: 'La note d''Anomaly sur OpenCode 2.0, datée du 12 octobre 2026, place par
  défaut tous les serveurs MCP en code mode : chacun devient une fonction qu''un script
  écrit par l''agent peut appeler, en enchaînant les appels d''outils en un seul aller-retour.
  La version 1.19.0, publiée le 11 octobre 2026, mène à la 2.0 via opencode upgrade
  --major et n''installe plus les mises à jour automatiquement ; les plugins 1.0 ne
  fonctionneront pas en 2.0 et l''API serveur est complètement différente. Je vérifierais
  quels serveurs MCP ont un accès en écriture avant de migrer.'
sources:
- label: Anomaly notes index
  url: https://anoma.ly/notes/
  date: 12-10-2026
- label: Anomaly, "OpenCode 2.0" release note
  url: https://anoma.ly/notes/opencode-2-0/
  date: 12-10-2026
- label: GitHub, anomalyco/opencode release v1.19.0
  url: https://github.com/anomalyco/opencode/releases/tag/v1.19.0
  date: 11-10-2026
- label: 'explainx.ai, "OpenCode 2.0: Code Mode, Background Agents and a Shared Server,
    and How to Upgrade"'
  url: https://explainx.ai/blog/opencode-2-0-code-mode-background-agents-shared-server-sdk-upgrade-guide-2026
  date: 12-10-2026
contentHash: sha256:c28b23a869fc0977
publishState: published
---

## Ce qui change

La note d'Anomaly sur OpenCode 2.0, datée du 12 octobre 2026 [s1], indique que tous les serveurs MCP sont placés en code mode par défaut dans la 2.0 [s2]. Code Mode est un interpréteur JavaScript minimal livré sous le nom `@opencode/codemode`, qui transforme les serveurs MCP et les endpoints OpenAPI en fonctions appelables [s4]. La version 1.19.0, publiée le 11 octobre 2026, sert de passerelle [s4] : depuis celle-ci, `opencode upgrade --major` fait passer à OpenCode 2, et les mises à jour ne s'installent plus automatiquement [s3].

## C'est le réglage par défaut qu'il faut relire

Je pense que ce réglage par défaut mérite votre attention avant la migration, davantage que l'interpréteur lui-même. Le code mode permet à votre agent d'écrire des scripts qui appellent un outil, parcourent les résultats et appellent un autre outil, en un seul aller-retour au lieu d'appels successifs [s2]. La démo d'Anomaly montre une étape `execute` qui appelle `tools.github.list_issues` et `tools.linear.save_issue` [s2]. À mon sens, un tour de modèle peut désormais être un script, et le réglage par défaut étend cette possibilité à tous les serveurs que vous avez configurés.

> [!IMPORTANT]
> explainx.ai, qui précise ne pas avoir fait tourner la 2.0 lui-même, prévient que si vous branchez un serveur doté d'un accès en écriture, Code Mode peut l'appeler en boucle [s4].

Ce que je n'ai pas trouvé dans la note, c'est le comportement des demandes de permission à l'intérieur d'un script : une fois par appel d'outil, ou une fois par étape `execute`. Tant que ce n'est pas documenté, je partirais de l'hypothèse la moins stricte.

## L'objection la plus solide

Le code mode ne serait qu'une convention d'appel : les outils et leurs permissions sont ceux qu'un agent 1.x pouvait déjà atteindre, donc rien de nouveau n'est exposé. Sur l'ensemble des outils, je suis d'accord. Ce qui change, c'est ce qu'un seul tour peut en faire, et sur combien de serveurs à la fois. Comme chaque serveur est inscrit par défaut [s2], la revue qu'un opt-in aurait imposée serveur par serveur doit désormais, selon moi, se faire en une passe avant la migration.

## Impact pour une équipe

Ma recommandation : puisque la 1.19.0 n'installe plus les mises à jour automatiquement, OpenCode 2 attend que vous exécutiez `opencode upgrade --major` ou `/update` [s3] ; rangez l'audit dans le même ticket. Avant la mise à niveau, dressez la liste des serveurs MCP dotés d'un accès en écriture, retirez ceux dont l'agent n'a pas besoin et gardez les demandes de permission actives pour les outils destructeurs, comme le conseille explainx.ai [s4]. Migrez dans la même modification vos plugins et tout ce qui est scripté contre le serveur 1.x : les plugins 1.0 ne fonctionneront pas en 2.0, et l'API serveur est complètement différente [s2].
