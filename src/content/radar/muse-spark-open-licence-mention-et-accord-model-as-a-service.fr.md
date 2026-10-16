---
translationKey: muse-spark-open-license-attribution-label-and-model-service-revenue-agreement
lang: fr
slug: muse-spark-open-licence-mention-et-accord-model-as-a-service
title: La licence de Muse Spark Open impose la mention Built with Muse Spark Open,
  et les fournisseurs de Model as a Service au-delà de 20 millions de dollars de chiffre
  d'affaires doivent signer un accord distinct avec Meta
publishDate: 16-10-2026
kind: release
tags:
- Meta
- Muse Spark
- open-weight
- licensing
summary: 'Meta a publié les poids de Muse Spark Open sous la Muse Model License, datée
  du 15 octobre 2026. Chaque produit qui utilise le modèle ou ses Derivatives doit
  afficher « Built with Muse Spark Open », et les fournisseurs de Model as a Service
  dont le chiffre d''affaires avec leurs sociétés affiliées dépasse 20 millions de
  dollars sur douze mois doivent signer un accord distinct avec Meta. La licence compte
  les modèles entraînés sur ses sorties parmi les Derivatives : selon moi, il faut
  tracer les jeux de données qui contiennent des sorties de Muse avant d''entraîner
  dessus.'
sources:
- label: Hugging Face, meta-models/Muse-Spark-Open-816B-A42B LICENSE.md
  url: https://huggingface.co/meta-models/Muse-Spark-Open-816B-A42B/blob/main/LICENSE.md
  date: 15-10-2026
- label: Meta AI Research, "Introducing Muse Spark Open"
  url: https://research.meta.ai/blog/muse-spark-open
  date: 15-10-2026
- label: Hugging Face, meta-models/Muse-Spark-Open-816B-A42B model card
  url: https://huggingface.co/meta-models/Muse-Spark-Open-816B-A42B
  date: 15-10-2026
- label: 'MarkTechPost, "Meta Releases Muse Spark Open: 816B Open-Weight MoE With
    1M Context"'
  url: https://www.marktechpost.com/2026/10/15/meta-muse-spark-open-816b-open-weight-model/
  date: 16-10-2026
- label: Unite.AI, "Meta's 816B-Parameter Muse Spark Open Weights Are Now Public"
  url: https://www.unite.ai/metas-816b-parameter-muse-spark-open-weights-are-now-public/
  date: 15-10-2026
contentHash: sha256:537f5aff456511b5
publishState: published
---

## Ce qui change

Meta a publié les poids de Muse Spark Open sous la Muse Model License, datée du 15 octobre 2026 [s1]. Le modèle est nativement multimodal, avec 816 milliards de paramètres au total (42 milliards actifs) et une fenêtre de contexte de 1M tokens [s2]. Sur Hugging Face, il faut se connecter et examiner les conditions avant d'accéder aux poids [s3].

## La mention est la clause qui vous concerne

Je pense que la mention, plus que le seuil de chiffre d'affaires, est la clause qu'une équipe produit doit anticiper. Deux conditions accompagnent la licence. Chaque produit ou service qui utilise le modèle ou ses Derivatives doit afficher bien en vue « Built with Muse Spark Open », dans son interface ou dans sa documentation, son site ou son menu de réglages [s1][s5]. Un licencié qui donne à des tiers accès à des modèles d'IA par API, et dont le chiffre d'affaires avec ses sociétés affiliées dépasse 20 millions de dollars sur douze mois, doit prévenir Meta et signer un accord écrit distinct avant de proposer le modèle ou ses Derivatives dans cette activité [s1]. Pour MarkTechPost, l'usage interne, la recherche et les fonctionnalités de votre propre produit échappent à la clause de revenus [s4]. Selon ma lecture, la mention n'a pas de plancher de revenus, et elle suit les Derivatives.

> [!CONFIRMED]
> La licence définit les Derivatives comme tout modèle d'IA « created, trained, modified (including fine-tuned), distilled, or otherwise improved using the Software or any outputs or results thereof » [s1].

> [!INFERRED]
> Selon ma lecture, un modèle plus petit que vous entraînez sur des données synthétiques générées par Muse Spark Open entre dans cette définition, et le produit qui l'embarque hérite de la mention. Un juriste peut lire ces deux clauses autrement.

## L'objection la plus solide

La mention ne coûte presque rien : une ligne dans un menu de réglages ou une page de documentation [s1]. Sur la ligne elle-même, je suis d'accord. Ce qu'elle exige, c'est de savoir quels modèles la portent. Une fois des sorties de Muse mélangées à un jeu d'entraînement sans trace, personne ne peut dire quels modèles en aval doivent la mention.

## Impact pour une équipe

Ma recommandation : si vous comptez utiliser Muse Spark Open comme modèle enseignant ou comme générateur de données synthétiques, notez quels jeux de données contiennent ses sorties avant de les mélanger à un jeu d'entraînement, et prévoyez la mention dans la documentation de chaque modèle entraîné dessus. Si vous exposez des modèles par API, le seuil compte le chiffre d'affaires du licencié et de ses sociétés affiliées [s1] ; selon moi, un grand groupe qui ouvre une petite API de modèles le dépasse le jour même. Faites valider la licence par votre juriste avant tout clic sur le formulaire d'accès de Hugging Face [s3].
