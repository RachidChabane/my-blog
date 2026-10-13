---
translationKey: muse-wonder-api-model-and-subscription-only-full
lang: fr
slug: meta-muse-wonder-api-full-reserve-abonnement-muse-code
title: Meta Model API sert muse-wonder-1.0 à 4 $/20 $ par million de jetons, et Muse
  Wonder Full reste réservé aux abonnements Muse Code
publishDate: 13-10-2026
kind: release
tags:
- Meta
- Muse Wonder
- Muse Spark
- agents
- coding
summary: Le 12 octobre 2026, Meta a ouvert Muse Wonder sur Meta Model API sous l'identifiant
  muse-wonder-1.0, en préversion, à 4.00 $ par million de jetons en entrée et 20.00
  $ en sortie en mode Standard, tandis que Muse Wonder Full reste dans Muse Code,
  sur les forfaits Power Usage et Maximum Usage. Sur Model API, le mode Contributor,
  la remise accordée contre l'entraînement de Meta sur vos contenus, s'arrête à Muse
  Spark. Je garderais les charges Contributor sur Spark et je chiffrerais tout passage
  à Wonder sur les deux tarifs d'entrée, en cache et hors cache.
sources:
- label: Meta Developers blog, "Put your ideas to work with Muse Wonder and Muse Wonder
    Full"
  url: https://dev.meta.ai/resources/blog/build-with-muse-wonder
  date: 12-10-2026
- label: Meta Model API docs (undated page), "Models"
  url: https://dev.meta.ai/docs/models
  date: 12-10-2026
- label: Meta Model API docs (undated page), "Pricing and rate limits"
  url: https://dev.meta.ai/docs/pricing-rate-limits
  date: 12-10-2026
- label: 'Artificial Analysis, "Muse Wonder and Muse Wonder Full: a material jump
    in intelligence over previous Meta models"'
  url: https://artificialanalysis.ai/articles/muse-wonder
  date: 12-10-2026
- label: 'The Rundown, "Muse Wonder: How to Use Meta''s New AI for Work"'
  url: https://app.therundown.ai/guides/muse-wonder-guide
  date: 12-10-2026
contentHash: sha256:cc880fb394cf1f27
publishState: published
---

## Ce qui change

Le 12 octobre 2026, Meta a lancé Muse Wonder sur Meta Model API et dans Muse Code à 4 $ en entrée et 20 $ en sortie par million de jetons, et a réservé Muse Wonder Full aux abonnements Muse Code [s1]. Côté API, le modèle s'appelle `muse-wonder-1.0` et n'existe qu'en mode Standard ; Full y figure comme indisponible et relève des forfaits Power Usage et Maximum Usage [s2].

## Où s'arrête la remise

La ligne à lire dans ce lancement est, je pense, la ligne vide. La grille tarifaire de Model API, par million de jetons [s3] :

| Modèle | Mode | Entrée en cache | Entrée | Sortie |
| :--- | :--- | ---: | ---: | ---: |
| `muse-wonder-1.0` | Standard | 0.20 $ | 4.00 $ | 20.00 $ |
| `muse-wonder-1.0` | Contributor | Non disponible | Non disponible | Non disponible |
| `muse-spark-1.3` | Standard | 0.15 $ | 1.25 $ | 4.25 $ |
| `muse-spark-1.3-contributor` | Contributor | 0.002 $ | 0.10 $ | 0.20 $ |

Sur Model API, le mode Contributor fait tourner les mêmes modèles à prix fortement réduits, en échange du droit d'entraîner les futurs modèles de Meta sur vos contenus, et il n'est pas proposé pour Muse Wonder [s3]. Selon Artificial Analysis, l'entrée, entrée en cache comprise, pèse 76 % du coût d'une tâche de Muse Wonder (max) sur son Intelligence Index [s4] ; c'est, à mon sens, sur les deux colonnes d'entrée qu'il faut chiffrer.

## Wonder face à Full

Le meilleur argument de Meta, c'est que l'API perd peu : son blog affirme que Muse Wonder « brings comparable performance to Muse Wonder Full » [s1].

> [!CONFIRMED]
> Artificial Analysis donne 52 à Muse Wonder et 56 à Muse Wonder Full sur son Intelligence Index v4.3, tous deux à l'effort de raisonnement maximal [s4].

> [!INFERRED]
> À mon sens, cet écart compte moins que l'absence de tout prix API pour Full.

Artificial Analysis précise que Full n'est pas facturé au jeton et ne publie donc aucun coût par tâche pour lui [s4], et la grille de The Rundown n'indique aucun tarif public au jeton pour Full [s5]. Un essai de Full dans Muse Code dit ce que vaut l'abonnement. Il ne dit rien d'une facture API.

## Impact pour une équipe

Si un agent tourne aujourd'hui sur `muse-spark-1.3-contributor`, remplacer le modèle par `muse-wonder-1.0` fait passer ses tarifs de 0.002 $ à 0.20 $ par million de jetons d'entrée en cache et de 0.10 $ à 4.00 $ par million de jetons d'entrée, sans variante Contributor de repli [s3]. Ma recommandation : laissez les charges Contributor sur Spark, et n'envoyez vers Wonder que les tâches qui paient déjà le tarif Standard. Pour Full, la voie passe par un abonnement Muse Code Power Usage ou Maximum Usage [s2]. Avant de migrer un pipeline audio, notez que Meta exige une confirmation de la prise en charge de l'audio sur la plateforme de diffusion pour les usages qui en dépendent [s1]. Le modèle est en préversion [s2] : je n'arrêterais pas encore un budget sur ces tarifs.
