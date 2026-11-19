---
translationKey: a-passing-test-does-not-say-done
lang: fr
slug: un-test-vert-ne-dit-pas-grand-chose
title: Un test vert ne dit pas grand-chose
publishDate: 19-11-2026
summary: Quand un agent écrit le code et les tests, un test qui passe prouve peu.
  Ce que je pense qu'il faut exiger avant d'accepter le mot « terminé ».
tags:
- agentic-coding
- evaluation
- qualite
sources:
- label: Konstantinou, Degiovanni et Papadakis, 2024
  url: https://arxiv.org/abs/2410.21136
  date: 18-11-2026
- label: How the Claude Code team thinks about verification (Addy Osmani)
  url: https://claude.dev/blog/how-the-claude-code-team-thinks-about-verification/
  date: 18-11-2026
contentHash: sha256:a66453ffa10dc29a
publishState: published
---

Quand un agent écrit le code, puis les tests, et que les tests passent, je n'en conclus presque rien. La raison tient à qui a écrit quoi. Un test est censé être un deuxième avis sur le code. Si le même modèle rédige les deux dans la même session, avec la même compréhension de la demande, le deuxième avis répète le premier. On sait d'ailleurs dans quel sens il se trompe : les tests générés par un modèle ont tendance à affirmer ce que le code fait, et pas ce qu'il devrait faire ([Konstantinou, Degiovanni et Papadakis, 2024](https://arxiv.org/abs/2410.21136)). Un bug présent dans le code se retrouve donc écrit noir sur blanc dans le test, comme comportement attendu, et tout est vert.

## « Terminé » est une phrase sur la demande

Ce qui me gêne le plus dans un rapport d'agent, c'est que le mot « terminé » et la ligne « 42 tests passent » sont posés côte à côte comme si l'un découlait de l'autre. Or ils ne parlent pas de la même chose. « Terminé » veut dire que ce qui était demandé est fait. « 42 tests passent » veut dire que 42 affirmations sur le code sont vraies, et personne ne sait lesquelles concernent la demande. Prenez une demande toute bête : un mot de passe qui contient le nom d'utilisateur doit être refusé. L'agent peut livrer 42 tests sur la longueur, les caractères spéciaux et le message d'erreur, tous verts, sans qu'un seul essaie « alice » avec le mot de passe « alice2026 ». Pour que les deux phrases se rejoignent, il faut que la demande existe quelque part sous une forme qu'on peut pointer du doigt, une liste d'exigences avec chacune son nom, et que chaque test dise laquelle il vérifie. À ce moment-là seulement on peut poser la question qui compte : pour chaque chose demandée, est-ce qu'un test la vérifie ? Une exigence sans test n'est pas forcément mal implémentée. On n'en sait rien, voilà tout, et dans ce cas je préfère que le rapport le dise.

Ce lien entre un test et une exigence a une durée de vie, et c'est le point qu'on oublie le plus facilement. Une exigence se reformule. On garde son nom, on change une condition, un seuil, un cas limite, et les tests écrits pour l'ancienne phrase continuent de passer. Ils sont verts pour une question que plus personne ne pose. Rien ne casse et aucun rapport ne bouge, donc personne n'a de raison d'aller voir. Je pense donc qu'un changement de sens doit invalider d'office les verts d'avant, jusqu'à ce que quelqu'un ait relu chaque test concerné et confirmé qu'il répond encore à la bonne question. C'est pénible, je le sais, et je préfère cette relecture-là, faite le jour où l'on sait encore ce qu'on vient de changer, à une enquête trois mois plus tard sur un comportement que tous les tests déclaraient correct.

## Une preuve, c'est quelque chose qui a tourné

Un agent écrit très bien des phrases comme « j'ai vérifié que le cas vide est géré ». Je ne lis plus ces phrases comme des informations. Ce n'est pas qu'elles soient fausses, la plupart du temps elles sont vraies, mais je n'ai aucun moyen de distinguer celles qui le sont des autres, et une affirmation que je ne peux pas distinguer d'une affirmation fausse ne m'apprend rien. La même chose vaut pour un test qui existe dans le dépôt mais que le lanceur n'exécute pas, ou pour un commentaire qui dit qu'un cas est couvert. Ce qui compte comme preuve, pour moi, c'est la trace d'une exécution : ce test-là a tourné, à ce moment-là, sur ce code-là, et il a réussi.

