---
translationKey: llm-screen-recall-needs-a-sample-of-what-it-rejected
lang: fr
slug: dimensionnez-l-audit-de-votre-filtre-llm-selon-la-perte-toleree
title: Dimensionnez l'audit de votre filtre LLM selon la perte que vous tolérez
publishDate: 11-11-2026
tags:
- evaluation
- retrieval
- agents
category: essays
difficulty: 4
sources:
- label: Chang and Zhang, Multi-Agent Screening, screening setting
  url: https://arxiv.org/abs/2611.12705
  date: 09-11-2026
- label: Madeyski, Kitchenham and Shepperd, LLM4SCREENLIT, reporting survey
  url: https://arxiv.org/abs/2511.12635
  date: 25-04-2026
- label: Mughal and Bilal, LLM-Based Test Oracles review, exclusion sample design
  url: https://arxiv.org/abs/2607.05031
  date: 02-09-2026
contentHash: sha256:aed7f061e81225d0
publishState: published
---


À mon avis, le prochain achat d'un filtre LLM en service est un échantillon aléatoire et jugé de ses rejets, calibré sur la part d'éléments pertinents que vous pouvez perdre. Benjamin Chang et Dell Zhang [s14] décrivent exactement ce cas : quand des agents d'IA trient des éléments pour un évaluateur humain coûteux, seul ce qu'ils laissent passer est jugé [s1]. Que ces agents tombent d'accord montre qu'ils concordent, quel que soit leur nombre, et ne dit rien de leur justesse [s2] ; les acceptations de l'évaluateur donnent la précision, mais seulement une borne inférieure du rappel [s3]. Sans hypothèse sur les agents, écrivent Chang et Zhang, seul le jugement d'éléments que les agents n'ont pas laissés passer permet de fixer le rappel ; un échantillon aléatoire de ces éléments estime combien d'éléments pertinents ont été manqués, avec l'exactitude que l'on veut, et la taille nécessaire ne croît pas avec le nombre d'agents [s4]. Mon argument commence au mot exactitude : une exactitude a une unité, et l'unité décide de la taille de l'échantillon.

## Ce que Chang et Zhang ont déjà réglé

Rien dans cet achat ne vient de moi. Chang et Zhang définissent l'audit comme des jugements portant sur un échantillon aléatoire pris hors du lot transmis à l'évaluateur, ce que l'e-discovery appelle un test d'élusion [s18], dans un cadre qui traite une collection fixe d'éléments, comme des documents, des modifications de code ou des articles [s27]. Chang et Zhang conseillent de comparer l'agent suivant avec un audit avant d'acheter l'un ou l'autre, de budgéter les audits selon l'exactitude voulue [s23], et de publier la précision, et le rappel sous forme d'intervalle, car un chiffre unique en affirme trop [s24].

Je lis « modifications de code » comme une autorisation de porter la règle sur les filtres que je construis : seuils de reranker, bots de tri des PR, passes de tri des alertes d'un scanner. Cette extension est la mienne. Ce que leur conseil laisse à l'opérateur, c'est l'unité dans laquelle s'écrit l'exactitude.

## Une marge d'erreur a une unité

Chez Chang et Zhang, l'exactitude porte sur une part de la collection entière. L'inconnue que Chang et Zhang estiment est la proportion de la collection qui est pertinente mais non jugée [s17], qu'ils notent H. Leur exemple chiffré se situe dans une conférence hypothétique où trois relecteurs retiennent 200 soumissions sur 1000 [s22] ; d'après Chang et Zhang, un audit de 192 des 800 autres estime H à plus ou moins 0.05 [s20], et leur borne générale demande 473 audits, là où un calcul hypergéométrique exact en demande 192 [s21]. Ce 0.05 n'est qu'un exemple chiffré ; leur propre formule dit « avec l'exactitude que l'on veut ».

