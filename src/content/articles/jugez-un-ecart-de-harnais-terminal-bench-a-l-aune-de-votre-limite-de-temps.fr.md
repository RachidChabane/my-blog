---
translationKey: terminal-bench-score-is-conditional-on-runtime-budget
lang: fr
slug: jugez-un-ecart-de-harnais-terminal-bench-a-l-aune-de-votre-limite-de-temps
title: Jugez un écart de harnais sur Terminal-Bench à l'aune de votre propre limite
  de temps
publishDate: 09-11-2026
tags:
- evaluation
- agentic-coding
category: essays
difficulty: 4
sources:
- label: 'Buchanan, Zhou, Linderman and Re, Benchmarks as Software: Terminal-Bench
    and the Case for Continuous Benchmarks (arXiv 2611.08417)'
  url: https://arxiv.org/abs/2611.08417
  date: 05-11-2026
- label: 'Buchanan, Zhou, Linderman and Re, Benchmarks as Software: Terminal-Bench
    and the Case for Continuous Benchmarks (arXiv 2611.08417)'
  url: https://arxiv.org/html/2611.08417
  date: 05-11-2026
- label: Anthropic Engineering, Quantifying infrastructure noise in agentic coding
    evals
  url: https://www.anthropic.com/engineering/infrastructure-noise
  date: 05-02-2026
contentHash: sha256:a251d952b055dba9
publishState: published
---


À mon avis, un écart de harnais sur Terminal-Bench se juge à la limite de temps de votre agent, car un écart vaut ce que vous pouvez en récupérer sous cette limite. L'infrastructure pèse sur le score : dans son billet d'ingénierie sur le bruit, Anthropic écrit que deux agents dotés de budgets de ressources et de limites de temps différents ne passent pas la même épreuve [s15], que la configuration de l'infrastructure peut à elle seule produire des différences supérieures aux marges qui séparent les lignes d'un classement [s14], et qu'une avance de 2 points peut refléter une véritable différence de capacité, ou une évaluation lancée sur un matériel plus puissant [s13]. Le même billet invite des laboratoires comme Anthropic à traiter la configuration des ressources comme une variable expérimentale de premier plan [s28]. Les sources disent déjà quoi publier ; ma question est celle d'une équipe dont la limite est fixée : que vaut cet écart ici ?

## Ce que les sources ont déjà tranché

Sur ce qu'il faut publier, le mérite revient aux sources. L'audit de Terminal-Bench, l'article qui relève des problèmes dans environ 30 % du benchmark et publie les réparations sous le nom de Terminal-Bench 2.1 [s3], range les budgets de ressources dans la spécification de mesure, à valider en même temps que les tâches [s2]. Pour l'audit, un budget fixe est un point de fonctionnement arbitraire, dont le choix peut modifier les conclusions d'efficacité pour des modèles donnés [s6] ; les classements scalaires réduisent la version du benchmark, le harnais et le budget de ressources à un seul nombre [s20] ; et l'audit plaide pour un plancher raisonné et un test de sensibilité au budget [s17]. Anthropic estime que les différences de classement inférieures à 3 points de pourcentage méritent le scepticisme tant que la configuration de l'évaluation n'est pas documentée et alignée [s16], et que le multiplicateur exact variera selon le benchmark et la distribution des tâches, et doit donc être publié [s32]. L'audit cite ce billet comme montrant que la configuration de l'infrastructure peut à elle seule déplacer les scores de codage agentique [s24]. Entre le benchmark d'avant les réparations et celui d'après, l'audit constate que les positions du classement bougent d'au plus trois rangs, alors que l'ordre global reste fortement corrélé, avec un rho de Spearman de 0.958 [s4].

Ces phrases disent aux opérateurs de benchmarks quoi publier et aux lecteurs quand douter d'une ligne. Je pense qu'aucune ne dit à une équipe ce que vaut un écart une fois qu'il est expliqué.

> [!NOTE]
> Les mesures citées ici portent sur Terminal-Bench 2.0 et 2.1. Aucune des deux sources ne mesure une version ultérieure, et je ne dis donc rien des lignes plus récentes.

## Ce que montre l'horloge de l'audit

Je partirais de l'horloge, car c'est dans le balayage temporel de l'audit qu'un écart de harnais change de sens. Au temps par défaut, l'audit constate que Codex donne des scores nettement plus élevés que Terminus-2 pour les modèles OpenAI [s18]. Prolonger la limite de temps comble un écart de harnais de 20 points sur GPT 5.4 et ramène à 5 points un écart de 30 points sur GPT 5.4 mini [s1].

