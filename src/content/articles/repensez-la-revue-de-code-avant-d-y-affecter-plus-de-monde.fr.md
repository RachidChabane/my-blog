---
translationKey: agent-coding-gains-stop-at-the-review-queue
lang: fr
slug: repensez-la-revue-de-code-avant-d-y-affecter-plus-de-monde
title: Repensez la revue de code avant d'y affecter plus de monde
publishDate: 13-10-2026
tags:
- agentic-coding
- evaluation
category: essays
difficulty: 3
sources:
- label: 'Fiona Chen (Harvard), Artificial Intelligence in the Firm: Bottlenecks in
    Software Production'
  url: https://fion.ac/
  date: 13-10-2026
- label: Ars Technica, reporting the Chen and Stratton study
  url: https://arstechnica.com/ai/2026/10/ai-coding-agents-generate-more-code-but-not-more-software/
  date: 09-10-2026
- label: Agarwal, Miller, Kästner, Vasilescu, 3100 Opinions on Code Review in an AI
    World (arXiv)
  url: https://arxiv.org/abs/2607.07980
  date: 08-07-2026
- label: Martin Monperrus, The End of Code Review (arXiv)
  url: https://arxiv.org/abs/2606.13175
  date: 11-06-2026
- label: Chen and Stratton, Artificial Intelligence in the Firm (paper PDF), coding
    output effects of agents
  url: https://fion.ac/jellyfish.pdf
  date: 04-08-2026
contentHash: sha256:141053153a077395
publishState: published
---


Avant d'affecter plus de monde à la revue de code, je la repenserais, car c'est là, à mon sens, que le code des agents cale avant de devenir du logiciel livré. Sur 718 entreprises, Chen et Stratton constatent des gains de productivité en codage qui ne se répercutent pas entièrement sur la production logicielle [s4]. Selon Ars Technica, les agents de code ont fait monter les pull requests de 23 % en moyenne [s7], le taux de résolution des issues et des epics n'a pas évolué de façon statistiquement significative [s8] et le délai entre soumission et fusion a augmenté de 49 % [s9]. Aucune de ces études ne teste quel changement de revue lève ce blocage : ce qui suit est donc un pari sur le levier, jugé au travail livré, et non un plaidoyer pour supprimer la revue humaine.

## Plus de code, et pas d'évolution significative du travail livré

Tout se joue dans l'écart entre le code produit et le travail résolu, et ce jeu de données le rend visible parce qu'il voit les deux bouts de la chaîne. L'article s'intitule Artificial Intelligence in the Firm: Bottlenecks in Software Production ; c'est un job market paper cosigné avec James Stratton et daté d'août 2026 [s2]. Ars Technica présente Fiona Chen et James Stratton comme des chercheurs de Harvard ayant exploité des données d'analytique agrégées de Jellyfish [s6]. Le jeu de données des auteurs couvre 300 millions d'événements de travail, issus d'une plateforme d'analytique de l'ingénierie [s3], et leur protocole repose sur une différence de différences échelonnée, fondée sur le calendrier d'adoption propre à chaque entreprise [s4].

Les chiffres de Chen et Stratton pour les agents, étape par étape :

| Étape | Mesure | Évolution avec les agents |
| :--- | :--- | :--- |
| Code | lignes de code, commits, pull requests | 30 %, 20 %, 23 % [s22] |
| Production | issues et epics Jira résolues | faiblement positive, non significative [s23] |
| Revue | temps de revue d'une pull request | 49 % plus long [s25] |
| Revue | pull requests avec demande de modifications | presque double [s25] |
| Revue | commentaires par pull request | 35 % de plus [s25] |
| Organisation | part des salariés qui font des revues de code | 14 % de plus [s26] |

C'est la ligne de la production qui me retient. Mesurée par la résolution des issues et des epics Jira, elle donne selon les auteurs des effets faiblement positifs, mais non significatifs, après l'adoption des assistants comme des agents [s23]. Pour les agents, les estimations des auteurs excluent une hausse de la production supérieure à 12 % de la moyenne de référence [s24].

Je n'y verrais pas pour autant du travail perdu. Le travail réel attend quelque part ; reste à savoir où.

## Là où le gain s'arrête

L'article désigne l'étape, et la réponse évidente figure déjà dans ses données. Pour les agents, les auteurs relient cette répercussion incomplète à la revue de code : les délais de revue augmentent, une part plus grande des modifications de code doit être retravaillée et les revues comportent plus de commentaires [s5].

Ars Technica rapporte qu'en réaction, les chercheurs ont relevé une hausse de 14 % de la part des salariés qui font des revues de code après l'arrivée des agents [s10]. Selon les auteurs, les entreprises qui adoptent des agents réaffectent du travail vers la revue [s26].

Selon les auteurs, tirer parti de l'IA exige des investissements organisationnels complémentaires, car un changement à une étape de la production peut déplacer le goulot d'étranglement vers une autre et imposer alors une réaffectation du travail [s30]. C'est le réflexe par défaut de la plupart des équipes, et il a pour lui l'autorité de l'article.

