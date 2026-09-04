---
translationKey: curl-8-22-0-openssl-provider-use-after-free
lang: fr
slug: curl-8-22-0-use-after-free-providers-openssl-severite-basse
title: curl 8.22.0 corrige un use-after-free des providers OpenSSL classé en sévérité
  basse
publishDate: 04-09-2026
kind: security
tags:
- curl
- OpenSSL
- CVE
- security
- Aisle
summary: 'curl 8.22.0, publié le 2 septembre 2026, corrige CVE-2026-80229, un use-after-free
  du tas atteignable dans les configurations à providers OpenSSL 3 et classé en sévérité
  basse [s1]. La plage affectée va de curl 8.14.0 à 8.21.0 incluse [s1] : à mon sens,
  le parc exposé est celui qui a suivi les mises à jour, pas celui qui a pris du retard.'
sources:
- label: curl project security advisory, CVE-2026-80229
  url: https://curl.se/docs/CVE-2026-80229.html
  date: 02-09-2026
- label: Aisle Research writeup on its curl vulnerability reports
  url: https://aisle.com/blog/aisle-discovered-six-curl-cves-after-openai-and-anthropic-found-zero
  date: 02-09-2026
contentHash: sha256:4a38f1cfbade4250
publishState: published
---

## Ce qui change

curl 8.22.0 est sorti le 2 septembre 2026, en même temps que la publication de l'avis
CVE-2026-80229 [s1]. Dans les configurations à providers OpenSSL 3, libcurl rattachait un
contexte de bibliothèque alloué au easy handle sans prendre de référence de propriété :
détruire ce handle trop tôt libérait le contexte alors que la connexion active en gardait
un pointeur, et la moindre entrée-sortie ultérieure tombait sur un use-after-free du tas
[s1]. L'avis le classe en CWE-416: Use After Free, en sévérité basse, avec pour versions
affectées curl 8.14.0 jusqu'à 8.21.0 incluse [s1]. Stanislav Fort, d'Aisle Research, l'a
signalé le 24 août 2026 [s1][s2].

## La fenêtre de versions fonctionne à l'envers

Lisez la plage avant la sévérité. Les versions non affectées sont curl < 8.14.0 et >=
8.22.0 [s1] : le parc exposé est celui qui a continué d'avancer sur la ligne 8.14 à 8.21,
quand un service resté épinglé sous 8.14.0 n'a jamais connu le bug. Or le réflexe de tri
habituel pousse à chercher d'abord le binaire le plus ancien. Je prendrais l'inventaire dans
l'autre sens cette semaine : repérer ce qui suit curl de près et se lie à OpenSSL 3,
puisque les providers n'existent que dans une libcurl compilée avec OpenSSL 3+ [s1], puis
vérifier si quelque chose y détruit un easy handle pendant qu'une connexion du pool vit
encore.

Une sévérité basse mesure l'étroitesse de la configuration. À l'intérieur, c'est un
use-after-free du tas [s1]. D'expérience, cette réserve signifie que personne n'a recensé
qui s'y trouve.

L'avis demande de prendre immédiatement l'une de ces trois mesures, par ordre de
préférence : passer curl et libcurl en 8.22.0, appliquer le correctif et recompiler, ou
activer CURLOPT_FORBID_REUSE pour les transferts qui utilisent des providers [s1].

```c
/* Recommandation C, cadrée aux transferts qui utilisent des providers */
curl_easy_setopt(easy, CURLOPT_FORBID_REUSE, 1L);
```

> [!IMPORTANT]
> À mon sens, C est une mesure d'urgence pour les jours qui précèdent la recompilation,
> puis on la retire du code. Elle est cadrée aux transferts qui utilisent des
> providers pour une raison : interdire la réutilisation change le comportement de vos
> connexions.

## Impact pour une équipe

La décision de la semaine n'est pas de mettre à niveau ou non, mais de désigner qui porte
la recompilation. libcurl est bien plus souvent une dépendance embarquée qu'un paquet
installé : la version qui compte est celle figée dans vos images et vos bindings, loin de
la machine de build. Aisle Research indique que six de ses 29 rapports au projet curl
ont donné des CVE dans 8.22.0, toutes en sévérité basse [s2] ; un processus de correctifs
déclenché par les alertes de sévérité haute laisse passer le lot entier. Ciblez les
composants liés à OpenSSL 3, faites-y entrer 8.22.0, et gardez CURLOPT_FORBID_REUSE hors de
la configuration permanente.
