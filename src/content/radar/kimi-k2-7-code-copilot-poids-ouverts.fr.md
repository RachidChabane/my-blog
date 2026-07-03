---
translationKey: kimi-k2-7-copilot
lang: fr
slug: kimi-k2-7-code-copilot-poids-ouverts
title: 'Le premier modèle à poids ouverts de GitHub Copilot : Kimi K2.7 Code'
publishDate: 03-07-2026
kind: tool
tags:
- Kimi
- GitHub Copilot
- Moonshot
- open-weight
- coding
summary: 'GitHub a rendu Kimi K2.7 Code généralement disponible dans Copilot le 2026-07-01
  : premier modèle à poids ouverts du sélecteur, hébergé sur Azure et facturé à l''usage,
  et les mêmes poids que vous pouvez auto-héberger sous une Modified MIT License.'
sources:
- label: Primary - GitHub Changelog, Kimi K2.7 Code is generally available in GitHub
    Copilot
  url: https://github.blog/changelog/2026-07-01-kimi-k2-7-is-now-available-in-github-copilot/
  date: 01-07-2026
- label: Corroboration - The Stack, GitHub picks China's Kimi for low-cost Copilot
    option
  url: https://www.thestack.technology/github-china-kimi-copilot/
  date: 02-07-2026
- label: Hugging Face model card, moonshotai/Kimi-K2.7-Code
  url: https://huggingface.co/moonshotai/Kimi-K2.7-Code
  date: 12-06-2026
contentHash: sha256:ca45047b83bb309e
publishState: published
---

## Ce qui change

Le 2026-07-01, GitHub a rendu Kimi K2.7 Code généralement disponible dans Copilot : c'est le premier modèle à poids ouverts proposé comme option sélectionnable dans le sélecteur de modèles [s1]. Le déploiement débute sur les offres Copilot Pro, Pro+ et Max ; GitHub héberge lui-même le modèle sur Microsoft Azure, si bien qu'aucune infrastructure d'inférence n'est à monter de votre côté, et la facturation suit le tarif public du fournisseur sous le régime à l'usage [s1]. The Stack, qui a couvert l'annonce de façon indépendante le lendemain, y voit Microsoft ouvrant Copilot aux modèles à poids ouverts pour la première fois et qualifie Kimi d'option non légère la moins chère hors du Raptor mini maison de GitHub [s2].

## Le pont vers les poids ouverts

Voici ce que les notes de version ne disent pas franchement : la copie que Copilot héberge sur Azure et celle que vous pouvez télécharger sont les mêmes poids. Kimi K2.7 Code est le modèle de codage de Moonshot AI, un mélange d'experts à 1T de paramètres au total et 32B actifs, doté d'une fenêtre de contexte de 256K, publié sur Hugging Face sous une Modified MIT License [s3]. Cela fait tomber une décision sur laquelle les ingénieurs IA hésitent d'ordinaire. Vous pouvez prototyper contre la copie hébergée par GitHub aujourd'hui, puis, si la gouvernance des données ou le coût vous pousse à l'auto-hébergement, déployer les poids identiques sans changer de modèle ni refaire l'étalonnage du comportement. Les chiffres de la fiche sont ceux du modèle de base, pas des scores Copilot : le Kimi Code Bench v2 passe de 50,9 à 62,0 entre K2.6 et K2.7 Code, avec environ 30 % de tokens de réflexion en moins que K2.6 [s3].

| Offre Copilot | Kimi K2.7 Code |
| :--- | :--: |
| Pro, Pro+, Max | en cours de déploiement [s1] |
| Business, Enterprise | désactivé par défaut, à activer par un admin [s1] |

> [!IMPORTANT]
> La facturation à l'usage implique un coût par utilisation, pas par siège, et GitHub ne publie que le tarif public du fournisseur, sans chiffre par token [s1]. La formule « la moins chère » vient de The Stack, pas de GitHub : traitez-la comme une affirmation à vérifier sur votre propre charge, pas comme un prix établi [s2].

## Impact pour une équipe

Si vous êtes sur Copilot Business ou Enterprise, personne ne peut choisir Kimi tant qu'un administrateur ne l'a pas activé : le modèle est désactivé par défaut et un administrateur de l'offre doit activer la politique Kimi K2.7 Code dans les paramètres Copilot [s1]. C'est la première action concrète, avant toute évaluation. Pour les équipes qui lorgnent l'auto-hébergement au nom de la gouvernance des données, le réflexe de praticien est de prototyper contre la copie hébergée par Copilot maintenant et de ne monter votre propre inférence que lorsque les traces en justifient le coût opérationnel, puisque les poids sont identiques [s1][s3]. Enfin, surveillez la facturation : un modèle bon marché au token peut rester cher par développeur à volume sous un régime de crédits à l'usage ; mesurez-le avant d'en faire le défaut de l'équipe [s1][s2].