Je la prends au sérieux. Mon désaccord porte sur l'ordre. Une part plus grande des salariés faisait déjà de la revue et, dans les données de Chen et Stratton, le délai entre soumission et fusion a tout de même augmenté après l'arrivée des agents [s9]. Je ne prétends pas que cette réaffectation a échoué ; l'estimation en tient peut-être déjà compte. J'en retiens au moins que déplacer des gens vers la revue n'a pas suffi à résorber la file.

Ars Technica note que les agents de code IA ont nettement progressé dans leurs résultats depuis cette étude même [s11]. Je tiens donc ces pourcentages pour ceux d'une génération d'outils. Le mécanisme de la revue, lui, devrait durer.

> [!NOTE]
> Il s'agit de moyennes par entreprise, tirées d'un même jeu de données d'analytique, et les chiffres de revue sont les estimations de l'article pour les agents. Le chiffre sur l'organisation mesure la part des salariés qui font des revues, pas un nombre de nouveaux relecteurs.

## Deux résultats sur la fusion, une même étape de revue

Agarwal, Miller, Kästner et Vasilescu partent d'un constat : les praticiens se divisent profondément sur le fait que la revue devienne le goulot d'étranglement et que la revue humaine reste nécessaire [s20]. L'analyse observationnelle des auteurs sur l'activité publique de GitHub, qui sert de point de départ, constate que les pull requests rédigées par des agents sont moins souvent relues, fusionnées plusieurs fois plus vite et moins discutées que celles écrites par des humains, mais que le sens de ces tendances s'inverse selon des choix d'analyse tout aussi défendables [s12].

> [!CONFIRMED]
> Dans les entreprises, les données de Chen et Stratton montrent un délai entre soumission et fusion qui s'allonge après l'arrivée des agents [s9]. Dans les dépôts publics, Agarwal et ses coauteurs observent des pull requests d'agents fusionnées plus vite que celles des humains, selon une tendance dont le sens s'inverse avec les choix d'analyse [s12].

> [!INFERRED]
> Ma lecture : ces deux résultats ne comparent pas la même chose, d'un côté des entreprises avant et après l'adoption, de l'autre des pull requests d'agents et d'humains mises côte à côte ; ils ne s'opposent donc pas. La vitesse de fusion semble dépendre de l'organisation de la revue dans l'équipe ; aucun des deux résultats n'isole l'agent.

Ceux qui divergent sur le remède s'accordent sur l'étape. Le refrain que relèvent Agarwal et ses coauteurs chez les praticiens veut que les agents produisent désormais du code plus vite que les humains ne peuvent le relire, si bien que la revue devient le goulot d'étranglement de la livraison [s31]. Monperrus, qui voudrait se passer de la revue humaine, soutient que la capacité de revue humaine ne passe pas à l'échelle et que le goulot grandit avec le gain de productivité qu'apporte le code par IA [s35].

Aucun de ces auteurs ne pense que la revue tourne à vide.

## C'est l'équipe qui fixe le signe

Le levier de l'organisation vient de la théorie ; autant le dire franchement. L'article s'intitule 3100 Opinions on Code Review in an AI World: Building Causal Theory from Practitioner Discourse ; il est signé Shyam Agarwal, Courtney Miller, Christian Kästner et Bogdan Vasilescu [s18]. Sa thèse centrale, telle que la formulent les auteurs, est que la revue est devenue le point de contrôle où se décide l'effet d'un agent sur le logiciel, et que l'IA ne fixe pas le signe de cet effet [s19]. Dans leur théorie, c'est l'équipe qui le fixe, par l'expertise qu'apportent ses membres et par la façon dont elle organise la revue [s13]. La méthode est qualitative : les auteurs rassemblent 38 709 documents de littérature grise, ne gardent que ceux qui portent sur la revue de code, puis en codent un échantillon stratifié de 3 100 avec une chaîne assistée par LLM [s14].

C'est donc une théorie tirée de ce qu'écrivent les praticiens. Je m'appuie sur elle pour le levier, sur les données d'entreprise pour l'ampleur du problème.

Voici pourquoi je ne commencerais pas par ajouter des relecteurs. Selon les auteurs, les témoignages de praticiens partent en général du même constat : le débit des relecteurs croît linéairement avec les effectifs, quand celui de la génération par IA croît de façon multiplicative pour chaque développeur [s32]. Si ce constat tient, ajouter des relecteurs ne fait que gagner du temps. La théorie ajoute une proposition : une charge de revue plus lourde réduit la profondeur de la revue, ce qui pèse sur son efficience et sur son efficacité [s33].

