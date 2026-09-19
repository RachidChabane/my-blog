---
translationKey: claude-code-2-1-277-agents-md-builtin-plugin
lang: fr
slug: claude-code-2-1-277-lit-agents-md-plugin-integre
title: Claude Code 2.1.277 lit AGENTS.md, et un plugin intégré décide quand
publishDate: 19-09-2026
kind: release
tags:
- Claude
- Claude Code
- AGENTS.md
- agents
- tooling
summary: 'Anthropic a publié Claude Code 2.1.277 le 18 septembre 2026 : dans un projet
  sans CLAUDE.md, il lit désormais AGENTS.md. Le lecteur est un plugin intégré agents-md,
  dont le défaut arbitre au lieu de fusionner : tout CLAUDE.md ou CLAUDE.local.md
  situé dans votre répertoire de travail ou au-dessus l''emporte, et le mode qui lit
  les deux est ignoré dans les réglages projet et locaux. En lisant le registre npm
  le 19 septembre, j''ai vu le dist-tag stable encore à 2.1.267, sous le plancher
  v2.1.277. Je garde un CLAUDE.md dont tout le corps tient dans l''import d''AGENTS.md.'
sources:
- label: Claude Code changelog, the 2.1.277 entry
  url: https://code.claude.com/docs/en/changelog
  date: 18-09-2026
- label: Claude Code docs, how Claude remembers your project
  url: https://code.claude.com/docs/en/memory
  date: 18-09-2026
- label: AGENTS.md, the open format for coding agents
  url: https://agents.md/
  date: 19-09-2026
- label: WindowsForum news desk on Claude Code 2.1.277 and AGENTS.md
  url: https://windowsforum.com/news/claude-code-2-1-277-adds-agents-md-fallback-not-merge.445031/
  date: 18-09-2026
- label: npm registry, @anthropic-ai/claude-code dist-tags and publish times
  url: https://registry.npmjs.org/@anthropic-ai/claude-code
  date: 19-09-2026
contentHash: sha256:5ef334897e847519
publishState: published
---

## Ce qui change

Anthropic a publié Claude Code 2.1.277 le 18 septembre 2026 : dans un projet sans CLAUDE.md, il lit désormais AGENTS.md [s1]. Le paquet npm est paru à 2026-09-18T16:22:26.548Z [s5]. Le lecteur est un plugin intégré nommé `agents-md`, piloté par un paramètre `Project instructions` dont la valeur par défaut est `claude-md-or-agents-md` [s2].

## Ce que le défaut arbitre

Ce défaut choisit un fichier et ignore l'autre. Un `CLAUDE.md`, un `.claude/CLAUDE.md` ou un `CLAUDE.local.md` présent dans votre répertoire de travail ou au-dessus fait lire ces fichiers et met AGENTS.md à l'écart, alors que votre CLAUDE.md utilisateur, celui géré par votre organisation et les fichiers `.claude/rules/` continuent de se charger à côté [s2]. Le piège tient au fichier local : ajouter un `CLAUDE.local.md` pour vos notes non versionnées empêche Claude de lire l'AGENTS.md de l'équipe, pour vous seul [s2]. Le mode qui lit les deux, `claude-md-and-agents-md`, existe, or Claude Code l'ignore dans les fichiers de réglages projet et locaux [s2]. L'équipe ne peut donc pas versionner ce correctif. Chacun le règle chez lui, ou l'organisation par réglages managés [s2].

> [!IMPORTANT]
> Le support disparaît dans toute session qui ne récupère pas les feature flags d'Anthropic, ce que la documentation illustre par Amazon Bedrock, un autre fournisseur tiers, ou la télémétrie désactivée, ainsi que sous `disableAllHooks` ou `allowManagedHooksOnly` [s2]. Là, l'entrée `Project instructions` n'apparaît même pas dans /config [s2], et le changelog liste la fonction comme pas encore disponible sur Bedrock, Vertex ni Foundry [s1]. L'interopérabilité arrive en dernier dans les déploiements verrouillés, là où un fichier d'instructions partagé valait le plus.

## Ce que je commite vraiment

Je garde le chemin ennuyeux que la documentation bénit déjà : un CLAUDE.md dont le corps tient dans l'import.

```markdown
@AGENTS.md
```

Il déclenche les hooks `InstructionsLoaded` et fait figurer le fichier dans /memory et /context, deux choses qu'un AGENTS.md lu via le paramètre ne fait pas [s2], et il fonctionne dans les sessions citées plus haut. Garder cet import ne fait jamais lire AGENTS.md deux fois, quelle que soit la valeur retenue [s2].

## Impact pour une équipe

Commencez par vérifier votre canal d'installation. En lisant le registre npm le 19 septembre, j'ai vu le dist-tag `stable` pointer sur 2.1.267 [s5], sous le plancher v2.1.277 fixé par la documentation [s2], tandis que `latest` affichait déjà 2.1.278 [s5]. Si vous installez depuis `stable`, vous n'avez pas encore cette fonction. La décision est ailleurs : votre AGENTS.md est maintenant lu par Claude Code aussi, donc tout ce qui y a été écrit pour un autre agent devient l'instruction de Claude. Relisez-le une fois avec cet œil. Le site du format revendique plus de 60k projets open source [s3], et WindowsForum pose le constat que je donnerais à une équipe plateforme : un repli ne vous donne pas le fichier de politique partagé que vous croyez adopter [s4].
