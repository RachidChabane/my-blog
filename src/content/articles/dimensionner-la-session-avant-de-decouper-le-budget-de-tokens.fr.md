---
translationKey: agent-session-budget-inflection-point
lang: fr
slug: dimensionner-la-session-avant-de-decouper-le-budget-de-tokens
title: Dimensionner la session d'agent avant de découper le budget de tokens
publishDate: 15-09-2026
tags:
- agents
- evaluation
category: essays
difficulty: 3
sources:
- label: Elo-per-token study of agent test-time strategies, method
  url: https://arxiv.org/abs/2609.15309
  date: 14-09-2026
- label: General AgentBench test-time scaling study, setup
  url: https://arxiv.org/abs/2602.18998
  date: 22-02-2026
- label: Token consumption in agentic coding tasks, cost against accuracy
  url: https://arxiv.org/abs/2604.22750
  date: 24-04-2026
contentHash: sha256:884f97e08a28353b
publishState: published
---


Le plafond de tokens d'une session se règle : passé un point mesurable, un token de plus vaut moins qu'un nouvel échantillon, et le découpage exige un évaluateur bon marché. Dans une étude Elo-per-token, les agents peuvent au départ convertir les tokens en Elo plus vite que l'échantillonnage indépendant, puis leurs gains marginaux diminuent et finissent par passer sous cette référence [s2]. D'une exécution à l'autre sur une même tâche, une autre étude observe que la précision culmine souvent à un coût intermédiaire [s7]. Où placer le plafond relève d'une décision. Le diviser aussi.

## Ce qu'enregistre une courbe Elo-per-token

La méthode compte davantage que le chiffre mis en avant, et je pense que c'est elle qui rend un point de bascule mesurable. L'analyse Elo-per-token suit la meilleure solution trouvée à chaque budget de tokens et agrège, au moyen d'un modèle de Bradley-Terry, les classements établis au sein de chaque tâche en scores Elo comparables entre des tâches aux échelles de score différentes [s1]. Les auteurs l'appliquent à quatre agents généralistes sur quatre benchmarks ouverts, avec des sessions allant jusqu'à 100M tokens [s1].

Il s'agit de benchmarks d'optimisation ouverts. Rien dans le résumé n'indique qu'il s'agit de travail sur un dépôt de code, et je garde cette frontière en vue jusqu'au bout : un point de bascule mesuré sur une famille de tâches ne se transpose pas gratuitement à une autre.

L'étalon est ce que je trouve le plus utile. L'échantillonnage indépendant fournit une référence pour laquelle l'Elo croît linéairement avec le logarithme du calcul [s2]. Un agent qui continue à travailler dans sa session est donc comparé à l'option la plus simple : dépenser les mêmes tokens en tentatives neuves et sans lien entre elles. Tant que la session reste au-dessus de cette ligne, le contexte accumulé se rembourse. Quand elle tombe dessous, ce contexte devient un coût.

Ma lecture de la méthode ajoute un point que le résumé ne formule pas. Suivre la meilleure solution trouvée suppose de classer chaque candidat par rapport aux autres, et la référence d'échantillonnage hérite de la même hypothèse : un tas de tentatives indépendantes ne vaut que sa meilleure, à condition que quelque chose sache la désigner. La courbe de l'agent comme l'étalon supposent donc un moyen de noter un travail avant qu'il soit terminé. Gardez-le en tête. Tout ce qui suit en dépend.

## Un point de bascule mesuré, deux études compatibles

Une seule des trois sources mesure directement le croisement décrit en introduction, celui où les gains marginaux passent sous la référence d'échantillonnage [s2]. Voilà une mesure directe d'un point de bascule au sein d'une session.

Une étude sur la consommation de tokens dans les tâches de code agentique se place sur un autre plan : elle compare des exécutions entières entre elles. Deux exécutions d'une même tâche peuvent différer jusqu'à 30x en nombre total de tokens [s7], et consommer davantage ne se traduit pas par une meilleure précision, puisque la précision culmine souvent à un coût intermédiaire et plafonne aux coûts plus élevés [s7]. Cette forme s'accorde avec un point de bascule. Elle ne le mesure pas, car une courbe de coût établie d'une exécution à l'autre ne dit rien du rendement marginal à l'intérieur d'une session.

