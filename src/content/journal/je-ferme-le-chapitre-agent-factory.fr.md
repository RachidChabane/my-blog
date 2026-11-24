---
translationKey: fourteen-months-of-agent-factory
lang: fr
slug: je-ferme-le-chapitre-agent-factory
title: Je ferme le chapitre agent factory
publishDate: 24-11-2026
summary: Ce que j'ai appris en quatorze mois passés sur le même outil, et ce que je
  veux automatiser maintenant.
tags:
- agentic-coding
- agents
- evaluation
sources:
- label: Agent Factory
  url: https://github.com/RachidChabane/agent-factory
  date: 24-11-2026
- label: Claude Plan Execute
  url: https://github.com/RachidChabane/claude-plan-execute
  date: 24-11-2026
- label: Claude Autopilot
  url: https://github.com/RachidChabane/cc-mvp-scaffold
  date: 24-11-2026
- label: musthold
  url: https://github.com/RachidChabane/musthold
  date: 24-11-2026
- label: Datadog Studio
  url: https://studio.datadoghq.com/
  date: 24-11-2026
- label: 'Chen and Stratton, Artificial Intelligence in the Firm: Bottlenecks in Software
    Production (2026)'
  url: https://fion.ac/jellyfish.pdf
  date: 24-11-2026
- label: Anthropic, Introducing Claude Ship (2026)
  url: https://claude.com/blog/introducing-claude-ship
  date: 24-11-2026
- label: Anthropic, How the Claude Code team does code review (2026)
  url: https://claude.dev/blog/solving-code-review-at-anthropic
  date: 24-11-2026
- label: Kohavi et al., Online Experimentation at Microsoft (2009)
  url: https://ai.stanford.edu/~ronnyk/ExPThinkWeek2009Public.pdf
  date: 24-11-2026
- label: Nielsen, Why You Only Need to Test with 5 Users (2000)
  url: https://www.nngroup.com/articles/why-you-only-need-to-test-with-5-users/
  date: 24-11-2026
- label: Nielsen, Usability ROI Declining, But Still Strong (2008)
  url: https://www.nngroup.com/articles/usability-roi-declining-but-still-strong/
  date: 24-11-2026
- label: Nature News on Lindgaard et al. (2006)
  url: https://www.nature.com/news/2006/060109/full/news060109-13.html
  date: 24-11-2026
- label: Pendo, The 2019 Feature Adoption Report
  url: https://www.pendo.io/resources/the-2019-feature-adoption-report/
  date: 24-11-2026
- label: Fortune, Why startups fail, according to their founders (2014)
  url: https://fortune.com/2014/09/25/why-startups-fail-according-to-their-founders
  date: 24-11-2026
- label: Park et al., AI Simulations Grounded in Rich Self-Reports (2026)
  url: https://arxiv.org/abs/2411.10109
  date: 24-11-2026
- label: Zhong, McDonald and Hsieh, Synthetic Cognitive Walkthrough (2025)
  url: https://arxiv.org/abs/2512.03568
  date: 24-11-2026
contentHash: sha256:fac4903a68c2a996
publishState: published
---

