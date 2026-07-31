---
translationKey: cursor-router-request-classifier
lang: fr
slug: cursor-router-classifieur-de-modele-par-requete
title: Cursor Router choisit le modèle à chaque requête et optimise la satisfaction
  utilisateur
publishDate: 31-07-2026
kind: tool
tags:
- Cursor
- agents
- coding
summary: Cursor a lancé Cursor Router le 22 juillet 2026, un classifieur qui examine
  chaque requête avant qu'un modèle ne tourne et l'oriente vers le modèle le mieux
  adapté, entraîné sur plus de 600k requêtes réelles et optimisé sur la satisfaction
  utilisateur (AFC) comme récompense. Cursor annonce 60% d'économie sur son propre
  A/B test en ligne. Il nomme aussi une seconde métrique de qualité, le keep rate,
  sans en publier de chiffre.
sources:
- label: Primary - Cursor blog, how Cursor Router was trained
  url: https://cursor.com/blog/router
  date: 22-07-2026
- label: Independent corroboration - MarkTechPost on the request-level classifier
  url: https://www.marktechpost.com/2026/07/22/cursor-releases-cursor-router-a-request-level-classifier/
  date: 22-07-2026
- label: Independent corroboration - TestingCatalog on the early-access accounts
  url: https://www.testingcatalog.com/icymi-cursor-launches-router-to-cut-costs-for-coding-models/
  date: 25-07-2026
contentHash: sha256:69889459db8435be
publishState: published
---

## Ce qui change

Cursor Router, lancé le 22 juillet 2026, place un classifieur entre la requête et le modèle. Il examine chaque requête avant qu'un modèle ne tourne et l'oriente vers le modèle le mieux adapté à cette requête. Cursor l'a entraîné sur plus de 600k requêtes réelles et évalué en A/B test en ligne sur des millions de requêtes, en optimisant la satisfaction utilisateur (AFC) comme récompense, et MarkTechPost rapporte la même conception. Il est disponible sur les offres Teams et Enterprise. On choisit Auto dans le sélecteur de modèle, puis l'un des trois modes, Intelligence, Balance ou Cost.

## La métrique que Cursor définit sans la publier

Cursor nomme deux métriques de qualité. La satisfaction utilisateur classe le succès de l'agent à partir des réactions de l'utilisateur, où passer à la fonctionnalité suivante constitue un signal positif fort et corriger l'agent un signal négatif fort. Le keep rate mesure la part du code écrit par l'agent qui subsiste dans la base au fil du temps. Le routeur est entraîné sur la première. Le keep rate figure dans le billet comme une définition et n'est accompagné d'aucun chiffre.

C'est là que je situe le risque. La satisfaction note ce qui semblait juste au moment de la réponse, le keep rate note ce qui a survécu au sprint suivant. Sur une petite modification, les deux concordent. Or c'est précisément sur les tâches agentiques longues, celles pour lesquelles on veut le modèle le plus fort, qu'elles divergent : du code qui se lit bien, qu'on accepte, puis qu'on remplace discrètement obtient une bonne note sur la métrique qui a entraîné le routeur.

## Trois chiffres d'économie, trois populations

| Chiffre | Périmètre | Source |
| --- | --- | --- |
| 60% d'économie | A/B test en ligne sur des millions de requêtes | Cursor |
| environ 36% de coût en moins | Auto Balance, au-dessus d'Opus 4.8 sur la satisfaction utilisateur | Cursor |
| 30% à 50% | trois grands comptes entreprise, deux semaines d'accès anticipé | TestingCatalog |

Aucune de ces populations ne correspond à votre mix de requêtes, donc aucun de ces chiffres n'a sa place tel quel dans votre budget. Le seul dont la population soit nommée est celui de TestingCatalog, et cette page le présente comme rapporté.

> [!IMPORTANT]
> L'activation par défaut fait l'objet d'un désaccord entre les sources. MarkTechPost écrit que le routeur est actif par défaut sur les offres Teams. Le billet de Cursor indique seulement que les administrateurs peuvent l'activer par équipe ou par groupe, choisir les modes accessibles aux membres, définir le mode par défaut et autoriser ou bloquer certains modèles. Cela décrit une surface de configuration. Vérifiez votre propre espace de travail plutôt que de trancher d'après l'une ou l'autre source.

## Impact pour une équipe

Si vous êtes sur Teams ou Enterprise, tranchez cette semaine la question du propriétaire de la politique modèle. Ouvrez les contrôles d'administration et décidez explicitement si le routeur est actif, quels modes parmi Intelligence, Balance et Cost vos ingénieurs peuvent choisir, et quels modèles restent autorisés. Laisser ces trois points à leur valeur par défaut revient à confier le choix du modèle, requête par requête, à un classifieur entraîné sur un signal que vous ne pouvez pas inspecter. Épinglez ensuite vos travaux les plus sensibles, migrations et longues exécutions agentiques, sur un modèle nommé pendant un mois, puis comparez la part de ce code encore présente dans le dépôt avec celle d'une équipe routée. Cursor vous a donné la métrique de cette comparaison ; le chiffre, c'est à vous de le produire.
