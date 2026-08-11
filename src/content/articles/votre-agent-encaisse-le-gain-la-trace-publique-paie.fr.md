---
translationKey: agentic-coding-thins-the-public-record
lang: fr
slug: votre-agent-encaisse-le-gain-la-trace-publique-paie
title: Votre agent de code encaisse le gain, la trace publique paie l'addition
publishDate: 11-08-2026
tags:
- agentic-coding
- agents
- retrieval
category: essays
difficulty: 3
sources:
- label: Social to agentic coding, what the study branches
  url: https://arxiv.org/abs/2608.03585
  date: 04-08-2026
- label: Practitioner survey, what 119 engineers report
  url: https://arxiv.org/abs/2608.05561
  date: 06-08-2026
- label: Agent plan files, the repository screen
  url: https://arxiv.org/abs/2608.04661
  date: 05-08-2026
contentHash: sha256:87aafe6b76b195b0
publishState: published
---


Le gain de votre agent de code s'affiche sur votre tableau de bord, et la facture atterrit sur une trace publique qu'aucun tableau de bord ne possède. Le gain est réel et mesuré: dans une communauté simulée scindée en conditions parallèles, les tâches terminées augmentent de 39.0% alors que l'adoption plafonne à 26.0% [s4]. Le débit apparaît dans la même exécution, où l'interaction humain-humain directe tombe de 32.4% à 11.6% [s2]. À mon sens, la question qui mérite discussion porte sur qui finit par payer cette vitesse.

## Le grand livre n'a qu'une colonne, et elle est la vôtre

Les deux chiffres sortent de la même exécution, ce qui rend l'argument comptable plutôt que nostalgique. Au crédit, l'introduction des agents de code augmente les tâches planifiées et terminées de 34.0% et 39.0% respectivement, et fait passer le temps médian de réalisation de 45 à 20 minutes [s4]. Au débit, les chemins d'exécution changent de forme: les modes impliquant un agent montent à 57.3%, et 40.3% des tâches se terminent dans des boucles fermées assistées par agent [s2]. Une boucle fermée commence et s'achève dans la session d'une seule personne. Elle laisse un commit. Elle ne laisse pas de fil de discussion.

La ligne qu'un responsable d'équipe devrait relire, c'est la répartition. L'adoption n'atteint que 26.0%, et les gains se concentrent chez les développeurs déjà les plus actifs et les mieux connectés [s4]. Le crédit revient donc à une minorité déjà en avance, tandis que le débit est facturé à tous ceux qui liront la trace plus tard. Votre tableau de bord a une colonne pour la première moitié et aucune pour la seconde, et c'est ainsi qu'une externalité résiste à une équipe compétente.

## Le chiffre de couverture est une facture sur une infrastructure déjà payée

Voici le chiffre qui a changé ma lecture de l'étude. Sur un banc d'essai de récupération standardisé, le corpus produit sous la condition avec agents de code atteint 22.3% de couverture de connaissance contre 81.1% pour le corpus humain réel, et il exige davantage d'étapes de récupération pour un taux de réussite inférieur [s3]. Le banc d'essai mesure la capacité de la trace à répondre à une question ultérieure. Le volume en est absent. Personne n'a écrit moins d'octets; le corpus a quand même perdu son utilité.

Trois systèmes que la plupart des équipes font tourner lisent précisément ce corpus: l'accueil des nouveaux arrivants adossé à la récupération, la recherche dans les tickets et les demandes de fusion, et le corpus de préentraînement du prochain modèle. Vous avez déjà payé les deux premiers et vous comptez sur le troisième. Aucun ne vous préviendra que son entrée s'est appauvrie; ils répondront moins bien, plus lentement, plus souvent, et l'équipe responsable ne verra jamais la facture.

> [!CONFIRMED]
> Le corpus produit sous la condition avec agents atteint 22.3% de couverture de connaissance contre 81.1% pour le corpus humain réel, avec davantage d'étapes de récupération et un taux de réussite inférieur [s3].

> [!INFERRED]
> Ma lecture: "nous produisons plus d'artefacts que jamais" ne répond pas à ce résultat, et je l'ai pourtant entendu servir de réponse.

## Le comportement sous l'agrégat

Une simulation se balaie d'un revers de main quand le comportement qu'elle agrège reste invisible ailleurs. Ce n'est pas le cas ici. Une enquête exploratoire menée auprès de 119 praticiens du logiciel a produit des réponses évoquant des schémas compatibles avec une surdépendance, en particulier le fait de privilégier le modèle plutôt que la documentation ou l'avis d'un pair, tout en continuant à vérifier les sorties générées [s5]. Gardez les deux moitiés de ce résultat. Les praticiens vérifient toujours la sortie. Ce qu'ils ont cessé de faire, c'est de solliciter le collègue.

Il s'agit d'un changement de canal, et y voir du laisser-aller mène au mauvais remède, en général une liste de contrôle. Une question qui partait vers une personne et laissait une réponse consultable part maintenant vers un modèle et laisse un journal de session sur un portable. La réponse était juste, la revue sérieuse, le ticket proprement fermé, et la trace s'est quand même appauvrie. Or toutes les incitations visibles poussent dans ce sens, parce qu'interroger le modèle va plus vite et que le coût de ne pas solliciter le collègue retombe sur une personne pas encore embauchée.

