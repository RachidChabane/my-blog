---
translationKey: agents-api-self-hosted-sandbox-ownership
lang: fr
slug: openai-agents-api-bac-a-sable-auto-heberge
title: L'Agents API d'OpenAI fait tourner son harnais contre un bac à sable qui est
  le vôtre
publishDate: 11-09-2026
kind: release
tags:
- OpenAI
- Agents API
- E2B
- agents
- sandboxes
summary: 'OpenAI a publié l''Agents API en beta publique le 10 septembre 2026, et
  la configuration de session accepte `type: "self_hosted"` avec votre propre `workspace_directory`
  [s1][s3]. Le partage inverse le marché habituel : OpenAI garde l''orchestration,
  la compaction et la reprise, vous gardez la machine où le code s''exécute [s2][s3].'
sources:
- label: OpenAI Agents API overview guide
  url: https://developers.openai.com/api/docs/guides/agents-api/overview.md
  date: 10-09-2026
- label: E2B, agent workbench on the Agents API
  url: https://e2b.dev/resources/build-an-agent-workbench-on-openais-agents-api
  date: 10-09-2026
- label: OpenAI developer changelog, Sep 10 Agents API public beta entry
  url: https://developers.openai.com/api/docs/changelog
  date: 10-09-2026
contentHash: sha256:7d2b3887bc220004
publishState: published
---

## Ce qui change

OpenAI a publié l'Agents API en beta publique le 10 septembre 2026 : un harnais Codex géré, où OpenAI prend en charge l'orchestration de session, la compaction du contexte et la reprise [s3]. La même entrée pose le choix : un bac à sable hébergé par OpenAI, ou un bac rattaché depuis votre propre infrastructure [s3]. Dans la configuration de session, ce choix tient en un champ : `environment`, `type: "self_hosted"`, votre propre `workspace_directory` [s1]. E2B, un fournisseur de bacs à sable auquel l'Agents API se connecte, formule le partage dans ses propres termes : OpenAI possède le modèle, le harnais et le cycle de vie de la session, E2B l'endroit où le code de l'agent s'exécute [s2].

## La moitié qui vous reste est la moitié coûteuse

Ce partage inverse le marché habituel de l'agent hébergé. D'ordinaire, le fournisseur loue le bac à sable et vous gardez la boucle, portable vers un autre modèle au trimestre suivant. L'Agents API vous laisse l'autre moitié. OpenAI garde l'orchestration, la compaction et la reprise [s3], la part peu coûteuse à écrire et coûteuse à subir une fois enfermé. Vous gardez la machine où le code s'exécute, simple à raisonner et coûteuse à exploiter. Or c'est cet étage qui porte la facture réelle : images de base, politique de sortie réseau, injection de secrets, et le nettoyage que personne n'écrit avant la première fuite de conteneur.

```js
environment: {
  type: "self_hosted",
  workspace_directory: "/workspace",
  capability_directories: ["/workspace/capabilities/skills"],
}
```

`capability_directories` est la ligne que je regarderais longuement [s1]. L'agent charge ses capacités depuis un chemin de votre système de fichiers : l'auto-hébergement vous transfère donc aussi cette chaîne d'approvisionnement. Tant mieux si vous relisez déjà ce répertoire. Faille inédite si c'est un montage scripté l'an dernier.

> [!IMPORTANT]
> Auto-hébergé ne veut pas dire auto-gouverné. L'orchestration de session, la compaction du contexte et la reprise restent du côté d'OpenAI [s3], et la surface s'appelle toujours `client.beta.agents` [s1].

## Impact pour une équipe

La vraie question est de savoir si vous exploitez déjà un étage bac à sable. Si oui, images, politique réseau, nettoyage, alors `type: "self_hosted"` [s1] coûte un bloc de configuration et vous rend une frontière auditable. Sinon, le bac à sable hébergé reste la valeur par défaut honnête : adopter `self_hosted` pour satisfaire une politique que personne n'a écrite transforme un champ de configuration en nouvelle astreinte. La beta est publique sous `client.beta.agents` [s1] : épinglez l'espace de noms et attendez-vous à des ruptures. Et si vous prenez `self_hosted`, mettez `capability_directories` dans votre file de revue ce trimestre [s1] : un chemin de code vers votre agent qu'aucune barrière côté OpenAI ne couvre.
