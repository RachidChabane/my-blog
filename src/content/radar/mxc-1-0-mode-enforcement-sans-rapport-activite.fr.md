---
translationKey: mxc-1-0-enforcement-mode-writes-no-activity-report
lang: fr
slug: mxc-1-0-mode-enforcement-sans-rapport-activite
title: Microsoft Execution Containers passe en disponibilité générale, et son mode
  Enforcement applique la politique sans rapport d'activité
publishDate: 10-10-2026
kind: release
tags:
- Microsoft
- MXC
- Windows
- agents
- sandboxes
summary: Microsoft a fait passer Microsoft Execution Containers (MXC) en disponibilité
  générale le 7 octobre 2026, avec MXC SDK v1.0.0 pour Rust, .NET et Node.js. Dans
  le tableau des modes de Microsoft, Enforcement ne produit aucun rapport d'activité,
  et seuls les conteneurs de processus MXC sous Windows peuvent en produire un. J'écrirais
  la politique en mode Learning dans un conteneur de processus Windows, je conserverais
  le rapport JSON, puis je basculerais en Enforcement.
sources:
- label: 'Windows Developer Blog, "Microsoft Execution Containers: Policy-driven containment
    for AI agents"'
  url: https://blogs.windows.com/windowsdeveloper/2026/10/07/microsoft-execution-containers-policy-driven-containment-for-ai-agents/
  date: 07-10-2026
- label: GitHub, microsoft/mxc release "MXC SDK v1.0.0"
  url: https://github.com/microsoft/mxc/releases/tag/v1.0.0
  date: 07-10-2026
- label: Rajesh Beri, "Microsoft's MXC Agent Containers Ship Before Intune Can Manage
    Them"
  url: https://www.beri.net/article/microsoft-execution-containers-mxc-ga-windows-11-agent-sandbox-intune-entra-agent-365-coming-soon
  date: 07-10-2026
- label: WindowsForum, "Microsoft Execution Containers v1.0 Goes GA"
  url: https://windowsforum.com/news/microsoft-execution-containers-v1-0-goes-ga-windows-11-updates-isolation-modes-and-agent-security.447534/
  date: 07-10-2026
contentHash: sha256:f5e626d4fa711f91
publishState: published
---

## Ce qui change

Le 7 octobre 2026, Microsoft a fait passer Microsoft Execution Containers (MXC) en disponibilité générale [s1]. MXC SDK v1.0.0 est la première version stable du SDK pour Rust, .NET et Node.js, avec `mxc_sdk::v1`, `Microsoft.Mxc.Sdk.V1` et `@microsoft/mxc-sdk/v1` comme points d'entrée [s2][s4]. Le développeur déclare les ressources dont une charge de travail a besoin, comme les fichiers et les destinations réseau, et Microsoft indique que MXC fait correspondre les contrôles demandés aux backends retenus sous Windows, macOS ou Linux [s1].

## Écrire la politique

Je pense que la politique est la partie portable de MXC, et que la matière pour l'écrire n'existe que sous Windows. Le tableau des modes publié par Microsoft [s1] :

| Mode | Accès non accordé | Rapport d'activité | Usage prévu |
| :--- | :--- | :--- | :--- |
| Enforcement | Bloqué | Non | Exécuter la charge de travail avec sa politique de production |
| Learning | Bloqué et enregistré | Oui | Diagnostiquer les échecs et vérifier que la politique n'accorde que l'accès nécessaire |
| Permissive | Autorisé et enregistré | Oui | Observer l'activité de l'agent sans appliquer la politique |

Learning consigne chaque opération bloquée dans un rapport d'activité JSON, et seuls les conteneurs de processus MXC sous Windows peuvent produire un rapport d'activité d'agent [s1]. J'aborde donc l'écriture de la politique comme une étape à planifier : lancer un nouvel agent en mode Learning dans un conteneur de processus Windows, conserver le rapport d'activité JSON comme trace de ce que la politique accorde, puis basculer en Enforcement.

Le meilleur argument pour Permissive : Learning bloque tout accès non accordé, alors que Permissive l'autorise et l'enregistre [s1]. J'en déduis qu'un essai en Learning s'arrête à la première autorisation manquante, là où un essai en Permissive va jusqu'au bout. Je pense que ce compromis ne tient pas pour les charges de travail que Microsoft place dans des conteneurs de processus, dont le code généré par le modèle et l'exécution d'outils [s1]. Sous Permissive, ce code obtient pendant l'essai chaque accès non accordé qu'il demande. Une exécution cassée coûte une autorisation de plus.

> [!IMPORTANT]
> Rajesh Beri cite le README du dépôt : l'option `--audit` de l'exécuteur « turns off all sandbox security for the workload being analyzed » [s3]. Pour un essai, préférez le mode Learning.

## Impact pour une équipe

Beri relève que, tant que Microsoft n'a pas livré ses contrôles Intune, c'est le développeur de l'agent qui écrit la frontière [s3]. Ma recommandation : prévoyez une exécution en mode Learning par nouvel agent, et relisez son rapport à côté de la politique. Sous macOS ou Linux, je m'attendrais à relire la politique ligne à ligne, sans rapport pour la vérifier.

Dans le code antérieur à la 1.0, il faut remplacer les anciens types de requête et de cycle de vie du sandbox par `ContainerRequest`, `ProvisionRequest`, `ExecutionRequest`, `ContainerId` et les options propres à chaque opération [s2][s4]. V1 est la limite de compatibilité stable de la ligne 1.x, et MXC suivra semver 2.0 [s2] ; j'y vois donc la dernière réécriture avant une 2.0.
