---
translationKey: claude-message-threads-continue-history-lost-behind-gateway-that-drops-the-field
lang: fr
slug: claude-message-threads-historique-perdu-derriere-passerelle-qui-retire-le-champ
title: Les message threads de Claude n'envoient que les nouveaux messages, et sur
  un tour simple une passerelle qui retire le champ thread répond 200 sans l'historique
publishDate: 09-11-2026
kind: release
tags:
- Claude
- Claude Code
- LiteLLM
- Vercel AI Gateway
- agents
summary: 'Le blog d''Anthropic annonce les message threads en bêta publique le 2 novembre
  2026 : après la première requête, chaque tour n''envoie que les nouveaux messages.
  Un rapport sur vercel/ai et deux pull requests LiteLLM décrivent des intermédiaires
  qui retirent le champ thread : un simple tour utilisateur revient sans l''historique,
  avec un 200 chez LiteLLM, et un tour qui ne contient qu''un tool_result échoue en
  400. Ma recommandation : derrière un proxy, quel qu''il soit, faites un test en
  deux tours par le vrai chemin avant d''activer les threads.'
sources:
- label: Anthropic, Make long-running agents faster with message threads
  url: https://claude.com/blog/message-threads
  date: 02-11-2026
- label: Anthropic docs, Message threads
  url: https://platform.claude.com/docs/en/build-with-claude/message-threads.md
  date: 02-11-2026
- label: vercel/ai issue 24425, AI Gateway report
  url: https://github.com/vercel/ai/issues/24425
  date: 03-11-2026
- label: LiteLLM pull request 49755
  url: https://github.com/BerriAI/litellm/pull/49755
  date: 03-11-2026
- label: LiteLLM pull request 49048
  url: https://github.com/BerriAI/litellm/pull/49048
  date: 29-10-2026
- label: Pi pull request 11545, earendil-works/pi
  url: https://github.com/earendil-works/pi/pull/11545
  date: 28-10-2026
contentHash: sha256:71ff7a216a887ba3
publishState: published
---

## Ce qui change

Le blog d'Anthropic, daté du 2 novembre 2026, annonce les message threads en bêta publique sur la Claude Platform [s1]. D'après la documentation, la première requête porte toute la conversation et `"thread": {"type": "create"}` ; chaque requête `continue` suivante n'envoie que les messages depuis la réponse précédente et l'id de cette réponse, avec le header bêta `message-threads-2026-08-12` [s2]. Le même blog annonce que, avec les message threads activés par défaut pour la plupart des utilisateurs de Claude Code, le TTFT médian baisse d'environ 35% sur les requêtes de 500k à 1M de tokens [s1].

## Le tour qui répond encore 200

Je pense que cette sortie concerne d'abord ce qui sépare votre code d'Anthropic. À ma lecture, une requête complète transporte son historique, et un proxy qui retire un champ inconnu ne perd que ce champ ; sur une requête `continue`, le même retrait emporte la conversation. Le rapport sur vercel/ai [s3] et les pull requests LiteLLM 49755 [s4] et 49048 [s5] le constatent sur deux produits :

| Requête | Vercel AI Gateway, issue 24425 | LiteLLM `/v1/messages`, pull requests 49755 et 49048 |
| :--- | :--- | :--- |
| Create, id renvoyé | `aitxt-` sur la route AI SDK, `gen_` sur la route Messages [s3] | `msg_01...` [s4] |
| Continue, simple tour utilisateur | Exécuté comme une nouvelle conversation, 17 tokens en entrée, `warnings` vide, sur la route AI SDK [s3] | 200, "I don't have access to information about your name" [s4] |
| Continue, seulement un `tool_result` | 400 sur la route Messages [s3] | 400 [s5] |
| Continue, id inventé ou périmé | 200 sur la route Messages, comme une nouvelle conversation [s3] | 200 avec une réponse de chat, là où le SDK attend un 404 `thread_not_found` [s4] |

À ma lecture, le 400 est l'échec utile, et ces rapports le placent sur les tours d'outil. La reprise de la documentation, qu'exécute aussi le helper du SDK, part d'un 404 `thread_not_found` [s2]. Je pense qu'une réponse réussie ne déclenche rien. Transmettre le champ ne suffit pas : la pull request LiteLLM 49755 doit aussi empêcher que `error.details.error_code` soit aplati en chaîne, ce qui cassait le replay du SDK [s4].

## L'objection

L'objection la plus solide : ce sont deux défauts de jeunesse dans deux produits, qu'un correctif refermera. Je suis d'accord pour ces deux-là. À mon sens, l'exposition leur survivra : la pull request 11545 de Pi n'active les threads par défaut que pour le provider anthropic sur api.anthropic.com, car les gateways qui retirent les champs inconnus perdraient la conversation [s6], et sur l'issue vercel/ai, un collaborateur écrit que la gateway ne pourra pas le prendre en charge aujourd'hui, vu la politique de zéro rétention et l'isolation des utilisateurs, sauf en BYOK [s3].

## Impact pour une équipe

Si votre application appelle l'API Claude via un proxy, ma recommandation : avant d'activer les threads, passez le test en deux tours du rapport vercel/ai sur le vrai chemin, en énonçant un fait au tour create et en le redemandant au tour continue [s3]. Je ne me fierais pas à l'id du tour create : la pull request LiteLLM 49755 montre `msg_01...` sur un chemin qui a perdu le tour [s4]. Je mettrais une alerte sur tout continue dont le total de tokens, en cache et hors cache, a la taille du dernier message, puisque le blog d'Anthropic annonce une consommation inchangée [s1]. Pour Claude Code derrière LiteLLM, la pull request 49048 rapporte la conversation antérieure perdue en pleine session dans sa reproduction [s5] : une session sans incident ne prouve rien. Je garderais les threads désactivés sous rétention zéro : la documentation les dit non éligibles ZDR [s2].
