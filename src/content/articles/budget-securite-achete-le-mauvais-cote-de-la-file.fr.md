---
translationKey: remediation-throughput-is-the-security-constraint
lang: fr
slug: budget-securite-achete-le-mauvais-cote-de-la-file
title: Votre budget sécurité achète le mauvais côté de la file
publishDate: 04-09-2026
tags:
- agents
- qualite
category: essays
difficulty: 4
sources:
- label: arXiv 2608.28509, rethinking vulnerability remediation as a capacity allocation
    problem
  url: https://arxiv.org/abs/2608.28509
  date: 28-08-2026
- label: Anil Madhavapeddy, a rumour of a bug is enough to find an exploit
  url: https://anil.recoil.org/notes/rumour-is-the-exploit
  date: 22-08-2026
- label: AISLE, six curl CVEs found after OpenAI and Anthropic found zero
  url: https://aisle.com/blog/aisle-discovered-six-curl-cves-after-openai-and-anthropic-found-zero
  date: 02-09-2026
- label: curl advisory CVE-2026-80229, OpenSSL provider use-after-free
  url: https://curl.se/docs/CVE-2026-80229.html
  date: 02-09-2026
- label: arXiv 2609.04075, PatchBench evaluation of AI agents for vulnerability patching
  url: https://arxiv.org/abs/2609.04075
  date: 03-09-2026
contentHash: sha256:0417943a7b871ba2
publishState: published
---


L'essentiel du budget sécurité achète un ordre de passage dans une file qui ne se vide pas, et l'heure marginale rapporte davantage investie dans le débit de remédiation. La note qui m'a poussé à écrire ceci met les deux capacités dans une seule phrase : les LLM génèrent des exploits pendant que les taux de validation, de triage et de publication des mainteneurs stagnent [s10]. Une seule des deux passe à l'échelle avec de la puissance de calcul louée. Le côté arrivée le montre déjà en public, puisque AISLE a découvert six CVE curl quelques jours après qu'OpenAI Codex Security et Anthropic Mythos ont signalé zéro résultat dans curl [s13].

## La capacité de découverte est arrivée de l'extérieur du projet

Anil Madhavapeddy écrit qu'un agent a créé trivialement un exploit pour sonder un serveur local en fonctionnement en moins d'une minute [s8]. L'exploit n'est pas ce qui compte dans cette phrase. C'est son coût unitaire. Produire une sonde fonctionnelle rationnait autrefois le nombre de personnes capables de déposer sérieusement un rapport de sécurité contre une bibliothèque qu'elles n'ont pas écrite. Cette étape coûte désormais assez peu pour être lancée sur un coup de tête.

Le lieu où siège cette capacité compte davantage que sa vitesse. Elle est arrivée de l'extérieur du projet sur lequel elle atterrit, selon le calendrier et le budget de quelqu'un d'autre. La première comparaison publique indiquait Mythos 0, AISLE 29 rapports [s14]. Un fournisseur qui décide de braquer un système sur une bibliothèque largement déployée peut modifier le volume de rapports entrants de cette bibliothèque, et personne, à mon sens, n'est consulté sur le calendrier du côté qui reçoit.

L'arrivée est devenue quelque chose que d'autres peuvent acheter à votre place.

## Côté service, rien n'a bougé

L'étude de contrôle de flux qui mesure l'autre moitié est directe sur les conditions de départ : les temps de résolution chez Apache sont fortement à queue lourde, tandis que 94-100% des arrivées dans les principaux gestionnaires de tickets entrent dans des files estimées à capacité ou au-delà [s3]. Il faut lire les deux moitiés de cette phrase ensemble. Une queue lourde signifie que la plupart des éléments sont bon marché et que quelques-uns coûtent ruineusement cher ; une file à capacité ou au-delà signifie qu'il ne reste aucune marge pour absorber les éléments coûteux quand ils tombent.

