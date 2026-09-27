---
translationKey: telemetry-off-forks-coding-agent-behaviour
lang: fr
slug: la-telemetrie-est-un-reglage-de-comportement
title: La télémétrie de votre agent de code est un réglage de comportement
publishDate: 27-09-2026
tags:
- agentic-coding
- agents
category: essays
difficulty: 4
sources:
- label: blog.szypowi.cz, Claude Code reads AGENTS.md only when telemetry is on (summary)
  url: https://blog.szypowi.cz/p/claude-code-reads-agents.md-only-when-telemetry-is-on/
  date: 23-09-2026
- label: anthropics/claude-code issue 95690, independent reproduction in the thread
  url: https://github.com/anthropics/claude-code/issues/95690
  date: 20-09-2026
- label: Anthropic, Claude Code CHANGELOG (AGENTS.md fix entry)
  url: https://raw.githubusercontent.com/anthropics/claude-code/main/CHANGELOG.md
  date: 27-09-2026
- label: Anthropic, Claude Code release notes (telemetry settings notice)
  url: https://github.com/anthropics/claude-code/releases/tag/v2.1.282
  date: 24-09-2026
- label: Anthropic, Claude Code release notes (telemetry-off default mode)
  url: https://github.com/anthropics/claude-code/releases/tag/v2.1.283
  date: 25-09-2026
contentHash: sha256:4872082f093b767a
publishState: published
---


À mon sens, la télémétrie d'un agent de code règle son comportement : dans Claude Code, elle a décidé des instructions chargées et du mode de départ des sessions interactives. Un billet d'ingénieur a montré que le chargeur d'AGENTS.md est placé derrière un feature flag distant et que, lorsque la télémétrie ou le trafic non essentiel sont désactivés, un AGENTS.md local est ignoré sans avertissement [s1]. D'après les notes de version, les sessions interactives sur des fournisseurs tiers ou avec la télémétrie désactivée démarrent désormais en mode auto lorsqu'aucun mode de permission n'est configuré [s8]. Je n'ai pas besoin de prédire le prochain couplage pour justifier deux contrôles : une étape de CI qui échoue quand un mot canari placé dans AGENTS.md ne revient pas, et un permissions.defaultMode explicite dans chaque environnement.

## Où AGENTS.md disparaît

Le fichier disparaît précisément là où son absence coûte le plus cher : il est bien présent sur le disque, et la session a l'air normale. Le billet décrit le mécanisme : lorsque Claude Code ne peut pas récupérer le flag, le plugin est indisponible et le fichier local n'est jamais lu [s2]. Il ajoute que, dans les cas qu'il décrit, aucun n'affiche d'avertissement ; la session démarre, le modèle répond sans les instructions du projet, et rien n'indique qu'un fichier a été ignoré [s3]. L'auteur de l'issue fait un autre rapport et décrit le même symptôme sur sa propre installation : il n'y a ni erreur ni avertissement, et cela ne se charge tout simplement pas [s9].

Un modèle privé des instructions du projet répond quand même, et avec aisance ; d'après mon expérience, les premiers suspects sont alors le prompt et le modèle. Le chargeur vient en dernier, quand on pense à le regarder.

Un commentaire du fil de l'issue allonge la liste des sessions touchées. L'auteur du commentaire constate que le fichier est ignoré lors de la toute première session après l'installation et à chaque fois que la récupération des feature flags est désactivée (`DISABLE_GROWTHBOOK=1` ou trafic non essentiel coupé), soit, selon lui, précisément la situation des runners de CI ; le fichier se charge correctement une fois le flag mis en cache localement [s4].

> [!NOTE]
> Un runner qui repart d'un répertoire personnel vierge à chaque job n'a jamais le flag en cache ; à ma lecture du fil, le cas de la première session y devient donc celui de chaque session.

Voilà pourquoi je veux que la vérification porte sur la configuration effective. Selon moi, un dépôt ne détermine pas à lui seul l'agent qui le lit : l'environnement, l'état mis en cache dans le répertoire personnel et le fournisseur entrent tous en jeu. Relire AGENTS.md sur un portable vérifie la rédaction du fichier, et seule une exécution sur le runner peut montrer si son agent l'a réellement lu.

