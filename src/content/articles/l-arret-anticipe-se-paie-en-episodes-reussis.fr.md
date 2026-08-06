---
translationKey: arret-anticipe-sondes-2026-08
lang: fr
slug: l-arret-anticipe-se-paie-en-episodes-reussis
title: L'arrêt anticipé se paie en épisodes réussis
publishDate: 06-08-2026
tags:
- agents
- evaluation
category: essays
difficulty: 4
sources:
- label: Latent Programming Horizons in Coding Agents (arXiv)
  url: https://arxiv.org/abs/2607.05188
  date: 06-07-2026
- label: Doomed from the Start, probe timing (arXiv)
  url: https://arxiv.org/abs/2607.06503
  date: 07-07-2026
- label: ActProbe, the white-box objection (arXiv)
  url: https://arxiv.org/abs/2606.08508
  date: 07-06-2026
contentHash: sha256:9e397ae4a635ab2b
publishState: published
---


L'arrêt anticipé d'un run d'agent s'achète au moment où l'on sert le modèle, et il se paie en épisodes réussis que votre cible de rappel a décidé de tuer.

On aborde l'arrêt anticipé comme un levier de coût, et l'argumentaire s'écrit tout seul : coupez les runs qui n'aboutiront pas, gardez le budget de tokens. Le travail sur TextCraft et WebShop qui alimente cet argumentaire rapporte des réductions de tokens générés de 60.2% et 54.9% pour une cible de rappel de 90%, et de 45.0% et 41.5% dès que la cible passe à 95% [s5]. Divisez la seconde paire par la première et le curseur montre les dents : environ un quart des économies part dans les cinq derniers points de rappel. Ce rapport est mon calcul sur leurs chiffres, et c'est le nombre que je poserais sur la table d'une équipe avant que quiconque écrive une porte.

## Ce que la sonde lit, et avec quelle avance

Une lecture linéaire du flux résiduel décode un état d'exécution que l'agent n'a pas encore produit. Sur des agents de codage, le travail sur l'horizon latent rapporte qu'une sonde de régression logistique posée sur les états cachés décode si le code courant s'analyse syntaxiquement, passe sa suite de tests, réduit le nombre de tests en échec et introduit des régressions, avec une AUC atteignant 0.83 pour la correction, sur deux modèles et deux benchmarks [s1]. La trajectoire porte donc son propre dénouement avant que ce dénouement n'existe sur le disque.

C'est l'avance qui m'intéresse. Des sondes entraînées à prédire le résultat d'éditions futures restent au-dessus du hasard jusqu'à environ 25 pas avant que ces éditions ne soient matérialisées, ce que les mêmes auteurs nomment l'horizon de programmation latent de l'agent [s2]. Vingt-cinq pas, dans une boucle d'agent, couvrent l'essentiel d'une sous-tâche.

Une seconde équipe, sur une autre famille de tâches et avec une liste d'auteurs disjointe, retrouve la même forme : des sondes linéaires légères posées sur les activations internes prédisent l'échec final d'une tâche dès le premier tour d'interaction, nettement plus tôt que les méthodes de surveillance fondées sur le seul comportement observable [s4]. Deux laboratoires, deux familles de benchmarks, une même asymétrie. Le signal est là bien avant que la trace ne le laisse voir. Je tiens ce constat pour acquis et je consacre le reste de ce billet à ce qu'il coûte de l'exploiter.

## Ce que la porte rapporte, et ce qu'elle tue

C'est en transformant ce signal en porte que l'ingénierie, et la facture, apparaissent vraiment. Le travail sur TextCraft et WebShop ne s'arrête pas à une AUC. Il construit une cascade pilotée par le rappel, puis il la certifie : la cascade est gelée puis certifiée sur des données indépendantes, de sorte que les épisodes finalement réussis franchissent toutes les portes d'arrêt à un taux de rappel global spécifié par l'utilisateur, ce qui donne une garantie de rappel post-sélection exacte [s7]. Ce certificat est ce qui rend une telle porte livrable, et c'est aussi la ligne que personne ne budgète.

