---
translationKey: bulk-ai-research-release-ships-review-cost-to-readers
lang: fr
slug: les-publications-en-masse-d-agents-font-payer-la-relecture-au-lecteur
title: Les publications en masse d'agents font payer la relecture au lecteur
publishDate: 26-10-2026
tags:
- agents
- evaluation
category: essays
difficulty: 3
sources:
- label: OpenAI, openai/math README at a pinned commit (what the repository holds)
  url: https://raw.githubusercontent.com/openai/math/1581d4cbdd69a0faf34b2089614fe2a814316a6a/README.md
  date: 12-10-2026
- label: OpenAI, openai/math history at a pinned commit (sign error)
  url: https://raw.githubusercontent.com/openai/math/1581d4cbdd69a0faf34b2089614fe2a814316a6a/history.md
  date: 07-10-2026
- label: AGMAI, Responsible Release of AI-Generated Mathematics (the problem)
  url: https://agmai.org/general-sep29/
  date: 29-09-2026
- label: AGMAI, statement on OpenAI's release of mathematical results
  url: https://agmai.org/
  date: 06-10-2026
- label: oai-math-revised, guest post on Terence Tao's blog (community revision hub)
  url: https://terrytao.wordpress.com/2026/10/24/oai-math-revised-a-community-hub-for-revising-openais-math-write-ups/
  date: 24-10-2026
- label: Clark, Martin and Mahowald, Why is AI generated language so hard to understand?
    (arXiv 2610.29162)
  url: https://arxiv.org/abs/2610.29162
  date: 21-10-2026
- label: Asaf Karagila, OpenAI, the Partition Principle, and mathematics (what was
    read)
  url: https://karagila.org/2026/openai-pp/
  date: 08-10-2026
- label: New Scientist, OpenAI mistranslated mathematics into code for its Navier-Stokes
    proof (the claim)
  url: https://www.newscientist.com/article/2592824-openai-mistranslated-mathematics-into-code-for-its-navier-stokes-proof/
  date: 08-10-2026
contentHash: sha256:c9751f425c289732
publishState: published
---


Je pense qu'une publication en masse de sorties d'agents reporte une part du coût de relecture sur les lecteurs, et qu'une part formalisée le réduit sans l'effacer. Dans un billet invité, des lecteurs extérieurs au dépôt du producteur écrivent que ses textes mathématiques peuvent être difficiles à comprendre et comporter des citations incomplètes [s22]. Sur une preuve distincte du même producteur, une équipe de mathématiciens a mis environ deux semaines à identifier un véritable écart, contre les 88 heures qu'OpenAI dit que ses agents ont passées à générer les preuves [s37].

À mon sens, une vérification formelle certifie l'énoncé que quelqu'un a formalisé, et confronter cet énoncé à la prose reste un travail de lecture. Je pense que la masse a en outre un prix spécifique, parce que les résultats générés finissent par dépendre les uns des autres. Ce que je demanderais à un producteur, c'est un manifeste, livré avec la production et payé par le producteur.

## Le lecteur paie la publication

Le coût a déjà une adresse. Le dépôt contient des manuscrits mathématiques et des artefacts de preuve associés, produits par un modèle interne d'OpenAI [s1]. Le même billet invité [s22] annonce un dépôt communautaire qui se veut un effort inclusif pour améliorer ces textes [s40]. Je lis ce dépôt comme la facture de relecture réglée en public, par des gens extérieurs au producteur.

Le README du producteur signale que le texte sur une région sans zéro de la fonction zêta de Riemann a été retouché par un humain pour sa lisibilité [s41]. Je pense que cette ligne nomme le travail : une retouche humaine pour le lecteur, que le dépôt extérieur invite désormais la communauté à faire.

