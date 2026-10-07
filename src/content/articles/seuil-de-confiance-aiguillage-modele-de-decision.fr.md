---
translationKey: decision-model-confidence-gate
lang: fr
slug: seuil-de-confiance-aiguillage-modele-de-decision
title: Un seuil de confiance ne devrait pas porter seul l'aiguillage d'un modèle de
  décision
publishDate: 07-10-2026
tags:
- evaluation
- agents
category: essays
difficulty: 3
sources:
- label: TypeSafe blog, introducing System One models and Jev, calibrated decisions
    claim
  url: https://typesafe.ai/blog/introducing-system-one-models-and-jev
  date: 15-09-2026
- label: Synthpop, does a decision model know when it is guessing, audit subject
  url: https://www.synthpop.ai/resources/does-a-decision-model-know-when-it-is-guessing-post-1
  date: 01-10-2026
- label: arXiv 2610.01006, Beyond Answer Confidence, preprint by the Synthpop audit
    authors, abstract
  url: https://arxiv.org/abs/2610.01006
  date: 01-10-2026
- label: TypeSafe docs, Confidence, high-confidence range
  url: https://docs.typesafe.ai/confidence
  date: 07-10-2026
- label: TypeSafe docs, Jev 1.13 jaggedness, failure-mode table row on choice option
    order
  url: https://docs.typesafe.ai/model-jaggedness/jev-1.13
  date: 07-10-2026
- label: Bartosz Mikulski, TypeSafe's Jev can't see, test setup
  url: https://mikulskibartosz.name/typesafe-jev-guess-what-i-drew
  date: 19-09-2026
contentHash: sha256:0198cfe674d78a2b
publishState: published
---


Un seuil de confiance ne devrait pas porter seul l'aiguillage d'un modèle de décision, à mon avis : sur les entrées qu'il doit arrêter, le chiffre reste souvent élevé. L'équipe qui a audité Jev, le modèle de TypeSafe, rapporte que la confiance suivait la précision sur des tâches familières à choix fermé, mais restait souvent élevée quand la requête ne contenait aucun élément de réponse [s5]. Ce sont deux problèmes distincts, qui appellent deux remèdes distincts, et je n'en vois qu'un seul qui se règle avant qu'on interroge le modèle.

## Le seuil porte tout le poids là où le chiffre dit le moins

D'expérience, l'aiguillage que les équipes recopient est la table de routage livrée par l'éditeur ; je pars donc de là. Elle arrive avec le modèle et transforme une probabilité en action en une ligne de configuration. La page de TypeSafe consacrée à la confiance demande d'agir automatiquement quand la confiance est élevée, puisque le modèle a une lecture claire et que l'on peut se passer d'intervention humaine [s12]. La même page lit une confiance faible comme le signal d'un modèle qui manque d'information, et demande alors de passer la main à un humain ou de basculer sur un autre système [s13].

Cette table suppose que le cas sans information se signale de lui-même par une confiance faible. L'audit ne me donne aucune raison d'y croire : les auteurs jugent la confiance de Jev utile en terrain connu et peu fiable au-delà, et ajoutent que corriger le chiffre après coup n'y change rien [s8]. Si votre zone d'action automatique commence en dessous du niveau où se situe le chiffre sur une requête dénuée de tout élément de réponse, cette requête file tout droit vers une action automatique, et rien dans les journaux ne la signale.

Je ne bâtirais pas un aiguillage sur un tel espoir.

## Ce que TypeSafe promet

Le billet de lancement promet des « décisions calibrées » sur les tâches System One, avec des probabilités qu'il dit « épistémiquement honnêtes » [s1]. Son argument en faveur de l'automatisation va plus loin, et je le partage : un modèle qui réussit une tâche 95 % du temps sans dire quand il se trouve dans les 5 % restants ne peut pas automatiser cette tâche [s2].

Ce sont deux propriétés différentes, et le billet, à mon sens, les confond. La calibration parle de moyennes : sur un grand nombre de réponses données avec une probabilité annoncée, à peu près cette proportion doit être juste. L'argument de l'automatisation porte sur chaque réponse prise isolément, et un aiguillage tranche une réponse à la fois. Un modèle peut être bien calibré sur un jeu d'évaluation et répondre pourtant avec assurance sur la seule entrée où il n'avait rien pour se décider. Le papier de l'équipe trace la même frontière entre le comportement moyen et le cas isolé [s9].

Je prends l'argument de l'automatisation au mot, et c'est pour cela que je cherche où se cachent les ratés.

## Ce que l'audit de Jev a mesuré

