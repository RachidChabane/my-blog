---
translationKey: agent-benchmarks-cover-little-of-the-work-your-agent-does
lang: fr
slug: les-benchmarks-d-agents-s-entassent-dans-le-logiciel
title: Les benchmarks d'agents s'entassent dans le logiciel, alors cartographiez vos
  tâches
publishDate: 17-10-2026
tags:
- evaluation
- agents
category: essays
difficulty: 3
sources:
- label: Mercor, A benchmark map of the US economy (occupation coverage)
  url: https://www.mercor.com/research/labor-index/benchmark-map/
  date: 17-10-2026
- label: Wang et al., How Well Does Agent Development Reflect Real-World Work? (scope)
  url: https://arxiv.org/html/2603.01203v2
  date: 06-03-2026
contentHash: sha256:2ddf61c80d94381e
publishState: published
---


Le chiffre phare sur la faible couverture du travail par les benchmarks d'agents est, à mon sens, plus fragile qu'il n'y paraît, et la décision qu'il appelle tient quand même. Selon la carte des benchmarks de Mercor, seules 208 des 923 professions ont une tâche associée à au moins 5 prompts de benchmark, et 6 des 22 familles de métiers n'en comptent aucune [s1]. Les résultats de Mercor suggèrent que 90 % des heures travaillées aux États-Unis sont consacrées à des tâches peu ou pas couvertes par les benchmarks existants [s2]. Wang et al. constatent de leur côté un développement d'agents plutôt centré sur la programmation, en décalage avec les catégories où se concentrent le travail humain et la valeur économique [s13]. Si votre agent travaille ailleurs que dans le logiciel, je ne laisserais pas un rang de classement choisir son modèle.

## Deux cartes, une même forme

Deux équipes ont compté des ensembles de benchmarks différents et trouvé le même déséquilibre ; à mon sens, c'est la direction qui mérite qu'on s'y fie. Mercor part d'une liste de 29 benchmarks choisis pour leur qualité et leur pertinence économique [s19]. Mercor en conclut qu'il est très difficile de savoir ce que valent les modèles d'IA sur le travail que font réellement les Américains [s3].

L'article auquel Mercor se réfère pour sa méthode est celui de Wang et al., qui a pour premier auteur Zora Z. Wang [s27]. Wang et al. analysent 43 benchmarks et 72 342 tâches au regard des 1 016 professions du marché du travail américain [s12]. Dans les données de Wang et al., les benchmarks d'agents se concentrent fortement sur le domaine informatique et mathématique, qui ne représente que 7.6 % de l'emploi américain [s14]. Wang et al. trouvent aussi que le management, le juridique ainsi que l'architecture et l'ingénierie sont très numérisés (88 %, 70 % et 71 %), mais peu couverts : 1.4 %, 0.3 % et 0.7 % de l'ensemble des 19 179 exemples [s15].

Même la carte qui corrige ce déséquilibre commence par le constater. Mercor plafonne sa liste par famille de métiers en grande partie, selon ses propres mots, pour tenir compte de la surreprésentation massive des tâches de génie logiciel et de recherche dans les benchmarks populaires [s7].

Le déséquilibre porte sur des domaines, et l'accord mesuré par Wang et al. porte sur des étiquettes de domaine et de compétence. Le chiffre des heures, lui, se construit tâche par tâche.

Mercor avance que les benchmarks sont conçus pour mesurer les progrès de l'IA, et que ces progrès sont les plus plausibles sur les tâches les plus exposées à l'IA [s25]. Selon Mercor, c'est pourquoi les benchmarks regorgent de tâches de génie logiciel et d'analyse financière, et en comptent si peu en conduite de poids lourds ou en exploitation d'installations gazières [s9].

| Dimension | Carte de Mercor | Wang et al. |
| :--- | :--- | :--- |
| Ce qui est étiqueté | chaque prompt de benchmark, rattaché à des tâches O*NET par un juge LLM [s4] | les tâches des benchmarks, rattachées à des domaines et des compétences par annotation LLM [s16] |
| Contrôle humain | des étiquettes d'experts sur ses propres benchmarks APEX [s21] | un échantillon aléatoire d'exemples [s28] |
| Réserve affichée | provisoire, tirée vers le bas par une liste incomplète [s8] | les benchmarks logiciels passent à côté des spécificités des domaines [s32] |

Deux cartes, une même forme.

## Un seul étiqueteur derrière les deux chiffres

