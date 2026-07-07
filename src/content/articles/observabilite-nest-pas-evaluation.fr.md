---
translationKey: observability-is-not-evaluation
lang: fr
slug: observabilite-nest-pas-evaluation
title: L'observabilité n'est pas de l'évaluation
publishDate: 07-07-2026
tags:
- evaluation
- agents
category: essays
difficulty: 3
sources:
- label: KDnuggets (I. Palomares), The State of Agent Engineering Report Overview
    (on LangChain's 2026 survey, n=1340)
  url: https://www.kdnuggets.com/the-state-of-agent-engineering-report-overview
  date: 17-03-2026
- label: 'Digital Applied, Agentic AI Adoption: 250-Agency Survey 2026 Results (n=250)'
  url: https://www.digitalapplied.com/blog/agentic-ai-adoption-survey-2026-250-agencies
  date: 26-04-2026
contentHash: sha256:2e41463b03cdb483
publishState: published
---


Acheter un tableau de bord d'observabilité, ce n'est pas savoir que votre agent a raison, et c'est pourtant le troc que la plupart des équipes concluent en silence. Deux enquêtes indépendantes de 2026 montrent le terrain qui cale exactement sur cette ligne: 89% des ingénieurs ont câblé de l'observabilité, mais seulement 52,4% mènent des évaluations hors ligne [s1], et une enquête distincte auprès de 250 agences désigne l'évaluation comme premier frein au déploiement [s2]. La thèse que je veux défendre est plus étroite et plus tranchée que "les évaluations comptent". Elle est que les équipes confondent la trace avec le verdict: elles traitent un tableau de bord qui montre ce qu'un agent a fait comme s'il certifiait qu'il avait raison. Et le correctif est une règle de placement, pas une séquence: construire le harnais d'évaluation sur le même workflow, dans le même sprint, que le tableau de bord.

## L'écart, mesuré

Le chiffre qui devrait vous arrêter, c'est la coïncidence, pas l'un ou l'autre pris seul. Dans l'enquête State of Agent Engineering de LangChain (n=1340), l'instrumentation est quasi universelle à 89%, l'évaluation est un pile ou face à 52,4%, et 32% désignent la qualité comme unique premier obstacle à l'adoption et au déploiement [s1]. Lisez ces trois nombres ensemble et l'histoire s'écrit d'elle-même. Près de neuf équipes sur dix voient ce que leur agent a fait. À peine la moitié peut vous dire s'il avait raison. Et un tiers d'entre elles butent sur le mur de qualité précis que seule la seconde capacité leur permettrait de franchir.

Ce dernier lien, l'enquête le rapporte sans le relier. La qualité est le frein nommé par la population même qui a poussé le traçage jusqu'à la saturation en sautant l'évaluation. Une trace est un relevé riche du comportement: quel outil s'est déclenché, ce que le modèle a vu, où est passée la latence. Rien de tout cela n'est un jugement. Elle vous dit que l'agent a rendu une réponse; elle reste muette sur la justesse de cette réponse. Une équipe qui a des tableaux de bord sans harnais a donc instrumenté sa propre cécité. Elle peut observer chaque étape d'une exécution qui a produit un résultat faux sans rien voir se signaler, parce qu'à aucun moment on n'a demandé à la pile de noter le résultat.

## Un second instrument, une autre population

C'est la convergence qui fait passer le sujet du hasard d'une enquête au motif digne d'action. Une autre étude de 2026 a interrogé 250 agences, une population différente atteinte par un cadre différent, et elle atterrit au même endroit par le versant du ROI: l'évaluation et les tests sont le premier frein au déploiement, cités par 49% comme obstacle du top trois [s2]. Là où LangChain demandait aux ingénieurs ce qu'ils avaient bâti, cette enquête demandait aux agences ce qui les empêchait de livrer, et la réponse rime.

La même étude rapporte que les agences du quart inférieur, celles à 0,7x de ROI, n'ont presque jamais de harnais d'évaluation au niveau du workflow [s2]. J'y vois une corroboration du mécanisme, pas sa preuve. Les agences fragiles manquent vraisemblablement d'évaluations, d'ingénieurs seniors et de discipline de cadrage à la fois; le harnais absent est peut-être un symptôme de leur immaturité plutôt que sa cause, et je ne vais pas prétendre qu'une suite d'évaluation à elle seule ferait passer un atelier en difficulté à 1,2x. Ce que l'association gagne est plus faible et reste utile: le plancher de ROI et le harnais manquant voyagent ensemble, ce qui est exactement ce à quoi on s'attend si un harnais est ce qui convertit une trace en signal exploitable. Le vrai poids est porté par la convergence elle-même. Deux instruments, opérationnalisés de façon indépendante, l'un mesurant l'adoption de l'évaluation hors ligne et l'autre les freins au déploiement, sur deux populations qui se recoupent à peine, désignent le même artefact absent.

## Pourquoi elles convergent

> [!CONFIRMED]
> Deux enquêtes de 2026 sur des populations différentes rapportent le même ordre: 89% d'observabilité contre 52,4% d'évaluations hors ligne dans l'une [s1], l'évaluation comme premier frein au déploiement dans l'autre [s2].

> [!INFERRED]
> L'artefact manquant est donc le même partout: un harnais qui transforme une trace en signal de succès ou d'échec. Les deux populations ont acheté l'instrument qui enregistre le comportement et sauté celui qui le juge. Cette lecture est la mienne, pas celle des enquêtes.

La synthèse vit dans l'espace entre les deux sources, pas à l'intérieur de l'une d'elles. Aucune des deux études ne cherchait à démontrer que l'observabilité est prise pour de l'assurance qualité; chacune a mesuré une tranche et est passée à autre chose. Mettez-les côte à côte et la forme partagée apparaît. Une trace répond à "que s'est-il passé". Seul un harnais qui note la trace face à une attente répond à "était-ce juste". Le terrain a acheté le premier presque jusqu'à saturation et le traite comme s'il avait livré le second. Cette substitution est la vraie défaillance, et ce n'est pas un raisonnement définitionnel qui tourne à vide, car on la lit dans les nombres: la population qui possède les tableaux de bord est la même qui rapporte la qualité comme le mur qu'elle ne franchit pas.

## La contre-objection, et pourquoi elle perd

Le meilleur argument contre moi est réel, et ce n'est pas que l'évaluation serait secondaire. C'est qu'on ne peut pas évaluer ce qu'on ne peut pas tracer. L'observabilité est le substrat sur lequel tourne un harnais d'évaluation; il faut la trace pour avoir quelque chose à noter. Sous cet angle, commencer par l'observabilité n'est nullement une erreur, c'est un authentique prérequis, et toute ma thèse s'effondre soit en trivialité (une trace ne prouve pas la justesse, ce que personne ne conteste), soit en fausseté (qu'il faudrait sauter le traçage).

