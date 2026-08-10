---
translationKey: npm-supply-chain-payload-in-coding-agent-hooks
lang: fr
slug: voleur-identifiants-npm-cible-hooks-claude-code
title: Un voleur d'identifiants npm vise les hooks de Claude Code et le tasks.json
  de VS Code pour sa persistance
publishDate: 10-08-2026
kind: security
tags:
- npm
- Claude Code
- supply chain
- agents
- security
summary: Des versions malveillantes de keyv, flat-cache et file-entry-cache exécutent
  un voleur d'identifiants dès l'installation depuis le 4 août 2026, et la charge
  tente d'assurer sa persistance dans les hooks de Claude Code et le tasks.json de
  VS Code. À mon sens, cela la place hors de portée d'une réinstallation, et dans
  la configuration que votre dépôt commite.
sources:
- label: Wiz Research incident analysis
  url: https://www.wiz.io/blog/keyv-and-cacheable-npm-supply-chain-attack
  date: 04-08-2026
- label: Endor Labs independent tracking advisory
  url: https://www.endorlabs.com/learn/npm-malware-compromises-keyv-and-cacheable-with-500m-weekly-downloads-and-spreads-to-hundreds-of-packages
  date: 04-08-2026
contentHash: sha256:5261a08dd498ac86
publishState: published
---

## Ce qui change

Un script d'installation a tenté d'assurer sa persistance « via les hooks de Claude Code et le fichier tasks.json de VS Code » [s1]. Le 4 août 2026, des versions malveillantes de `keyv`, `flat-cache` et `file-entry-cache`, dont le cumul dépasse 500 millions de téléchargements hebdomadaires, ont commencé à exécuter un voleur d'identifiants à l'installation. Endor Labs indique que la charge a depuis été republiée dans des centaines d'autres paquets sous plusieurs comptes de mainteneurs [s2]. Elle vise les identifiants cloud, les secrets d'infrastructure et les fichiers de configuration liés à l'IA, et tente aussi de récolter les secrets des environnements CI/CD [s1]. Les données sortent par des dépôts GitHub créés sous des identités compromises, description par défaut « Shai-Hulud: Here We Go Again » [s1].

## Ce que le nettoyage laisse passer

Le vol est banal. L'intéressant, c'est où la charge s'installe : un hook est une commande que votre agent lance sur ses propres événements, et en écrire un procure une réexécution sans démon, sans shell, sans cron, et cela rend à mon sens incomplet le réflexe habituel, supprimer l'arborescence de dépendances et réinstaller propre. Il récure le répertoire d'entrée du paquet et laisse le fichier visé. Une configuration d'agent versionnée est pire : commitée, relue comme de la configuration, récupérée par l'équipe. Le deuxième saut emprunte git et non le registre, et les flux d'avis de sécurité que je suis ne surveillent pas cette route.

Trois commandes, sur le poste et sur la machine de build ; la troisième demande si votre organisation héberge déjà un dépôt d'exfiltration [s1] :

```sh
npm ls keyv flat-cache file-entry-cache
git log -p --all -- <votre-config-agent> '**/tasks.json'
gh search repos "Shai-Hulud: Here We Go Again" --owner <votre-organisation>
```

> [!IMPORTANT]
> L'ordre compte plus que la vitesse. Renouveler les identifiants alors qu'un fichier de hook survit injecte des secrets neufs dans une machine qui appelle encore l'extérieur : comparez les configurations avant de renouveler. Je n'ai vu aucune équipe tenir pour les hooks d'agent le journal d'audit qu'elle tient pour sa configuration CI.

## Impact pour une équipe

Je n'ai vu passer aucune version saine, et la charge a été republiée sous plusieurs comptes de mainteneurs [s2] : traitez cela comme un renouvellement d'identifiants plutôt que comme un épinglage. Renouvelez tout identifiant lisible par un script d'installation ou présent dans une configuration d'agent, postes et machines de build compris, jetons de CI en premier [s1]. Tranchez ensuite : la configuration d'agent de votre dépôt est-elle du code relu en revue, ou un fichier que n'importe quelle installation peut écrire ? Sur la plupart des dépôts que j'ai vus, c'est la seconde réponse : la seule partie de l'incident qui vous appartienne.
