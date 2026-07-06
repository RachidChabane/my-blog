---
translationKey: gpt-5-6-sol-terra-luna
lang: fr
slug: gpt-5-6-sol-terra-luna-preversion
title: GPT-5.6 arrive en préversion sur trois paliers et réécrit en silence la facture
  du cache
publishDate: 06-07-2026
kind: release
tags:
- GPT-5.6
- OpenAI
- Codex
- inference
summary: 'OpenAI a ouvert le 2026-06-26 une préversion limitée de GPT-5.6 sur trois
  paliers, Sol, Terra et Luna. La vraie nouvelle technique : les écritures de cache
  coûtent désormais 1,25x l''entrée non mise en cache.'
sources:
- label: OpenAI release notes - Previewing GPT-5.6 Sol
  url: https://releasebot.io/updates/openai
  date: 26-06-2026
- label: 'DataCamp - GPT-5.6 Sol, Terra, and Luna: OpenAI''s Next-Gen Model Family'
  url: https://www.datacamp.com/blog/gpt-5-6-sol-luna-terra
  date: 26-06-2026
- label: 'edenai - GPT-5.6 Sol: Benchmarks, Pricing and API Access Guide 2026'
  url: https://www.edenai.co/post/gpt-5-6-sol-benchmarks-pricing-api-access-guide
  date: 29-06-2026
contentHash: sha256:1d803596a6d7b39b
publishState: published
---

## Ce qui change

OpenAI a ouvert le 2026-06-26 une préversion limitée de GPT-5.6, et la nouvelle n'est pas un modèle mais trois : Sol, le vaisseau amiral pour le raisonnement complexe et le travail agentique de longue haleine ; Terra, l'option équilibrée par défaut ; et Luna, la strate rapide et bon marché pour les tâches à fort volume et sensibles à la latence [s1][s2]. Pendant la préversion, ces modèles ne sont accessibles qu'à des partenaires sélectionnés via l'API et Codex, la disponibilité générale étant annoncée pour les semaines à venir [s1][s3]. En parallèle, OpenAI a discrètement réécrit la facturation du cache de prompts [s1].

## L'échelle tarifaire

| Palier | Entrée / 1M | Sortie / 1M | Pour |
| :--- | ---: | ---: | :--- |
| Sol | 5,00 $ | 30,00 $ | raisonnement complexe, agentique, code [s3] |
| Terra | 2,50 $ | 15,00 $ | le défaut ; au niveau de GPT-5.5 pour environ moitié prix [s3] |
| Luna | 1,00 $ | 6,00 $ | fort volume, sensible à la latence [s3] |

Le découpage en paliers n'est pas la vraie nouvelle. Gemini et Claude proposent déjà une échelle prix-performance ; qu'OpenAI scinde son modèle phare en trois paliers facturés signifie surtout que le choix du modèle devient, pour ses utilisateurs aussi, une décision de routage explicite et non un défaut hérité.

## Le contrat de cache a changé

Voilà ce qu'il faut vraiment lire. Pour GPT-5.6 et les modèles suivants, les écritures de cache sont facturées à 1,25 fois le tarif d'entrée non mis en cache, tandis que les lectures conservent la remise de 90 % sur l'entrée mise en cache ; s'y ajoutent des points de césure de cache explicites et une durée de vie minimale garantie de 30 minutes [s1][s2]. Cela fait passer le cache de prompts d'une remise passive à un objet d'architecture. Un point de césure mal placé sur un long prompt système porte désormais un coût d'écriture mesurable, et non plus une simple économie manquée. Le gain, c'est la prévisibilité : avec un plancher de 30 minutes, on peut raisonner sur la survie d'un préfixe mis en cache entre deux requêtes au lieu de la deviner.

> [!IMPORTANT]
> Vous ne pouvez pas appeler ces modèles aujourd'hui. La préversion est réservée à des partenaires sélectionnés via l'API et Codex ; un compte ordinaire n'y a pas accès, et OpenAI se contente de situer la disponibilité générale « dans les semaines à venir ». Voyez-y un changement de contrat à anticiper, pas un outil à adopter cette semaine.

## Impact pour une équipe

Deux gestes concrets. Si vous travaillez déjà sur OpenAI, chiffrez dès maintenant vos charges de travail sur les trois paliers : routez la classification en masse et le chat vers Luna, gardez l'agentique et le code sur Sol, et laissez le reste sur Terra plutôt que de payer le tarif du modèle phare partout. Ensuite, avant l'arrivée de GPT-5.6, auditez l'emplacement de vos points de césure de cache : une écriture n'est plus gratuite, donc mettre en cache un préfixe que vous relisez rarement peut coûter plus qu'il ne rapporte. Une chose à attendre : OpenAI annonce faire tourner Sol sur Cerebras jusqu'à 750 jetons par seconde en juillet [s1][s2] ; si le débit est votre contrainte, c'est cette date, et non la préversion, qu'il faut surveiller.
