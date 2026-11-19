---
translationKey: a-passing-test-does-not-say-done
lang: fr
slug: un-test-vert-ne-dit-pas-grand-chose
title: Un test vert ne dit pas grand-chose
publishDate: 19-11-2026
summary: Quand un agent écrit le code et les tests, un test qui passe prouve peu.
  Voici ce que j'exige avant d'accepter le mot « terminé ».
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
contentHash: sha256:e91bf2c9b483fa86
publishState: published
---

Quand un agent écrit le code puis les tests, et que les tests passent, je n'en conclus presque rien. Un test peut rester vert sur du code cassé, et les tests écrits par le modèle qui a écrit le code ont tendance à vérifier ce que le code fait plutôt que ce qui était demandé ([Konstantinou, Degiovanni et Papadakis, 2024](https://arxiv.org/abs/2410.21136)). L'agent annonce pourtant que c'est terminé, et je n'ai que sa parole.

J'ai écrit deux outils là-dessus, shallnot puis musthold. Ce qui suit, ce sont les règles qu'ils appliquent.

## Un test dit quelle exigence il vérifie

Dans mes spécifications, une exigence s'écrit avec un identifiant et une révision, par exemple `PWD-2~1` pour « un mot de passe qui contient le nom d'utilisateur est refusé ». Le test qui la couvre le dit dans son nom : `[verifies PWD-2~1]`. Tant qu'aucun test ne cite `PWD-2~1`, je considère que le travail est en cours, même si l'agent a rendu la main. J'ai alors une liste d'exigences à parcourir, avec ou sans test en face de chacune.

## Une étiquette ne compte que si le test a tourné

On pourrait se contenter de chercher les étiquettes dans le code des tests. Sauf qu'une étiquette dans un commentaire, ou sur un test qui n'est jamais lancé, se trouve très bien avec une recherche de texte. Je ne lis donc que le fichier de résultats, le JUnit XML que produit le lanceur de tests : il faut que le test y figure, qu'il ait réussi, et que ce soit bien lui qui porte `PWD-2~1`.

## Quand le sens d'une exigence change, ses anciens tests ne valent plus

On reformule `PWD-2`, on garde son nom, et ses tests continuent de passer alors qu'ils ont été écrits pour l'ancienne phrase. Rien ne le signale. D'où le `~1` : quand le sens change, l'exigence devient `PWD-2~2`, et tous les tests qui citent encore `~1` échouent jusqu'à ce que quelqu'un les ait relus.

## Le contrôle ne passe pas par un modèle

shallnot est un binaire qui ne touche ni au réseau ni à un modèle. Je veux pouvoir relancer le contrôle sur les mêmes fichiers et obtenir le même rapport. Dans musthold, un modèle intervient, mais seulement pour proposer : une façon de casser le code, par exemple. Ensuite on exécute, et une variante cassée ne compte que si elle compile, qu'elle laisse passer les tests des autres exigences et qu'elle fait échouer un exemple de la sienne.

## Les tests doivent échouer sur du code faux, que l'agent ne voit pas

Savoir qu'un test passe sur le bon code ne me suffit pas, je veux savoir s'il échouerait sur un code qui enfreint l'exigence. Pour chaque exigence, musthold casse donc le code de cette façon précise et regarde si les tests s'en aperçoivent. S'ils ne voient rien, l'agent reçoit le nom de l'exigence et une entrée que ses tests ne distinguent pas. On ne lui montre jamais le code cassé, sinon il écrirait un test taillé pour ce cas et on n'aurait rien appris.

## Au troisième blocage sans progrès, c'est moi qui regarde

Le contrôle tourne en fin de tour et renvoie ses constats à l'agent, qui reprend. Après trois blocages sans progrès, il cesse de bloquer et me prévient. L'équipe de Claude Code décrit la même règle dans [son article sur la vérification](https://claude.dev/blog/how-the-claude-code-team-thinks-about-verification/) : si une vérification échoue encore au troisième tour, Claude s'arrête et fait venir quelqu'un.

Leur article contient deux autres règles dont je ne parle pas ici : lancer l'application de bout en bout compte plus que les tests, et un changement capable de modifier le contrôle qui le juge rend ce contrôle caduc.

## Ce que tout cela ne prouve toujours pas

Un contrôle au vert signifie que chaque exigence est citée par un test qui a tourné et réussi. Un test étiqueté qui n'affirme rien passe quand même. Juger si un test vaut quelque chose reste un travail de relecture, et je ne sais pas le rendre mécanique jusqu'au bout.
