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
contentHash: sha256:ed39b419edacf5ea
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

## L'aller-retour

Les appels inities par le serveur (`roots/list`, `sampling/createMessage`, `elicitation/create`) deviennent des Multi Round-Trip Requests : au lieu d'emettre une requete separee, le serveur repond a l'appel du client par `input_required`, et le client renvoie en portant la reponse. Sans etat, un appel d'outil logique devient une suite d'allers-retours autonomes, chaque message portant son propre `_meta` (SEP-2322). Tout resultat declare un `resultType` obligatoire valant `"complete"` ou `"input_required"`.

<figure class="rc-diagram">
<svg viewBox="0 0 660 296" role="img" aria-label="Diagramme de sequence : un appel d'outil MCP sans etat qui necessite une entree cote serveur prend plusieurs allers-retours. Le client envoie tools/call avec _meta ; le serveur repond result input_required avec inputRequests ; le client renvoie avec inputResponses ; le serveur repond result complete.">
<rect x="58" y="10" width="124" height="34" rx="8" style="fill: var(--surface); stroke: var(--border)"></rect>
<text x="120" y="32" text-anchor="middle" style="fill: var(--fg); font-family: var(--font-mono); font-size: 13px">Client</text>
<rect x="478" y="10" width="124" height="34" rx="8" style="fill: var(--surface); stroke: var(--border)"></rect>
<text x="540" y="32" text-anchor="middle" style="fill: var(--fg); font-family: var(--font-mono); font-size: 13px">Serveur</text>
<line x1="120" y1="46" x2="120" y2="288" style="stroke: var(--border-subtle)" stroke-dasharray="3 4"></line>
<line x1="540" y1="46" x2="540" y2="288" style="stroke: var(--border-subtle)" stroke-dasharray="3 4"></line>
<text x="330" y="80" text-anchor="middle" style="fill: var(--fg-muted); font-family: var(--font-mono); font-size: 12px">tools/call + _meta</text>
<line x1="120" y1="90" x2="532" y2="90" style="stroke: var(--accent)" stroke-width="1.5"></line>
<polygon points="532,85 543,90 532,95" style="fill: var(--accent)"></polygon>
<text x="330" y="130" text-anchor="middle" style="fill: var(--fg-muted); font-family: var(--font-mono); font-size: 12px">result: input_required + inputRequests</text>
<line x1="540" y1="140" x2="128" y2="140" style="stroke: var(--accent)" stroke-width="1.5" stroke-dasharray="5 4"></line>
<polygon points="128,135 117,140 128,145" style="fill: var(--accent)"></polygon>
<text x="330" y="190" text-anchor="middle" style="fill: var(--fg-muted); font-family: var(--font-mono); font-size: 12px">renvoi + inputResponses</text>
<line x1="120" y1="200" x2="532" y2="200" style="stroke: var(--accent)" stroke-width="1.5"></line>
<polygon points="532,195 543,200 532,205" style="fill: var(--accent)"></polygon>
<text x="330" y="240" text-anchor="middle" style="fill: var(--fg-muted); font-family: var(--font-mono); font-size: 12px">result: complete</text>
<line x1="540" y1="250" x2="128" y2="250" style="stroke: var(--accent)" stroke-width="1.5" stroke-dasharray="5 4"></line>
<polygon points="128,245 117,250 128,255" style="fill: var(--accent)"></polygon>
</svg>
<figcaption>Un appel d'outil sans etat qui necessite une entree cote serveur : des allers-retours repetes, chaque message autonome. Pas de session, pas de handshake a reprendre.</figcaption>
</figure>

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
