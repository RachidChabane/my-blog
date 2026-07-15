---
translationKey: harness-over-model-has-no-global-ordering
lang: fr
slug: pas-de-meilleur-agent-de-code-seulement-un-meilleur-pour-cette-charge
title: Le harnais bat le modèle de 4,6 points de presque rien
publishDate: 15-07-2026
tags:
- agents
- evaluation
- agentic-coding
category: essays
difficulty: 3
sources:
- label: 'Cui et al., PERFOPT-Bench: Evaluating Coding Agents on Software Performance
    Optimization'
  url: https://arxiv.org/abs/2607.07744
  date: 08-07-2026
- label: Braintrust, Using Braintrust to eval agentic setups from large-scale Hugging
    Face data
  url: https://www.braintrust.dev/blog/hf-agent-traces
  date: 24-06-2026
- label: 'Gorinova et al., Position: Coding Benchmarks Are Misaligned with Agentic
    Software Engineering'
  url: https://arxiv.org/abs/2606.17799
  date: 16-06-2026
contentHash: sha256:d840a370e4b3ce20
publishState: published
---


L'analyse que tout le monde cite pour prouver que le harnais l'emporte sur le modèle attribue au harnais environ 5,3 % de la variation du succès et au modèle 0,7 % [s2] : un classement qui n'écrase rien du tout. Tout le débat harnais contre modèle se joue donc sur près de 6 % du résultat. J'ai moi-même défendu le camp du harnais, et je considère aujourd'hui que les deux résultats invoqués ensemble sont incompatibles avec la conclusion qu'on leur fait porter.

## Le chiffre qui a couronné le harnais le rétrograde aussi

En analysant des traces d'agents issues de Hugging Face à grande échelle, Braintrust rapporte que le harnais explique environ 5,3 % de la variation du succès contre environ 0,7 % pour le modèle, sur 1 781 essais et 49 000 spans enfants [s2]. Citez ce résultat sous forme de rapport et vous obtenez le slogan : le harnais pèse plus de sept fois le modèle, cessez donc de vous tourmenter sur le choix du modèle et allez réparer votre échafaudage. Lisez plutôt la même décomposition de gauche à droite, et elle dit ce que le slogan étouffe. Ces deux chiffres totalisent environ 6, ce qui laisse à peu près 94 % de la variation du succès inexpliqués par l'un comme par l'autre.

Voilà la phrase sur laquelle il faut s'arrêter, puisque c'est précisément celle que le rapport dissimule. Le milieu a pris une décomposition dont les deux termes sont petits, en a gardé la comparaison et en a jeté les ordres de grandeur. Personne, en disant « le harnais compte plus que le modèle », ne prétend que le harnais explique l'essentiel de ce qui se passe : on affirme seulement qu'il devance l'autre candidat de la liste. Or c'est la liste qui pose problème. Elle compte deux entrées, ce sont les deux seules à disposer d'un classement public, et à elles deux elles pèsent un seizième du résultat.

Que trouve-t-on dans les 94 % restants ? Je l'ignore, et personne ne le sait davantage : c'est exactement mon propos. Mes candidats, à titre d'hypothèse et non de constat : la manière dont le travail est découpé avant qu'un agent n'en voie la moindre ligne, la qualité du prompt et du contexte qui l'accompagne, l'outillage et les tests autour du dépôt, les données, et surtout la distribution de difficulté des tâches elles-mêmes. Rien de tout cela ne dispose d'un classement. Tout cela est pourtant, à mon sens, l'endroit où se joue réellement le résultat.

## Aucun ordre global à divulguer

PERFOPT-Bench a soumis 7 piles d'agents, bâties sur des LLM et des frameworks différents, à 7 tâches d'optimisation à long horizon. Verdict : la performance dépend de la charge de travail plutôt que de la seule identité du modèle ; aucune pile ne domine, et changer de framework peut modifier sensiblement le profil d'accélération par tâche d'un même LLM [s1].

Le résultat est plus fort, et plus étrange, que celui auquel il ressemble. Le constat familier veut que le choix du harnais fasse beaucoup bouger le score : c'est un énoncé de variance. On fige le modèle, on permute l'échafaudage, on regarde le chiffre sauter. Cette critique appelle un remède évident, que j'ai moi-même réclamé : publiez votre harnais, car sans lui le score n'identifie rien. PERFOPT-Bench ne parle pas de variance. Il parle de réordonnancement. Le classement des piles change avec la charge, si bien qu'aucun ordre stable ne subsiste sous le bruit. La divulgation n'y peut rien. Elle corrige un harnais non divulgué ; elle n'a rien à dire d'un classement de harnais qui n'existe pas pour être divulgué.

Gorinova et ses coauteurs ferment la dernière issue. Un agent de code, en pratique, n'est pas un modèle mais un composite de modèles, de harnais, de contextes, d'environnements et de signaux de retour, dont chaque élément peut déplacer le score de marges comparables à celles qui séparent deux générations successives de modèles ; et leur troisième symptôme tient à l'absence de signal au niveau des composants individuels du harnais, qui rend le score de bout en bout difficile à itérer [s3]. On ne peut donc pas acheter le meilleur harnais, ni y parvenir par itération, puisque le score contre lequel on itérerait ne se décompose pas. Le cadre de l'achat n'a plus de repli.

> [!CONFIRMED]
> PERFOPT-Bench a évalué 7 piles d'agents sur 7 tâches d'optimisation à long horizon et conclut qu'aucune pile ne domine : à LLM figé, permuter le framework peut modifier sensiblement le profil d'accélération par tâche de ce même modèle [s1].

> [!INFERRED]
> J'y vois un coup fatal porté au cadre de l'achat, et non une réserve à son sujet. Ce que cela implique concrètement : une pile qui domine le banc d'essai d'un autre ne vous apprend rien d'actionnable, et la convention de publication que je réclamais naguère n'y aurait rien changé.

