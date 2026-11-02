---
translationKey: claude-code-agent-summary-side-calls-escape-transcript-cost-accounting
lang: fr
slug: le-correctif-des-resumes-d-etat-laisse-le-registre-de-cout-incomplet
title: Le correctif des résumés d'état de Claude Code ne complète pas le registre
  de coût sur disque
publishDate: 02-11-2026
tags:
- agentic-coding
- agents
category: essays
difficulty: 4
sources:
- label: Flamerix AI gist, Claude Code agent_summary timer (what the call is for)
  url: https://gist.github.com/flamerix-ai/c3905705cc4205e5de3011fa2e74efce
  date: 26-10-2026
- label: Hacker News, the gist authors post their weekly measurement (share of spend)
  url: https://news.ycombinator.com/item?id=50284255
  date: 29-10-2026
- label: claude-code issue 86879, opening measurement from captured raw payloads (method)
  url: https://github.com/anthropics/claude-code/issues/86879
  date: 15-08-2026
- label: claude-code issue 104358, per-request usage missing from disk (problem)
  url: https://github.com/anthropics/claude-code/issues/104358
  date: 22-10-2026
- label: Hacker News, reply from a Claude Code team member (fleet share)
  url: https://news.ycombinator.com/item?id=50284699
  date: 29-10-2026
contentHash: sha256:d4d6025bd4f60cdb
publishState: published
---


À mon avis, Claude Code fait baisser le prix de ses résumés d'état sans compléter le registre sur disque : les transcripts que lisent les outils de coût omettent ces appels. Le ticket à l'origine de la plainte indique que chaque appel agent_summary renvoie tout l'historique de conversation d'un sous-agent et le schéma complet des outils, toutes les 30 secondes par sous-agent actif [s26], et que ces appels portent `skipTranscript: true`, si bien qu'ils n'apparaissent dans aucun transcript, le journal de conversation que Claude Code écrit sur disque [s31]. Un second ticket, le 104358, range agent_summary parmi plusieurs types de requêtes facturées qui ne laissent aucune ligne sur disque [s19]. Il rapporte que dans les sessions chargées en sous-agents, une somme fondée sur les transcripts est de 1.35 à 2.13 fois inférieure au cost-state de Claude Code [s29], dont la comptabilité interne est juste [s30]. Aucune de ces sources ne dit quelle part de cet écart revient à agent_summary. À mon sens, un rapport de coût reconstruit à partir des transcripts sous-compte par construction.

## Les appels que le transcript ne voit pas

À mon avis, la question de savoir à quoi sert cet appel compte moins que l'endroit où son coût est consigné. Selon Flamerix AI [s43], Claude Code envoie le transcript complet d'un agent d'arrière-plan en activité au modèle de cet agent, en général Opus [s27], et la réponse met seulement à jour la ligne d'état de l'agent dans le panneau des agents, sans jamais atteindre le modèle ni la conversation [s1]. Un commentateur qui se présente comme membre de l'équipe Claude Code [s39] précise que l'appel ne concerne que les agents d'arrière-plan en train de travailler, qui reçoivent un appel de résumé environ toutes les 30 secondes [s21], et que ces résumés permettent à l'utilisateur comme à Claude Code de suivre ce que fait chaque agent [s40].

À mon sens, le défaut tient à ce que Claude Code écrit sur disque, et cet appel n'en est que le cas le plus visible. Le `skipTranscript: true` du rapport initial [s31] dit pourquoi ce type de requête disparaît. Le ticket 104358 élargit le cadre : rien de ce que Claude Code écrit sur disque ne permet à un outil de reconstituer ce qu'a coûté une session [s18], et les requêtes dont le querySource vaut `agent_summary`, `auto_mode` (les deux étapes du classifieur), `compact`, `away_summary`, `generate_session_title`, `extract_memories`, `prompt_suggestion`, entre autres, sont facturées sans apparaître ni comme lignes assistant ni comme lignes api-request [s19]. La comptabilité interne, juste comme on l'a vu, prouve que le bon chiffre existe dans le processus ; il n'atteint jamais les fichiers.

À mon sens, le bon chiffre a été trouvé par une voie qui ne passe jamais par ces fichiers. Sur Hacker News, le post qui renvoie vers le gist attribue le signalement de l'anomalie au système DRIM de ses auteurs [s42]. Le gist situe la détection par ce même DRIM dans l'export OpenTelemetry de Claude Code : en regroupant les événements `claude_code.api_request` par `query_source`, agent_summary apparaissait plus coûteux que la conversation principale elle-même [s3]. Le gist ajoute que ces requêtes ne sont pas écrites dans les journaux de session sur disque [s7]. À mon sens, un environnement d'agent facture une surface plus large que sa conversation. Les outils de coût ne lisent que la conversation.

