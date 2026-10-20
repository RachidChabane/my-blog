---
translationKey: attack-agent-harness-state-holds-the-secrets-it-finds
lang: fr
slug: le-registre-de-votre-harnais-d-agent-est-un-coffre-a-identifiants
title: Le registre de votre harnais d'agent est un coffre à identifiants
publishDate: 20-10-2026
tags:
- agents
category: essays
difficulty: 4
sources:
- label: 'Gambit Security, AI agents hacking online retailers: company description'
  url: https://gambit.security/blog-posts/autonomous-ai-agents-online-retailers-25-a-company
  date: 22-09-2026
- label: 'NorForge, Inside Cairn exposed AI pentesting panels: TL;DR'
  url: https://norforge.com/blog/inside_cairn
  date: 19-10-2026
contentHash: sha256:d0aae2905c40ebac
publishState: published
---


Je pense qu'il faut concevoir le registre d'un harnais d'agent comme un coffre à identifiants, car il en devient un ; l'authentification n'en est que la seconde ligne. Deux sociétés de sécurité ont chacune lu un tel registre de l'extérieur, et ce qu'elles y ont trouvé plaide pour décider, dès l'écriture, ce que le registre a le droit de contenir.

## Ce que deux enquêtes ont trouvé dans le registre

Ce qui frappe dans la campagne décrite par Gambit, c'est le peu que l'humain a tapé. Gambit Security, une société qui assure la continuité d'activité des entreprises face aux perturbations [s2], décrit un opérateur motivé par l'appât du gain qui fait tourner trois harnais d'IA open source contre des centaines de boutiques en ligne, presque entièrement sans supervision [s3]. D'après Gambit, les consignes humaines se résument à de courtes instructions : lancer une attaque, confier à l'agent une étape suivante assez générale, ou dire quoi faire une fois l'accès obtenu [s9]. Strix cherchait les vulnérabilités, Cairn menait l'exploitation de bout en bout et Hermes orchestrait la campagne [s7].

À mon sens, le savoir de l'opérateur loge dans le harnais, et les consignes ne font que le désigner. Gambit décrit Hermes comme un agent d'IA autonome open source doté d'une mémoire persistante, de compétences que l'agent écrit et modifie lui-même, d'une archive consultable des sessions passées, de tâches planifiées et d'une console web [s8]. Cairn, d'après le même rapport, reçoit des domaines cibles et un objectif, par exemple un shell ou un accès administrateur, puis tourne pendant des heures jusqu'à l'atteindre, dépasser son délai ou être arrêté [s10]. Certaines cibles, écrit Gambit, ont été choisies à la main et confiées à l'agent alors que les opérateurs avaient déjà en main un mot de passe administrateur qui fonctionnait [s11]. Voilà beaucoup de contexte accumulé pour une campagne dont la part humaine tient en quelques lignes de discussion.

NorForge, une entreprise qui met son expertise du sandboxing au service des agents d'IA pour que les utilisateurs voient ce que font leurs agents [s21], a abordé les mêmes outils par l'autre bout. Elle a enquêté sur des panneaux de contrôle de tests d'intrusion pilotés par l'IA, exposés publiquement, et sur leur usage dans des cyberopérations malveillantes [s20], puis a identifié plus de 20 panneaux Cairn exposés comme probablement liés à une activité malveillante [s23]. Ce que montrent ces panneaux, c'est le registre lui-même. NorForge énumère ce qu'ils révèlent des cibles : qui elles sont, quelles faiblesses ont été découvertes, des secrets de comptes et des clés d'API, et si elles ont été compromises [s27].

> [!CONFIRMED]
> NorForge rapporte que l'agent Cairn publie chaque fait sur un tableau noir interne au projet, où un opérateur humain peut ajouter ses indications [s28], et que les panneaux contiennent des saisies humaines avec des identifiants récoltés ailleurs [s29].

> [!INFERRED]
> Je lis ce tableau noir comme un coffre à identifiants doté de deux arrivées : ce que l'agent trouve, et ce que l'opérateur y colle. Le mot de passe confié dans la campagne de Gambit relève de la même seconde arrivée. À mon sens, un filtre posé sur la sortie de l'agent ne voit que la première.

Le volume compte autant que le contenu. Pour les tâches qui ont atteint leur objectif, en particulier dans le groupe AIA0001, NorForge relève un délai moyen d'un peu moins de 23 heures entre le lancement du projet et l'objectif atteint, avec en moyenne 140 faits produits par projet [s37]. Chacun de ces faits est une ligne que l'étape suivante relit, et certains sont des clés.

