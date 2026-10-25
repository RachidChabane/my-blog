---
translationKey: ai-rediscovered-vulnerabilities-leak-the-disclosure-window
lang: fr
slug: un-sla-de-correctif-ne-mesure-pas-l-exposition
title: Un SLA de correctif qui démarre à l'avis de sécurité ne mesure pas l'exposition
publishDate: 25-10-2026
tags:
- agents
- qualite
category: essays
difficulty: 4
sources:
- label: OpenAI, Coordinated disclosure of critical vulnerabilities (independent rediscovery
    by Wiz)
  url: https://openai.com/index/coordinated-disclosure-of-critical-vulnerabilities/
  date: 21-10-2026
- label: Wiz Research, PHP2Shell technical briefing (scope)
  url: https://www.wiz.io/blog/php2shell-php-rce
  date: 21-10-2026
- label: Cloudflare, WAF protections for the PHP vulnerabilities (pre-disclosure rules)
  url: https://blog.cloudflare.com/php-vulnerabilities-waf-protection/
  date: 21-10-2026
- label: PHP project, Security advisory of 21 Oct 2026 (urgency)
  url: https://www.php.net/archive/2026.php
  date: 21-10-2026
- label: Hacker News, Tell HN post on incoming PHP RCE CVEs (early public notice)
  url: https://news.ycombinator.com/item?id=50167754
  date: 20-10-2026
- label: Anthropic, Using Claude to reduce the attack surface of code (scaling argument)
  url: https://www.anthropic.com/research/attack-surface-reduction
  date: 25-10-2026
- label: Amazon Threat Intelligence, PHP2Shell exploitation prior to public disclosure
    in MadPot (pre-disclosure attempt)
  url: https://aws.amazon.com/blogs/security/amazon-threat-intelligence-identifies-php2shell-exploitation-prior-to-public-disclosure-in-madpot/
  date: 21-10-2026
- label: Hacker News, Tell HN apology for the PHP RCE embargo (no-embargo notice)
  url: https://news.ycombinator.com/item?id=50193416
  date: 22-10-2026
- label: Phoronix, Linux kernel vulnerability reports posted to the public mailing
    list (duplicate report)
  url: https://www.phoronix.com/news/LKML-New-Trend-Vulnerabilities
  date: 22-10-2026
contentHash: sha256:47f351fb01a512c1
publishState: published
---


Je pense qu'un SLA de correctif compté depuis l'avis de sécurité mesure la vitesse de réaction, or pour PHP2Shell l'exposition a commencé avant la divulgation publique. Amazon Threat Intelligence a repéré dans sa télémétrie MadPot une tentative d'exploitation datée du 17 oct. 2026, quatre jours avant la divulgation publique [s28], et Cloudflare indique que la vulnérabilité a fuité avant la date de publication officielle [s14]. L'IA raccourcit l'étape qui suit, dès qu'un détail s'échappe : le billet de renseignement sur les menaces affirme que l'analyse assistée par IA rend moins coûteux le passage d'un diff de correctif ou d'un avis de sécurité à un exploit fonctionnel [s32].

Je tiens donc deux horloges. Le SLA en heures gouverne le correctif, et je ne l'assouplirais pas. L'exposition suit une seconde horloge, qui démarre à l'exploitation la plus précoce ; pour un opérateur qui ne figure pas parmi les destinataires de l'alerte anticipée, ses seuls leviers sont ceux déjà en place avant tout avis : les fonctionnalités d'exécution optionnelles inutilisées, désactivées dès maintenant, et des journaux web conservés assez longtemps pour remonter au-delà d'une date de divulgation.

## La fenêtre n'a pas tenu

Je lis ces documents datés comme une seule défaillance vue depuis plusieurs postes : l'embargo n'a pas tenu, et aucun document ne dit comment. Amazon écrit que le ciblage d'un honeypot depuis une adresse IP anonymisée suggère un acteur malveillant, mais qu'on ne sait toujours pas comment cet acteur a obtenu les informations d'exploitation avant la divulgation [s28] [s29].

