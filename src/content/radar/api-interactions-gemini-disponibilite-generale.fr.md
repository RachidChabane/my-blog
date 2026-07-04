---
translationKey: gemini-interactions-api-ga
lang: fr
slug: api-interactions-gemini-disponibilite-generale
title: L'API Interactions de Gemini passe en disponibilité générale et devient le
  choix par défaut
publishDate: 04-07-2026
kind: release
tags:
- Gemini
- Google
- agents
- API
summary: Le 2026-06-22, Google a fait passer son API Interactions en disponibilité
  générale et en a fait la voie principale, par défaut, pour construire sur les modèles
  et les agents Gemini ; l'API generateContent reste prise en charge, mais les nouvelles
  capacités agentiques devraient atterrir exclusivement sur l'API Interactions.
sources:
- label: Google blog - Interactions API general availability
  url: https://blog.google/innovation-and-ai/technology/developers-tools/interactions-api-general-availability/
  date: 22-06-2026
- label: DEV Community - Google makes the Interactions API the default way to build
    with Gemini agents
  url: https://dev.to/damogallagher/google-makes-interactions-api-the-default-way-to-build-with-gemini-agents-4dnm
  date: 22-06-2026
contentHash: sha256:35131d8a68ea0b0c
publishState: published
---

## Ce qui change

Google a annoncé le 2026-06-22 que son API Interactions atteint la disponibilité générale et devient désormais la voie principale pour construire sur les modèles et les agents Gemini [s1][s2]. La documentation la retient par défaut et Google la recommande pour tout nouveau projet [s1]. L'ancienne API generateContent, elle, ne disparaît pas : elle reste pleinement prise en charge et continuera de recevoir les nouveaux modèles Gemini grand public dans un avenir prévisible [s1]. Le point sensible tient en une phrase : Google s'attend à ce que les capacités de pointe pour les modèles longue durée et les agents arrivent de plus en plus exclusivement sur l'API Interactions [s1]. Elle est proposée via les SDK Python et JavaScript [s1], et serait en bêta publique depuis décembre 2025.

## Un défaut, pas une échéance

À bien lire, il s'agit d'un choix par défaut, pas d'une échéance. Rien ne vous oblige à tout réécrire cette semaine : generateContent n'a aucune date de fin annoncée et reçoit toujours les modèles grand public. Ce qui bouge, c'est la surface vers laquelle chaque nouvelle intégration est orientée, et la direction que prend la feuille de route des agents. La vraie décision porte donc sur le point de départ. Commencez sur generateContent et, comme le formule l'article de DEV Community, vous risquez de bâtir sur la voie qui recevra les nouvelles fonctions d'agent « plus tard, ou jamais » [s2]. Commencez sur l'API Interactions et vous adoptez dès aujourd'hui une nouvelle forme de requête : Google ne décrit ce changement que comme un passage « des rôles aux étapes » [s1], la surface qu'elle désigne pour les Managed Agents, l'exécution en arrière-plan, la combinaison d'outils intégrés et de fonctions personnalisées, et Deep Research [s1].

> [!IMPORTANT]
> generateContent n'est ni déprécié ni voué à disparaître. Voyez cette disponibilité générale comme un déplacement de la surface par défaut, non comme une migration forcée.

## Impact pour une équipe

Si vous câblez une nouvelle intégration Gemini cette semaine, partez sur l'API Interactions pour vous placer sur la voie où doivent atterrir les capacités longue durée et agentiques [s1]. Si votre code tourne déjà sur generateContent, pas de précipitation : il n'y a pas d'échéance et il reçoit encore les modèles grand public [s1]. Prévoyez plutôt la nouvelle forme de requête par étapes et le changement de SDK pour la prochaine fois que vous aurez besoin des Managed Agents, de l'exécution en arrière-plan ou de Deep Research [s1]. Traitez ce coût de schéma et de SDK comme le vrai travail à planifier, et surveillez la formule « de plus en plus exclusivement » comme le signal, car Google énonce une direction, pas une date butoir [s1][s2].
