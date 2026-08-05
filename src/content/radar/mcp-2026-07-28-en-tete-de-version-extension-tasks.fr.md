---
translationKey: mcp-2026-07-28-version-header-tasks-extension
lang: fr
slug: mcp-2026-07-28-en-tete-de-version-extension-tasks
title: MCP 2026-07-28 négocie le protocole dans un en-tête de requête, et la passerelle
  d'AWS répond en 2025-03-26 sans cet en-tête
publishDate: 05-08-2026
kind: spec-change
tags:
- MCP
- AWS AgentCore Gateway
- agents
summary: 'La révision MCP 2026-07-28 publiée déplace Tasks dans l''extension io.modelcontextprotocol/tasks
  et négocie le protocole requête par requête via un en-tête Mcp-Protocol-Version.
  Sur la passerelle AgentCore Gateway d''AWS, sans cet en-tête vous n''êtes pas rejeté
  : vous êtes servi en 2025-03-26.'
sources:
- label: Model Context Protocol maintainers, specification release post
  url: https://blog.modelcontextprotocol.io/posts/2026-07-28/
  date: 28-07-2026
- label: AWS Machine Learning Blog, AgentCore Gateway implementation
  url: https://aws.amazon.com/blogs/machine-learning/how-agentcore-gateway-supports-the-mcp-2026-07-28-spec/
  date: 28-07-2026
contentHash: sha256:f42bd38363ceefec
publishState: published
---

## Ce qui change

Annoncée le 28 juillet 2026, la révision MCP `2026-07-28` tranche ce que sa release candidate laissait ouvert, et sa réponse la plus discrète m'a surpris. Tasks quitte le noyau expérimental pour l'extension `io.modelcontextprotocol/tasks`, avec un `tasks/get` par scrutation et un nouveau `tasks/update` (SEP-2663) [s1]. Les notifications de changement quittent l'ancien point d'entrée HTTP GET pour un flux unique `subscriptions/listen`, auquel le client s'abonne type par type [s1]. Quant à la version du protocole, elle voyage désormais dans un en-tête : chaque requête porte `Mcp-Protocol-Version` [s2].

## L'en-tête décide du protocole servi

En couvrant la release candidate, je supposais qu'un désaccord de version se signalerait toujours. Sur la passerelle d'AWS, un cas reste muet. AWS décrit le comportement de sa passerelle AgentCore Gateway face à cet en-tête [s2] :

| Requête | Comportement de la passerelle |
| :--- | :--- |
| Version présente dans `supportedVersions` | Requête servie dans cette version |
| Version non prise en charge | HTTP 400, code -32022, et la liste des versions |
| Aucun en-tête | Repli sur `2025-03-26` |

Deux lignes font du bruit. La troisième coûte une journée : le client qui oublie l'en-tête n'y obtient pas d'erreur, mais une connexion fonctionnelle vers une révision vieille de seize mois, où ses capacités manquent en silence.

> [!IMPORTANT]
> Un rejet de la passerelle coûte peu : le 400 renvoie la liste qu'il fallait envoyer [s2]. Un en-tête absent coûte cher, car rien n'échoue à la connexion et le premier symptôme est un appel d'outil se comportant comme une ancienne révision. Journalisez l'en-tête émis, et alertez sur tout pair répondant en `2025-03-26` [s2].

## Tasks devient une surface à demander

Une extension se négocie, elle ne se suppose pas. Les traitements longs bâtis sur les primitives du noyau dépendent du pair qui implémente `io.modelcontextprotocol/tasks` [s1], et `tasks/update` est une API que vous n'avez jamais appelée [s1]. Côté notifications, le mouvement inverse : un flux `subscriptions/listen` unique avec abonnement par type [s1] pèse moins qu'un point d'entrée à scruter.

## Impact pour une équipe

Si vous publiez un client MCP, émettez `Mcp-Protocol-Version` sur chaque requête dès cette semaine et verrouillez-le par un test, car la panne évitée est silencieuse [s2]. Si vous publiez un serveur, renvoyez les versions acceptées lors du rejet plutôt qu'un 400 sec, comme le fait cette passerelle [s2]. Sur Tasks, je ne migrerais pas encore : attendez que vos pairs annoncent l'extension, puis adoptez `tasks/get` avant `tasks/update` [s1]. Le déplacement des notifications est la pièce à faire tout de suite, car `subscriptions/listen` remplace du code de scrutation que vous maintenez déjà [s1].
