---
translationKey: gemini-4-argon-ga-long-decode-background-hops
lang: fr
slug: gemini-4-argon-disponible-long-decode-tranches-arriere-plan
title: Gemini 4 Argon passe en disponibilité générale, et sur l'Interactions API une
  réponse de plus de 64K jetons se génère par tranches en arrière-plan
publishDate: 14-10-2026
kind: release
tags:
- Gemini
- Gemini 4 Argon
- Google
- inference
- API
summary: Le 13 octobre 2026, Google a mis Gemini 4 Argon en disponibilité générale
  sur la Gemini API. Au-delà de 65 536 jetons de sortie, le long decode en arrière-plan
  sur l'Interactions API avance par tranches de 64K jetons au plus, et le client doit
  concaténer toutes les étapes model_output ; sans max_output_tokens, le serveur s'arrête
  après 64K jetons. La continuation côté client existe dans la GenerateContent API
  et arrive bientôt sur l'Interactions API. La mise en cache explicite n'est pas prise
  en charge, temperature, top_p et top_k sont ignorés, et les tarifs passent de 2
  $ et 10 $ à 4 $ et 20 $ par million de jetons le 1er décembre 2026. Je budgéterais
  dès maintenant aux tarifs de décembre.
sources:
- label: Gemini API docs, "Release notes"
  url: https://ai.google.dev/gemini-api/docs/changelog
  date: 13-10-2026
- label: Gemini API docs, "What's new in Gemini 4 Argon"
  url: https://ai.google.dev/gemini-api/docs/latest-model
  date: 13-10-2026
- label: Gemini API docs, "Gemini 4 Argon" model page
  url: https://ai.google.dev/gemini-api/docs/models/gemini-4-argon
  date: 13-10-2026
- label: Gemini API docs, "Gemini Developer API pricing"
  url: https://ai.google.dev/gemini-api/docs/pricing
  date: 13-10-2026
- label: ComputingForGeeks, "Gemini 4 Argon Pricing, Benchmarks and API Tested"
  url: https://computingforgeeks.com/gemini-4-argon-released-features-benchmarks/
  date: 13-10-2026
contentHash: sha256:3947d8e70f2ec43e
publishState: published
---

## Ce qui change

Le 13 octobre 2026, Google a mis Gemini 4 Argon (`gemini-4-argon`) en disponibilité générale sur la Gemini API [s1]. La sortie maximale est de 65 536 jetons par défaut en appel synchrone, et monte jusqu'à 1 048 576 avec le long decode [s3]. Sur l'Interactions API, l'exécution en arrière-plan avec un `max_output_tokens` supérieur à 65 536 produit cette réponse par tranches (hops) de 64K jetons au plus, que les serveurs de Google enchaînent pour vous [s2].

## Une réponse longue devient une tâche à interroger

Je pense que le long decode est la partie de cette version qui touche votre code. Google présente l'exécution en arrière-plan comme la façon la plus simple de le lancer [s2], et sur cette voie une réponse de plus de 64K jetons devient une interaction en arrière-plan que l'on interroge jusqu'à son terme. Chaque tranche ajoute une étape `model_output` à `interaction.steps` : il faut donc concaténer le texte de toutes les étapes `model_output` une fois l'interaction terminée [s2]. L'exemple curl de Google fait cette concaténation avec jq dès que le statut n'est plus ni `in_progress` ni `queued` [s2] :

```bash
jq -r '[.steps[]? | select(.type == "model_output") | .content[]? | select(.type == "text") | .text] | join("")'
```

À mon sens, un client qui ne lit que la dernière étape ne garde que la dernière tranche.

> [!IMPORTANT]
> Si vous passez `background: true` sans définir `max_output_tokens`, le serveur s'arrête après 64K jetons [s2].

## L'objection la plus solide

Le long decode est optionnel : une application aux réponses courtes pourrait donc ignorer tout cela. Je ne le ferais pas, car la réflexion consomme la même limite : Google demande aux applications existantes dont la limite est inférieure à 32K de relever `max_output_tokens` à au moins 32 768, puisqu'Argon peut consacrer une plus grande part de cette limite à la réflexion [s2]. La sortie est facturée jetons de réflexion compris [s4]. ComputingForGeeks rapporte qu'Argon, au niveau high, a consommé trois jetons de réflexion pour chaque jeton affiché [s5]. D'après moi, un `max_output_tokens` plus élevé rehausse le plafond de la facture autant que celui de la réponse. Les tarifs du niveau payant, par million de jetons en dollars [s4] :

| Niveau payant | Jusqu'au 30 novembre 2026 | À partir du 1er décembre 2026 |
| :--- | ---: | ---: |
| Entrée | 2.00 $ | 4.00 $ |
| Sortie (jetons de réflexion compris) | 10.00 $ | 20.00 $ |

## Impact pour une équipe

Ma recommandation : placez le long decode derrière une seule fonction utilitaire qui fixe toujours `max_output_tokens` et concatène chaque étape `model_output`. La continuation côté client, déjà présente dans la GenerateContent API et bientôt disponible sur l'Interactions API [s2], pourra s'y brancher plus tard. Dans la même modification, supprimez les appels qui créent ou référencent `cached_content`, car la mise en cache explicite n'est pas prise en charge sur Argon, et retirez `temperature`, `top_p` et `top_k`, qui sont ignorés [s2]. Testez chaque charge aux niveaux de réflexion low, medium et high [s3], et budgétez à 4 $ en entrée et 20 $ en sortie par million de jetons, les tarifs qui s'appliquent à partir du 1er décembre 2026 [s4].
