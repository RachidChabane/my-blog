---
translationKey: claude-tag-slack-ai-teammate
lang: fr
slug: claude-tag-coequipier-ia-slack
title: 'Claude Tag : le coéquipier IA permanent d''Anthropic dans vos canaux Slack'
publishDate: 26-06-2026
kind: tool
tags:
- Claude
- Anthropic
- Slack
- agents
summary: Le 23-06-2026, Anthropic a lancé Claude Tag, un Claude permanent qui rejoint
  un espace Slack comme une identité d'équipe partagée, et non comme un chatbot par
  utilisateur.
sources:
- label: Anthropic news - Introducing Claude Tag
  url: https://www.anthropic.com/news/introducing-claude-tag
  date: 23-06-2026
- label: TechCrunch
  url: https://techcrunch.com/2026/06/23/anthropics-claude-tag-is-learning-your-company-one-slack-message-at-a-time/
  date: 23-06-2026
- label: SiliconANGLE
  url: https://siliconangle.com/2026/06/23/anthropic-debuts-claude-tag-capable-ai-teammate-lives-within-slack/
  date: 23-06-2026
contentHash: sha256:b4c3d424af0f2a73
publishState: published
---

## Ce qui change

Le 23-06-2026, Anthropic a lancé Claude Tag, un Claude permanent installé dans Slack, encore en bêta. On le sollicite en mentionnant `@Claude` dans un canal (un message privé fonctionne aussi) : il découpe la tâche en étapes qu'il traite l'une après l'autre avec les outils qu'un administrateur lui a accordés, retient le contexte des canaux où il se trouve et peut planifier des tâches futures [s1]. Dans un canal, il n'existe qu'une seule identité Claude partagée que tout le monde voit, si bien que chacun peut reprendre là où le précédent s'est arrêté [s2]. Il tourne sur Opus 4.8 et reste réservé aux clients Claude Enterprise et Claude Team [s1].

## Le vrai changement, et le piège

Une IA dans Slack n'a rien d'inédit ; les bots et les assistants individuels existent depuis des années. Ce qui change, c'est la place de l'agent : non plus votre fil privé, mais une identité unique au niveau du canal, dotée de sa propre mémoire persistante sur les canaux qu'elle rejoint et d'un accès défini par un administrateur, pas par vous [s1]. C'est une décision d'architecture qui revient à une équipe plateforme, pas un réglage qu'un individu active seul.

Le piège, lui, se loge dans le mode ambiant. Une fois activé, Claude s'invite de lui-même dans la conversation pour publier des mises à jour, signaler des éléments venus de toute l'organisation et relancer les fils oubliés [s2][s3]. Pratique, mais un agent non sollicité doté d'une mémoire inter-canaux pose à la fois un problème de bruit et un problème de surface de données : que peut lire cette identité partagée, et qui l'y a autorisée. C'est précisément pour cela que les garde-fous de gouvernance arrivent avec le produit, et non après coup.

> [!IMPORTANT]
> La surface de gouvernance est la première chose à régler. Avant d'activer le mode ambiant, délimitez les canaux où `@Claude` intervient, fixez les limites de dépense en tokens et appuyez-vous sur le journal de tout ce que `@Claude` a fait [s1]. Le modèle d'accès par identité d'agent est ce contre quoi vous provisionnez les droits : voyez-le comme la barrière, pas comme une formalité.

## Impact pour une équipe

La décision se prend à l'échelle d'une équipe plateforme ou IT, pas par adoption individuelle. C'est une bêta, sur Opus 4.8, réservée à Enterprise et Team : le choix revient donc à qui administre l'espace de travail, pas à l'ingénieur qui veut l'essayer [s1][s2]. Concrètement : déployez `@Claude` dans deux ou trois canaux, mode ambiant désactivé et limites de dépense en place, lisez le journal d'audit une semaine, puis seulement décidez si l'identité partagée s'étend à toute l'organisation. La capacité est réelle ; c'est sur l'ordre des opérations que les équipes se tromperont.