## Chaque part est juste pour quelqu'un

À mon avis, chaque part citée dans ce fil est juste pour la charge qui l'a produite, et c'est pourquoi une moyenne sur tous les utilisateurs apprend peu de chose à une équipe. Les chiffres divergent parce que chacun rapporte une population différente à un dénominateur différent ; le tableau garde chaque part à côté de ce qu'elle divise.

| Qui a mesuré | Périmètre | Part | De quoi |
| :--- | :--- | ---: | :--- |
| Flamerix AI [s41] | Une semaine mesurée | 16.4 % (conversation principale 15.7 %) | Dépenses totales estimées |
| Flamerix AI [s4] | Même semaine | 19.7 % | Toutes les requêtes API |
| Rapport initial [s44] [s8] | Une session de 4 heures, 27 sous-agents, 1 496 requêtes | 22.7 % [s9] | Toutes les requêtes API |
| Deuxième mesure [s11] | Une session | 26 % | Jetons lus en cache |
| Commentateur du ticket [s32] | 30 jours, 129 sessions avec agents d'arrière-plan | environ 14 % / environ 10 %, jusqu'à 24 % | Requêtes / dépenses estimées |
| Membre de l'équipe Claude Code [s20] | Utilisateurs qui envoient de la télémétrie, semaine dernière | environ 2 % (environ 6 % dans le terminal) | Coût aux prix catalogue de l'API |
| Lecteur de Hacker News [s24] | Ses propres sessions | 8 % au plus | Non précisé |

Le bas de la fourchette vient de la population la plus large. Le membre de l'équipe parle pour tous les utilisateurs qui envoient de la télémétrie, et situe le terminal, où ont lieu presque tous ces appels, à environ 6 % du coût [s20]. Un lecteur de Hacker News a constaté que l'appel ne touche que les sous-agents, les workflows ne semblant pas concernés [s23], et suppose que beaucoup de nouveaux utilisateurs préfèrent les workflows, si bien que l'impact serait moindre que ne le suggérait le rapport [s45]. Cette lecture d'une charge atypique revient au lecteur, et elle tient.

Le haut de la fourchette vient des gros utilisateurs, avec une réserve : la dépense de Flamerix est l'estimation par requête de Claude Code lui-même, et sur un abonnement, ce qu'on perd, c'est de la marge avant les limites de débit [s5]. Le commentateur du ticket qui a mesuré sur 30 jours rapporte que les sous-agents Opus représentaient environ 90 % de sa part [s33]. À mon avis, les deux bouts sont justes. Reste à savoir à quelle ligne ressemble votre équipe ; à mon sens, une équipe qui lance beaucoup de sous-agents de l'outil Agent doit se ranger dans les lignes du haut tant qu'elle n'a pas compté.

## Ce qui fixe la part d'une équipe

À mon avis, la part d'une équipe dépend de la façon dont elle répartit le travail, et les sources nomment les leviers : le nombre d'agents, la fréquence à laquelle leurs transcripts changent et la taille de leur contexte. Le rapport initial affirme que le coût croît avec le fan-out et la durée réelle, si bien qu'une session avec trois sous-agents concurrents de longue durée paie six de ces appels par minute [s10]. Un commentateur, journal de débogage à l'appui, rapporte que le minuteur saute des ticks tant que le transcript ne change pas [s37] : le coût suit donc la fréquence à laquelle le transcript de l'agent change [s38]. Selon la deuxième mesure, chaque tick coûte la taille du contexte courant de l'agent : un agent à 380k de contexte paie environ 45 M de jetons lus en cache par heure pour sa seule ligne de spinner [s12]. Multipliez ces leviers, et l'écart du tableau cesse de ressembler à un désaccord.

À mon sens, le levier le moins cher tient au type d'agent qu'une équipe emploie. Le même commentateur du ticket [s32] rapporte que seuls les sous-agents de l'outil Agent reçoivent le minuteur, et que dans une de ses sessions, 1 802 requêtes d'agents de workflow sont passées sans minuteur de résumé [s17]. Le même commentateur ajoute que déplacer les gros fan-outs scriptés vers des workflows évite ce coût et conserve les forks [s34]. Voilà un choix d'architecture assorti d'une ligne de coût, que la plupart des équipes font pour d'autres raisons.

> [!CONFIRMED]
> Deux parties rapportent que les agents de workflow échappent au minuteur : un commentateur du ticket a compté 1 802 requêtes d'agents de workflow sans minuteur de résumé [s17], et un lecteur de Hacker News a constaté que les workflows ne semblaient pas concernés [s23].

