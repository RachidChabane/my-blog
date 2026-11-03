---
translationKey: weight-space-edit-removes-thinking-loops-adds-no-math-ability
lang: fr
slug: modification-poids-supprime-boucles-reflexion-sans-gain-maths
title: La modification de poids de GPT-6 Astra a fait progresser Qwen3.5-0.8B sur
  MATH-500 en supprimant ses boucles de réflexion, s'accordent ses auteurs du MIT
  CSAIL et Sean Goedecke ; sur Gemma 3 270M, qui boucle rarement, les auteurs indiquent
  qu'aucune modification n'a fait bouger MATH-500 de plus d'environ un point
publishDate: 03-11-2026
kind: research
tags:
- GPT-6
- Qwen
- Gemma
- Hugging Face
- evals
summary: 'Le 2 novembre 2026, Takehi, Teoh, Zhang et Khattab, du MIT CSAIL, ont publié
  Sparks of Weight-Space Programming, où les auteurs donnent à GPT-6 Astra un noyau
  Python sur les poids de Qwen3.5-0.8B. Selon les auteurs, MATH-500 est passé de 7.9%
  à 48.1% tandis que la part des réponses MATH-500 arrivées à la limite de 32 768
  tokens tombait de 93% à 33%, et sur Gemma 3 270M, qui boucle rarement, aucune modification
  d''Astra n''a fait bouger MATH-500 de plus d''environ un point. Sean Goedecke décrit
  un patch qui a empêché le modèle Qwen de boucler, et y voit exactement ce qu''un
  chercheur humain compétent aurait pu faire, et aurait fait. Ma recommandation :
  mesurez la part des réponses qui atteignent votre limite de tokens avant de remplacer
  un petit modèle de réflexion par un plus gros.'
sources:
- label: 'Takehi, Teoh, Zhang and Khattab (MIT CSAIL), Sparks of Weight-Space Programming:
    LLMs can natively read and write neural network weights'
  url: https://rikiyat.github.io/blog/weight-space-programming/
  date: 02-11-2026
- label: Hugging Face model card, RikiyaT/Qwen3.5-0.8B-weight-space-programming
  url: https://huggingface.co/RikiyaT/Qwen3.5-0.8B-weight-space-programming
  date: 02-11-2026
- label: Sean Goedecke, LLMs are not superhuman at reading and writing neural network
    weights
  url: https://www.seangoedecke.com/llms-are-not-superhuman-at-reading-and-writing-neural-network-weights/
  date: 03-11-2026
contentHash: sha256:f5a4918539ea5ef3
publishState: published
---

## Ce qui change

Le 2 novembre 2026, Takehi, Teoh, Zhang et Khattab, du MIT CSAIL, ont publié Sparks of Weight-Space Programming, où les auteurs donnent à GPT-6 Astra un noyau Python sur les poids de Qwen3.5-0.8B [s1]. Selon les auteurs, Astra a rattaché les boucles du modèle à une direction écrite par les MLP des couches 15 et 19, puis l'a soustraite de 64 colonnes de sortie dans chacune, soit 131 072 poids [s1]. Leur fiche Hugging Face indique que le checkpoint a été modifié par un LLM sans entraînement, et que seuls deux tenseurs diffèrent de Qwen/Qwen3.5-0.8B [s2].

## Un score pour des réponses inachevées

Les auteurs évaluent avec la réflexion activée, jusqu'à 32 768 tokens ; voici leur tableau, sur trois colonnes [s1] :

| Qwen3.5-0.8B | MATH-500 (%) | GSM8K (%) | Limite atteinte (%) | Selon |
| :--- | ---: | ---: | ---: | :--- |
| Base | 7.9 | 13.8 | 93.0 | Auteurs [s1] |
| Modifié, 10 forward passes | 12.3 | 25.7 | 87.2 | Auteurs [s1] |
| Modifié, 25 forward passes | 14.1 | 25.1 | 86.4 | Auteurs [s1] |
| Modifié, 50 forward passes | 48.1 | 67.1 | 33.1 | Auteurs [s1] |

À ma lecture, MATH-500 reste à 14.1% ou moins tant que 86.4% des réponses ou plus butent sur la limite, et ne saute à 48.1% que lorsque cette part tombe à 33.1% : les 7.9% du modèle de base sont le score d'un modèle qui atteint rarement une réponse. Selon les auteurs, corriger les boucles permet au modèle de finir des réponses qu'il savait déjà résoudre, et sur Gemma 3 270M, dont 8.5% des réponses seulement atteignent la limite, aucune modification d'Astra n'a déplacé MATH-500 de plus d'environ un point [s1].

> [!IMPORTANT]
> Le tableau est la propre mesure des auteurs. Une réexécution sur leur fiche Hugging Face, construite par akhaliq, indique que le modèle modifié a obtenu 51.0%, avec 31.6% des réponses à la limite [s2]. Les auteurs remercient Ahsen Khaliq, de Hugging Face, d'avoir relancé leur évaluation [s1]. Je la compte comme une réexécution créditée, du côté des auteurs.

## Où porte l'objection

L'objection la plus solide : les auteurs ont fait bouger MATH-500 en modifiant 0.016% des poids, et un gain reste un gain [s1]. Je suis d'accord, il est réel, et les auteurs publient leurs logs complets [s1]. À mon sens, c'est une correction de boucles, et Sean Goedecke le lit de la même façon : il décrit un patch qui a empêché le modèle Qwen de boucler, dit qu'il essaierait le steering, et y voit exactement ce qu'un chercheur humain compétent aurait pu faire, et aurait fait [s3].

## Impact pour une équipe

Si vous servez un petit modèle de réflexion plafonné en tokens, ma recommandation : mesurez la part des réponses qui atteignent la limite avant de le remplacer par un modèle plus gros, et traitez une part élevée en priorité. Je reprendrais les réglages de la réexécution sur la fiche Hugging Face, `vLLM, thinking on, temperature 0.6, top_p 0.95, top_k 20, presence_penalty 1.5, max 32,768 new tokens, seed 0` [s2], et comparerais les deux tenseurs qu'elle nomme, `model.language_model.layers.15.mlp.down_proj.weight` et `model.language_model.layers.19.mlp.down_proj.weight`. La panne que je surveillerais : un benchmark qui compte une réponse tronquée comme fausse, et un modèle qui boucle passe alors pour incapable de raisonner.
