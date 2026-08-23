---
translationKey: watermark-entropy-budget
lang: fr
slug: mon-travail-de-fiabilite-depense-le-budget-du-filigrane
title: Mon travail de fiabilité dépense le budget du filigrane
publishDate: 23-08-2026
tags:
- agentic-coding
- qualite
category: essays
difficulty: 3
sources:
- label: 'anthropic.com: Nothing is added to the text and there are no hidden characters'
  url: https://www.anthropic.com/news/claude-text-watermark
  date: 14-08-2026
- label: 'support.claude.com: Marks will apply to output from supported Claude models'
  url: https://support.claude.com/en/articles/16266773-how-claude-marks-ai-generated-content
  date: 23-08-2026
- label: 'daringfireball.net: apply a form of steganography'
  url: https://daringfireball.net/2026/08/anthropics_watermark_text_adulteration_in_claude_is_a_perversion_of_writing
  date: 16-08-2026
- label: 'blog.j11y.io: The result is a signal broad enough to implicate harmless
    and assistive use'
  url: https://blog.j11y.io/2026-08-12_Anthropics-weak-watermarks-appease-a-weak-law/
  date: 12-08-2026
- label: 'nature.com: very low entropy, meaning it almost always returns the exact
    same response'
  url: https://www.nature.com/articles/s41586-024-08025-4
  date: 23-10-2024
- label: 'arXiv 2301.10226: Low entropy text creates two problems for watermarking.'
  url: https://arxiv.org/abs/2301.10226
  date: 23-08-2026
contentHash: sha256:b9f9189c1ccd1308
publishState: published
---


Le filigrane est fait de la liberté du sampler [s17], et chaque pratique qui rend mon
agent de code fiable dépense cette même liberté. Anthropic énonce le mécanisme sans
détour : le filigranage de l'IA exploite les décisions où l'un ou l'autre choix de mot
serait aussi bon [s18]. Mettez ces deux phrases côte à côte et la conséquence devient
inconfortable. Plus je travaille à ce qu'un pipeline rende deux fois la même réponse,
moins il reste de choix équivalents où une marque puisse se loger. Cette raréfaction
n'est pas une propriété du texte. Je la fabrique, volontairement, et je suis la partie
la moins bien placée pour m'en apercevoir.

## Ce dont la marque est faite

La description qu'Anthropic donne de ce qu'il modifie est plus étroite qu'on ne le
suppose. Le filigrane ne change que la source de l'aléa utilisé pour choisir parmi les
mots [s17].
Rien n'est ajouté au texte et il n'y a aucun caractère caché [s1]. Aucune charge utile
à retirer, aucun caractère de largeur nulle à traquer. Ce qui bouge, c'est lequel de
plusieurs mots acceptables sera retenu, sous l'influence d'une clé que seul l'éditeur
détient. Anthropic résume ainsi ce que le lecteur en voit : les mots que Claude
choisit restent aléatoires, mais on peut désormais vérifier la séquence de mots [s2].

Un commentateur indépendant décrit la même construction depuis l'extérieur et aboutit
à la même forme : appliquer une forme de stéganographie, où le choix des mots au
moment de l'inférence laisse des empreintes qui pourront peut-être, plus tard, être
détectées de manière probabiliste [s7]. Je le cite pour un mot : probabiliste. Une
marque de cette nature n'est pas un drapeau qu'un texte porte ou ne porte pas. C'est
une lecture statistique répartie sur quantité de choix de mots, et ces choix sont ceux
que l'éditeur a déjà nommés, les choix équivalents [s18]. Reste une question en
suspens pour un texte qui n'avait presque aucun choix équivalent à faire.

## Trois origines, une même limite

Trois origines distinctes répondent de la même façon, et leur accord s'arrête là.
Aucune n'énonce la conjonction que je vais tirer ; chacune n'en tient qu'une part.

L'éditeur tient la première, dans la phrase déjà citée plus haut sur les choix
équivalents [s18], à laquelle Anthropic ajoute qu'un type de texte porte généralement
moins de filigrane que d'autres formes de texte [s3]. Lues ensemble, ces deux phrases
disent que la force de la marque varie selon le matériau, et disent pourquoi.