## Deux lecteurs, deux chemins d'accès

À mon sens, les deux enquêtes n'existent que parce qu'un registre de harnais était lisible par quelqu'un à qui son opérateur ne le destinait pas. Une partie des preuves de Gambit provient du serveur de staging de l'attaquant, où l'équipe a trouvé les données exfiltrées elles-mêmes et l'outillage correspondant [s42]. Gambit cite aussi des journaux et des affirmations produites par l'IA, trouvés sur le serveur de l'attaquant [s43] ; le rapport s'appuie sur ces affirmations parce qu'une part substantielle a pu être vérifiée par ses deux premières méthodes [s13]. Un projet Cairn terminé, rapporte Gambit, documentait une chaîne d'attaque allant d'une injection SQL non authentifiée jusqu'à un vidage complet d'AWS Secrets Manager (46 secrets), en passant par des identifiants de base de données lus dans wp-config.php [s44]. Je pense qu'un registre qui documente ce vidage n'est qu'à une sérialisation de contenir les secrets eux-mêmes, et il indique déjà à tout lecteur où se trouvent les clés.

NorForge, elle, est entrée par une autre porte. Les panneaux que NorForge a trouvés semblent totalement dépourvus de protection et exposent ce qui ressemble à l'ensemble des fonctions d'administration du harnais [s32]. Elle a passé le scanner de secrets Trufflehog sur les données de ces instances Cairn [s30]. Elle y a trouvé littéralement des centaines de secrets, des plus anodins aux plus graves, dont 11 % vérifiés comme valides par Trufflehog [s31].

Deux lecteurs, deux chemins. À mon sens, une authentification sur le panneau ne concerne au mieux qu'un de ces chemins. Quel que soit le chemin par lequel Gambit a atteint ce serveur, le registre était là, lisible, et la piste des identifiants avec lui.

## Pourquoi l'authentification n'est que la seconde ligne

L'objection évidente, c'est que le métier a déjà une règle pour ça : on ne met jamais de secret dans un journal. Je pense que cette règle ne se transpose pas, car un registre de harnais est un objet différent d'un journal. Un journal s'écrit pour un humain qui le lit après coup. Le registre, lui, est relu par le modèle comme sa mémoire de travail : l'étape qui a besoin du mot de passe est donc celle qui l'écrit. Effacez la valeur à l'entrée et l'appel d'outil suivant échoue faute de l'avoir ; laissez-la et le registre détient la clé. Le filtre ne peut pas gagner.

D'où un nom pour ce mode de défaillance : le **résidu d'identifiants**, une valeur secrète écrite dans un registre d'agent et qui survit à la tâche qui en avait besoin. Ce résidu n'attend pas le succès. NorForge pose comme hypothèse raisonnable que, pour les harnais observés dans ces campagnes, le taux de réussite moyen tourne autour de 10 %, et que beaucoup des autres tâches atteignent des objectifs partiels ou recueillent des informations réutilisables lors de tentatives ultérieures [s36]. À mon sens, le registre d'une tâche ratée est un inventaire pour la tentative suivante, et quiconque le lit en hérite.

À mon sens, les lecteurs d'une valeur inscrite au registre se répartissent ainsi :

| lecteur | couvert par l'authentification de la console | voit la valeur aujourd'hui | la voit avec des références opaques |
| :--- | :---: | :---: | :---: |
| une session sur la console | oui | oui | non |
| le modèle qui relit le registre | non | oui | non |
| un opérateur qui ajoute des indications | en partie | oui | non |
| l'archive des sessions | non | oui | non |
| une sauvegarde ou un export | non | oui | non |

L'authentification de la console couvre la ligne du haut et une partie de la troisième. Les trois autres lecteurs voient ce que contient le registre, et c'est là, à mon sens, que le contrôle doit se placer.

## Ce que je construirais

Ma conception commence à l'écriture. Le registre stocke une référence opaque, résolue par la couche d'outils au moment de l'appel, et le modèle lit des faits et des références sans jamais voir une valeur. Les valeurs expirent avec la mission, tandis que les faits et les URL restent : ce sont eux qui permettent de vérifier un constat plus tard. Le canal d'indications de l'opérateur passe par la même entrée, si bien qu'un identifiant collé par un humain devient une référence opaque avant d'atteindre le tableau noir. La console reste derrière une authentification, c'est le minimum. Rien d'autre ne change. L'agent raisonne sur les mêmes faits et les publie sur le même tableau noir ; la différence tient à ce qu'une ligne a le droit de porter.

