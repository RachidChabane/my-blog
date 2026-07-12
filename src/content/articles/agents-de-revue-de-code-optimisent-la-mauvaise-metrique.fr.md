---
translationKey: code-review-agents-signal-to-noise
lang: fr
slug: agents-de-revue-de-code-optimisent-la-mauvaise-metrique
title: Les agents de revue de code optimisent la mauvaise métrique
publishDate: 12-07-2026
tags:
- agents
- evaluation
category: essays
difficulty: 3
sources:
- label: 'From Industry Claims to Empirical Reality: Code Review Agents in Pull Requests
    (arXiv 2604.03196v1)'
  url: https://arxiv.org/html/2604.03196v1
  date: 03-04-2026
- label: Agent pull requests are everywhere. Here's how to review them. (GitHub Blog)
  url: https://github.blog/ai-and-ml/generative-ai/agent-pull-requests-are-everywhere-heres-how-to-review-them/
  date: 07-05-2026
contentHash: sha256:048a801ff1dce76a
publishState: published
---


L'argument de vente d'un agent de revue de code, c'est qu'il lit chaque pull request à votre place. Une étude empirique portant sur 13 d'entre eux renverse cet argument : 60,2 % des PR produites uniquement par un agent tombent dans la tranche de signal basse, de 0 à 30 %, et 12 des 13 agents restent sous un ratio de signal de 60 % [s1]. Mon avis : la couverture n'a jamais été l'objectif à optimiser. La contrainte qui lie tout, c'est l'attention du relecteur, et un agent qui la sature au-delà du point où un humain continue de lire affiche un rappel effectif nul, quel que soit le nombre de vrais défauts qu'il a nominalement remontés. Un agent de revue exhaustif est une taxe sur la productivité ; sa valeur se joue sur sa capacité à se taire, pas sur sa portée.

## La promesse face à la mesure

Partons de ce que l'outil prétend faire, puis regardons ce qu'il émet. Le discours des éditeurs traite la couverture comme le produit : pointez l'agent sur un diff et il commentera tout ce qu'un humain fatigué laisserait passer. La mesure dit l'inverse. Sur 13 agents étudiés, 60,2 % des PR d'agent seul se rangent dans la tranche de signal de 0 à 30 %, et 12 des 13 affichent en moyenne un ratio de signal sous les 60 % [s1]. À lire comme une distribution, pas comme un titre : le commentaire médian de ces outils est du bruit, et ce bruit n'est pas une queue que l'on affine, c'est là que se concentre l'essentiel de la masse.

Je ne crois pas qu'il s'agisse d'un défaut d'un seul mauvais agent qu'un concurrent corrigera. C'est ce que l'on obtient quand la fonction objectif est la couverture. Si l'agent est récompensé pour dire quelque chose sur chaque bloc modifié, il dira quelque chose sur chaque bloc, or la plupart ne méritent aucun commentaire. La métrique que le domaine optimise et celle dont un relecteur a besoin ont divergé.

## Ce que le bruit achète en sortie

Un ratio de signal faible pourrait n'être qu'une affaire de goût. La même étude lui donne un tranchant plus dur. Les PR d'agent seul ont fusionné à 45,20 % contre 68,37 % pour celles d'humain seul, un écart de 23,17 points, avec un taux d'abandon nettement plus élevé [s2]. Le bruit n'est donc pas une nuisance gratuite qui dort tranquillement dans un fil de discussion ; il accompagne un moins bon résultat à l'expédition.

Je veux manier ce chiffre avec prudence plutôt que m'appuyer dessus. Le taux de fusion est un indicateur contaminé : les PR écrites par un agent fusionnent peut-être moins parce que c'étaient des changements de moindre qualité au départ, non parce que le bruit du relecteur les a coulées. Je lis s2 comme une corroboration, pas comme une preuve. Il réfute l'idée que le faible signal serait seulement subjectif, et s'arrête là. La prescription qui suit n'a pas besoin de la lecture causale ; elle tient sur la distribution du signal et sur le mécanisme d'attention, et s2 ne fait que fermer la sortie « et alors, filtrer ne coûte rien ».

## Pourquoi c'est déjà le régime par défaut

Si c'était une expérience marginale, on pourrait la classer sous « débuts » et passer à autre chose. Ce n'en est pas une. Plus d'une revue de code sur cinq sur GitHub implique désormais un agent [s3]. Voilà le chiffre qui transforme une curiosité en problème de système. Le comportement à faible signal mesuré par l'étude n'est pas le propre de quelques laboratoires ; c'est l'expérience médiane d'un cinquième du trafic de revue sur le plus grand hébergeur de code, répercutée sur chaque dépôt qui a activé la fonction par défaut.

L'échelle renverse le calcul du coût. Un outil bruyant utilisé par dix passionnés est négligeable. Le même outil branché sur un cinquième des revues d'un écosystème est une taxe permanente sur l'attention, payée par chaque relecteur qui a appris à faire défiler le bot avant d'avoir lu un seul mot de sa prose.

## Le recadrage : l'attention est le budget

Voici ce que le cadrage par la couverture manque. Un agent de revue de code ne se bat pas pour du CPU ni pour un budget de jetons ; il se bat pour une ressource fixe et rare, l'attention du relecteur humain, et cette ressource a un seuil de confiance. Sous un certain ratio de signal, le relecteur coupe l'outil, replie ses commentaires par réflexe ou cesse de les lire, et à cet instant le rappel effectif de l'agent tombe à zéro, quel que soit le nombre de vrais défauts qu'il a techniquement signalés [s1] [s2] [s3]. Un rappel que l'on ne lit pas n'est pas un rappel.

