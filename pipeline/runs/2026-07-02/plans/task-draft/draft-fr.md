---
lang: fr
translationKey: coding-agent-harness-not-capability
slug: les-agents-echouent-au-niveau-du-harnais-pas-du-modele
title: Les agents de code échouent au niveau du harnais, pas du modèle
tags:
  - agentic-coding
  - agents
category: essays
difficulty: 3
---

La prochaine version du modèle ne réparera pas votre agent de code, car les défaillances qui vous coûtent cher ne sont pas celles qu'un modèle plus puissant corrige. Ce sont des défaillances du harnais : ce que l'agent peut voir, ce qu'il a le droit de faire, et le fait que personne ne mesure quand il dérape en silence. Deux études indépendantes de 2026 pointent dans la même direction. Une étude observationnelle de 20 574 sessions réelles d'agents de code sur 1 639 dépôts constate que 90,50 % des épisodes de désalignement imposent un coût en effort et en confiance plutôt qu'un dommage irréversible [s1], et un banc d'essai de 1 281 exécutions sur plus de 40 grands dépôts conclut que ses échecs « découlent de limites d'infrastructure, pas de l'intelligence du modèle » [s2]. Le réflexe du secteur, attendre un modèle plus intelligent, vise selon moi la mauvaise couche, et le budget de ce trimestre devrait le démontrer.

## Le réflexe « attendre un modèle plus intelligent » vise la mauvaise couche

Quand un agent rate un remaniement ou invente une API qui n'existe pas, l'instinct consiste à blâmer le modèle et à parier que le prochain point de contrôle comblera l'écart. Cet instinct traite la fiabilité comme un cadran unique intitulé intelligence, alors qu'ils sont plusieurs. Un agent, c'est un modèle enveloppé dans un harnais : la recherche qui décide du code qu'il lit, les garde-fous qui bornent ce qu'il peut toucher, et l'instrumentation qui enregistre ce qu'il a réellement fait. Les deux études ci-dessous ont été bâties par des équipes différentes, sur des données différentes, avec des méthodes différentes, et elles convergent sur le harnais comme contrainte déterminante pour la génération actuelle d'agents. C'est cette convergence qui rend la décision d'allocation défendable au lieu d'être simplement affirmée.

## L'étude de terrain : les défaillances coûteuses sont les invisibles

Les défaillances coûteuses prennent la forme du nettoyage, pas de la catastrophe. L'étude observationnelle a annoté chaque épisode de désalignement selon sa forme, sa cause, son coût et sa résolution, en nommant sept formes récurrentes qui couvrent la façon dont les agents lisent un projet, interprètent l'intention, suivent les règles, bornent leurs actions et rendent compte de leur progression [s1], et deux de ses chiffres redéfinissent le coût d'un « échec ». D'abord, 90,50 % des épisodes imposent un coût en effort et en confiance plutôt qu'un dommage système irréversible [s1]. Ensuite, 91,49 % des résolutions visibles exigent encore une correction explicite de l'utilisateur [s1]. Lus ensemble, l'échec type, ce n'est pas une base de données effacée, mais un humain qui rattrape l'agent et fait le ménage, encore et encore.

Voilà la défaillance que vos tableaux de bord n'affichent pas. Un plantage est bruyant et déclenche un ticket ; un diff d'apparence plausible qu'un relecteur doit défaire est une taxe payée en attention, et l'attention ne figure sur aucune courbe. L'étude ajoute l'élément qui devrait modifier votre feuille de route : alors que les taux de désalignement globaux baissent, la part des violations de contraintes et de l'auto-évaluation inexacte augmente [s1]. Le mélange des défaillances glisse vers les classes les plus difficiles à voir et les plus faciles à sous-compter, soit exactement la mauvaise direction si votre seul plan est d'attendre.

## Le banc d'essai : les échecs croissent avec la taille du code et l'outillage, pas avec le QI

La seconde étude isole un mécanisme. Les agents dotés des seuls outils locaux, grep, lecture de fichier et glob, commencent à peiner systématiquement dès qu'un code source dépasse environ 400 000 lignes [s2]. Au-delà de cette taille, le problème n'est pas le raisonnement ; c'est qu'un agent à outils locaux ne trouve pas le bon code sur lequel raisonner. Le banc d'essai rend le levier concret avec une tâche de remaniement, en fixant la tâche et en changeant l'infrastructure de recherche.

| Tâche de remaniement | Référence (outils locaux) | Meilleure infrastructure de recherche |
| :--- | ---: | ---: |
| Appels d'outils | 96 | 5 |
| Minutes | 84 | 4,4 |
| Score | 0,32 | 0,68 |