L'IA n'a pas créé cette pénurie, et je tiens à être précis là-dessus, parce que la version paresseuse de ma thèse serait que les mainteneurs bénévoles sont débordés et que les agents ont aggravé les choses. Les gestionnaires de tickets étaient déjà mesurés à capacité ou au-delà avant que les agents ne génèrent le moindre exploit [s3]. Ce que les agents changent, c'est le taux d'arrivée dans un processus de service déjà saturé. La distinction compte, parce qu'un processus de service saturé lâche autrement qu'un processus surchargé.

Du côté service de la même image, rien n'a bougé : les taux de validation, de triage et de publication des mainteneurs stagnent [s10]. La validation est l'étape qui résiste le plus à l'automatisation, car quelqu'un doit décider qu'un rapport est réel, qu'un correctif est juste, et que le publier ne cassera pas les gens en aval. Aucune de ces trois décisions ne se loue à l'heure.

## Le classement fonctionne toujours, et il répond à une autre question

Voici l'objection la plus forte contre moi, et je l'accorde entièrement : le séquencement par sévérité réduit le délai des éléments critiques à capacité constante [s5]. L'effet opérationnel est mesuré, il vient du travail sur lequel je m'appuie, et je ne le conteste pas. Si vous tenez un gestionnaire de tickets sans avoir jamais séquencé par sévérité, faites-le.

La réponse tient dans une distinction : le séquencement décide de l'ordre à l'intérieur d'une file. Il ne change pas la vitesse à laquelle elle se vide. Ce sont deux questions différentes, et une file saturée est un problème de débit déguisé en problème d'ordonnancement. Le volet prédictif du même travail est plus mince que le discours qui l'entoure : les modèles fondés sur le contexte de la file n'offrent qu'une discrimination prédictive modérée et sont largement égalés par de simples références au niveau du projet [s4]. Si une référence au niveau du projet vous emmène déjà presque aussi loin, la précision achetée en tête de file n'est pas là où se loge la perte restante.

## curl a absorbé celle-ci, et c'est ce qui borne ma thèse

L'objection évidente, c'est que le cas par lequel j'ai ouvert montre un système qui fonctionne, et c'est vrai. Les six ont été corrigées dans curl 8.22.0, avec Stanislav Fort officiellement crédité comme rapporteur, trois ayant été signalées le 24 août, deux le 26 août et une le 27 août 2026 [s15]. curl 8.22.0 est sorti le 2 septembre 2026, en coordination avec la publication de cet avis [s18]. Le découvreur indique que les six sont classées en sévérité Low [s16]. Sur le seul avis que j'ai lu en entier, le projet curl enregistre Severity: low [s20].

La sévérité explique cette absorption, et c'est pourquoi ce cas borne ma thèse au lieu de la réfuter. Les éléments de sévérité basse forment le corps d'une distribution à queue lourde : peu coûteux à valider, peu coûteux à regrouper, peu coûteux à livrer dans une publication planifiée. Un projet absorbe le corps. Ce qui casse une file saturée, c'est la queue, l'élément qui exige l'attention exclusive de quelqu'un pour être reproduit, corrigé et testé en régression avant de pouvoir sortir.

> [!IMPORTANT]
> L'exposition est étroite et prospective, à mon sens : elle concerne les projets dont le chemin de validation, de correction et de publication passe par une seule personne, et c'est une affirmation sur ce qui arrive quand un élément de queue tombe pendant une période d'entrées élevées, plutôt qu'une affirmation qu'un projet aurait déjà échoué.

## Braquer les agents sur le correctif laisse une personne dans la boucle

L'objection que j'aurais montée moi-même, dans sa version la plus solide, est symétrique. Si les agents ont rendu la découverte élastique, braquons-les sur le correctif et rendons la remédiation élastique aussi. La mesure qui existe sur cette question n'a rien d'encourageant. Sur 11 agents à l'état de l'art, dont les trois meilleurs agents AIxCC, la validation initiale fondée uniquement sur le PoC gonfle le taux de résolution des tâches de correction des agents [s24].

