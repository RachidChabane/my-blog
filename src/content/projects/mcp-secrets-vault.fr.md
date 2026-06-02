---
translationKey: 'mcp-secrets-vault'
lang: 'fr'
slug: 'coffre-secrets-mcp'
name: 'MCP Secrets Vault — Gestion de Secrets pour l''IA'
summary: 'Un serveur MCP publié sur npm qui permet aux assistants IA d''utiliser des secrets — clés d''API, tokens, identifiants — pour réaliser des actions autorisées sans jamais exposer les valeurs secrètes.'
stack:
  - 'TypeScript'
  - 'MCP SDK'
  - 'Zod'
  - 'Vitest'
  - 'GitHub Actions'
status: 'publié'
links:
  - label: 'npm'
    url: 'https://www.npmjs.com/package/mcp-secrets-vault'
publishState: 'published'
---

MCP Secrets Vault se place entre un assistant IA (Claude Desktop ou tout client compatible MCP) et le dépôt de secrets. Quand l'assistant doit appeler une API, il invoque un outil vault par son nom ; le serveur résout le secret depuis les variables d'environnement, l'injecte dans la requête et retourne uniquement la réponse assainie — la valeur brute du secret n'apparaît jamais dans le contexte du modèle. Le contrôle d'accès basé sur les politiques, la limitation de débit configurable et un journal d'audit sont intégrés. Le package est sous licence MIT, publié sur npm, et inclut des badges CI de couverture et une démonstration détaillée.