Lech Madeyski, Barbara Kitchenham et Martin Shepperd [s15] raisonnent dans l'autre unité. Ils définissent le rappel comme la proportion d'études pertinentes identifiées et le Lost Evidence comme 1-Recall [s29], et préviennent que les métriques usuelles de la matrice de confusion peuvent induire en erreur dans les conditions déséquilibrées et aux coûts asymétriques du tri [s28]. Pour les études de déploiement, Madeyski, Kitchenham et Shepperd exigent un seuil de Lost Evidence fixé à l'avance, des intervalles de confiance tirés de l'échantillon et une règle d'escalade si le seuil n'est pas atteint [s31].

Le pont vient de Chang et Zhang : le rappel vaut `r = ap/(ap + H)` [s41]. L'étape que j'ajoute est la suivante. Le Lost Evidence vaut un moins le rappel, donc `LE = H/(ap + H)`, où `ap` est, si je lis bien leur notation, la part de la collection acceptée par l'évaluateur, que le lot déjà jugé vous fournit. Tant que H reste petit, une erreur absolue sur H déplace le Lost Evidence d'environ cette erreur divisée par `ap`. Quand les éléments pertinents ne forment qu'une mince tranche de la collection, une marge serrée sur H devient lâche sur le Lost Evidence. Dimensionner dans la première unité quand la décision se prend dans la seconde, j'appelle cela le bon audit dans la mauvaise unité : l'échantillon tient l'exactitude annoncée et ne dit presque rien du seuil.

| Grandeur | Part de | Définie par |
| :--- | :--- | :--- |
| H, pertinent mais non jugé | la collection entière | Chang et Zhang [s17] |
| Lost Evidence, 1-Recall | les éléments pertinents | Madeyski, Kitchenham et Shepperd [s29] |
| Part pertinente de l'audit, multipliée par 1-a | la pile des rejets, tirée uniformément | l'estimation de H de Chang et Zhang [s43] |

## Ce qu'une revue a obtenu d'une fraction fixe

Une revue publiée montre ce que rapporte une fraction fixe des rejets. Ali Hassaan Mughal et Muhammad Bilal [s16] ont passé un préfiltre LLM sur un corpus de littérature de 2 245 enregistrements uniques [s32]. Mughal et Bilal ont formé un ensemble de vérification de 385 enregistrements avec les 178 que le modèle avait retenus et un échantillon aléatoire de 10 % stratifié par motif, soit 207 des 2 067 qu'il avait exclus [s13] [s8]. L'échantillon des exclusions, écrivent Mughal et Bilal, estime à quelle fréquence le modèle écarte à tort des travaux pertinents [s9]. La conciliation humaine a donné à Mughal et Bilal un consensus de 115 enregistrements retenus (87 inclus, 28 incertains) et 270 exclus sur cet ensemble [s33].

> [!CONFIRMED]
> Mughal et Bilal rapportent un rappel de 99.1 % sur l'ensemble de vérification, le modèle s'accordant avec tous les enregistrements retenus par consensus sauf un [s10]. Rapporté aux 1 860 exclusions jamais revues, leur intervalle va de 0 à 50 enregistrements manqués [s34].

> [!INFERRED]
> J'y vois un seul audit, vu sous deux angles. La fraction a fixé le nombre de rejets jugés, et l'intervalle est sorti à la largeur que permet une seule omission. Personne n'a choisi cette largeur à l'avance.

Mughal et Bilal ajoutent que l'unique manque était lui-même un cas limite, rattaché aux inclusions seulement après discussion du texte intégral [s35]. Mughal et Bilal rapportent aussi le taux de fausses omissions observé du modèle sur l'échantillon stratifié de ses propres exclusions [s40]. Si ce taux valait pour les 1 860 exclusions non revues une par une, il impliquerait environ neuf enregistrements pertinents manqués [s11]. Les auteurs ont calculé l'intervalle par la méthode binomiale exacte, dite de Clopper-Pearson [s39], et comme l'intervalle autour d'une seule omission observée est large, ils traitent le risque résiduel comme une menace pour la validité [s12].