L'audit vient de Synthpop. L'équipe écrit avoir testé le plus connu des modèles de décision, Jev, de TypeSafe AI [s3]. Les auteurs disent avoir soumis les deux promesses de TypeSafe à environ 575 000 appels à Jev [s4]. Tout ce qui suit est le compte rendu de l'équipe, sur un seul modèle.

Sur des tâches familières à choix fermé, rapporte l'équipe, la confiance suivait bien la précision et permettait un filtrage utile ; quand la requête ne contenait aucun élément de réponse, ou que la question dépassait la frontière de connaissance observée, la confiance restait souvent élevée [s5]. C'est sur ce second volet qu'un aiguillage se joue.

Un de leurs tests montre à quoi cela ressemble. Selon les auteurs, Jev attribuait encore en moyenne 32 à 36 % de confiance à son premier choix, alors qu'une répartition uniforme sur les options donnerait environ 1 %, soit à peu près sa fréquence de bonnes réponses [s6].

Imaginez ce résultat sur un tableau de bord d'exploitation. Il se lit comme la réponse mesurée d'un modèle qui pèse ses options, et personne ne réveille un ingénieur d'astreinte pour une réponse mesurée. Qu'un seuil la laisse passer ou non dépend de l'endroit où on le place, et je pense que c'est précisément pour cela que le seuil ne doit pas être le contrôle de ce cas.

## Pourquoi une réponse qui résiste au mélange des options ne prouve rien sur ses fondements

Quand je soupçonne un modèle de deviner, mon premier réflexe est de mélanger les options et de regarder si la réponse bouge. La documentation de TypeSafe propose ce même contrôle, réordonner les options et vérifier que la réponse reste la même, comme remède au biais lié à l'ordre des options [s15]. La page le propose pour ce biais-là. En faire un détecteur de réponses au jugé est une extrapolation de ma part, et je doute d'être le seul à la faire.

> [!CONFIRMED]
> Sur une question portant sur un dé équilibré, où rien ne favorise « one » [s10], les auteurs rapportent que Jev a choisi « one » dans les 720 ordres des six options, avec 0.80 en moyenne [s7].

> [!INFERRED]
> Cette réponse passe à chaque fois le contrôle par mélange des options. Ce contrôle établit que le modèle est d'accord avec lui-même, et je n'y lirais aucun fondement.

À mon sens, le résultat du dé m'enlève le détecteur de réponses au jugé le moins cher dont je disposais. Un modèle qui a pris l'habitude de préférer une option peut la maintenir dans tous les ordres possibles, et le contrôle de cohérence l'en récompense. Le papier de l'équipe nomme l'écart de fond : la calibration rend les probabilités utiles en moyenne, mais n'établit pas si une confiance faible traduit le hasard ou un manque de connaissance [s9]. Si la sortie ne dit pas si le modèle avait de quoi répondre, la vérification doit porter sur l'entrée.

## Le meilleur argument pour le seuil, et ma réponse

L'argument le plus solide contre moi vient de TypeSafe : un modèle qui ne dit pas quand il se trouve dans les 5 % ne peut pas automatiser la tâche [s2], donc un modèle qui le dit est précisément ce dont un aiguillage a besoin. En terrain connu, l'équipe a constaté que la confiance remplissait ce rôle et permettait un filtrage utile [s5]. La documentation de TypeSafe conseille par ailleurs de partir de seuils prudents, de tester sur ses propres données et d'ajuster au fil des résultats [s14]. Suivez ce conseil et vous obtiendrez un filtre qui fonctionne sur le trafic que vous avez déjà vu.

J'ai deux réponses. La première : le terrain connu n'a jamais été l'endroit où le seuil peinait, et les auteurs situent la défaillance au-delà [s8] ; affiner le réglage sur davantage de données du même type renforce donc le filtre là où il marche déjà. La seconde : « vos propres données », ce sont des données étiquetées. D'expérience, un jeu étiqueté contient rarement des questions sans réponse, parce que personne n'étiquette un cas où il n'y a rien à étiqueter. Le cas sans élément de réponse est le plus souvent absent des données mêmes sur lesquelles on règle le seuil, et un réglage soigneux a donc peu de chances de le voir.

Je garde donc le seuil, et en terrain connu je l'utiliserais exactement comme TypeSafe le décrit. Je refuse simplement qu'il se tienne seul entre une entrée vide et une action automatique.

## Contrôler l'entrée d'abord, puis mesurer la fuite

La structure sur laquelle je bâtirais sépare des défaillances qui se ressemblent trait pour trait dans une ligne de journal : une réponse assurée, une action automatique, aucune alerte.

