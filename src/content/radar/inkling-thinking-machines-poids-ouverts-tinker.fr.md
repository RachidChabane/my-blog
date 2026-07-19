---
translationKey: inkling-thinking-machines-open-weight
lang: fr
slug: inkling-thinking-machines-poids-ouverts-tinker
title: Thinking Machines ouvre les poids d'Inkling sous Apache 2.0, et garde Tinker
publishDate: 19-07-2026
kind: release
tags:
- Thinking Machines
- Inkling
- Tinker
- open-weight
- agents
summary: 'Le 15 juillet 2026, Thinking Machines Lab a publié Inkling sous Apache 2.0
  : 975 milliards de paramètres, 41 milliards actifs, poids disponibles le jour même.
  Le laboratoire concède que le modèle n''est pas le meilleur du marché, et garde
  Tinker, la boucle d''affinage, pour lui.'
sources:
- label: Primary - Thinking Machines Lab, Inkling model card
  url: https://thinkingmachines.ai/model-card/inkling/
  date: 15-07-2026
- label: 'Primary - Thinking Machines Lab, ''Inkling: Our open-weights model'''
  url: https://thinkingmachines.ai/news/introducing-inkling/
  date: 15-07-2026
- label: Primary - Hugging Face repo, thinkingmachines/Inkling
  url: https://huggingface.co/thinkingmachines/Inkling
  date: 15-07-2026
- label: Corroboration - TechCrunch, on Thinking Machines' first open model
  url: https://techcrunch.com/2026/07/15/thinking-machines-amps-up-its-bet-against-one-size-fits-all-ai-with-its-first-open-model-inkling/
  date: 15-07-2026
- label: Corroboration - Simon Willison, 'Inkling'
  url: https://simonwillison.net/2026/Jul/16/inkling/
  date: 16-07-2026
- label: Independent eval - Artificial Analysis, Inkling model page
  url: https://artificialanalysis.ai/models/inkling
  date: 16-07-2026
- label: Availability check - Databricks blog
  url: https://www.databricks.com/blog/inkling-thinking-machines-lab-now-databricks
  date: 15-07-2026
contentHash: sha256:feaf78b07f3b5595
publishState: published
---

## Ce qui change

Thinking Machines Lab a publié Inkling le 15 juillet 2026 : 975 milliards de paramètres au total, 41 milliards actifs, un transformeur décodeur de 66 couches dont le bloc feed-forward est un Mixture-of-Experts creux, chaque token étant routé vers 6 experts sur 256 plus 2 experts partagés, la fenêtre de contexte montant à 1M de tokens [s1][s2][s3]. Les poids de ce modèle sont arrivés le jour même sur Hugging Face, sous `thinkingmachines/Inkling` et en licence Apache 2.0, avec Transformers, vLLM et SGLang parmi les runtimes listés [s3]. Simon Willison chiffre l'entraînement à 45 000 milliards de tokens de texte, d'images, d'audio et de vidéo [s5]. Au 15 juillet 2026, le modèle est également servi sur Databricks via Unity AI Gateway [s7].

## Le pari

Ce que le laboratoire a gardé en dit plus long que ce qu'il a cédé. Il abandonne 975 milliards de paramètres sous la licence la plus permissive qui existe, écrit noir sur blanc qu'Inkling "n'est pas le meilleur modèle disponible aujourd'hui, ouvert ou fermé" [s2][s4], puis précise qu'Inkling est dès maintenant affinable sur Tinker [s2]. Or Tinker reste propriétaire. Les poids servent d'argument commercial, la boucle de personnalisation constitue le produit. À mon sens, cela vaut mieux que louer un modèle de pointe derrière une API : on facture l'étape où les données du client entrent en jeu.

L'objection tient debout : un modèle dont le fabricant refuse lui-même le qualificatif de pointe ne pèse pas lourd face à la frontière. Artificial Analysis attribue 41 à Inkling sur son Intelligence Index, au 10e rang sur 97 [s6]. Reste l'autre chiffre : 25, la médiane des modèles à poids ouverts de cette taille [s6]. Et c'est le rapport de 41 milliards actifs sur 975 qui compte, servable là où un modèle dense de cette taille ne l'est pas. TechCrunch, qui relaie une affirmation du laboratoire et non un test indépendant, rapporte qu'Inkling égale le Nemotron 3 Ultra de Nvidia en code pour trois fois moins de tokens [s4]. Chiffre de fournisseur, certes, mais s'il résiste à votre charge réelle il renforce l'argument du coût de service.

## En pratique

Deux identifiants pour démarrer, le dépôt et le point d'entrée d'affinage [s3][s5] :

```
# weights (Apache 2.0)
thinkingmachines/Inkling
# fine-tune loop, OpenAI-compatible
https://tinker.thinkingmachines.dev/services/tinker-prod/oai/api/v1/chat/completions
```

La fiche du modèle annonce BF16, MXFP8 et NVFP4 comme formats numériques [s1] : c'est cette ligne qui décide si votre pile de service peut l'accueillir.

> [!IMPORTANT]
> Inkling-Small (276 milliards au total, 12 milliards actifs) est annoncé, pas livré : le laboratoire indique terminer les tests et publier les poids complets une fois ce travail achevé [s2][s5]. Toute mention de poids disponibles le jour du lancement, celle ci-dessus comprise, ne concerne que le modèle à 975 milliards. Ne dimensionnez pas un déploiement autour d'un modèle à 12 milliards actifs que vous ne pouvez pas télécharger.

## Impact pour une équipe

Ce qui bouge, c'est votre base d'affinage, pas le modèle que vous appelez sur les questions difficiles. Si vous comptiez déjà spécialiser un modèle sur vos données, Apache 2.0 à 41 milliards actifs lève d'un coup la négociation juridique et l'objection du coût de service [s1][s3]. En revanche, s'il vous faut la meilleure réponse disponible, le laboratoire vous a lui-même renvoyé ailleurs [s2]. Surveillez Inkling-Small : à 12 milliards actifs, c'est la variante que la plupart des équipes feront tourner, et tant que ces poids ne sont pas publiés, seul le modèle à 975 milliards est évaluable.
