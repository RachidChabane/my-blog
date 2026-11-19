---
translationKey: launch-chart-cost-per-task-is-price-list-times-token-counts
lang: fr
slug: le-cout-par-tache-d-un-graphique-de-lancement-n-est-pas-le-votre
title: Le coût par tâche d'un graphique de lancement n'est pas le vôtre
publishDate: 19-11-2026
tags:
- agentic-coding
- evaluation
- agents
category: essays
difficulty: 2
sources:
- label: Microsoft AI, MAI Code 2 and Code 2 Flash, headline ratio
  url: https://microsoft.ai/news/introducing-mai-code-2-and-mai-code-2-flash/
  date: 17-11-2026
- label: Fello AI, MAI Code 2, promotional and list prices
  url: https://felloai.com/mai-code-2/
  date: 17-11-2026
- label: GitHub Changelog, MAI Code 2 and MAI Code 2 Flash in GitHub Copilot, billing
  url: https://github.blog/changelog/2026-11-17-mai-code-2-and-mai-code-2-flash-in-github-copilot
  date: 17-11-2026
- label: OpenAI API docs, GPT-6.2 Astra model page, long-context pricing
  url: https://developers.openai.com/api/docs/models/gpt-6.2-astra
  date: 19-11-2026
- label: LiteLLM, GPT-6.2 Astra and GPT-6.2 Sol API pricing, price cut
  url: https://docs.litellm.ai/blog/gpt-6-2-astra-sol
  date: 17-11-2026
- label: Alibaba Cloud, Alibaba Unveils Qwen4-Max, Work360 cost
  url: https://www.alibabacloud.com/press-room/alibaba-unveils-qwen4-max
  date: 16-11-2026
contentHash: sha256:d3da6a31320db3f1
publishState: published
---


Trois modèles sont sortis en deux jours, chacun avec un argument de coût en tête d'annonce, et je n'en recopierais aucun dans un tableau de routage.

La raison est chaque fois la même. Un coût par tâche, c'est une grille tarifaire multipliée par des nombres de tokens, et les deux viennent avec des conditions rangées dans une note de bas de page ou sur une autre page. Le chiffre de Microsoft expire le 17 mai, celui d'OpenAI saute au-delà de 272K tokens en entrée. Celui d'Alibaba, 35 % de tokens en moins en effort de raisonnement High et un coût par tâche en baisse d'environ 60 %, est mesuré sur Work360, un benchmark que son communiqué qualifie de propriétaire [s16]. Celui-là, je ne peux pas le refaire. Les deux autres se vérifient depuis votre bureau, alors allons-y.

## Les 40 % s'arrêtent le 17 mai

Microsoft annonce pour MAI Code 2 98 % des performances de GPT-6.1 Sol pour 40 % du coût [s1], sur un graphique qui fait la moyenne de quatre benchmarks de code [s6]. La note sous le graphique précise que ce coût est calculé au prix promotionnel, soit 50 % de remise [s2]. Ce prix, c'est 0,50 $ par million de tokens en entrée et 2,50 $ en sortie dans GitHub Copilot, et il double le 17 mai 2027 [s5].

Fello AI a fait le calcul, et il tient en une ligne : la promotion divise par deux chaque catégorie de tokens, donc le coût par tâche au prix normal vaut exactement le double de celui du graphique [s7]. Le graphique donne 0,309 $ par tâche pour MAI Code 2 et 0,761 $ pour GPT-6.1 Sol. Une fois doublé, cela fait 0,618 $. Il reste à diviser par le chiffre de Sol :

| | Coût par tâche | Part de GPT-6.1 Sol |
| :--- | :--- | :--- |
| MAI Code 2, jusqu'au 17 mai 2027 | 0,309 $ | 41 % |
| MAI Code 2, à partir du 17 mai 2027 | 0,618 $ | 81 % |
| GPT-6.1 Sol | 0,761 $ | 100 % |

L'économie qui dure est donc d'un cinquième environ [s8], pour un score moyen de 63,2 % quand Sol obtient 64,1 % [s6]. L'économie existe, mais ce n'est pas celle du titre, et une règle de routage écrite le jour du lancement sera fausse dans six mois sans que personne y ait touché. Dans Copilot, les deux modèles sont facturés à l'usage [s10] : le doublement arrive tel quel sur la facture.

## Des tokens comptés sur le harnais d'un autre

L'autre facteur, c'est le nombre de tokens qu'une tâche consomme, et il dépend de choix que vous n'avez pas faits. Tous les modèles du graphique ont tourné à l'effort de raisonnement maximal, et trois des quatre benchmarks sont passés sur la plateforme interne de Microsoft, avec la CLI de GitHub Copilot et sans sous-agents [s2]. Microsoft ajoute que ces modèles ne sont pas encore réglés pour le travail agentique à très long horizon [s3].

