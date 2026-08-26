---
translationKey: failure-record-in-context-drives-the-repeat
lang: fr
slug: ce-que-le-harnais-reecrit-apres-un-appel-en-echec
title: Ce que le harnais réécrit après un appel en échec
publishDate: 26-08-2026
tags:
- agents
- agentic-coding
- qualite
category: essays
difficulty: 4
sources:
- label: 'Feedback That Backfires: Why Small Language Model Agents Repeat the Call
    They Just Watched Fail (arXiv:2608.23651)'
  url: https://arxiv.org/abs/2608.23651
  date: 24-08-2026
- label: 'Outcome Monitors: Recovery Affordances for Silent Tool Failures (arXiv:2608.19303)'
  url: https://arxiv.org/abs/2608.19303
  date: 19-08-2026
- label: 'Don''t Repeat Yourself: Stopping Verbatim Loops at Sampling Time (arXiv:2608.22761)'
  url: https://arxiv.org/abs/2608.22761
  date: 24-08-2026
- label: 'When Not to Imitate: Boundary-Aware Skill Memory for Reliable Tool-Use LLM
    Agents (arXiv:2608.22339)'
  url: https://arxiv.org/abs/2608.22339
  date: 23-08-2026
- label: 'ToolRobustBench: Stage-Wise Perturbation Evaluation and Failure Diagnosis
    for Tool-Calling Agents (arXiv:2608.23635)'
  url: https://arxiv.org/abs/2608.23635
  date: 23-08-2026
contentHash: sha256:27093b159e2ea7d3
publishState: published
---


À mon sens, la variable de conception d'un harnais de code tient à ce que dit la trace d'échec, et mes deux réflexes y écrivent le mauvais texte. Le premier consiste à consigner l'appel d'outil fautif mot pour mot, pour que le modèle voie précisément ce qui a cassé. Or, sur un ensemble de candidats fixe, la probabilité de répéter cet appel passe de 0.06 à 0.54 dès que l'appel figure dans le contexte [s3], sur 6 points de contrôle allant de 135M à 1.7B et répartis sur 4 familles [s2]. La trace que j'écrivais pour aider le modèle à se reprendre est justement ce qui le fait se répéter.

## Ce que fait le harnais après un échec

Tous les harnais que j'ai construits font la même chose. Ils consignent dans la transcription un appel d'outil en échec et son message d'erreur, puis demandent au modèle de continuer, en supposant que l'erreur constitue une information corrective [s1]. L'hypothèse est confortable, et je ne l'ai jamais auditée.

Personne ne l'audite vraiment, et il y a une raison structurelle à cela. Un succès de bout en bout propre ne permet pas d'identifier où naît une défaillance d'usage d'outil ni comment elle se propage à travers un appel [s17]. Le chiffre que l'on optimise ne dit rien du mécanisme que l'on débogue, si bien que l'hypothèse reste sous le harnais, jamais testée, pendant que la transcription enfle.

## La trace verbatim augmente les chances de la répétition

Parce que la transcription fonctionne comme un prompt, tout ce que le runtime y ajoute entre en concurrence pour l'attention au pas suivant, et un appel fautif recopié en entier constitue un candidat bien formé, posé exactement là où le modèle en cherche un. L'échec lui est donc montré, et pas seulement raconté.

La mesure répartit les dégâts d'une manière que je n'attendais pas. La forme de surface explique 83% du dommage, tandis que la contribution sémantique du marquage de l'appel comme échoué reste faible et de signe inconstant selon les environnements [s4], sur ces mêmes 6 points de contrôle de 135M à 1.7B et sur 4 familles [s2]. Ce que je croyais porteur, l'annotation qui signale la faute, est donc quasi inerte. Ce que je croyais neutre, les octets littéraux de l'appel, porte presque tout.

