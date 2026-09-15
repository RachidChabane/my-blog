---
translationKey: sakana-fugu-ultra-v2-pool-excludes-frontier-scores-unaudited
lang: fr
slug: sakana-fugu-ultra-v2-pool-fixe-scores-non-verifies
title: Fugu Ultra v2 de Sakana exclut Fable 5 et GPT-6-Astra d'un pool que vous ne
  pouvez ni voir ni restreindre
publishDate: 15-09-2026
kind: release
tags:
- Sakana AI
- Fugu
- agents
- evals
summary: Sakana AI a publié Fugu Ultra v2 (fugu-ultra-v2.0) le 11 septembre 2026.
  Cet orchestrateur, servi derrière une API compatible OpenAI, s'appuie sur un pool
  fixe dont Fable 5, Fable 5.1 et GPT-6-Astra sont absents, et ne dit pas quels modèles
  ont répondu. OrcaRouter note que les chiffres de benchmark sont déclarés par Sakana
  et qu'aucun n'a été reproduit de façon indépendante. Je pense que ce pool interchangeable,
  vendu comme un rempart contre la dépendance aux fournisseurs, en crée une autre,
  car c'est Sakana qui procède à l'échange.
sources:
- label: Sakana AI blog, Introducing Fugu Max and Fugu Ultra v2
  url: https://sakana.ai/fugu-max-release/
  date: 11-09-2026
- label: Sakana console, Supported models
  url: https://console.sakana.ai/models
  date: 11-09-2026
- label: Sakana console, Pricing
  url: https://console.sakana.ai/pricing
  date: 11-09-2026
- label: Sakana Fugu product page and FAQ
  url: https://sakana.ai/fugu/
  date: 11-09-2026
- label: OrcaRouter blog, a competing router that does not carry Fugu, Fugu Ultra
    v2 explained by Alistair Wren
  url: https://www.orcarouter.ai/blog/fugu-ultra-v2-explained
  date: 11-09-2026
contentHash: sha256:bcf2a3b4c71878af
publishState: published
---

## Ce qui change

Sakana AI a publié Fugu Ultra v2 le 11 septembre 2026, avec Fugu Max, derrière son API compatible OpenAI [s1]. Son identifiant est `fugu-ultra-v2.0`, et l'alias `fugu-ultra` pointe désormais dessus [s2]. Sakana précise que Fable 5, Fable 5.1 et GPT-6-Astra ne font pas partie du pool de modèles de la v2 [s1]. Le tarif de `fugu-ultra-v2.0` est fixe, par million de tokens [s3].

| Type de token, par 1M | Standard | Contexte au-delà de 272K |
| :--- | ---: | ---: |
| Entrée | $5 | $10 |
| Sortie | $30 | $45 |
| Entrée en cache | $0.50 | $1.00 |

## Un pool interchangeable, mais pas par vous

Sakana vend son pool interchangeable de modèles ouverts et spécialisés comme un rempart contre la dépendance à un fournisseur, les révocations d'API et les coupures soudaines [s1]. Sa FAQ précise qui procède à l'échange. Le pool d'Ultra est fixe, alors que le modèle Fugu de base permet d'exclure certains modèles depuis la console [s4]. Sakana n'expose pas les modèles qui ont répondu, par choix de conception [s4]. Je pense que l'argument de la dépendance se retourne. Vous quittez un fournisseur que vous savez nommer pour un pool impossible à lister, et si Sakana y change un modèle, vos sorties peuvent bouger sans que la réponse dise pourquoi.

## Ni harnais ni protocole de reproduction

Sakana revendique le meilleur score, ou un score ex aequo, sur cinq des huit benchmarks, dans sa propre évaluation [s1]. OrcaRouter, un routeur concurrent qui ne propose pas Fugu, relève que Sakana n'a publié ni harnais d'évaluation, ni grille de scores par tâche, ni protocole de reproduction, et qu'aucun modèle Fugu n'a de page chez Artificial Analysis [s5]. Il relaie aussi les retours de testeurs indépendants qui signalent une latence variable, la délibération du coordinateur n'étant que du surcoût sur les tâches simples [s5]. Avec un pool caché, je ne vois pas comment rejouer ces scores sur vos tâches.

> [!IMPORTANT]
> D'après sa page produit, Fugu n'est pas encore disponible dans l'UE et l'EEE, le temps que Sakana se mette en conformité avec le RGPD [s4]. Si vos utilisateurs ou vos données y sont, je ne lancerais pas de pilote.

## Impact pour une équipe

Si vous appelez déjà Fugu, figez `fugu-ultra-v2.0` plutôt que l'alias `fugu-ultra`, qui pointe désormais sur la v2 [s2]. Sakana promet une mise à niveau en une ligne [s1], et un alias la fait à votre place. Avant tout pilote, lancez vos évals sur vos tâches et journalisez la latence et le coût par appel. Je bâtirais le budget sur la sortie, facturée $30 par million de tokens et $45 au-delà de 272K de contexte [s3]. Traitez les benchmarks de Sakana comme une hypothèse à vérifier, et gardez un repli vers un modèle que vous appelez directement, car le jour où la qualité dérive, vous ne verrez pas quels modèles ont répondu [s4].
