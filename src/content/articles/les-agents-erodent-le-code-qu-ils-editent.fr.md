---
translationKey: slopcodebench-iterative-maintainability
lang: fr
slug: les-agents-erodent-le-code-qu-ils-editent
title: Les agents érodent le code qu'ils continuent d'éditer
publishDate: 16-06-2026
tags:
- agents
- evaluation
- agentic-coding
category: essays
difficulty: 3
sources:
- label: 'SlopCodeBench: Benchmarking How Coding Agents Degrade Over Long-Horizon
    Iterative Tasks (arXiv 2603.24755)'
  url: https://arxiv.org/abs/2603.24755
  date: 25-03-2026
- label: GitClear, AI Copilot Code Quality 2025 Research
  url: https://www.gitclear.com/ai_assistant_code_quality_2025_research
  date: 16-06-2026
contentHash: sha256:a53b9607cb2dd363
publishState: published
---


Le pass@1 en un coup et la maintenabilité itérative ne mesurent pas la même chose, et sur l'axe qui reflète le vrai travail logiciel, les meilleurs agents de code d'aujourd'hui sont faibles et se dégradent sur leur propre code. Le meilleur ne passe que 14,8 % des points de contrôle d'un banc d'essai où l'agent prolonge ses propres solutions [s1], et cet échec reste invisible au classement auquel la plupart des équipes se fient.

## Le mirage du coup unique

Les agents de code se vendent sur un seul chiffre : le pass@1 sur une tâche isolée, un problème en entrée, un correctif en sortie. Ce chiffre répond à une question étroite, à savoir si l'agent sait produire un correctif qui passe face à une tâche neuve, et il y répond assez bien pour que les scores de tête saturent désormais le haut du tableau. Or le travail que ces scores servent à justifier est d'une autre nature. On ne confie pas un ticket scellé à un agent pour ensuite l'oublier : on le laisse prolonger du code qu'il a déjà écrit, puis prolonger encore, et la décision qui compte vraiment porte sur l'autonomie qu'on lui accorde sur une base de code vivante. Un classement bâti sur des tickets scellés mesure le cas facile et reste muet sur celui qui tranche la question.

Tout l'argumentaire du code agentique repose sur un travail soutenu, en plusieurs étapes : prendre un objectif, le planifier, écrire le code, puis continuer d'éditer jusqu'à l'atteindre. Chaque étape après la première vient se poser sur la sortie antérieure de l'agent. Si la qualité bouge à mesure que l'agent itère sur son propre code, une mesure qui ne voit jamais que la première étape évalue la mauvaise chose pour la décision qu'on lui fait porter.

## Ce que mesure SlopCodeBench

SlopCodeBench est conçu pour rompre ce silence. Il enchaîne 36 problèmes sur 196 points de contrôle où les agents prolongent à répétition leurs propres solutions ; le banc évalue donc la boucle que les équipes exécutent réellement, et non un instantané en un coup [s1]. Sur 15 agents de code, modèles ouverts et fermés confondus, le résultat est sans détour : aucun agent ne résout entièrement un problème de bout en bout, et le meilleur ne passe que 14,8 % des points de contrôle [s1]. Mis en regard des gros titres pass@1 quasi saturés, l'écart est tout l'enjeu. Les mêmes modèles qui paraissent aboutis sur des tâches isolées s'effondrent dès qu'il s'agit de continuer à bâtir sur ce qu'ils viennent de livrer.

Le choix de conception qui produit ce résultat, c'est la boucle de points de contrôle. Plutôt que de noter un correctif face à une tâche figée, le banc redonne à l'agent sa propre solution précédente et lui demande d'aller plus loin, point de contrôle après point de contrôle. C'est le modèle le plus dépouillé possible du développement réel, et il suffit à séparer les agents qui savent amorcer un problème de ceux qui savent le tenir dans la durée.

## Le mode de défaillance qui s'aggrave

La défaillance n'est pas une mauvaise réponse à un problème difficile : c'est une lente pourriture. SlopCodeBench suit deux formes de dégradation à mesure que l'agent travaille : l'érosion structurelle, où la complexité se concentre en quelques points surchargés, et la verbosité, où le code redondant s'accumule. Les deux grimpent au fil des points de contrôle : l'érosion structurelle monte dans 77 % des trajectoires et la verbosité dans 75,5 % [s1]. Plus l'agent édite sa propre sortie, plus la forme de cette sortie se dégrade.

Cette tendance signifie que la dixième auto-édition coûte plus cher à relire que la première, pas moins, et c'est un dommage facile à manquer. Chaque diff pris isolément peut sembler raisonnable. La pourriture, c'est le fichier qui se voit greffer une branche de plus au lieu d'un refactoring, la fonction utilitaire copiée au lieu d'être mutualisée. C'est précisément la tendance qu'un correctif unique ne peut jamais révéler.

## Les agents face aux dépôts humains