De là vient une position que je tiens assez fermement : le contrôle final ne doit pas être rendu par un modèle. Je veux pouvoir le relancer sur les mêmes fichiers et obtenir le même verdict, et un modèle interrogé deux fois sur le même diff peut rendre deux avis. Un modèle est utile en amont, pour proposer : une façon de casser le code, un cas d'entrée tordu, une lecture d'une exigence ambiguë. Mais une proposition se confirme en l'exécutant. Si un modèle dit qu'un test est faible, on fabrique le code fautif et on regarde si le test le laisse passer. S'il dit qu'un test est bon, ça ne valide rien pour autant. Le jugement d'un modèle, seul, ne devrait ni bloquer ni valider. On me répondra qu'une relecture par un second modèle attrape de vrais bugs, et c'est exact. Je la garde volontiers comme source d'hypothèses. Je refuse seulement qu'elle soit la dernière étape, celle après laquelle plus personne ne regarde.

## Il faut regarder un test échouer

On juge d'habitude un test sur le bon code : il passe, tant mieux. Seulement un test qui n'affirme rien passe aussi, et un test qui recopie la sortie du code passe par construction. Ce que je veux savoir, c'est si ce test s'apercevrait que le code enfreint l'exigence, et on ne peut le savoir qu'en essayant. Pour le mot de passe de tout à l'heure, on écrit une version du code qui accepte « alice2026 » pour alice, ou qui ne compare qu'en respectant la casse et laisse donc passer « Alice2026 », et on lance les tests qui prétendent couvrir la règle. S'ils restent verts, ils ne couvraient rien, quel que soit leur nombre.

Quand c'est un agent qui écrit les tests, il y a une précaution de plus à prendre : il ne doit pas voir le code cassé. Si vous lui montrez la variante fautive, il écrit un test taillé pour elle, le contrôle repasse au vert, et on n'a rien appris sur les violations qu'on ne lui a pas montrées. Ce qu'on peut lui donner, c'est le nom de l'exigence et une entrée que ses tests ne distinguent pas. À lui de comprendre pourquoi. C'est la même logique qu'un jeu de test tenu à l'écart de l'entraînement : dès que celui qui est évalué voit la grille, la note ne veut plus rien dire. L'équipe de Claude Code le formule pour les règles de relecture dans [son article sur la vérification](https://claude.dev/blog/how-the-claude-code-team-thinks-about-verification/) : si un changement peut modifier le contrôle qui le juge, le contrôle est cassé. Je suis d'accord, et je pense que cela s'étend à tout ce que l'agent peut observer du contrôle, pas seulement à ce qu'il peut modifier.

## Savoir à quel moment arrêter la boucle

Tout cela fonctionne en boucle : le contrôle refuse, renvoie ses constats, l'agent corrige, on recommence. Tant que chaque tour avance, c'est très bien, et ça coûte peu. Mais un agent bloqué plusieurs fois de suite sur le même constat ne se met pas à mieux réfléchir, il se met à chercher ce qui fait taire le contrôle. Je m'arrête à trois refus sans progrès. À ce stade, soit l'exigence est mal écrite, soit elle en contredit une autre, soit c'est le contrôle qui a tort, et insister ne règle aucun de ces cas. Il faut que quelqu'un regarde. L'article de l'équipe de Claude Code fixe la même limite, trois tours puis un humain, et s'en sert pour choisir ce que quelqu'un doit aller regarder, puisque personne ne peut tout relire. Leur premier principe est ailleurs : lancer l'application de bout en bout, ce qui compte plus à leurs yeux que les tests.

## Ce que je ne sais pas faire

Un test rattaché à une exigence, exécuté, et qui échoue sur une variante fautive, peut encore passer à côté de l'essentiel : il échoue sur la violation qu'on a pensé à fabriquer, pas sur les autres. Et tout en bas de l'échelle, un test correctement étiqueté qui n'affirme rien satisfait la partie la plus simple du contrôle. Dire si un test vaut quelque chose reste un travail de relecture, fait par quelqu'un qui connaît la demande. Je ne sais pas le rendre mécanique jusqu'au bout.