Le jour de la levée n'a pas été plus propre. Selon Amazon Threat Intelligence, la levée de l'embargo PHP était fixée au 2026-10-21 1400 UTC, et le jour même de la publication, l'équipe a identifié plusieurs exploits de preuve de concept, le plus ancien vers 2026-10-21 0200 UTC [s30].

Deux messages publics, sur un forum, donnent le point de vue du dehors : l'un affirmait qu'une source fiable avait signalé une annonce prévue le 22 octobre 2026 à 18:00 CEST, concernant deux RCE PHP avec un score CVSS de 10.0 [s22], et citait CVE-2026-109618 et CVE-2026-109619 comme les deux CVE réservées pour cette annonce [s23]. Un message ultérieur rapporte que le contact de son auteur avait affirmé l'absence d'embargo [s34], et reconnaît des répercussions sur le calendrier de la divulgation coordonnée [s35].

La portée est large : Wiz Research décrit le cœur de PHP comme un langage de script qui fait tourner 70 % des sites web du monde [s6], et la note technique a regroupé les problèmes sous deux CVE, avec une sévérité atteignant CVSS 9.2 [s11].

> [!NOTE]
> Aucun de ces documents ne nomme le canal de la tentative ou de la fuite, et aucun ne relie le message du forum à l'une ou à l'autre. Je traite chacun d'eux comme une trace distincte d'une même défaillance, sans en faire un seul événement ni des confirmations indépendantes d'une même voie.

## Où l'IA entre dans la chronologie

Le récit tentant veut que l'IA ait trouvé les bugs et que les attaquants aient suivi ; selon moi, aucun document ne le soutient. Les failles ont été trouvées deux fois : le billet sur la divulgation coordonnée indique que Calif a identifié une faille critique [s27], Wiz ayant de son côté découvert et signalé les deux vulnérabilités de façon indépendante [s1], et Wiz Research remercie l'équipe PHP, Calif et OpenAI pour leur travail de découverte, de coordination et de vérification du correctif [s26]. Ce même billet ajoute qu'à la connaissance de ses auteurs, l'IA de pointe a trouvé ces vulnérabilités avant les attaquants [s2]. Le billet qui rapporte la tentative sur le honeypot résume la règle générale en une phrase : un embargo ne protège les défenseurs que jusqu'à ce que quelqu'un d'autre trouve le même bug [s31].

À mon sens, ce que l'IA change, c'est l'étape qui suit l'échappée d'un détail. La note technique explique que les failles sous-jacentes existaient depuis des décennies, mais que démontrer leur exploitabilité exigeait une chaîne d'étapes exceptionnellement complexe [s7]. Les modèles d'IA de pointe ont nettement abaissé cette barrière [s8], et les auteurs de la note technique ont développé et adapté des exploits fonctionnels sur plusieurs applications en quelques heures [s9]. Leur propre conclusion : la complexité pourrait ne plus constituer une barrière significative [s10].

Le billet sur la divulgation coordonnée fournit l'autre moitié : même des détails limités peuvent révéler une vulnérabilité [s4], et le billet laisse ouverte la question de l'arbitrage entre couverture et risque de fuite au moment de choisir qui prévenir [s3]. Son propre processus de correction soumet le correctif à des tests adverses avec des modèles de pointe [s5]. Je pense que ce couplage est le vrai changement : si des détails limités suffisent à révéler un bug et que les modèles raccourcissent le travail entre le détail et l'exploit, alors une fuite, quelle que soit sa taille, se trouve plus près d'un exploit fonctionnel, et je m'y prépare.

Un cas distinct, côté Linux, montre des rapports qui sortent de leur canal ailleurs aussi : plusieurs nouveaux rapports de vulnérabilités du noyau ont été publiés, apparemment par accident, sur la liste de diffusion publique du noyau au lieu de la liste de sécurité privée [s38], et pour une faille skb_zerocopy, les développeurs du noyau avaient reçu la semaine précédente un rapport de sécurité d'une autre source [s36]. L'article se termine sur une phrase que je retiens volontiers : les rapports de bugs et de sécurité continuent d'arriver dans un monde alimenté par l'IA [s37].

## Deux horloges dans un même billet

