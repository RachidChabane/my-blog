---
translationKey: vllm-0-32-cors-closed-by-default-api-key-still-the-control
lang: fr
slug: vllm-0-32-cors-ferme-par-defaut-la-cle-api-reste-le-controle
title: vLLM 0.32.0 ferme par défaut l'accès des navigateurs d'une autre origine, et
  sa pull request rappelle que CORS ne remplace pas l'authentification de l'API
publishDate: 19-10-2026
kind: security
tags:
- vLLM
- security
- inference
summary: 'vLLM v0.32.0, sorti le 18 octobre 2026, fait passer la valeur par défaut
  de --allowed-origins de ["*"] à une liste vide : une page d''une autre origine ne
  lit plus ses réponses par défaut. Sa pull request rappelle que CORS ne remplace
  pas l''authentification de l''API, et DEV Community, citant le guide de sécurité
  de vLLM, indique que --api-key laisse /invocations, /score et /pooling ouverts.
  Ma recommandation : listez vos origines exactes ou aucune, définissez --api-key,
  et envoyez un preflight vers le nom d''hôte public, car une passerelle comme SMG
  v1.12.0 répondait à toute origine avec une politique ouverte.'
sources:
- label: vLLM v0.32.0 release notes
  url: https://github.com/vllm-project/vllm/releases/tag/v0.32.0
  date: 18-10-2026
- label: PyPI JSON API, vllm 0.32.0 upload record
  url: https://pypi.org/pypi/vllm/0.32.0/json
  date: 18-10-2026
- label: vLLM pull request 61009, "[Security] Restrict default CORS origins"
  url: https://github.com/vllm-project/vllm/pull/61009
  date: 11-10-2026
- label: DEV Community (sam ros, InferPrice), "vLLM 0.32 stops letting any website
    call your model server"
  url: https://dev.to/sampop3/vllm-032-stops-letting-any-website-call-your-model-server-1604
  date: 14-10-2026
- label: SMG v1.13.0 release notes
  url: https://github.com/smg-project/smg/releases/tag/v1.13.0
  date: 15-10-2026
- label: 'SMG pull request 3315, "fix(gateway): no cross-origin allowance without
    --cors-allowed-origins"'
  url: https://github.com/smg-project/smg/pull/3315
  date: 13-10-2026
contentHash: sha256:96a4f095d333040d
publishState: published
---

## Ce qui change

vLLM v0.32.0 est sorti le 18 octobre 2026 [s1][s2], et ses notes de version rangent un même changement sous Security et Breaking changes : CORS n'autorise plus toutes les origines par défaut [s1]. La pull request 61009 remplace la valeur par défaut `["*"]` de `--allowed-origins` par une liste vide dans les deux implémentations du serveur, et les listes explicites comme le wildcard en opt-in fonctionnent toujours [s3].

## Ce que la valeur par défaut ne fait pas

Je pense que la note de version minimise le sujet. Ce changement règle ce qu'une page d'une autre origine peut lire, et la pull request précise que CORS, contrôle d'accès du navigateur, ne remplace pas l'authentification de l'API et n'empêche pas l'envoi de toutes les requêtes cross-origin simples [s3]. Pour curl, le SDK OpenAI et les agents côté serveur, qui ne font pas de CORS [s4], le contrôle reste `--api-key`, et DEV Community, citant le guide de sécurité de vLLM, note que la clé ne protège que les préfixes `/v1`, `/v2`, `/inference` et `/cohere`, tandis que `/invocations`, `/score` et `/pooling` restent ouverts même avec une clé [s4].

## Quelle couche répond au preflight

DEV Community ajoute que si NGINX, Envoy ou une passerelle d'API en amont traite elle-même les requêtes OPTIONS, la valeur par défaut de vLLM n'entre jamais en jeu [s4]. SMG en est une : ses notes de version v1.13.0 placent vLLM derrière son servicer gRPC en Rust [s5].

| Couche | Option d'origine | Défaut avant | Défaut après |
| :--- | :--- | :--- | :--- |
| vLLM | `--allowed-origins` | `["*"]` [s3] | liste vide en 0.32.0 [s1][s3] |
| Passerelle SMG | `--cors-allowed-origins` | absente, donc ouvert en v1.12.0 [s5][s6] | absente, donc fermé en v1.13.0 [s5] |

> [!CONFIRMED]
> Une passerelle SMG lancée sans `--cors-allowed-origins` répondait au preflight de n'importe quelle origine avec `access-control-allow-origin: *`, car la liste d'origines vide construisait la politique CORS ouverte [s6], et les notes de v1.13.0 disent de passer `'*'` pour garder la politique ouverte de v1.12.0 [s5].

> [!INFERRED]
> Selon ma lecture, une liste d'origines vide voulait dire l'inverse d'une couche à l'autre : mettre à jour vLLM seul ne change rien pour un navigateur qui l'atteint par une passerelle restée sur cette version.

## L'objection la plus solide

Pour DEV Community, un vLLM qu'aucun navigateur n'appelle directement est la configuration normale derrière une passerelle [s4] ; à ce compte, cette option n'a jamais été le contrôle. Je l'admets : c'est pourquoi il faut tester l'URL qu'atteignent vraiment vos utilisateurs [s4].

## Impact pour une équipe

Si un front-end d'une autre origine appelle vLLM depuis le navigateur, je m'attends à ce que la mise à jour le casse : la pull request indique que ces déploiements doivent configurer `--allowed-origins` avec leurs origines de confiance [s3], et DEV Community obtient un 400 sur le preflight dans une application Starlette de substitution, sans avoir fait tourner vLLM [s4]. Les origines doivent correspondre exactement en schéma, hôte et port [s4], alors listez chacune d'elles :

```bash
--allowed-origins '["https://chat.internal.example"]'
```

Ma recommandation avant la mise à jour : définissez cette liste, ou `'[]'` si aucun navigateur ne doit joindre vLLM ; définissez `--api-key` et filtrez `/invocations`, `/score` et `/pooling` à l'ingress ; n'associez jamais `["*"]` à `--allow-credentials`, comme le signale DEV Community [s4] ; puis envoyez un preflight d'une origine étrangère au nom d'hôte public pour voir quelle couche répond.
