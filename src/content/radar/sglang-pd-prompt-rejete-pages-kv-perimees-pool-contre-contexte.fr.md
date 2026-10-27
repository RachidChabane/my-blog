---
translationKey: sglang-pd-rejected-prompt-stale-kv-pages-pool-vs-context-check
lang: fr
slug: sglang-pd-prompt-rejete-pages-kv-perimees-pool-contre-contexte
title: Une requête trop longue, rejetée, a lu le cache KV d'autres utilisateurs dans
  le mode prefill/decode de SGLang, et un pool KV plus petit que la fenêtre de contexte
  rendait ce chemin atteignable
publishDate: 27-10-2026
kind: security
tags:
- SGLang
- Cloudflare
- Workers AI
- inference
- security
summary: 'Cloudflare et l''équipe SGLang ont publié des divulgations coordonnées le
  26 octobre 2026. Selon Cloudflare, son déploiement de GLM 5.3 sur Workers AI avait
  une fenêtre de contexte de 1,048,576 tokens, un pool KV de prefill de 681,280 tokens,
  et 155 réponses ont été touchées. Les deux billets indiquent qu''en mode prefill/decode,
  une requête rejetée passait quand même le relais, et que le decode lisait des pages
  de cache jamais remplies pour elle. Ma recommandation : comparez le pool KV à la
  longueur de contexte sur chaque nœud de prefill et de decode, puis passez à v0.5.22
  ou plus récent, comme le recommande Cloudflare.'
sources:
- label: Cloudflare Blog, Cross-request KV cache exposure in the GLM-5.3 Workers AI
    model, and our remediation with SGLang
  url: https://blog.cloudflare.com/kv-cache-exposure-remediation/
  date: 26-10-2026
- label: 'LMSYS Org blog, SGLang security update: improving request isolation'
  url: https://www.lmsys.org/blog/2026-10-26-cf-security
  date: 26-10-2026
- label: 'SGLang pull request #38935'
  url: https://github.com/sgl-project/sglang/pull/38935
  date: 16-09-2026
contentHash: sha256:fab4c2bce59567d7
publishState: published
---

## Ce qui change

Le 26 octobre 2026, Cloudflare et l'équipe SGLang ont publié des divulgations coordonnées sur une exposition du cache KV entre requêtes sur Workers AI [s1][s2]. Selon Cloudflare, GLM 5.3 tournait avec une fenêtre de contexte de 1,048,576 tokens alors que le pool de cache KV de ses GPU de prefill n'en contenait que 681,280, et 155 réponses ont été touchées [s1]. Les deux billets décrivent le même chemin : en prefill/decode désagrégé, une requête marquée pour rejet passait quand même le relais, et le decode lisait des pages de cache jamais remplies pour elle [s1][s2]. Cloudflare ajoute que ces pages périmées contenaient encore des données de requêtes antérieures [s1].

## Deux valeurs que rien ne réconcilie

À mon avis, le contrôle de déploiement compte plus que le correctif. Selon Cloudflare, SGLang dimensionne le pool KV au démarrage avec la mémoire GPU restante après le chargement des poids, et rien n'oblige le pool et la longueur de contexte à concorder [s1]. Le billet de SGLang indique que ce décalage de configuration a rendu le chemin de rejet atteignable [s2]. Cloudflare range la quantification, le parallélisme de tenseurs et la taille des CUDA graphs parmi les changements qui font varier le pool [s1] ; selon moi, un prompt valide le mois dernier peut donc basculer sur le chemin de rejet après une banale requantification.

> [!CONFIRMED]
> Selon Cloudflare, le client recevait un HTTP 200 et une réponse cohérente, avec un `prompt_tokens` conforme au long prompt [s1].

> [!INFERRED]
> Ma lecture : un test de charge qui ne lit que les codes de statut serait passé au vert sur ce déploiement.

## L'objection la plus solide

Le périmètre est étroit : l'incident exige un déploiement désagrégé et un pool sous-dimensionné, et les deux billets disent que le chemin sur un seul nœud renvoyait une erreur [s1][s2]. Pour cet incident, je suis d'accord. Or ce pool, personne ne l'a choisi : selon Cloudflare, sa taille n'est pas une valeur de configuration [s1]. Le billet de SGLang décrit en outre une condition de concurrence distincte sur les transferts abandonnés [s2], et situe les configurations PD par défaut touchées entre la branche v0.4.x et v0.5.21, ou v0.5.22 pour MORI [s2].

## Impact pour une équipe

Ma recommandation, si vous servez SGLang en prefill/decode désagrégé : relevez la taille du pool KV dans le journal de démarrage de chaque nœud de prefill et de decode [s1], et si le pool est plus petit, réduisez la longueur de contexte, comme le conseille Cloudflare [s1]. Refaites ce contrôle après chacun de ces changements. Le tableau de Cloudflare place le correctif de l'exposition, #36988, dans v0.5.20, et Cloudflare recommande v0.5.22 ou plus récent [s1]. Je ne compterais pas #38935 comme le correctif : sa pull request le qualifie de correctif de gaspillage et de latence [s3].