Je concède le prérequis ouvertement, car le concéder est ce qui désamorce l'objection plutôt que ce qui coule l'argument. Ma revendication est en parallèle, pas à la place. Elle ne demande jamais de sauter le traçage. Le problème n'est pas que les équipes instrumentent; c'est qu'elles s'arrêtent à l'instrumentation et lisent le tableau de bord vert comme un résultat de qualité. L'adoption ne cale pas avant le traçage, là où l'argument du prérequis le prédirait; elle cale au traçage, à un pas du harnais qui donnerait un sens à la trace. Et le plancher marginal de ROI dépend de la présence de quelque chose qui note la trace, non de la possession d'un tableau de bord de plus. Le prérequis est vrai et il est déjà satisfait. L'écart, c'est l'étape suivante, et c'est celle que le terrain ne franchit pas.

## Ce que je fais à la place

La règle que je suis réellement est ennuyeuse et porteuse: le harnais d'évaluation part dans le même sprint que le tableau de bord, sur le même workflow, ou le déploiement d'observabilité n'est pas terminé. Je traite un déploiement de traçage sans suite d'évaluation comme je traiterais un service avec des logs et sans tests. Ce n'est pas une histoire de qualité achevée; c'est une histoire à moitié bâtie qui a l'air complète parce que le tableau de bord est vert.

> [!WARNING]
> Le piège du tableau de bord vert: chaque span s'affiche, la latence semble saine, les taux d'erreur sont plats, et rien dans la trace ne vous dit que l'agent vient de rendre une réponse fausse avec assurance. Un tableau de bord rapporte que l'exécution a eu lieu. Il ne peut pas rapporter qu'elle était juste, parce que vous ne lui avez jamais donné l'oracle qui le saurait.

D'expérience, la défaillance n'est pas que quiconque croie qu'une trace prouve la justesse quand vous le lui demandez en face. Interrogé franchement, chacun concède que la trace est muette sur la vérité. La défaillance est dans ce que l'outillage rend facile. Un tableau de bord est un achat; un harnais d'évaluation est un projet. Alors le tableau de bord est acheté, le harnais est reporté au sprint qui ne vient jamais, et l'équipe fonctionne des mois durant sur l'illusion confortable qu'un système qu'elle peut observer est un système qu'elle a vérifié. Le moyen le moins cher que je connaisse pour briser l'illusion, c'est de refuser de déclarer un déploiement d'observabilité terminé tant qu'un harnais ne note pas les traces qu'il collecte. Construisez-les ensemble. La trace ne devient un signal de qualité qu'une fois que quelque chose demande si la réponse était juste.