Le billet qui rapporte la tentative sur le honeypot donne deux consignes, et je pense qu'elles ne mesurent pas la même chose. L'une porte sur la vitesse : davantage d'acteurs peuvent agir en quelques heures, voire en quelques minutes, une fois les détails techniques divulgués ; pour les vulnérabilités critiques des systèmes exposés à Internet, le billet demande donc des délais de correction et d'atténuation mesurés en heures, car un SLA de 7 ou 30 jours suppose un délai qui n'existe plus [s32]. L'autre porte sur l'endroit où commencer à chercher.

> [!CONFIRMED]
> Les investigations doivent partir de l'exploitation connue la plus ancienne, au lieu de la date de divulgation [s33]. Pour PHP2Shell, le billet demande d'enquêter au moins à partir du 17 octobre [s44].

> [!INFERRED]
> À mon sens, cette consigne est l'horloge de l'exposition, et le SLA en heures celle de la réaction. Si la rotation des journaux web a effacé la période à examiner, la consigne devient impossible à suivre.

Je veux être juste envers ce billet, car il dit déjà une bonne partie de ce que je défends : il recommande aussi d'investir dans des détections qui ne reposent pas sur une signature propre à une CVE, puisque la première exploitation surviendra souvent avant que ces signatures existent [s43]. À mon sens, le billet ne dit jamais quelle horloge une équipe doit suivre. Je pense que les équipes adopteront le chiffre en heures, parce qu'il tient dans un tableau de bord. Selon moi, c'est ce choix qui pose problème : une équipe peut tenir un SLA en heures sur chaque CVE critique et avoir pourtant été exposée pendant des jours qu'elle n'a jamais mesurés.

## Préparer ce qui ne dépend d'aucun avis

À mon sens, le mode de défaillance à nommer est le commentaire de revue qui affirme que l'application n'appelle jamais session_start(), et que ce bug de session ne la concerne donc pas. La note technique y répond : l'attaque fonctionne même quand l'application n'appelle jamais `session_start()`, ce qui rend le problème indépendant de l'application [s12]. À mon sens, une fonctionnalité que l'application n'utilise pas reste donc dans sa surface d'attaque, et je la désactiverais avant que quiconque en ait une raison. Des travaux distincts sur la réduction de la surface d'attaque soutiennent que corriger les vulnérabilités une à une passe mal à l'échelle [s24], et que réduire l'atteignabilité du code peut réduire la sévérité de vulnérabilités inconnues, y compris de vulnérabilités qui pourraient être activement exploitées [s25].

L'avis PHP montre ce que coûte le même changement sous pression : tous les utilisateurs de PHP sont vivement encouragés à mettre à jour immédiatement, et le risque est jugé le plus élevé pour mod_php, avec un exploit démontré dans lequel une requête non authentifiée peut déclencher l'attaque avant l'exécution de tout code applicatif [s17] [s18]. Pour qui ne peut pas mettre à jour tout de suite, les mesures listées réduisent l'exposition à des chemins d'attaque précis mais ne rendent pas une installation sûre [s19]. Pour CVE-2026-109619, la mesure consiste à régler `session.upload_progress.enabled=0` et à redémarrer chaque worker [s20]. Je compte ce redémarrage comme le vrai prix : sur un parc qui ne l'a jamais fait, c'est un déploiement calé sur l'horloge de l'attaquant.

```ini
; php.ini, pour un runtime exposé à Internet dont l'application n'utilise pas la progression d'envoi
session.upload_progress.enabled = 0
```

> [!WARNING]
> Vérifiez la valeur là où les requêtes s'exécutent. La CLI peut charger un autre php.ini que les workers FPM, et un fichier de pool peut surcharger les deux ; je lis donc le réglage depuis une requête servie par le pool. `php --ini` ne dit que ce que charge la CLI.

Je retiens surtout le suivi. Un avis informatif daté du 23 oct. 2026 suggère de régler `session.upload_progress.enabled=0` jusqu'à la prochaine version corrective régulière, pour se protéger complètement d'un vecteur de RCE improbable [s39]. Il précise que ce réglage figurait déjà comme mesure d'atténuation pour CVE-2026-109619 le 21 oct. 2026, et que qui l'a appliqué à ce moment-là n'a rien d'autre à faire que le laisser en place [s40]. Je lis là un interrupteur permanent rentable dans les deux cas : l'opérateur qui avait déjà désactivé la fonctionnalité n'avait rien de nouveau à faire, celui qui s'était contenté du correctif devait envisager un second changement, et dans les deux cas l'interrupteur couvre seulement le chemin qu'il vise.