L'une des cartes a emprunté l'instrument de l'autre ; je lis donc leur concordance comme un indice faible. Mercor demande à un juge LLM d'étiqueter chaque prompt de benchmark avec autant de tâches O*NET qu'il en juge correspondantes, dans la lignée de Wang et al. [s4]. Mercor se dit d'ailleurs redevable à Wang et al. de cette méthode d'étiquetage [s5]. Wang et al. ont construit leur propre mise en correspondance par annotation LLM, avec une vérification manuelle de la qualité [s16].

Chaque étude a contrôlé son étiqueteur à la main, sur un terrain différent. Wang et al. ont éprouvé la mise en correspondance sur 90 exemples tirés au hasard [s28]. Deux annotateurs humains indépendants et le modèle atteignent des taux d'accord de 90.9 % et 89.3 % sur les domaines et les compétences, ce que Wang et al. lisent comme un signe de fiabilité [s29]. Mercor valide son étiquetage à l'aide d'étiquettes posées par des experts humains sur ses propres benchmarks APEX [s21], des benchmarks dont Mercor détient les prompts non publiés et qu'il peut donc rattacher à des tâches O*NET [s20].

Sur la carte de Mercor, une tâche O*NET compte comme couverte dès que le juge LLM l'a rattachée à au moins 5 prompts issus des 29 benchmarks [s22]. Je lis chaque compte de couverture de la carte comme un compte de décisions de LLM.

> [!CONFIRMED]
> Mercor obtient son chiffre des heures en combinant ses estimations de couverture avec les estimations de Hatgis-Kessell et al., dérivées d'un LLM, de la part du temps de travail de chaque tâche O*NET [s23].

> [!INFERRED]
> Ma lecture : le chiffre des heures repose sur deux couches de jugement par LLM, l'une qui décide quelles tâches un prompt couvre, l'autre qui estime le temps que prend chaque tâche. Le contrôle d'accord de Wang et al. porte sur des domaines et des compétences, une unité plus grossière que les tâches O*NET qu'étiquette Mercor ; je ne le transposerais donc pas. Et deux cartes qui partagent une méthode ne peuvent pas la vérifier l'une par l'autre.

Le chiffre est fragile.

## La liste décide de ce qui compte comme couvert

Quelqu'un a choisi la liste, et Mercor reconnaît que ses propres choix déplacent l'estimation. Mercor a plafonné le nombre de benchmarks par famille de métiers pour maximiser l'étendue de la couverture ; selon Mercor, cela rend son estimation à l'échelle de l'économie plus juste, au prix d'une sous-estimation de la couverture dans les familles de métiers les plus benchmarkées, dont le génie logiciel [s24]. Mercor écrit aussi que toute liste incomplète biaise forcément à la baisse les estimations de couverture économique, d'un biais difficile à borner, et qualifie donc ses résultats de provisoires [s8].

Le travail sous-couvert a des visages précis. La liste initiale de Mercor couvre largement les tâches des avocats, exposées à l'IA, mais presque aucune de celles des secrétaires juridiques ou des greffiers, tout aussi exposés [s26]. Selon Mercor, la longue traîne des métiers du savoir, plus petits et à revenu intermédiaire, semble sous-couverte [s10].

Je m'attends à ce que le classement qu'une équipe lit vraiment soit une troisième liste, sans plafond qui retienne le logiciel, et qu'il penche donc encore plus vers le logiciel que l'une ou l'autre carte. Même une tâche couverte donne un signal optimiste, car Mercor relève que les benchmarks surestiment souvent les performances des LLM en déploiement réel [s11].

J'appelle ce travers **la sélection sur proxy de code** : choisir le modèle d'un agent qui fait le métier non logiciel de quelqu'un d'après un rang de classement dont les prompts viennent en grande partie du travail logiciel. Une équipe qui construit un agent pour des greffiers choisirait son modèle sur des indices tirés d'une autre profession. Le rang mesure le métier de quelqu'un d'autre.

## Là où l'étiqueteur hésite

Le cas difficile que Wang et al. citent eux-mêmes touche à la question dont dépend mon argument. Wang et al. indiquent que les désaccords restants sont plutôt mineurs et viennent surtout de descriptions de tâches en langage naturel insuffisamment spécifiées [s30]. Leur exemple est un système de recommandation musicale qui, selon Wang et al., pourrait relever du domaine des médias pour son contenu, ou du domaine informatique et mathématique puisque sa mise en œuvre passe généralement par la programmation [s31].

À mon sens, cet exemple pose à petite échelle la question du transfert. Un agent qui construit ce système de recommandation fait un travail de médias en passant par le code, et savoir si cela relève du code ou du domaine est précisément l'arbitrage que l'étiqueteur trouve difficile. Wang et al. soulèvent eux-mêmes la question du transfert : le logiciel peut servir à accomplir des tâches dans une grande variété de domaines, et développer des capacités en génie logiciel pourrait donc accélérer d'autres formes de travail [s17].

