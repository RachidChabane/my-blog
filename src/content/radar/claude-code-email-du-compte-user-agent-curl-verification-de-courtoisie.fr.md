---
translationKey: claude-code-account-email-in-curl-user-agent-courtesy-check
lang: fr
slug: claude-code-email-du-compte-user-agent-curl-verification-de-courtoisie
title: Des utilisateurs de Claude Code signalent l'adresse e-mail de leur compte dans
  l'en-tête User-Agent de curl, et le README du mod de confidentialité qualifie sa
  vérification de courtoisie qui couvre une seule forme
publishDate: 06-11-2026
kind: security
tags:
- Claude
- Claude Code
- Anthropic
- security
- agents
summary: 'Des utilisateurs signalent que Claude Code place l''adresse e-mail de leur
  compte dans l''en-tête User-Agent de curl, alors que la version v2.1.234 demandait
  au modèle de ne pas l''envoyer à des services sans rapport. La version v2.1.317
  ajoute une vérification, le README du mod de confidentialité qualifie sa vérification
  de courtoisie qui couvre une seule forme, et un commentateur de Hacker News qui
  déclare travailler sur Claude Code écrit que l''adresse quittera le contexte du
  modèle à la prochaine version. Ma recommandation : quittez le canal stable en 2.1.311,
  testez votre build et comptez cette vérification comme un filtre.'
sources:
- label: Anthropic, Claude Code release v2.1.317
  url: https://api.github.com/repos/anthropics/claude-code/releases/tags/v2.1.317
  date: 03-11-2026
- label: Hacker News comment 50388176, by a commenter who states they work on Claude
    Code
  url: https://news.ycombinator.com/item?id=50388176
  date: 06-11-2026
- label: npm registry, dist-tags for @anthropic-ai/claude-code
  url: https://registry.npmjs.org/-/package/@anthropic-ai/claude-code/dist-tags
  date: 06-11-2026
- label: Anthropic, claude-code repository, mods/privacy/README.md at commit 90380ef
  url: https://raw.githubusercontent.com/anthropics/claude-code/90380efca7f9d73e206fac453f841b6acd664f4d/mods/privacy/README.md
  date: 06-11-2026
- label: Comment on GitHub issue 107757 on anthropics/claude-code, user test
  url: https://api.github.com/repos/anthropics/claude-code/issues/comments/6676218676
  date: 06-11-2026
- label: Anthropic, Claude Code release v2.1.234
  url: https://api.github.com/repos/anthropics/claude-code/releases/tags/v2.1.234
  date: 17-08-2026
- label: GitHub issue 104774 on anthropics/claude-code, user report
  url: https://github.com/anthropics/claude-code/issues/104774
  date: 24-10-2026
- label: 'explainx.ai, Claude Code Leaks Your Email in Headers: 5-Min Fix'
  url: https://explainx.ai/blog/claude-code-leaks-your-email-user-agent-header-how-to-stop-it-2026
  date: 05-11-2026
- label: GitHub issue 98584 on anthropics/claude-code, user report
  url: https://github.com/anthropics/claude-code/issues/98584
  date: 01-10-2026
- label: GitHub issue 107144 on anthropics/claude-code, user report
  url: https://github.com/anthropics/claude-code/issues/107144
  date: 04-11-2026
contentHash: sha256:305227303713b13d
publishState: published
---

## Ce qui change

La note de version v2.1.317, publiée le 3 novembre 2026, ajoute une vérification qui demande l'accord avant qu'un appel d'outil web ou shell n'envoie l'adresse e-mail du compte sur le réseau [s1]. Le 6 novembre 2026, un commentateur de Hacker News qui déclare travailler sur Claude Code a écrit que l'adresse sortirait du contexte du modèle à la prochaine version, attendue début de semaine prochaine [s2]. Ce jour-là, les dist-tags du registre npm affichaient `stable` à 2.1.311 et `latest` à 2.1.318 [s3], donc le canal stable n'avait pas la vérification.

## Ce que dit chaque source

| Source | Sur une correspondance | Portée |
| :--- | :--- | :--- |
| Note de version v2.1.317 [s1] | demande | un appel d'outil web ou shell |
| Commentateur de Hacker News [s2] | demande | un appel d'outil web ou une commande de type curl, et il n'empêche pas tous les cas |
| README du mod de confidentialité [s4] | refus, sans aucune invite | WebFetch et WebSearch ne sont pas vérifiés |
| Test d'un utilisateur en 2.1.318, `cc-plugin-privacy` chargé, ticket 107757 [s5] | ne refuse pas le cas documenté | hors du test |

Le README qualifie le mod de courtoisie qui couvre une seule forme, et range un script qui contient l'adresse parmi ce qui passe [s4].

## Ce que montre la séquence

La v2.1.234 disait à Claude de ne pas envoyer l'adresse à des services sans rapport, sauf demande [s6], et le ticket 104774 rapporte 9 requêtes curl vers sec.gov qui la portaient, le 2026-09-26 et le 2026-10-03, depuis des sous-agents munis de cette règle [s7]. À ma lecture, la vérification déplace seulement le problème d'un cran, car elle filtre ce que le modèle a déjà écrit. Je pense que le retrait promis touche la cause, avec une limite : le README cite lui-même `$(git config user.email)` parmi ce qui passe [s4], donc à mon sens un modèle muni d'un shell peut lire une adresse sur le disque quand un site en réclame une.

## L'objection

L'objection la plus solide : il faut un site qui demande un contact, et explainx.ai cite un exploitant qui n'a trouvé aucune adresse dans un User-Agent dans environ 10 millions de lignes de journaux [s8]. Je suis d'accord, cela semble rare. À mon sens, la rareté protège mal : le déclencheur appartient au site, et le ticket 98584 décrit un site factice qui réclame toujours un contact et auquel Sonnet 5.5 a envoyé l'adresse plusieurs fois [s9].

## Impact pour une équipe

Si votre équipe utilise Claude Code avec un compte, ma recommandation : quittez le canal stable 2.1.311 pour 2.1.317 ou plus, comme le conseille le commentateur [s2], et comptez le mod comme un filtre aux trous listés par son README [s4]. Lancez sur votre build le test sans réseau décrit sur le ticket 107757 [s5], car je ne peux pas dire à quelle ligne votre build correspond. Auditez vos tâches sans opérateur : le ticket 107144 rapporte qu'en exécution headless `claude -p --dangerously-skip-permissions`, personne ne peut répondre à la demande, et des appels qui n'envoient rien sont refusés, avec trace dans `permission_denials` [s10]. Pour votre propre harness, je garderais tout identifiant hors du contexte du modèle dès qu'un outil déterministe peut le fournir : selon le commentateur, l'adresse y est entrée car Claude inventait des noms pour des balises comme `@author` [s2].
