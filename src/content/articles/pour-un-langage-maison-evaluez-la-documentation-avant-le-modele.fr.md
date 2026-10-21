---
translationKey: low-resource-language-scores-do-not-transfer-to-an-unseen-language
lang: fr
slug: pour-un-langage-maison-evaluez-la-documentation-avant-le-modele
title: Pour un langage maison, évaluez la documentation avant le modèle
publishDate: 21-10-2026
tags:
- agentic-coding
- evaluation
category: essays
difficulty: 3
sources:
- label: OpenAI, Advancing coding in low-resource programming languages (scope)
  url: https://openai.com/index/low-resource-programming-languages/
  date: 19-10-2026
- label: Dominik Picheta, I built a programming language that LLMs cannot use (question)
  url: https://blog.picheta.me/post/killswitch-lang/
  date: 17-10-2026
- label: Cassano et al., MultiPL-T, arXiv 2308.09895 (low-resource gap)
  url: https://arxiv.org/abs/2308.09895
  date: 19-08-2023
contentHash: sha256:57f0603570757a59
publishState: published
---


Je pense que les scores publiés sur les langages peu dotés ne mesurent pas votre langage maison ; commencez par évaluer la justesse de la documentation que lit votre agent. À mon sens, ces scores suivent des langages rares dans le code public. Or un langage interne à une entreprise est absent de ce code, et la variable que son équipe maîtrise, c'est ce que l'agent lit à son sujet.

## Deux voix, une même difficulté

Dans ces sources, « peu doté » a un sens précis, et ce sens tient aux données. Le billet d'OpenAI [s25] place son travail sous le signe des langages de programmation peu dotés, comme COBOL, Fortran et Visual Basic [s1] : des langages qui offrent aux modèles moins de code et de documentation que Python et JavaScript, et qui font pourtant tourner des infrastructures critiques et des services essentiels [s2]. Le billet dit s'appuyer sur des développeurs et des entreprises clientes qui ont signalé à OpenAI que les modèles de code peinent souvent avec ces langages [s3]. Je lis là un témoignage que le fournisseur relaie : une voix, de seconde main, et le fournisseur a tout intérêt à la relayer.

La seconde voix a mesuré la difficulté. Un article sur les LLM de code a constaté que ces modèles obtiennent des résultats impressionnants sur les langages bien représentés dans leurs données d'entraînement, comme Java, Python ou JavaScript, et qu'ils peinent sur les langages peu dotés, dont les données d'entraînement disponibles sont limitées [s20]. Le même article range OCaml et Racket parmi ces langages, avec plusieurs autres [s21]. OCaml figure donc sur la liste de l'article et parmi les langages testés par le fournisseur ; je lis là une même condition vue de deux côtés, celle d'un langage que le code public dessert mal.

Le remède de l'article, ce sont des données. Son approche, MultiPL-T, traduit des données d'entraînement de langages bien dotés en données d'entraînement pour des langages peu dotés [s29] : un LLM de code traduit du Python vers le langage cible, et des tests valident la traduction [s22]. La rareté est un problème de données. Elle se corrige donc par des données, et c'est pourquoi je trouve plausibles les gains du fournisseur ; un langage qui n'existe que dans les dépôts d'une entreprise n'a aucun code public à ajouter, et une équipe qui loue son modèle par une API n'a aucun entraînement à nourrir. Reste que la seule étape qu'une équipe pourrait reprendre, la traduction vérifiée par des tests, passe encore, à mon sens, par la spécification : le modèle traducteur doit écrire votre langage avant que les tests puissent rejeter quoi que ce soit, et ce qu'il sait de votre langage, c'est votre documentation.

## Ce que mesurent les chiffres du fournisseur

Je prends ces gains pour argent comptant, et je pense qu'ils répondent à une question que ne se pose pas une équipe qui a son propre langage. Le MultiLangBench du billet demande à un modèle de construire de zéro un moteur de base de données compatible avec SQLite, dans 20 langages différents [s4], et OpenAI vérifie la base obtenue avec l'implémentation de référence de SQLite [s5]. À mon sens, le modèle travaille face à une spécification qui ne peut pas se tromper : quand la prose est ambiguë, l'implémentation de référence tranche, et le correcteur détient la même réponse.