L'audit mesure combien de tâches sont résolues à mesure que le budget augmente [s38]. Ce budget plus large reste une borne supérieure, note l'audit, car les agents peuvent s'arrêter une fois leur travail terminé [s25]. Je lis une limite plus haute de la même façon : une exécution terminée ne l'atteint jamais, et la facture retombe sur les tâches qui allaient de toute façon expirer.

Au budget par défaut, dans le graphique de l'audit sur les timeouts parmi les essais échoués de Terminal-Bench 2.1 par harnais [s37], plus de 50 % des essais échoués se sont terminés par un timeout, de 68 % sous `claude-code` à 18 % sous `gemini-cli` [s22]. Je ne lirais pas cette part comme autant de tâches qu'une limite plus longue sauverait. Anthropic ajoute, au passage, que dans certaines configurations les limites de temps commencent elles aussi à jouer un rôle [s12].

L'audit lit cette récupération comme le signe de gains de vitesse, qu'il distingue de gains de capacité [s5].

J'accepte le diagnostic et je compte quand même la vitesse. À mon sens, une équipe tenue par un job de CI ou une fenêtre de nuit achète précisément cette vitesse : à la limite par défaut, l'écart existe, et il se réduit pour l'équipe qui peut se permettre d'attendre.

Cela change aussi le premier test à faire. À mon sens, la fenêtre décide du levier disponible. Si votre limite peut bouger, je testerais une limite plus haute avant toute migration, et je ne supposerais pas qu'une hausse modeste suffise à récupérer ces points. Si elle ne peut pas bouger, l'écart à votre limite est le chiffre à retenir.

Ce résultat couvre une paire nommée et un écart sur un modèle mini. J'y vois une raison de tester, je ne prédis rien pour les autres paires de harnais, et je ne dis rien d'une fenêtre plus courte que le délai par défaut. Les chiffres que je peux citer donnent l'écart au délai par défaut et après extension ; ils ne disent pas jusqu'où la limite d'une équipe donnée devrait monter. Je ne pense pas que la ligne puisse dire où votre limite se situe sur cette courbe.

> [!CONFIRMED]
> La légende de la figure de l'audit sur l'écart de harnais indique que cet écart est surtout un effet de budget de temps [s40], et le texte précise que l'essentiel de cet écart se récupère avec un budget plus long, ce que l'audit lit comme le signe de gains de vitesse [s5].

> [!INFERRED]
> À mon sens, une fenêtre fixe fait de cette vitesse une partie de ce qu'une équipe achète, et je compterais donc l'écart à la limite propre de l'équipe.

## Qui a fixé le réglage par défaut

Un réglage par défaut a un auteur, et l'audit le nomme pour Terminal-Bench 2.0. Dans TB2.0, écrit l'audit, les contributeurs des tâches fixent les budgets de CPU, de mémoire et de temps de chaque tâche d'après leur propre consommation de ressources [s19].

Chez Anthropic, l'implémentation Kubernetes traitait les spécifications de ressources par tâche à la fois comme un plancher et comme un plafond strict : chaque conteneur recevait la garantie des ressources spécifiées et était tué dès qu'il les dépassait [s33]. J'appelle cela l'arrêt plancher-égal-plafond : l'allocation garantie sert aussi de seuil d'arrêt forcé. Le balayage de ressources d'Anthropic a maintenu tout le reste constant : même modèle Claude, même harnais, même ensemble de tâches [s35], et Anthropic a reproduit le résultat principal sur différents modèles de sa gamme, avec un sens constant et une ampleur variable [s34]. Le billet de février d'Anthropic indique que le classement passe par un autre fournisseur de bac à sable, dont l'implémentation est plus souple et autorise un dépassement temporaire sans arrêter le conteneur, afin de privilégier la stabilité de l'infrastructure [s27].

J'y vois deux décisions aux propriétaires différents : un auteur de tâche a choisi le chiffre, et un bac à sable a décidé avec quelle fermeté l'appliquer. La fenêtre d'une équipe reste un chiffre distinct, que la ligne ne porte pas. La comparaison d'Anthropic vaut aussi pour votre cluster : si vos pods fixent les requests de mémoire au niveau des limits de mémoire, je pense que votre cluster applique la variante stricte, et qu'une ligne issue d'un bac à sable plus souple décrit un environnement plus clément que le vôtre.

## La marge de ressources est un second axe

Le CPU et la mémoire ne se comportent pas comme l'horloge, et je garderais les deux séparés. Lors d'expériences internes, Anthropic a mesuré un écart de 6 points de pourcentage entre les configurations les mieux et les moins bien dotées sur Terminal-Bench 2.0 [s8]. Le balayage de ressources distingue deux régimes, que le tableau met en regard de l'horloge.