Selon moi, la même frontière déplace le chiffre de couverture dans les deux cartes et le choix de modèle dans votre équipe. Étiquetez le système de recommandation comme médias et il paraît sous-couvert ; étiquetez-le comme code et il hérite de tous les benchmarks de programmation du classement.

## Le meilleur argument contre

À mon sens, la défense du classement est plus solide que ne l'admettent ses critiques. Les benchmarks vont là où les progrès de l'IA sont plausibles, comme Mercor l'avance lui-même [s25]. Wang et al. notent que le génie logiciel pourrait accélérer d'autres travaux [s17]. Et Mercor qualifie ses propres résultats de provisoires, tirés vers le bas par une liste incomplète d'un biais difficile à borner [s8]. Dans cette optique, je pense qu'un classement qui penche vers le logiciel est le meilleur indicateur disponible, et que l'écart réel est plus faible que ne le suggère le chiffre des heures.

Si le travail de votre agent relève vraiment du logiciel, j'accepte le classement comme un indicateur honnête.

Wang et al. y répondent eux-mêmes : cette focalisation surreprésente nettement un domaine qui ne représente que 7.6 % de l'emploi total, et les benchmarks généralistes de génie logiciel ne rendent pas pleinement compte des spécificités de nombreux autres domaines de travail [s32]. Ma lecture ajoute une seconde réponse : le transfert est précisément le genre de cas que Wang et al. ont trouvé ambigu dans leur exemple musical, si bien que le meilleur argument de la défense est aussi celui qu'aucun chiffre public ne peut vérifier pour vos tâches. À mon sens, le biais à la baisse que décrit Mercor change la taille de l'écart sans dire à une équipe si ses propres tâches se trouvent dans la partie couverte, puisque Mercor juge ce biais difficile à borner.

Une seconde objection veut que l'instrument partagé ne change rien, puisque n'importe quel étiqueteur trouverait le même déséquilibre. J'admets que la direction est plus grossière, et donc plus robuste, que le chiffre. Je répondrais que l'instrument pèse sur le chiffre, qui se mesure tâche par tâche et empile une seconde estimation par LLM, et que c'est ce chiffre qui circule dans les présentations et les revues de modèles.

Mercor n'est pas neutre sur la liste. Mercor inclut ses propres benchmarks APEX, pour lesquels il a accès à des prompts non publiés [s6]. Son contrôle humain de l'étiqueteur a porté sur ces mêmes benchmarks. Je lis là un intérêt à garder en tête ; rien dans la carte n'est faux pour autant.

## Cartographiez vos propres tâches

Réutilisez l'instrument, gardez sa vérification manuelle, et laissez de côté le chiffre phare. Wang et al. proposent trois principes mesurables pour concevoir des benchmarks : la couverture, le réalisme et l'évaluation granulaire [s18].

Ma méthode découle des deux cartes. Rédigez les tâches de votre agent sous forme d'énoncés de tâche à la O*NET. Demandez à un juge LLM de rattacher chaque prompt public sur lequel vous vous appuyez à ces énoncés, en le contraignant à votre liste pour que les chaînes correspondent exactement. Vérifiez à la main un échantillon aléatoire des étiquettes, comme l'ont fait Wang et al., avant de vous fier au moindre compte. Puis comptez les prompts par tâche.

Pour Mercor, une tâche est couverte à partir d'au moins 5 prompts étiquetés [s22]. Je garderais le même seuil.

```bash
# tasks.txt : les tâches de votre agent, en énoncés de tâche à la O*NET, une par ligne
# tags.jsonl : un objet {"prompt_id": ..., "task": ...} par étiquette émise par votre juge LLM
comm -23 <(sort -u tasks.txt) <(jq -r '.task' tags.jsonl | sort -u) > uncovered.txt
jq -r '.task' tags.jsonl | sort | uniq -c | sort -n > prompts_per_task.txt
# vérifiez à la main un échantillon aléatoire d'étiquettes avant de vous fier à l'un ou l'autre fichier
sort -R tags.jsonl | head -n "$SAMPLE" > to_review.jsonl
```

Le fichier `uncovered.txt` liste les tâches qu'aucun prompt public ne touche, et le haut de `prompts_per_task.txt` liste les plus minces.

> [!WARNING]
> Je lirais chaque tâche non couverte comme un test à écrire pour votre propre jeu d'évaluation. Vérifiez d'abord à la main les lignes frontières : une tâche qui mêle code et travail de domaine est le genre de cas que Wang et al. ont trouvé ambigu.

Mesurez le métier que fait votre agent.
