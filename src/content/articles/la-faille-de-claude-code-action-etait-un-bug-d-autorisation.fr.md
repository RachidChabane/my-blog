---
translationKey: claude-code-action-supply-chain-auth
lang: fr
slug: la-faille-de-claude-code-action-etait-un-bug-d-autorisation
title: Où investir votre budget de sécurité quand un agent écrit dans votre CI/CD
publishDate: 11-07-2026
tags:
- agents
- agentic-coding
category: essays
difficulty: 3
sources:
- label: 'GMO Flatt Security (RyotaK), Poisoning Claude Code: One GitHub Issue to
    Break the Supply Chain'
  url: https://flatt.tech/research/posts/poisoning-claude-code-one-github-issue-to-break-the-supply-chain/
  date: 01-06-2026
- label: 'Microsoft Security Blog, Securing CI/CD in an agentic world: Claude Code
    GitHub action case'
  url: https://www.microsoft.com/en-us/security/blog/2026/06/05/securing-ci-cd-in-agentic-world-claude-code-github-action-case/
  date: 05-06-2026
contentHash: sha256:fddc30ced0e14e5c
publishState: published
---


La faille de Claude Code Action a exigé deux conditions pour aboutir, une injection de prompt et un contrôle d'autorisation cassé, et la prochaine heure de revue doit aller sur la seconde. Une routine de permission faisait confiance à tout acteur dont le nom d'application GitHub se terminait par `[bot]`, laissant passer sans condition n'importe quelle application, quelles que soient ses permissions réelles [s1]. Or le réflexe de la plupart des équipes reste de durcir le prompt système contre l'injection, et c'est précisément cette inversion de rentabilité que je veux nommer.

## La faille en une phrase

Une issue GitHub façonnée a piloté l'action, mais le modèle n'a jamais été détourné. La défaillance logeait dans du code d'assemblage ordinaire. L'étape `checkWritePermissions` de l'action décidait si l'appelant avait le droit de déclencher une exécution privilégiée, et elle fondait cette décision sur le nom de l'application GitHub : un suffixe `[bot]` valait preuve de confiance. La divulgation est directe sur la conséquence, ce contrôle « laisse passer sans condition n'importe quelle application GitHub, quelles que soient ses permissions réelles » [s1]. Rien de probabiliste ici : une comparaison de chaîne déterministe renvoie la mauvaise réponse, à chaque fois, pour tout attaquant capable d'enregistrer une application au bon nom.

Relisez ce mécanisme, car il recadre tout l'incident. L'injection dans le corps de l'issue captait toute l'attention parce qu'elle était visible. Le pouvoir, lui, venait d'un booléen qui aurait dû rester faux.

## Ce que l'attaquant a réellement obtenu

Une fois le contrôle franchi, le rayon d'action correspondait au jeton de l'action elle-même. La divulgation énumère un accès en lecture et en écriture au contenu du dépôt, aux issues, aux pull requests, aux discussions et aux fichiers de workflow [s1]. L'écriture sur les fichiers de workflow est le tranchant. Elle réécrit l'automatisation qui s'exécutera à chaque futur push, bien au-delà des données d'un seul dépôt.

De là, les chercheurs décrivent le chemin d'escalade : un attaquant pouvait « compromettre le code source de l'action, qui se propagerait ensuite à chaque dépôt en aval, y compris ceux d'Anthropic » [s1]. Je tiens à l'énoncer fidèlement plutôt que de l'exagérer. C'est le chemin de propagation décrit, la forme supply-chain du risque, et non l'affirmation que chaque dépôt en aval a été compromis. Le point est plus étroit et reste sérieux : quand une action très utilisée accorde une portée d'écriture sur un contrôle usurpable, la défaillance ne reste pas locale, et le jeton confié à un assistant devient le jeton dont hérite l'attaquant.

## Où la frontière a vraiment cédé

Voici la meilleure objection qu'on puisse opposer à mon argument, et elle est solide. Ce n'était pas un bug, mais deux conditions nécessaires. L'injection livrait une instruction malveillante et le bug d'autorisation lui accordait le privilège ; retirez l'une ou l'autre et l'exploit meurt. Désigner le contrôle d'autorisation comme « la vraie cause » et l'injection comme un « simple vecteur de livraison » privilégie donc arbitrairement un maillon nécessaire au détriment d'un autre tout aussi nécessaire. Sous cette lecture, durcir le prompt est une défense en profondeur légitime qui aurait aussi arrêté cette attaque, et « investir sur le harnais plutôt que sur le prompt » s'effondre en un faux dilemme.

Je concède le point des deux maillons nécessaires. Il est juste tel qu'énoncé, et toute version honnête de ma thèse doit le porter. Ce que l'objection manque, c'est que les deux maillons ne sont pas symétriques, et cette asymétrie est exactement ce sur quoi se décide un budget.