Portez l'exactitude de l'exemple de Chang et Zhang sur le corpus de Mughal et Bilal, pour fixer les ordres de grandeur : plus ou moins 0.05 de la collection [s20], sur 2 245 enregistrements [s32], à côté des 115 enregistrements retenus par leur consensus humain [s33]. Je n'y verrais pas la preuve que les unités divergent ; c'est l'identité qui porte cet argument, et l'image montre seulement la latitude que laisse une erreur sur la collection entière quand les éléments pertinents sont rares.

## Le chiffre que la production ne vous donne pas

Un filtre en service ne peut pas calculer le Lost Evidence à partir de ce qu'il a laissé passer. Sur les 29 articles qu'ont examinés Madeyski, Kitchenham et Shepperd, seuls 10 % donnaient le MCC, seuls 24 % des matrices de confusion complètes, et aucun des cinq articles revendiquant des économies de charge de travail ne chiffrait le coût des faux négatifs [s5]. Dans une étude de génie logiciel portant sur 9 695 articles, rapportent-ils, le LLM le mieux classé en Accuracy perd 63.3 % des éléments pertinents, le meilleur en MCC 43.9 % et le meilleur en WMCC seulement 5.8 % [s6]. Je lis cette ligne comme une leçon sur la sélection : la métrique de classement choisit le filtre qui part en production. Madeyski, Kitchenham et Shepperd recommandent de donner la priorité au Lost Evidence [s7]. Une étude rétrospective peut le calculer parce que, comme le notent Madeyski, Kitchenham et Shepperd, la population des résumés de la revue concernée a été entièrement classée [s30].

Un filtre qui tourne déjà sur un trafic que personne d'autre ne juge n'a d'étiquettes que là où quelqu'un a regardé. À mon sens, la métrique que réclame cette revue de littérature ne s'y calcule qu'au moyen d'un audit des rejets. Le mode d'échec que je vois à sa place, c'est le rappel par consensus : trois votants tombent d'accord, un tableau de bord affiche un chiffre élevé, et ce chiffre mesure à quel point les votants concordent.

## Les objections que je dois traiter

Quatre objections méritent d'être entendues.

L'agent suivant coûte moins cher. Dans l'exemple de Chang et Zhang, l'audit trouve davantage et certifie à lui seul les manques, mais consomme presque tout le budget, alors que le 4e relecteur n'a besoin de relectures que pour ses nouvelles propositions, qui pourraient être bien moins nombreuses [s25]. J'achèterais quand même l'audit en premier si je devais annoncer un rappel. Le plafond que Chang et Zhang posent sur l'apport d'un agent de plus est une borne sous conditions, et un agent d'un genre nouveau n'est pas couvert [s26]. Un changement de modèle, à mon sens, est précisément ce genre d'agent.

Une fraction a suffi à cette revue. Mughal et Bilal bornent la conséquence : les neuf omissions projetées correspondent à environ quatre études incluses supplémentaires [s36], qui, réparties comme le reste du corpus, laisseraient inchangé chaque classement des sources [s37]. Dans le pire cas de Mughal et Bilal, si les quatre ajouts dérivaient tous d'une spécification, la courte majorité qui rend un verdict sans spécification deviendrait une courte minorité, mais le point de fond tiendrait dans les deux cas [s38]. Ce raisonnement est celui que je recommande, mené après l'échantillon, sur une taxonomie dont le point principal survit au pire cas. Un filtre où chaque élément perdu a son propre prix, une vulnérabilité manquée ou une clause de contrat écartée, n'a pas ce matelas.

