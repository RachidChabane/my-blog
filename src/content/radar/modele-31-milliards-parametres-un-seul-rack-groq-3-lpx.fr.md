---
translationKey: gemma-4-31b-groq-3-lpx-sram-sizing
lang: fr
slug: modele-31-milliards-parametres-un-seul-rack-groq-3-lpx
title: Un modèle de 31 milliards de paramètres tient dans un seul rack Groq 3 LPX
  quel que soit le type de données
publishDate: 25-08-2026
kind: benchmark
tags:
- NVIDIA
- Groq 3 LPX
- inference
- benchmark
- agents
summary: Le billet de NVIDIA a rapporté le 24 août 2026 qu'Artificial Analysis avait
  mesuré 3,431 output tokens/second en exécutant son benchmark 100K context sur Gemma
  4 31B sur Groq 3 LPX [s1]. Pour The Register, ce même modèle tient dans un seul
  rack LPX quel que soit le type de données retenu pour les poids [s2].
sources:
- label: NVIDIA Technical Blog, Groq 3 LPX long-context interactivity
  url: https://developer.nvidia.com/blog/how-nvidia-groq-3-lpx-unlocks-ultrafast-interactivity-at-long-context-on-nvidia-vera-rubin/
  date: 24-08-2026
- label: The Register, on the Groq 3 LPX benchmark numbers
  url: https://www.theregister.com/systems/2026/08/24/what-nvidias-first-groq-3-lpu-benchmarks-do-and-dont-tell-us-about-its-20b-gamble/5291880
  date: 24-08-2026
contentHash: sha256:3eff18b0bdee3180
publishState: published
---

## Ce qui change

Artificial Analysis a exécuté son benchmark 100K context sur le modèle Gemma 4 31B sur Groq 3 LPX et y a mesuré 3,431 output tokens/second, chiffre rapporté par le billet de NVIDIA le 24 août 2026 [s1]. Le même jour, The Register a calculé ce que ce modèle occupe sur la machine, un peu plus de 31 GB ou un peu moins de 64 LPUs de capacité SRAM, NVIDIA le faisant tourner en FP8 [s2]. Le billet associe par ailleurs Groq 3 LPX à Vera Rubin NVL72 pour servir des systèmes multiagents portés par des modèles de 2T+ paramètres [s1].

## Ce qu'un rack contient réellement

À 31 milliards de paramètres, le calcul de The Register loge le modèle dans un seul rack LPX, quel que soit le type de données utilisé pour stocker les poids [s2]. Ce qui décide de l'ajustement à cette taille, c'est à mon sens le budget SRAM du rack ; la précision ne commence à peser sur le dimensionnement qu'à la frontière où le modèle cesse de tenir dans un rack. La quantité concrète derrière tout cela, c'est un peu moins de 64 LPUs de capacité SRAM en FP8 [s2]. Le tableau ci-dessous met les chiffres côte à côte.

| Chiffre | Valeur | Origine |
| --- | --- | --- |
| Interactivité, benchmark 100K context | 3,431 output tokens/second | Le billet de NVIDIA, rapportant la mesure d'Artificial Analysis [s1] |
| Modèle évalué | Gemma 4 31B | Le billet de NVIDIA [s1] |
| Poids en FP8 | a little over 31 GB | La dérivation propre de The Register [s2] |
| Capacité SRAM nécessaire | just under 64 LPUs | La dérivation propre de The Register [s2] |
| Empreinte | un seul rack LPX, quel que soit le type de données | La dérivation propre de The Register [s2] |

> [!IMPORTANT]
> Rien de publié ne relie le chiffre de débit à la précision. Le billet de NVIDIA donne 3,431 output tokens/second sur le benchmark 100K context [s1] ; The Register indique que NVIDIA fait tourner le modèle en FP8 [s2]. Aucune des deux pages n'écrit que le benchmark a tourné à cette précision, alors posez la question avant de le supposer.

## Impact pour une équipe

Cela concerne qui choisit un fournisseur d'inférence sur des charges à long contexte, et qui dimensionne un rack autour d'un modèle donné. Je calcule d'abord l'empreinte des poids de mon modèle à ma propre précision, puis je la confronte au budget SRAM de l'accélérateur, avant de citer le débit de qui que ce soit, parce que sur ce matériel la capacité s'achète en nombre d'accélérateurs. Ce que cela change, c'est la liste retenue : un fournisseur incapable de loger votre modèle dans un rack relève d'une autre catégorie qu'un concurrent simplement plus lent. Le dimensionnement précède la vitesse.