## Le meilleur argument contre

Selon moi, l'objection la plus forte est la suivante : avant un avis, un opérateur ne peut pas savoir quelle fonctionnalité désactiver, si bien que la réduction permanente n'est qu'une supposition, ou un durcissement ordinaire sous un nouveau nom. La moitié de l'objection tient. Je retiens qu'il s'agit bien d'une réduction ordinaire de la surface d'attaque. À mon sens, l'argument de la supposition, en revanche, ne tient pas : l'inventaire demande la liste de ce qu'utilise chaque application, et l'avis n'ajoute rien à cette liste. L'avis de suivi pose lui-même ses limites : le problème ne peut survenir qu'avec une combinaison inhabituelle de configuration et de code applicatif [s41], et les applications qui ne changent jamais de gestionnaire de sérialisation à l'exécution peuvent laisser la fonctionnalité activée [s42]. À mon sens, cette exemption transforme une ligne de configuration en question sur le code applicatif, et je préfère répondre à la ligne de configuration. Un interrupteur réduit toujours seulement le chemin qu'il vise, et l'avis initial le dit lui-même : de telles mesures ne rendent pas une installation sûre [s19].

Deuxième objection, la fenêtre a fonctionné pour ceux qui étaient à l'intérieur : Cloudflare avait des protections WAF déployées environ 9 heures avant la divulgation publique [s13], les distributions Linux et les fournisseurs LTS ont reçu les correctifs à l'avance [s21], et le billet qui rapporte la tentative sur le honeypot qualifie toujours la divulgation coordonnée de bon modèle [s31]. J'en conviens. Mon propos concerne l'opérateur qui ne figure pas parmi les destinataires de l'alerte anticipée : il voit l'avis sans voir la voie d'accès ; même la partie qui a consigné la tentative écrit qu'on ne sait toujours pas comment l'acteur a obtenu ses informations [s29].

Troisième objection, un filtre en bordure couvrirait la fenêtre sans toucher au runtime ; le propre article du fournisseur en bordure de réseau en marque les limites : des attaquants ont été observés en train de modifier la charge utile pour tenter de contourner ses protections [s15], et les données de requête ne suffisent pas toujours, à elles seules, pour distinguer un exploit d'un trafic légitime [s16]. Je traite un filtre de requêtes comme un complément du changement au runtime, et la même limite vaut pour mes journaux : ils donnent à une investigation son point de départ, ce qui reste en deçà d'un verdict.

## Ce que je préparerais avant le prochain avis

Pour chaque runtime exposé à Internet, voici la liste que je suivrais.

| Contrôle | Commence avant un avis | Ce que cela réduit | Ce que je teste régulièrement |
| :--- | :--- | :--- | :--- |
| Fonctionnalités optionnelles inutilisées désactivées | oui | les chemins qu'ouvrent ces fonctionnalités | le changement de configuration et le redémarrage des workers |
| Journaux web conservés au-delà d'une date de divulgation | oui | l'angle mort de l'historique | une requête qui date la plus ancienne requête correspondante |
| Filtre de requêtes en bordure | seulement pour les acteurs dans la fenêtre | les motifs de requête qu'il reconnaît | la lecture du volume de correspondances face aux charges modifiées |
| Correctif en quelques heures | non | le correctif complet | le déploiement lui-même |

Tout repose sur l'inventaire, car je ne peux pas désactiver ce que je n'ai pas recensé. Un redémarrage déjà rodé rend le changement routinier le jour où il compte. Je dimensionne la conservation des journaux selon la profondeur d'historique dont j'aurais besoin, et après ce cas, elle dépasse la date de l'avis. Chaque interrupteur réduit seulement le chemin qu'il vise, et c'est pourquoi le correctif garde sa propre horloge. Le SLA en heures reste pour le correctif. Je préparerais un rapport qui montre les deux horloges côte à côte, pour qu'un correctif rapide ne masque jamais une longue exposition.