Une étude de déploiement lit déjà le Lost Evidence en direct. Madeyski, Kitchenham et Shepperd décrivent des études de déploiement qui, en général, testent des LLM sur un échantillon aléatoire d'études primaires candidates issues d'une revue en cours, afin de décider s'il faut déployer le LLM sur les résumés restants [s42] ; leur seuil appartient à ce dispositif et n'a besoin d'aucune conversion. Je ferais tourner ce pilote tant que la décision est ouverte. Il ne dit rien de ce que le filtre laissera tomber sur le trafic du mois suivant ou après un changement de modèle. Une fois le filtre en service, ce qu'il laisse passer est déjà jugé ; je dirigerais donc les nouveaux jugements vers la pile des rejets.

L'objection la plus sérieuse retourne mon étape contre moi. Une fois convertie par l'identité, une tolérance sur le Lost Evidence devient une tolérance sur H qui rétrécit avec `ap` ; à faible prévalence, l'échantillon peut approcher la taille de la pile des rejets, et le garder petit revient à parier sur peu de manques, précisément le genre d'hypothèse qu'un audit sert à éviter. J'accepte l'arithmétique et je garde l'ordre. La taille calculée pour zéro manque est un plan ; l'intervalle publié repose sur les manques réellement trouvés, sans hypothèse sur les agents, et s'élargit de lui-même quand ils apparaissent. Quand le plan donne une taille élevée, cette taille est le prix que je mets en regard d'un 4e relecteur. Une décision chiffrée dans la bonne unité peut encore aller à l'agent le moins cher ; elle ne doit pas y aller par défaut.

## Ce que je ferais lundi

Voici la procédure que j'appliquerais à un filtre déjà en service.

- Conserver chaque élément rejeté avec son identifiant.
- Écrire le nombre d'éléments pertinents perdus qui changerait la décision, avant de voir le moindre jugement.
- En tirer un plafond de Lost Evidence, le faire passer par l'identité pour obtenir un plafond sur H, puis diviser par 1-a pour obtenir un plafond sur le taux de manques dans la pile des rejets.
- Tirer l'audit uniformément dans la pile des rejets avec une graine fixe, à une taille telle que la borne supérieure binomiale exacte passe sous le plafond si aucun manque n'apparaît.
- Publier la précision, et le rappel sous forme d'intervalle, comme le conseillent Chang et Zhang [s24].
- Mettre le prix de l'audit en regard de ce que le votant suivant pourrait apporter, la comparaison que demandent Chang et Zhang [s23].

En code, toute la règle tient en quatre petites fonctions.

```python
import math
import random

from scipy.stats import beta


def draw_audit(rejected_ids, n, seed):
    return random.Random(seed).sample(sorted(rejected_ids), n)


def miss_rate_ceiling(le_max, ap, a):
    h_max = le_max * ap / (1 - le_max)
    return h_max / (1 - a)


def floor_sample_size(rate_max, alpha):
    return math.ceil(math.log(alpha / 2) / math.log(1 - rate_max))


def lost_evidence_upper(misses, n, ap, a, alpha):
    rate_hi = 1.0 if misses == n else beta.ppf(1 - alpha / 2, misses + 1, n - misses)
    h_hi = (1 - a) * rate_hi
    return h_hi / (ap + h_hi)
```

Le plancher est le plus petit `n` dont la borne supérieure exacte passe sous le plafond quand l'audit ne trouve rien ; la loi binomiale ignore que la pile est finie, ce qui pèche par excès de largeur. Si `floor_sample_size` renvoie un nombre proche de la taille de la pile, c'est la dernière objection, chiffrée.

> [!WARNING]
> Tirez uniformément. Chang et Zhang énoncent leur estimation pour des éléments tirés uniformément et sans remise hors du lot transmis [s19]. Un échantillon stratifié par motif de rejet, comme celui de la revue ci-dessus, demande une pondération avant de pouvoir alimenter cette estimation.

Rien de tout cela n'exige un nouvel article. Il faut un seul chiffre, écrit avant l'audit, dans l'unité où se prend la décision, et la discipline de le convertir avant de calculer quoi que ce soit.
