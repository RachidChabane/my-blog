---
translationKey: postman-desktop-installs-agent-plugins-installer-mints-codex-trust-record
lang: fr
slug: postman-desktop-installe-plugins-agents-installeur-approuve-hook-codex
title: L'application de bureau Postman a installé ses plugins dans Claude Code et
  Codex chez deux utilisateurs ; le code de l'installeur postman-plugin 0.6.0 inscrit
  l'approbation de son propre hook Codex
publishDate: 04-11-2026
kind: security
tags:
- Postman
- Codex
- Claude Code
- Claude
- security
summary: 'Le 25 octobre 2026, indicava a signalé qu''une installation existante de
  l''application de bureau Postman 12.33.4 avait ajouté des plugins Postman à Claude
  Code et à Codex via auto-existing-upgrade, et le 3 novembre 2026, ronthedrummer
  a décrit le même chemin après une mise à jour de 12.31.3 à 12.35.1, sans entrée
  trusted_hash dans config.toml. Le code source de l''installeur postman-plugin 0.6.0,
  au commit 9d5544f, écrit trusted_hash sous hooks.state pour son propre hook Codex
  de démarrage de session via config/batchWrite. Selon le commit 6975d3e de Postman,
  Codex 0.164 lie l''approbation d''un hook de plugin à un hash de chaque fichier
  du plugin, si bien que chaque commit sur main obligeait Codex à redemander. Ma recommandation
  : après une mise à jour de Postman, relisez hooks.state dans ~/.codex/config.toml
  et les plugins activés dans ~/.claude/settings.json, puis retirez les entrées que
  vous n''avez pas ajoutées.'
sources:
- label: 'indicava, postmanlabs/postman-app-support issue 14370: [SEVERE] Desktop
    auto-installs Codex/Claude plugins; installer attempts to trust its own startup
    hook'
  url: https://github.com/postmanlabs/postman-app-support/issues/14370
  date: 25-10-2026
- label: ronthedrummer, comment on postmanlabs/postman-app-support issue 14370
  url: https://github.com/postmanlabs/postman-app-support/issues/14370#issuecomment-6618575621
  date: 03-11-2026
- label: 'Postman, postman-plugin installer source at the 0.6.0 release commit 9d5544f:
    installer/src/hosts/codex-hooks.ts'
  url: https://raw.githubusercontent.com/postmanlabs/postman-plugin/9d5544f815a1d636dbd0126c609e827bf06fc0d7/installer/src/hosts/codex-hooks.ts
  date: 03-11-2026
- label: Postman, postman-plugin release @postman/postman-plugin@0.6.0
  url: https://github.com/postmanlabs/postman-plugin/releases/tag/%40postman/postman-plugin%400.6.0
  date: 03-11-2026
- label: 'Postman, postman-plugin commit 6975d3e: feat(installer): auto-approve Postman''s
    Codex hook'
  url: https://github.com/postmanlabs/postman-plugin/commit/6975d3e163fd5c6d91c6d0440a11146b3053035b.patch
  date: 21-10-2026
- label: The New Stack (Amanda Caswell), A developer opened Postman. Then two AI coding
    agents changed without their permission.
  url: https://thenewstack.io/postman-plugin-coding-agents/
  date: 03-11-2026
- label: Postman Docs, Install the Postman plugin
  url: https://learning.postman.com/docs/postman-plugin/install/overview
  date: 21-10-2026
- label: Postman, postman-plugin hooks/session-start-context.md at the 0.6.0 release
    commit 9d5544f
  url: https://raw.githubusercontent.com/postmanlabs/postman-plugin/9d5544f815a1d636dbd0126c609e827bf06fc0d7/hooks/session-start-context.md
  date: 03-11-2026
contentHash: sha256:d39ade94bcc583a9
publishState: published
---

## Ce qui change

Le 25 octobre 2026, indicava a signalé qu'une installation existante de Postman desktop 12.33.4 avait ajouté des plugins Postman à Claude Code et à Codex via `auto-existing-upgrade` [s1]. Le 3 novembre 2026, ronthedrummer a rapporté que l'application était passée de 12.31.3 à 12.35.1 au lancement, puis qu'`auto-existing-upgrade` avait installé la CLI et les deux plugins [s2]. Le code source de l'installeur, au commit `9d5544f` de la version `@postman/postman-plugin@0.6.0`, approuve son propre hook Codex de démarrage de session après l'installation [s3][s4].

## Une approbation tient en une entrée de config

Côté installeur, `approvePostmanHook` dialogue avec Codex via `app-server`, lit le hook avec `hooks/list`, puis écrit son hash via `config/batchWrite` [s3]. Extrait tel quel de codex-hooks.ts [s3] :

```ts
export const POSTMAN_HOOK_KEY = 'postman@postman:hooks/codex-hooks.json:session_start:0:0';
writeAttempted = true; await rpc.request('config/batchWrite', trustEdit(hook.currentHash));
edits: [{ keyPath: 'hooks.state', value: { [POSTMAN_HOOK_KEY]: { trusted_hash: hash } }, mergeStrategy: 'upsert' }], reloadUserConfig: true
```

Je pense que la leçon est là : dans Codex, consentir à un hook revient à une entrée `trusted_hash` sous `hooks.state`, qu'un programme lancé sous votre compte peut écrire. Le commit 6975d3e de Postman donne le motif : selon Postman, Codex 0.164 lie l'approbation d'un hook de plugin à un hash de chaque fichier du plugin, si bien que chaque commit sur main relançait la demande d'approbation [s5]. À ma lecture, un hash sur chaque fichier a rendu la demande assez fréquente pour que l'éditeur l'automatise. The New Stack note que les développeurs qui installent le plugin directement via Codex doivent examiner et approuver le hook de leur côté [s6].

> [!IMPORTANT]
> indicava écrit que le code établit la tentative d'approbation, et que l'entrée de confiance seule ne prouve pas qui l'a créée [s1]. Le second rapport, de ronthedrummer, indique que `config.toml` ne contient aucune entrée `hooks.state` ou `trusted_hash` [s2]. Je vérifierais donc ce qui figure vraiment sur votre machine.

## L'objection de la documentation

L'objection la plus solide : la documentation Postman indique qu'une seule commande installe le plugin dans chaque agent détecté [s7], et le session-start-context.md de Postman fait primer les instructions de l'utilisateur, comme AGENTS.md ou CLAUDE.md, sur sa consigne [s8]. Je suis d'accord : qui lance cette commande obtient ce que décrit la documentation. À mon sens, les deux rapports changent la donne : indicava comme ronthedrummer partent d'une installation existante de Postman desktop et citent `auto-existing-upgrade` [s1][s2].

## Impact pour une équipe

Si Postman desktop cohabite avec Codex ou Claude Code, ma recommandation : après chaque mise à jour de Postman, relisez la table `hooks.state` de `~/.codex/config.toml` et les plugins activés dans `~/.claude/settings.json`, puis retirez les entrées que vous n'avez pas ajoutées. La clé à chercher est `postman@postman:hooks/codex-hooks.json:session_start:0:0`, selon le code source de l'installeur [s3]. La panne que je surveillerais : un hook Codex de démarrage de session que vous n'avez pas approuvé, à côté du session-start-context.md de Postman, qui demande à l'agent de charger la skill `postman:api-engineer` avant toute tâche d'API non triviale [s8].
