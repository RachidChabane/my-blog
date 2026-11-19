---
translationKey: qwen4-max-hosted-only-open-weights-for-smaller-models
lang: fr
slug: qwen4-max-n-existe-qu-en-version-hebergee
title: Qwen4-Max n'existe qu'en version hébergée
publishDate: 19-11-2026
kind: release
tags:
- Qwen
- Alibaba
- open-weight
- pricing
summary: Alibaba a sorti Qwen4-Max le 16 novembre 2026 sur QwenCloud. Les poids ouverts
  promis concernent des modèles Qwen4 plus petits, sans date.
sources:
- label: Alibaba Cloud, Alibaba Unveils Qwen4-Max
  url: https://www.alibabacloud.com/press-room/alibaba-unveils-qwen4-max
  date: 16-11-2026
- label: TechNode, Alibaba launches Qwen4-Max with lower API prices and a million-token
    context window
  url: https://technode.com/2026/11/16/alibaba-launches-qwen4-max-with-lower-api-prices-and-a-million-token-context-window/
  date: 16-11-2026
contentHash: sha256:e788b8bb48ddd612
publishState: published
---

Alibaba a sorti Qwen4-Max le 16 novembre 2026, et vous ne pouvez pas le télécharger : le modèle est disponible sur QwenCloud, via le Token Plan et l'API, et les poids ouverts annoncés concernent des modèles « plus petits » de la série Qwen4, attendus « bientôt » [s1]. Ni date, ni tailles.

Si vous hébergez du Qwen vous-même, c'est cette dernière ligne qui vous concerne. Ce que vous pourrez faire tourner, ce sera un Qwen4 plus petit, quand il arrivera. Les poids de celui-ci n'auraient de toute façon pas servi à grand monde : Qwen4-Max est un mixture-of-experts de 2 400 milliards de paramètres au total, dont 71 milliards actifs par token [s1]. Peu d'équipes ont le matériel pour ça.

Le chiffre qu'Alibaba met en avant, c'est le coût. Sur Work360, son propre benchmark, Qwen4-Max fait mieux que Qwen3.8-Max en consommant 35 % de tokens en moins en effort de raisonnement High, et le coût moyen par tâche baisse d'environ 60 % [s1]. TechNode donne les montants derrière le pourcentage : 26,58 RMB par tâche avant, 11,16 RMB maintenant [s2]. Soit 58 %, on ne va pas chipoter.

Avec ces deux chiffres, on peut couper l'économie en deux. Une tâche qui coûte 42 % de son ancien prix avec 65 % des tokens, cela veut dire que le coût moyen du token a lui aussi baissé d'un tiers environ. Le calcul est de moi, et il suppose que le coût et le nombre de tokens viennent des mêmes exécutions, ce qu'aucune des deux pages ne précise. S'il tient, les deux facteurs pèsent à peu près autant, chacun autour de 0,65, et seul le premier est une propriété du modèle. Le second est une grille tarifaire, ou un autre mélange de tokens d'entrée et de sortie ; les pages ne disent pas lequel.

Les deux chiffres sortent de Work360, le benchmark maison d'Alibaba, sur 721 domaines spécialisés [s1] : prenez-les comme une tendance, pas plus. Avant de déplacer du trafic, je rejouerais une journée de mes propres requêtes sur l'API en comptant les tokens. La fenêtre de contexte d'un million de tokens [s2] est l'autre point à tester avant d'y croire : je n'ai trouvé dans l'annonce aucun chiffre de rappel à cette longueur.
