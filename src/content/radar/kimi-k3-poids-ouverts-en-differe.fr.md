---
translationKey: kimi-k3-open-weight-weights-lag
lang: fr
slug: kimi-k3-poids-ouverts-en-differe
title: 'Kimi K3 : le plus grand modèle à poids ouverts annoncé, et les poids arrivent
  11 jours après'
publishDate: 17-07-2026
kind: release
tags:
- Kimi K3
- Moonshot
- open weights
- agents
- coding
summary: Le 16-07-2026, Moonshot a lancé Kimi K3, un MoE à poids ouverts de 2 800
  milliards de paramètres, mais seulement sur sa propre infrastructure hébergée ;
  les poids téléchargeables sont attendus le 27-07-2026, à un tarif de classe Sonnet
  5.
sources:
- label: 'MarkTechPost - Moonshot AI Releases Kimi K3: A 2.8 Trillion Parameter Open
    MoE Model With Kimi Delta Attention and 1M Context'
  url: https://www.marktechpost.com/2026/07/16/moonshot-ai-releases-kimi-k3-a-2-8-trillion-parameter-open-moe-model-with-kimi-delta-attention-and-1m-context/
  date: 16-07-2026
- label: 'Trilogy AI - Kimi K3 Is Live: Pricing, Benchmarks, and the Wait for Public
    Weights'
  url: https://trilogyai.substack.com/p/kimi-k3-is-live-pricing-benchmarks
  date: 17-07-2026
- label: The Decoder - Kimi's open model K3 nears GPT-5.6 Sol and Fable 5 while signaling
    the end of super cheap Chinese AI
  url: https://the-decoder.com/kimis-open-model-k3-nears-gpt-5-6-sol-and-fable-5-while-signaling-the-end-of-super-cheap-chinese-ai/
  date: 16-07-2026
- label: Simon Willison - Kimi K3, and what we can still learn from the pelican benchmark
  url: https://simonwillison.net/2026/Jul/16/kimi-k3/
  date: 16-07-2026
- label: OpenRouter - Kimi K3 model page
  url: https://openrouter.ai/moonshotai/kimi-k3
  date: 16-07-2026
- label: 'latent.space AINews - Kimi K3 2.8T-A50B: the largest open model ever released;
    Opus 4.8-class at Sonnet 5 pricing'
  url: https://www.latent.space/p/ainews-kimi-k3-28t-a50b-the-largest
  date: 17-07-2026
contentHash: sha256:7ae46a72bd439a89
publishState: published
---

## Ce qui change

Moonshot AI a publié Kimi K3 le 16-07-2026 [s1], disponible le jour même uniquement sur l'infrastructure de Moonshot : l'API, kimi.com, les applications mobiles, Kimi Work, Kimi Code, ainsi qu'un référencement sur OpenRouter [s2][s5]. C'est un Mixture-of-Experts creux de 2 800 milliards de paramètres, qui active 16 experts sur 896 [s1] (environ 50 milliards actifs selon latent.space [s6]), avec une fenêtre de contexte d'un million de jetons (1 048 576) [s2]. Les poids complets, en revanche, ne sont pas encore là : Moonshot a fixé le 27-07-2026 pour le point de contrôle en poids ouverts dans une annonce officielle sur WeChat [s2][s4]. Vous disposez donc aujourd'hui d'un point d'accès, pas d'un téléchargement. Côté mesure indépendante, Artificial Analysis situe K3 à 57,1 sur son Intelligence Index, quatrième sur 189 modèles, au niveau d'Opus 4.8 et de GPT-5.5, derrière Fable 5 et GPT-5.6 Sol [s2][s3].

## Ouvert, mais pas encore

Voici la tension que les notes de version ne tracent pas pour vous. Toute la raison de choisir un modèle de pointe à poids ouverts, l'héberger soi-même, sortir du verrou fournisseur, garder ses données hors d'un tiers, est précisément ce qui manque le jour du lancement. Pendant une dizaine de jours, vous évaluez un point d'accès propriétaire qui porte une étiquette de poids ouverts, et le point de contrôle hébergé que vous testez cette semaine n'est pas garanti d'être celui qui sortira le 27.

Ce qui mérite d'être copié, ce n'est pas la taille. Ce qui rend un tel modèle servable à un million de jetons, c'est le travail sur l'attention : Kimi Delta Attention, un schéma d'attention linéaire hybride qui, selon Moonshot, offre un décodage jusqu'à 6,3 fois plus rapide dans les contextes d'un million de jetons, et Attention Residuals, qui apporte d'après l'éditeur environ 25 % d'efficacité d'entraînement en plus pour moins de 2 % de coût additionnel [s1]. Ce sont les chiffres de Moonshot, pas des mesures indépendantes ; en revanche, c'est bien le mécanisme, et non le nombre de paramètres affiché, que les concurrents étudieront.

> [!IMPORTANT]
> Deux pièges avant de câbler K3 où que ce soit. D'abord, les poids arrivent le 27-07-2026 : ne traitez pas le point d'accès hébergé d'aujourd'hui comme votre option d'auto-hébergement ou de résidence des données. Ensuite, K3 n'expose qu'un seul niveau d'effort de raisonnement, `max`, « and it shows » [s4] : il consomme des jetons de raisonnement par défaut, donc une intégration naïve coûte cher.

## Le plancher de prix a bougé

| Par 1M de jetons        | K2.6 [s3] | K3 [s1][s2][s3] |
| :---------------------- | --------: | --------------: |
| Entrée (cache touché)   |    0,16 $ |          0,30 $ |
| Entrée (cache manqué)   |    0,95 $ |          3,00 $ |
| Sortie                  |    4,00 $ |         15,00 $ |

C'est une tarification de classe Sonnet 5, « comparable to Western mid-range models like Sonnet 5 » [s3], pas le tarif d'appel qui faisait des poids ouverts chinois un réflexe. À environ 0,94 $ par tâche sur Artificial Analysis, proche de GPT-5.6 Sol à 1,04 $ et à peu près la moitié d'Opus 4.8 à 1,80 $ [s3], K3 est désormais une décision de coût de gamme moyenne occidentale. Si votre logique de routage suppose encore « on prend le modèle chinois ouvert pas cher », elle est périmée.

## Impact pour une équipe

Nommez la décision que vous prenez réellement. Si vous avez choisi K3 pour l'auto-hébergement ou la résidence des données, attendez le 27-07-2026 et ne testez pas le point d'accès hébergé d'aujourd'hui comme candidat sur site, car il peut ne pas être le point de contrôle livré. Si K3 est une option de routage par API hébergée, retarifez-le en classe Sonnet 5 plutôt qu'en sous-dollar, et plafonnez le coût d'effort de raisonnement (seul `max` aujourd'hui) avant qu'il n'atteigne un chemin critique. Quoi que vous décidiez sur les poids, l'architecture d'attention reste l'idée transférable à surveiller.
