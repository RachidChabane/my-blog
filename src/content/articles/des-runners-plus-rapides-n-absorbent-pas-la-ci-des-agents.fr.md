---
translationKey: agent-ci-load-and-the-unearned-green
lang: fr
slug: des-runners-plus-rapides-n-absorbent-pas-la-ci-des-agents
title: Des runners plus rapides ne suffisent pas face à la CI des agents
publishDate: 26-09-2026
tags:
- agentic-coding
- qualite
category: essays
difficulty: 3
sources:
- label: Linear, AI coding has made CI a bottleneck (the constraint)
  url: https://linear.app/now/ci-bottleneck-reworked
  date: 21-09-2026
- label: Industrial AI-assisted remediation field study, the setting
  url: https://arxiv.org/abs/2609.29172
  date: 24-09-2026
contentHash: sha256:ac86bb559c5c645a
publishState: published
---


À mon sens, des runners plus rapides ne suffisent pas face à la charge de CI des agents de code : chaque test coûte moins cher, mais les agents multiplient exécutions et revues. Linear résume la contrainte ainsi : chaque PR doit toujours passer par la CI, qui devient un goulot d'étranglement à mesure que le développement accélère [s1]. Le levier qui, selon moi, croît avec le volume des agents consiste à sauter les tests déjà réussis pour les mêmes entrées, et il ne rapporte que si chaque entrée lue par un test est déclarée. Je pense aussi que le temps d'attente des PR est le mauvais indicateur : il peut baisser pendant que la file se déplace vers les relecteurs.

## La production des agents s'accumule dans la CI

Écrire un changement coûtait cher. Avec un agent dans la boucle, le coût s'est déplacé vers tout ce qui se passe une fois le diff produit, or un budget de runners ne soulage qu'une seule des ressources qui saturent. Linear l'admet volontiers : les agents permettent de livrer du code plus vite, mais la validation de ces changements n'a pas tout à fait suivi le même rythme [s1].

Une étude de terrain sur la correction assistée par IA décrit des centaines de commits touchant des milliers de lignes, produits si vite qu'ils ont saturé la CI et l'attention des relecteurs [s5]. Dans ces deux récits, je vois une même contrainte atteinte par deux chemins. D'un côté, le pipeline d'une équipe produit soumis à l'usage quotidien des agents ; de l'autre, un développeur seul qui balaie une base de code industrielle.

Les auteurs de l'étude nomment d'ailleurs ce qui se raréfie quand l'écriture cesse d'être la partie difficile : quand l'édition mécanique devient peu coûteuse, la capacité de la CI, l'effort de revue et l'orchestration des changements deviennent les principaux goulots d'étranglement [s6]. La dépense en runners agit sur le premier point de cette liste.

Un sur trois, c'est un remède partiel.

## Ce que montre le résultat de Linear, et ce qu'il ne dit pas

L'objection la plus solide à ma position vient du billet de Linear lui-même. Leurs suites de tests ont presque quadruplé depuis le début de l'année, et pourtant le temps d'attente des pull requests est passé de plus de 6 minutes à un peu plus de 5, et le temps de runner par test a baissé environ de moitié [s2]. À première lecture, on voit une efficacité par exécution qui absorbe une forte hausse du volume. Si cela a marché chez eux, pourquoi ne pas continuer d'acheter de la vitesse ?

J'en achèterais encore. Des exécutions moins chères sont une économie réelle, et rien dans mon argument ne commande d'y renoncer.

Le problème tient à l'attribution. Or, dans le même pipeline, chaque exécution commence par vérifier quels chemins une PR a touchés et si ces tests ont déjà réussi pour les mêmes entrées [s3]. Un seul jeu de chiffres, alors que plusieurs mécanismes jouent en même temps, ne permet pas de savoir comment le gain se répartit entre eux. Il ne plaide donc pas clairement pour la seule vitesse des runners.

Le temps d'attente des PR est un chiffre propre à la CI. Il mesure combien de temps un changement reste dans le pipeline, et ne dit rien de l'attention disponible pour lire ce qui en sort. Dans l'étude de terrain, cette attention a saturé en même temps que la CI [s5]. Une équipe peut afficher un temps d'attente en baisse pendant que ses relecteurs se noient, et la courbe aura l'air d'un succès.

> [!NOTE]
> Pour moi, le temps de runner par test est un indicateur de coût, et le résultat cité ne dit pas ce qui l'a fait baisser.

## Sauter les tests déjà verts pour les mêmes entrées

À mon sens, sauter des tests est la part du budget de CI dont les économies croissent avec le volume des agents. On remplace une exécution par le souvenir d'une exécution antérieure aux entrées identiques, et c'est précisément le rôle de la vérification des entrées dans le pipeline de Linear [s3].

Un agent qui pousse de nouveau le même changement après un rebase, ou qui modifie un ensemble ciblé de chemins, laisse la plupart des entrées de test intactes, et chaque entrée identique est une exécution que personne ne paie. Des runners plus rapides rendent chaque exécution payée moins chère ; sauter un test supprime l'exécution.

Le revers, c'est que le gain fond précisément quand la charge culmine. Le balayage de correction décrit par l'étude de terrain a produit des centaines de commits touchant des milliers de lignes [s5]. Sur des modifications aussi larges, la plupart des entrées changent. Le saut de tests sert les modifications ciblées et répétées.

