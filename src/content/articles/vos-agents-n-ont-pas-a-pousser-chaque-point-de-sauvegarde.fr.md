---
translationKey: agent-write-volume-breaks-git-design-assumptions
lang: fr
slug: vos-agents-n-ont-pas-a-pousser-chaque-point-de-sauvegarde
title: Vos agents n'ont pas à pousser chaque point de sauvegarde
publishDate: 14-10-2026
tags:
- agentic-coding
- agents
category: essays
difficulty: 3
sources:
- label: Anthropic Engineering, Redesigning source control at Anthropic
  url: https://www.anthropic.com/engineering/redesigning-source-control
  date: 13-10-2026
- label: GitHub Blog, Building Git infrastructure for agent-scale development
  url: https://github.blog/engineering/architecture-optimization/building-git-infrastructure-for-agent-scale-development/
  date: 06-10-2026
- label: Meta, Sapling source control announcement
  url: https://engineering.fb.com/2022/11/15/open-source/sapling-source-control-scalable/
  date: 15-11-2022
contentHash: sha256:5e56f63d404b6ee4
publishState: published
---


Pour une équipe ordinaire, l'enjeu se joue, à mon sens, sur le push que chaque agent attend : gardez les points de sauvegarde en local et laissez git en place. Anthropic indique avoir fusionné en moyenne environ 2 500 modifications de code par jour en mai 2026, puis plus de 30 000 par jour en septembre [s4], et écrit que la gestion de versions est devenue son plus gros goulot d'étranglement à mesure que les fusions quotidiennes étaient multipliées par plus de dix [s2]. GitHub décrit la même pression à l'échelle d'un seul agent : dans une boucle serrée, un agent commite ou crée un point de sauvegarde après presque chaque action, et sa vitesse est bornée par la durée d'un seul push [s18]. Aucun de ces billets ne mesure ce que cela coûte à une équipe qui fait tourner quelques agents ; chronométrez-le donc sur votre propre forge, d'autant que le changement que je défends se défait en un après-midi.

## Ce qu'Anthropic a vraiment changé

Ce qui m'a frappé dans le billet d'Anthropic du 13 octobre 2026 [s1], c'est la prémisse de la refonte. Anthropic écrit que, comme la plupart des entreprises, elle utilisait git comme un système centralisé avec une seule copie de référence, alors que presque tous ses clients étaient des agents et des jobs connectés par définition [s6]. Son billet nomme le décalage : les clients sont toujours connectés, et git suppose des clients qui travaillent hors ligne avec une copie complète du dépôt [s7]. Vos agents enfreignent eux aussi cette hypothèse, à chaque appel ; l'échelle n'a fait que rendre le décalage assez coûteux pour qu'Anthropic reconstruise tout autour.

La réponse d'Anthropic s'appelle Scion, un système de gestion de versions interne, vers lequel l'entreprise a entièrement migré son monorepo depuis git en cinq mois [s5]. Elle indique que l'empreinte de l'infrastructure Scion est désormais 200 fois plus petite que celle de son ancienne infrastructure de miroirs git, en besoins de CPU et de mémoire [s8] ; c'est Anthropic comparée à ses propres miroirs, et cela ne dit rien de git en général.

## La limite qu'Anthropic pose autour de Scion

Anthropic pose elle-même la limite. Scion, écrit-elle, n'est en aucun cas un remplaçant adapté de git pour un usage général [s10]. Son billet ajoute que les concepts qu'il expose n'ont vraiment de sens que pour des monorepos réellement gigantesques, avec soit des dizaines de milliers d'ingénieurs, soit des essaims d'agents qui écrivent du code en abondance [s11] [s29]. Anthropic affirme d'ailleurs que sa capacité à dépenser des tokens pour un usage interne dépasse de loin ce qu'aucune autre entreprise ne voudrait raisonnablement dépenser [s12]. C'est un système conçu pour une charge que vous n'avez probablement pas.

Les chiffres de GitHub se lisent trop facilement comme une prévision pour votre dépôt. Rien qu'en septembre, selon GitHub, développeurs et agents ont réalisé 7.38 milliards de commits sur la plateforme, plus de cinq fois plus qu'un an plus tôt [s17]. GitHub indique aussi que les pushes ont été multipliés par 4.9 en un an, passant de 0.69 milliard à 3.35 milliards par mois [s19]. GitHub reconnaît lui-même que l'écart entre un dépôt typique et les plus actifs est plus grand que la plupart des gens ne le pensent [s15], et présente sa nouvelle infrastructure comme taillée pour des lectures et des écritures concurrentes et soutenues, à une échelle que peu de dépôts atteignent aujourd'hui [s40].

