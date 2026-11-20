---
translationKey: serving-stack-before-quantization-coding-agents
lang: fr
slug: verifiez-la-stack-avant-de-choisir-la-quantification
title: Vérifiez la stack avant de choisir la quantification
publishDate: 20-11-2026
tags:
- agentic-coding
- llm-oss
- evaluation
category: essays
difficulty: 4
sources:
- label: 'Mehboob, Shafique, Qadeer and Farooq, Beyond Accuracy: How Quantization
    Affects Coding Agents (arXiv 2611.02368)'
  url: https://arxiv.org/abs/2611.02368
  date: 02-11-2026
- label: Edward J. Schwartz, Benchmarking Quantized LLMs for Local Coding Agents Part
    4
  url: https://edmcman.github.io/blog/2026-07-22--benchmarking-quantized-ll-ms-for-local-coding-agents-part-4-investigating-the-impact-of-thinking-on-qwen3-5-35-b-a3-b/
  date: 22-07-2026
- label: Edward J. Schwartz, Benchmarking Quantized LLMs for Local Coding Agents Part
    5
  url: https://edmcman.github.io/blog/2026-08-19--benchmarking-quantized-ll-ms-for-local-coding-agents-part-5-do-qwens-recommended-sampling-parameters-explain-the-thinking-penalty/
  date: 19-08-2026
- label: Edward J. Schwartz, Benchmarking Quantized LLMs for Local Coding Agents Part
    6
  url: https://edmcman.github.io/blog/2026-09-04--benchmarking-quantized-ll-ms-for-local-coding-agents-part-6-one-mystery-solved/
  date: 04-09-2026
contentHash: sha256:66bbdff7b4dbc183
publishState: published
---


Sur un agent de code en local, le niveau de quantification pèse moins sur le score final que le runtime qui sert le modèle : vérifiez la stack avant de comparer les quants. Les conseils qui circulent font l'inverse. On débat longuement de Q8 contre Q5, et presque personne ne note quelle version de llama.cpp a produit le chiffre. Deux mesures sérieuses publiées cette année montrent qu'on se trompe de réglage, et l'une d'elles montre une simple mise à jour qui coûte plus cher que n'importe quel palier de quantification.

## Le Q5 bat le Q8

Edward J. Schwartz [s16] publie sur son blog une série de benchmarks de modèles quantifiés pour agents de code locaux. Thinking désactivé, son build BF16 résout 54,6 % des 500 tâches [s5], le Q8_0 52,0 % [s6] et le Q5_K_M 52,6 % [s7]. Regardez l'ordre. Le build en 5 bits passe devant celui en 8 bits. Si la quantification rongeait vraiment le modèle, le score descendrait marche après marche à mesure qu'on retire des bits ; là, tout tient dans 2,6 points, avec le milieu dans le désordre. Ça ressemble surtout à du bruit.

Un article arXiv de Mehboob et al. [s15] arrive au même endroit par un tout autre chemin : aucune perte de précision statistiquement significative, pour aucun des agents testés [s1]. Ses agents tournent sur des modèles Qwen2.5-Coder et Devstral quantifiés en AWQ et GPTQ 4 bits, sur des problèmes d'OJBench [s3] : les deux protocoles n'ont pas grand-chose en commun, à part la question posée.

## Un bug de parsing qui valait treize points

Dans la partie 4 de la série, le build BF16 avec thinking résout 34,6 % des tâches [s8], une vingtaine de points sous le run BF16 sans thinking cité plus haut. La partie 5 cherche l'explication du côté des paramètres d'échantillonnage recommandés par Qwen, et le verdict ne change pas : les runs sans thinking font systématiquement et nettement mieux que les runs avec [s9]. À ce stade, la conclusion qui vient toute seule, c'est que le thinking dessert ce modèle et qu'il faut le couper.

Sauf que la partie 6 trouve le coupable, et il est dans le runtime : la mise à jour de llama.cpp corrige un bug dans le parsing de la sortie du thinking [s11]. Dans le tableau avant/après, la configuration thinking-general BF16 passe de 37,4 % à 50,8 %, soit 13,4 points de plus [s10]. C'est le seul chiffre du tableau qui bouge vraiment, avec 67 tâches gagnées sur 500 [s14]. Mettez ça en face du sweep : 13,4 points pour une mise à jour du runtime contre 2,6 points entre le meilleur et le pire des niveaux de quantification testés, à peu près cinq fois plus. (Ne soustrayez pas ces chiffres de ceux de la partie 4 : la ligne s'y appelait « thinking-BF16 », ici « thinking-general-BF16 », et rien ne dit qu'il s'agit de la même configuration.)

Oui, c'est un seul run, un seul auteur, un seul modèle, et « corrigez d'abord vos bugs », ça vaut pour n'importe quel benchmark, quantifié ou non. Je ne sais pas à quelle fréquence une version de runtime fait bouger un score d'agent de code de plus de dix points, et aucune des deux sources ne le mesure ; c'était peut-être un accident isolé. Regardez quand même ce que coûte chaque erreur. Coller la sortie de `llama-server --version` à côté de chaque résultat et relancer une baseline après chaque mise à jour, ça ne coûte presque rien à côté du sweep lui-même. Une comparaison de quants faite sur un build qui massacre la sortie du thinking ne vaut rien, quel que soit le niveau de quantification, et ici la mauvaise conclusion a tenu deux billets avant que quelqu'un soupçonne le runtime.

Le harness fait bouger le score, lui aussi. Dans le même tableau de la partie 6, openhands résout 54,8 % des tâches [s12], mini-swe-agent 61,6 % [s13] : 6,8 points entre deux harnesses, là encore bien plus que l'écart entre tous les quants. Le tableau seul ne permet pas de savoir si tout le reste était identique entre ces deux lignes. Prenez-le comme une bonne piste, à vérifier sur votre propre installation avant de changer d'outil.

## Les tours par tâche résolue

Retour à l'article. Une fois passé en AWQ, Qwen-7B ne résout plus aucune tâche du premier coup, contre 17 avant. En revanche, celles qu'il finit par résoudre après plusieurs essais passent de 10 à 25 [s2]. Le score final ne voit rien de tout ça : le modèle quantifié arrive à peu près au même total, sauf qu'il y arrive en essayant, en ratant, puis en réessayant.

Chaque boucle en plus, ce sont des tours en plus, donc plus d'appels d'outils, plus de tokens et plus de minutes par correctif. Si vous payez à l'appel une sandbox hébergée, ou si vous attendez devant votre écran que l'agent termine, le coût d'une tâche résolue a changé alors que le score, lui, n'a pas bougé.

Du coup, ajoutez une colonne. À côté du nombre de tâches résolues, notez le nombre de tours (ou d'appels d'outils) par tâche résolue, pour chaque build comparé. Les auteurs demandent plus large, à savoir évaluer les trajectoires, l'usage des outils et les modes d'échec en plus de la précision finale [s4], mais le nombre de tours en est la partie la moins chère, et il aurait suffi à faire apparaître le glissement de Qwen-7B.

Rien de tout ça ne dit quoi que ce soit de la quantification agressive. L'article s'arrête à AWQ et GPTQ en 4 bits sur des modèles jusqu'à 32B, et le sweep s'arrête au Q5_K_M sur un seul modèle. Descendez plus bas, en Q4, en Q3 ou en 2 bits, ou passez à une famille de modèles qu'aucune des deux sources n'a touchée, et la quantification peut très bien finir par peser plus lourd que le runtime.