Voilà le réflexe auquel renoncer: une trace fidèle n'est pas automatiquement une trace sûre. Le gain correctif est négatif pour chaque modèle instruit testé, dans deux environnements dont la réparation de programmes MBPP [s2]. Pas faible. Négatif. Je payais du budget de contexte pour de la fidélité, et la fidélité n'est pas le terme que la mesure récompense.

## Vider le contexte est l'autre mauvais levier

Le second réflexe est le mouvement inverse, et il échoue pour une raison que j'ai mis du temps à accepter. Supprimer la tentative en échec pour réessayer depuis un contexte propre, la prescription standard contre la contamination du contexte, est le pire harnais mesuré pour la répétition, parce qu'il restaure le contexte qui a produit l'échec [s6].

> [!WARNING]
> Vider le contexte ne remet pas la trajectoire à zéro. Cela réinstalle l'état exact qui a produit l'échec, et c'est pourquoi ce harnais se classe dernier pour la répétition [s6]. Le classement porte sur cette seule métrique, rien de plus large.

L'alternative bon marché agit sur le même terme sans toucher au budget. Remplacer l'appel verbatim par une description de l'échec générée par le runtime supprime 76% de l'inversion sans coût en jetons, et rendre inatteignables au décodeur les chaînes déjà échouées agit sur ce même terme [s5], sur la même plage de points de contrôle de 135M à 1.7B et sur 4 familles [s2]. L'un relève de l'assemblage du prompt, l'autre du décodeur: le terme est donc accessible à deux couches distinctes de la pile.

## Ce qui a bougé un chiffre, c'est d'avoir nommé l'affordance de récupération

La seconde ligne vient d'une conception tout autre, et je l'aurais rangée parmi les meilleurs messages d'erreur si l'ablation n'avait pas suivi. En cas de violation, le moniteur préserve le résultat et émet un reçu non contraignant qui nomme la propriété violée et les outils de récupération publics [s7]. Alors que se passe-t-il au lieu de bloquer l'agent? On tend à l'agent une note sur ce qu'il peut atteindre ensuite.

Les Outcome Monitors font passer le taux d'achèvement de ToolMaze de 10.9% à 28.1% sur quatre modèles issus de deux familles de fournisseurs, et l'effet se reproduit chez un troisième [s8]. C'est un vrai déplacement sur un vrai banc d'essai, et pris seul il ne dit rien du pourquoi.

L'ablation, elle, le dit. Retirer la liste des outils de récupération supprime le gain mesuré et la rétablir restaure l'effet, tandis que le détail diagnostique et le moment de l'émission ne produisent aucune différence détectable [s9], et les outils de récupération sont le contenu actif du reçu dans ces contrôles [s10].

> [!CONFIRMED]
> La liste des outils de récupération est le terme qui déplace le chiffre. Retirez-la, le gain disparaît; rétablissez-la, il revient; le détail diagnostique et le moment de l'émission ne changent rien [s9] [s10].

> [!INFERRED]
> Je lis là un reçu qui fonctionne parce qu'il pointe vers l'avant. La moitié fidèle de la note, ce qui s'est passé et quand, est celle qui se révèle inerte, et c'est le partage que le travail sur les harnais retrouve par une méthode entièrement différente.

Un troisième papier énumère des conditions d'applicabilité, des indices de risque, des règles d'évitement et des notes de récupération [s16]. Chaque item de cette énumération pointe vers l'avant plutôt que vers l'arrière. L'énumération, elle, ne mesure rien: je m'en sers comme vocabulaire et non comme preuve, pour nommer la catégorie que l'ablation a isolée.

## Quand une mémoire de réussites aggrave le choix du mauvais outil

Voici une analogie venue d'un terrain où il n'y a aucun appel fautif. Les paradigmes dominants d'auto-évolution des agents reposent typiquement sur une hypothèse centrale, celle que doter les LLM de mémoires de compétences issues de trajectoires réussies améliorera de façon monotone leurs capacités de résolution de problèmes [s14]. On note ce qui a marché, l'agent progresse. Cela paraît indiscutable.