| Cas | Où il se situe | Ce que montrent les sources | Le contrôle que j'utiliserais |
| :--- | :--- | :--- | :--- |
| Aucun élément de réponse dans la requête | l'entrée | la confiance restait souvent élevée [s5] | des contrôles déterministes avant le modèle |
| Au-delà de ce que le modèle sait | le modèle | la confiance restait souvent élevée [s5] | une personne sur les cas hors du périmètre validé |
| Une attirance vers une seule réponse | la distribution des réponses | « one » dans les 720 ordres [s7] ; airplane pour 209 des 400 dessins [s17] | une alerte sur la part de chaque réponse |
| Terrain connu | ni l'un ni l'autre | la confiance suivait la précision [s5] | le seuil |

L'aiguillage que je déploierais :

```python
def route(case, model, threshold):
    if missing_required_fields(case) or not case.retrieved_evidence:
        return "human"  # rien sur quoi décider : ne jamais interroger le modèle
    answer = model.decide(case)
    if answer.confidence < threshold:
        return "human"
    return answer

def leak(cases, model, threshold):
    stripped = [strip_evidence(case) for case in cases]
    return [c for c in stripped if model.decide(c).confidence >= threshold]
```

L'ordre compte. Les contrôles d'entrée sont peu coûteux, déterministes, et le modèle n'a aucun moyen de les contester : un champ requis est présent ou absent, et la recherche de contexte a renvoyé des documents ou est revenue vide. Un cas qui n'offre rien sur quoi décider n'atteint jamais le seuil. `leak()` mesure ce qui se passe sans cette couche : la fonction produit, pour de vrais cas, une copie vidée de ses éléments de preuve, puis applique le seuil seul à ces copies. Chaque copie qu'elle renvoie est du trafic que le seuil automatiserait sur du vide. Je lis tout compte non nul comme la mesure de cette fuite, et je lancerais ce test en intégration continue à chaque changement de version du modèle ou de seuil.

Un contrôle de présence attrape un champ vide, mais un champ rempli de texte hors sujet le franchit sans encombre. Je viderais donc aussi par substitution, en remplaçant les éléments de preuve par un texte sans rapport et de même forme, et je m'attendrais à ce que cette variante échappe aux deux contrôles. C'est là que commence le risque résiduel.

Un testeur extérieur a observé la troisième ligne du tableau sous un autre angle. Bartosz Mikulski a converti ses dessins en texte et a fait deviner à Jev ce qu'ils représentaient [s16] ; Jev a répondu airplane pour 209 des 400 dessins [s17]. À mes yeux, c'est la même attirance vers une seule réponse que celle du dé, visible dans la distribution des réponses sans lire une seule probabilité. D'où le troisième contrôle : suivre la part de chaque réponse dans le trafic réel, et alerter quelqu'un quand une option en accapare une part démesurée. Il est déterministe, il vit hors du modèle, et aucune réponse du modèle ne peut le contourner.

> [!WARNING]
> Le mode de défaillance que je nommerais est l'assurance à vide : une entrée sans rien sur quoi s'appuyer, une probabilité qui a l'air d'un savoir, et une action automatique que personne ne relit.

## Ce qu'aucun des deux contrôles ne ferme

La deuxième ligne du tableau est la plus difficile. Les champs sont présents, la recherche de contexte renvoie quelque chose, et le modèle ne connaît pas la réponse. C'est le cas situé au-delà de la frontière dans le constat de l'audit cité plus haut, où l'équipe a vu la confiance rester souvent élevée là aussi [s5] ; c'est aussi le terrain où les auteurs jugent le chiffre peu fiable [s8]. Les contrôles d'entrée le laissent passer, et un seuil le laisse souvent passer aussi.

Ma recommandation : garder une personne sur les décisions qui sortent du périmètre de tâches sur lequel l'aiguillage a été validé, et traiter ce trafic comme un risque résiduel borné, avec un responsable nommé. Le nommer, c'est ce qui permet à quelqu'un de lui consacrer un budget.

> [!NOTE]
> Cet argument repose sur un seul modèle testé par une seule équipe. Les auteurs indiquent que d'autres versions et d'autres familles de modèles peuvent se comporter différemment [s11], et le billet signale qu'une déclaration de toute relation commerciale avec TypeSafe attend encore la confirmation des auteurs [s18]. Lancez `leak()` sur votre propre modèle avant de faire confiance à son chiffre.

Un aiguillage qui n'a jamais vu d'entrée vide n'a pas été testé.
