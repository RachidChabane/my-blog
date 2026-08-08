---
translationKey: cloudflare-kitesurf-agent-browser-workers
lang: fr
slug: cloudflare-kitesurf-navigateur-agents-parametre-cdp
title: Kitesurf de Cloudflare remplace Chromium via un seul paramètre CDP, au prix
  de tâches plus lentes
publishDate: 08-08-2026
kind: tool
tags:
- Cloudflare
- Kitesurf
- Browser Run
- agents
summary: Kitesurf est un navigateur pensé pour les agents, atteint en ajoutant browser=kitesurf
  au point d'accès CDP de Browser Run, si bien que les clients Puppeteer, Playwright
  et chrome-remote-interface continuent de fonctionner sans retouche. Dans les tests
  de Cloudflare, il consomme 3,1 à 3,8 fois moins de CPU et 4,7 à sept fois moins
  de mémoire que Chromium, et met 1,7 à 1,8 fois plus de temps par tâche.
sources:
- label: Cloudflare blog, Kitesurf launch post
  url: https://blog.cloudflare.com/kitesurf/
  date: 06-08-2026
- label: TechRepublic report
  url: https://www.techrepublic.com/article/news-cloudflare-kitesurf-browser-ai-agents/
  date: 07-08-2026
contentHash: sha256:8b41b5775533f312
publishState: published
---

## Ce qui change

Cloudflare a annoncé Kitesurf le 6 août 2026 : un moteur de navigateur écrit pour les agents plutôt que pour des humains, joignable via le point d'accès CDP de Browser Run que votre code appelle déjà. « Il suffit d'ajouter le paramètre browser=kitesurf à nos points d'accès » [s1], et Puppeteer, Playwright, chrome-remote-interface ainsi que tout agent qui parle MCP et CDP continuent de fonctionner sans retouche [s1]. Les chiffres publiés par Cloudflare donnent le prix de ce confort [s2].

| Dimension | Kitesurf face à Chromium, dans les tests de Cloudflare |
| :--- | :--- |
| CPU | 3,1 à 3,8 fois moins [s2] |
| Mémoire | 4,7 à sept fois moins [s2] |
| Temps par tâche | 1,7 à 1,8 fois plus [s2] |

## L'échange réel

Lues ensemble, les trois lignes parlent de capacité de parc plutôt que de vitesse unitaire. La mémoire baisse davantage que le temps n'augmente, donc le nombre de sessions tenues par gigaoctet grimpe même si chacune se termine plus tard. J'y vois un levier de concurrence : à sortir là où votre parc headless bute sur la RAM par worker et où personne n'attend devant un écran. Devant un utilisateur qui attend un seul scraping, vous n'achetez qu'un p95 dégradé.

## En pratique

```diff
  $BROWSER_RUN_CDP_ENDPOINT
+ browser=kitesurf
```

Ce seul paramètre est toute la migration [s1], et le supprimer suffit à revenir en arrière. Le séparateur, `?` ou `&`, dépend de votre URL. Faites passer une seule classe de tâches par Kitesurf et comparez sur votre propre mélange de charges.

> [!IMPORTANT]
> Tous les chiffres de cette brève viennent des tests de Cloudflare [s2], sur son propre mélange de tâches. Je n'ai vu aucune mesure tierce de Kitesurf : retenez 1,7 à 1,8 fois comme un ordre de grandeur et mesurez chez vous.

## Impact pour une équipe

Un paramètre [s1] ne mérite pas une réunion ; ce que vous devez à votre équipe, c'est une règle d'aiguillage. Séparez les tâches navigateur selon qu'un humain attend le résultat : crawls par lots, harnais d'évaluation et agents qui s'éventent largement passent sur Kitesurf, les chemins interactifs restent sur Chromium. Vérifiez vos délais d'expiration avant de basculer, car c'est là que ça mord en premier : des limites calibrées sur Chromium se retrouvent au-dessus d'un navigateur que Cloudflare mesure 1,7 à 1,8 fois plus lent [s2], et votre première exécution Kitesurf ressemblera à une panne. Relevez-les, laissez tourner une semaine, puis lisez la facture CPU et mémoire. Si votre parc ne manque aujourd'hui ni de RAM ni de CPU, passez votre chemin.
