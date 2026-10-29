---
translationKey: strict-tool-decoding-is-a-per-model-serving-decision
lang: fr
slug: un-score-de-schema-parfait-ne-certifie-pas-le-decodage-strict
title: Un score de schéma parfait ne certifie pas le décodage strict des outils
publishDate: 29-10-2026
tags:
- agents
- llm-oss
- evaluation
category: essays
difficulty: 4
sources:
- label: Ubicloud, Fixing Tool-Call Accuracy in vLLM (baseline)
  url: https://www.ubicloud.com/blog/fixing-tool-call-accuracy-in-vllm
  date: 20-10-2026
- label: Moonshot AI, K2 Vendor Verifier README at a pinned commit (vendor differences)
  url: https://raw.githubusercontent.com/MoonshotAI/K2-Vendor-Verifier/0bc5061be1a7b5667c2ec71a546a6b1c9ff5af9a/README.md
  date: 14-02-2026
- label: 'vLLM pull request #45600, skip structural tags for auto tool_choice without
    strict mode'
  url: https://github.com/vllm-project/vllm/pull/45600
  date: 14-06-2026
- label: 'vLLM issue #50989, Qwen doom loop with strict mode on argument-free tools
    (report)'
  url: https://github.com/vllm-project/vllm/issues/50989
  date: 04-08-2026
- label: 'vLLM issue #55541, GLM-5.3-Flash forced tool_choice runs to max_tokens (report)'
  url: https://github.com/vllm-project/vllm/issues/55541
  date: 06-09-2026
- label: 'vLLM issue #58930, schema feature checks skipped inside structural tags'
  url: https://github.com/vllm-project/vllm/issues/58930
  date: 27-09-2026
- label: Park et al., Grammar-Aligned Decoding, NeurIPS 2024 (distortion)
  url: https://papers.nips.cc/paper_files/paper/2024/hash/2bdc2267c3d7d01523e2e17ac0a754f3-Abstract-Conference.html
  date: 29-10-2026
- label: Moonshot AI, K2 Vendor Verifier tool_calls_eval.py at a pinned commit (finish
    reason routing)
  url: https://raw.githubusercontent.com/MoonshotAI/K2-Vendor-Verifier/0bc5061be1a7b5667c2ec71a546a6b1c9ff5af9a/tool_calls_eval.py
  date: 14-02-2026
contentHash: sha256:60424cf1e09b57ad
publishState: published
---


Je pense qu'un score de schéma parfait est le mauvais certificat pour activer le décodage contraint, car les échecs qu'il ajoute n'atteignent jamais cette métrique. Ubicloud, dont les priorités diffèrent de celles de vLLM [s33], rapporte qu'avec Kimi K2.6 servi par vLLM version 0.28, le schéma d'appel d'outil attendu n'était obtenu que dans 92 % des cas [s1]. Une fois le décodage contraint activé, sa précision des appels d'outils sur le benchmark K2VV ToolCall est passée de 92 % à 100 % [s2], et le fournisseur a déployé le changement en production après avoir vérifié une précision de schéma de 100 % sur toutes les versions de modèles qu'il sert [s8].

C'est cette dernière étape que je ne copierais pas. À mon sens, le chiffre de schéma ne regarde que les réponses déjà terminées par un appel d'outil, or les échecs que le décodage strict provoque sur d'autres modèles, d'après les rapports publiés, se terminent autrement. Un fournisseur peut trancher ainsi pour les modèles qu'il sert. Une équipe qui reprend ce certificat pour son prochain modèle hérite d'une barrière qui ne peut pas signaler la panne qu'elle est censée détecter.

## Ce que la grammaire apporte

Le mécanisme a de quoi séduire. Avec le décodage contraint, le moteur d'inférence guide la génération pas à pas, là où le chemin non contraint laisse le modèle échantillonner librement les jetons et valide le résultat après coup [s3]. L'article sur le décodage aligné sur la grammaire décrit la même famille d'approches comme une restriction gloutonne des jetons qu'un LLM peut produire à chaque étape, afin de garantir que la sortie respecte une contrainte donnée [s22].

Le vérificateur réclame justement cela. Ses auteurs l'ont construit après avoir observé des différences importantes de performance des appels d'outils entre diverses solutions open source et divers fournisseurs [s9] ; il collecte les réponses de chaque fournisseur et les compare à l'API officielle de Moonshot AI [s14]. Son README rappelle que les grands modèles de langage génèrent le texte jeton par jeton selon des probabilités et n'ont aucun mécanisme intégré pour imposer un schéma JSON strict [s10], et il demande aux fournisseurs d'ajouter un encodage guidé pour garantir le schéma correct [s11].

vLLM a pris le chemin inverse pour ses valeurs par défaut, et l'explication qu'en donne Ubicloud est selon moi le meilleur argument pour traiter le mode strict modèle par modèle. Le moteur a modifié son comportement par défaut pour les requêtes qui n'activent pas explicitement le décodage contraint [s4], avant tout, selon Ubicloud, parce qu'il est conçu pour prendre en charge un large éventail de modèles et que la prise en charge du décodage contraint se traite modèle par modèle [s5]. Des utilisateurs de gpt-oss-20b, Qwen 3.6 et GLM 5.1 ont signalé des problèmes après l'activation de la fonctionnalité par défaut [s6], et la désactiver par défaut est devenu l'option la plus sûre pour un moteur de service indépendant du modèle [s7].

