---
translationKey: ai-evaluation-compute-cost
lang: fr
slug: l-evaluation-est-le-nouveau-goulot-de-calcul
title: L'évaluation est le nouveau goulot d'étranglement de calcul
publishDate: 17-06-2026
tags:
- evaluation
- agents
category: essays
difficulty: 3
sources:
- label: 'Hugging Face: AI evals are becoming the new compute bottleneck'
  url: https://huggingface.co/blog/evaleval/eval-costs-bottleneck
  date: 29-04-2026
- label: Yehudai et al., A Survey on Evaluation of LLM-based Agents (arXiv 2503.16416)
  url: https://arxiv.org/abs/2503.16416
  date: 17-06-2026
contentHash: sha256:10db3821c418b354
publishState: published
---


La plupart des équipes budgètent leurs entraînements au dollar près et considèrent l'évaluation comme à peu près gratuite. Un seul balayage d'agents sur le Holistic Agent Leaderboard atteint pourtant environ 40 000 $ [s1], et la même tâche revient 33 fois moins chère ou plus chère selon les seuls choix de scaffold [s1]. Mon avis : une évaluation d'agent qui rapporte une exactitude sans colonne de coût est une mesure incomplète, et pas seulement mal documentée. Le chiffre publié est produit par un scaffold dont le budget déplace le résultat, et laisser ce budget hors du tableau n'a rien d'une omission cosmétique.

## Ce que coûte vraiment un seul passage de benchmark

Les ordres de grandeur ne sont pas des erreurs d'arrondi. Le Holistic Agent Leaderboard a dépensé environ 40 000 $ pour un seul balayage de 21 730 rollouts d'agents sur 9 modèles et 9 benchmarks [s1]. Un passage GAIA sur un modèle de pointe peut coûter 2 829 $ avant toute mise en cache [s1]. Mettez ces montants à côté d'un petit fine-tune et ils tombent dans la même tranche de budget : une évaluation agentique sérieuse est désormais une ligne de calcul que l'on planifie, pas un détail que l'on passe en note de frais. Et cette ligne revient à chaque relance : un test de non-régression après un changement de prompt, une réévaluation sur un modèle plus récent, un balayage pour régler le scaffold lui-même, chacun puisant dans le même budget.

Vous ne payez pas une seule passe avant par question ; vous payez un scaffold qui boucle, réessaie, appelle des outils et échantillonne sur des milliers de rollouts, et c'est cette boucle qui fixe la facture. La forme de cette boucle reste le plus souvent invisible sur le classement, alors que c'est elle qui a payé le score.

## Le coût est une propriété du résultat, pas une note de bas de page

Des tâches strictement identiques présentent un écart de coût de 33x selon la configuration de l'agent [s1]. Changez la boucle d'outils, la politique de réessai, le budget d'échantillonnage ou la mise en cache, et vous changez le prix de plus d'un ordre de grandeur. Souvent, vous changez aussi l'exactitude. Le scaffold n'est donc pas un détail de livraison posé sous le chiffre ; c'est une variable qui produit le chiffre, et c'est cela qui transforme une contrainte de budget en problème de mesure.

Concrètement : une boucle d'échantillonnage best-of-N avec k réessais d'outils a tendance à dépasser un passage en une seule tentative sur un benchmark difficile, et elle coûte aussi plusieurs fois plus cher par tâche. Ne rapportez que le score et les deux ressemblent au même agent à des niveaux de compétence différents. Rapportez le coût à côté et ils apparaissent pour ce qu'ils sont : un même modèle exécuté sous deux budgets.

Une exactitude nue en devient difficile à exploiter. Si je ne vois pas votre scaffold, je ne peux pas savoir si votre score vient d'une boucle économe ou d'une boucle à 2 829 $, et je ne peux certainement pas le reproduire avec mon budget. Un chiffre de capacité que vous ne pouvez ni vous offrir de rejouer ni inspecter dans sa configuration n'est pas un signal comparable. C'est une capture d'écran. La littérature d'enquête arrive au même point par le versant académique : les évaluations actuelles négligent le coût et l'efficacité et s'appuient sur des métriques grossières de bout en bout, utiles pour jauger la performance globale mais muettes sur la façon dont le résultat a été obtenu [s2].