Lisez la garantie à l'envers et vous obtenez le coût d'exploitation. Une cible de rappel de 90%, c'est la promesse permanente de tuer environ un épisode finalement réussi sur dix, et cela se règle en production, run après run, tant que la porte est active. Les économies occupent l'autre extrémité du même curseur : le même travail rapporte 60.2% et 54.9% à 90% de rappel contre 45.0% et 41.5% à 95% [s5], mesurés sur TextCraft et WebShop avec Qwen-2.5-7B, Llama-3.2-3B et Qwen3-1.7B [s8]. Resserrer la promesse d'un sur dix à un sur vingt coûte environ un quart des économies de tokens, d'après mon calcul sur leurs chiffres. Aucune des deux extrémités n'est évidemment la bonne, et c'est précisément pour cela que l'arbitrage relève d'une revue de conception plutôt que d'une valeur par défaut dans un fichier de configuration.

Le certificat a lui aussi un coût d'acquisition, absent de tous les tableaux de résultats : des épisodes étiquetés sur des données indépendantes. Ni le jeu d'entraînement, ni votre trafic de production tant que personne ne l'a étiqueté. À mon sens, c'est cet élément qui enlise le projet, des mois après la démonstration en notebook qui avait convaincu tout le monde.

> [!CONFIRMED]
> La surveillance fondée sur le seul comportement est systématiquement plus faible que le sondage des états cachés, et ajouter des traits comportementaux aux sondes sur états cachés n'apporte aucun gain supplémentaire [s6].

> [!INFERRED]
> Je lis cette comparaison comme un résultat d'achat autant que de modélisation. Si la trace est le canal le plus faible et que le canal le plus fort vit à l'intérieur du processus qui sert le modèle, alors la question de savoir si vous pouvez construire une bonne porte a déjà été largement tranchée par celui qui a choisi votre pile d'inférence, bien avant que quiconque n'ouvre un éditeur.

## Le canal qu'un point d'accès hébergé ne vend pas

La question de l'accès devient donc incontournable, et je veux être précis sur ce qu'elle autorise à dire.

Toutes les démonstrations ci-dessus lisent des états cachés. Un point d'accès d'inférence hébergé renvoie des tokens et, sur les produits que j'utilise, des log-probabilités au mieux ; rien dans cette réponse n'est un flux résiduel. Je le formule comme ma lecture de ce que ces API exposent, puisqu'il s'agit d'une affirmation sur des produits commerciaux et non sur l'un des travaux cités ici. La littérature sur la détection d'échec fait la même hypothèse depuis l'autre rive quand elle traite l'accès boîte blanche aux internes de la politique comme un coût à éviter [s9]. Si la classe de porte réellement démontrée a besoin des internes, un point d'accès qui ne renvoie que des tokens la referme, et cette fermeture a eu lieu au moment de l'achat.

Ce que je me garde d'affirmer, c'est que servir ses propres poids revient moins cher. La prime de service n'apparaît nulle part dans cette base de preuves, si bien que le calcul complet ne peut pas être mené à partir de ces articles. Et les économies chiffrées portent sur de petits modèles ouverts, sur deux benchmarks contraints : Qwen-2.5-7B, Llama-3.2-3B et Qwen3-1.7B sur TextCraft et WebShop [s8]. Une coupe de 60.2% des tokens sur un agent de 1.7B à 7B borne ce que l'on peut inférer d'un agent de codage à l'échelle frontière, dont cette littérature n'a jamais mesuré l'économie. Mon affirmation porte sur la capacité et sur le calendrier : quelle que soit la valeur qu'une porte sur états cachés aurait chez vous, vous ne pouvez pas l'installer derrière un point d'accès qui ne renvoie que des tokens, et ce choix se fait une seule fois, en amont.

## Le meilleur argument contre

Le meilleur argument contre tout ce qui précède, c'est que l'exigence d'accès aux internes n'est qu'un artefact de l'ordre dans lequel les détecteurs ont été construits.

