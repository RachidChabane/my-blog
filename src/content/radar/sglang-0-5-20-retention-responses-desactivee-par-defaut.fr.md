---
translationKey: sglang-0-5-20-responses-store-off-by-default
lang: fr
slug: sglang-0-5-20-retention-responses-desactivee-par-defaut
title: SGLang v0.5.20 coupe la rétention de /v1/responses, et la réponse affiche toujours
  store=true
publishDate: 20-09-2026
kind: release
tags:
- SGLang
- OpenAI
- inference
- agents
summary: 'SGLang a publié v0.5.20 le 18 septembre 2026 : l''endpoint /v1/responses
  ne conserve plus rien sans --enable-response-store, et la relecture, le chaînage
  par previous_response_id et l''arrière-plan renvoient 400. La génération synchrone,
  elle, accepte toujours store=true et répond sans rien garder, le champ store de
  la réponse reflétant la demande du client et non la rétention réelle. La panne arrive
  donc au tour suivant, pas au premier appel.'
sources:
- label: SGLang v0.5.20 release notes, Responses API storage is opt-in
  url: https://github.com/sgl-project/sglang/releases/tag/v0.5.20
  date: 18-09-2026
- label: SGLang pull request 39122, migration notice
  url: https://github.com/sgl-project/sglang/pull/39122
  date: 13-09-2026
- label: PyPI, sglang 0.5.20 upload date
  url: https://pypi.org/project/sglang/0.5.20/
  date: 18-09-2026
- label: OpenAI platform docs, conversation state and previous_response_id
  url: https://platform.openai.com/docs/guides/conversation-state.md
  date: 20-09-2026
- label: SGLang docs, prefill and decode disaggregation
  url: https://docs.sglang.io/advanced_features/pd_disaggregation.html
  date: 20-09-2026
contentHash: sha256:251dc5bc0387112f
publishState: published
---

## Ce qui change

SGLang v0.5.20 est arrivé sur PyPI le 18 septembre 2026 [s3]. Son endpoint `/v1/responses` compatible OpenAI ne conserve plus rien en mémoire si le serveur ne démarre pas avec `--enable-response-store` : sans ce drapeau, la relecture, le chaînage par `previous_response_id` et les requêtes en arrière-plan renvoient 400, et un déploiement prefill/decode ne peut pas l'activer du tout [s1]. Les requêtes en arrière-plan exigent `store=true`, donc sous le nouveau défaut elles n'ont plus où se poser [s2].

## Le champ qui affiche encore store=true

La phrase à relire est dans la pull request, pas dans les notes de version. La génération synchrone et le streaming acceptent toujours la valeur par défaut `store=true` et répondent normalement sans rien conserver, et le champ `store` de la réponse continue de refléter la demande du client alors que c'est la capacité serveur qui décide de la rétention réelle [s2]. La requête qui devrait vous alerter passe donc sans bruit, et le 400 tombe au tour suivant, quand la boucle revient avec `previous_response_id`. Enchaîner les réponses ainsi, c'est la manière dont le contrat amont file une conversation [s4]. Je préfère un drapeau qui échoue au premier appel plutôt qu'au second.

```text
--enable-response-store                # off par défaut : relecture, previous_response_id, arrière-plan
```

> [!IMPORTANT]
> Activer le drapeau ne vous donne pas un stockage de session. Le stockage activé reste local au processus, en mémoire et sans borne, sans TTL [s2]. Sur un seul nœud, c'est un confort ; entre plusieurs réplicas, c'est un défaut de cache ; sous une flotte d'agents qui tourne longtemps, c'est une fuite mémoire choisie.

## Impact pour une équipe

Inspectez le client, pas le serveur. Si `previous_response_id` ou `background` apparaît dans votre boucle d'agent, ce chemin casse sur cette version, sauf à poser le drapeau sur chaque réplica. La note de migration donne le correctif que j'appliquerais de toute façon : envoyer l'historique de conversation explicitement dans les requêtes synchrones [s2]. C'est aussi le seul qui survit à un passage en service désagrégé, où prefill et decode cessent de partager un même moteur [s5] et où le stockage n'est pas proposé [s1]. Si vous vous serviez de cet endpoint comme d'un stockage de session, la régression n'est pas le 400 : c'est le dictionnaire sans borne que vous remplissiez. Restez sur votre version actuelle une itération si vous chaînez aujourd'hui, et profitez-en pour remettre l'état dans la requête.
