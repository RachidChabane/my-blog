---
translationKey: mcp-2026-07-28-stateless-revision
lang: fr
slug: revision-mcp-2026-07-28-sans-etat
title: 'MCP passe sans etat : la revision 2026-07-28 supprime le handshake'
publishDate: 22-06-2026
kind: spec-change
tags:
- mcp
- agents
- spec-change
- transport
- oss
summary: La revision MCP 2026-07-28, en release candidate depuis le 21 mai 2026, supprime
  les sessions et le handshake initialize et deplace tout l'etat protocolaire dans
  _meta a chaque requete.
sources:
- label: Model Context Protocol specification - draft Key Changes / changelog
  url: https://modelcontextprotocol.io/specification/draft/changelog
  date: 21-05-2026
- label: Model Context Protocol official blog - The 2026-07-28 MCP Specification Release
    Candidate
  url: https://blog.modelcontextprotocol.io/posts/2026-07-28-release-candidate/
  date: 21-05-2026
- label: GitHub - modelcontextprotocol/modelcontextprotocol Releases
  url: https://github.com/modelcontextprotocol/modelcontextprotocol/releases
  date: 29-05-2026
- label: 'Context Studios blog - MCP v2 Alpha: The July 28 Protocol Shift to Plan
    For'
  url: https://www.contextstudios.ai/blog/mcp-v2-alpha-the-july-28-protocol-shift-to-plan-for
  date: 14-06-2026
contentHash: sha256:473df3d9f7dfd0c2
publishState: published
---

## Ce qui change

Le Model Context Protocol publie sa revision `2026-07-28`, la prochaine version stable apres `2025-11-25`. La release candidate a ete publiee sur le blog officiel MCP le 21 mai 2026 et taguee sur GitHub comme pre-release `MCP 2026-07-28 RC` ; la specification finale est prevue pour le 28 juillet 2026. Le changement majeur rend le protocole sans etat : le handshake `initialize`/`notifications/initialized` et l'en-tete `Mcp-Session-Id` sont supprimes du transport Streamable HTTP (SEP-2575, SEP-2567). La version de protocole, l'identite et les capacites du client voyagent desormais dans `_meta` a chaque requete. Roots, Sampling et Logging sont formellement deprecies (SEP-2577) sous une nouvelle politique de cycle de vie prevoyant une fenetre de depreciation d'au moins douze mois (SEP-2596).

## Le schéma

L'etat de handshake par connexion disparait. Chaque requete porte maintenant le contexte qui n'etait echange qu'une fois a la connexion, via des cles `_meta` reservees (SEP-2575) :

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "search",
    "arguments": { "query": "factures T3" },
    "_meta": {
      "io.modelcontextprotocol/protocolVersion": "2026-07-28",
      "io.modelcontextprotocol/clientInfo": { "name": "acme-agent", "version": "1.4.0" },
      "io.modelcontextprotocol/clientCapabilities": {},
      "io.modelcontextprotocol/logLevel": "info"
    }
  }
}
```

Les appels inities par le serveur (`roots/list`, `sampling/createMessage`, `elicitation/create`) deviennent des Multi Round-Trip Requests : le serveur renvoie `InputRequiredResult` avec `resultType: "input_required"` et un champ `inputRequests` ; le client renvoie la requete d'origine avec `inputResponses` (SEP-2322). Tout resultat porte desormais un champ obligatoire `resultType` valant `"complete"` ou `"input_required"`.

## En pratique

Les nouveaux en-tetes obligatoires et le comportement en cas de version incompatible changent chaque POST. Envoyez `Mcp-Method` et `Mcp-Name` sur les requetes Streamable HTTP (SEP-2243) :

```bash
curl -X POST https://mcp.example.com/rpc \
  -H "Content-Type: application/json" \
  -H "Mcp-Method: tools/call" \
  -H "Mcp-Name: search" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/call",
       "params":{"name":"search","arguments":{"query":"x"},
       "_meta":{"io.modelcontextprotocol/protocolVersion":"2026-07-28"}}}'
# version incompatible -> UnsupportedProtocolVersionError
```

Les serveurs doivent implementer le nouveau RPC `server/discover` pour annoncer les versions et capacites prises en charge ; les clients peuvent l'appeler pour selectionner la version en amont.

## Impact pour une équipe

Si vous maintenez un serveur ou un client MCP, vous disposez d'environ dix semaines entre la RC et la version finale du 28 juillet 2026 pour valider. Le modele sans etat est une bonne nouvelle pour les serveurs HTTP a montee en charge horizontale : `Mcp-Session-Id` disparaissant, n'importe quelle replique peut traiter n'importe quelle requete et `tools/list` ne varie plus par connexion, ce qui rend les listes cacheables via la nouvelle interface `CacheableResult` (`ttlMs`, `cacheScope`, SEP-2549).

> [!IMPORTANT]
> Si vous dependez de Roots, Sampling ou Logging, planifiez les migrations des maintenant : passez les repertoires via les parametres d'outil au lieu de Roots, appelez directement votre fournisseur LLM au lieu de Sampling, et journalisez vers stderr ou OpenTelemetry au lieu de Logging. Une fenetre de depreciation d'au moins douze mois s'applique. La reprise des flux SSE (`Last-Event-ID`) est aussi supprimee : un flux rompu doit etre reemis avec un nouvel identifiant de requete plutot que rejoue.
