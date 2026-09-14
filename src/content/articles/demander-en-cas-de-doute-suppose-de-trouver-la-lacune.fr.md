---
translationKey: ask-when-unsure-is-gated-on-detection
lang: fr
slug: demander-en-cas-de-doute-suppose-de-trouver-la-lacune
title: Demander en cas de doute suppose que l'agent repère la lacune
publishDate: 14-09-2026
tags:
- agentic-coding
- evaluation
category: essays
difficulty: 3
sources:
- label: IdeaAMBIG benchmark, what it separates
  url: https://arxiv.org/abs/2609.10539
  date: 09-09-2026
- label: Ambig-SWE underspecified SWE-Bench variant, setup
  url: https://arxiv.org/abs/2502.13069
  date: 18-02-2025
contentHash: sha256:ad87cc136a222c6c
publishState: published
---


Dire à un agent de code de demander en cas de doute suppose qu'il voie que la spécification est incomplète, et deux benchmarks montrent que les modèles peinent justement là. Sur IdeaAMBIG, le meilleur des 13 LLM obtient 9.6 % de Macro Defect Recovery Rate sur les instances réelles quand il n'a que la spécification, et 80.6 % de Macro Clarification Action Success Rate quand on lui fournit le défaut [s2]. Un benchmark bâti sur des dépôts, conçu par une autre équipe, constate que les modèles peinent à distinguer les instructions bien spécifiées des instructions sous-spécifiées [s5]. Rapprocher les deux relève de ma lecture, et cette lecture place l'échec avant même qu'une question soit posée.

## Deux tâches qui ne diffèrent que par une entrée

Ce qui m'intéresse le plus dans IdeaAMBIG, je pense, c'est sa conception, parce qu'elle isole la question de savoir qui doit trouver la lacune. Le benchmark réunit 660 instances documentées, dont 163 lacunes réelles tirées de rapports de reproductibilité et d'issues GitHub et 497 lacunes synthétiques contrôlées injectées dans des références prêtes à être codées, et il mesure trois capacités : l'évaluation de la préparation au codage, la localisation des défauts et la génération d'actions de clarification [s1]. Il s'agit de spécifications de recherche que quelqu'un veut transformer en code, ce qui comptera quand je les comparerai au travail sur un dépôt.

Deux de ces capacités reçoivent presque la même entrée. La localisation des défauts ne reçoit que la spécification, alors que la clarification reçoit en plus le défaut annoté [s2]. Le modèle, la spécification et le lot d'instances ne bougent pas. Seule une entrée s'ajoute, et c'est ce qui rend la comparaison digne d'une lecture attentive.

| Tâche | Ce que reçoit le modèle | Métrique | Score du meilleur modèle |
| :--- | :--- | :--- | ---: |
| Localisation des défauts | La spécification seule [s2] | Macro Defect Recovery Rate, instances réelles | 9.6 % [s2] |
| Génération d'actions de clarification | La spécification et le défaut annoté [s2] | Macro Clarification Action Success Rate, défaut fourni | 80.6 % [s2] |

Les deux lignes reposent sur des métriques différentes : j'y lis donc un indice de l'endroit où se loge la difficulté, et je refuse d'en tirer un rapport chiffré. Les conditions diffèrent aussi, puisque le premier score porte sur les instances réelles et que le second mesure ce que fait le modèle une fois qu'on lui a remis le défaut. Mises côte à côte, ces deux valeurs donnent envie de conclure que le modèle comprend la clarification et rate la localisation. La lecture honnête est plus modeste. Quand on lui donne la lacune, le modèle rédige une action de clarification utile. Quand il doit la trouver seul, il échoue le plus souvent.

## Ce que vaut une lacune nommée

L'étude avec oracle du même article est le résultat auquel je reviens sans cesse, car elle chiffre le coût de l'étape que tout le monde saute.

> [!CONFIRMED]
> Fournir la résolution de référence fait passer le taux de spécifications prêtes à être codées en aval de 14 % à 98 % [s3], et pour tous les modèles évalués la localisation des défauts est le principal goulot d'étranglement, la clarification étant meilleure quand le défaut est fourni [s3].

> [!INFERRED]
> J'y lis que la boucle fonctionne en grande partie dès que la lacune porte un nom. Ce que ce résultat ne dit pas, c'est qui doit la nommer, et c'est justement la décision qu'une équipe prend.

C'est aussi là que je dois concéder un point aux partisans des consignes du type « demande si tu as un doute ». Dans cette étude, la résolution venait de l'extérieur du modèle. Or un humain qui répond à la question d'un agent apporte exactement ce genre de résolution. Répondre aux questions reste donc un travail utile, et rien dans ce texte ne le conteste.

Le problème se situe une étape plus tôt. Pour qu'on y réponde, une question doit d'abord exister.

## La même étape échoue sur des tâches de dépôt

Si le constat d'IdeaAMBIG tenait à une particularité des spécifications de recherche, un benchmark construit sur des issues de dépôts ne devrait pas le retrouver. Ambig-SWE est une variante sous-spécifiée de SWE-Bench Verified, et ses auteurs évaluent des modèles propriétaires et à poids ouverts sur trois étapes : détecter la sous-spécification, poser des questions de clarification ciblées et exploiter l'interaction [s4]. Les modèles peinent à distinguer les instructions bien spécifiées des instructions sous-spécifiées [s5]. Lorsqu'ils interagissent sur des entrées sous-spécifiées, ils obtiennent de l'utilisateur des informations essentielles, avec des gains de performance allant jusqu'à 74 % par rapport aux configurations non interactives [s5].

