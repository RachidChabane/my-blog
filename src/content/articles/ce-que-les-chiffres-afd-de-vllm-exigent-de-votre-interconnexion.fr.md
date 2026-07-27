---
translationKey: afd-throughput-does-not-transfer-without-the-fabric
lang: fr
slug: ce-que-les-chiffres-afd-de-vllm-exigent-de-votre-interconnexion
title: Ce que les chiffres AFD de vLLM exigent de votre interconnexion
publishDate: 27-07-2026
tags:
- llm-oss
- evaluation
category: essays
difficulty: 4
sources:
- label: vLLM blog, AFD plugin announcement
  url: https://vllm.ai/blog/2026-07-23-vllm-afd-plugin
  date: 23-07-2026
- label: arXiv 2602.09721, roofline analysis of AFD
  url: https://arxiv.org/abs/2602.09721
  date: 10-02-2026
- label: arXiv 2605.28302, AFD design-space exploration
  url: https://arxiv.org/abs/2605.28302
  date: 27-05-2026
contentHash: sha256:bb15809ea316b261
publishState: published
---


Le +11.3 % que le plugin AFD de vLLM rapporte en 64A16F [s1] ne se transporte pas jusqu'à votre cluster, et la publication ne livre pas de quoi le mériter. Par rapport à EP64, le même résultat rapporté place 48A16F à -5.3 % [s1]. À l'intérieur des exécutions du fournisseur, ce couple de chiffres se tient et s'explique de lui-même : le ratio de provisionnement entre attention et FFN varie, et le résultat suit. Le pourquoi de ce basculement de signe est donc réglé par le provisionnement. Reste la question que la publication laisse ouverte, et c'est celle que je veux instruire : le bon côté de ce basculement est-il accessible à un lecteur qui n'a pas acheté le même tissu d'interconnexion ?

## Ce que le fournisseur a mesuré

Trois chiffres portent tout l'argument, et chacun est plus étroit qu'il n'y paraît. Par rapport à EP64, les résultats AFD sont de -5.3 % pour 48A16F et de +11.3 % pour 64A16F [s1]. Un autre résultat rapporté situe les deux mêmes ratios de provisionnement à -10.0 % et +9.0 % [s2]. Par die, EP64 atteint 168.2 tokens/s/die, 48A16F atteint 151.4 tokens/s/die et 64A16F atteint 183.3 tokens/s/die [s3].

L'ordre se maintient d'un rapport à l'autre. Les amplitudes, elles, bougent, et aucun des deux extraits ne dit ce qui les sépare. J'y vois le premier avertissement à coller sur l'ensemble des chiffres : les conditions capables de déplacer un résultat à ce point sont précisément celles que la publication ne donne pas. Aucun modèle n'est nommé. Aucune charge de travail n'est nommée. Aucune classe de cluster n'est nommée. Trois chiffres, et il manque à chacun toutes les variables qui permettraient de prédire les vôtres.

## Le mécanisme du gain passe par la bande passante scale-out

AFD tire son gain de la mise à l'échelle des instances FFN indépendamment des instances d'attention ; c'est bien pour cela que le ratio de provisionnement est le bouton que le fournisseur balaie. Or une analyse en roofline, publiée cinq mois avant le plugin, pose un plafond sur ce bouton. Sur des clusters standards, augmenter le nombre d'instances FFN n'améliore pas le HFU car la charge de calcul est plafonnée par la bande passante scale-out ; ces limitations s'atténuent dans des conditions précises, à savoir un matériel de classe superpod doté d'une bande passante d'interconnexion abondante et des modèles à experts à gros grain et à faible sparsité [s4].

Ces deux résultats ne jouent pas au même niveau, et tout mon argument tient à ne pas les confondre. Le balayage côté attention, c'est la manière dont le fournisseur a trouvé son propre optimum : à nombre d'instances FFN fixé, faire varier le nombre d'instances d'attention change le côté d'EP64 où retombe le résultat, et il s'agit là d'un effet interne au provisionnement, à tissu d'interconnexion constant. Le plafond côté FFN tranche tout autre chose : l'existence même d'un optimum de cette forme sur un cluster donné. Je n'affirme pas que les exécutions de vLLM se situaient dans la zone morte. Je n'affirme pas davantage qu'elles se situaient au-dessus. Les extraits ne fixent pas la classe de cluster, et aucune de ces deux affirmations ne m'est donc accessible, pas plus qu'au lecteur qui voudrait raisonner à partir du signe publié.

Ce que la publication ne fait pas, c'est situer son propre matériel face à la variable que le travail en roofline isole. Ce silence est le résultat intéressant. Un signe publié sans son tissu d'interconnexion reste un résultat obtenu sur un cluster, exprimé dans une unité qui a l'air transposable ; d'ailleurs le cadrage par die de [s3] renforce encore l'illusion, puisque tokens/s/die se lit comme une grandeur normalisée par le matériel alors que le matériel est justement ce qui varie.

> [!CONFIRMED]
> Sur des clusters standards, augmenter le nombre d'instances FFN n'améliore pas le HFU parce que la bande passante scale-out plafonne la charge de calcul, et cette limitation s'atténue sur du matériel de classe superpod à bande passante d'interconnexion abondante ainsi que sur des modèles à experts à gros grain et à faible sparsité [s4].