| Changement de budget | Mesuré par | Benchmark | Ce qui a bougé |
| :--- | :--- | :--- | :--- |
| Temps réel prolongé | L'audit | Terminal-Bench 2.1 [s40] | L'écart de harnais sur GPT 5.4 se comble [s1] |
| Marge de ressources, de 1x à 3x | Anthropic | Terminal-Bench 2.0 [s8] | Les scores de réussite fluctuent dans les marges de bruit [s9] |
| Marge de ressources, de 3x à sans plafond | Anthropic | Terminal-Bench 2.0 [s8] | Les erreurs d'infrastructure baissent encore de 1.6 point de pourcentage, tandis que la réussite bondit de près de 4 [s10] |

Anthropic indique que, jusqu'à environ 3x les spécifications de Terminal-Bench, les ressources supplémentaires corrigent des problèmes de fiabilité de l'infrastructure, à savoir des pics passagers de ressources [s29]. Ces ressources permettent aussi à l'agent d'essayer des approches qui ne fonctionnent qu'avec des allocations généreuses, comme le chargement de grosses dépendances ou l'exécution de suites de tests gourmandes en mémoire [s11]. Les modèles n'ont pas les mêmes approches par défaut, et la configuration des ressources détermine lesquelles finissent par réussir [s30].

L'exemple d'Anthropic est `bn-fit-modify`, une tâche de Terminal-Bench qui demande d'ajuster un réseau bayésien : le premier geste de certains modèles est d'installer la pile standard de science des données en Python, ce qui passe avec des limites généreuses, alors qu'avec des limites strictes le pod manque de mémoire pendant l'installation, avant que l'agent n'écrive une seule ligne de la solution [s31]. Sur les limites de ressources, Anthropic écrit que des limites strictes récompensent par inadvertance les stratégies très efficaces, que des limites généreuses récompensent les agents qui exploitent mieux toutes les ressources disponibles, que l'une et l'autre méritent d'être testées, et met en garde contre le fait de les réduire à un seul score sans préciser la configuration des ressources [s26].

Je lis le balayage d'Anthropic comme un score qui bouge avec la configuration, et je pense que cela compte surtout pour les lignes serrées.

## Le meilleur argument contre

La meilleure objection vient de l'audit lui-même, et elle mérite tout son poids. Dans sa convention de réparation, l'audit dit que la ressource fixe la difficulté de la tâche, et que ces valeurs restent aussi proches que possible de ce que voulaient les contributeurs d'origine [s39]. Une ligne conditionnée par son budget, c'est alors le benchmark qui fonctionne comme prévu. L'audit cite aussi Merrill et al., selon qui, en moyenne, le choix du harnais compte moins que le choix du modèle [s23]. Peu de timeouts subsistent au plus grand budget, sauf pour les petits modèles inclus [s21], et l'audit en conclut que la plupart des échecs restants ne sont pas des artefacts de timeout : ces tâches sont restées non résolues dans les configurations testées [s7]. Le temps cesse alors d'être un levier. L'écart observé par Anthropic sur la plage modérée de configurations de ressources dans Terminal-Bench est juste inférieur à 2 points de pourcentage [s36].

J'accepte tout cela. Un budget fixé pour une difficulté voulue est un chiffre valable pour la difficulté, et je pense que c'est un chiffre distinct de celui sous lequel tourne une équipe. Mon propos porte sur les changements de harnais et les lignes serrées. Il ne porte pas sur le choix du modèle, où la moyenne citée par l'audit donne le poids au modèle, et il ne promet pas que le temps sauve un agent qui échoue. Il se réfute aussi facilement sur votre propre exécution : si les deux courbes restent parallèles à votre limite, ce conseil ne change rien.

## Ce que je ferais

Avant un changement de harnais, j'appliquerais le test de sensibilité de l'audit à mon propre jeu de tâches.

- Relever la limite de temps sur le job qui exécute l'agent : `timeout-minutes` dans un workflow GitHub Actions, ou la durée de la fenêtre de nuit.
- Relever les valeurs de mémoire sous `resources.requests` et `resources.limits` dans la spécification du pod, avec `kubectl get pod <name> -o yaml` si le manifeste a dérivé. Des valeurs de mémoire égales signalent la configuration plancher-égal-plafond.
- Si la limite peut bouger, la relever sur le harnais actuel et mesurer de nouveau avant de préparer une migration. Sinon, passer cette étape.
- Faire tourner les harnais retenus à ces valeurs sur mes propres tâches, puis de nouveau avec une limite plus longue, et comparer les deux courbes.
- Écrire les deux limites à côté du score : la limite de temps et les limites du conteneur.
- Traiter un écart inférieur aux 3 points de pourcentage d'Anthropic comme non résolu [s16].

Une ligne enregistre un point sur une courbe. Ma limite en est un autre, qu'elle puisse bouger ou non, et je le mesurerais avant de payer une migration.
