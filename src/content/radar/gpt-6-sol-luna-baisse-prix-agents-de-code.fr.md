---
translationKey: gpt-6-luna-automationbench-up-coding-agent-index-down
lang: fr
slug: gpt-6-sol-luna-baisse-prix-agents-de-code
title: GPT-6 Sol et Luna coûtent moitié moins que GPT-5.6 en tarif promotionnel, et
  Artificial Analysis classe Luna 2 points plus bas en max sur son Coding Agent Index
publishDate: 27-09-2026
kind: release
tags:
- OpenAI
- GPT-6
- agents
- evals
summary: 'OpenAI facture GPT-6 Sol et Luna à la moitié des tarifs promotionnels de
  GPT-5.6. En max, Sol gagne 2 points sur le Coding Agent Index d''Artificial Analysis,
  Luna en perd 2 : je basculerais dès maintenant sur GPT-6 Sol les agents de code
  qui tournent sur GPT-5.6 Sol et je répartirais Luna selon la tâche, avant la hausse
  de 25 % de GPT-5.6 que Simon Willison signale pour novembre.'
sources:
- label: OpenAI, "Introducing GPT-6 Sol and Luna"
  url: https://openai.com/index/introducing-gpt-6-sol-and-luna/
  date: 22-09-2026
- label: Artificial Analysis, "GPT-6 Sol and Luna push the cost efficiency frontier"
  url: https://artificialanalysis.ai/articles/gpt-6-sol-and-luna-push-the-cost-efficiency-frontier
  date: 22-09-2026
- label: Simon Willison, "Claude Opus 5.5, GPT-6 Sol, GPT-6 Luna, and a new price
    war"
  url: https://simonwillison.net/2026/Sep/22/opus-and-sol-and-luna/
  date: 22-09-2026
contentHash: sha256:dce58fc28ca6ccca
publishState: published
---

## Ce qui change

OpenAI a publié GPT-6 Sol et GPT-6 Luna le 22 septembre 2026 [s2][s3], exposés dans l'API sous les identifiants `gpt-6-sol` et `gpt-6-luna` [s1]. OpenAI annonce une baisse de 50 % par rapport aux tarifs promotionnels de GPT-5.6 : Sol passe de 4 $ à 2 $ par million de jetons en entrée et de 20 $ à 10 $ en sortie, Luna de 0,20 $ à 0,10 $ et de 1,20 $ à 0,50 $ [s1]. Artificial Analysis les place tous deux au niveau de GPT-5.6 sur son Intelligence Index, avec des progrès sur certaines évaluations et des reculs sur d'autres [s2].

## Où Sol et Luna divergent

| GPT-6 face à GPT-5.6 (Artificial Analysis) | Sol | Luna |
| :--- | ---: | ---: |
| Coding Agent Index, max [s2] | 57 (+2) | 41 (-2) |
| SWE-Atlas-QnA, max [s2] | 58 % contre 54 % | 44 % contre 49 % |
| AutomationBench-AA [s2] | 62 % contre 60 % | 53 % contre 50 % |
| Coût par tâche de l'Intelligence Index, max [s2] | 1,06 $ contre 1,99 $ | 0,07 $ contre 0,18 $ |

Pour les agents de code, Sol en max est la mise à niveau évidente. Dans le harness Codex d'OpenAI, il obtient 57 sur le Coding Agent Index, soit 2 points de plus, pour 2,99 $ par tâche sur cet index, environ 50 % de moins que GPT-5.6 Sol en max [s2].

Luna, lui, relève du routage. OpenAI annonce qu'en effort high il fait 5,4 points de pourcentage de mieux que son prédécesseur sur AutomationBench [s1]. Artificial Analysis mesure aussi un gain sur son propre AutomationBench-AA [s2]. En code, il recule : en max, 41 sur le Coding Agent Index, 2 points sous GPT-5.6 Luna en max, avec des scores plus bas sur SWE-Atlas-QnA et DeepSWE v1.1 [s2]. Sur l'Intelligence Index, sa baisse de coût par tâche vient de la baisse de prix : en max, il consomme plus de jetons de sortie par tâche que GPT-5.6 Luna, 51k contre 41k [s2].

Les deux modèles régressent sur GDPval-AA v2.1 en effort max, ce qu'Artificial Analysis attribue à des livrables plus courts qui omettent plus souvent des éléments requis [s2]. Je pense que c'est le mode de défaillance à tester avant toute bascule : un générateur de rapports ou de spécifications qui passe une relecture rapide et livre un document amputé d'une section obligatoire.

## Impact pour une équipe

Simon Willison signale une hausse de prix de 25 % programmée pour GPT-5.6 en novembre [s3]. À mon avis, cela tranche la question de Luna pour les agents de code : garder GPT-5.6 Luna pour éviter le recul de 2 points coûte déjà plus cher par tâche en max, et coûtera davantage encore après novembre. Reste un arbitrage entre la facture plus basse de Luna et le meilleur score de Sol sur le Coding Agent Index en max.

Ma recommandation : basculez dès maintenant sur `gpt-6-sol` les agents de code qui tournent sur GPT-5.6 Sol. Orientez `gpt-6-luna` en priorité vers l'automatisation de workflows et les outils de requêtes. Willison a passé sa démo Datasette Agent sur GPT-6 Luna et écrit qu'il semble rapide et compétent en requêtes SQL [s3]. Pour les tâches qui produisent des livrables, ajoutez une évaluation qui vérifie la présence de chaque élément requis avant de confier le travail à Luna ou à Sol, et bouclez-la avant novembre.
