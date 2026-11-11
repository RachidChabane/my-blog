---
translationKey: fireworks-notifies-impacted-customers-notion-insights-transcripts-zdr-scope
lang: fr
slug: fireworks-previent-clients-touches-notion-transcriptions-insights-perimetre-zdr
title: Fireworks prévient les clients dont les données ont été touchées, et Notion
  indique que le dataset remis par Fireworks contenait des transcriptions de chats
  Notion AI utilisées par Insights
publishDate: 11-11-2026
kind: security
tags:
- Fireworks AI
- Notion
- security
- inference
summary: 'La mise à jour du 9 novembre 2026 de Fireworks AI indique que Fireworks
  prévient les clients dont les données ont été touchées et signale un impact sur
  des secrets, des datasets et des modèles incomplets pour un nombre limité de comptes,
  sans impact détecté sur les produits qu''il présente comme zero data retention par
  défaut. Notion indique que le dataset remis par Fireworks le 8 novembre contenait
  des transcriptions de chats Notion AI utilisées par sa fonctionnalité Insights,
  pour laquelle Notion faisait tourner des jobs de classification chez Fireworks.
  Ma recommandation : listez chaque chemin par lequel vos données restent stockées
  chez un fournisseur d''inférence, et demandez si ses conditions ZDR nomment ce produit.'
sources:
- label: Fireworks AI, Update on October 2026 security incident, last updated November
    9, 2026
  url: https://fireworks.ai/security/bulletins/october-2026-security-incident-update
  date: 09-11-2026
- label: Notion, Fireworks AI incident security advisory, updated November 11, 2026
  url: https://www.notion.com/security/advisories/security-incident-involving-a-third-party-ai-vendor
  date: 11-11-2026
contentHash: sha256:2f35384ad69715eb
publishState: published
---

## Ce qui change

Le 9 novembre 2026, Fireworks AI a mis à jour le bulletin de son incident de sécurité d'octobre 2026 : Fireworks indique prévenir les clients dont les données ont été touchées, et signale un impact sur des secrets, des datasets et des modèles incomplets pour un nombre limité de comptes [s1]. Selon l'avis de Notion mis à jour le 11 novembre 2026, le dataset remis par Fireworks le 8 novembre contenait des transcriptions de chats Notion AI utilisées par sa fonctionnalité Insights [s2].

## Où s'arrête la rétention zéro

Je pense que cet incident se lit comme une carte de ce qu'un fournisseur conserve au repos. Fireworks présente Inference, Training SDK et Nexus comme zero data retention (ZDR) par défaut, et n'y a détecté aucun impact [s1]. Fireworks signale aussi un impact sur des informations de compte et de facturation [s1]. Fireworks précise que le Training SDK reste disponible en ZDR, c'est-à-dire sans donnée d'entraînement stockée au repos [s1]. À ma lecture, cette précision trace la frontière : tout ce qui figure parmi les impacts est stocké, et la liste ZDR nomme des chemins qui, par défaut, ne gardent rien.

## L'objection

L'objection la plus solide : le ZDR par défaut couvre les produits qu'une équipe appelle en production, et un dataset stocké, c'est le client qui a choisi de l'uploader. Je suis d'accord pour une équipe qui charge ses propres données d'entraînement. Notion est le cas que cette réponse oublie : Notion confiait à Fireworks des jobs de classification pour Insights, une fonctionnalité qui aide les clients à comprendre leur propre usage de l'IA, et le dataset remis par Fireworks contenait des transcriptions de chats Notion AI utilisées par Insights [s2]. Aucune des deux pages ne dit quel produit Fireworks hébergeait ces transcriptions, et je ne m'avancerai pas. À ma lecture, les personnes dont les échanges figuraient dans ce dataset n'ont rien choisi du lieu où Notion les traitait.

## Impact pour une équipe

Si vos données atteignent un fournisseur d'inférence autrement que par une requête en direct, ma recommandation : listez dès maintenant ces chemins (jobs batch, datasets uploadés, entrées de fine-tuning, secrets stockés, fonctionnalités annexes qui envoient du texte d'utilisateur à un prestataire). Pour chacun, demandez par écrit au fournisseur si ses conditions ZDR nomment ce produit. Sur Batch Inference ou l'entraînement sur datasets, Fireworks a suspendu l'upload et le téléchargement de datasets en libre-service le temps de l'enquête [s1]. Notion conseille aux clients concernés de changer les mots de passe, clés d'API et autres identifiants collés dans Notion AI pendant la période de l'incident [s2]. Par excès de prudence, Notion a déconnecté ses systèmes de Fireworks dès le matin du 3 novembre [s2]. Je reprendrais ce réflexe quitte à élargir le périmètre ensuite, puisque Fireworks et Notion disent tous deux que leur enquête se poursuit [s1] [s2].