General AgentBench sert à étudier le passage à l'échelle au moment du test sous deux formes : séquentielle (interaction itérative) et parallèle (échantillonnage de plusieurs trajectoires) [s5]. Ses auteurs désignent un plafond de contexte comme la limite du passage à l'échelle séquentiel [s6]. C'est un mécanisme nommé, et le résumé ne fournit aucune courbe de budget.

| Étude | Ce qu'elle compare | Portée | Ce qu'elle dit d'un point de bascule |
| :--- | :--- | :--- | :--- |
| Elo-per-token [s1] | Meilleure solution à chaque budget de tokens face à une référence d'échantillonnage indépendant [s2] | Au sein d'une session | Les gains marginaux partent au-dessus de la référence puis passent sous elle [s2] |
| Consommation de tokens dans les tâches de code agentique [s7] | Tokens consommés et précision sur une même tâche [s7] | D'une exécution à l'autre | La précision culmine souvent à un coût intermédiaire [s7] |
| General AgentBench [s5] | Passage à l'échelle séquentiel et parallèle au moment du test [s5] | Aucune courbe de budget | Nomme un plafond de contexte comme limite du passage à l'échelle séquentiel [s6] |

La colonne Portée est mon propre classement des trois résumés. C'est elle qui me fait dire que les deuxième et troisième lignes sont compatibles avec la première, sans pour autant situer le point de bascule.

J'appelle « session qui déborde » l'échec que cela annonce : une exécution qui continue de dépenser au-delà du point où le lot de tokens suivant rapporte moins qu'une nouvelle exécution indépendante.

> [!WARNING]
> Une session qui déborde ressemble à de la persévérance. L'agent travaille encore, le plafond n'est pas atteint, et chaque nouveau lot de tokens rapporte moins de progrès qu'un nouveau départ. Un plafond généreux laisse cette session continuer sans que personne la voie.

## Découper le budget, et ce que le découpage suppose

Le découpage ne rapporte, à mon avis, que si l'on sait classer un travail inachevé. Les auteurs définissent le point d'inflexion du passage à l'échelle comme le budget par session où les gains marginaux d'Elo égalent la référence de l'échantillonnage indépendant [s4]. General AgentBench, issu d'une autre équipe, compare le passage à l'échelle séquentiel et parallèle [s5], et sa conclusion figure à côté du découpage dans la carte ci-dessous.

> [!CONFIRMED]
> En calant chaque session sur le point d'inflexion et en répartissant 100M tokens entre des sessions parallèles sur FrontierCS Polyomino Packing, les auteurs gagnent +264 Elo par rapport à une seule longue session et +355 par rapport à dix sessions courtes [s4]. Dans l'autre étude, aucune des deux méthodes de passage à l'échelle n'apporte d'amélioration réelle en pratique, et les auteurs désignent un déficit de vérification comme limite du passage à l'échelle parallèle [s6].

> [!INFERRED]
> Je lis le découpage comme une étape de sélection. Plusieurs sessions tournent, la meilleure compte, et cela ne fonctionne que si quelque chose sait classer à bas coût un travail inachevé. Le déficit de vérification est compatible avec cette limite, sans que rien ici ne le teste, et dix sessions courtes battues par des sessions bien dimensionnées me disent que la taille de session pèse autant que le découpage.

L'exigence d'un évaluateur découle du fonctionnement du découpage. Les deux études tournent sur des benchmarks différents, si bien que le déficit de vérification n'est qu'une explication possible du résultat parallèle parmi d'autres. Ce que je retiens de la carte est plus étroit. Découper, c'est parier qu'on saura désigner un gagnant, et l'étalon d'échantillonnage sur lequel on calibre le découpage fait le même pari.

## Ce que je ferais d'un plafond de tokens

Ma position : la taille de session passe avant le découpage. Trouvez le point de bascule de votre tâche, fixez-y le plafond par session, et demandez-vous seulement alors si diviser le budget rapporte. L'ordre compte, car les dix sessions courtes de cette expérience ont perdu face aux sessions bien dimensionnées [s4] ; couper un budget en morceaux trop petits est une autre façon de le gaspiller.

