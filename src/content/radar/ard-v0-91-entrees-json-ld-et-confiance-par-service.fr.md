---
translationKey: ard-v0-91-json-ld-entries-and-per-service-trust
lang: fr
slug: ard-v0-91-entrees-json-ld-et-confiance-par-service
title: ARD v0.91 normalise la description des ressources agentiques et laisse la confiance
  à chaque service
publishDate: 06-09-2026
kind: spec-change
tags:
- ARD
- JSON-LD
- MCP
- agents
- specs
summary: 'La spécification Agentic Resource Discovery est passée en v0.91 le 26 août
  2026 et affiche toujours Status: Proposal [s1]. Une entrée y devient un nœud JSON-LD
  doté d''une jointure @context [s1], tandis que chaque service de découverte garde
  ses propres règles sur ce qu''il retourne et sur les sources auxquelles il fait
  confiance [s2].'
sources:
- label: Agentic Resource Discovery Specification v0.91
  url: https://agenticresourcediscovery.org/spec/
  date: 26-08-2026
- label: The New Stack report on the ARD specification
  url: https://thenewstack.io/ard-agent-discovery-specification/
  date: 31-08-2026
contentHash: sha256:82feb4e5a1bad467
publishState: published
---

## Ce qui change

La spécification Agentic Resource Discovery est passée en v0.91 le 26 août 2026, et elle affiche toujours `Status: Proposal` [s1]. Cette version reformule la couche de description en termes de JSON-LD et d'espaces de noms : une entrée est un nœud JSON-LD dont les termes proviennent d'un espace de noms par défaut, sauf déclaration contraire, et les manifestes existants restent valides tels quels [s1]. S'y ajoute une jointure `@context` : une entrée PEUT puiser des termes dans d'autres espaces de noms sans modifier la spécification [s1]. The New Stack décrit le versant requête : une interface REST dont l'endpoint obligatoire `POST /search` cherche par tâche, plus des endpoints optionnels pour parcourir les ressources disponibles [s2].

## Ce que la spécification laisse ouvert, volontairement

La moitié intéressante, c'est ce que personne n'a normalisé. La spécification laisse ouverts les espaces de noms reconnus au-delà du défaut et s'attend à ce que cet ensemble s'étoffe [s1] ; chaque service de découverte fixe ses propres règles sur ce qu'il retourne et sur les sources auxquelles il fait confiance [s2]. La conformité couvre l'enveloppe et l'endpoint de recherche, et s'arrête là où commence l'utile : la pertinence et la confiance. Deux services conformes peuvent répondre à une même requête par tâche avec des ressources différentes, et tous deux ont raison. The New Stack juge la comparaison DNS insuffisante pour cette raison [s2]. J'irais plus loin : cette divergence est voulue et sans plafond, puisque la jointure de vocabulaire et la politique de confiance sont laissées aux participants. On n'intègre donc pas un protocole ici. On intègre un service de découverte, et c'est son classement qui devient la dépendance.

> [!IMPORTANT]
> `Status: Proposal` en v0.91, voilà la réserve [s1]. La couche de description est peu coûteuse à suivre, puisque les manifestes existants restent valides [s1] ; `POST /search` et les endpoints de parcours optionnels sont exactement ce qu'une proposition reste libre de déplacer [s2].

## Impact pour une équipe

Si vous publiez des outils MCP ou des agents A2A [s1], un geste est peu coûteux aujourd'hui, l'autre non. Peu coûteux : vérifier que votre manifeste se lit comme un nœud JSON-LD sous l'espace de noms par défaut, puisque v0.91 garde les manifestes existants valides tels quels [s1]. Coûteux : écrire un client contre `POST /search` [s2] alors que le document indique encore Proposal [s1]. J'attendrais. La question de politique interne, elle, n'attendra pas, et elle vous revient quel que soit le protocole : quand une recherche remonte plusieurs ressources capables, qui choisit celle que votre agent appelle ? Si la réponse est le service de découverte, nommez dès maintenant ce service et ce à quoi il fait confiance, avant que cela devienne un défaut d'exécution que personne n'a choisi.
