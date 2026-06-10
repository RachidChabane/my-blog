---
translationKey: 'mcp-secrets-vault'
lang: 'fr'
slug: 'coffre-secrets-mcp'
name: 'MCP Secrets Vault: Gestion de Secrets pour l''IA'
summary: 'Un serveur MCP publié sur npm qui permet aux assistants IA d''utiliser des secrets (clés d''API, tokens, identifiants) pour réaliser des actions autorisées sans jamais exposer les valeurs secrètes.'
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
relatedArticles:
  - 'evaluating-tool-using-agents'
  - 'deterministic-agent-workflows'
publishState: 'published'
year: '2025'
highlights:
  - 'Se place entre un assistant IA (Claude Desktop ou tout client compatible MCP) et le dépôt de secrets, invoqué comme outil vault par son nom'
  - 'Résout le secret depuis les variables d''environnement, l''injecte dans la requête et retourne uniquement la réponse assainie'
  - 'La valeur brute du secret n''apparaît jamais dans le contexte du modèle'
  - 'Contrôle d''accès par politiques, limitation de débit configurable et journal d''audit intégrés'
metrics:
  - value: '3'
    label: 'contrôles intégrés'
  - value: 'MIT'
    label: 'licence'
  - value: 'npm'
    label: 'publié'
architecture:
  caption: 'Flux de requête, du client à la réponse assainie'
  layers:
    - label: 'Client'
      nodes:
        - 'Claude Desktop'
        - 'client compatible MCP'
    - label: 'Invocation d''outil'
      nodes:
        - 'outil vault par son nom'
    - label: 'Résolution du secret'
      nodes:
        - 'variables d''environnement'
        - 'injection dans la requête'
    - label: 'Contrôles'
      nodes:
        - 'contrôle d''accès par politiques'
        - 'limitation de débit configurable'
        - 'journal d''audit'
    - label: 'Réponse'
      nodes:
        - 'réponse assainie'
---

MCP Secrets Vault se place entre un assistant IA (Claude Desktop ou tout client compatible MCP) et le dépôt de secrets. Quand l'assistant doit appeler une API, il invoque un outil vault par son nom ; le serveur résout le secret depuis les variables d'environnement, l'injecte dans la requête et retourne uniquement la réponse assainie ; la valeur brute du secret n'apparaît jamais dans le contexte du modèle. Le contrôle d'accès basé sur les politiques, la limitation de débit configurable et un journal d'audit sont intégrés. Le package est sous licence MIT, publié sur npm, et inclut des badges CI de couverture et une démonstration détaillée.