Le masque est aussi l'endroit où loge le risque. Un article de NeurIPS montre que les techniques de décodage contraint peuvent déformer la distribution du LLM et mener à des sorties grammaticales, mais au bout du compte de faible qualité [s21]. La liste que dresse Ubicloud des effets possibles d'une mauvaise traduction de grammaire est parlante : appels d'outils invalides, échecs de requêtes, abandon silencieux du décodage contraint et précision d'appel d'outils plus faible [s37]. Selon moi, seul le premier élément de cette liste est un appel d'outil malformé.

## Ce que mesure le score

Le vérificateur est précis sur ses chiffres, et c'est cette précision que je voudrais voir une équipe lire avant de se fier à l'un d'eux. La précision de schéma y désigne la proportion d'appels d'outils déclenchés dont la charge utile JSON respecte le schéma [s12], calculée comme `count_successful_tool_call / count_finish_reason_tool_calls` [s34]. Le premier compteur est le nombre de réponses tool_calls qui ont passé la validation de schéma [s35] ; le second, le nombre de réponses dont `finish_reason == "tool_calls"` [s24]. Le README indique que cette métrique sert à mesurer la robustesse de l'ingénierie [s28].

Le F1 de déclenchement repose sur une autre comparaison. Il compte un appel manqué quand la raison de fin du modèle vaut `"stop"` ou `"others"` alors que celle de l'API officielle vaut `"tool_calls"` [s13], et le rappel est la proportion d'appels d'outils qui auraient dû être déclenchés et l'ont été [s25]. Le vérificateur utilise `tool_call_f1` pour déterminer si le déploiement du modèle est correct [s26] et en fait la métrique principale pour vérifier un déploiement [s27].

Je crédite cette conception. Or le chiffre que le fournisseur a consigné avant de déployer est l'autre [s8].

## Où finissent les nouveaux échecs

Regardons maintenant comment se terminent les échecs rapportés. Avec les modèles Qwen, quand un outil n'a aucun argument et utilise le mode strict, la génération tombe souvent dans une boucle infernale qui émet sans arrêt le jeton 197 [s16] ; le ticket renvoie à mlc-ai/xgrammar#1004, qui rend légale la fermeture du gabarit tout en conservant des schémas stricts [s17]. Ce rapport ne donne aucune raison de fin pour la boucle, et je ne lui en attribue donc aucune.

Le cas GLM est plus net. Un ticket intitulé « GLM-5.3-Flash with forced tool_choice (named function) fails to converge » [s23], autrement dit un tool_choice forcé sur une fonction nommée, rapporte qu'une fraction des requêtes ne converge jamais, la génération allant jusqu'à `max_tokens` [s18] et la réponse revenant avec `finish_reason: "length"` [s30]. Passer `tool_choice` à `"auto"` suffit pour que la requête passe à chaque fois [s31]. Un commentateur du ticket pense qu'il s'agit d'une boucle d'espaces côté grammaire, reproductible au niveau des jetons sans GPU [s19].

Le troisième rapport est plus discret. La fonction `validate_xgrammar_grammar()` du moteur ne vérifie pas les schémas JSON imbriqués dans une balise structurelle pour les fonctionnalités que xgrammar ne prend pas en charge, si bien que ces contraintes sont abandonnées en silence [s20]. Une pull request en amont empêche les balises structurelles de trop contraindre la génération du modèle lorsque l'appelant n'a pas explicitement demandé un appel de fonction strict [s15].

> [!CONFIRMED]
> Avec un tool_choice forcé sur GLM-5.3-Flash [s23], une fraction des requêtes va jusqu'à `max_tokens` [s18] et revient avec `finish_reason: "length"` [s30]. Le vérificateur calcule la précision de schéma comme `count_successful_tool_call / count_finish_reason_tool_calls` [s34], le second compteur étant le nombre de réponses avec `finish_reason == "tool_calls"` [s24].

> [!INFERRED]
> À mon sens, ces fins sur `length` n'entrent jamais dans ce compteur. Sur un modèle qui échoue de cette façon, une grammaire stricte peut pousser la précision de schéma vers la perfection pendant que les requêtes qu'elle casse restent hors du ratio : le chiffre ne baisse jamais pour l'échec qui compte.

Le vérificateur voit pourtant ces fins, et c'est la partie que je trouve la plus utile. Son script d'évaluation envoie chaque réponse porteuse d'une raison de fin vers l'une de trois branches : stop, tool_calls (scindée entre appels valides et erreurs de schéma) et toute autre raison, que le script compte dans `finish_others` et ventile par raison dans `finish_others_detail` [s38]. Selon ma lecture du script, cette ventilation fait partie du résumé qu'il écrit dans son fichier de résumé [s39], `summary.json` par défaut [s40]. Le décompte par raison que je réclame existe déjà.