Le contrôle d'autorisation est du code d'assemblage déterministe. On peut le corriger une fois et fermer complètement cette classe de contournement : vérifier l'identité réelle de l'acteur et ses permissions résolues au lieu d'un suffixe de nom, et plus aucun nom d'application façonné ne passe. L'injection de prompt n'a pas de fermeture équivalente. En l'état des connaissances, c'est une menace probabiliste sans correctif complet, si bien que chaque heure passée à durcir le prompt n'achète qu'une probabilité réduite de mauvaise issue, sur un canal que l'attaquant continue de sonder. Deux maillons, tous deux nécessaires, mais l'un se ferme avec certitude et l'autre non. Quand la forme est celle-là, le budget marginal de revue revient au maillon que l'on peut réellement verrouiller.

## Une action avec portée d'écriture est un agent embarqué

L'analyse de Microsoft nomme le basculement avec netteté : quand ces frontières cèdent, « le workflow n'est plus une simple automatisation. Il devient un agent d'IA embarqué dans le dépôt, et sa construction de prompt, ses permissions d'outils et son isolation d'exécution font désormais partie du périmètre de sécurité » [s2]. C'est le modèle mental qui manque à la plupart des analyses de menace CI/CD. Un workflow YAML se lit comme de la tuyauterie, donc on le relit comme de la tuyauterie. Dès qu'il confie à un LLM un jeton doté d'une portée d'écriture, c'est un acteur muni de jugement et d'outils, et il appartient au même modèle de menace que tout service capable de modifier votre dépôt.

> [!WARNING]
> Dès qu'un agent de votre pipeline détient une portée d'écriture CI/CD, le prompt système n'est plus votre périmètre de sécurité. La logique de permission qui accorde cette portée et le bac à sable qui borne les outils le sont. Relisez-les comme la frontière de confiance qu'ils sont devenus.

Les deux sources se rejoignent dans l'écart qui les sépare. La divulgation montre le mécanisme concret, un contrôle de suffixe de nom tenant lieu de contrôle d'identité [s1]. L'analyse de Microsoft fournit le cadre général, celui où les permissions d'outils et l'isolation d'exécution deviennent le périmètre [s2]. Aucune ne dit seule la chose intéressante. Ensemble, elles disent ceci : le périmètre a migré dans le code du harnais, et c'est là que vivent les bugs déterministes, ceux qui se ferment.

## Alors investissez le budget sur le harnais

La conclusion pratique tient dans une allocation. À mesure que les agents obtiennent un accès en écriture au CI/CD, la première et la plus grande part de la revue de sécurité revient à la logique de permission et au bac à sable des outils dans le harnais, pas seulement aux défenses contre l'injection, car c'est le contrôle d'autorisation banal qui tenait vraiment les clés [s1] [s2]. Durcir le prompt garde son utilité ; la question est d'ordre et de proportion : les équipes qui traitent le modèle comme le périmètre pendant que le code de permission déterministe reste sous-relu ont le rapport à l'envers.

> [!CONFIRMED]
> Le contrôle de permission de Claude Code Action faisait confiance à un suffixe de nom `[bot]` et laissait passer sans condition n'importe quelle application GitHub, quelles que soient ses permissions réelles [s1].

> [!INFERRED]
> C'est ce maillon qui est entièrement verrouillable. Parce qu'un contrôle d'identité déterministe se corrige une fois pour toutes tandis que la défense contre l'injection n'achète jamais qu'une probabilité, la première part du budget de revue revient à la logique de permission du harnais, pas au prompt.

Concrètement, ce budget achète une courte liste de questions auxquelles vous pouvez répondre avec certitude, et c'est tout l'intérêt. La décision de confiance résout-elle l'identité réelle de l'acteur et ses permissions installées, ou reconnaît-elle un motif de nom ? Le jeton émis pour l'exécution est-il limité à ce dont la tâche a besoin, ou est-ce le large jeton par défaut livré avec l'action ? Les outils que l'agent invoque peuvent-ils sortir d'un bac à sable une fois ce jeton en main ? Aucune de ces questions n'est probabiliste, et chacune passe ou échoue à l'inspection. Le durcissement du prompt n'offre pas ce genre de réponse, et chaque heure investie là débouche sur une clôture vérifiable.

Si vous faites tourner un agent près de votre pipeline, supposez que votre modèle puisse être trompé. Ce qui compte alors, c'est ce qu'il a le droit de toucher une fois trompé, et si le code qui en décide a été relu avec autant de soin que le code qui livre votre produit. Dans cet incident, il ne l'a pas été, et un suffixe de nom de cinq caractères a tenu la porte.
