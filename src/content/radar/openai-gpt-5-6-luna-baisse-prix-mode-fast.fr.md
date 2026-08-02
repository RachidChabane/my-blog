---
translationKey: gpt-5-6-price-cut-fast-mode
lang: fr
slug: openai-gpt-5-6-luna-baisse-prix-mode-fast
title: OpenAI baisse GPT-5.6 Luna de 80 % et rebaptise le traitement prioritaire en
  mode Fast
publishDate: 02-08-2026
kind: release
tags:
- OpenAI
- GPT-5.6
- Responses API
- inference
- pricing
summary: 'OpenAI a ramené GPT-5.6 Luna à 0,20 $ / 1,20 $ par million de tokens le
  30 juillet 2026 et Terra à 2,00 $ / 12,00 $, Sol restant inchangé, et le traitement
  prioritaire est devenu le mode Fast. Le plancher compte plus que la remise : le
  fan-out sur des appels bon marché, reranking par chunk compris, tient désormais
  dans un budget qui le refusait il y a un mois.'
sources:
- label: Primary - OpenAI developer changelog, Jul 30 pricing and Fast mode
  url: https://developers.openai.com/api/docs/changelog
  date: 30-07-2026
- label: Primary - OpenAI API pricing, standard and Fast tables
  url: https://developers.openai.com/api/docs/pricing
  date: 30-07-2026
- label: Primary - OpenAI Fast mode guide
  url: https://developers.openai.com/api/docs/guides/fast-mode
  date: 30-07-2026
- label: Corroboration - InfoWorld, OpenAI drops GPT-5.6 Luna and Terra API prices
    by up to 80%
  url: https://www.infoworld.com/article/4203865/openai-drops-gpt-5-6-luna-and-terra-api-prices-by-up-to-80.html
  date: 31-07-2026
- label: Corroboration - CNBC, OpenAI price cut
  url: https://www.cnbc.com/2026/07/30/open-ai-price-cut-gpt.html
  date: 30-07-2026
contentHash: sha256:9393b1d1a28aab29
publishState: published
---

## Ce qui change

OpenAI a revu les tarifs de la famille GPT-5.6 le 30 juillet 2026 : Luna coûte 80 % de moins, Terra 20 % de moins, et Sol ne bouge pas [s1][s5]. La bascule concerne `v1/responses` et `v1/chat/completions` [s1]. Le même jour, le traitement prioritaire a été rebaptisé mode Fast, et les requêtes qui envoient encore `service_tier: "priority"` continuent de fonctionner [s1][s3].

## Le nouveau plancher

| Modèle | Avant | Après |
| :--- | ---: | ---: |
| gpt-5.6-sol | 5,00 $ / 30,00 $ | inchangé [s2][s5] |
| gpt-5.6-terra | 2,50 $ / 15,00 $ [s4] | 2,00 $ / 12,00 $ [s2] |
| gpt-5.6-luna | 1,00 $ / 6,00 $ [s4] | 0,20 $ / 1,20 $ [s2] |

(entrée / sortie par million de tokens, contexte court.)

Un plancher divisé par cinq n'allège presque pas la facture que vous payez déjà. Il change ce que vous pouvez vous permettre de lancer, et c'est à mon sens le vrai intérêt de cette baisse : le reranking par chunk sur chaque récupération cesse d'être une expérience à justifier. Luna passe d'ailleurs 3,75 fois sous `gpt-5.4-mini`, à 0,75 $ / 4,50 $ [s2], le palier intermédiaire de la génération précédente, des deux côtés du compteur.

Le calcul du fan-out change de signe. Côté entrée, Luna coûtait 1,00 $ par Mtok [s4] contre 2,50 $ pour Terra [s4] : cinq appels Luna revenaient à cinq fois 1,00 $, soit le double d'un appel Terra unique. À 0,20 $ [s2] contre 2,00 $ [s2], cinq fois 0,20 $ ne pèse plus que la moitié de ce même appel. Le fan-out était l'option chère, il devient l'option économique.

L'objection tient : une baisse de 80 % sur un palier que votre tâche ne peut pas utiliser ne rapporte rien, et une cascade coûte du temps d'ingénierie plus un harnais d'évaluation. Or aucun des deux arguments ne survit à l'inversion ci-dessus, qui change la liste des expériences tenant dans le budget au lieu de rogner les appels que vous passez déjà.

## Le mode Fast coûte le double, partout

Le mode Fast facture exactement le double du standard, en entrée comme en sortie, sur les trois paliers 5.6 : luna à 0,40 $ / 2,40 $ et sol à 10,00 $ / 60,00 $ [s2]. Le gain de 2,5x, lui, n'est rattaché qu'à un seul modèle nommé, `gpt-5.6-sol` [s1][s3], alors que la phrase d'ouverture du guide promet jusqu'à 2,5x plus rapide sans citer de palier [s3]. Lisez-y où le chiffre est ancré plutôt qu'un silence à reprocher : le doublement est acquis partout, la mesure non, donc sur Terra et Luna je mesure avant de basculer. Deux pièges se cachent dessous. L'objet de réponse renvoie `priority` pour GPT-5.6 et les modèles antérieurs même quand la requête disait `fast` [s3], donc une télémétrie qui filtre sur `"fast"` ne se déclenchera jamais ; le contexte long, les modèles fine-tunés et les embeddings restent hors périmètre [s3].

> [!IMPORTANT]
> Settings > Project > General > Project Service Tier positionné sur Fast fait basculer au double toute requête qui omet `service_tier`, jobs batch compris, et c'est pourquoi le guide conseille de garder les gros ETL et les traitements par lots hors du mode Fast [s3]. Au-delà de 1M TPM avec une hausse de plus de 50 % en quinze minutes, les requêtes peuvent retomber sans bruit en vitesse et en tarif standard, avec `service_tier: "default"` en réponse [s3].

## Impact pour une équipe

Reprenez la sélection des paliers cette semaine plutôt que d'inscrire la baisse au budget sur le papier : ce qui reste sur Terra par simple confort de marge paie dix fois le prix d'entrée de Luna, et l'économie n'arrive que si le routeur bouge. Auditez `service_tier` au niveau du projet avant la prochaine facture, car un projet réglé sur Fast double chaque requête non étiquetée pendant que l'objet de réponse affiche toujours `priority` : le dashboard ne vous le dira pas [s3]. Ce que j'écarterais, c'est le mode Fast comme correctif de latence générique hors de Sol, où le doublement du prix est acquis alors que le 2,5x est rattaché à un autre modèle [s1][s3].
