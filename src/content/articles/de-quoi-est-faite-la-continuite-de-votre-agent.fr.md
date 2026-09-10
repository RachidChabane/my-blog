---
translationKey: opaque-state-outscores-the-notes-you-can-read
lang: fr
slug: de-quoi-est-faite-la-continuite-de-votre-agent
title: De quoi est faite la continuité de votre agent
publishDate: 10-09-2026
tags:
- agents
- evaluation
category: essays
difficulty: 4
sources:
- label: ARC Prize, the two harnesses in one summary line
  url: https://arcprize.org/blog/astra
  date: 03-09-2026
- label: Sebastian Raschka, the system card on monitorability
  url: https://magazine.sebastianraschka.com/p/gpt-6-astra-looped-transformers-and
  date: 09-09-2026
- label: Artificial Analysis, the token-efficiency frontier
  url: https://artificialanalysis.ai/articles/benchmarking-gpt-6-astra
  date: 09-09-2026
contentHash: sha256:5179d35e5475b2e1
publishState: published
---


L'état que votre agent transporte d'un tour à l'autre relève de la décision d'achat, et ARC Prize vient de publier ce que coûte la version lisible de cet état. Un seul modèle, un seul benchmark, deux harnais du même évaluateur : 62,7 % pour 26 000 dollars quand le modèle rédige et reporte les notes qu'il choisit de garder, et 99,9 % pour 19 000 dollars quand un adaptateur fournisseur préserve entre les requêtes un état de raisonnement opaque et le compacte pour les conversations longues, de sorte que le modèle réutilise le travail déjà produit [s1]. Ce sont là les deux configurations mises en avant. Elles occupent des lignes différentes du balayage d'effort, si bien que les lire comme une comparaison toutes choses égales par ailleurs serait une faute, et l'écart qui les sépare est ce qu'il y a de moins intéressant dans cette page.

## Les six lignes qui éliminent les explications faciles

Le duo de chiffres mis en avant va circuler partout. C'est le tableau placé en dessous qui devrait modifier une décision, parce qu'il ferme les deux explications vers lesquelles on se tourne spontanément.

| Effort de raisonnement | Harnais Standard | Harnais Provider Adapter |
| --- | ---: | ---: |
| max | 62,7 % | 98,6 % |
| xhigh | 59,3 % | 98,4 % |
| high | 54,8 % | 99,9 % |
| medium | 38,6 % | 98,4 % |
| low | 17,5 % | 98,0 % |
| none | 35,2 % | 96,7 % |

Six réglages, douze cellules, un seul publieur, un seul modèle [s3]. Prenons la première échappatoire : le harnais à notes manquerait simplement de moyens, et davantage d'effort de raisonnement comblerait le retard. Or ce curseur déplace cette colonne sur une amplitude considérable, de 17,5 % à low jusqu'à 62,7 % à max, et il ne la déplace même pas dans l'ordre, puisque none obtient 35,2 % et passe devant low [s3]. Un curseur qui exerce autant d'autorité sur une colonne avec aussi peu de régularité n'est pas la variable à régler. Poussez-le à fond, les deux colonnes ne se rejoignent toujours pas [s3].

Vient ensuite la seconde échappatoire, celle que j'entends le plus souvent en revue : la configuration à notes perdrait parce qu'écrire des notes est ce que fait un modèle paresseux ou avare de mots au lieu de réfléchir. La source dit le contraire, et elle le dit dans le détail. Sous ce harnais, Astra choisit les notes de stratégie qu'il souhaite reporter, suit des objets, des coordonnées, des règles et des plans inachevés, et produit pour ces environnements une notation en langage dédié de son cru [s2]. Voilà une tentative sérieuse d'état lisible. C'est le genre de chose qu'un bon ingénieur construirait délibérément, et cela plafonne à 62,7 %.

La configuration perdante est donc la bavarde. À mon avis, c'est la signature d'un déficit de rétention ; un déficit de raisonnement échouerait autrement. Ce que fournit le canal privé, c'est la persistance d'un raisonnement déjà effectué, et réfléchir plus fort à l'intérieur d'un tour ne remplace pas la conservation du travail du tour précédent. Chaque cran du curseur achète davantage de réflexion. Aucun n'achète de la mémoire.

