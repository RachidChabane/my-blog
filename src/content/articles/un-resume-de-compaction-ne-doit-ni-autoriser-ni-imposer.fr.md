---
translationKey: compaction-summaries-carry-no-authority
lang: fr
slug: un-resume-de-compaction-ne-doit-ni-autoriser-ni-imposer
title: Un résumé de compaction ne doit ni autoriser ni imposer
publishDate: 28-10-2026
tags:
- agents
- agentic-coding
category: essays
difficulty: 4
sources:
- label: 'arXiv 2610.29869, Compaction Laundering: Provenance Destruction in Context-Compacting
    Coding Agents'
  url: https://arxiv.org/abs/2610.29869
  date: 21-10-2026
- label: arXiv 2610.31778, Benchmarks Are Surprisingly Compaction-Friendly
  url: https://arxiv.org/html/2610.31778v1
  date: 22-10-2026
- label: 'hermes-agent issue #144835, forged role labels launder through compaction'
  url: https://github.com/NousResearch/hermes-agent/issues/144835
  date: 26-10-2026
- label: 'Claude Code issue #96422, custom instructions lost across context compaction'
  url: https://github.com/anthropics/claude-code/issues/96422
  date: 23-09-2026
- label: 'Copilot CLI issue #4687, instruction files not preserved across compaction'
  url: https://github.com/github/copilot-cli/issues/4687
  date: 01-09-2026
contentHash: sha256:fde7fc0c9d0ac222
publishState: published
---


Je pense qu'un agent doit sortir d'une compaction sans approbation ni règle qu'il ne puisse rattacher à un tour utilisateur typé ou relire dans un fichier. Les agents de code qui tournent assez longtemps doivent compacter leur contexte : résumer la conversation, jeter l'original et conserver le résumé comme mémoire [s22]. Un article récent montre que, dans des agents de code open source populaires, cette étape constitue une frontière de confiance exploitable [s1] : un attaquant qui contrôle n'importe quel contenu lu par l'agent peut forger un tour utilisateur qui survit à la compaction comme une instruction authentique [s3].

Les harnais qui aplatissent la conversation typée en une seule chaîne de texte brut, en marquant chaque message d'une étiquette textuelle comme `[User]:`, détruisent la provenance des messages dans le code, avant même que le modèle chargé du résumé ne s'exécute [s2]. Le correctif proposé consiste à échapper ces étiquettes. À mon sens, c'est un plancher. Le résumé ne sait pas transmettre l'autorité, dans un sens comme dans l'autre : il invente des instructions que personne n'a données et perd celles qu'on a bel et bien données. Je cesserais de lui en confier la moindre parcelle.

## Une approbation forgée qui survit à la conversation

L'écart que met en avant l'article tient à un seul choix de conception. Sur cinq harnais qui aplatissent la conversation (pi, opencode, Cline, Aider, OpenHands), l'approbation forgée est blanchie dans la mémoire de l'agent dans 87-100 % des cas, jusqu'à une fenêtre de contexte d'environ 908 000 jetons ; sur quatre harnais typés par rôle (Codex, Gemini CLI, Qwen Code, Continue), la même attaque réussit dans 0 % des cas [s4]. Ces taux valent pour les harnais que l'article a testés. Puisque l'attaque est identique des deux côtés, je lis cet écart comme un constat sur les sérialiseurs.

Le texte blanchi passe alors aux actes. Une approbation permanente blanchie pousse de vrais agents qui exécutent des outils à lancer un `curl | sh` contrôlé par l'attaquant dans un bac à sable, et de bout en bout dans la TUI pi en conditions réelles, à environ 50 % contre 0 % pour un bras témoin apparié [s23]. Par le même canal, l'attaquant peut déclarer un fichier interdit, et le plan de l'agent s'en écarte alors de manière constante, ce qui peut rendre une revue de code aveugle à une porte dérobée implantée [s24]. Je trouve ce second résultat le plus inquiétant des deux. Le tour forgé y transportait une règle, et l'agent l'a suivie comme si l'utilisateur l'avait fixée.

