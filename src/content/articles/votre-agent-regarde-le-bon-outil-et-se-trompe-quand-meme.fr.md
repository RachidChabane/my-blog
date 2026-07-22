---
translationKey: tool-calling-readout-not-descriptions
lang: fr
slug: votre-agent-regarde-le-bon-outil-et-se-trompe-quand-meme
title: Votre agent regarde le bon outil et se trompe quand même
publishDate: 22-07-2026
tags:
- agents
- evaluation
- llm-oss
category: explainers
difficulty: 3
sources:
- label: Johnson et al., Natural Language Tools (original)
  url: https://arxiv.org/abs/2510.14453
  date: 16-10-2025
- label: Somma, Plante and Premji, NLT replication study
  url: https://arxiv.org/abs/2607.03953
  date: 05-07-2026
- label: Chen, Looking Is Not Picking (attention-segment account)
  url: https://arxiv.org/abs/2606.16364
  date: 15-06-2026
contentHash: sha256:f9065629aba67ae3
publishState: published
---


Si votre agent a choisi le mauvais outil, la formulation de vos descriptions d'outils n'y est presque pour rien. Dans une étude de 2026, la réparation par le prompt récupère au mieux 23 pour cent des échecs, là où une intervention côté restitution en récupère 59 à 91 pour cent [s3]. Les deux moitiés du contraste sortent des chiffres d'un même article, et non d'un rapprochement que j'aurais opéré entre deux études : c'est ce qui me permet de m'y appuyer. Tout l'argument tient là : le réflexe de réparation dominant vise le côté de la frontière dont le plafond a déjà été mesuré, et ce plafond est bas.

Précisons ce que cela autorise, et ce que cela n'autorise pas. Les descriptions d'outils ne deviennent pas inutiles, et l'appel typé par schéma ne devient pas une erreur pour tous les modèles que vous appelez. Ce qui change, c'est l'endroit où se trouve le point d'effort marginal, et la plupart des équipes le dépensent encore en chirurgie de prompt, parce que la chirurgie de prompt se fait en un après-midi.

## Deux mesures, et le rôle de chacune

Deux articles ne valent pas deux fois la preuve, sauf si le second pouvait sortir autrement. Ici, il le pouvait. Johnson et ses coauteurs remplacent l'appel d'outil JSON programmatique par une sortie en langage naturel et mesurent un gain de 18,4 points de pourcentage sur la justesse des appels d'outils, avec une variance de sortie en baisse de 70 pour cent, sur 10 modèles et 6 400 essais ; les modèles à poids ouverts profitent le plus de la bascule et dépassent des alternatives fermées haut de gamme [s1]. Somma, Plante et Premji rejouent la même manipulation et obtiennent 14,9 points de pourcentage au total, 62,3 pour cent de réponses correctes contre 47,4 pour cent pour la version structurée, avec une réduction de 93 pour cent des erreurs critiques, 51 contre 755 [s2].

Ce couple de résultats vaut comme preuve d'indépendance, pas comme taille d'effet. Même manipulation, deux équipes sans lien, aucun décalage sur ce qui compte. D'ailleurs, en production, c'est la variance qui m'intéresse le plus : une couche d'appel d'outils qui se trompe de façon stable se débogue, une couche qui se trompe autrement à chaque tentative, non.

Vient alors l'objection réflexe : le gain aurait été obtenu au prix d'un surcroît de calcul. Or la même réplication mesure une consommation de jetons en baisse de 25,2 pour cent [s2]. Et la forme du gain est révélatrice. Une chute de 93 pour cent des erreurs critiques, face à un écart de justesse globale bien plus modeste, ne ressemble pas à un relèvement uniforme des cas limites : une classe d'échecs catastrophiques disparaît, ce qui est exactement l'effet attendu si la défaillance se produit à l'émission plutôt qu'au moment de comprendre quel outil utiliser.

## À qui la bascule profite, et à qui elle ne profite pas

C'est ici que la version honnête de l'histoire cesse d'être une recommandation universelle. Le gain dépend de la capacité du modèle, et il en dépend dans le sens le plus gênant pour qui voudrait en faire une bonne pratique générale : les modèles sans appel d'outils natif, les modèles de raisonnement et les petits modèles gagnent de +24,0 pp à +43,1 pp, tandis que les modèles de frontière fortement optimisés, que l'article nomme GPT-5 et Gemini 2.5 Pro, présentent un avantage réduit voire inversé [s2].