Le découpage exige un évaluateur bon marché pour le travail intermédiaire : une suite de tests, une fonction objectif ou un vérificateur qui renvoie un nombre. Une fois cet outil en place, la journalisation rend le point de bascule visible sur votre propre tâche. Voici la boucle que je ferais tourner :

```text
pour chaque exécution de la tâche :
    noter chaque candidat soumis par l'agent avec votre évaluateur
    journaliser (tokens_dépensés, meilleur_score_atteint)
comparer le gain par token supplémentaire à ce qu'une exécution indépendante gagne pour les mêmes tokens
plafonner chaque session là où la nouvelle exécution commence à gagner davantage
découper le budget restant en sessions de cette taille seulement si l'évaluateur est bon marché
```

Cette boucle de journalisation relève de ma pratique et ne vient d'aucune des études citées. Elle sert à trouver le point de bascule sur votre tâche, pour ne pas emprunter un chiffre à un benchmark d'empaquetage.

La ligne de comparaison est l'étape que les équipes sautent, et elle coûte peu. Lancez quelques tentatives indépendantes à petit budget sur la même tâche, gardez le meilleur score de chaque groupe, et tracez-le en fonction des tokens consommés à côté de la longue session. Celle-ci ne justifie son contexte supplémentaire que tant qu'elle reste au-dessus de cette ligne.

Sans évaluateur, je m'attends à ce qu'un découpage ne rapporte pas davantage qu'une seule longue session, puisque rien ne désigne le gagnant. Plusieurs sessions impossibles à classer vous laissent plusieurs transcriptions et aucune raison d'en préférer une.

Ce que j'ignorerais, c'est le gain d'Elo mis en avant, transposé à une tâche sans vérificateur. Le découpage a gardé la meilleure de plusieurs sessions, ce que je lis comme une étape de classement, et une tâche sans vérificateur ne donne rien avec quoi classer.

## L'objection la plus solide, et où je m'arrête

L'argument le plus fort contre moi tient en trois points, tous recevables. Le découpage repose sur une seule tâche d'empaquetage, venue d'une seule équipe. Rien dans les résumés ne dit que le déficit de vérification a été mesuré sur les agents ou le type de tâche du découpage, et un vérificateur plus solide pourrait le réduire. Et un découpage pourrait rapporter sans aucun évaluateur, par vote majoritaire ou par auto-cohérence, ce qui invaliderait ma condition préalable.

Ma réponse consiste à limiter la portée de l'affirmation. Le point de bascule au sein d'une session repose sur une mesure directe [s2], avec deux études compatibles avec lui [s6] [s7] ; le découpage repose sur une seule tâche [s4]. C'est pour cela que la règle est conditionnelle. Si quelqu'un montre un découpage qui rapporte par vote majoritaire sans évaluateur, sur une tâche comparable, la règle tombe et j'abandonne la condition de l'évaluateur.

Les auteurs comparent aussi les agents à des concurrents humains : les meilleurs concurrents humains de l'histoire progressent de façon superlinéaire au fil du temps de concours sur des tâches communes de l'AtCoder Heuristic Contest, ce que les auteurs présentent comme la preuve d'une marge de progression importante une fois que les agents ralentissent [s3]. Je lis ce ralentissement comme propre aux agents mesurés : le point de bascule bougera à mesure que les agents changent, raison de plus pour le mesurer tâche par tâche et ne jamais le coder en dur.

J'ai d'abord lu l'étude sur la consommation de tokens et General AgentBench comme une confirmation du point de bascule, et je les ai depuis cantonnées à un rôle plus modeste.

Ce blog a déjà comparé des stratégies à budget fixe : l'orchestration multi-agents à tokens de réflexion égaux, puis une boucle de réparation face au rééchantillonnage à nombre de tentatives fixe. Ce texte pose une autre question : à quel endroit d'une session le budget cesse de rapporter plus qu'un nouvel échantillon, et ce qui doit exister avant que le diviser serve à quelque chose.

> [!NOTE]
> Les preuves tiennent en trois résumés, dont un seul mesure le point de bascule. Prenez la boucle de journalisation ci-dessus comme un moyen de trouver votre propre point de bascule plutôt qu'un chiffre à recopier.