Un ticket ouvert sur un autre harnais lit le code de ce harnais et y trouve la même forme. Le ticket demande d'échapper les séquences d'étiquettes de tour lors de la sérialisation destinée au résumé, parce que des étiquettes de rôle forgées sont blanchies par la compaction [s13], et indique que, si l'on fournit au sérialiseur un enregistrement d'outil dont le contenu contient une étiquette forgée, l'étiquette survit [s14]. Le ticket reprend son modèle de menace de l'article [s33]. Je compte ce ticket comme une seconde lecture du mécanisme, sur un autre code et sans taux propre.

## L'échappement ne corrige qu'un encodage

Les deux documents avancent les deux mêmes réparations. L'article indique que le défaut admet un correctif simple au niveau du sérialiseur, qui échappe les étiquettes de rôle avant l'aplatissement, et que les harnais typés par rôle l'évitent entièrement en conservant des messages typés par rôle [s6]. Le ticket propose l'échappement et décrit une alternative structurelle : transmettre au modèle chargé du résumé des messages typés par rôle, sans les joindre [s15]. Le même document hiérarchise d'ailleurs les deux options : l'échappement est le durcissement minimal, et le changement structurel le remplacerait [s31].

Je livrerais l'entrée typée partout où je le peux, et le ticket en donne la raison de l'intérieur. Un échappement couvre les formes d'étiquettes que quelqu'un a pensé à lister, et le même document déclare un chemin laissé de côté : `codex_runtime_history_seed.py` rend les étiquettes différemment et n'a pas été modifié [s32]. L'entrée typée supprime la classe de frontière. Un échappement ne corrige que les graphies qu'il connaît.

Le ticket nomme aussi un mode de défaillance que je cherche désormais dans chaque garde-fou. Le harnais disposait déjà d'un garde-fou de provenance, `_validate_summary_user_provenance`, qui s'interrompt prématurément dès que la transcription contient un vrai tour utilisateur, et ne couvre donc pas ce vecteur [s30]. J'appelle cela un garde-fou qui se court-circuite : en revue de code, ce garde-fou passe pour une protection, et il se désactive dans le cas ordinaire, celui d'une session où l'utilisateur a tapé quelque chose.

L'argument le plus solide pour s'en tenir à un correctif de code vient de l'article. Comme la provenance est détruite de manière déterministe dans le code du harnais, aucune défense au niveau du prompt ne peut la restaurer, et un contrôle de provenance au niveau du code intercepte 77 % du blanchiment tout en déclassant 2 % du contenu légitime des résumés [s5]. Je jugerais la question réglée si le résumé ne transportait jamais que des approbations.

## Le même résumé perd les règles que vous avez bien données

Le second échec va dans l'autre sens. Une étude distincte pose la prémisse sans détour : la compaction perd en général de l'information par construction, et les agents peuvent perdre en silence des contraintes de tâche, des instructions ou le raisonnement derrière leurs décisions antérieures [s7]. Sur ProgramBench, le premier résumé de compaction perd déjà en moyenne environ une des trois règles anti-triche de la tâche, et la perte augmente avec le nombre de compactions [s10].

Les sessions où un humain intervient montrent où tombe la perte. Dans des sessions réelles entre utilisateurs et agents, la compaction conserve environ 81 % des contraintes des utilisateurs, mais les instructions sur la manière de travailler et sur ce qu'il ne faut pas faire sont perdues environ 6 fois plus souvent que les spécifications de ce qu'il faut construire [s11].