| Classe de modèle | Effet mesuré | Ce que je fais |
| :--- | :--- | :--- |
| Sans appel d'outils natif, modèles de raisonnement, petits modèles | +24,0 pp à +43,1 pp [s2] | Traiter le canal de sortie comme la première variable à tester, avant toute réécriture de description |
| Modèles à poids ouverts en général | Gains les plus élevés dans l'étude d'origine, au-dessus d'alternatives fermées haut de gamme [s1] | Pareil, et l'intégrer au calcul même de la décision d'auto-hébergement |
| Modèles de frontière fortement optimisés (GPT-5, Gemini 2.5 Pro, tels que nommés par l'article) | Gain qui s'efface, parfois négatif [s2] | Conserver l'appel d'outils natif et investir l'effort dans les évaluations |

> [!WARNING]
> Sur les modèles de frontière testés par la réplication, le bénéfice ne tient plus, et peut jouer contre vous [s2]. Si votre agent tourne sur un modèle fermé fortement optimisé, passer à une sélection d'outils en langage naturel peut vous coûter de la justesse. Le correctif vaut pour une classe de modèles, pas comme règle générale.

Cette clause de portée n'est pas une faiblesse que je dissimule : c'est la thèse elle-même. Un phénomène qui s'atténue à mesure que le post-entraînement couvre mieux le cas est une lacune de couverture, donc la frontière est en train de le combler et ce texte a une durée de vie limitée. C'est précisément cette durée de vie qui rend le sujet urgent pour celles et ceux qui font tourner des modèles de 8B ou 30B sur leur propre matériel : le trou, chez eux, n'est pas comblé.

## Ce qui casse n'est pas la recherche de l'outil

Le récit du mécanisme vient d'une autre équipe, sur d'autres jeux d'évaluation, et il situe la perte avec précision. Le modèle porte son attention maximale sur le bon outil dans 80 pour cent des cas, contre une base de hasard à 21 pour cent, et l'outil attendu n'est le segment le moins regardé par l'attention que dans 10 pour cent des cas [s3]. Autrement dit, la recherche de l'outil est largement résolue. Ce qui dérape, dérape après que le modèle a trouvé l'outil.

Cela change la nature même du correctif recherché. Dans ces mêmes travaux, la sélection du nom de fonction gagne +11,9 points face à un plafond oracle de +17,9 points, et Seal-Tools en gagne +14,9 [s3]. Un plafond oracle aussi proche du gain mesuré, voilà le détail intéressant : le gain mesuré capte l'essentiel de la marge réellement disponible, ce que je n'ai jamais pu dire d'une technique de réécriture de prompt que j'ai mise en production.

> [!CONFIRMED]
> La réparation par le prompt récupère au mieux 23 pour cent des échecs, quand l'intervention côté restitution en récupère 59 à 91 pour cent [s3].

> [!INFERRED]
> Ma lecture, et ce n'est qu'une lecture : le canal JSON Schema constitue lui-même une charge de restitution, ce qui expliquerait qu'un simple changement de format déplace la justesse. Aucune étude citée ne teste ce pont. Les travaux sur l'attention ne font jamais varier le format de sortie, et les travaux sur le format ne mesurent jamais l'attention.

## L'objection la plus solide

Formulons-la dans sa version la plus forte. Personne n'a mené l'expérience qui relie les deux résultats. L'étude d'attention observe la restitution de la sélection d'outils sur BFCL et Seal-Tools, sans jamais faire varier le format de sortie ; la réplication oppose JSON et langage naturel sur des domaines de service client et de santé mentale. Jeux d'évaluation différents, modèles différents, interventions différentes. Lire le second comme un cas particulier du premier relève de ma synthèse et non d'un résultat mesuré, et un lecteur a le droit de la pondérer en conséquence.

Il existe une version plus tranchante de la même objection, celle qui m'a fait réécrire ce texte. Opposer une part d'un sous-ensemble déjà en échec à un écart de justesse absolu sur l'ensemble des essais, c'est changer de dénominateur en cours de route, et cela flatte le nombre qu'on souhaite voir gagner. Cette comparaison ne m'est pas offerte, et je ne m'en sers pas. L'asymétrie ci-dessus provient d'un seul article qui rapporte lui-même ses deux chiffres, et non d'un nombre que j'irais opposer à celui d'une autre étude.

Ce qui subsiste est plus faible qu'une affirmation causale, et suffisant pour agir. Deux résultats indépendants encadrent la même décision par deux côtés : l'un montre que le côté entrée a un plafond mesuré, l'autre que le canal de sortie est une variable vivante et non un coût fixe. Même si les mécanismes se révélaient sans rapport, les deux détournent l'effort de réparation de la chirurgie de prompt, et votre prochaine décision reste la même.

Ma propre position souffre d'un défaut d'assise que je préfère nommer. Deux de mes trois sources sont l'étude d'origine et sa réplication, soit une seule lignée de travaux portée par deux équipes. C'est une force pour la réalité de l'effet et une faiblesse pour sa généralité ; autant dire les deux plutôt que de retenir la moitié qui m'arrange.

## Conséquences pour MCP et pour votre pile

Ce qui suit est une prédiction, pas un résultat, et doit se lire comme telle. MCP normalise la déclaration et l'invocation des outils autour de JSON Schema, sans prévoir de véritable voie de restitution en langage naturel ; un client conforme au protocole n'a donc aucune prise sur le levier que les données désignent comme le plus grand. Aucun des travaux cités n'évalue MCP. Un client pourrait en principe superposer une couche de sélection en langage naturel aux outils déclarés via MCP, et récupérer à la fois l'écosystème et le canal : c'est l'expérience que personne, à ma connaissance, n'a menée. Si la pénalité de canal existe bel et bien, le protocole la facture aujourd'hui le plus lourdement aux petits modèles auto-hébergés, dont les opérateurs ont justement choisi MCP pour la portabilité et non pour une facture de frontière.

La règle opérationnelle coûte peu et je l'adopterais quelle que soit l'issue de la question MCP. Avant de toucher à une description d'outil, vérifiez si le modèle a seulement porté son attention sur le bon outil. Journalisez l'appel émis à côté de l'ensemble d'outils réellement proposé, et séparez les deux classes d'échec au lieu de les fondre dans un vague « mauvaise sélection d'outil ».

Le mode de défaillance à nommer dans vos traces : bon outil attendu par l'attention, mauvais nom de fonction émis. Dans tous les visualiseurs de traces que j'ai utilisés, cela ressemble à un problème de recherche d'outil, cela se traite comme un problème de description, et ce n'est ni l'un ni l'autre.

Réécrire vos descriptions d'outils, c'est le petit levier, et vous l'avez probablement déjà tiré.
