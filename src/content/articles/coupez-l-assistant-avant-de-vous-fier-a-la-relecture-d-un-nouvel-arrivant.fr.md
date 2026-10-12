---
translationKey: ai-assistance-impairs-the-unassisted-skill-that-reviews-ai-output
lang: fr
slug: coupez-l-assistant-avant-de-vous-fier-a-la-relecture-d-un-nouvel-arrivant
title: Coupez l'assistant avant de vous fier à la relecture d'un nouvel arrivant
publishDate: 12-10-2026
tags:
- agentic-coding
- evaluation
category: essays
difficulty: 3
sources:
- label: Paper, AI Assistance Reduces Persistence and Hurts Independent Performance
  url: https://arxiv.org/abs/2604.04721
  date: 03-10-2026
- label: UC Berkeley news, Using AI for Just 10 Minutes Erodes Your Ability to Persist
    at Hard Things
  url: https://vcresearch.berkeley.edu/news/using-ai-just-10-minutes-erodes-your-ability-persist-hard-things
  date: 09-10-2026
- label: Anthropic, How AI assistance impacts the formation of coding skills
  url: https://www.anthropic.com/research/AI-assistance-coding-skills
  date: 29-01-2026
- label: Paper, How AI Impacts Skill Formation
  url: https://arxiv.org/abs/2601.20245
  date: 28-01-2026
- label: Knowledge at Wharton, Without Guardrails, Generative AI Can Harm Education,
    study design
  url: https://knowledge.wharton.upenn.edu/article/without-guardrails-generative-ai-can-harm-education/
  date: 27-08-2024
contentHash: sha256:329b1b1e083f419d
publishState: published
---


Un assistant de code qui livre des réponses à quelqu'un qui découvre une base de code freine, à mon sens, la compétence de débogage dont dépend la relecture de son code. Dans l'essai contrôlé randomisé d'Anthropic, le groupe avec IA a obtenu un score inférieur de 17 % à celui des participants qui codaient à la main, le plus grand écart portait sur les questions de débogage, et le gain de vitesse n'était pas statistiquement significatif [s26] [s12] [s9] [s8]. Rien n'établit que ce soit le fait de livrer la réponse qui produit ce coût ; le contrôle que j'ajouterais reste donc le même dans les deux cas : une tâche de débogage, assistant coupé, avant de me fier à du code généré qu'un apprenant a approuvé.

## Deux essais, une même direction

Le résultat sur la persévérance fait l'actualité, mais son poids pour une équipe d'ingénierie tient à la façon dont il rejoint un essai sur le code mené par une autre équipe. L'équipe qui a étudié la persévérance a présenté son article, mis à jour et relu par les pairs, à la Conference on Language Modeling [s5]. Ses auteurs rapportent des preuves causales, tirées d'une série d'essais contrôlés randomisés portant sur 1 222 participants, que l'assistance par IA réduit la persévérance et dégrade la performance sans assistance [s1].

Les tâches que nomment les auteurs de l'étude sur la persévérance relèvent du raisonnement mathématique et de la compréhension de texte, pas du code [s2]. Sur ces tâches, les auteurs constatent que l'assistance améliore la performance à court terme, puis que les participants font nettement moins bien sans elle et abandonnent plus souvent, des effets qui apparaissent après environ 10 minutes d'interaction avec l'IA [s2].

Côté code, les éléments viennent du billet d'Anthropic consacré à la façon dont l'assistance par IA influe sur l'acquisition des compétences en programmation [s18]. Les auteurs ont recruté 52 ingénieurs logiciels, juniors pour la plupart, qui utilisaient Python au moins une fois par semaine depuis plus d'un an [s11]. Les auteurs se sont aussi assurés que ces ingénieurs ne connaissaient pas Trio, la bibliothèque Python sur laquelle reposaient les tâches [s28] [s13]. C'est un assez bon modèle du nouvel arrivant qui découvre la pile technique d'une équipe.