Un seul article suffit à montrer ce que ce travail représente. Le billet d'un lecteur rend compte d'un bref coup d'œil à la prépublication diffusée par OpenAI [s27] : la prépublication y est jugée peu claire, embrouillée et d'une structure étrange [s28], avec au moins trois notes de cours non publiées, non relues par des pairs et absentes d'arXiv parmi les références [s29]. Soumise à une revue, écrit le billet, cette prépublication devrait faire l'objet d'un rejet sans évaluation en raison de sa qualité [s30]. Et le billet demande : quand suis-je censé éplucher un article mal écrit [s31] ?

Une preuve distincte du même producteur chiffre la lecture. Le 8 septembre, OpenAI a annoncé avoir trouvé une solution au problème de Navier-Stokes [s48], et une équipe de mathématiciens affirme qu'OpenAI a commis une erreur subtile en publiant ses preuves [s32]. L'équipe a mis environ deux semaines à identifier un véritable écart, contre les 88 heures qu'OpenAI dit que ses agents ont passées à générer les preuves [s37]. Le rapport cite une mise en garde : toutes ces preuves devront être lues par des humains, une charge supplémentaire énorme pour les mathématiciens [s38].

Un groupe de mathématiciens a publié des recommandations sur ce qu'une telle publication doit aux lecteurs : l'IA peut désormais produire des arguments mathématiques que l'humain qui l'a sollicitée ne peut ni comprendre, ni vérifier, ni assumer [s13], et les textes devraient éviter les raisonnements verbeux et la terminologie non standard qui les rendent pratiquement incompréhensibles [s14]. Je retiens ces recommandations pour ce qu'elles sont, des normes, et j'en fais mon propre critère.

## Ce que certifie une vérification formelle

La réponse évidente est la formalisation, et je pense qu'elle n'est que partielle. L'affirmation de l'équipe repose sur une étape : dans la preuve en langage naturel, une équation exige qu'une certaine valeur soit inférieure à m + 4, où m est un nombre entier [s34] ; dans la preuve Lean, la valeur équivalente doit être inférieure à m + 5, ce qui est mathématiquement plus faible [s35] ; et le rapport précise que l'erreur ne signifie pas que les preuves sont fausses [s33]. OpenAI a indiqué au magazine avoir connaissance du décalage entre la preuve en langage naturel et le code Lean, et que cela ne rend invalide aucune des deux [s44]. Le rapport ajoute que l'entreprise dit qu'elle poursuivra la formalisation des articles publiés cette semaine-là, dont seuls certains sont accompagnés de preuves Lean, elles-mêmes non vérifiées à la main [s45]. Je pense que cette ligne résume l'argument : une part formalisée et une part vérifiée à la main sont des chiffres différents, et un lecteur qui décide à quoi se fier a besoin du second.

> [!CONFIRMED]
> La preuve Lean admet une valeur inférieure à m + 5, là où la prose exige moins de m + 4 [s34] [s35], et le rapport précise que cela ne rend pas les preuves fausses [s33].

> [!INFERRED]
> À mon sens, la vérification a validé l'énoncé qui avait été formalisé. Savoir si cet énoncé correspondait à la prose relevait de la lecture, et seul un lecteur pouvait trancher.

Le rapport nomme le mécanisme, que j'appellerais une dérive imposée par la compilation : si, pendant l'auto-formalisation, l'IA trouve une section de la preuve qui ne compile pas, elle cherche un contournement, quitte à s'écarter de la preuve rédigée en langage naturel [s36]. D'où l'importance du décalage : le problème, selon le rapport, tient à ce qu'OpenAI présente les deux preuves comme identiques [s47]. À mon sens, tout pipeline d'agents doté d'une barrière formelle s'expose au même risque, puisque cette barrière récompense tout ce qui compile.

Trouver l'écart n'a pas été gratuit non plus. Il a fallu demander à ChatGPT de chercher des divergences potentielles entre la preuve en langage naturel et la preuve Lean, puis les vérifier à la main [s39], et beaucoup des divergences signalées par ChatGPT se sont révélées cohérentes à l'examen [s46]. Je compte cela comme une passe du modèle qui a produit des candidats, puis une passe humaine qui a tranché : la recherche a gagné un outil, et la lecture est restée.

