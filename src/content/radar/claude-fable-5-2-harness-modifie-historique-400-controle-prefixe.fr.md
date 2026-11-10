---
translationKey: claude-fable-5-2-harness-history-edit-400-prefix-check
lang: fr
slug: claude-fable-5-2-harness-modifie-historique-400-controle-prefixe
title: Claude Fable 5.2 renvoie un 400 quand un harness modifie ce qui précède un
  bloc de réflexion, et les notes de version d'Anthropic appliquent le contrôle à
  tous les comptes
publishDate: 10-11-2026
kind: release
tags:
- Claude
- Claude Fable 5.2
- OpenClaw
- agents
summary: 'Les notes de version d''Anthropic datées du 9 novembre 2026 indiquent que
  Claude Fable 5.2 applique le contrôle de préfixe à tous les comptes, quelle que
  soit leur ancienneté : un harness qui modifie ce qui précède un bloc de réflexion
  reçoit un 400. La pull request 196459 d''OpenClaw capture une route directe qui
  envoie drop_block sans aucun 400 sur 13 requêtes, alors que des blocs de réflexion
  sont abandonnés côté serveur. Ma recommandation : forcez l''erreur sur chaque route
  que vous livrez avant de changer le model id.'
sources:
- label: Anthropic, Claude Platform release notes, November 9, 2026
  url: https://platform.claude.com/docs/en/release-notes/overview.md
  date: 09-11-2026
- label: vercel-labs/fx issue 1798, Claude Fable 5.2 sessions die with a thinking
    signature 400
  url: https://github.com/vercel-labs/fx/issues/1798
  date: 09-11-2026
- label: taigrr/fantasy pull request 7, drop thinking blocks on prefix mismatch
  url: https://github.com/taigrr/fantasy/pull/7
  date: 10-11-2026
- label: OpenClaw pull request 196459, new Claude models lose reasoning and hit 400s
  url: https://github.com/openclaw/openclaw/pull/196459
  date: 10-11-2026
- label: taigrr/crush pull request 91, drop stale thinking blocks when tools change
  url: https://github.com/taigrr/crush/pull/91
  date: 10-11-2026
contentHash: sha256:73c6bb2ad6de3e3f
publishState: published
---

## Ce qui change

D'après les notes de version d'Anthropic datées du 9 novembre 2026, Claude Fable 5.2 et Claude Mythos 5.2 appliquent le contrôle de préfixe à tous les comptes, quelle que soit leur ancienneté, alors que Claude Fable 5.1 renvoie l'erreur par défaut sur les comptes créés à partir du 31 août 2026 [s1]. Selon ces notes, du code qui modifie le prompt `system`, `tools` ou un message antérieur, puis renvoie un bloc de réflexion 5.2 d'un tour ultérieur, reçoit un 400 [s1].

## Zéro 400 ne prouve pas grand-chose

Je pense que le 400 est l'échec qu'il vous faut, car ses correctifs peuvent masquer la modification. Le déclencheur est banal : dans l'issue 1798 de vercel-labs/fx, fx insère un message utilisateur dans le tour précédent, après le résultat d'outil, et chaque prompt suivant échoue [s2]. Sur ACP, fx n'envoie que `HTTP error` avec un `stopReason` à refused, que les clients affichent comme un refus du modèle [s2]. Le rapport fx ajoute que `anthropic/claude-opus-5.5` accepte le même historique [s2]. À ma lecture, un run propre sur le modèle sortant dit peu : un compte antérieur à cette date peut passer sur Fable 5.1 puis recevoir son premier 400 au changement, séquence qu'aucun de ces rapports ne montre.

La pull request 7 de taigrr/fantasy règle `thinking.block_binding.prefix_mismatch_behavior` sur `drop_block` pour chaque requête adaptive, et indique que l'API abandonne alors le bloc fautif et tous les blocs de réflexion suivants [s3]. Les captures de la pull request 196459 d'OpenClaw montrent l'effet, une session OpenClaw par run, chacune changeant de modèle [s4] :

| Run OpenClaw | HTTP 400 | `prefix_binding_mismatch` | `model_binding_mismatch` | Blocs de réflexion |
| :--- | ---: | ---: | ---: | :--- |
| Avant le correctif, base URL personnalisée | 7 / 18 | non indiqué | non indiqué | jamais conservés, chaque 400 relancé sans réflexion [s4] |
| Avant, direct, forcé à `"error"` | 1 / 15 | non indiqué | non indiqué | perdus après le passage à Fable 5.1 [s4] |
| Avant, direct, avec envoi de `drop_block` | 0 / 13 | 2 | 2 | abandonnés côté serveur [s4] |
| Après, direct, avec envoi de `drop_block` | 0 / 14 | 0 | 0 | conservés [s4] |

À ma lecture, tout se joue sur les deux dernières lignes : zéro 400 des deux côtés, donc le code de statut ne sépare pas blocs perdus et blocs conservés.

## L'objection

L'objection la plus solide : une session dont chaque prompt suivant échoue est pire qu'une session amputée d'une partie de son raisonnement. Je suis d'accord pour une version déjà en production. Je le jugerais pourtant à `input_transformations` : la pull request 196459 d'OpenClaw rapporte `[]` sur chaque requête de chaque run corrigé [s4].

## Impact pour une équipe

Si votre harness construit son propre tableau `messages`, ma recommandation : testez chaque route livrée avant de passer le model id à `claude-fable-5-2`, car OpenClaw rattache ses 400 aux sessions passant par un proxy ou une base URL Anthropic personnalisée [s4]. Forcez `prefix_mismatch_behavior` à `"error"`, comme les runs stricts d'OpenClaw [s4], avec la valeur bêta `thinking-binding-controls-2026-08-01` citée par l'erreur de fx [s2]. Faites réfléchir le modèle après un appel d'outil : d'après fx, la réponse finale ne porte de bloc signé que si Claude a choisi de réfléchir, d'où un échec d'allure aléatoire [s2]. Commencez par les modifications relevées : un message utilisateur inséré dans un tour antérieur chez fx [s2], un tableau `tools` instable au sein d'une session dans la pull request 91 de taigrr/crush [s5]. Si `drop_block` reste en production, je mettrais une alerte sur tout `prefix_binding_mismatch`.