Le mode de défaillance concret est un rang de classement qui bascule sous un simple échange de scaffold à exactitude égale. Deux agents font jeu égal au score ; l'un coûte 33 fois plus cher pour y parvenir ; le classement qui ignore le coût les déclare équivalents et oriente tout l'aval vers le mauvais choix par défaut.

> [!CONFIRMED]
> Un seul balayage HAL a coûté environ 40 000 $ sur 21 730 rollouts, un passage GAIA a coûté 2 829 $ avant mise en cache, et des tâches identiques ont montré un écart de coût de 33x selon la configuration [s1].

> [!INFERRED]
> J'en déduis qu'une exactitude dont vous ne voyez ni le scaffold ni le budget n'est pas un signal comparable, car la même tâche au même score peut différer de plus d'un ordre de grandeur dans ce qu'elle a coûté à produire.

## « De la simple hygiène de mesure » et « le dollar est la mauvaise unité »

« Rapporter la variable qui change votre résultat » relève de l'hygiène de mesure de manuel ; aucun méthodologue ne le conteste, donc en faire une thèse discutable frôle la tautologie. Et même en accordant que le coût a sa place dans le tableau, le dollar reste une mauvaise unité. Les prix baissent, les politiques de cache diffèrent, l'auto-hébergement diverge de l'API de plusieurs ordres de grandeur ; un montant en dollars n'est donc qu'un indicateur mouvant et non portable de ce qu'il faudrait vraiment divulguer : le budget de scaffold et de rollouts.

Sur l'hygiène : ce n'est pas la pratique consensuelle. Les grands classements continuent de hiérarchiser sur la seule exactitude, le coût étant absent ou renvoyé au texte courant, et la littérature d'enquête doit signaler cette omission comme une lacune [s2]. Une affirmation qui qualifie d'incomplète la pratique standard actuelle n'est, par définition, pas triviale, aussi évidente qu'elle paraisse une fois énoncée. Sur l'unité : l'objection affûte la thèse au lieu de la défaire. La solution n'est pas de sacrer le dollar unité canonique. C'est de rapporter un coût normalisé à côté de ses facteurs, pour que la colonne soit reproductible plutôt qu'un instantané de prix périssable. D'expérience, le dollar est ce sur quoi roule une discussion de budget, et ce sont les facteurs (tokens, rollouts, politique de cache) qui font survivre ce chiffre à un changement de prix au lieu de le voir expirer avec lui.

## À quoi ressemble une évaluation attentive au coût

Budgétez les rollouts comme vous budgétez un entraînement : fixez le budget d'échantillonnage avant de lancer, pas après avoir vu la facture. Mettez agressivement en cache ; le chiffre GAIA est explicitement celui d'avant la mise en cache [s1], et le cache fait la différence entre un balayage que l'on peut répéter et un balayage que l'on lance une fois pour en faire une capture. Puis rapportez le coût comme une colonne de premier plan à côté de l'exactitude, normalisée à ses facteurs.

| Rapport d'évaluation | Exactitude | Coût | Facteurs divulgués |
| :--- | :---: | :---: | :--- |
| Exactitude seule | publiée | absent | aucun |
| Attentif au coût | publiée | normalisé | tokens / rollouts / échantillons, config du scaffold, politique de cache |

Comptez les tokens en entrée et en sortie, le nombre d'appels d'outils, les réessais et les accès au cache par rollout, puis agrégez-les à côté du score, dans le même passage. La colonne de coût a alors la même provenance que la colonne d'exactitude, au lieu d'être reconstituée trois semaines plus tard à partir d'une facture cloud, et l'effort d'ingénierie marginal se réduit à un compteur posé sur la boucle qui produit déjà la réponse. La colonne des facteurs est ce qui rend le chiffre reproductible : tokens, rollouts et échantillons restent portables d'un régime de prix à l'autre là où un montant brut en dollars ne l'est pas, et la config du scaffold avec la politique de cache permettent à un tiers d'atteindre votre chiffre ou d'expliquer pourquoi il n'y parvient pas.

Quand je lis un nouveau classement, désormais, la première chose que je cherche, c'est la colonne de coût. Si elle manque, je considère le classement comme non chiffré tant qu'on ne m'a pas montré ce qu'il a fallu pour le produire, exactement comme je ne ferais pas confiance à un résultat d'entraînement annoncé sans budget de calcul.