## Une deuxième pression, venue d'un autre côté

Je classerais tout cela au rayon des bizarreries de plomberie d'un évaluateur si l'inspectabilité n'était pas déjà sous tension ailleurs, pour des raisons étrangères à la conception des harnais. La fiche système d'Astra consigne des signes d'une monitorabilité réduite de ses traces de raisonnement et une légère régression par rapport à Sol, associée surtout à des traces plus courtes et moins informatives [s5]. Le directeur scientifique d'OpenAI, qui écrit à propos de cette même inquiétude, décrit la surveillance de la chaîne de pensée comme fragile et malheureusement orientée dans une direction négative, pour des raisons qui ne dépendent pas de changements d'architecture [s6].

Ces deux éléments attestent d'un phénomène voisin sans rien corroborer ici. Ils mesurent la part du raisonnement du modèle qui reste lisible, question distincte de celle du lieu où se tient la continuité d'un agent entre deux tours. Leur valeur tient au calendrier. Ils expliquent pourquoi cet arbitrage a sa place dans une revue de conception dès ce trimestre.

La même discipline vaut pour le troisième acteur. Artificial Analysis rapporte une baisse d'environ 45 points Elo sur GDPval-AA v2 face à GPT-5.6 Sol, et rapporte séparément 24 tours par tâche à l'effort max contre 45 pour Sol et 60 pour Claude Fable 5.1 et Claude Opus 5 [s9]. Deux chiffres, un même article, imprimés côte à côte. La source ne trace aucun lien entre eux, je n'en tracerai pas davantage, et l'argument que je construis n'en a nul besoin. Moins de tours qui feraient baisser le score, voilà une jolie histoire, et c'est exactement le genre de joliesse que l'on cite pendant un an sans que personne ne la vérifie.

> [!CONFIRMED]
> Sur les six réglages d'effort de raisonnement, le score le plus élevé du harnais Standard est 62,7 % et le score le plus bas du harnais Provider Adapter est 96,7 %, de sorte que les deux colonnes ne se recouvrent dans aucune des douze cellules mesurées [s3].

> [!INFERRED]
> La continuité devient ainsi, à mon avis, un critère d'achat et non une note de bas de page du classement. D'expérience, une capacité que seule la plomberie privée d'un fournisseur sait offrir cesse d'être un détail d'implémentation dès l'instant où elle apparaît dans le score.

## Le meilleur argument contre moi

Voici la version de l'objection que je trouve réellement difficile, et elle arrive avec ses propres mesures.

Le canal opaque gagne sa place sur de l'efficacité mesurée, et le qualifier de piège de dépendance qu'il faudrait avoir honte d'acheter passe à côté de ce que disent les chiffres. Un évaluateur indépendant, sur une autre suite, appuie précisément cette lecture. Tous les niveaux d'effort de raisonnement, de low à max, se situent sur la frontière de Pareto entre l'Intelligence Index et le nombre de tokens de sortie par tâche, et à l'effort max Astra consomme 27k tokens de sortie par tâche, environ le tiers des 78k que dépense Claude Fable 5.1 à max avec repli, pour le même score [s8]. Sur ARC-AGI-3, ce même modèle dépasse la référence humaine en efficacité d'action, avec moins d'actions que l'humain testé médian sur 96 % des niveaux [s4]. Si la concision fonctionne aussi bien pour aussi peu cher, exiger un état que l'on peut lire relève de la nostalgie déguisée en rigueur d'ingénieur.

Je concède l'efficacité, et cette concession fait tout le propos. La lisibilité achète des propriétés opérationnelles, le score brut ne figurant nulle part dans le lot. Elle achète la possibilité d'inspecter une trajectoire, de la rejouer depuis le tour où elle a cassé, et de la déplacer chez un autre fournisseur sans repayer le travail. Ce qui rend l'arbitrage inconfortable, c'est que ces propriétés opérationnelles et le score pointent désormais dans des directions opposées.