Les compétences de procédure augmentent de 47 pour cent la marge d'erreur sur le choix de l'outil, par rapport à une base de référence sans mémoire [s15]. Une trace fidèle de ce qui a marché, écrite puis rendue à l'agent, déplace une métrique d'échec dans le mauvais sens.

Je ne prétends pas que cela mesure ma variable de conception. Le banc d'essai diffère, le jeu de tâches aussi, et aucune arithmétique ne relie les deux. En revanche, cela éclaire le même réflexe. Noter ce qui s'est passé, réussite ou échec, ne suffit pas à rendre un contexte utile. Ce qui le rend utile, c'est ce qu'il dit à l'agent de faire au pas suivant, et la transcription d'une trajectoire passée répond à une autre question qu'une affordance.

## L'objection la plus forte, et ce que je ne prétendrai pas

L'objection la plus solide ne porte pas sur la taille des modèles. Elle porte sur le fait que mes deux lignes ne sont pas la même manipulation. Du côté du harnais, le bras gagnant retranche une chaîne. Du côté du reçu, le bras gagnant ajoute une liste. La cellule croisée n'a été exécutée par personne: aucun bras rapporté ne conserve l'appel verbatim tout en ajoutant une liste d'outils de récupération, et aucun ne remplace l'appel par un remplissage neutre qui ne pointe nulle part. Ce que j'appelle une variable de conception unique pourrait donc recouvrir deux effets sans lien, l'un soustractif, l'autre additif.

Je concède que la cellule manque. Ce qui répond à l'objection sur son propre terrain, c'est que chaque ligne porte son propre bras de fidélité, et que tous deux se révèlent inertes: le marquage de l'appel comme échoué reste faible et de signe inconstant selon les environnements [s4], et le détail diagnostique et le moment de l'émission ne produisent aucune différence détectable [s9]. Deux méthodes, deux bras de fidélité, deux résultats plats.

La taille est la seconde objection et elle tient. Le gain correctif négatif est mesuré sur 6 points de contrôle de 135M à 1.7B répartis sur 4 familles [s2], et un modèle de frontière absorbera peut-être un appel fautif autrement. Ma réponse est partielle: le résultat sur les reçus court sur quatre modèles issus de deux familles de fournisseurs et se reproduit chez un troisième [s8], et la perturbation de la sortie d'outil ou de l'observation est le goulet d'étranglement dominant dans la dégradation de robustesse mesurée [s18], ce qui place le canal d'observation là où je le situe, même à plus grande échelle.

Je ne prétendrai pas que le mécanisme est établi. Ce qui s'en rapproche le plus, et je le lis comme une piste plutôt que comme une preuve, est une étude au moment de l'échantillonnage portant sur la génération ouverte, où les modèles répètent des segments déjà présents dans le contexte [s11]. Dans ce même cadre d'échantillonnage, ma lecture est que les défenses usuelles manquent la forme du problème, car les pénalités de répétition, de présence et de fréquence ainsi que le blocage de n-grammes agissent sur la récurrence des jetons plutôt que sur la structure séquentielle d'une boucle [s12]. Un placebo apparié à l'intervention n'y produit aucune réduction comparable, ce qui identifie l'appariement de suffixe comme le mécanisme opérant [s13], et à mon sens ce cadre de génération ouverte est justement la raison pour laquelle le résultat ne se transporte pas sur un appel d'outil fautif sans que je le nomme pour ce qu'il est, une inférence de ma part.

Le changement que j'ai fait dans mon propre harnais est petit, et ce n'est pas une réécriture de la boucle. Quand un appel échoue, le runtime n'ajoute plus l'appel. Il ajoute ce que l'agent peut atteindre ensuite. Cela recouvre peut-être deux effets au lieu d'un. Dans tous les cas, le texte réécrit après un échec est une décision de conception, et dans chaque pile que j'ai ouverte elle revenait à celui qui avait écrit le logger par défaut.