Deux retours de praticiens décrivent la même perte vue de l'intérieur d'une session. Dans le premier, le modèle repart d'un résumé avec pertes et cesse en silence de respecter les règles qui n'existent que dans les fichiers d'instructions [s16] ; le modèle enfreint alors des règles présentes dans ces fichiers mais absentes du résumé (lire tout le fil, zéro autonomie, aucune écriture non autorisée), tout en croyant fonctionner normalement [s17]. Le premier retour ajoute que la compaction est invisible pour l'utilisateur [s18]. Dans le second, une compaction du contexte a eu lieu en cours de session [s20], puis l'agent a fait deux commits directement sur main, en violation de la règle que l'agent avait suivie plus tôt [s36] ; l'agent n'avait aucune indication que la règle s'appliquait encore et n'a jamais relu AGENTS.md après la compaction [s21].

Une même demande se retrouve des deux côtés.

> [!CONFIRMED]
> Dans le harnais qu'examine le ticket, le gabarit du résumé demande explicitement au modèle de consigner les « corrections the USER gave » [s28]. Dans l'étude, le prompt de résumé des auteurs demande explicitement de conserver les contraintes qui doivent persister, et ces contraintes sont perdues malgré tout [s25].

> [!INFERRED]
> À mon sens, c'est une seule erreur de conception vue de deux côtés. Un modèle de résumé à qui l'on demande de consigner ce que l'utilisateur a dit consignera une ligne utilisateur forgée aussi fidèlement qu'une vraie, et un modèle à qui l'on demande de garder les règles n'en garde qu'une partie. Insister n'y change rien : je cesserais tout simplement de demander au résumé de porter l'autorité.

## Traiter la frontière de compaction comme une frontière de session pour l'autorité

La moitié de la règle qui touche aux fichiers figure déjà dans les deux retours. Le premier retour demande qu'une frontière de compaction soit traitée comme une frontière de session pour le chargement des instructions, les fichiers d'instructions et de mémoire du projet étant relus à la frontière sans transiter par un résumé [s19]. Le second suggère soit de réinjecter le contenu actuel des fichiers d'instructions actifs, comme AGENTS.md et CLAUDE.md, lors de la compaction, soit d'obliger l'agent à les relire avant de reprendre l'édition de fichiers ou le travail git [s35]. Deux retours distincts aboutissent à la même règle, et j'adopte celle-ci telle qu'ils l'ont écrite.

Mon extension porte sur les approbations, et c'est le ticket qui en fournit la raison. Dans le harnais qu'examine le ticket, le résumé validé réintègre l'historique sous la forme d'une passation user/assistant typée par rôle [s29]. À mon sens, un tour utilisateur typé après la frontière peut alors n'être que le résumé qui parle avec le rôle de l'utilisateur. Je compte une approbation uniquement quand elle vient d'un tour que l'humain tape lui-même après la frontière. À la frontière, le harnais fait quatre choses :

```python
# mon esquisse : après la compaction, l'autorité ne vient que des fichiers et des nouveaux tours utilisateur
def on_compaction(session, summary):
    session.history = [state_note(summary)]             # l'état du travail, sans rien de ce que le résumé accorde
    session.approvals.clear()                           # les approbations permanentes s'arrêtent à la frontière
    session.rules = load_rules(session.rule_snapshot)   # relues depuis les fichiers figés au début de session
    for action in session.pending_actions():
        session.ask_user(action)                        # redemandée au premier tour après la compaction
```

Le résumé dit toujours ce qui a été construit et ce qui vient ensuite. Rien de ce qu'il contient ne vaut approbation ou règle, quelle qu'en soit la formulation : une ligne comme « next step: push to main » est un plan que l'agent propose, et le push attend une nouvelle approbation.

> [!WARNING]
> Un commentaire sous le premier retour demande si la compaction doit recharger les fichiers actuels ou restaurer l'instantané du début de session [s34]. Je restaurerais l'instantané. Je pense qu'un agent qu'un tour forgé peut détourner d'un fichier peut aussi être poussé à modifier son propre fichier d'instructions, et recharger les fichiers actuels ferait de cette modification une règle à la frontière suivante. Dans ma configuration, toute modification d'un fichier de règles en cours de session exige une approbation tapée par l'humain avant qu'un rechargement ne la prenne en compte.