[Agent Factory](https://github.com/RachidChabane/agent-factory) est public depuis le 24 novembre 2026. C'est la dernière version d'un outil que j'ai commencé en septembre 2025, et je m'arrête là sur ce sujet. Je raconte ici ce que l'outil fait, ce que j'ai appris en m'en servant, et ce que je veux automatiser maintenant.

<div class="j-wide">
<ol class="j-timeline">
<li><time datetime="2025-09">Septembre 2025</time><strong>Claude Autopilot</strong>Une liste de tâches, faites une par une, avec les tests lancés après chacune.</li>
<li><time datetime="2026-03">Mars 2026</time><strong>Claude Plan Execute</strong>Un plan écrit puis relu par un autre Claude avant que le code commence.</li>
<li class="j-private"><time datetime="2026-09">Septembre 2026</time><strong>Une version privée</strong>La même chose pour un seul produit, dans une organisation.</li>
<li><time datetime="2026-11">Novembre 2026</time><strong>Agent Factory</strong>N'importe quel dépôt, des tests dans le navigateur, des captures et des vidéos.</li>
</ol>
</div>

## La première version marchait déjà

En septembre 2025, j'ai écrit un script que j'ai appelé [Claude Autopilot](https://github.com/RachidChabane/cc-mvp-scaffold). Je lui donnais la liste des tâches d'un projet et il demandait à Claude Code de les faire, une par une, sans que je sois devant l'écran. Après chaque tâche, le script lançait les tests lui-même. Si les tests ne passaient pas, Claude Code devait corriger avant de passer à la tâche suivante, et au bout de trois échecs tout s'arrêtait pour que je vienne regarder. Un deuxième script tournait à côté pour surveiller ce que faisait l'agent et tout couper en cas de problème.

Le premier commit date de la nuit du 1er au 2 septembre 2025. Cette version faisait déjà l'essentiel. L'agent avançait seul, et ce n'était pas lui qui décidait si une tâche était terminée.

## Ce que j'ai amélioré depuis

Depuis, je n'ai pas changé d'idée, j'ai amélioré l'outil.

En mars 2026, il est devenu [Claude Plan Execute](https://github.com/RachidChabane/claude-plan-execute). La différence principale est qu'avant de coder, l'agent écrit un plan. Un autre Claude relit ce plan, et le code ne commence que si le plan est accepté. C'est cet outil qui fait tourner ce blog.

Ensuite j'en ai fait une version pour un produit précis, dans une organisation. Celle-là, je ne peux pas la montrer. Agent Factory est la même chose, rendue utilisable sur n'importe quel dépôt. Trois points ont surtout changé.

Les tests qui servent à juger le travail sont maintenant écrits avant le code, par un autre agent, et celui qui code ne peut plus les modifier. Ces tests ne regardent pas le code. Ils ouvrent l'application dans un navigateur, cliquent là où un utilisateur cliquerait, et vérifient ce qui s'affiche.

La pull request arrive avec ce qu'ils ont vu. Elle contient des captures d'écran prises avant et après le changement, et une vidéo du parcours, filmée sur l'ancienne version puis sur la nouvelle. Avec Autopilot, tout ce que j'avais à la fin, c'était des tests qui passaient.

Et le cockpit, l'interface où l'on voit ce que fait chaque agent, suit maintenant plusieurs projets à la fois et affiche les journaux des agents en direct. C'est depuis lui qu'on valide une spec, qu'on répond à un agent ou qu'on lance le merge.

<figure class="j-wide j-film">
<video controls muted loop playsinline preload="none" poster="/journal/fourteen-months-of-agent-factory/cockpit-poster.png" aria-label="Le cockpit d'Agent Factory pendant sa démonstration">
<source src="/journal/fourteen-months-of-agent-factory/cockpit.mp4" type="video/mp4">
</video>
<figcaption class="j-caption">Le cockpit pendant la démonstration livrée avec le dépôt. On y voit une issue avec ses tests figés, puis une pull request avec ses tests rouges puis verts et ses vidéos. Les projets et les personnes sont fictifs.</figcaption>
</figure>

Une partie de ces améliorations vient de discussions avec des ingénieurs de Vercel. Le reste vient des modèles et des harnais eux-mêmes, qui ont beaucoup évolué en quatorze mois.

## La pull request n'a plus le même sens

La pull request a été inventée pour qu'une personne relise le code d'une autre avant qu'il soit intégré. Dans Agent Factory, un agent écrit les tests, un autre écrit le code et un troisième relit. Quand la pull request s'ouvre, ce travail est déjà fait. Je pense donc qu'on peut de plus en plus s'en passer, et que ce mécanisme historique n'a plus autant de sens.

Les mesures vont dans le même sens. Deux chercheurs de Harvard, Fiona Chen et James Stratton, ont [étudié 655 entreprises et plus de 720 000 personnes](https://fion.ac/jellyfish.pdf). Après l'adoption d'agents de code, le délai entre la demande de relecture et le merge augmente de 56 %, et le code attend 60 % plus longtemps avant qu'un relecteur s'en occupe. 79 % de ces entreprises ont pourtant adopté des outils de relecture par IA, mais ce sont encore des humains qui écrivent presque toutes les relectures. Les auteurs concluent que la relecture est devenue le goulot d'étranglement.

Vous pouvez regarder la file se remplir.

<j-review-queue>
Quand quatorze changements arrivent chaque jour et que huit sont relus, cent vingt attendent au bout de vingt jours.
</j-review-queue>

<p class="j-caption">Chaque carré est un changement qui attend. Ce calcul est une soustraction et pas une mesure. Il montre ce qui s'accumule dès qu'on produit plus vite qu'on ne relit.</p>

Anthropic a sorti le 23 novembre 2026 [Claude Ship](https://claude.com/blog/introducing-claude-ship), qui s'attaque à ce goulot. Un agent relit la pull request, un autre corrige ce qui casse dans la CI et répond aux remarques, et un troisième l'approuve quand la politique écrite par l'équipe le permet. Anthropic a publié [les chiffres de l'équipe qui développe Claude Code](https://claude.dev/blog/solving-code-review-at-anthropic), et ils sont bons.

<div class="j-wide tablewrap">
<table class="j-ledger">
<thead><tr><th>Dans l'équipe de Claude Code</th><th>Avant</th><th>Après</th></tr></thead>
<tbody>
<tr><td>Pull requests fusionnées, de juin à septembre 2026</td><td></td><td>plus du double</td></tr>
<tr><td>Part de celles qu'il a fallu annuler</td><td></td><td>plus de 40 % en moins</td></tr>
<tr><td>Acceptées après un seul tour de relecture</td><td>65 %</td><td>78 %</td></tr>
<tr><td>Cinq tours de relecture ou plus</td><td>8,9 %</td><td>1,5 %</td></tr>
<tr><td>Relectures par pull request, en moyenne</td><td>2,08</td><td>1,32</td></tr>
</tbody>
</table>
</div>

<p class="j-caption">Chiffres publiés par Anthropic sur ses propres dépôts. Anthropic précise que la relecture par Claude n'est qu'une partie de sa méthode.</p>

Pour moi, cela n'apporte pourtant pas grand-chose, parce qu'on reste sur le même mécanisme. Chaque changement est toujours une branche, puis une pull request qui attend son tour, qui est relue, vérifiée contre la branche principale et fusionnée. Claude Ship fait avancer cette file plus vite, mais la file est toujours là, et ce qui y entre augmente plus vite encore. Dans le même article, Anthropic indique que son dépôt principal est passé d'environ 2 500 changements par jour en mai à plus de 30 000 en septembre. Les changements ordinaires demandent encore l'accord d'une personne, les plus risqués celui de deux, et ces personnes lisent toujours un diff.

Je ne dis pas que c'est inutile. Une équipe qui a déjà ses dépôts, ses règles de protection de branche et des obligations d'audit ne peut pas tout changer d'un coup, et pour elle c'est le chemin le plus réaliste. Annuler moins de changements tout en en fusionnant deux fois plus est un vrai résultat. Agent Factory ouvre d'ailleurs lui aussi une pull request à la fin. Mais j'y vois une étape de transition. Tant que l'unité de travail reste la pull request, on accélère la relecture d'un texte, alors que la question utile est de savoir si le produit fait ce qu'on attendait de lui.

C'est pour cette raison que j'ai créé [musthold](https://github.com/RachidChabane/musthold). L'idée est de remplacer la relecture du code par une preuve qu'on peut lire sans ouvrir le code. On écrit ce qu'on attend en langage courant, exigence par exigence. Pendant que l'agent travaille, musthold abîme volontairement le code de plusieurs façons et regarde si les tests s'en aperçoivent. Si une version cassée passe tous les tests, l'agent n'a pas le droit de s'arrêter. Il doit renforcer ses tests, et il ne voit jamais le code cassé, pour ne pas écrire un test sur mesure. musthold contrôle aussi que chaque test vérifie bien ce que dit son exigence, et il signale ce que la demande a laissé dans le flou.

À la fin, je n'ai plus à lire un diff ni à faire confiance à des tests parce qu'ils sont verts. Je lis une liste d'exigences, et je sais pour chacune si elle est prouvée ou non. C'est ce qui permettrait de fusionner un changement sans qu'une personne le relise. Ce n'est qu'une ébauche, et la philosophie qu'il y a derrière n'est pas encore aboutie.

## Ce que coûte la synchronisation

J'ai travaillé en équipe avec la méthode classique, où l'on écrit une spec, on code, on fait relire, on merge et on règle les conflits. J'ai aussi travaillé seul avec des agents, sur le même genre de projet. Seul, j'ai livré plus vite.

Cela ne tient pas aux personnes. Les développeurs avec qui j'ai travaillé sont très compétents, et je ne le suis pas plus qu'eux. La différence vient de l'organisation. Une bonne partie du temps d'une équipe passe à se mettre d'accord, en réunions, en débats et en conflits git. Ces pratiques ont été pensées pour que plusieurs personnes écrivent le même code sans se gêner. Quand ce sont des agents qui écrivent, leur coût reste entier alors que ce qu'elles protégeaient a en partie disparu. Seul, je n'avais personne avec qui me synchroniser, et j'ai pu remettre ces pratiques en cause sans attendre un accord, tout en continuant à faire écrire du bon code.

<div class="j-wide tablewrap">
<table class="j-compare">
<thead><tr><th></th><th>En équipe</th><th>Seul avec des agents</th></tr></thead>
<tbody>
<tr><td>Réunions</td><td>régulières</td><td>aucune</td></tr>
<tr><td>Conflits git</td><td>à régler entre personnes</td><td>aucun</td></tr>
<tr><td>Débats</td><td>avant de trancher</td><td>aucun</td></tr>
</tbody>
</table>
</div>

Je ne m'en réjouis pas. Je pense simplement qu'avec des agents, ce n'est plus le nombre de développeurs qui fait avancer un projet, et que la coordination peut coûter plus qu'elle ne rapporte.

## Des outils très proches arrivent

Des outils qui font la même chose commencent à sortir. Datadog, par exemple, ouvre en accès anticipé [Datadog Studio](https://studio.datadoghq.com/). D'après sa page, c'est un espace de travail qui tourne en local et qui réunit au même endroit les agents, les pull requests et les bugs, autour d'une boucle « build, ship, validate ». Il se branche sur Claude Code, Codex, OpenCode et Pi.

De mon côté, tout est maintenant public sous licence AGPL, Autopilot et Plan Execute compris. On peut utiliser le code, le forker et le modifier, mais une version modifiée qu'on distribue doit rester ouverte elle aussi.

## Ce que je veux automatiser maintenant

Je pars d'une demande et j'arrive, sans surveiller les agents, à une application que je vois fonctionner à l'écran. Pour moi, c'est un problème résolu. Je ferme donc ce chapitre.

Si des agents écrivent, relisent et testent le code, la vérification qui revient à une personne doit se faire plus haut, au niveau de l'expérience réelle de l'utilisateur, du moins pour les produits utilisés par des humains. C'est cette partie que je veux automatiser.

Aujourd'hui, on obtient ce retour avec un accès anticipé. On met le produit devant de vraies personnes et on regarde ce qui se passe. Ce qu'on y gagne est connu et chiffré.

<div class="j-wide j-figures">
<div><b>1/3</b>des idées testées chez Microsoft améliorent ce qu'elles devaient améliorer. Un tiers ne change rien et un tiers dégrade.</div>
<div><b>85 %</b>des problèmes d'utilisation sont rencontrés par cinq personnes, quand chacune en rencontre 31 %.</div>
<div class="j-hot"><b>50 ms</b>suffisent pour juger si une page plaît, et ce jugement tient quand on la regarde plus longtemps.</div>
</div>

Le premier chiffre vient de [l'équipe d'expérimentation de Microsoft](https://ai.stanford.edu/~ronnyk/ExPThinkWeek2009Public.pdf). Il dit que ceux qui construisent un produit se trompent deux fois sur trois sur ce qui va marcher, et qu'il faut un retour d'usage pour le savoir. Le deuxième vient de [Jakob Nielsen](https://www.nngroup.com/articles/why-you-only-need-to-test-with-5-users/), qui précise qu'il vaut pour des personnes qui utilisent le produit de façon comparable. Faites essayer le produit à une personne de plus et regardez ce qu'elle apporte de nouveau.

<j-sample-size>
Avec cinq personnes qui rencontrent chacune 31 % des problèmes, on en rencontre environ 85 %.
</j-sample-size>

<p class="j-caption">Chaque personne rencontre au hasard environ 31 % des problèmes, donc le résultat change d'un tirage à l'autre. En moyenne, la formule de Nielsen et Landauer donne 84 % des problèmes connus après cinq personnes, que Nielsen arrondit à 85 %.</p>

Ce retour rapporte. Nielsen relève qu'en consacrant environ 10 % du budget d'un projet à ces essais, les indicateurs visés [s'améliorent de 83 % en moyenne](https://www.nngroup.com/articles/usability-roi-declining-but-still-strong/). Et s'en passer coûte. Pendo estime, sur les produits de ses propres clients, que [80 % des fonctionnalités sont rarement ou jamais utilisées](https://www.pendo.io/resources/the-2019-feature-adoption-report/). Dans une analyse de 101 récits d'échec de startups, la première cause citée, dans 42 % des cas, est [l'absence de besoin pour le produit](https://fortune.com/2014/09/25/why-startups-fail-according-to-their-founders).

Tout cela ne concerne pas des bugs. Une partie de ce qu'on apprend tient à une impression, et une impression se forme très vite. Dans [une étude de 2006](https://www.nature.com/news/2006/060109/full/news060109-13.html), des pages montrées 50 millisecondes recevaient déjà une note, et cette note concordait avec celle donnée après un examen plus long. Faites l'essai.

<j-first-glance>
Ce test montre trois écrans pendant 50 millisecondes chacun et vous demande de les noter, puis de les noter à nouveau sans limite de temps. Il a besoin de JavaScript.
</j-first-glance>

<p class="j-caption">Trois maquettes sans texte, montrées environ 50 ms chacune selon votre écran. Vos notes restent dans votre navigateur.</p>

Un test de bout en bout ne voit rien de tout cela. Il est écrit à l'avance, il déroule toujours les mêmes étapes et il vérifie des résultats prévus. Je veux autre chose. Je veux mettre des agents devant le produit comme on y mettrait des personnes, avec un comportement imprévisible, pour avoir un retour sur ce qui ne se teste pas de façon déterministe, comme une impression ou une affaire de goût. Le but n'est pas de trouver des bugs. Le but est de ne plus attendre les premiers utilisateurs pour apprendre ce qu'ils nous auraient appris.

La recherche avance dans cette direction. Une équipe menée à Stanford a construit des agents à partir d'entretiens et de questionnaires avec 1 052 personnes. Ces agents [retrouvent 72,8 % des réponses](https://arxiv.org/abs/2411.10109) de la personne qu'ils imitent, alors que la personne elle-même, interrogée deux semaines plus tard, n'en retrouve que 79,5 %. Il reste des limites. Dans [une autre étude](https://arxiv.org/abs/2512.03568), les modèles qui parcourent une interface vont au bout de plus de tâches que les humains et repèrent moins d'endroits où l'on se trompe. Ils sont encore trop efficaces pour ressembler à quelqu'un qui découvre un produit.

## Ce dont je ne suis pas sûr

Avec musthold, je cherche la reproductibilité, par rigueur scientifique. Je m'accroche peut-être encore trop au déterminisme, alors que les modèles deviennent de plus en plus intelligents. La reproductibilité n'est pas toujours critique sur les sujets sur lesquels on travaille, et le budget est peut-être mieux dépensé ailleurs, sur ces tests d'usage réel.

C'est la direction que je prends depuis plus d'un an. J'en dirai plus bientôt.
