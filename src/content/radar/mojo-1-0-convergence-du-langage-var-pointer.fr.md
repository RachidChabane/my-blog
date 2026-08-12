---
translationKey: modular-mojo-1-0-language-stability-release
lang: fr
slug: mojo-1-0-convergence-du-langage-var-pointer
title: Mojo 1.0 converge sur var, des fermetures unifiées et un seul type Pointer
publishDate: 12-08-2026
kind: release
tags:
- Mojo
- Modular
- compilers
- GPU programming
summary: 'Modular a publié Mojo 1.0 le 11 août 2026 : les variables se déclarent uniformément
  avec var, les fermetures sont unifiées, il n''y a plus qu''un seul type Pointer,
  et une syntaxe lambda à la manière de Python arrive avec un serveur LSP que Modular
  dit bien plus stable et des Mojo AI Skills qui couvrent le portage depuis d''autres
  langages. The Register rapporte que la bibliothèque standard est disponible sous
  la version 2.0 de la licence Apache avec les exceptions LLVM, et que Modular a déclaré
  vouloir ouvrir le code du compilateur cette année. À mon sens, l''association d''un
  LSP plus solide et d''une skill de portage désigne l''endroit où Modular attend
  les frictions, et qui il compte pour les absorber.'
sources:
- label: Modular release announcement, Mojo 1.0
  url: https://www.modular.com/blog/modular-26-5-mojo-1-0-is-here
  date: 11-08-2026
- label: The Register
  url: https://www.theregister.com/ai-and-ml/2026/08/12/modulars-mojo-programming-language-hits-10-milestone/5286545
  date: 12-08-2026
contentHash: sha256:71a3fca690360f15
publishState: published
---

## Ce qui change

Modular a publié Mojo 1.0 le 11 août 2026, et c'est une version de convergence : les variables
se déclarent uniformément avec `var`, les fermetures sont unifiées, il n'y a plus qu'un seul
type `Pointer`, et des renommages achèvent ce que Modular appelle le dernier nettoyage
[s1]. La version apporte aussi une syntaxe `lambda` à la manière de Python, un serveur LSP que
Modular dit bien plus stable, et des Mojo AI Skills jugées prêtes pour la 1.0 sur la
programmation GPU et le portage depuis d'autres langages [s1]. The Register rapporte que la
bibliothèque standard est disponible sous la version 2.0 de la licence Apache avec les
exceptions LLVM, et que Modular a déclaré vouloir ouvrir le code du compilateur cette année
[s2].

## Qui fera la migration, selon Modular

Lisez cette version comme un propos sur le travail plutôt que sur la syntaxe. Pour
qui a déjà du Mojo dans un dépôt, un nettoyage qui renomme et supprime la seconde façon
d'écrire, c'est une passe d'édition sur du code qui marche [s1]. Ce qui l'accompagne
est révélateur : un serveur de langage que Modular dit bien plus stable, et des AI Skills dont
la couverture
annoncée inclut le portage depuis d'autres langages [s1]. À mon sens, Modular désigne l'endroit
où il attend les frictions, et qui il compte pour les absorber.

Le pari tient sur la moitié mécanique, les renommages, qu'un agent sait faire avec le
compilateur pour oracle. Reste la moitié sémantique : des fermetures unifiées et un seul type
`Pointer` changent le sens du code [s1], et je doute qu'un fichier de skill vous dise lesquels
de vos transtypages portaient quelque chose. C'est là que passe la semaine.

> [!IMPORTANT]
> La liste ci-dessus a une seule origine, le billet de Modular [s1]. Une rédaction distincte
> apporte le volet licence : la bibliothèque standard sous la version 2.0 de la licence Apache
> avec les exceptions LLVM, et l'intention déclarée d'ouvrir le code du compilateur cette
> année [s2]. Une intention n'est pas une licence, et je ne leur donne pas le
> même poids.

## Impact pour une équipe

Si Mojo est déjà dans un dépôt, traitez le passage à 1.0 comme une édition de sources plutôt
que comme une montée de version, avant de bâtir dessus [s1]. Sinon, la
décision est plus étroite que l'adoption du langage : savoir si un composant GPU bien
délimité mérite d'être écrit en Mojo, puisque c'est là que pointent outillage et skills
[s1]. Je ne déplacerais pas un service Python sur la foi d'un numéro de version. La question à
reposer cette année est la licence : la licence Apache couvre la bibliothèque standard
que vous lisez ; le compilateur qui produit votre binaire reste une intention [s2].
