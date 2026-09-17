---
translationKey: typesafe-jev-workflow-evals-scored-against-frontier-reference
lang: fr
slug: typesafe-jev-evals-workflow-notees-contre-reference-frontiere
title: Jev de TypeSafe égale sonnet 5 à 67.8% dans des évals de workflow notées contre
  GPT-6 Astra et Fable 5.1
publishDate: 17-09-2026
kind: release
tags:
- TypeSafe
- Jev
- structured outputs
- evals
summary: TypeSafe AI a ouvert le 15 septembre 2026 l'accès anticipé à Jev, un modèle
  qui répond à des questions typées, facturé $0.042 par MTok en entrée, avec des tokens
  de sortie gratuits. Dans les évals de workflow de TypeSafe, Jev égale sonnet 5 à
  67.8% pour $0.0004 et 0.4 s, face à une réponse de référence moyennée entre GPT-6
  Astra et Fable 5.1. Chaque modèle de comparaison y fait mieux en workflow qu'en
  prompt unique, et Jev n'a aucune ligne prompt. La décomposition est, je pense, ce
  qu'il faut adopter dès maintenant, et le score de confiance attendra votre propre
  calibration.
sources:
- label: TypeSafe AI, Introducing System One Models and Jev
  url: https://typesafe.ai/blog/introducing-system-one-models-and-jev
  date: 15-09-2026
- label: TypeSafe docs, API reference
  url: https://docs.typesafe.ai/api
  date: 15-09-2026
- label: TypeSafe workflow evals
  url: https://evals.typesafe.ai/
  date: 15-09-2026
- label: 'Anthony Maio, Jev: The Language Model That Won''t Talk'
  url: https://anthonymaio.substack.com/p/jev-the-language-model-that-wont
  date: 16-09-2026
contentHash: sha256:9b49a25301f56d72
publishState: published
---

## Ce qui change

TypeSafe AI a ouvert le 15 septembre 2026 l'accès anticipé à Jev, et les développeurs sortent encore d'une liste d'attente [s1]. On envoie à `POST https://api.typesafe.ai/v1/systemone` un champ `model` fixé à `jev-latest` et une map `questions` [s2]. Les réponses `Choice` et `Score` portent une `confidence` comprise entre 0 et 1, et une réponse oui/non revient sous la forme `noul`, de 0 (non) à 1 (oui) [s2]. L'entrée coûte $0.042 par MTok et les tokens de sortie sont gratuits [s1].

## La ligne qui manque à Jev

Le site d'évals de TypeSafe moyenne précision, coût et temps sur quatre workflows, et fait tourner chaque modèle de comparaison deux fois, en workflow explicite et en prompt unique [s3] :

| Modèle | Prompt | Workflow | Coût workflow | Temps workflow |
| :--- | ---: | ---: | ---: | ---: |
| haiku 4.5 | 18.1% | 53.6% | $0.0195 | 12.5 s |
| sonnet 5 | 60.4% | 67.8% | $0.1174 | 78.1 s |
| opus 5 | 64.8% | 73.1% | $0.1761 | 37.8 s |
| sol | 63.4% | 74.1% | $0.0836 | 23.3 s |
| Jev | aucune ligne | 67.8% | $0.0004 | 0.4 s |

Anthony Maio en conclut que chaque modèle de comparaison devient plus précis, plus rapide et moins cher dans le workflow [s4]. J'ai vérifié les huit paires, et cela tient sur les trois axes [s3]. Jev n'y figure qu'en ligne workflow [s3]. Son vrai coût d'adoption est là, je pense : un modèle qui n'accepte que des questions typées impose la décomposition qui a déjà fait passer haiku 4.5 de 18.1% à 53.6% [s3]. Jev égale la ligne workflow de sonnet 5 à 67.8% et reste derrière sol et opus 5 [s3]. Ce qu'il gagne, ce sont $0.0004 et 0.4 s contre $0.1174 et 78.1 s pour sonnet 5 [s3].

> [!IMPORTANT]
> Pour ces workflows, TypeSafe prend comme réponse de référence la moyenne de GPT-6 Astra et de Fable 5.1, ce qui, selon l'éditeur, biaise les réponses vers OpenAI et Anthropic [s1]. Ces 67.8% mesurent, à mon sens, la fréquence à laquelle Jev tombe d'accord avec deux modèles frontière.

## Impact pour une équipe

Si vous routez, triez ou notez avec un seul long prompt, découpez-le dès maintenant en questions typées, sur le modèle que vous payez déjà. C'est là, à mon sens, que le tableau de TypeSafe place le gain, et cela ne demande aucune liste d'attente [s3]. Gardez les étiquettes que ce découpage vous oblige à écrire, puis testez Jev contre elles quand l'accès arrivera. Ne déclenchez pas encore d'escalade sur `confidence`. L'article de lancement affirme que toutes les réponses arrivent avec des probabilités et des scores de confiance calibrés [s1], la documentation dérive `confidence` de `probabilities` [s2], or TypeSafe n'a pas dit de quelle statistique il s'agit, et sa méthode de calibration n'est pas publiée [s4]. Le typage fixe la forme d'une réponse et laisse le jugement libre, comme le dit Maio [s4] : confrontez donc `confidence` à vos propres étiquettes avant tout usage.
