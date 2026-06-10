---
translationKey: ast-code-chunking
lang: fr
slug: decouper-sur-larbre-syntaxique
title: Découper sur l'arbre syntaxique, ou pas ? Ce que disent les benchmarks
publishDate: 10-06-2026
tags:
- rag
- retrieval
- agentic-coding
category: explainers
sources:
- label: 'cAST: Enhancing Code RAG with Structural Chunking via Abstract Syntax Tree
    (Zhang et al., EMNLP 2025 Findings)'
  url: https://arxiv.org/abs/2506.15655
  date: 10-06-2026
- label: How Does Chunking Affect Retrieval-Augmented Code Completion? A Controlled
    Empirical Study (Wu, Gong, Jahangirova, Zhang, 2026)
  url: https://arxiv.org/abs/2605.04763
  date: 10-06-2026
- label: 'CodeRAG-Bench: Can Retrieval Augment Code Generation? (Wang et al., NAACL
    2025 Findings)'
  url: https://arxiv.org/abs/2406.14497
  date: 10-06-2026
- label: 'CodeXEmbed: A Generalist Embedding Model Family for Multilingual and Multi-task
    Code Retrieval (Liu et al.)'
  url: https://arxiv.org/abs/2411.12644
  date: 10-06-2026
- label: Tree-sitter, official documentation (Introduction)
  url: https://tree-sitter.github.io/tree-sitter/
  date: 10-06-2026
- label: 'RepoCoder: Repository-Level Code Completion Through Iterative Retrieval
    and Generation (Zhang et al., EMNLP 2023), origin of RepoEval'
  url: https://arxiv.org/abs/2303.12570
  date: 10-06-2026
contentHash: sha256:b7ad4bd8fb02d984
publishState: published
---


Le découpage AST, sensible à la structure du code, aide le RAG de code, mais le chiffre vedette de cAST surestime ce que la règle de découpage rapporte à elle seule. cAST annonce 4,3 points de Recall@5 gagnés sur RepoEval et 2,67 points de Pass@1 sur SWE-bench face au découpage à taille fixe [s1] ; pourtant, une étude contrôlée de 2026 montre que la fenêtre glissante l'égale et que c'est le budget de contexte inter-fichiers, pas la coupe, qui fait le plus bouger le score [s2]. À mon avis, la plupart des billets prennent le chiffre d'un seul article pour un verdict sur la méthode, alors que la méthode en mérite une part bien plus mince.

## Le problème de la coupe

Tout agent de code et tout système de RAG de code bute sur la même porte avant de pouvoir récupérer la moindre ligne : le dépôt n'entre pas dans la fenêtre de contexte, il faut donc le découper en chunks, et la seule vraie décision est de savoir où couper. La coupe naïve est à taille fixe : on tranche chaque fichier en fenêtres de 40 lignes et on indexe chacune. La signature d'une fonction tombe dans un chunk, son `return` anticipé dans le suivant ; le récupérateur remonte la moitié qui correspond à la requête, et le générateur raisonne alors sur du code qu'il ne voit pas. Une mauvaise coupe ne se rattrape jamais en aval, quelle que soit la finesse de la récupération. La piste qui a le plus retenu l'attention : cesser de couper sur des compteurs de lignes pour couper sur la structure.

## Comment fonctionne le découpage AST

Dans une boucle d'agent, les fichiers changent en permanence et réanalyser tout le dépôt à chaque frappe est exclu ; c'est pourquoi cAST s'appuie sur tree-sitter, une bibliothèque d'analyse incrémentale qui construit un arbre syntaxique concret pour un fichier source et le met à jour efficacement au fil des éditions [s5].

cAST coupe sur cet arbre plutôt que sur un décalage d'octets. Il parcourt les nœuds syntaxiques et empaquette des unités entières, une fonction, un corps de classe, un bloc d'imports, jusqu'à un budget de taille, si bien qu'un chunk se termine sur une frontière de nœud et jamais au milieu d'une instruction [s1]. Le modèle d'embedding voit alors une unité syntaxiquement complète, et le vecteur qu'il produit décrit une chose cohérente plutôt qu'un fragment à cheval sur deux. cAST résume d'ailleurs sa propre approche comme la production d'unités autonomes et sémantiquement cohérentes, tous langages et toutes tâches confondus [s1].

## Le chiffre vedette

La proposition s'accompagne d'un chiffre, et c'est ce qui lui a donné sa visibilité. Couper sur l'arbre plutôt qu'en fenêtres de taille fixe relève le Recall@5 de 4,3 points sur la recherche RepoEval et le Pass@1 de 2,67 points sur la génération SWE-bench [s1]. Deux choses sur ces benchmarks pèsent sur la valeur de cet écart.