Ce dernier résultat forme la seconde partie de ma concession. L'interaction paie quand elle a lieu, sur une autre famille de tâches et avec une autre équipe aux commandes.

En rapprochant Ambig-SWE d'IdeaAMBIG, j'en déduis quelque chose, et je veux montrer sur quoi repose ce raisonnement. Les métriques diffèrent, les tâches aussi. Le résumé d'Ambig-SWE ne classe pas la détection par rapport aux deux autres étapes : je ne peux donc pas affirmer qu'il la juge la plus difficile. Les deux résultats vont en revanche dans le même sens. Dans les deux cas, les modèles remarquent mal que l'instruction qu'ils ont sous les yeux est incomplète, et dans les deux cas la situation s'améliore quand l'élément manquant arrive de l'extérieur.

## Où placer l'humain dans la boucle

Ma lecture de ces deux travaux est qu'une consigne « demande en cas de doute » dépend de l'étape de détection. L'agent ne pose une question que s'il remarque qu'il manque quelque chose, et c'est précisément là que les deux benchmarks montrent une faiblesse. Un agent silencieux ne prouve donc en rien que la spécification est complète.

Ce mécanisme produit un mode d'échec qui mérite un nom : la complétion silencieuse. L'agent va au bout d'une spécification dont il n'a jamais signalé la lacune, et rend un travail fondé sur une hypothèse que personne n'a vue. Les tests écrits à partir de la même spécification passent eux aussi, puisqu'ils héritent du même trou.

> [!WARNING]
> La complétion silencieuse ressemble à un succès. Aucune question n'a été posée, la tâche est terminée, et la décision manquante a été prise par défaut au cours de l'exécution. Relire le résultat ne la fait pas apparaître, sauf si vous savez déjà ce que la spécification laissait de côté.

La prescription découle de l'endroit où se trouve la faiblesse : ne pas attendre que l'agent prenne l'initiative. Soit on nomme ce que la spécification laisse de côté avant le lancement, soit on impose une passe de clarification quelle que soit l'assurance affichée par l'agent. Dans les deux cas, le déclencheur ne dépend plus de l'auto-évaluation de l'agent mais d'un geste que l'humain maîtrise. Je choisis la seconde option quand je connais trop mal le domaine pour dresser moi-même la liste des oublis : l'agent rédige alors la liste, et je n'ai plus qu'à la juger.

Voici l'étape préalable que je placerais en tête d'un fichier de tâche :

```text
Avant d'écrire la moindre ligne de code :
1. Liste chaque décision que cette spécification laisse ouverte (entrées, valeurs par défaut, cas d'erreur, périmètre).
2. Pour chacune, indique l'hypothèse que tu retiendrais.
3. Arrête-toi et renvoie la liste. Ne commence pas la tâche avant que chaque point soit confirmé ou tranché.
```

Ce prompt est le mien, et personne ne l'a mesuré. Il sert uniquement à rendre la passe de clarification systématique, au lieu de la suspendre à la confiance de l'agent. Il transforme aussi les choix implicites de l'agent en une liste que je peux discuter avant qu'une seule ligne de code existe.

Une réserve s'impose. Aucune des deux études ne montre que les humains repèrent mieux les lacunes que les modèles : la liste sert à forcer l'étape à chaque fois, et je ne prétends pas que j'y trouverais plus d'oublis que l'agent.

## L'objection du prochain modèle, et les limites

L'argument le plus solide contre ce texte tient en peu de mots. La détection pourrait tout simplement être une capacité qu'acquiert une génération de modèles ultérieure, et un conseil fondé sur les évaluations actuelles risque alors de vieillir vite. Dans ce cas, une passe de clarification imposée deviendrait un rituel.

J'y réponds avec IdeaAMBIG seul. Ce benchmark a évalué 13 LLM [s2]. Ses auteurs désignent malgré tout la localisation des défauts comme le principal goulot d'étranglement pour tous les modèles évalués [s3]. C'est un échantillon large pour un seul benchmark, et il ne dit toujours rien des modèles qu'aucun des deux benchmarks n'a testés.

Les limites méritent la même franchise. Les deux benchmarks n'utilisent pas les mêmes métriques. L'un s'appuie sur des spécifications de recherche, l'autre sur des issues de dépôts. Personne n'a comparé directement une passe qui nomme les lacunes à un agent laissé libre de demander. Le conseil a d'ailleurs un critère de réfutation net : une génération de modèles qui résorberait l'écart de localisation sur un benchmark de ce type l'affaiblirait, et j'abandonnerais alors la passe imposée.

Je suis parti de l'idée plus tranchée que laisser l'agent demander dépense l'attention humaine dans la partie de la boucle qu'il maîtrise déjà. Les données ne me permettent pas de la garder. Répondre à une question, c'est justement fournir la résolution, et l'étude avec oracle montre ce que vaut une résolution fournie.

L'essai précédent de ce blog sur l'abstention demandait si un agent s'arrête avant d'agir. Celui-ci demande quelle étape de la boucle d'ambiguïté échoue avant même qu'une question soit posée, et la réponse change l'endroit où je place mon propre effort : avant le lancement, sur l'étape que l'agent ne déclenche pas de manière fiable.

> [!NOTE]
> Considérez la liste préalable comme une hypothèse à éprouver sur vos propres spécifications.