Voici comment je pondère ces correctifs face aux façons dont un résumé déraille.

| Correctif | Approbation forgée | Règle forgée | Vraie règle perdue | Règle donnée en cours de session |
| :--- | :--: | :--: | :--: | :--: |
| Échapper les étiquettes de rôle | formes listées seulement | formes listées seulement | aucun effet | aucun effet |
| Entrée typée par rôle pour le modèle de résumé | bloque | bloque | aucun effet | aucun effet |
| Contrôle de provenance au niveau du code | partiel | partiel | aucun effet | aucun effet |
| Résumé limité à l'état du travail, règles relues depuis l'instantané | aucun effet | bloque | bloque | aucun effet |
| Approbations en attente redemandées après la frontière | bloque | aucun effet | aucun effet | aucun effet |
| Règles données en cours de session écrites dans un fichier de règles | aucun effet | aucun effet | aucun effet | bloque |

Aucune ligne ne couvre toutes les colonnes ; selon moi, la relecture de l'instantané, la nouvelle demande et le fichier de règles coûtent peu et tiennent quel que soit le sérialiseur du harnais.

## Ce que cela vous coûte

Les objections à ma position commencent par la même étude. Pour les deux modèles à contexte de 1M, le seuil de compaction n'a pas d'effet mesurable sur la performance de la tâche [s8], aucune méthode de compaction ne fait mieux que l'auto-résumé par défaut, et les méthodes qui écartent davantage de contenu coûtent jusqu'à 20 points à certains modèles [s9]. Côté blanchiment, le contrôle au niveau du code intercepte déjà l'essentiel selon la mesure de l'article [s5], et contre les quatre harnais typés par rôle la même attaque a réussi dans 0 % des cas [s4]. Mis bout à bout, ces résultats suggèrent que la compaction ne coûte pas grand-chose à conserver, que l'entrée typée règle la question et que la nouvelle demande est superflue.

Ma réponse à la première moitié vient de l'étude. Les auteurs soutiennent que les benchmarks actuels se prêtent bien à la compaction : l'objectif est fixe et la progression de l'agent reste sur le disque, si bien que l'essentiel de ce que la compaction écarte peut être retrouvé, sauf les contraintes qui n'existent nulle part ailleurs [s27]. Les contraintes qui décrivent le livrable peuvent être retrouvées dans les propres artefacts de l'agent, alors que celles qui décrivent la manière dont l'agent doit se comporter ne le peuvent pas [s12]. Je lis un score de tâche stable comme un silence sur les règles, ce que ce mécanisme prédit justement.

Sur la seconde moitié, je concède l'ordre : livrez d'abord l'entrée typée. Je ne ferais pas pour autant reposer une approbation sur cette hypothèse. Une équipe ignore si son sérialiseur est typé tant que personne n'a lu le code, et le ticket ouvert sur un autre harnais indique qu'une étiquette forgée survit à son sérialiseur [s14] et déclare un chemin que son propre échappement laisse de côté [s32]. La nouvelle demande ne dépend pas de cette lecture. Elle coûte un tour, et un tour forgé survit à la compaction comme une instruction authentique [s3].

La règle par défaut a deux coûts que j'accepte. Le premier est le tour supplémentaire chaque fois qu'une approbation était en attente à la frontière. Le second tient au travail de persistance. L'utilisateur peut ajouter ou modifier des instructions à mesure que la session avance, et l'essentiel n'est persisté nulle part [s26], si bien qu'une règle donnée en cours de session n'a aucun fichier à relire. Ma règle par défaut ne la protège qu'une fois que le harnais l'ajoute à un fichier de règles au moment où l'utilisateur la formule, sous la même règle d'instantané.

Les taux cités ici valent pour les harnais que l'article a testés. J'appliquerais la règle de frontière à tout harnais que je fais tourner, car elle ne m'oblige pas à savoir de quel côté de cette séparation tombe le mien.