Le vrai choix ne se joue donc pas entre un agent bruyant à fort rappel et un agent silencieux à faible rappel. Il se joue entre un canal coupé et un canal ouvert. Un agent réglé pour protéger son ratio de signal garde l'humain en lecture, et un canal qui reste ouvert délivre plus de rappel réalisé sur les défauts qui comptent qu'une lance à incendie que le relecteur a déjà appris à ignorer. La couverture est une métrique de vanité. La capacité à s'abstenir et l'étroitesse du périmètre sont les leviers qui fixent réellement la valeur de l'outil.

> [!CONFIRMED]
> Sur une étude de 13 agents de revue de code, 60,2 % des PR d'agent seul closes tombaient dans la tranche de signal de 0 à 30 % et 12 des 13 restaient sous un ratio de signal de 60 % [s1].

> [!INFERRED]
> Donc la couverture est une métrique de vanité. Puisque le nombre qu'un relecteur lira vraiment est plafonné par un seuil de confiance, le levier qui fixe la valeur délivrée d'un agent est sa capacité à s'abstenir, pas le nombre de commentaires qu'il sait produire.

## L'objection que je dois à cet argument

L'attaque la plus forte contre cette thèse n'est pas que le bruit serait acceptable. C'est que, pour la revue de code précisément, faux négatifs et faux positifs sont asymétriques dans le sens qui coule mon argument. Un faux positif écarté coûte quelques secondes au relecteur. Un défaut critique manqué (injection, contournement d'authentification, course menant à une perte de données) est précisément ce que la revue est censée détecter, et peut coûter de façon catastrophique. Un agent réglé pour se taire sauf certitude va, par construction, s'abstenir sur les cas ambigus, nouveaux, difficiles à prouver, or c'est précisément là que logent les bugs de plus haute gravité et là que les relecteurs humains sont eux aussi les plus faibles. Sous cette lecture, troquer du rappel contre du ratio de signal optimise la métrique tout en dégradant la seule chose que la revue sert à faire.

Je prends l'objection au sérieux, car une politique naïve de « s'abstenir sauf certitude » fait exactement ce qu'elle décrit. Deux mouvements y répondent, et ils affinent la thèse au lieu de battre en retraite.

D'abord, l'étagement par gravité. « S'abstenir sauf certitude » est une politique sur la bande majoritaire de gravité faible à moyenne, la masse assise dans cette tranche de signal de 0 à 30 % [s1], non un bâillon général. La bonne conception ne s'abstient jamais sur un détecteur à haute confiance et haute gravité. Une injection confirmée est à la fois de haute confiance et de haute gravité, si bien qu'un seuil de confiance la conserve ; il ne l'écarte pas. Le rappel que l'on sacrifie est celui de la longue traîne abondante, de faible valeur et difficile à confirmer, pas celui des défauts critiques.

Ensuite, le mécanisme d'attention répond à l'intuition du « tout attraper » sur son propre terrain. Un agent bruyant à rappel maximal ne délivre pas réellement ce rappel, car au-delà du seuil de confiance l'humain cesse de lire et le rappel effectif tombe à zéro. L'agent silencieux et étagé par gravité délivre davantage de rappel réalisé sur les défauts qui comptent, justement parce que le canal reste ouvert. L'objection de l'asymétrie suppose que le rappel nominal de l'agent bruyant est réel. Tout l'enjeu est qu'il ne l'est pas.

| Dimension | Agent exhaustif | Agent silencieux par défaut, étagé par gravité |
| :--- | :--- | :--- |
| Ratio de signal | Faible ; la plupart des commentaires dans la tranche 0 à 30 % [s1] | Élevé ; protégé comme cible de conception |
| Confiance du relecteur | S'érode ; le canal finit coupé | Préservée ; le canal reste ouvert |
| Rappel délivré sur les défauts critiques | Tend vers zéro une fois l'outil coupé | Plus élevé ; les détecteurs critiques ne s'abstiennent jamais |
| Résultat de fusion | Accompagne un moins bon résultat [s2] | Non mesuré directement ; le mécanisme prédit un meilleur |

## Ce que j'expédierais

Concrètement, j'expédierais moins de commentaires, plus sûrs, et une posture d'abstention par défaut. Trois leviers font le travail. Épinglez le périmètre aux lignes modifiées et à leurs points d'appel immédiats, pour que l'agent ne divague pas sur le reste du dépôt. Placez un seuil de confiance devant chaque commentaire, et laissez un détecteur se taire quand il passe sous ce seuil. Puis découpez la politique d'abstention en niveaux de gravité, de sorte qu'un détecteur de gravité critique échappe à la règle de silence et parle toujours, tandis que la longue traîne de faible valeur est filtrée durement.

La défaillance qu'il faut anticiper porte un nom : le canal coupé. Une fois qu'un relecteur a appris à écarter le bot par réflexe, votre rappel effectif est nul, et vous ne récupérez pas cette confiance en livrant un meilleur modèle au trimestre suivant. Vous la récupérez en ne l'ayant jamais dépensée. Voilà pourquoi la capacité à s'abstenir n'est pas un réglage agréable enfoui dans une config ; c'est la fonctionnalité qui décide si quiconque lira l'outil.

Si vous exploitez un agent de revue, cessez de demander s'il couvre tout. Demandez quel ratio de signal il tient devant un relecteur qui a l'option de le couper, et si ses commentaires les plus bruyants sont aussi ses plus sûrs. La couverture est la métrique que les outils optimisent. C'est la mauvaise.