Même dépôt, autre agent.

## Ce que referme l'entrée du changelog

Une ligne de changelog m'indique quelle branche l'éditeur a refermée ; toute branche qu'elle ne nomme pas, je la considère comme ouverte tant que mon propre environnement ne m'a pas dit le contraire. Cette habitude trouve ici son utilité, car l'entrée est précise sur les cas où le chargeur fonctionne désormais, et muette sur ceux que le fil a soulevés.

> [!CONFIRMED]
> Selon le changelog, AGENTS.md fonctionne désormais aussi sur Amazon Bedrock, Google Vertex AI, Microsoft Foundry, les passerelles LLM et les sessions dont la télémétrie est désactivée [s6].

> [!INFERRED]
> Je lis cette entrée comme la fermeture de la branche « télémétrie désactivée ». Elle ne nomme ni la première session après l'installation ni un runner qui bloque la récupération des flags, et je ne tiendrais aucun des deux pour couvert avant qu'une vérification sur mon propre runner ne le montre.

Pour le cas de la télémétrie désactivée, l'entrée renvoie le problème au passé. Je garde le canari pour les cas qu'elle laisse sans nom, et je le garderais même si la liste s'allongeait : une liste de changelog reflète le point de vue de l'éditeur, et mon runner n'y figure pas.

## Là où la télémétrie rejoint le mode de permission

Le second cas n'a rien d'un bogue, et c'est précisément pour cela qu'on le laisse passer. D'après les notes de version, une session interactive sur un fournisseur tiers ou avec la télémétrie désactivée démarre en mode auto si aucun mode de permission n'est configuré, et permissions.defaultMode l'emporte toujours [s8]. Elles signalent aussi l'ajout d'un avis au démarrage, ainsi que d'entrées dans /status et claude doctor, qui listent les variables de télémétrie ignorées, ou celles qui ont désactivé la télémétrie, dans les fichiers de réglages d'un projet [s7].

À ma lecture, rapprochées, ces deux entrées montrent qu'une variable de télémétrie placée dans le fichier de réglages d'un projet, là où elle est prise en compte, peut décider du mode de départ d'une session interactive quand personne n'en a configuré. Une ligne ajoutée pour des raisons de confidentialité devient ainsi une ligne qui change le comportement de l'agent dans la session même d'un développeur. Je n'ai rien contre le mode auto en soi ; ce qui me gêne, c'est que le signal qui le sélectionne soit un réglage de télémétrie.

Voici comment je classe les deux couplages ; les colonnes Nature et Contrôle relèvent de ma lecture.

| Couplage | Nature | Où il s'applique | Contrôle que j'utilise |
| :--- | :--- | :--- | :--- |
| AGENTS.md ignoré | Bogue, traité pour les cas listés par le changelog [s6] | Flag indisponible : télémétrie ou trafic non essentiel coupés, récupération des flags désactivée, première session après l'installation [s1][s4] | Étape canari en CI |
| Mode auto au démarrage | Valeur par défaut documentée, avec un réglage prioritaire | Sessions interactives sur des fournisseurs tiers ou avec la télémétrie désactivée, sans mode configuré [s8] | permissions.defaultMode explicite |

Le tableau explique aussi pourquoi je sépare les deux cas. L'un relève du rapport de bogue, l'autre d'une décision produit, et ils appellent des outils différents.

Une valeur par défaut annoncée reste une valeur que mon équipe n'a pas choisie.

## Les arguments pour faire confiance à l'éditeur

L'objection la plus forte s'appuie sur les faits : l'éditeur a fait fonctionner AGENTS.md aussi dans les sessions dont la télémétrie est désactivée [s6], et il signale désormais, au démarrage comme dans /status et claude doctor, les variables de télémétrie ignorées, ou celles qui ont désactivé la télémétrie, dans les fichiers de réglages d'un projet [s7]. Les deux cas ne sont d'ailleurs pas de même nature : l'un était un bogue, l'autre est une valeur par défaut publiée, assortie d'un réglage prioritaire et limitée aux sessions interactives [s8]. Souder les deux en une seule défaillance récurrente, et prédire la suivante, va au-delà de ce que montrent les sources.