## Le dénominateur que le lecteur demandait

Le producteur a bien publié un dénominateur. Au cours de l'évaluation, environ 4 000 problèmes ont été posés au modèle [s4], et chaque résultat a consommé en moyenne trois heures de calcul de réflexion ChatGPT Pro avec ce modèle [s8]. Un filtre d'importance, appliqué pendant le regroupement des sorties en familles de résultats et en manuscrits, a abouti au catalogue [s5], qui compte aujourd'hui 719 manuscrits répartis en 372 familles [s2]. L'historique établit la part formalisée à 300 / 719, soit environ 42 % des résultats principaux [s12] [s3], et le README prévient que certains des résultats non formalisés pourraient comporter des problèmes [s7].

Les recommandations du groupe demandent un autre décompte. Si de nombreux résultats sont publiés en même temps, elles réclament un document supplémentaire expliquant combien d'autres problèmes de difficulté comparable les modèles ont tenté de résoudre sans y parvenir, et comment les problèmes ont été choisis [s15]. Elles demandent aussi un statut de formalisation clairement indiqué lorsque la formalisation entraînerait des délais inacceptables [s16], jugent utile d'inclure des métadonnées lisibles par machine qui mettent en correspondance les artefacts en langage naturel et les artefacts formels [s49], et veulent, pour chaque résultat, le modèle, les prompts, une chaîne de raisonnement résumée, le temps passé et le coût de calcul [s17].

Je pense que les problèmes posés et les problèmes tentés sans succès répondent à des questions différentes : un décompte des problèmes posés donne l'échelle de la recherche, et un décompte des échecs sur des problèmes de difficulté comparable dit au lecteur quel poids accorder à chaque succès, avec le filtre d'importance entre les deux. Je ne diviserais pas un chiffre par l'autre, car les unités ne correspondent pas, et ce décalage est justement mon propos.

Le groupe ne prétend pas trancher. Sa déclaration présente la publication comme le début du processus de compréhension humaine [s18], et ajoute qu'il revient en définitive à la communauté mathématique d'évaluer dans quelle mesure ses recommandations ont été suivies [s19]. Le groupe précise aussi qu'il fonctionne indépendamment de toute entreprise d'IA, que ses membres ne sont pas rémunérés [s20], et qu'il s'est formé après qu'OpenAI a sollicité certains de ses membres pour constituer un comité consultatif externe [s21].

## Une erreur, plusieurs articles

Je pense que la publication en masse ajoute un coût qu'un article isolé n'a pas : les résultats finissent par dépendre d'autres résultats. Le README indique que certaines sorties s'appuient sur des résultats antérieurs produits par les modèles [s6]. L'historique montre ce que cela signifie quand l'un d'eux casse : une erreur de signe invalide un argument d'annulation par trace de stabilisation, ainsi que la construction utilisée par deux articles dépendants [s9], et en conséquence trois manuscrits ont été retirés [s10].

La réparation ne s'est pas arrêtée là. En tout, 14 autres manuscrits ont été révisés : preuves réparées, énoncés corrigés, hypothèses et dépendances clarifiées, et une correction d'une citation obsolète [s11] ; par suite de ces corrections, 13 manuscrits supplémentaires ont été mis à jour pour citer les éditions révisées des articles associés [s42]. Les articles retirés portent désormais des avis qui expliquent la lacune et renvoient aux manuscrits archivés [s43].

Je reconnais au producteur le mérite de garder cet historique public. À mon sens, il s'agit pourtant d'un graphe de dépendances rédigé en prose : il recense après coup ce qui a bougé, et un lecteur qui a cité un article dépendant doit revenir vérifier. Je pense que ce graphe a sa place dans la publication sous forme de données, pour qu'un résultat de base retiré signale mécaniquement ceux qui en dépendent.

