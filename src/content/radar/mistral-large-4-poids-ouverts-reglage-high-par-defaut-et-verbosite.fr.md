---
translationKey: mistral-large-4-open-weights-high-default-verbosity-scope
lang: fr
slug: mistral-large-4-poids-ouverts-reglage-high-par-defaut-et-verbosite
title: Mistral Large 4 passe en poids ouverts, et Artificial Analysis mesure son réglage
  High à 110M de jetons sur l'Intelligence Index, plutôt verbeux, quand Mistral annonce
  47 % de jetons en moins que GLM-5.3 sur le Coding Agent Index
publishDate: 30-10-2026
kind: release
tags:
- Mistral
- Mistral Large 4
- Artificial Analysis
- evals
summary: 'Mistral publie les poids de Mistral Large 4, et Artificial Analysis date
  la sortie du 29 octobre 2026. Selon Mistral, le modèle obtient 48 % sur l''Artificial
  Analysis Coding Agent Index, à égalité de fait avec GLM-5.3 tout en consommant 47
  % de jetons de moins par tâche. Sur son Intelligence Index, Artificial Analysis
  mesure le réglage High à 110M de jetons, plutôt verbeux face à la médiane de 100M,
  et Medium à 73M. La fiche du modèle de Mistral fait de high l''effort de raisonnement
  par défaut. Ma recommandation : mesurez les jetons de sortie par tâche sur vos propres
  tâches en medium et en high avant de dimensionner un budget ou de régler reasoning_effort.'
sources:
- label: Mistral, Mistral Large 4 (Le Chonk) is now open weight
  url: https://mistral.ai/news/mistral-large-4-oss/
  date: 29-10-2026
- label: Artificial Analysis, Mistral Large 4 (High) model page
  url: https://artificialanalysis.ai/models/mistral-large-4
  date: 29-10-2026
- label: Hugging Face, mistralai/Mistral-Large-4-1T-A52B model card
  url: https://huggingface.co/mistralai/Mistral-Large-4-1T-A52B
  date: 29-10-2026
- label: Artificial Analysis, Mistral Large 4 (Medium) model page
  url: https://artificialanalysis.ai/models/mistral-large-4-medium
  date: 29-10-2026
contentHash: sha256:4214fb1a80c78245
publishState: published
---

## Ce qui change

Mistral publie les poids de Mistral Large 4 sous la Mistral Ecosystem Open-Weight license, une licence MIT modifiée [s1]. Selon Artificial Analysis, Mistral Large 4 (High) est sorti le 29 octobre 2026, et ses poids peuvent être téléchargés pour l'auto-hébergement [s2]. La fiche du modèle de Mistral décrit un Mixture-of-Experts de mille milliards de paramètres, dont 49 milliards actifs par jeton, et fixe à high l'effort de raisonnement par défaut [s3].

## Deux chiffres de jetons, deux indices

À mon avis, l'argument des jetons mérite une lecture attentive. Selon Mistral, sur l'Artificial Analysis Coding Agent Index, le modèle obtient 48 %, pratiquement à égalité avec GLM-5.3 tout en consommant en moyenne 47 % de jetons de moins par tâche, et son graphique place ce 48 sous l'étiquette Mistral Large 4 - High [s1]. Artificial Analysis mesure le réglage High sur son Intelligence Index : 26 points, 110M de jetons, plutôt verbeux face à la médiane de 100M, et 2,06 $ par tâche d'évaluation [s2]. Sur le même indice, Artificial Analysis donne à Medium 23 points, 73M de jetons, assez concis, et 1,41 $ par tâche d'évaluation [s4].

> [!CONFIRMED]
> La fiche du modèle de Mistral indique que l'effort de raisonnement par défaut est high, et que `max_completion_tokens` inclut les jetons de raisonnement en plus des jetons de sortie visibles [s3].

> [!INFERRED]
> Ma lecture : si le high de la fiche est bien le High mesuré par Artificial Analysis, garder la valeur par défaut place chaque requête au réglage jugé plutôt verbeux, et un `max_completion_tokens` calibré pour la seule réponse peut s'épuiser en raisonnement.

## Les deux chiffres tiennent

L'objection la plus solide : ces deux chiffres sont compatibles. Les 47 % de Mistral sont mesurés face à GLM-5.3 sur le Coding Agent Index, tandis qu'Artificial Analysis juge la verbosité face à une médiane de jetons sur son Intelligence Index [s1][s2]. Je suis d'accord. Je ne dimensionnerais donc un budget sur aucun des deux : ils n'ont pas été mesurés sur vos tâches, et le chiffre de Mistral est relatif à un autre modèle.

## Impact pour une équipe

Ma recommandation, si vous comptez servir les poids avec vLLM ou SGLang comme le propose Mistral [s1] : avant de dimensionner un nœud ou un budget de jetons, faites tourner vos propres tâches en medium et en high, et consignez les jetons de sortie par tâche à côté du score. Puis réglez `reasoning_effort` requête par requête à partir de ce journal, et dimensionnez `max_completion_tokens` pour le raisonnement plus la réponse. Je ne reporterais pas dans un plan de capacité les 47 % de jetons en moins face à GLM-5.3 sur le Coding Agent Index avant que votre journal le montre.