Une deuxième origine, qui traite d'un autre dispositif déployé, aborde le même terrain
par la mesure. Elle décrit un modèle quasi déterministe : si la distribution du LLM
est à très faible entropie, c'est-à-dire qu'elle renvoie presque toujours exactement
la même réponse à une invite donnée [s12]. Elle rapporte aussi, à propos de sa propre
méthode, que l'échantillonnage par tournoi donne de meilleurs résultats quand
l'entropie est plus élevée [s13]. Rien de tout cela ne porte sur la marque de Claude,
et je ne prétends pas le contraire.

Un article de recherche sur le filigranage tient la troisième et laisse tomber les
précautions. Un texte à faible entropie crée deux problèmes pour le filigranage [s14].
Le déterminer est fondamentalement difficile parce que ces séquences ont une faible
entropie [s15].

| Origine | Ce que son propre texte énonce | Citation |
| --- | --- | --- |
| L'éditeur | des décisions où l'un ou l'autre choix de mot serait aussi bon ; généralement moins de filigrane que d'autres formes de texte | [s18] [s3] |
| Un dispositif déployé | une très faible entropie renvoie presque toujours exactement la même réponse ; l'échantillonnage par tournoi donne de meilleurs résultats quand l'entropie est plus élevée | [s12] [s13] |
| Un article sur le filigranage | un texte à faible entropie crée deux problèmes pour le filigranage | [s14] [s15] |

La limite sur laquelle elles convergent, c'est l'endroit où la marque s'efface, et
leur accord ne va pas plus loin. La phrase qui compte pour un exploitant vit en
travers de ces lignes et dans aucune d'elles. D'où le fait qu'aucune page ne l'énonce.

## L'entropie, c'est ce que mon travail de fiabilité supprime

Tous les comptes rendus ci-dessus traitent la faible entropie comme une propriété
qu'un texte ou une distribution possède par accident. Dans un pipeline d'ingénierie,
ce cadrage ne tient plus. La faible entropie est un budget que je consomme, une
pratique de fiabilité à la fois, et le total ne fait que croître.

Je pense que l'essentiel du travail qui rend un agent fiable est de la suppression
d'entropie sous d'autres noms. Je baisse la température pour que des exécutions
répétées concordent. Je donne au décodeur un schéma qu'il doit satisfaire, ce qui
supprime toute continuation qui l'aurait violé. Je relance la même requête et ne garde
que la réponse sur laquelle les exécutions s'accordent. J'écris des prompts qui
n'admettent qu'une seule forme de sortie, parce qu'une réponse libre est une réponse
sur laquelle mon parseur ne peut pas compter. D'après mon expérience, c'est là que
passe le gros de l'ingénierie, et rien n'y est facultatif dès lors que la chaîne
tourne sans surveillance.

Chacun de ces réglages pousse dans la même direction : moins de choix équivalents à
chaque étape de la génération. Il n'existe aucun réglage de filigrane dans ma stack.
Je règle la fiabilité, et le budget dont la marque se nourrit est celui que mes
réglages vident.

## Le mode de défaillance dont rien ne me rend compte

Cette défaillance a une forme, et sa difficulté tient à son silence. Imaginez un
pipeline durci jusqu'au quasi-déterminisme : décodage contraint, température basse,
relances par consensus, un prompt à une seule forme de réponse légale. Sa sortie est
précisément le texte sur lequel un détecteur a le moins de matière, et rien nulle part
ne le signale. Rien ne lève d'erreur, rien n'avertit, et aucun champ de réponse
n'indique que la marque est ressortie mince. Mon observabilité ne peut pas le
remonter, et personne parmi ceux qui pourraient calculer un indice de confiance ne
m'en communique un.
D'après mon expérience, c'est la pire catégorie de défaut à porter : la dégradation
est un effet secondaire d'un travail que j'avais raison de faire, invisible à
l'instant où elle se produit, pour la seule partie qui l'a causée.

## Ce qu'Anthropic délimite lui-même

Anthropic ne laisse pas cela implicite, et je prends l'entreprise au mot. Anthropic
dit que le filigrane peut porter sur les commentaires dans le code, mais que par
définition il aura un effet négligeable sur le code lui-même [s4]. C'est l'éditeur qui
borne sa propre affirmation, sur l'artefact dont mes relecteurs débattent, sans avoir
besoin d'un argument d'entropie pour y arriver. Anthropic couvre une large surface,
puisque les marques s'appliqueront aux sorties des modèles Claude pris en charge sur
Claude Platform (API), Claude, Claude Code, Claude Cowork et Claude Tag [s6].