Le billet fait état de progrès sur chaque langage testé, dont COBOL, de 10.9 % à 72.1 %, et OCaml, de 25.6 % à 85.8 % [s6]. Astra dépasse 83 % dans 19 des 20 langages, et COBOL reste le plus difficile, à 72 % [s7]. Je lis là un vrai progrès sur des langages rares dans le code public.

Côté migration, même logique. L'évaluation de migration du billet repose sur des tests cachés qui exigent une parité octet pour octet des sorties observables [s8]. OpenAI publie sur GitHub le dispositif d'évaluation et la suite de tests de MultiLangBench [s10]. Je la lancerais pour vérifier qu'un chiffre du fournisseur se reproduit ; elle ne contiendra pas votre langage.

Le billet dit lui-même ce qui rend ces logiciels difficiles à maintenir et à moderniser : la documentation peut être incomplète, les développeurs d'origine ont pu quitter l'entreprise, et des règles métier importantes n'existent parfois que dans le code [s24]. Mettez cette liste en regard des deux évaluations. Chacune fournit au modèle un corrigé, l'implémentation de référence dans l'une, les tests de parité cachés dans l'autre, et à mon sens aucune des deux, telle que le billet la décrit, ne fait varier la documentation que reçoit le modèle. Tout l'écart est là. À mon sens, le premier point de la liste du fournisseur est justement celui que ses chiffres laissent fixe.

## KillSwitch mesure trois choses à la fois

Je pense que ce qui ressemble le plus, en public, à un langage maison, c'est un langage conçu pour être hostile. L'auteur de KillSwitch se demande quelle part de la capacité des modèles à écrire du code tient à leur compréhension de ce code, et quelle part au rappel d'extraits présents dans leurs données d'entraînement ou leur fenêtre de contexte [s11]. KillSwitch est un langage de programmation ésotérique conçu pour être hostile aux LLM et aux agents de code [s12], et l'auteur a jugé qu'un bon point de départ était de tester la capacité d'un LLM à comprendre et à écrire du code dans un langage que ce LLM n'a jamais vu [s26]. À mon sens, ce qu'un langage maison partage avec KillSwitch, c'est d'être inédit pour le modèle.

KillSwitch ajoute deux choses qu'un langage maison honnête n'a pas. Sa conception comprend des constructions faites pour déclencher les garde-fous de sécurité du modèle [s23], et l'auteur rapporte que certains modèles, comme Fable 5.1 et Gemini 4 Argon, s'en sortent mal à cause de garde-fous de sécurité trop sensibles [s15]. La spécification elle-même joue aussi contre son lecteur.

> [!CONFIRMED]
> La spécification de KillSwitch contient des mensonges cachés que les humains ont peu de chances de lire, ou qu'ils reconnaîtront probablement comme des mensonges [s13], et elle attend du lecteur humain des déductions qu'elle n'explicite jamais [s27].

> [!INFERRED]
> Je lis ces deux traits comme un wiki interne. La page périmée que chaque ingénieur sait ignorer est un mensonge qu'un humain reconnaît, et la convention que personne n'a écrite est une déduction qu'un humain tire du contexte. À mon sens, un agent qui lit les mêmes pages n'a aucun de ces deux filtres.

L'auteur a soumis les principaux modèles et harnais d'agents de code à une série de tâches [s14] ; le modèle le plus performant obtient 66.8 sur des tâches que l'auteur juge, pour l'instant, plutôt simples [s16] [s17]. Trois variables, un seul score. Langage inédit, mensonges et appâts à garde-fous tiennent dans un même nombre, et à mon sens aucune de ces sources ne le décompose ; je ne m'en servirais pas pour prédire quoi que ce soit d'un langage maison honnête.

Voici ce que chaque test fournit au modèle, ce qu'il note, et ce qui manque, à mon sens.

