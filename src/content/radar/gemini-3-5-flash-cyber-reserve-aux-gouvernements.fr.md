---
translationKey: gemini-3-5-flash-cyber-restricted-access
lang: fr
slug: gemini-3-5-flash-cyber-reserve-aux-gouvernements
title: Le meilleur détecteur de failles V8 de Google est un modèle inaccessible aux
  développeurs
publishDate: 22-07-2026
kind: release
tags:
- Gemini
- CodeMender
- security
- agents
- evals
summary: 'Gemini 3.5 Flash Cyber a remonté 55 problèmes uniques confirmés sur le moteur
  V8, contre 47 pour sa version courante et 36 pour Claude Opus 4.6, avant d''être
  réservé aux gouvernements et partenaires de confiance via CodeMender. L''écart décisif
  est 55 contre 47: la barrière tient à la recette d''entraînement, pas aux poids.'
sources:
- label: Google DeepMind - Introducing Gemini 3.5 Flash Cyber
  url: https://deepmind.google/blog/introducing-gemini-3-5-flash-cyber/
  date: 21-07-2026
- label: The Hacker News - Google Launches Gemini 3.5 Flash Cyber AI to Find and Fix
    Software Vulnerabilities
  url: https://thehackernews.com/2026/07/google-launches-gemini-35-flash-cyber.html
  date: 21-07-2026
- label: Gemini API pricing documentation
  url: https://ai.google.dev/gemini-api/docs/pricing
  date: 22-07-2026
contentHash: sha256:2afcb12e27512517
publishState: published
---

## Ce qui change

Google DeepMind a présenté Gemini 3.5 Flash Cyber le 21 juillet 2026, a publié ses mesures, puis a renoncé à le vendre. Sur le moteur JavaScript V8, ce modèle spécialisé a remonté 55 problèmes uniques confirmés, contre 47 pour Gemini 3.5 Flash en version courante et 36 pour Claude Opus 4.6, dont 10 que les deux autres avaient manqués [s1][s2]. Tout passe par CodeMender, l'agent de découverte et de correction de vulnérabilités dévoilé en octobre 2025 [s2], et seulement pour des « gouvernements et partenaires de confiance », dans un « programme pilote à accès limité » [s1]. Google assume le motif: « la nature à double usage de cette technologie » impose « une approche intentionnelle » de son déploiement [s1].

| Modèle | Problèmes uniques confirmés sur V8 |
| :--- | ---: |
| Gemini 3.5 Flash Cyber | 55 [s1][s2] |
| Gemini 3.5 Flash (version courante) | 47 [s1][s2] |
| Claude Opus 4.6 | 36 [s1][s2] |

## Ce que le benchmark dit vraiment

C'est la ligne du milieu qui compte. 55 contre 47, c'est un modèle face à lui-même: même base, même cible, un post-entraînement d'écart. À mon avis, c'est là le vrai résultat, bien plus que le scalp du modèle frontière, et il fragilise la clôture. Les découvertes supplémentaires viennent d'une recette d'entraînement et d'un harnais d'évaluation; or une recette ne s'enferme pas dans un datacentre. Restreindre la distribution fait gagner du temps, pas de la sécurité.

L'objection la plus solide est architecturale plutôt que contractuelle: comme le modèle ne tourne qu'à l'intérieur de CodeMender, les garde-fous activent ses fonctions défensives et désactivent le reste des activités cyber à la frontière de l'agent [s2]. Le procédé vaut mieux qu'une consigne rangée dans un prompt système, et je l'adopterais tel quel. Il protège ces poids-là. En revanche, il ne protège pas la capacité, qui vit dans une chaîne d'entraînement qu'une équipe bien financée sait reconstruire.

L'asymétrie retombe sur les défenseurs. Wiz et Cloud CISO Security Engineering testent depuis l'intérieur du pilote [s1] et disposent du relevé des 55 problèmes sur V8. Les autres auditent le même code ouvert avec 47 et 36.

> [!IMPORTANT]
> Vérification du 22 juillet 2026: la documentation tarifaire de l'API Gemini ne comporte aucune entrée Flash Cyber, aucun identifiant public de modèle et aucun prix, et aucune liste d'attente n'est ouverte aux développeurs [s3]. Cette page appartient à Google: elle sert de contrôle de fraîcheur sur la disponibilité, pas de confirmation indépendante des mesures, que seule [s2] corrobore.

## Impact pour une équipe

Construisez le harnais, pas la liste des modèles auxquels vous espérez accéder. L'écart entre 55 et 47 est la mesure utile, parce qu'il chiffre la part qui vous revient: ce qu'un post-entraînement spécialisé et une boucle de validation apportent face à un modèle de base, sur votre code. Partez d'un modèle appelable. La grille tarifaire de l'API Gemini affiche `gemini-3.5-flash` et `gemini-3.6-flash` à 1.50 dollar par million de tokens d'entrée [s3], et la ligne « version courante » du tableau, c'est les 47. Lancez-le sur un dépôt dont vous connaissez les défauts, ne gardez que ce qu'un reproducteur confirme, et comptez les problèmes confirmés plutôt que le volume produit. Ce décompte devient votre référence, et les chiffres de Google disent qu'il est déplaçable.
