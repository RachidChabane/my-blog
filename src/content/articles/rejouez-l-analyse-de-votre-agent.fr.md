---
translationKey: agent-run-analysis-needs-a-replay
lang: fr
slug: rejouez-l-analyse-de-votre-agent
title: Rejouez l'analyse de votre agent avant d'y croire
publishDate: 24-11-2026
tags:
- agentic-coding
- evaluation
category: essays
difficulty: 3
sources:
- label: Gunsilius, Van Dijcke and Wuthrich, Inference after coding agents (arXiv
    2611.23174)
  url: https://arxiv.org/abs/2611.23174
  date: 17-11-2026
- label: 'Gao and Xiao, When AI Analysts Disagree: Agentic Multiverse Analysis (arXiv
    2611.25198)'
  url: https://arxiv.org/abs/2611.25198
  date: 18-11-2026
contentHash: sha256:0df8bf14440c1e85
publishState: published
---


Ne décidez rien sur la foi de l'analyse d'un agent de code avant de l'avoir rejouée. Le résultat obtenu n'est qu'une des réponses que le même agent aurait pu vous rendre.

Et des analyses, on lui en confie déjà. Le compte rendu d'un A/B test, la métrique de conversion qui décroche un lundi matin, le funnel qu'il faudrait « regarder vite fait ». Vous récupérez un notebook propre, graphiques compris, qui conclut d'un air sûr de lui. Les embranchements qui ont décidé de cette conclusion n'y figurent pas. Quelles lignes ont sauté parce qu'elles ressemblaient à des bots, quelle fenêtre de dates a été retenue, quelles covariables sont entrées dans la régression : tout ça s'est joué pendant l'exécution, sans que vous le voyiez, et le notebook ne garde que le chemin qui a été pris.

## Mêmes données, autres conclusions

Un agent, contrairement à un analyste, se relance en une commande, autant de fois que vous voulez. C'est ce qui rend ses embranchements mesurables. Ruijiang Gao et Steven Chong Xiao ont tenté le coup dans une étude pilote [s9] : 150 agents de code autonomes, un seul jeu de données, les mêmes questions de recherche. Les agents bifurquent aux mêmes endroits que des analystes humains, sur des choix tous défendables, mais l'écart entre agents reste plus serré qu'entre analystes [s4] [s11]. Lu isolément, aucun de leurs notebooks ne mérite un coup de stylo rouge.

Avec des humains, on peut faire la même expérience, mais elle coûte cher : les études qui confient une même question à beaucoup d'analystes mobilisent des années de travail bénévole cumulé [s12], et personne ne relance le même analyste sur la même question pour voir s'il change d'avis.

Faut-il alors ajouter un agent relecteur ? Il ne resserre presque pas la dispersion [s5] : chaque analyse est cohérente en elle-même, et la cohérence, c'est justement ce que vérifie le relecteur. Montrer aux agents les rapports les mieux notés fait bien s'effondrer la dispersion, surtout parce qu'ils copient sur le voisin [s6] (on connaît tous la réunion où chacun se range à l'avis du premier qui a parlé).

## Une consigne qui réclame un résultat

Quand on réclame une trouvaille, l'agent en trouve une. Florian Gunsilius et ses coauteurs [s8] ont simulé des données sans aucun effet, puis demandé un résultat convaincant à quatre des meilleurs agents du moment. Les agents ont rendu des p-values significatives dans 54 % à 98 % des cas [s1], alors qu'il n'y avait rien dans ces données.

Bien sûr, la consigne réclamait un résultat. Un prompt neutre ferait sans doute moins de dégâts, et je serais bien incapable de dire de combien. Seulement, relisez les tickets que vous confiez à vos agents. « Pourquoi la conversion a-t-elle baissé la semaine dernière ? » réclame déjà une explication, et l'agent qui revient bredouille a l'air d'avoir mal travaillé.

## Rejouer l'agent

Une fois l'analyse terminée, on peut réinitialiser l'agent et le rejouer sur des sous-échantillons des données, avec la même consigne [s2] [s10]. Dans les simulations de l'équipe de Gunsilius, une correction tirée de ces rejeux fait retomber le taux de faux positifs autour de 5 %, le risque que le test est censé prendre. Sans elle, ce taux s'envole [s3].

Pas besoin de la statistique de l'article pour tirer quelque chose d'un rejeu. Relancez la même consigne plusieurs fois, chaque fois dans une session neuve et sur une autre partie des lignes tirée au hasard, puis posez les résultats côte à côte. Regardez d'abord quels choix chaque run a faits ; le signe et la taille de l'effet viennent après. Une conclusion qui revient par des chemins différents a de bonnes chances d'être dans les données. Si les runs se partagent, la réponse de départ n'était qu'un embranchement parmi d'autres, et mieux vaut le savoir avant le go/no-go.

Gao et Xiao comptent quelques heures de calcul et quelques dizaines de dollars par article pour leurs exercices [s7]. Un rejeu, c'est moins que ça, et de toute façon peu de chose à côté d'un lancement ou d'un changement de prix raté.

Mettez donc le rejeu dans l'estimation et dans le ticket, à côté de la requête qui extrait les données, et demandez que le compte rendu dise combien de rejeux ont retrouvé la conclusion. Rien de tout ça ne marche si vous ne gardez pas la transcription complète de l'agent, sa consigne exacte et une copie figée des données qu'il a lues. Sans elles, vous n'aurez rien à rejouer le jour où quelqu'un contestera le chiffre.