| Test | Ce que reçoit le modèle | Ce qui est noté | Ce qui manque, à mon sens |
| :--- | :--- | :--- | :--- |
| MultiLangBench (OpenAI) | un moteur à construire dans 20 langages [s4] | le contenu de la base, comparé à l'implémentation de référence de SQLite [s5] | une documentation fausse ou lacunaire |
| Évaluation de migration d'OpenAI | des programmes dont les comportements doivent être préservés [s8] | des tests cachés, parité octet pour octet [s8] | une documentation fausse ou lacunaire |
| KillSwitch | un langage dont la spécification contient des mensonges cachés [s13] | un jeu de tâches plutôt simples [s17] | la part de l'inédit, des mensonges et des appâts dans le score |

## Le meilleur argument contre

L'objection la plus sérieuse à ma thèse vient des propres résultats de l'auteur de KillSwitch. L'auteur trouve encourageant que les performances des modèles sur ce jeu de tâches simples soient corrélées à d'autres benchmarks de modèles existants [s18]. Dans sa version la plus forte, l'objection se formule ainsi : si les classements tiennent sur un langage conçu pour tromper les modèles, ils tiennent probablement sur le vôtre, et choisir le meilleur modèle règle l'essentiel du problème.

Le classement de l'auteur ajoute un détail qui semble aller dans ce sens. C'est Opus, de Claude, qui obtient le meilleur résultat, avec Opus 5 devant Opus 5.5, et l'auteur juge que l'écart ne relève pas du seul hasard : Opus 5 interprète mieux la spécification [s28].

J'admets qu'une part de la capacité se transfère, et le classement aide à choisir entre deux modèles. Une corrélation ordonne les modèles entre eux ; or décider d'adopter ou non un agent sur un langage demande un niveau absolu, et un prix pour ce que coûte une spécification fausse. Un classement ne chiffre rien. Le seul résultat que l'auteur explique, l'auteur l'attribue à la lecture de la spécification ; à mon sens, la spécification est donc le matériau sur lequel s'exerce ce talent. Je soupçonne qu'un modèle qui lit mieux les spécifications suit aussi plus fidèlement une spécification fausse, et l'expérience décrite plus bas le montrerait.

## Ce que je ferais avec un langage maison

Avant de comparer des modèles, je chiffrerais la documentation. Gardez-en deux copies : les pages telles que l'agent les trouve aujourd'hui, et les mêmes pages une fois que les ingénieurs qui savent lesquelles sont périmées les ont signalées et corrigées. Lancez le même petit jeu de tâches, avec le même modèle et le même harnais, sur les deux copies. L'écart entre les deux taux de réussite, c'est ce que vous coûte une documentation périmée.

```
docs-current/     le wiki et la spécification tels que l'agent les lit aujourd'hui
docs-corrected/   les mêmes pages, une fois corrigées par les ingénieurs qui savent lesquelles sont périmées
tasks/            un petit jeu de tâches avec des vérifications fiables

lancer le même agent, le même modèle et le même harnais sur tasks/ avec chaque arborescence
coût des docs périmées = taux de réussite (docs-corrected) - taux de réussite (docs-current)
compter les refus à part des mauvaises réponses
```

Selon moi, le premier mode de défaillance à guetter, c'est la spécification périmée à laquelle l'agent se fie. D'expérience, un ingénieur qui tombe sur une page que le code contredit va demander à un collègue ; je pense qu'un agent écrit du code conforme à la page, et que les vérifications le rattrapent tard, voire jamais. La copie corrigée transforme cette habitude en coût mesuré.

Le second mode de défaillance mérite sa propre colonne. Sur KillSwitch, l'auteur rapporte que des modèles comme Fable 5.1 et Gemini 4 Argon s'en sortent mal à cause de garde-fous de sécurité trop sensibles [s15]. À mon sens, du code ancien peut contenir des identifiants et des commentaires qui ressemblent à une formule d'attaque, et un refus y est un autre défaut qu'une mauvaise réponse, avec un autre remède : un réglage du modèle ou du harnais, là où une mauvaise réponse appelle une meilleure documentation.

> [!IMPORTANT]
> Si l'écart entre les deux arborescences est faible, consacrez le budget au choix du modèle. Ce résultat réfuterait mon hypothèse, et c'est vite vérifié.

Je ne comparerais les modèles qu'ensuite, et je lirais les résultats par langage du fournisseur comme des indices sur des langages qui vivent dans le code public. Le test coûte peu.