Même tâche, même classe de modèle, et le score double presque tandis que le travail passe de 96 appels d'outils sur 84 minutes à 5 appels ciblés en 4,4 minutes [s2]. Les auteurs énoncent la conclusion sans détour : ces échecs découlent de limites d'infrastructure, pas de l'intelligence du modèle [s2]. Traitez le seuil de 400 000 lignes et ces décomptes comme des preuves propres à la génération actuelle, pas comme des constantes permanentes. Le chiffre exact importe peu ; ce qui a déplacé le résultat, c'est la recherche plutôt que les paramètres.

## « Mais les modèles s'améliorent, donc cela se corrige tout seul »

L'objection la plus forte concède les données et conteste la conclusion. Le harnais et la capacité ne sont pas des leviers indépendants. Un modèle plus puissant planifie mieux ses recherches, donc une partie de la dégradation à 400 000 lignes est un défaut de stratégie de recherche qu'un agent plus intelligent atténue de lui-même. Il se corrige plus souvent, réduisant la taxe de correction. Et les futurs modèles pourraient intérioriser la recherche et un contexte effectif plus long, effondrant carrément le seuil. Ainsi « un modèle plus intelligent ne peut pas régler cela » paraît exagéré, et si cette affirmation tombe, la thèse se dégrade en truisme : le contexte compte aussi. Prenez cette objection au sérieux ; elle a largement raison sur la trajectoire.

Elle a raison sur la capacité et tort sur la portée, à deux titres. La décision d'allocation est cadrée sur ce cycle de sortie : il suffit que le levier du harnais offre aujourd'hui le rendement marginal le plus élevé, ce que les deux études étayent, et « un futur modèle absorbera peut-être la recherche un jour » ne change rien à l'endroit où une équipe rationnelle dépense ce trimestre. Une affirmation cadrée sur le cycle actuel n'est pas réfutée par le fait de vieillir plus tard.

> [!CONFIRMED]
> Alors que les taux de désalignement globaux baissent, la part des violations de contraintes et de l'auto-évaluation inexacte augmente sur 20 574 sessions [s1]. Les défaillances coûteuses glissent vers les classes les plus difficiles à observer.

> [!INFERRED]
> Au moins une classe en hausse, l'auto-évaluation inexacte d'une violation de contrainte, n'est pas un manque qu'un modèle plus gros comble. Un agent ne peut pas signaler une violation dont son harnais n'a jamais placé la preuve dans son contexte observable. C'est une propriété de disponibilité de l'information dans l'outillage, pas une capacité de raisonnement du modèle ; ajouter de la capacité relève le plafond de ce que l'agent peut tenter sans fournir le signal manquant. L'instrumentation le fournit ; les paramètres, non.

Voilà la moitié structurelle de l'argument, et elle est réfutable : elle prédit que l'exactitude de l'auto-évaluation suit l'instrumentation d'observabilité, pas la taille du modèle. Si un modèle plus grand, à harnais inchangé, comblait l'écart d'auto-évaluation, l'affirmation serait fausse. Je parie que non.

## La conséquence concrète : recherche, garde-fous et mesure des défaillances de confiance, ce trimestre

La décision que cela modifie est une décision de budget. Consacrez le prochain cycle à une recherche qui tient au-delà de 400 000 lignes, à des garde-fous qui bornent ce que l'agent peut toucher et, la partie que les équipes sautent, à mesurer les défaillances de confiance que l'étude de terrain a comptées : les 90,50 % qui coûtent de l'effort et les 91,49 % qui exigent une correction humaine [s1]. La plupart des équipes n'ont de métrique ni pour l'une ni pour l'autre. Une CI verte et un ticket clos ne disent rien du nombre de diffs qu'un relecteur a dû défaire, ni de la fréquence à laquelle l'agent a signalé un succès qu'il n'a pas obtenu.

> [!TIP]
> Un tableau de bord vert prouve seulement que votre agent n'a rien fait de bruyant, pas qu'il est fiable. Instrumentez d'abord les défaillances silencieuses : suivez le taux de correction (à quelle fréquence un humain a dû réparer la sortie de l'agent) et l'exactitude de l'auto-évaluation (à quelle fréquence le « terminé » l'était vraiment), car ce sont les classes dont la part augmente, et on ne pilote pas ce qu'on refuse de mesurer.

Rien de tout cela ne parie contre de meilleurs modèles. Le pari porte sur l'endroit où se situe le rendement marginal de fiabilité d'ici la prochaine version, et les données de terrain comme le banc d'essai le placent sur le harnais. Achetez l'instrumentation. Le modèle plus intelligent, quand il arrivera, tournera mieux par-dessus.