J'accepte la première moitié de l'argument et je renonce à la prédiction. Un bogue traité pour certains cas et une valeur par défaut publiée sont deux défaillances différentes, et je ne dis rien du réglage qui pèsera ensuite sur le comportement.

Les contrôles n'ont jamais eu besoin d'une prédiction ; il leur suffit de ce qui est établi. Le réglage a modifié le comportement à deux reprises, et l'une de ces deux fois n'a produit aucun avertissement [s3]. L'entrée cite Bedrock, Vertex, Foundry, les passerelles et les sessions sans télémétrie [s6] ; elle ne nomme ni la première session après l'installation ni un runner dont la récupération des flags est désactivée, les deux cas signalés dans le commentaire [s4]. Pour mon runner, je prends donc l'entrée comme une raison de lancer la vérification moi-même.

Mon argument sur la valeur par défaut tient toujours. Un avis au démarrage atteint celui qui lit le terminal ; sur un job de CI dont personne ne lit la sortie, selon moi, il n'atteint personne.

## Un mot canari dans la CI

Le diagnostic mené par l'auteur du billet coûte assez peu pour tourner à chaque build. L'auteur a confirmé la cause avec un mot canari et une recherche de chaîne dans le binaire, et écrit que la plupart des gens ne le feront pas [s5]. Je pense qu'il a raison sur l'effort, et c'est justement ce qui plaide pour automatiser la moitié qui peut l'être : le canari coûte une seule ligne dans AGENTS.md et un seul appel à l'agent par build.

```bash
set -eu
# AGENTS.md contient une ligne avec un mot canari impossible à deviner, par exemple « Canari : tangerine-harbour ».
answer="$(claude -p 'Print the canary word from your project instructions, or MISSING.')"
case "$answer" in
  *"$CANARY_WORD"*) echo "les instructions du projet ont atteint l'agent" ;;
  *) echo "AGENTS.md n'a pas atteint l'agent avec les réglages de ce runner" >/dev/stderr; false ;;
esac
# Chaque environnement : échouer quand le fichier de réglages chargé laisse le mode de départ à une valeur par défaut.
jq -e '.permissions.defaultMode' "$SETTINGS_FILE" > /dev/null
```

C'est mon esquisse : lancez-la avec l'environnement et les réglages réels du runner, et faites pointer `SETTINGS_FILE` vers le fichier que cet environnement charge effectivement. L'étape n'a de sens que dans le même environnement que les vrais jobs, avec les mêmes variables, le même cycle de vie du répertoire personnel et le même fournisseur. Si on la lance depuis le shell d'un développeur, cache déjà chaud, je m'attends à ce qu'elle passe sans rien m'apprendre sur le runner.

Le canari a des limites, et je préfère les nommer. Il vérifie un seul fichier connu. Une exécution headless ne peut pas observer le mode de départ d'une session interactive ; le mode figé de la section suivante doit donc prendre le relais. Et le canari ne peut pas détecter un couplage que personne n'a encore trouvé.

> [!WARNING]
> Si l'agent peut ouvrir AGENTS.md avec un outil de fichiers, il trouve le mot même quand le chargeur a ignoré le fichier, et l'étape réussit pour une mauvaise raison. Je lance donc la vérification sans accès aux fichiers pour l'agent, et je tiens toute autre réussite pour suspecte.

## Ce que je fige dans chaque environnement

Le mode figé est le moins coûteux des deux contrôles, et il couvre les sessions que le canari ne voit pas. Pour les sessions interactives, permissions.defaultMode l'emporte toujours sur le démarrage en mode auto [s8]. Je le fixerais explicitement sur chaque poste de développeur et dans chaque configuration de fournisseur tiers, et je garderais la ligne jq de l'esquisse en CI, afin qu'un changement de réglages qui le supprime fasse échouer le build. Le choix de la valeur revient à l'équipe. Ce qui compte pour moi, c'est que quelqu'un le fasse délibérément, dans un fichier que l'équipe relit.

Après chaque mise à jour, je lis chaque note de version qui touche à la télémétrie comme un changement de comportement, et je relance le canari.