Rien de tout cela n'est caché. Microsoft écrit que les comparaisons varient selon la charge de travail, la configuration du modèle, l'effort de raisonnement et les hypothèses de prix [s4], et je prends la phrase au pied de la lettre. Si vos agents tournent à effort moyen avec des sous-agents en éventail, le nombre de tokens derrière le graphique décrit un autre programme que le vôtre. Je n'ai pas fait tourner MAI Code 2 : je ne sais pas dans quel sens votre chiffre bouge, et un graphique mesuré à l'effort maximal ne le dit pas davantage.

Un dernier détail date la comparaison. OpenAI a sorti GPT-6.2 le même jour, GitHub affiche GPT-6.2 Sol aux mêmes 2 $ et 10 $ que GPT-6.1 Sol, et les graphiques de Microsoft comparent avec l'ancien modèle [s9]. Même grille tarifaire, nombres de tokens inconnus : le terme de comparaison avait déjà une version de retard le jour de la publication.

## Au-delà de 272K tokens en entrée, une autre grille

GPT-6.2 Astra a l'air plus simple : l'entrée et la sortie sont 20 % moins chères que celles de GPT-6 Astra [s13], à 8 $ et 40 $ par million de tokens [s14]. La condition se trouve sur la page du modèle chez OpenAI. Pour une requête de plus de 272K tokens en entrée, les tarifs d'entrée et de cache doublent et la sortie coûte 1,5 fois plus, pour la requête entière [s12].

Le piège est dans « pour la requête entière ». Dès qu'une requête franchit la ligne, le tarif haut s'applique à tous ses tokens, et la facture a donc une marche. Une requête de 270 000 tokens d'entrée hors cache coûte 2,16 $ d'entrée. Ajoutez au contexte 3 000 tokens de résultats d'outils, et l'entrée de la même requête coûte 4,37 $. Le modèle accepte jusqu'à 922 000 tokens en entrée [s15] : rien n'empêche un agent de passer la ligne, un gros fichier lu en entier suffit.

C'est la panne que je chercherais en premier sur un agent qui tourne longtemps : une session dont le contexte grossit tour après tour, passe 272K quelque part dans l'après-midi, et coûte ensuite jusqu'à deux fois plus cher par tour (l'entrée et le cache doublent, la sortie prend 50 %) alors que le tableau de budget affiche toujours le tarif du jour du lancement. Un coût moyen par tâche la cache, puisque la moyenne mélange des tours pris des deux côtés de la marche.

## Garder les scores, refaire les dollars

Vous pourriez répondre que ce graphique est votre seule comparaison, et c'est juste. Vous n'allez pas faire tourner quatre benchmarks sur trois modèles avant de choisir un modèle par défaut dans Copilot, et un graphique où tous les modèles ont tourné au même effort, et trois benchmarks sur quatre dans le même harnais, dit quelque chose de l'ordre d'arrivée. Je suis d'accord pour la colonne des scores. Si votre travail ressemble à ce que Microsoft a mesuré (un seul agent dans une CLI, sans sous-agents), je prendrais même ses nombres de tokens comme première estimation, en ne refaisant que les prix.

La réponse ne tient plus pour la colonne des dollars, parce que les dollars sont la seule chose du graphique qui change sans nouvelle mesure. Et il ne faut pas un benchmark pour les remplacer. Il faut trois compteurs par tâche, tirés des logs de votre passerelle, et une grille tarifaire datée. Attention, la plupart des logs comptent les tokens en cache dans l'entrée, il faut les retrancher d'abord :

```
cost_per_task = (uncached_input_tokens * price_input
               + cached_input_tokens   * price_cached
               + output_tokens         * price_output) / 1_000_000
```

Le calcul se fait requête par requête, avec la tranche dans laquelle la requête tombe et les prix en vigueur le jour pour lequel vous planifiez. Ce qu'il faut garder, ce sont les nombres de tokens. Un coût stocké en dollars reste figé au prix du jour où il a été enregistré, et on ne peut plus le redécouper.

## Ce que je changerais cette semaine

Inscrivez le 17 mai 2027 dans l'agenda de la personne qui tient le budget Copilot, avec 1 $ et 5 $ notés à côté. Ce trafic n'a rien d'hypothétique : avec l'activation par défaut, un nouveau modèle est activé automatiquement, sauf si un administrateur a coupé le réglage global ou désactivé le modèle [s11].

Enregistrez la taille de l'entrée de chaque requête, et mettez une alerte sur la part des requêtes au-dessus de 272K. Pour une session qui franchirait la ligne, un seuil de compaction placé juste en dessous peut rapporter plus que la baisse de 20 %.

Et la prochaine fois qu'un graphique de lancement affiche un coût par tâche, lisez la note avant la barre. C'est en général la plus courte des deux.
