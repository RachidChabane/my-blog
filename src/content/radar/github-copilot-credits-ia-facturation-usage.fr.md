---
translationKey: github-copilot-ai-credits-usage-billing
lang: fr
slug: github-copilot-credits-ia-facturation-usage
title: GitHub Copilot passe aux credits IA a l'usage
publishDate: 22-06-2026
kind: spec-change
tags:
- agents
- security
- oss
summary: Le 1er juin 2026, GitHub a remplace les unites de requetes premium de Copilot
  par des credits IA factures au token, au taux de 1 credit = 0,01 $, sur toutes les
  fonctions sauf la completion et les Next Edit Suggestions.
sources:
- label: GitHub Changelog - Updates to GitHub Copilot billing and plans
  url: https://github.blog/changelog/2026-06-01-updates-to-github-copilot-billing-and-plans/
  date: 01-06-2026
- label: GitHub Docs - Models and pricing for GitHub Copilot
  url: https://docs.github.com/en/copilot/reference/copilot-billing/models-and-pricing
  date: 01-06-2026
- label: GitHub Docs - Usage-based billing for organizations and enterprises
  url: https://docs.github.com/en/copilot/concepts/billing/usage-based-billing-for-organizations-and-enterprises
  date: 01-06-2026
- label: Visual Studio Magazine - Devs Sound Off on Usage-Based Copilot Pricing Change
  url: https://visualstudiomagazine.com/articles/2026/04/27/devs-sound-off-on-usage-based-copilot-pricing-change-you-will-get-less-but-pay-the-same-price.aspx
  date: 27-04-2026
contentHash: sha256:25a37f5bdc22eb82
publishState: published
---

## Ce qui change

Le 1er juin 2026, GitHub a bascule tous les plans Copilot vers une facturation a l'usage. Les anciennes unites de requetes premium (PRU) ont ete retirees au profit des credits IA GitHub, mesures a la consommation de tokens. Chaque plan inclut desormais une dotation mensuelle de credits ; la consommation est tarifee par modele selon les taux API publies par million de tokens, puis convertie au taux fixe de 1 credit IA = 0,01 $ US. Le changement a d'abord ete pre-annonce le 27 avril 2026, puis applique via le GitHub Changelog date du 1er juin 2026.

## Le schéma

```text
# Reference modeles et tarifs (USD par 1 000 000 de tokens)
# Conversion : 1 credit IA = 0,01 $ US

Modele    | Statut | Categorie   | Palier       | Seuil (tokens entree) | Entree | Entree cache | Sortie
----------|--------|-------------|--------------|-----------------------|--------|--------------|-------
GPT-5 mini| GA     | Lightweight | Default      | Non applicable        | $0.25  | $0.025       | $2.00
GPT-5.4   | GA     | Versatile   | Default      | <= 272K               | $2.50  | $0.25        | $15.00
GPT-5.5   | GA     | Powerful    | Long context | > 272K                | $10.00 | $1.00        | $45.00

# Mecanisme de cout par requete (aucune formule fermee imprimee ; mecanisme decrit) :
# USD = ((entree x TauxEntree) + (cache x TauxCache) + (sortie x TauxSortie)) / 1_000_000
# credits = USD / 0,01
# Note : les modeles Anthropic ajoutent une dimension cache-write (ex. 6,25 $ / 1M pour la classe Claude Opus).
```

## En pratique

```python
# Cout en credits IA d'un tour de Copilot Chat sur GPT-5.4 (palier Default, <= 272K en entree)
TAUX_ENTREE, TAUX_CACHE, TAUX_SORTIE = 2.50, 0.25, 15.00  # USD par 1M tokens
CREDIT_USD = 0.01

tokens_entree, tokens_cache, tokens_sortie = 12_000, 8_000, 1_500

usd = (tokens_entree * TAUX_ENTREE
       + tokens_cache * TAUX_CACHE
       + tokens_sortie * TAUX_SORTIE) / 1_000_000
credits = usd / CREDIT_USD

print(f"${usd:.4f} -> {credits:.2f} credits")
# $0.0545 -> 5.45 credits

# Siege Copilot Business : 1 900 credits inclus/mois (3 000 pendant la promo 1er juin - 1er sept.).
# Mutualises au niveau de l'entite de facturation : 100 sieges Business => pool partage de 190 000 credits.
# La completion et les Next Edit Suggestions restent illimitees et facturent 0 credit.
```

## Impact pour une équipe

Si votre organisation utilise Copilot Business ou Enterprise, le poste de cout n'est plus un nombre de requetes par siege mais le volume de tokens consomme par Chat, Copilot CLI, l'agent cloud/coding, Spaces, Spark et les agents tiers. La completion et les Next Edit Suggestions restent gratuites : un profil oriente completion bouge peu le compteur, tandis qu'un usage agent intensif epuise vite la dotation incluse.

> [!IMPORTANT]
> Les credits inclus sont mutualises au niveau de l'entite de facturation : 100 sieges Business partagent un pool de 190 000 credits. Ajouter des licences en cours de cycle augmente le pool immediatement ; en retirer ne prend effet qu'au cycle suivant.

A faire : definir des budgets au niveau utilisateur (desormais GA pour organisations et entreprises) et la hierarchie de plafonds entreprise/cost-center avant que l'usage agent ne monte en charge. Surveillez un second compteur pour Copilot code review, qui consomme des minutes Actions en plus des credits IA. Le bonus promotionnel du 1er juin au 1er septembre (Business 3 000 credits, Enterprise 7 000) masque la consommation de regime permanent : dimensionnez les budgets sur les dotations incluses reelles, pas sur la promo.