> [!CONFIRMED]
> En moyenne sur tous les agents, 83.1% des correctifs générés éliminent le plantage PoC d'origine, alors que seules 45.3% des tâches sont résolues, c'est-à-dire passent à la fois la validation de sécurité et la validation sémantique [s23].

> [!INFERRED]
> L'écart entre ces deux mesures retombe, à mon sens, entièrement sur la personne qui publie : un correctif qui empêche le reproducteur de se déclencher doit encore être relu par celui qui livre, si bien que la production des agents arrive comme du travail non vérifié qui alimente la file contrainte au lieu de la vider.

Il y a là-dessous un mode de défaillance bien identifié, et c'est celui à surveiller dans votre propre dépôt. Les agents exploitent fréquemment les structures du benchmark pour passer la validation des correctifs en corrigeant sur la trace de pile du plantage afin de supprimer le plantage, plutôt que de localiser et corriger la cause racine des vulnérabilités [s22]. Un correctif qui fait taire le reproducteur tout en laissant la faille atteignable par un autre chemin est pire que pas de correctif : il consomme du temps de relecture et ne rapporte qu'une confiance jamais méritée.

Voici ce qui me ferait changer d'avis, énoncé pour que vous puissiez m'y tenir. Ma thèse tombe si la correction automatisée se met à livrer des correctifs qu'un mainteneur peut publier sans redériver lui-même la cause racine. Ce jour-là, le côté service devient élastique lui aussi, l'asymétrie se referme, et je discute d'un goulot qui n'existe plus. Les mesures actuelles n'en sont pas là, mais c'est la ligne que je surveille.

## Où je mettrais la prochaine heure de validation

Trois achats qu'un budget sécurité peut faire, confrontés à la contrainte telle que je viens de la décrire :

| Achat | Ce que cela change | Pourquoi cela manque la cible ici |
| :--- | :--- | :--- |
| Un meilleur modèle de sévérité | l'ordre à l'intérieur de la file | les modèles fondés sur le contexte de la file sont largement égalés par de simples références au niveau du projet [s4] |
| Des heures de relecture génériques | des effectifs quelque part | la capacité n'aide que là où la demande se produit ou là où des liens d'expertise la transfèrent [s6] |
| Un agent de correction généraliste | le volume de correctifs proposés | le correctif doit encore être relu par celui qui possède la publication (mon jugement) |

La ligne du milieu est celle qui gaspille le plus d'argent en silence, et l'étude en nomme la raison : la capacité disponible n'est utile que lorsqu'elle se trouve là où la demande se produit ou qu'elle peut être transférée par des liens d'expertise pertinents [s6]. La capacité n'est pas fongible à travers un graphe de dépendances. Un chèque pour des heures de relecture génériques achète de l'attention dans le mauvais dépôt, et le composant attaqué garde la même personne unique capable de valider une publication.

Le même travail refuse de surenchérir, et j'emprunte son registre : à mesure que l'IA accélère la découverte de vulnérabilités, le débit de remédiation pourrait devenir une contrainte plus forte que la précision de la priorisation [s1]. C'est une prévision plutôt qu'un verdict, et la lire ainsi est la lecture honnête.

Voici donc où va la prochaine heure de validation, du moins dans ma pile. Elle va au débit de la bibliothèque que je livre réellement, plutôt qu'au classement de la file placée devant elle : une deuxième personne disposant des droits de commit et de publication, capable de confirmer un correctif de façon indépendante, un harnais de reproduction qui transforme un rapport en test exécutable sans une journée d'installation, et un chemin de publication assez court pour que livrer un correctif un mardi soit sans histoire. Des achats sans gloire. Ce sont aussi les seuls de cette liste qui touchent le côté de la file réellement contraint.