Ce que je retiens des deux, c'est une direction commune plutôt qu'un chiffre commun. Dans les deux cas, ce que les participants savaient faire une fois l'assistant retiré sortait dégradé du fait de l'avoir eu. Deux équipes, deux types de tâches. Le même signe.

## Là où les scores en code ont chuté

L'endroit où le coût tombe m'importe davantage que son ampleur. Les auteurs du billet rapportent que l'assistance par IA a entraîné une baisse statistiquement significative de la maîtrise [s6]. Au quiz, dans l'essai d'Anthropic, le groupe avec IA a obtenu en moyenne 50 %, contre 67 % pour le groupe qui codait à la main [s7], soit l'écart cité plus haut [s12].

C'est sur les questions de débogage que les auteurs situent le plus grand écart, et ils nuancent eux-mêmes leur lecture : selon eux, la capacité à comprendre quand un code est faux et pourquoi il échoue pourrait devenir un point de vigilance particulier si l'IA freine l'apprentissage du code [s9]. L'article d'Anthropic élargit la liste à la compréhension conceptuelle, à la lecture de code et au débogage [s14].

Mettez ces trois compétences en regard de ce que fait, toute la journée, celui qui relit du code généré. Lire un code écrit par un autre, décider s'il est faux, comprendre pourquoi il échoue : c'est le métier lui-même. À mon avis, un assistant qui sert à livrer des réponses toutes faites use précisément le relecteur dont il dépend, et il le fait chez ceux à qui l'équipe demandera plus tard d'approuver ce qu'il produit. C'est la compétence de relecture qui y passe.

> [!NOTE]
> L'essai sur le code d'Anthropic portait sur des ingénieurs juniors pour la plupart, face à une seule bibliothèque qu'ils ne connaissaient pas [s11] [s28]. J'y lis un signal fort sur les apprenants, et je me garderais de l'étendre à toute une équipe.

## La vitesse censée tout payer

Si la plupart des équipes acceptent ce marché, c'est qu'elles croient acheter de la vitesse. Dans l'essai d'Anthropic, le groupe avec IA a terminé en moyenne environ deux minutes plus vite, un écart qui n'était pas statistiquement significatif [s8], et l'article ne relève aucun gain d'efficacité significatif en moyenne [s14].

Le gain de productivité se loge ailleurs, et plus étroitement. D'après les auteurs, les participants qui ont entièrement délégué les tâches de code ont gagné un peu en productivité, mais au prix de l'apprentissage de la bibliothèque [s15]. Ceux qui sont allés plus vite sont donc ceux qui ont sauté la partie dont une équipe a besoin chez un nouvel arrivant.

Le cas le plus intéressant est un schéma que décrit le billet : les participants qui ne posaient que des questions conceptuelles ont rencontré beaucoup d'erreurs, les ont résolues seuls, et ont été en moyenne les plus rapides parmi les schémas à score élevé, et les deuxièmes plus rapides au total, après la délégation à l'IA [s20]. Il s'agit d'une observation sur des personnes qui ont choisi ce style, et la section suivante explique pourquoi elle ne peut porter aucune conclusion causale. Elle fragilise quand même l'idée confortable selon laquelle apprendre serait le chemin lent.

Les moyennes ne montrent pas le marché que les équipes croient conclure.

## Des réponses ou des explications

Les deux équipes d'auteurs désignent la réponse livrée toute faite comme le point faible, et toutes deux se gardent d'y voir une cause. C'est l'objection la plus sérieuse à ma thèse ; je lui dois une réponse directe.