Soyons précis sur ce que cela règle. Anthropic a réglé l'artefact de code pour son
propre compte, et n'a rien dit du reste de ce que mon pipeline écrit, qui représente
l'essentiel des mots en volume : le commentaire de revue sur une pull request, le
message de commit, la note d'incident, le résumé de migration. Que du langage naturel,
passé par le même décodage contraint, les mêmes relances par consensus et le même
prompt à forme unique, et rien de tout cela n'est touché par la déclaration
d'Anthropic sur le code.

> [!WARNING]
> Le périmètre qu'Anthropic donne au filigrane sur le code généré est une affirmation
> sur l'artefact de code, et elle se lit facilement comme une affirmation sur tout ce
> qu'un pipeline écrit. Le langage naturel que ce même pipeline émet sous les mêmes
> contraintes reste hors de cette phrase, et les contraintes qui y amincissent la
> marque sont celles que j'ai choisies pour la fiabilité.

## Le meilleur argument contre moi

Le meilleur argument contre ma position ne vient pas de l'éditeur. Un critique qui
écrit sur le dispositif le formule ainsi : le résultat est un signal assez large pour
impliquer des usages inoffensifs et assistés, et assez fragile pour être effacé par
une personne motivée au prix d'une recomposition substantielle [s10]. Lu comme une
attaque contre moi, c'est un bon argument. Si le signal est déjà faible dans les deux
sens, mon budget d'entropie est une erreur d'arrondi sur quelque chose qui n'a jamais
rien porté, et un signal faible augmente quand même le coût de faire passer un
travail pour le sien. La friction a une valeur.

Je le prends au sérieux, et je continue de penser qu'il échoue, sur la force d'une
phrase. Seul Anthropic pourra déterminer si un texte semble avoir été généré par
Claude, et Anthropic ne pourra détecter que les filigranes apposés par Claude [s8]. Je
ne peux pas passer le détecteur sur ma propre sortie, donc je ne peux pas séparer les
deux hypothèses qui me concernent : une marque mince et une marque absente se
ressemblent trait pour trait depuis ma position, et c'est mon ingénierie qui me
déplace de l'une à l'autre. Un argument par la friction suppose un signal que
quelqu'un peut vérifier. La partie qui pourrait vérifier le mien, c'est Anthropic.

La seule comparaison de qualité présente dans le matériau que je cite ne comble pas
cet écart. Google DeepMind a testé cet impact en servant à une partie de son trafic
Gemini un modèle filigrané, puis en comparant les votes pouce levé et pouce baissé
[s5]. C'est une expérience sur le fait de savoir si les lecteurs remarquent une
différence, menée par une autre partie sur un autre système, et elle ne dit rien de la
quantité de marque qui survit à un pipeline bâti comme le mien.

## Ce que je ferais

La réponse pratique est donc modeste et un peu décevante. Je ne dépense rien sur la
marque comme moyen de contrôle : pas d'étape de détection dans un pipeline de revue,
aucun résultat de détection sur ma sortie traité comme une preuve. L'obligation que la
marque acquitte est technique et se situe côté fournisseur [s11] : elle lie celui qui
expédie le modèle, et laisse entièrement de côté la question distincte de ce que
chaque personne utilisant l'IA doit déclarer [s11]. Quelqu'un d'autre s'en acquitte.

Ce que je garde, c'est la déclaration qui voyage avec le travail. Le patch consigne
qui l'a écrit et ce qui l'a généré, dans le trailer de commit et dans le corps de la
pull request. Cet objet-là, je peux l'auditer, il survit à toutes les transformations
que mon pipeline applique, et il ne s'amincit pas quand je baisse la température. En
théorie, c'est le plus faible des deux objets. Plus solide en pratique, parce que je
peux le vérifier.

> [!CONFIRMED]
> Les trois origines qui bornent la marque ne décrivent pas le même système. Anthropic
> décrit son propre dispositif et l'endroit où il porte moins [s18] [s3] ; les deux
> autres décrivent un échantillonnage différent [s12] [s13] et la difficulté qu'un
> texte à faible entropie crée pour le filigranage [s14] [s15].

> [!INFERRED]
> Je pense que l'entropie décrite par ces trois origines est, dans un pipeline
> d'ingénierie, quelque chose que je fabrique plutôt qu'une propriété que le texte
> possède. Mon travail de fiabilité dépense le budget dont la marque est tirée, et la
> facture ne me parvient jamais.