Une courbe de dégradation ne prouve pas grand-chose à elle seule, car tout code se dégrade ; l'entropie n'est pas un problème propre aux agents. Le contrôle qui fait passer de l'impression à la preuve, c'est la référence humaine. Comparé à 473 dépôts Python open source, le code des agents est 2,3x plus verbeux et 2,0x plus érodé, et les dépôts humains se dégradent moins souvent et par marges plus faibles au fil de leur historique git [s1].

Cette comparaison écarte l'hypothèse nulle du « tout code pourrit » : des humains qui éditent de vrais projets sur de vrais historiques pourrissent plus lentement et moins profondément que des agents qui éditent leur propre sortie ; l'érosion mesurée par SlopCodeBench n'est donc pas une propriété du logiciel en général, mais de la manière dont ces agents construisent. C'est l'écart entre la dégradation des agents et celle des humains qu'une décision d'autonomie doit intégrer.

## Le contre-argument, et sa réponse

Voici l'objection la plus solide, et elle est légitime. Le pass@1 sur des tâches isolées n'est pas un tour de passe-passe : quantité de travail réel est bel et bien en un coup. Un ticket de bug, une petite fonctionnalité, un refactoring autonome confié à un agent puis relu par un humain, voilà une tâche à correctif unique, et un banc qui note des correctifs uniques en est un proxy honnête. Sous cet angle, les classements en un coup ne trompent personne : ils mesurent un usage réel et fréquent, et le banc itératif n'est qu'un test plus dur et plus étroit que la plupart des tâches de production n'atteignent jamais.

Le mode de défaillance itératif est invisible à une évaluation en un coup par construction, parce que l'érosion et la verbosité n'apparaissent qu'une fois que l'agent édite sa propre sortie antérieure, ce qu'un protocole pass@1 ne lui demande jamais. La qualité qui se dégrade en cascade est justement celle qu'un correctif unique ne peut pas exhiber. Un pass@1 propre ne borne donc pas le risque itératif : il n'en dit rien. C'est pourquoi les deux mesures ne peuvent se substituer l'une à l'autre : un score élevé en un coup vous dit que l'agent sait livrer un bon correctif, et rien sur ce que sa dixième édition fait au code alentour. Pour le ticket isolé, le pass@1 suffit. Pour l'autonomie durable, c'est le mauvais instrument braqué sur le mauvais axe.

## Une corroboration indépendante et observationnelle

Une seconde jambe, plus faible, pointe dans le même sens. L'analyse par GitClear d'historiques git réels constate que la part des lignes modifiées relevant du refactoring est tombée de 25 % en 2021 à moins de 10 % en 2024, tandis que les lignes clonées (copiées-collées) passaient de 8,3 % à 12,3 % [s2]. Moins de restructuration, plus de duplication : la dérive même que SlopCodeBench produit en conditions contrôlées, désormais visible dans des dépôts de production sur la fenêtre où les assistants IA se sont généralisés.

Je tiens ce signal pour cohérent avec la thèse, non pour sa preuve. Il est observationnel et ne peut isoler la paternité des agents ; les mêmes années portent des gels d'embauche, une pression sur la vélocité et des recompositions d'équipes, autant de facteurs qui entament à eux seuls la discipline de refactoring. C'est la comparaison contrôlée et adossée à la référence humaine de SlopCodeBench qui porte le poids causal. GitClear corrobore que le résultat de laboratoire n'est pas un artefact de banc d'essai.

> [!CONFIRMED]
> Face à 473 dépôts Python humains, le code des agents est 2,0x plus érodé et 2,3x plus verbeux, et les dépôts humains se dégradent moins souvent et par marges plus faibles [s1].

> [!INFERRED]
> D'après mon expérience, c'est cet écart qui compte pour l'autonomie : le risque n'est pas un mauvais premier correctif, que la relecture intercepte, mais une lente dérive structurelle au fil des éditions de l'agent, qu'aucun diff isolé ne paraît assez grave pour arrêter.

## Un verdict calibré

La conclusion bornée est plus étroite que ne le laisse croire le classement, et plus tranchante que « les agents sont mauvais ». Un agent incapable de livrer un bon correctif est disqualifié ; celui qui en est capable n'a franchi que la barre facile, pas celle qui décide de l'autonomie. La porte qui manque, c'est la maintenabilité mesurée sur de nombreuses auto-éditions successives, l'axe que SlopCodeBench note et que le pass@1 ne voit pas.

> [!WARNING]
> N'accordez pas à un agent une autonomie durable sur une base de code au seul vu d'un chiffre pass@1. Ce chiffre est muet sur le mode de défaillance qui décide de l'issue.

Concrètement, que surveiller quand vous confiez à un agent une tâche à long horizon : suivez la tendance au fil de ses propres éditions, pas la qualité du premier correctif. La complexité se concentre-t-elle dans quelques fichiers qu'il rouvre sans cesse ? Colle-t-il des variantes au lieu de refactorer le chemin commun ? Ce sont les premiers contours des courbes à 77 % et 75,5 % [s1], et ils se manifestent à la dixième édition, pas à la première. Verrouillez là-dessus, et le pass@1 redevient ce qu'il a toujours été : un signal réel mais partiel, pas un permis d'autonomie.