Cette démonstration a une limite, et elle est sérieuse. L'écart mesure peut-être une implémentation artisanale de prise de notes qui perd de l'information, et non un prix intrinsèque à l'état lisible. Rien de ce qui est publié ici n'oppose une mémoire lisible bien conçue à une mémoire tenue par le fournisseur. C'est l'expérience évidente à mener, personne ne l'a menée, et une équipe qui choisit aujourd'hui la portabilité paie donc une prime mesurée une seule fois, par un seul acteur, sur un seul benchmark.

Je tiens aussi à nommer l'argument auquel je renonce, car c'est le plus séduisant. Alignez le résultat des harnais, les traces raccourcies et le faible compte de tokens, et vous obtenez un récit unique : un modèle qui ferait moins de son travail à découvert. Ce récit ne survit pas au tableau. Le résultat ARC ne porte pas sur le volume émis, et le harnais à notes en administre la preuve : sous lui, le modèle émet énormément, à découvert, et perd quand même [s2]. Deux fils, tenus séparés, et l'arithmétique qui les joindrait reste à ne pas faire.

## Ce que cette comparaison tranche, et ce qu'elle ne tranche pas

Un publieur unique, un modèle unique, un benchmark unique, deux harnais, six réglages d'effort et le tableau complet imprimé : voilà la seule raison pour laquelle tout ceci se laisse lire. D'ordinaire, la configuration du harnais dépend du benchmark, GDPval-AA et AA-Briefcase faisant tourner un harnais Stirrup minimal et open source sur les différents LLM qu'ils comparent, tandis que le Coding Agent Index, distinct, prend les harnais d'agents de code pour objet d'étude à part entière [s7]. Sur cet arrière-plan, la campagne d'ARC Prize constitue une pièce à conviction d'une propreté rare.

## Ce que j'en ferais

Nommez la chose dont votre agent dépend entre deux tours. Posez-lui ensuite quatre questions : savez-vous la sérialiser, en comparer deux instances, en rejouer une, et la confier à un autre fournisseur. Si la réponse à la première est non, les trois autres sont déjà tranchées.

Cette première question se teste à peu de frais. Écrivez sur disque l'état transporté par votre agent à la fin de chaque tour, puis comparez deux tours consécutifs :

```
diff <(jq -S . state/turn-011.json) <(jq -S . state/turn-012.json)
```

Si cette commande produit une différence lisible, la continuité vous appartient. Si elle produit un identifiant opaque qui change à chaque tour, elle appartient au fournisseur, et vous louez ce dont votre agent est réellement fait.

Le mode de panne à surveiller mérite un nom : la faille de rejeu à jeton expiré. Une exécution casse au tour 40, vous réparez l'outil fautif, et vous voulez rentrer dans la trajectoire au tour 39. Le jeton a expiré, l'état qu'il désignait n'a jamais été à vous, et le seul chemin de retour vers le tour 39 consiste à repayer les tours 1 à 38. Je n'ai encore vu aucune API d'état côté fournisseur qui rende cela économique, et la facture tombe pendant l'incident, c'est-à-dire au pire moment pour la découvrir.

Rien de tout cela n'impose de choisir systématiquement l'option lisible. Je confierais volontiers au canal opaque toute charge courte, idempotente et bon marché à relancer de zéro : classification par lots, extraction en un tour, campagnes d'évaluation que je peux simplement relancer. Dans cette expérience, la configuration la moins chère était aussi la meilleure [s1], et prétendre le contraire pour gagner une discussion sur la portabilité serait malhonnête. Ce que je ne confierais pas, c'est tout traitement long dont je voudrais récupérer le travail partiel après une panne, tout ce que je suis contractuellement tenu d'expliquer, et tout ce que je pourrais avoir à déménager.

Reste cette clause sur une tendance qui ne dépend pas de changements d'architecture [s6]. J'y lis, à mon sens, l'inverse d'une porte de sortie : une équipe ne peut pas s'extraire par l'architecture de cette direction générale, elle peut seulement décider de ce qu'elle garde en main pendant le trajet. Cette décision se prend en ce moment même dans la plupart des piles d'agents, par défaut, par celui qui a choisi le SDK.