Changer l'organisation ne règle pas tout pour autant. La proposition des auteurs sur la gouvernance tient l'effet d'une politique de revue sur la latence pour disputé : plus faible sous une politique par niveaux de risque qui ne soumet à validation que les changements substantiels, plus forte sous une politique uniforme qui y soumet chaque changement [s34]. L'article de Chen et Stratton cite un ingénieur junior dont le projet ne laissait qu'un seul ingénieur senior, l'expert de la base de code, approuver les modifications ; après des pannes causées par des commits générés par IA, de nouvelles règles imposant l'approbation d'un senior pour le code généré par IA ont créé encore plus de goulots d'étranglement dans la revue [s28].

Cette anecdote vient d'un ingénieur junior cité dans l'article, ce n'est pas une mesure. Elle illustre pourtant le piège. Un changement d'organisation peut aggraver la file ; la question devient alors : quels changements passent par un humain ?

## L'objection la plus forte : supprimer la revue humaine

L'objection la plus solide consiste à dire que l'étape de revue est elle-même l'erreur. Martin Monperrus la formule dans The End of Code Review: Coding Agents Supersede Human Inspection [s17]. Selon Monperrus, les agents de code ont franchi un seuil de capacité à partir duquel la revue de code humaine traditionnelle n'est plus une composante nécessaire d'une chaîne qualité logicielle [s15]. Pour Monperrus, l'intégration naïve, où les agents écrivent le code et où les humains restent les relecteurs obligatoires, est une impasse, car elle n'apporte pas de garantie réelle et ne suit pas le débit permis par l'IA [s16]. Monperrus soutient aussi qu'en pratique, la revue du code généré par des agents devient une approbation machinale : l'humain valide parce que le code a l'air correct, que les tests passent et qu'un vrai examen coûte trop cher [s36].

L'argument sur l'échelle porte. Répartir la revue sur une plus grande partie de l'équipe, c'est précisément l'intégration naïve que décrit Monperrus, et c'est ce que semblent avoir fait les entreprises étudiées par Chen et Stratton.

Là où je m'écarte de Monperrus, c'est sur ce qui justifierait de retirer l'humain. Chen et Stratton concluent qu'après l'arrivée des agents, l'adoption d'outils de revue de code par IA ne suffit pas à lever le goulot d'étranglement de la revue [s27]. C'est leur conclusion sur des entreprises qui ont gardé des humains dans la revue, pas le résultat d'une expérience ; elle ne dit rien du remède que propose Monperrus. Elle plaide en revanche contre la solution intermédiaire bon marché, qui garde l'ancienne organisation et y greffe un relecteur IA. Dans les données de Chen et Stratton, la part des pull requests avec demande de modifications presque double après l'arrivée des agents [s25]. J'y vois une revue qui travaille encore. Je concède que rien de ce que je cite ne dit lesquelles de ces reprises ont attrapé un défaut : je ne supprimerais donc pas l'étape sur la foi de ces éléments.

Pour les changements courants, je rejoins Monperrus plus nettement que ces entreprises. Ceux-là ne passent par aucun humain.

## Ce que je changerais avant le déploiement

Mon réglage par défaut, conçu comme la première expérience à mener et non comme un résultat, tient en trois points.

Avant le déploiement, j'écrirais quelles pull requests d'agents exigent un humain qui connaît ce code. Sont sensibles les chemins de code qui ont déjà un propriétaire dans l'équipe. Tout le reste passe par un contrôle automatique fait de tests, de typage, de linters et de règles de dépendances, et non des commentaires de revue par IA, puisque les auteurs concluent déjà qu'après l'arrivée des agents, l'adoption d'outils de revue de code par IA ne suffit pas à lever le goulot [s27].

Je ne rendrais pas la validation experte systématique. Le projet décrit dans l'article de Chen et Stratton, où un seul ingénieur senior pouvait approuver les modifications [s28], et le signe que la proposition des auteurs sur la gouvernance tient pour disputé [s34] suffisent comme avertissement.

Je jugerais le changement aux issues et aux epics résolues, à côté des pull requests fusionnées. Les auteurs font la même remarque : mesurer le rendement de l'IA impose d'évaluer tout le processus de production, et des indicateurs intermédiaires comme les lignes de code ou les commits peuvent mal refléter les gains réels [s29]. Le mérite leur en revient.

```text
# routage de la revue des pull requests d'agents, décidé avant le déploiement
sensible :  authentification, facturation, migrations de données, API publique -> revue par le propriétaire du code
courant :   tests, documentation, refactorisations internes                    -> contrôle automatique
contrôle automatique : suite de tests, vérification de types, linters, aucune nouvelle dépendance
chaque semaine : issues et epics résolues, à côté des pull requests fusionnées et du délai de fusion
```

> [!WARNING]
> La file élargie : une plus grande partie de l'équipe relit davantage de code d'agents, les délais de fusion continuent de grimper, les revues se réduisent à des approbations sous la charge, et le travail livré ne progresse pas de façon significative. C'est en ajoutant des relecteurs à une validation systématique que je m'attendrais à la voir se former.

La décision que cela change est concrète : qui relit quel changement d'agent, et quel chiffre dit si le changement a marché. C'est un pari que je ferais avant d'ajouter le moindre relecteur.