Selon moi, les deux acteurs sont partis dans des directions opposées, mais placent la réponse pour tous les autres au même endroit : côté serveur de git. GitHub écrit qu'avec des développeurs et des agents qui travaillent en parallèle dans des dépôts recevant des millions de commits par jour, ces charges exigent une autre architecture Git [s14]. Anthropic écrit de son côté qu'un serveur git n'a pas à fonctionner comme un client git [s36]. J'y vois la frontière : changer de système de gestion de versions est une décision à l'échelle d'un monorepo, le chemin d'écriture de la forge relève de la forge, et ce qui reste de votre côté, c'est la fréquence à laquelle vos agents demandent à la forge de se mettre d'accord sur quelque chose.

## Le coût que chaque agent paie à chaque push

GitHub range le délai de commit, devenu goulot d'étranglement par agent, parmi les défis d'architecture que pose la construction à sa propre échelle [s37]. Le mécanisme est celui de la boucle serrée décrite plus haut [s18], et GitHub explique pourquoi l'écriture est le chemin difficile : chaque push doit être stocké durablement et rendu visible de façon cohérente avant que l'agent ou le job de CI suivant puisse s'appuyer dessus [s20]. Anthropic demande la même chose : des commits peu coûteux, incrémentaux et sans verrou [s32].

GitHub resserre encore la partie coûteuse : ce qui exige vraiment un accord dans un push, c'est la mise à jour de la référence elle-même [s38], et dans l'architecture actuelle de GitHub, chaque réplique participe à chaque écriture, si bien qu'un push n'est pas plus rapide que la réplique la plus lente de son groupe [s39]. À mon sens, ce coût se paie par point de sauvegarde et par agent : il n'attend pas que le dépôt grandisse, même si rien dans ces billets ne le mesure pour un dépôt modeste.

> [!WARNING]
> La boucle qui pousse à chaque étape : un agent qui pousse chaque point de sauvegarde en accomplit au plus un par aller-retour de push, si bien que le chemin d'écriture de la forge dicte son rythme, quoi que fasse le modèle.

Des branches séparées n'y changent rien. GitHub écrit que des milliers d'agents travaillant chacun sur sa branche dans un même dépôt produisent un flux d'écritures soutenu qui converge vers un point unique de son architecture [s41]. Un worktree par agent isole les fichiers sur le disque ; c'est la cadence des pushes qui atteint le serveur.

L'objection la plus forte porte sur la visibilité. Le travail multi-agents repose sur un état partagé, et un point de sauvegarde que personne ne voit est un point de sauvegarde sur lequel aucun autre agent ne peut s'appuyer. Avec git, rappelle Anthropic, on commite en local puis on pousse pour partager son travail [s30] ; Scion supprime cet écart, avec des changesets créés côté serveur et disponibles partout, instantanément [s33]. Sapling, chez Meta, a pris le même chemin avec Commit Cloud, où tous les commits d'une organisation sont envoyés dès leur création [s42]. Si les deux systèmes construits par des opérateurs de monorepos ont choisi de partager davantage, pourquoi une petite équipe partagerait-elle moins ?

Ma réponse : tous deux ont payé cette visibilité en possédant le serveur. Avec git, partager veut dire pousser, et GitHub écrit que la partie d'un push qui exige un accord est la mise à jour de la référence [s38]. Je pense que la visibilité vaut son prix quand quelqu'un la consomme : un autre agent qui va rebaser sur ce travail, un job qui va le tester, une personne qui va le relire. Un point de sauvegarde intermédiaire que seul son agent lira n'a aucun consommateur avant le passage de relais, et le pousser coûte l'aller-retour sans rien rapporter.

L'objection à laquelle ces sources ne me permettent pas de répondre, c'est l'ordre de grandeur. Si une boucle d'agent passe bien plus de temps à attendre le modèle qu'à attendre `git push`, la borne ne joue pas et rien de tout cela ne compte. C'est pour cela que ma dernière section commence par un chronomètre. Migrer tôt, avant que le volume n'arrive, c'est justement ce qu'Anthropic écarte pour un usage général [s10].

## Trois endroits où payer une écriture

Mettez côte à côte GitHub, Anthropic et Meta : chacun paie la même écriture à un endroit différent.