Dans les données sur la persévérance, l'analyse des auteurs suggère que la baisse de persévérance se concentre chez les participants qui ont utilisé l'IA pour obtenir directement des solutions [s3]. Les auteurs précisent aussi que cette analyse porte sur le sous-ensemble assisté de leurs données d'essais et qu'elle est transversale, donc pas nécessairement causale [s4]. Dans l'essai sur le code d'Anthropic, les participants à la maîtrise la plus solide se servaient de l'assistant pour produire du code, et aussi pour comprendre ce qu'ils faisaient en même temps [s10], et les auteurs distinguent six schémas d'interaction, dont trois impliquent un engagement cognitif et préservent les acquis [s16].

> [!CONFIRMED]
> Les auteurs de l'étude sur la persévérance qualifient leur analyse des solutions directes de transversale et pas nécessairement causale [s4], et Anthropic précise que son analyse qualitative n'établit pas de lien de causalité entre schémas d'interaction et acquis [s19].

> [!INFERRED]
> Ma lecture : dans les essais sur la persévérance comme dans l'essai d'Anthropic sur le code, le résultat sur le mode d'usage décrit la façon dont les gens ont choisi de se servir de l'outil ; il ne peut donc pas séparer le mode des personnes. La lecture concurrente, selon laquelle l'accès à l'assistant coûte l'apprentissage quel que soit le mode, s'accorde tout autant avec les mêmes données.

Les participants les plus engagés étaient peut-être simplement plus capables, ou moins pressés. Dans ce cas, un mode qui explique d'abord ne rattrape rien, et rationner l'assistant devient la politique que soutiennent les données.

Le seul dispositif que je connaisse, dans ce dossier, où des groupes ont reçu des outils différents vient d'en dehors du logiciel. Des chercheurs de Wharton et de Penn ont mené une expérience auprès de près de 1 000 lycéens en mathématiques en Turquie, et rapportent que l'IA générative a amélioré les performances des élèves tout en leur rendant l'apprentissage plus difficile [s21]. Un groupe a reçu GPT Tutor, qui intègre les apports des enseignants et doit guider par des indices plutôt qu'en donnant directement les réponses [s22]. Le groupe GPT Base a fait 48 % de mieux que le groupe témoin pendant la séance d'entraînement assistée, puis 17 % de moins bien que lui à l'examen, une fois l'assistance retirée [s23]. Le groupe GPT Tutor a fait 127 % de mieux à l'entraînement, et a obtenu à l'examen à peu près le même score que le groupe témoin [s24].

L'article de Wharton lit le résultat du groupe Tutor comme une atténuation de ces effets néfastes, quand l'IA est déployée dans un cadre et avec des limites fixés par les enseignants [s25]. Les auteurs de l'étude sur la persévérance, qui résument les travaux de Bastani et al., sont plus prudents : selon eux, une condition de tutorat guidé n'a atténué ce préjudice qu'en partie [s27]. Je considère que les deux textes décrivent la même expérience, et sur l'ampleur de l'effet je retiens la lecture la plus prudente.

Le chiffre auquel je reviens sans cesse, c'est celui du groupe GPT Base. Son score d'entraînement dépassait nettement celui du groupe témoin, alors que son score à l'examen restait en dessous [s23]. Un responsable qui n'aurait regardé que les chiffres assistés aurait jugé l'outil réussi. Il s'agissait de mathématiques au lycée, et faire jeu égal avec le groupe témoin signifie que le tuteur a évité un préjudice, ce qui est bien moins qu'un gain. Je tiens donc le mode qui explique d'abord pour une hypothèse à tester sur du logiciel. Le rationnement est l'alternative qu'il doit battre.

