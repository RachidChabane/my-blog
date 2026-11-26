---
translationKey: gemini-4-neon-wins-on-speed
lang: fr
slug: elo-projete-de-gemini-4-neon-sans-aucun-vote
title: L'Elo projeté de Gemini 4 Neon ne repose sur aucun vote
publishDate: 26-11-2026
tags:
- evaluation
- agentic-coding
category: essays
difficulty: 3
sources:
- label: 'Google, Introducing Gemini 4 Neon: release summary'
  url: https://blog.google/innovation-and-ai/models-and-research/gemini-models/introducing-gemini-4-neon/
  date: 18-11-2026
- label: 'micjm, Gemini 4 Neon looks like an Opus 5.5 competitor: Neon serving speed'
  url: https://micjm.com/blog/gemini-4-neon-looks-like-a-top-model/
  date: 18-11-2026
- label: 'Models Engineering Index (Mei): how the score is built'
  url: https://git-aarvin.github.io/mei/
  date: 26-11-2026
- label: 'Models Engineering Index (Mei): caveat on benchmark subsets'
  url: https://git-aarvin.github.io/mei/openai/6.2-sol
  date: 26-11-2026
contentHash: sha256:e1efc023c20b7d7c
publishState: published
---


L'Elo Agent Duel qui circule pour Gemini 4 Neon a été calculé sans un seul vote sur Neon, et la seule mesure de Neon qui y entre est un débit relevé une fois. Or la vitesse, c'est tout l'argument de vente. Google vend Neon sur sa capacité à boucler vite une tâche de bout en bout [s1], et même son score de 61 sur l'Artificial Analysis Intelligence Index est présenté comme juste derrière des modèles plus gros et plus lents [s2].

## D'où sort le 1 066

La projection vient de l'analyse du leaderboard Agent Duel publiée par micjm. En ajustant un modèle sur les votes, micjm tombe sur une surprise : la vitesse semble compter à peu près autant que l'identité du modèle [s6]. L'explication est renvoyée à un prochain billet. Dommage, c'est précisément ce terme de vitesse que j'aimerais voir de près. Je ne sais pas quelle forme a l'ajustement.

Le calcul tient en une ligne. On suppose que Neon fait aussi bien que Gemini 4 Carbon, hypothèse que micjm juge raisonnable vu des scores de benchmark encore meilleurs, on fixe le débit à 127 tokens par seconde, et on obtient 1 066, juste sous les 1 078 d'Opus 5.5 [s7]. La moitié du chiffre est donc empruntée. Personne n'a voté sur Neon ; la partie qualité, c'est l'Elo de Carbon, repris parce que Neon s'en sort bien sur les benchmarks. L'autre moitié, c'est le débit. Carbon a gagné cet Elo à 46 tokens par seconde [s5], alors que les 127 retenus pour Neon correspondent à ce que servait OpenRouter plus tôt dans la journée où micjm a publié [s4]. Un débit dépend de qui sert le modèle bien plus que des poids. Il varie avec le fournisseur, la région, la charge et l'heure. Si vous choisissez votre modèle par défaut d'après cet Elo et que votre fournisseur sert Neon nettement moins vite, le chiffre a été calculé pour une configuration qui n'est pas la vôtre.

## Un classement sans chronomètre

Mei, le Models Engineering Index, range les deux modèles dans l'ordre inverse, et rien dans son score ne mesure la vitesse à laquelle arrivent les tokens. L'indice agrège 17 benchmarks de code, ramenés à une moyenne de 50, c'est-à-dire le genre de preuve qui a valu à Neon l'Elo de Carbon. Le coût et les tokens sont donnés en multiples du modèle typique [s8].

| | Gemini 4 Neon | Claude Opus 5.5 |
|---|---:|---:|
| Elo Agent Duel (projeté pour Neon) | 1 066 [s7] | 1 078 [s7] |
| Indice Mei | 66,0 [s9] | 63,2 [s10] |
| Coût relatif Mei | 3,1× [s9] | 5,6× [s10] |
| Tokens relatifs Mei | 0,84× [s9] | 1,5× [s10] |
| Étiquette « Confident score » chez Mei | non | oui [s10] |

Les deux écarts sont étroits, et Mei prévient elle-même que sans barres d'erreur les petits écarts ne veulent rien dire [s11]. Je ne lirais donc aucune des deux lignes comme un classement. Ce qui distingue vraiment les deux chiffres, c'est le sens dans lequel chacun bouge quand Neon est servi plus lentement. L'Elo projeté a été construit sur 127 tokens par seconde [s4] et baisse avec ; l'indice de Mei ne bouge pas, quel que soit votre fournisseur.

## Batch ou binôme

Pour des agents en batch, l'affaire est vite réglée. Personne ne regarde les tokens défiler, donc un terme de vitesse récompense quelque chose dont vous ne profitez pas. Je prendrais Mei, même si le score de Neon y est moins sûr. En sortie, la facture d'un batch dépend des 15 $ par million de tokens de Neon [s3] et du nombre de tokens que l'agent consomme pour aller au bout de la tâche. Sur ce second terme, Mei donne l'avantage à Neon, avec 0,84× la consommation du modèle typique [s9] contre 1,5× pour Opus [s10].

Quand vous travaillez en binôme avec un agent, l'attente fait partie du travail (c'est le moment où on ouvre un autre onglet). Un classement qui intègre la vitesse mesure bien quelque chose que vous sentez passer, sauf qu'il s'agit de la vitesse obtenue par quelqu'un d'autre. Avant de vous fier à la projection, chronométrez une requête en streaming chez le fournisseur et dans la région que vous utiliserez vraiment :

```sh
curl -sN -o out.sse -w '%{time_starttransfer} %{time_total}\n' \
  -H "Authorization: Bearer $API_KEY" -H 'Content-Type: application/json' \
  -d @request.json https://your-provider.example/v1/chat/completions
```

Les deux valeurs affichées sont le temps jusqu'au premier octet et le temps total. Récupérez le nombre de tokens générés dans le bloc `usage` à la fin de `out.sse`, puis divisez-le par l'écart entre les deux. Est-ce qu'on approche des 127 [s4] ?
