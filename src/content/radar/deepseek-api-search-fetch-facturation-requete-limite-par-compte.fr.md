---
translationKey: deepseek-search-fetch-request-billing-and-account-level-qps
lang: fr
slug: deepseek-api-search-fetch-facturation-requete-limite-par-compte
title: DeepSeek ouvre ses API Search et Fetch, facturées à la requête et limitées
  chacune par compte, toutes clés d'API confondues
publishDate: 18-10-2026
kind: release
tags:
- DeepSeek
- Claude Code
- Codex
- agents
- rag
summary: 'DeepSeek a ouvert ses API Search et Fetch le 17 octobre 2026, chacune à
  $0.75 pour mille requêtes réussies et limitée à 5 requêtes par seconde, calculées
  au niveau du compte quelle que soit la clé d''API. Une recherche de 50 résultats
  coûte autant qu''une recherche de 1, et les requêtes en échec ne sont pas facturées.
  Les appels d''outils côté serveur de Claude Code ou de Codex sur l''API DeepSeek
  sont gratuits jusqu''au 31 octobre 2026 à 16:00 UTC. Ma recommandation : demandez
  50 résultats, filtrez sur rerank_score et authority, et comptez les recherches côté
  serveur de vos agents avant le début de la facturation.'
sources:
- label: DeepSeek API Docs, "Search & Fetch" guide
  url: https://api-docs.deepseek.com/guides/search/
  date: 17-10-2026
- label: DeepSeek API Docs, Change Log entry "Opening up the in-house search API"
  url: https://api-docs.deepseek.com/updates
  date: 17-10-2026
- label: 'DeepSeek API Docs news, "DeepSeek-V4.1-Flash-1017: Wish-Driven Programming
    Made Real"'
  url: https://api-docs.deepseek.com/news/news261017/
  date: 17-10-2026
- label: PPC Land (Luis Rijo), "DeepSeek prices web search for AI agents at $0.75
    per 1,000 calls"
  url: https://ppc.land/deepseek-prices-web-search-for-ai-agents-at-0-75-per-1-000-calls/
  date: 17-10-2026
- label: Startup Fortune (Dave Barr), "DeepSeek Opens Its Search and Fetch APIs at
    $0.75 per 1,000 Calls"
  url: https://startupfortune.com/deepseek-opens-its-search-and-fetch-apis-at-075-per-1000-calls/
  date: 18-10-2026
contentHash: sha256:5d13b3f358934234
publishState: published
---

## Ce qui change

DeepSeek a ouvert ses API Search et Fetch le 17 octobre 2026 [s1][s2]. Search, sur `POST https://api.deepseek.com/v1/tools/search`, accepte un `count` compris entre 1 et 50, et Fetch renvoie une seule page web en Markdown [s1]. Chacune coûte $0.75 pour mille requêtes réussies et se limite à 5 requêtes par seconde et par compte [s1].

## Une requête, deux budgets

Je pense qu'il faut concevoir autour de la requête, car DeepSeek s'en sert à la fois pour la facture et pour la limite de débit. `count` ne règle que le nombre de résultats renvoyés, sans effet sur le prix par requête [s1] : ma recommandation est de demander 50 résultats d'un coup et de filtrer dans votre code sur `rerank_score` (1.5 ou plus signale un résultat de qualité) et `authority` (3 ou plus signale une source très fiable) [s1] :

```json
{
  "query": "...",
  "count": 50,
  "need_content": false
}
```

> [!CONFIRMED]
> Les limites de QPS sont calculées au niveau du compte, quelle que soit la clé d'API utilisée, et les requêtes au-delà reçoivent un HTTP 429 ; une requête n'est facturable que si elle renvoie un HTTP 200 et produit un résultat [s1].

> [!INFERRED]
> Selon ma lecture, donner sa propre clé à chaque sous-agent n'apporte aucune marge, et un nouvel essai après un refus coûte de la latence sans alourdir la facture.

## L'objection la plus solide

PPC Land apporte le contrepoids : cinq requêtes par seconde représentent 432 000 appels par jour à plein régime, un plafond qu'il juge adapté aux applications individuelles et aux agents de code [s4]. Je l'admets pour un agent qui enchaîne les recherches une à une. Le total journalier masque pourtant les rafales : un planificateur qui lance ses sous-agents ensemble envoie leurs recherches dans la même seconde, et le guide conseille d'attendre puis de réessayer après un HTTP 429 [s1], ce qui transforme la limite en latence.

## Impact pour une équipe

Les appels d'outils côté serveur de DeepSeek Harness, Claude Code ou Codex sur l'API DeepSeek passent déjà gratuitement par Search et Fetch [s1], et la facturation commence le 31 octobre 2026 à 16:00 UTC [s3]. PPC Land qualifie ce changement de facturation d'étroit, puisqu'il concerne les clients de l'API DeepSeek qui font passer ces outils par DeepSeek [s4], et Startup Fortune précise qu'il ne s'agit pas d'une recherche gratuite pour les utilisateurs de Claude Code ou de Codex en général [s5]. Ma recommandation : avant cette date, comptez les recherches côté serveur que vos sessions sur l'API DeepSeek font en une semaine ordinaire, et comparez sur vos propres requêtes une recherche avec `need_content` à true et une recherche suivie d'appels Fetch, car le guide ne dit pas à quel point le contenu renvoyé est complet [s1]. Le guide ne dit pas non plus si les appels côté serveur comptent dans les limites de votre compte : répartissez la limite de chaque API entre les agents du compte.