## Ce qu'une communauté simulée tranche, et où elle s'arrête

Je dois borner mon argument avant qu'un lecteur ne s'en charge. Les ordres de grandeur affichés viennent d'une simulation multi-agents pilotée par LLM, initialisée avec des données GitHub réelles portant sur 1,084 développeurs actifs, dérivée d'un même état de communauté préchauffé vers des conditions parallèles No-CA et CA sur 4 semaines [s1]. Ce protocole rend les chiffres comparables: même communauté de départ, une seule variable modifiée. Il les empêche aussi d'être des statistiques du secteur: personne, moi compris, ne devrait citer 22.3% de couverture comme une propriété mesurée de dépôts réels [s3].

La preuve tirée des fichiers de plan porte une limite posée par ses auteurs, qui cadrent les Agent Plans conservés dans les dépôts, sous des répertoires propres à chaque outil, comme un artefact étroit mais informatif pour étudier l'intention de tâche et les consignes d'exécution dans les workflows humain-agent [s7]. Ce qui subsiste est une direction. L'amplitude, elle, ne voyage pas. Cela suffit ici, parce que des praticiens hors simulation décrivent le même comportement [s5] et que le remède que je défends coûte peu.

## Le meilleur argument contre l'obligation de fichier de plan

Le remède évident, celui dont je suis parti, consiste à imposer l'artefact. Les agents de code produisent déjà des plans. En committer un coûte un fichier. Et presque personne ne le conserve: un criblage de 36,710 dépôts GitHub appartenant à des projets logiciels structurés a identifié 85 fichiers de plan au format Markdown, répartis sur 10 dépôts [s6]. L'artefact existe, le taux de conservation frôle zéro, la marge saute aux yeux. L'argument est bon, et je le crois faux.

Il est faux sur le mécanisme. Ce qui a disparu quand l'interaction humain-humain directe s'est effondrée [s2], c'était du contenu de décision: ce qui a été choisi, ce qui a été écarté, pourquoi l'approche évidente n'a pas été retenue, fourni par une deuxième personne qui n'avait pas le contexte. Un plan généré est la sortie du même système reformulée avant que le travail soit fait. Il décrit une intention. Il ne consigne aucun choix que quelqu'un ait contesté. Imposez-en un par tâche et vous injectez du texte abondant et pauvre en information dans l'index même que l'étude décrit déjà comme lent et lacunaire [s3]. L'issue plausible est un index plus mauvais, avec plus de documents.

Reste l'effet de sélection, qui retourne le taux de base contre le remède. Ces dix dépôts ont conservé des fichiers de plan parce que quelqu'un a choisi de le faire [s6], et le cadrage de leurs auteurs, un artefact étroit mais informatif, va dans ce sens [s7]. Imposez le comportement et la sélection qui rendait ces artefacts informatifs disparaît. Le mode de défaillance porte un nom, la paperasse obligatoire: toute organisation ayant exigé un document de conception par ticket a vu l'exigence satisfaite par du texte gabarit, livré à l'heure, lu par personne.

| Exigence | Qui la rédige | Régime de volume | Ce qu'elle ajoute à l'index | Mode de défaillance |
| --- | --- | --- | --- | --- |
| Fichier de plan par tâche d'agent | l'agent | un par tâche | une intention reformulée | dilution par la paperasse |
| Note de décision à une fusion irréversible | la personne responsable | un par changement d'interface, de dépendance ou de contrat de données | l'option retenue et l'option écartée | des notes indiscernables du diff |

## Exigez la décision, et posez la barrière là où le changement est irréversible

Voici donc la position que vous pouvez refuser. Exigez du contenu de décision, et exigez-le uniquement là où un changement se défait mal: une fusion qui modifie une interface, une dépendance ou un contrat de données ne passe pas sans une note courte, écrite par un humain, indiquant l'option retenue et l'option écartée. Nulle part ailleurs. Pas de fichiers de plan, pas de paperasse par ticket, pas de paragraphe de charte demandant aux gens de mieux communiquer.

La décision a déjà eu lieu, si bien que la note consigne un choix existant. Son volume suit la fréquence des changements irréversibles, qui est faible; le volume de tâches, que les agents font gonfler, reste hors du calcul.

Demandez-la dans une charte et vous l'obtiendrez pendant un trimestre. Mettez-la dans le dépôt et elle tient:

```
git log -1 --format=%B "$SHA" | grep -qE '^Decision: ' || exit 1
```

branché sur le filtre de chemins ou le label qui marque la frontière. Elle refuse la fusion au lieu de rappeler quoi que ce soit, et elle est déterministe: personne ne discute pour savoir si ce changement-ci comptait.

> [!WARNING]
> La note ne vaut rien si c'est l'agent qui l'écrit. Une note de décision produite à partir du diff reformule le diff, et elle passera le grep ci-dessus.

Je pose le pari pour qu'il puisse être perdu. J'ai tort si les dépôts qui adoptent cette règle ne montrent aucune amélioration de récupération sur une année, ou si la note médiane se révèle indiscernable de la sortie d'agent qu'elle accompagne. C'est l'expérience que je mènerais, et je la mènerais sur les journaux de recherche, car un questionnaire ne dit que ce que les gens croient de leurs habitudes.