> [!INFERRED]
> Je traite tout rapport de coût reconstruit à partir des fichiers sur disque comme une borne inférieure ; à mon sens, son erreur croît avec le fan-out d'agents de l'outil Agent qu'une équipe lance et avec la fréquence à laquelle ces agents modifient leurs transcripts.

## Le correctif baisse le prix et laisse le registre en l'état

À mon avis, l'éditeur a répondu à la plainte qu'il avait reçue, qui portait sur le prix, et a laissé le registre en l'état. Le membre de l'équipe indique qu'ils viennent de déployer un correctif pour le cas le plus coûteux, les résumés qui ratent le cache de prompt [s22]. L'équipe travaille en outre à un mode bien moins coûteux, qui enverrait de courtes notes à un modèle plus petit à la place du transcript complet [s28]. Flamerix rapporte qu'environ 98 % de ces appels relisent le transcript depuis le cache, et que les quelque 2 % qui tombent sur un cache froid portent plus d'un tiers du coût de l'appel [s6]. À mon sens, le correctif vise ce tiers-là.

Les deux changements portent sur le coût d'un appel. Or la liste du ticket 104358 [s19] cite toujours auto_mode, compact, generate_session_title et extract_memories parmi les requêtes facturées sans ligne sur disque, et aucun des deux n'y touche. À mon sens, agent_summary a attiré l'attention parce que, dans certaines charges, il pesait lourd. À mon avis, le mode moins coûteux fera taire le seul appel secondaire assez gros pour se remarquer et laissera le reste de la liste hors du registre ; l'alarme peut donc s'éteindre avant que le registre soit corrigé. Une version qui écrirait ces query sources sur disque me donnerait tort. C'est sur ce pronostic que je parierais.

## Compter les appels avant de se fier à une option

D'expérience, une option dont on dit qu'elle marche sur une machine ne garantit rien au-delà de cette machine. Selon Flamerix AI [s43], aucun réglage ne désactive l'appel, activé par défaut depuis la 2.1.232 [s2]. Le commentateur qui a mesuré sur 30 jours rapporte que sous macOS, `CLAUDE_CODE_FORK_SUBAGENT=0` arrête toujours les résumés en 2.1.312 [s13], et que l'écart vient peut-être de la plateforme ou de flags côté serveur, cause qu'il n'a pas trouvée [s14]. Un commentateur sous Linux rapporte que la même variable n'arrête pas agent_summary en 2.1.312 [s15]. Chez lui, la version d'origine a produit 5 appels de résumé espacés d'environ 32 s, `FORK_SUBAGENT=0` en a aussi produit 5 et le preload Bun 0 [s16]. Un commentateur qui a lu les bundles conclut que la variable de fork n'arrête les résumés que dans une session interactive où rien n'a défini le flag [s35], et tient une entrée de settings pour la variable, quelle que soit sa portée, pour la cause la plus probable de l'échec sous Linux [s36].

Je ne me fie donc à aucune de ces options avant un comptage : je regroupe les requêtes facturées par `query_source`, comme Flamerix, ou je compte les appels de résumé dans un journal de débogage, comme le commentateur sous Linux.

> [!CAUTION]
> Une option que vous avez réglée reste une hypothèse tant qu'un comptage de requêtes ne l'a pas confirmée. Comptez les appels de résumé avant et après le changement, sur la machine et dans le mode de session que vous utilisez vraiment.

## Les objections

L'objection la plus forte compte cinq volets, et je les accepte tous. L'export enregistre déjà ces appels par query_source [s3]. Le chiffre de population, environ 2 % du coût aux prix catalogue [s20], est le plus honnête, et un lecteur a vu 8 % au plus [s24]. Les chiffres des utilisateurs sont des estimations de Claude Code lui-même [s5]. La comptabilité interne de Claude Code est juste [s30]. Et l'équipe travaille à un mode bien moins coûteux [s28], qui pourrait rendre l'appel négligeable.

Ma réponse est plus étroite qu'une réfutation. J'utilise moi-même l'export, et je le recoupe avec le cost-state. Certains de ces points portent sur la taille d'un appel ou l'honnêteté d'une estimation ; les autres situent le bon chiffre dans le processus et dans un export. Aucun n'écrit les lignes manquantes sur disque, et les fichiers que lisent les outils d'une équipe ne portent toujours pas ce chiffre.

Je budgète les agents à partir des requêtes facturées et je lis tout total reconstruit depuis le disque comme un plancher.