ActProbe le porte. Ses auteurs rapportent qu'il lève des alertes avant que les échecs ne deviennent visuellement reconnaissables et qu'il améliore la frontière de Pareto entre précision (F1) et précocité de la détection d'échec, avec un gain d'hypervolume moyen de +12.7% sur les lignes de base à traits internes comme externes, et une avance de +9.0% de ROC-AUC en détection précoce sur des tâches non vues [s10]. Regardez bien quelles lignes de base sont battues : celles à traits internes en font partie. Un détecteur qui travaille dans l'espace des actions et dépasse les traits internes sur leur propre terrain, voilà exactement le résultat qui dissout mon argument d'accès, et il vient du travail même qui présente l'accès boîte blanche aux internes de la politique comme le coût à éviter [s9]. La réfutation facile, celle qui rappelle qu'ActProbe est évalué sur de la manipulation robotique alors que vos agents vivent dans un shell, mérite une phrase de mise en garde et pas davantage. Les écarts de domaine se comblent.

| canal de signal | ce qu'il exige au moment de servir | ce que les mesures rapportent |
| --- | --- | --- |
| sondes sur états cachés | une lecture des activations internes dans le processus qui sert le modèle | des coupes de tokens de 60.2% et 54.9% à 90% de rappel sur TextCraft et WebShop [s5] |
| surveillance du seul comportement | la trace, que tout point d'accès renvoie déjà | systématiquement plus faible, les traits comportementaux n'apportant aucun gain supplémentaire aux sondes sur états cachés [s6] |
| détection dans l'espace des actions | les actions de l'agent, les internes de la politique restant fermés [s9] | un gain d'hypervolume moyen de +12.7% et une avance de +9.0% de ROC-AUC en détection précoce sur des tâches non vues [s10] |

Chaque ligne de ce tableau a besoin de la même chose pour devenir un produit : des épisodes étiquetés qui certifient un taux de rappel sur des données indépendantes [s7]. ActProbe rapporte une meilleure frontière, et une frontière ne devient une promesse inscriptible dans un runbook qu'après cette étape de certification. Les deux résultats ne sont donc pas encore des objets de même nature, et ma réponse à l'attaque la plus forte passe par la facture plutôt que par la qualité du signal.

Les commodités côté entraînement n'y changent rien non plus. Les sondes se transfèrent d'un benchmark à l'autre sans réentraînement, ce que les auteurs avancent comme preuve de validité externe [s3]. Le résultat est réel et il escompte la facture d'entraînement. La facture de certification, elle, reste exactement où elle était, parce qu'elle découle de la construction de la garantie [s7] et non de la manière dont le détecteur a été ajusté. Ma prémisse d'accès porte donc une date de péremption annoncée : un détecteur à signal externe certifié à un taux de rappel spécifié par l'utilisateur, sur des tâches d'agent, y met fin. Tant qu'il n'existe pas, la prémisse tient sur l'état actuel des preuves, et c'est la chose la plus forte que l'on puisse en dire.

## Ce que je livrerais

Choisissez la cible de rappel avant de regarder les économies de tokens, et chiffrez-la. Écrivez la fraction d'épisodes finalement réussis que vous acceptez de tuer, multipliez-la par votre volume de runs et par ce qu'un run réussi tué coûte à un utilisateur, puis comparez le résultat à une ligne de tokens que vous pouvez lire sur une facture. Les chiffres publiés vous donnent la forme de l'arbitrage à 90% et à 95% [s5] ; c'est votre propre coût de suppression qui décide de l'extrémité où vous vous placez.

Budgétez ensuite les épisodes étiquetés. Une garantie ne vaut que les données indépendantes sur lesquelles elle a été certifiée [s7], et ce corpus est une ligne récurrente, à rafraîchir chaque fois que le modèle, l'échafaudage de l'agent ou la distribution des tâches bouge sous vos pieds.

Au moment de l'achat, posez la question ennuyeuse tant qu'elle a encore une réponse : pouvons-nous lire le signal, et si le fournisseur répond non aujourd'hui, que faudrait-il pour que cela change. Les équipes repoussent régulièrement ce point jusqu'à ce que la porte devienne une réécriture au lieu d'une fonctionnalité.

Surveillez enfin la condition de péremption. Le jour où un article rapportera un détecteur dans l'espace des actions certifié à un taux de rappel spécifié par l'utilisateur sur de vraies tâches d'agent, la moitié de cet argument qui parle d'accès s'éteindra et seule la moitié qui parle de certification survivra. J'y verrais une bonne nouvelle. La facture qui m'inquiète vraiment est libellée en épisodes réussis, et aucun changement de canal ne la fait disparaître.