Pendant l'exécution, un opérateur surveille une ligne de progression qui affiche Total, Success, Failed, Stop, ToolCalls, ToolCallValid et ToolCallInvalid [s41]. Je ne vois sur cette ligne aucun champ où une fin sur `length` serait comptée. J'appelle cela le compartiment manquant : l'échec est compté et écrit sur disque, et pourtant il n'apparaît ni dans la ligne de progression ni dans le chiffre affiché en tête.

## Le meilleur argument contre

Le gros de l'argument contre moi vient du vérificateur lui-même. Il s'appuie sur `tool_call_f1` pour décider si un déploiement est correct [s26] et en fait la métrique principale pour vérifier un déploiement [s27]. Une réponse qui se termine sur `"others"` là où l'API officielle a produit un appel d'outil compte comme un appel manqué selon ses règles [s13], et le script range sous `finish_others` toute fin qui n'est ni stop ni tool_calls [s38]. Ubicloud, de son côté, se concentre sur le service des modèles Kimi et DeepSeek avec la qualité que les utilisateurs attendent des fournisseurs d'origine [s36], et a vérifié avant de livrer [s8]. La boucle GLM a un diagnostic [s19] et la boucle Qwen une modification de grammaire référencée [s17]. Lu ainsi, le bon certificat existe déjà, le fournisseur l'a appliqué dans son périmètre, et les boucles sont des bugs en voie de disparition.

J'accepte l'essentiel de cet argument. Selon ma lecture de ces définitions, le F1 enregistre bien une fin sur `length`, comme un appel manqué de plus. Ce qu'il ne dit pas, c'est pourquoi l'appel manque : une boucle de grammaire qui a couru jusqu'à `max_tokens` et un modèle qui a choisi de répondre en prose comptent pareil. Les auteurs du vérificateur ont d'ailleurs interrogé l'API officielle à plusieurs reprises pour tester la fluctuation de `tool_call_f1` [s29], ce que je lis comme le signe qu'eux aussi traitent une lecture unique du F1 avec prudence. Le certificat que le fournisseur a consigné était le score de schéma [s8], et c'est ce score qu'un lecteur du billet recopiera.

L'argument du périmètre vaut pour Ubicloud, et c'est précisément pourquoi je n'étendrais pas le résultat à un autre modèle. La déformation tient au masquage lui-même [s21] : chaque nouveau modèle, et chaque nouveau format d'outil sur un ancien modèle, exige donc sa propre vérification. Une boucle diagnostiquée reste une boucle dans mon déploiement tant que je n'ai pas testé la modification sur mon propre modèle.

## Ce que je déploierais

Le mode strict se règle désormais par déploiement : vLLM a ajouté l'option `--tool-strict-level` pour que les utilisateurs puissent activer le mode strict des appels d'outils sur leurs déploiements [s32]. Je l'activerais modèle par modèle, et je certifierais chaque modèle sur quatre lectures tirées d'une même exécution du vérificateur.

| Lecture | D'où je la tire | Ce qu'elle attrape |
| :--- | :--- | :--- |
| Précision de schéma | compteurs d'appels tool_calls valides et invalides du résumé | charges utiles malformées parmi les appels terminés |
| F1 de déclenchement | la comparaison avec l'API officielle | appels manquants, quelle qu'en soit la raison |
| Fins hors outil par raison | `finish_others_detail` dans le fichier de résumé | boucles et emballements qui finissent en `length` |
| Sonde d'application | une requête construite pour enfreindre une contrainte imbriquée dont je dépends | contraintes que la grammaire a abandonnées sans erreur |

La troisième lecture coûte une commande après l'exécution :

```bash
# mon esquisse : par modèle, lire le compartiment que la ligne de progression omet
jq '{tool_calls: .finish_tool_calls, invalid: .schema_validation_error_count, others: .finish_others_detail}' summary.json
```

Ma barrière : aucune entrée `length` dans cette table sur le mélange de requêtes certifié, un F1 dans la bande de variation que vous avez mesurée pour l'API officielle, et une sonde qui échoue quand elle le doit. Deux règles s'y ajoutent. Le tool_choice forcé reste hors du périmètre certifié tant que ce mode n'a pas été testé à part, puisque le ticket GLM échoue avec une fonction nommée [s23] et passe à chaque fois en mode auto [s31]. La sonde est obligatoire parce qu'un validateur qui ne vérifie pas les schémas imbriqués pour les fonctionnalités que xgrammar ne prend pas en charge abandonne ces contraintes en silence [s20], et un score de schéma propre peut alors venir d'une grammaire qui n'a jamais appliqué la partie qui vous importe.

Le mode d'échec que je surveillerais est celui du fil GLM : une boucle d'espaces qui consume la requête jusqu'à `max_tokens` [s18], qu'un commentateur diagnostique comme venant de la grammaire [s19]. Cet échec n'apparaît jamais comme un mauvais appel d'outil. Si votre certificat pour le décodage strict est un chiffre de schéma, il ne le verra jamais.