| système | où se fait un commit | comment les autres le voient | où retombe le coût d'écriture |
| :--- | :--- | :--- | :--- |
| git sur GitHub | en local, jusqu'au push | par un push dont l'étape coordonnée est la mise à jour de la référence [s38] | sur la forge : les données de référence sont stockées dans Azure Blob Storage [s21], avec un débit d'écriture jusqu'à 35 fois supérieur dans des benchmarks internes [s22] |
| Scion (Anthropic) | sur le serveur, sans rien à pousser [s31] | des changesets disponibles partout, instantanément [s33] | sur les refs partagées, que Scion décourage parce qu'un état global sur lequel chaque serveur doit s'accorder est un problème de passage à l'échelle qui se profile [s34] |
| Sapling (Meta) | un commit hors ligne configurable dans de nombreux flux courants [s26] | Commit Cloud envoie les commits dès leur création [s42] | sur le push, puisque les utilisateurs poussent toujours leurs commits vers le serveur [s43] |

Sapling a sa place dans cette comparaison parce qu'Anthropic l'y a mis : son billet cite Sapling, chez Meta, à côté de Piper chez Google, comme précédent pour la gestion de versions des monorepos géants [s35]. Le billet de Meta, publié en novembre 2022 [s23], présente Sapling comme un client de gestion de versions compatible avec Git, qui privilégie l'ergonomie tout en passant à l'échelle des plus grands dépôts du monde [s24], et qui sert principalement pour le grand monorepo de Meta [s25]. Meta décrit aussi pour Sapling un système de fichiers virtuel, pas encore disponible publiquement à l'époque, qui donne l'apparence et le comportement d'un dépôt complet [s27].

> [!CONFIRMED]
> Dans Sapling, chez Meta, le premier accès à un fichier exige une requête réseau [s28], et Meta a pourtant conservé une capacité configurable à travailler hors ligne dans de nombreux flux courants, comme la création d'un commit [s26].

> [!INFERRED]
> Ma lecture : Sapling a gardé la possibilité de commiter sans réseau, même là où la lecture d'un fichier en dépendait. Le point de sauvegarde qu'un agent crée à chaque étape est le genre de commit qui ne perd rien à rester en local jusqu'à ce qu'un autre agent ou un job en ait besoin.

Lisez ensemble les deux billets les plus récents : selon moi, ils situent la partie coûteuse du partage au même endroit, l'accord sur un état partagé, que GitHub parle de mise à jour de la référence [s38] ou qu'Anthropic évoque un état global sur lequel chaque serveur doit s'accorder [s34]. Un commit local ne déplace aucune ref partagée. Tout ce que je propose ensuite repose sur ce mécanisme.

## Ce que je changerais dès lundi

Sur un dépôt ordinaire avec quelques agents, je commencerais ici. Chaque agent reçoit son propre worktree et sa branche, et commite en local après chaque étape vers laquelle il pourrait vouloir revenir. Il ne pousse que lorsqu'un autre agent ou un job a besoin de cet état. Avant que quiconque évoque un nouveau système de gestion de versions, je chronométrerais ce push.

```bash
# un worktree et une branche par agent
git worktree add -b agent/a ../agent-a
# à chaque étape : un point de sauvegarde local, sans réseau
git -C ../agent-a add -A
git -C ../agent-a commit -q -m "checkpoint: <step>"
# au passage de relais : un seul push, quand un autre agent ou un job a besoin de l'état,
# chronométré : c'est l'aller-retour à mesurer avant de parler d'un nouveau système
time git -C ../agent-a push origin agent/a
```

Ces commandes sont banales à dessein : le push est la seule ligne qui parle à la forge, et il ne tourne plus qu'une fois par passage de relais. Le plus difficile, d'après mon expérience, c'est l'orchestration des agents, qui doit savoir ce qu'est un passage de relais et pousser avant de l'annoncer.

Ce choix a deux contreparties. Un point de sauvegarde qui n'existe que sur une machine disparaît avec elle : une longue exécution sans passage de relais devrait donc pousser malgré tout après un nombre fixe d'étapes. Des branches qui divergent plus longtemps se rebasent avec plus de conflits. J'accepte les deux, car chacun reste circonscrit à un agent, alors qu'un push lent pénalise chaque étape de chaque agent.

> [!NOTE]
> Chaque chiffre de cet article est une déclaration de l'opérateur qu'il décrit, et le débit d'écriture jusqu'à 35 fois supérieur annoncé par GitHub vient de benchmarks internes [s22]. Je n'ai trouvé dans aucun des trois billets de chiffre de latence de push pour un dépôt modeste : le nombre qui tranche pour vous, c'est celui qu'affiche `time git push`.

Mon pari est simple : garder git, sortir les points de sauvegarde du réseau, et mesurer. Si le push chronométré finit par dominer une étape, c'est le moment de regarder ce que GitHub et Anthropic ont construit côté serveur. D'ici là, git reste où il est.