| Étude | Participants | Ce qui différait entre les groupes | Ce qu'elle dit du mode d'usage | Statut de ce résultat |
| --- | --- | --- | --- | --- |
| Essais sur la persévérance | 1 222 participants, tâches de mathématiques et de lecture [s1] [s2] | assistance par IA, randomisée [s1] | abandon concentré chez ceux qui obtenaient des solutions directes [s3] | transversal, pas nécessairement causal [s4] |
| Essai sur le code d'Anthropic | 52 ingénieurs, juniors pour la plupart, qui ne connaissaient pas Trio [s11] [s28] | assistance par IA ou code écrit à la main, randomisé [s26] | maîtrise plus solide quand l'usage visait aussi la compréhension [s10] | aucun lien de causalité établi [s19] |
| Expérience de Wharton et Penn | près de 1 000 lycéens en mathématiques [s21] | un tuteur qui donne des indices, un outil conversationnel simple, ou aucun outil [s22] [s23] | score du groupe tuteur à l'examen à peu près le même que celui du groupe témoin [s24] | outil attribué par groupe, mathématiques seulement |

## L'objection la plus forte : c'étaient des apprenants

L'argument le plus solide contre ma position porte sur les personnes testées. Les participants d'Anthropic étaient juniors pour la plupart [s11] et découvraient la bibliothèque [s28], et les tâches de l'étude sur la persévérance relevaient des mathématiques et de la lecture [s2]. Un ingénieur expérimenté qui relit du code dans une pile qu'il connaît possède déjà la compétence de débogage. Pour lui, l'assistant apporte de la vitesse et guère plus, et lui demander de le couper revient à lever une taxe sans contrepartie.

Je concède ce point, dans la limite de ce que montrent les données. Rien dans ce dossier ne mesure des seniors sur du code familier, et je ne prétends pas savoir comment ils s'en sortent.

Ma réponse : une équipe ne reste pas senior. Chaque nouvel arrivant, et chaque ingénieur affecté à une bibliothèque qu'il ne connaît pas, se retrouve en position d'apprenant, et d'expérience cette position dure des semaines. Or l'effet s'installe vite : dans les essais sur la persévérance, il apparaissait après environ 10 minutes d'interaction avec l'IA [s2]. L'intégration d'un nouvel ingénieur dure largement assez longtemps pour que cela compte.

## Ce que je changerais à l'arrivée d'un nouvel ingénieur

Pour les ingénieurs qui découvrent encore une base de code, je changerais trois choses, et aucune ne suppose de croire que le mode d'usage soit la cause.

Je ferais tourner deux variantes d'intégration et je les comparerais : un assistant en mode qui explique d'abord, contre un assistant franchement rationné. Je ne parierais pas sur la victoire du premier, puisque les données sur le mode d'usage ne permettent pas de les départager.

J'ajouterais un test de sevrage : une tâche de débogage sur le code de l'équipe, faite assistant coupé, avant que quiconque reçoive le droit d'approuver du code généré. Ce test vaut quelle que soit la bonne lecture des données sur le mode d'usage, parce qu'il mesure directement le débogage sans assistance.

Je cesserais aussi de prendre la production assistée pour une preuve de compétence. Les chiffres de Wharton vus plus haut montrent déjà ce qu'un bon score assisté peut recouvrir.

Pour la variante qui explique d'abord, la consigne que recevrait l'assistant pendant les premières semaines d'un apprenant tient en quelques lignes :

```text
# mode d'accueil : l'ingénieur découvre encore cette base de code
Explique l'approche et indique le code qui compte.
Quand on te demande un correctif, nomme la cause et laisse l'ingénieur écrire la modification.
Réponds en entier aux questions de fond.
Ne produis pas le diff final, sauf si l'ingénieur le demande deux fois.
```

Ce bloc est l'hypothèse que je testerais, calquée sur les schémas engagés qui ont préservé les acquis dans l'essai d'Anthropic [s16]. Ce n'est pas un remède éprouvé.

> [!WARNING]
> Le relecteur creux : un ingénieur dont la production assistée a l'air correcte, et dont l'approbation de code généré vaut moins que ce que l'équipe suppose. Le travail assisté ne peut pas le révéler ; seul le travail fait assistant coupé le peut.

La décision que cela change, c'est qui a le droit d'approuver du code généré, et sur quelle preuve. Dans une équipe qui continue de recruter, je veux que cette preuve soit recueillie assistant coupé.