Voici comment j'imagine que le gain varie. Le tableau reflète ma lecture du mécanisme, sans aucune mesure derrière.

| Forme du changement | Entrées pour l'essentiel inchangées ? | Ce qu'un test sauté économise |
| :--- | :--- | :--- |
| L'agent pousse de nouveau le même changement après un rebase | Oui | L'essentiel de la suite |
| Correctif ciblé sur quelques chemins | En grande partie | Tout ce qui est hors de ces chemins |
| Balayage de tout le dépôt | Non | Peu de chose |

## Quand un vert en cache n'a jamais été mérité

Un test sauté peut se périmer sans que personne ne s'en aperçoive. Il repose sur l'idée qu'un résultat antérieur tient toujours, et une vérification ne peut comparer que les entrées qu'elle connaît.

Le premier mode de défaillance que je citerais, c'est l'entrée non déclarée : un test qui lit une variable d'environnement, l'horloge ou le réseau paraît inchangé aux yeux d'une vérification fondée sur les fichiers et les chemins, si bien qu'une exécution sautée renvoie un résultat vert qui n'a jamais été produit pour ce changement. Les spécialistes du build connaissent ce problème sous le nom d'herméticité. Je pense que les équipes l'oublient quand la pression pour sauter des tests vient du volume des agents, et que le taux de saut devient un chiffre à faire monter.

```python
def test_invoice_is_overdue():
    today = datetime.date.today()          # lit l'horloge
    region = os.environ["BILLING_REGION"]  # lit l'environnement
    assert invoice_for(region).is_overdue(today)
```

J'ai écrit ce test pour illustrer le mécanisme ; aucune des deux sources ne le décrit. Rien dans ses fichiers source ne bouge quand la date ou la région changent.

> [!CONFIRMED]
> Chaque exécution commence par vérifier quels chemins une PR a touchés et si ces tests ont déjà réussi pour les mêmes entrées [s3].

> [!INFERRED]
> À mon sens, un test qui lit l'horloge, une variable d'environnement ou le réseau ne devrait jamais pouvoir être sauté tant que ces lectures ne sont pas déclarées comme entrées.

Traiter ces tests comme impossibles à sauter coûte quelques hits de cache. On y gagne un vert qui dit vrai.

> [!WARNING]
> J'auditerais en premier les tests qui lisent quoi que ce soit hors du dépôt : ce sont eux qu'une vérification fondée sur les chemins jugera à tort inchangés.

## Façonner la file des changements avant la CI

La taille des changements se décide sous la pression contraire des deux bouts du pipeline, et le budget de runners n'y est pour rien. Dans l'étude de terrain, des commits fichier par fichier ont surchargé la CI déclenchée à chaque commit ; regrouper par répertoire et plafonner le nombre de fichiers par changement a rétabli le débit, mais exigeait toujours de solliciter explicitement la revue, de négocier la granularité des commits et d'assurer un suivi des échecs de build et d'analyse statique [s7].

J'y vois un transfert de travail. Le correctif qui a soulagé la CI a reporté l'effort sur les relecteurs et sur la personne qui négocie ce qu'est un commit raisonnable. Des changements plus gros réduisent aussi ce qu'un test sauté peut économiser, puisqu'un lot touche l'union des chemins de ses membres. Le même curseur déplace la charge de CI, le gain des tests sautés et la charge de revue dans des directions différentes, et aucune capacité de runner ne tranche où le placer.

L'étude range l'orchestration des changements parmi les goulots d'étranglement à part entière [s6]. Je pense que c'est la lecture utile pour qui fait tourner des agents à grande échelle : dimensionner et ordonner les changements des agents est un problème de conception en soi, et personne ne le résout par hasard.

C'est aussi pour cela que je me méfie du tableau de bord habituel. Le chiffre que je mettrais en tête, c'est le temps qui sépare le changement d'un agent de sa fusion après revue, à côté du taux de saut et du nombre de tests aux lectures non déclarées. Le temps d'attente des PR peut figurer à côté. Il n'a rien à faire en tête.

## Jusqu'où porte une étude de cas unique

Dans l'étude de terrain, je vois le signe que le mécanisme de saturation existe, et je laisse ouverte la question de sa fréquence. Il s'agit d'une étude de cas unique, exploratoire, menée sur 15 jours, au cours de laquelle un développeur expérimenté a utilisé un assistant de code IA en ligne de commande pour corriger des problèmes répandus dans un dépôt C++ industriel fermé [s4]. Le billet de Linear, lui, rend compte du pipeline d'une seule équipe, avec son propre mélange de changements.

Reste une objection que je ne peux pas écarter. Dans une équipe donnée, la capacité des runners peut encore être la contrainte qui bloque, et là, des runners plus rapides sont le premier investissement à faire. Ma thèse est plus restreinte : ils cessent de suffire dès que les agents imposent le rythme, parce qu'ils n'agissent ni sur l'effort de revue ni sur l'orchestration des changements.

Si je m'y mettais demain, je suivrais un ordre précis. Déclarer chaque entrée lue par un test avant de faire confiance au moindre saut. Afficher le délai jusqu'à la fusion après revue, et reléguer le temps d'attente des PR au rang d'indicateur secondaire. Puis confier à quelqu'un le dimensionnement et l'ordonnancement des changements des agents, car le budget de runners ne prendra jamais cette décision à votre place.