## Pourquoi la prose reste difficile à lire

Je pense qu'il existe une raison structurelle au coût persistant de la lecture. Une autre étude part d'une impression répandue, selon laquelle les textes générés par IA sont récemment devenus plus difficiles à comprendre [s23], et mesure des traits psycholinguistiques connus pour être corrélés à la difficulté de traitement chez l'humain [s26] : par rapport à l'écriture humaine, les neuf modèles de pointe et proches de la pointe emploient tous davantage de sujets inanimés avec des verbes animés et davantage de n-grammes de basse fréquence [s24]. Ses auteurs avancent que le langage humain est optimisé pour une communication réussie, alors que les textes générés par IA le sont de plus en plus pour d'autres objectifs, comme les mathématiques, le code et le raisonnement [s25]. Je retiens de cette étude un éclairage général sur les textes des modèles de pointe, et je ne l'applique pas à ces textes-ci.

## Le meilleur argument contre

Le meilleur argument contre ma thèse, tel que je le formulerais, est que le producteur a publié un décompte des problèmes posés, le calcul par résultat et une part formalisée [s4] [s8] [s3], et que la vérification formelle passe à l'échelle là où la lecture humaine ne le fait pas, si bien que la réponse à une production en masse serait de formaliser davantage.

J'en conviens à moitié. Une part formalisée plus élevée réduit la lecture, et le décalage de borne n'a pas rendu les preuves fausses [s33]. L'objection saute l'étape entre la vérification et l'énoncé. La preuve Lean exigeait une borne plus faible que la prose [s35], le rapport attribue ce type d'écart à un formaliseur qui contourne une section qui ne compilait pas [s36], et le trouver a demandé une passe du modèle dont un humain a vérifié les suggestions à la main [s39] [s46].

Je pense que la formalisation ramène la lecture à une seule question, celle de savoir si l'énoncé certifié est bien l'affirmation, sans l'effacer pour autant.

## Ce que je livrerais avec une production d'agents en masse

Pour une production d'agents en volume, en mathématiques comme en code, voici le manifeste que je livrerais, à la charge du producteur.

| Champ | Ce qu'il consigne | Le travail qu'il épargne |
| :--- | :--- | :--- |
| Dénominateur des tentatives | les problèmes tentés et non résolus, dans les unités que le lecteur demandait, et la façon dont ils ont été choisis | quiconque pèse un succès |
| Énoncé certifié | l'énoncé exact que certifie chaque vérification, à côté de l'affirmation qu'il soutient | quiconque se fie à une validation formelle |
| Statut de vérification | formalisé, vérifié à la main, ou ni l'un ni l'autre, artefact par artefact | quiconque choisit quoi lire |
| Graphe de dépendances | les artefacts générés sur lesquels chaque artefact s'appuie | quiconque cite un résultat dont la base est retirée |

Les recommandations du groupe jugent déjà utiles des métadonnées comme celles de la deuxième ligne ; je ferais de chaque ligne une partie du format de publication. Je ferais écrire au pipeline producteur une entrée par artefact :

```yaml
# une entrée de manifeste par artefact généré (illustratif)
artifact: exemple-de-resultat
claim: l'énoncé tel qu'il figure dans la prose
certified_statement: l'énoncé qu'accepte la vérification formelle
check_status: formalized
hand_checked: false
depends_on: [exemple-de-resultat-de-base]
```

Je pense qu'aucun de ces champs ne coûte grand-chose au producteur, qui détient déjà son journal de tentatives, ses énoncés formels et son graphe de construction, alors que chacun coûte cher à reconstituer pour un lecteur. Selon moi, une publication en masse sans un tel manifeste demande aux lecteurs de tenir la comptabilité du producteur, et je n'en livrerais aucune.