## J'ai défendu la thèse inverse

J'ai écrit que le rendement marginal de fiabilité se logeait dans le harnais et que l'instrumentation valait l'investissement. Je me suis trompé sur ce que les données autorisaient, et je préfère nommer l'erreur plutôt que la reformuler discrètement avec des verbes plus doux. Ma faute a été de confondre un classement avec un mandat. La décomposition qui a fait du harnais le terme le plus gros est celle-là même qui rend les deux termes minuscules, et le banc d'essai qui a rendu le harnais décisif est celui qui montre que son classement bascule d'une charge à l'autre. C'est en prenant ma propre position au mot qu'on la brise.

## Le meilleur argument contre cette thèse

La meilleure objection retourne ma propre citation contre mon antécédent, et elle comporte deux volets qui méritent tout leur poids.

D'abord : l'argument exige que le harnais domine, or 5,3 % contre 0,7 % ne relève pas de la domination. C'est un terme quasi négligeable valant un peu plus de sept fois un autre terme quasi négligeable, avec près de 94 % que ni l'un ni l'autre n'explique. Le gain d'un routage est borné par la taille du terme sur lequel on route ; bâtir une infrastructure d'évaluation par charge pour capter une fraction de 5,3 % n'est donc pas une conclusion inconfortable mais juste. C'est une erreur de catégorie : optimiser le terme de troisième ordre parce qu'il se trouve être celui que quelqu'un a mesuré.

Ensuite : ôtez les chiffres et le raisonnement devient générique. « Aucune option ne domine partout, donc la sélection dépend de la charge, donc il faut mesurer, donc router seulement là où le volume le justifie » vaut tout autant pour les compilateurs, les bases de données, les ORM et les régions cloud. C'est le théorème du no-free-lunch affublé d'un nom neuf, et une thèse impossible à distinguer du lieu commun n'est que le lieu commun muni d'une citation.

Le premier volet porte, et l'admettre est tout l'enjeu. Toute version de ce texte qui s'achèverait sur « bâtissez donc une infrastructure de routage » se trouve réfutée par sa propre source ; je n'écrirai donc pas cette version. Le routage était bien la destination de cet argument, et il meurt sur le chiffre qui a tué l'achat. Reste que le routage n'a jamais été la revendication porteuse. Si 5,3 % est trop peu pour router, c'est exactement trop peu pour standardiser. « Achetez le bon harnais » meurt avec « routez vers le bon harnais », et la conclusion d'achat que l'on tire se révèle infondée dans les deux cas. L'objection ne réfute pas ma thèse : elle l'énonce, par la voix de quelqu'un qui croit me contredire.

Le second volet, en revanche, ne porte pas, pour une raison de structure. Le no-free-lunch dit que le meilleur outil varie, donc mesurez, et il laisse le cadre de l'achat debout avec un astérisque collé dessus. Ma revendication diffère par nature : deux résultats cités l'un après l'autre, comme appuis complémentaires d'une même consigne, sont conjointement incompatibles avec elle. Élever le terme du harnais et découvrir que ce terme n'a aucun ordre global ne sont pas deux réserves que l'on empile. La première est ce qui rend la seconde fatale. Si le modèle s'était révélé le gros terme, des classements de harnais dépendant de la charge ne seraient qu'une note de bas de page. La doxa a fabriqué sa propre ruine en promouvant le seul bouton dépourvu de classement stable. D'ailleurs, contrairement au « ça dépend de votre cas », qui n'admet aucune réfutation, celle-ci en admet une : montrez-moi que les classements de harnais restent stables d'une classe de charge à l'autre, et l'argument tombe.

## Ce que cela autorise réellement

Moins que vous ne l'espériez. Choisissez une valeur par défaut défendable, et arrêtez-vous là. Ne routez que là où une charge est à la fois volumineuse et mesurable de façon indépendante, ce qui concerne une petite minorité d'équipes, probablement pas la vôtre ; ce resserrement n'est pas une échappatoire mais la seule chose que des effets de cette taille autorisent, et c'est en le concédant que l'argument se distingue de la banalité. Consacrez ensuite aux 94 % que personne ne mesure l'attention que vous réserviez au choix de la pile.

Une mesure vaut la peine d'être menée, et elle coûte un week-end plutôt qu'un trimestre. Figez le modèle, ne permutez que le framework, et lisez l'écart des accélérations par tâche sur votre propre charge au lieu d'une moyenne. Si une pile l'emporte en moyenne tout en se réordonnant tâche par tâche, vous avez reproduit dans vos propres chiffres le constat qu'aucune pile ne domine [s1], et vous avez appris ce qu'un classement public est structurellement incapable de vous dire : si le vainqueur gagne sur votre travail ou sur celui d'un autre.

> [!WARNING]
> L'avertissement de Cui va à rebours de l'instinct qu'il déclenche : l'accélération brute n'est pas sûre comme score de banc d'essai, car certains gains importants proviennent de l'exploitation de raccourcis propres au banc d'essai [s1]. La pile au meilleur chiffre est celle qu'il faut le plus se méfier de croire.

Voilà pourquoi le classement public ne saurait tenir lieu, en douce, de l'évaluation que vous n'avez jamais bâtie : le score que vous compareriez mesure en partie l'aptitude d'une pile à exploiter les failles de l'instrument qui la mesure. Cessez de faire votre marché sur le classement, certes, mais tenez cela pour une conséquence et non pour le message. Le message, c'est que « le harnais compte plus que le modèle » n'a jamais été un constat sur lequel agir. C'est un constat qui révoque l'action qu'on en tire, et l'honnêteté commande de cesser de la tirer.