> [!INFERRED]
> Ma lecture : la désagrégation est une décision qui porte sur le tissu d'interconnexion installé sous vos baies, et elle vit au rythme du cycle d'achat qui a financé ce tissu. La traiter comme un choix de configuration de service masque l'échelle de temps de l'engagement réellement pris.

## La défaillance que personne n'a mesurée

La montée en charge discrète d'AFD, à la granularité du nœud, entraîne des pénalités de déséquilibre plus élevées que l'ajustement continu des batchs propre à EP [s4]. Dans l'article, c'est un énoncé sur le débit. En production, cela devient un énoncé sur le taux d'utilisation, et les deux divergent dès que la charge cesse d'être stationnaire.

Le trafic réel arrive par rafales. Le parallélisme d'experts encaisse une rafale en élargissant un batch : c'est continu, et cela ne coûte rien de plus que ce qui est déjà provisionné. AFD encaisse la même rafale à condition d'avoir provisionné assez de nœuds FFN en amont, puisque l'unité d'ajustement est le nœud entier. Entre ces deux comportements se loge le mode de défaillance que je nommerais explicitement à quiconque met ce plugin en pilote : du silicium au repos, sous arrivées en rafales, à la granularité du nœud. Quand le côté attention sature et que le côté FFN ne suit pas, le mou représente un nœud complet d'accélérateurs qui vous appartient déjà, et il reste inactif le temps du creux.

Tous les chiffres publiés sur le sujet sont des mesures en régime stationnaire, et une telle mesure est structurellement incapable de faire apparaître ce phénomène : elle rapporte une moyenne, et la moyenne est exactement l'endroit où le déséquilibre s'efface. Ce que le banc observe et ce que le choix de topologie vous coûte sont deux grandeurs distinctes, et seule la première est publiée.

## Le meilleur argument en faveur d'AFD

La position adverse est solide, et je tiens à l'énoncer dans sa version la plus forte avant d'y répondre. Sous des SLO TTFT/TPOT stricts, AFD soutient environ 4k tokens/s de débit système sur DeepSeek-V3.2 pour des charges de chat, de code et de codage agentique, là où les déploiements sans AFD sont irréalisables [s5]. « Irréalisable » est un mot fort, et il semble ici le bon : ce résultat délimite une région de l'espace de conception qui ne s'ouvre qu'une fois la désagrégation en place. Quiconque range AFD au rayon de la complexité gratuite doit rendre compte de cette région, et je ne crois pas que ce soit faisable.

Ma réponse porte sur la portée du résultat plutôt que sur sa validité. Un résultat de faisabilité en un point de conception est un énoncé sur le matériel et sur la granularité de modèle de ce point précis. Les conditions qui rendent un tel point atteignable sont celles que l'analyse en roofline isole [s4], et les extraits capturés ne fixent pas davantage la classe de cluster derrière les exécutions du fournisseur que celle derrière l'étude d'espace de conception. Le résultat tient donc, et il voyage exactement aussi loin que le matériel qui le porte.

> [!WARNING]
> Un résultat de faisabilité sous SLO strict ne règle pas la question de la transposabilité du débit. Si vos SLO ne rendent pas déjà irréalisable un déploiement sans AFD, ce régime n'est pas le vôtre, et la question du débit revient aussitôt.

## La règle de décision que j'appliquerais

Le parallélisme d'experts reste ma valeur par défaut, et il le reste tant que trois points ne sont pas établis sur le matériel qui servira vraiment le trafic. Des experts à gros grain avec une sparsité plus faible, c'est le côté de [s4] où AFD dispose de marge, alors qu'un MoE à grain fin et à forte sparsité tombe du côté où le plafond arrive tôt : la sparsité du modèle et la granularité des experts décident donc si le mécanisme vous est seulement accessible. Votre classe d'interconnexion décide ensuite s'il paie, puisque sur le tissu scale-out d'un cluster standard la mise à l'échelle indépendante des FFN qu'AFD vous vend est exactement le mécanisme dont [s4] dit qu'il cesse d'améliorer le HFU. Reste la mesure, sur votre propre cluster, avant qu'un delta publié n'entre dans une décision.

```bash
vllm bench serve \
  --model "$MODEL" \
  --dataset-name random \
  --num-prompts 2000 \
  --request-rate 12
```

Un taux de requêtes fini, c'est ce que j'utilise pour obtenir un vrai processus d'arrivée au lieu d'un flot dos à dos ; or le flot dos à dos est justement le régime où la pénalité de déséquilibre reste invisible. Lancez la mesure sur les deux topologies à SLO fixé. Lisez les tokens/s/die au lieu du débit agrégé, pour qu'un nombre de nœuds plus élevé ne flatte pas le gagnant. Enregistrez le taux d'utilisation par nœud sur toute la durée de la campagne, et conservez-en la variance autant que la moyenne, car c'est la variance qu'une topologie à granularité de nœud vous facture.

Les chiffres du fournisseur sont solides en tant que comptes rendus de ses propres exécutions. Ce qui reste ouvert, c'est leur portée, et cela le restera tant que vous n'aurez pas mesuré votre propre tissu d'interconnexion face aux conditions de [s4]. D'ici là, le parallélisme d'experts est la configuration que je garderais en production. Le +11.3 % appartient au cluster qui l'a produit.
