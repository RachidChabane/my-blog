---
translationKey: qwen38-27b-runtime-build-and-file-revision
lang: fr
slug: qwen3-8-27b-version-du-runtime-et-des-fichiers
title: Faire tourner Qwen3.8 27B en 4 bits demande 17 Go et une compilation récente
  de llama.cpp
publishDate: 01-09-2026
kind: benchmark
tags:
- Qwen
- llama.cpp
- Ollama
- local inference
- quantization
summary: 'Deux mesures indépendantes de Qwen3.8 27B, publiées les 26 et 27 août 2026,
  s''accordent sur deux points : le fichier 4 bits Q4_K_M pèse 17 Go, et une compilation
  ancienne de llama.cpp refuse tout simplement de charger le modèle [s1][s2]. À mon
  sens, la ressource rare pour un modèle ouvert tout juste sorti, c''est désormais
  un runtime à jour.'
sources:
- label: Quesma Blog, benchmarking Qwen3.8 27B quantizations
  url: https://quesma.com/blog/qwen38-27b-quantizations-benchmarked/
  date: 26-08-2026
- label: TerminalBytes, Qwen3.8 27B measured on a Mac Studio M3 Ultra
  url: https://terminalbytes.com/run-qwen-3-8-27b-locally/
  date: 27-08-2026
contentHash: sha256:1b2561dee347f3ad
publishState: published
---

## Ce qui change

Deux mesures indépendantes de Qwen3.8 27B sont tombées à un jour d'intervalle, sur des
montages sans rien de commun. Le 26 août 2026, Quesma a publié des scores par tâche sur les
quantifications GGUF d'Unsloth, pour environ 3 000 dollars de GPU loués chez Modal [s1]. Le 27 août 2026, TerminalBytes a publié cinq mesures chronométrées du même modèle
sous Ollama, sur un Mac Studio M3 Ultra [s2]. Les deux aboutissent à 17 Go pour le fichier
4 bits Q4_K_M [s1][s2], et les deux constatent qu'une compilation ancienne de llama.cpp ne
fait pas tourner le modèle [s1][s2].

## L'accord que personne ne cherchait

Quesma a travaillé avec une compilation de llama.cpp datée du 16 août 2026, les versions
antérieures ne fonctionnant pas avec ce modèle [s1]. TerminalBytes prévient de son côté
qu'il faut une compilation des dernières semaines, les plus anciennes échouant sur
`unknown model architecture: 'qwen35'` [s2]. Deux ingénieurs, deux chaînes d'outils, deux
machines, un même mur. Le marqueur d'architecture du GGUF est le signal, et j'y vois une
règle générale : pour un modèle ouvert aussi récent, c'est le runtime qui manque.

| Même machine, même quantification Q4_K_M de 17 Go [s2] | qwen3.6:27b | qwen3.8:27b |
| --- | ---: | ---: |
| Vitesse de génération, moyenne sur 5 runs | 28.6 tok/s | 14.0 tok/s |
| Jetons consommés par réponse | 1,950-3,340 | 890-1,090 |

Ces chiffres démentent la lecture spontanée. La vitesse a été divisée par deux entre les
deux versions, or le modèle récent répond avec environ un tiers des jetons : le temps réel
par réponse terminée est quasiment à égalité [s2]. Comparez des réponses terminées avant
des jetons par seconde.

Le coût de reproductibilité, lui, dure. Quesma note qu'Unsloth a remplacé les fichiers v2
le 19 août 2026, si bien que les fichiers exacts derrière la plupart de ses scores ne sont
plus disponibles [s1].

> [!IMPORTANT]
> Ces deux campagnes reposent sur des artefacts qui n'existent plus sous cette forme : une
> compilation de llama.cpp liée à une semaine précise [s1][s2], et des fichiers Unsloth v2
> remplacés le 19 août 2026 [s1]. À mon sens, un banc d'essai local a désormais une date de
> péremption d'une quinzaine de jours : sans sa date de compilation ni sa révision de
> fichier, tenez-le pour non daté.

## Impact pour une équipe

La décision concerne quiconque fige une image d'inférence locale ce trimestre. Épinglez
ensemble la compilation de llama.cpp ou d'Ollama, la révision exacte du fichier GGUF et le
niveau d'effort de raisonnement. Quesma prévient que ce réglage pèse lourd, que la valeur
par défaut est xhigh et qu'il pousse au sur-raisonnement [s1] ; omettez-le et vos chiffres
ne veulent plus rien dire. Le piège de migration joue ici à
l'envers : aucune carte n'a rétréci, donc un dimensionnement bâti sur 17 Go tient toujours
[s1][s2], tandis que le conteneur figé en juillet refuse le modèle d'emblée [s1][s2].
Reconstruisez le runtime, puis mesurez.