```text
# ce que le tableau noir contient aujourd'hui
fact  admin login works on the shop   user=admin  password=<the value>
# ce que je le laisserais contenir
fact  admin login works on the shop   user=admin  credential=vault:engagement/shop-admin
```

```bash
# résolu par la couche d'outils au moment de l'appel ; le modèle ne le voit jamais
vault kv get -mount=secret -field=password engagement/shop-admin
# le scan que NorForge a lancé sur des panneaux exposés, pointé sur votre propre registre
trufflehog filesystem ./harness-record
```

NorForge a passé Trufflehog sur les données des panneaux Cairn qu'elle a trouvés [s30], et je lancerais le même scan sur mon propre registre à la clôture de chaque mission. Un résultat positif y signale un chemin d'écriture qui a laissé passer une valeur, autrement dit un bogue dans l'entrée, dont on connaît l'emplacement.

> [!IMPORTANT]
> Ma règle : aucune valeur d'identifiant n'entre dans le registre de l'agent, canal d'indications de l'opérateur compris. Le registre contient une référence opaque, la couche d'outils la résout au moment de l'appel, et la valeur expire avec la mission tandis que les faits restent.

## Le meilleur argument contre

C'est NorForge qui plaide le mieux pour l'authentification. Des recherches sur Shodan et Censys, écrit NorForge, révèlent des hôtes qui font tourner ce qui ressemble à des harnais d'IA de divers types ; la plupart exigent une autorisation d'accès, mais bon nombre de ces interfaces sont laissées ouvertes par leurs opérateurs [s26]. Faire tester son site sur une instance Cairn ouverte pose souvent un sérieux problème de sécurité, quel que soit le résultat du test, ajoute-t-elle [s33]. Dans cette lecture, l'authentification suffit et tout ce que je propose plus haut relève de la décoration. J'admets la défaillance immédiate : les panneaux trouvés par NorForge semblent totalement dépourvus de protection, et je ne livrerais pas un harnais sans authentification. Ma réponse : Gambit a lu le même genre de registre sur le propre serveur de l'opérateur, et une authentification décide de qui entre sans rien changer à ce qu'il y a à prendre une fois dedans.

Restent deux objections plus faibles. La deuxième veut que le registre soit la preuve, et que les deux sociétés l'aient exploité avec soin. Gambit qualifie son travail de rapport d'étape [s14] et admet que quelques erreurs ou inexactitudes sont possibles [s15]. Gambit compte 105 projets d'attaque lancés entre le 10 et le 15 septembre [s5]. Son graphique en couvre 48 ; les 57 autres ont été supprimés et n'étaient pas disponibles pour l'analyse [s16]. NorForge a vérifié une intrusion revendiquée en ouvrant l'URL du shell mentionnée dans une tâche terminée, et cette URL servait bien un webshell de téléversement [s35]. NorForge présente aussi ses données comme un instantané à un moment donné [s38]. Je lis les deux vérifications de la même façon : elles portaient sur des faits et des URL. Ma règle conserve ceux-là et fait expirer les valeurs, alors que les projets supprimés ont perdu les deux.

La troisième objection est la plus brutale : l'agent a besoin de l'identifiant. Dans le rapport de Gambit, des cibles ont été choisies à la main et confiées à l'agent alors que les opérateurs disposaient d'un mot de passe administrateur qui fonctionnait [s11]. La référence opaque y répond, puisque l'agent obtient l'usage de l'identifiant et que la valeur reste dans la couche d'outils. Les deux réponses tiennent.

## Qui paie

L'attaquant n'a aucune raison d'adopter quoi que ce soit de tout cela, et le versant des coûts montre pourquoi. Gambit chiffre le coût marginal entre quelques dollars américains et quelques dizaines de dollars américains par entreprise ciblée [s17]. NorForge, qui compte par tâche, estime la moyenne à environ 5 dollars si l'on inclut les projets infructueux ou arrêtés tôt [s39], et juge l'incertitude considérable [s40]. À ces prix, un registre qui fuit ne coûte presque rien à l'opérateur ; je n'attends donc aucune discipline de ce côté.

Ceux qui doivent l'adopter, ce sont les red teams légitimes. NorForge a trouvé un nombre considérable d'opérations de red team apparemment légitimes exposées de la même façon, ce qui a potentiellement mis des clients en danger [s24]. Elle qualifie de scénario cauchemardesque le fait de récolter les secrets de son client pour les voir publiés sur Internet [s34]. C'est leur problème. Une équipe de red team dont le registre contient des références opaques perd des constats en cas de fuite ; celle dont le registre contient des valeurs perd les clés du client.
