---
translationKey: microsoft-foundry-hosted-agents
lang: fr
slug: microsoft-foundry-hosted-agents-runtime-execution-agents
title: 'Foundry Hosted Agents : un runtime managé et agnostique du framework pour
  vos agents en production (preview, GA fin juin 2026)'
publishDate: 29-06-2026
kind: tool
tags:
- Microsoft Foundry
- Azure
- agents
- deployment
summary: Les Hosted Agents de Microsoft Foundry forment un runtime managé et agnostique
  du framework pour votre propre code d'agent, appelable dès aujourd'hui en preview
  publique sur 20 régions Azure, GA visée pour fin juin 2026, pas encore livrée.
sources:
- label: Microsoft Foundry blog - What's New in Hosted Agents in Foundry Agent Service
  url: https://devblogs.microsoft.com/foundry/hosted-agents-build26/
  date: 02-06-2026
- label: Microsoft Learn - Hosted agents in Foundry Agent Service
  url: https://learn.microsoft.com/en-us/azure/foundry/agents/concepts/hosted-agents
  date: 25-06-2026
- label: InfoQ - Microsoft Foundry Adds Runtime, Tooling, and Governance for Production
    Agents
  url: https://www.infoq.com/news/2026/06/microsoft-foundry-agents/
  date: 09-06-2026
contentHash: sha256:1738bb6aa025966b
publishState: published
---

## Ce qui change

Le développement agent adoptable de ce cycle est un runtime, pas un modèle. Pendant que GPT-5.6 reste en preview limitée à une vingtaine de partenaires et que Gemini 3.5 Pro demeure en accès restreint, les Hosted Agents de Microsoft Foundry (Foundry Agent Service) forment un runtime managé et agnostique du framework : ils exécutent votre propre code d'agent, quel que soit le framework, sur l'infrastructure Microsoft [s1][s2]. Il est appelable dès aujourd'hui en preview publique sur 20 régions Azure, et Microsoft vise la disponibilité générale (GA) pour fin juin 2026 [s1] ; la page de concept Microsoft Learn, mise à jour le 25-06-2026, le qualifie toujours de « currently in preview » [s2] : le cadrage honnête est donc preview maintenant, pas GA livrée. Le fait central est à double source : documentation Microsoft et article indépendant d'InfoQ décrivent des sessions sandboxées managées, avec état et accès au système de fichiers, plusieurs frameworks, et une API Responses avec état doublée d'un protocole Invocations plus léger [s2][s3].

## La couche runtime

À mon sens, la pile agent se scinde en trois couches - le modèle, le framework et le runtime - et le runtime (là où l'agent s'exécute réellement : isolation, identité, état persisté, montée en charge) devient un produit que l'on loue plutôt qu'on assemble à la main. La substance technique suit. Chaque session tourne dans son propre sandbox isolé au niveau VM ou hyperviseur, doté d'un `$HOME` persistant, ce qui autorise le scale-to-zero avec reprise d'état [s1][s2]. Chaque agent déployé reçoit son propre Microsoft Entra ID (identité d'agent) et un endpoint dédié au déploiement [s1][s2]. Et le déploiement part du source, sans conteneur à construire soi-même [s2] :

```bash
# Déploie le source de l'agent directement (aucun empaquetage de conteneur requis)
azd deploy
# Chaque agent déployé reçoit automatiquement un Microsoft Entra ID (identité d'agent)
# et un endpoint dédié au moment du déploiement.
# Protocoles exposés : Responses (compatible OpenAI, /responses), Invocations (JSON).
```

## Les limites opérationnelles

Chiffres documentés par Microsoft seul (docs Learn), non corroborés de façon indépendante ; à prendre comme point de départ, à vérifier sous votre propre charge.

| Limite ou paramètre | Valeur documentée |
| :--- | :--- |
| Délai d'inactivité | 15 minutes [s2] |
| Durée de vie de session | supprimée après 30 jours d'inactivité [s2] |
| Quota par défaut | 50 sessions actives simultanées par abonnement et par région [s2] |
| Tailles de sandbox | 0,5/1/2 vCPU (1/2/4 Gio) [s2] |
| Disque par session | jusqu'à 20 Gio (~20% réservés au système) [s2] |

> [!IMPORTANT]
> La facturation se fait par session active, sur le CPU et la mémoire combinés ; la documentation prévient donc qu'un surdimensionnement multiplie le coût à proportion de vos sessions simultanées [s2]. Le runtime est commode, mais le bon dimensionnement du sandbox est désormais votre responsabilité, pas celle de la plateforme.

## Impact pour une équipe

Si vous assemblez aujourd'hui votre propre hébergement d'agents (isolation, identité, état, montée en charge), c'est cette couche que le service remplace, et contrairement aux modèles sous accès restreint de ce cycle, il est appelable maintenant : il mérite un essai ciblé. Le piège tient à l'endroit où se déplace le verrouillage. Le code reste réellement agnostique du framework (Agent Framework, LangGraph, Semantic Kernel ou du code Python/C# maison), mais le runtime et l'identité sont arrimés à Azure et à Microsoft Entra : le verrou passe de votre code à votre runtime et à votre IAM. C'est là la vraie décision d'architecture, pas la démo. Deux points à surveiller avant tout déploiement : c'est une preview, dont la GA n'est visée que pour fin juin 2026, donc n'y adossez pas de SLA de production ; et comme la facturation est par session, on dimensionne les sandbox d'abord, pas après.