RepoEval n'est pas une référence neutre. Il provient de RepoCoder, le système itératif de récupération et génération qui a amélioré la base de complétion in-file de plus de 10 % dans tous les cas [s6]. Le benchmark a été conçu en même temps qu'une méthode pensée pour montrer que la récupération au niveau du dépôt paie, c'est donc un terrain où l'on s'attend à ce que la récupération aide.

Et la récupération aide effectivement, surtout pour les modèles performants. Sur CodeRAG-Bench, GPT-4o gagne 27,4 % avec les documents de référence sur SWE-bench, et tous les modèles gagnent de 7,5 à 17,2 points avec les extraits canoniques sur RepoEval [s3]. Le gain de cAST est donc mesuré sur un benchmark qui récompense la récupération, dans un régime où elle fonctionne. Reste une question plus étroite : la part de cet écart qui revient à la coupe AST en propre, et non à la récupération faisant son travail sur un terrain favorable.

## La complication

Un chunk sensible à la structure est une unité autonome et sémantiquement cohérente [s1] : l'embedding apparie une unité entière et le générateur reçoit un contexte sur lequel il peut compiler ; sur ce raisonnement, les 4,3 points sont la méthode qui fonctionne comme prévu, et la conclusion s'impose : toujours couper sur l'arbre.

L'étude contrôlée de 2026 est ce qui délite ce récit. En fixant les autres variables et en n'en faisant varier qu'une à la fois, elle constate que le découpage structurel et la fenêtre glissante se valent, et que le paramètre dominant n'est pas du tout la règle de découpage. Doubler le budget de contexte inter-fichiers de 2 048 à 8 192 jetons apporte jusqu'à 4,2 points de pourcentage, tandis que la taille de chunk a un effet plus faible et non monotone [s2]. Mettez ces deux nombres côte à côte : le réglage du budget fait bouger le score d'autant que tout le gain de récupération annoncé par cAST, et c'est un réglage qui tient en une ligne de configuration plutôt qu'un analyseur à maintenir.

L'étude dégage tout de même un résultat négatif solide, et il va à rebours de la sagesse populaire. Prendre la fonction comme unité de chunk est la pire stratégie de la comparaison : le découpage sur les frontières de fonction est moins performant que toutes les autres stratégies sur RepoEval, de 3,57 à 5,64 points de pourcentage, avec un delta de Cliff de -1,0, c'est-à-dire que chaque comparaison appariée va dans le même sens, et il n'est jamais Pareto-optimal, alors que la fenêtre glissante et cAST, qui empaquettent jusqu'à une taille ou un budget de contexte, dominent le front coût-qualité [s2]. Le perdant, c'est une-fonction-par-chunk, la stratégie qui traite la fonction comme l'unité atomique de récupération. Ce n'est pas un verdict contre les chunks qui contiennent par hasard une fonction entière. Or si respecter les frontières de fonction était la bonne règle, cAST devrait battre la fenêtre glissante qui les ignore, et l'étude contrôlée dit qu'il ne le fait pas [s2].

## Le levier que la plupart des billets ignorent

Pendant que le domaine débat des points de coupe, on règle rarement le modèle d'embedding avec la même rigueur, alors que c'est lui qui creuse les plus grands écarts. Les chiffres le confirment. Sur le benchmark CoIR, CodeXEmbed-7B dépasse le précédent modèle de code de référence Voyage-Code-002 de plus de 20 % en moyenne sur les 10 jeux de données [s4]. Un écart de 20 % sur la qualité de récupération en changeant d'encodeur écrase un écart de 4,3 points de Recall@5 en changeant la coupe, et l'encodeur est un identifiant de modèle qu'on change dans la configuration d'indexation, pas un parcoureur d'arbre à écrire et déboguer par langage. D'expérience, c'est le réglage le plus rentable de toute la chaîne, et celui que les équipes touchent en dernier.

## Verdict calibré

La structure aide, mais moins que le chiffre vedette de cAST ne le laisse croire, et plus conditionnellement que la plupart des billets l'admettent. L'étude contrôlée place la longueur de contexte inter-fichiers comme le paramètre dominant [s2], et changer d'encodeur représente un levier de 20 % sur la qualité de récupération [s4]. Les deux tiennent en une ligne de configuration et font bouger le score plus sûrement que la coupe ; c'est là que va mon budget de réglage en premier. Gardez un découpeur AST si vous en avez un : il égale la fenêtre glissante et ne fait jamais pire sur ces benchmarks [s2], et ses chunks syntaxiquement entiers facilitent l'inspection de ce que le récupérateur a remonté. N'en attendez simplement pas vos gains.

La seule règle que je coderais en dur est négative : ne faites pas de la fonction votre unité de chunk. C'est la seule stratégie que l'étude contrôlée classe bonne dernière sur RepoEval, de 3,57 à 5,64 points, sur chaque comparaison appariée [s2].
