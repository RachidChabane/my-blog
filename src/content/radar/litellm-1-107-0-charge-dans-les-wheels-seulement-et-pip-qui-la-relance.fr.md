---
translationKey: litellm-1-107-0-wheel-only-payload-and-pip-retrigger
lang: fr
slug: litellm-1-107-0-charge-dans-les-wheels-seulement-et-pip-qui-la-relance
title: Les wheels PyPI de LiteLLM 1.107.0 portaient un voleur d'identifiants absent
  du tag source GitHub, et lancer pip dans un environnement infecté le relance
publishDate: 22-10-2026
kind: security
tags:
- LiteLLM
- PyPI
- supply chain
- security
summary: 'Selon LiteLLM, sa chaîne de publication a été compromise le 21 octobre 2026
  et a poussé la v1.107.0 sur PyPI et Docker Hub. LiteLLM dit son tag source GitHub
  sain, alors que JFrog et SafeDep ont trouvé la charge dans les sept wheels, et SafeDep
  indique qu''elle vide les tables du proxy qui contiennent les clés des fournisseurs
  LLM. LiteLLM et JFrog préviennent que lancer pip dans l''environnement touché la
  relance. Ma recommandation : nettoyer depuis le shell, épingler la 1.106.2 et renouveler
  chaque clé fournisseur stockée dans la base du proxy.'
sources:
- label: 'LiteLLM, Contained: Oct 21, 2026 LiteLLM release v1.107.0 Compromised'
  url: https://docs.litellm.ai/blog/security-incident-oct-21-2026
  date: 21-10-2026
- label: 'JFrog Security Research, LiteLLM Hijacked Again: Malicious 1.107.0 Wheels
    Steal Credentials and Load Remote Code'
  url: https://research.jfrog.com/post/litellm-hijacked-again/
  date: 21-10-2026
- label: SafeDep, Compromised LiteLLM 1.107.0 on PyPI Installs a Credential Stealer
    and Backdoor
  url: https://safedep.io/litellm-pypi-compromise-credential-stealer-backdoor/
  date: 21-10-2026
contentHash: sha256:5bf3af561ed8ab94
publishState: published
---

## Ce qui change

Selon LiteLLM, sa chaîne de publication a été compromise le 21 octobre 2026 et a poussé la v1.107.0 sur PyPI et Docker Hub [s1]. D'après son rapport, `litellm==1.107.0` est resté en ligne sur PyPI de 11:39:51 à 13:23 UTC, et les tags `v1.107.0`, `latest`, `main-latest` et `main-stable` ont pointé vers une image compromise de 11:46:56 à 14:20 UTC [s1]. LiteLLM affirme que toutes les versions antérieures sont saines et demande d'épingler la 1.106.2 [s1].

## La revue a lu le mauvais artefact

LiteLLM indique que le tag source officiel v1.107.0 sur GitHub ne contient pas les fichiers malveillants [s1], alors que JFrog a trouvé la charge dans les sept wheels PyPI ; l'archive source n'a ni `cook.pth`, ni `cook.py`, ni `sitecustomize.py`, mais contient un réglage `data = "cook"` absent du tag Git [s2]. À mon avis, une équipe qui a relu le diff du tag a tout examiné, sauf les fichiers qui s'exécutent au démarrage.

## La vérification qui relance la charge

JFrog écrit que `cook.py` s'exécute au démarrage normal de Python dans l'environnement touché, que l'application importe litellm ou non [s2].

> [!CONFIRMED]
> Le rapport de LiteLLM propose de vérifier avec `pip show litellm`, tout en précisant que chaque démarrage de Python dans l'environnement touché relance `cook.pth` et `sitecustomize.py`, pip compris [s1].

> [!INFERRED]
> Ma lecture : la première vérification du rapport démarre elle-même Python ; dans un environnement pas encore nettoyé, je chercherais donc depuis le shell avant tout appel à pip.

Une recherche shell sur les trois noms que cite le rapport ne lance aucun interpréteur, même si n'en trouver aucun ne prouve pas que l'environnement est sain, prévient le rapport [s1] :

```bash
find / \( -name 'cook.pth' -o -name 'sitecustomize.py' -o -name 'litellm-1.107.0.dist-info' \) 2>/dev/null
```

## L'objection la plus solide

Épingler la 1.106.2 semble suffire, et c'est vrai pour la prochaine installation. Je ne suis pas d'accord pour un environnement qui a déjà exécuté la 1.107.0 : le voleur y a tourné, et LiteLLM comme JFrog disent qu'un marqueur d'exfiltration absent ne prouve rien [s1][s2]. SafeDep ajoute que les machines où le daemon a tourné avant la suppression ont pu recevoir et exécuter du code de second niveau [s3].

## Impact pour une équipe

Traitez comme exposé tout environnement qui a installé `litellm==1.107.0` ou récupéré ces tags Docker pendant ces fenêtres. Dans l'ordre de LiteLLM : depuis le shell, supprimez `cook.pth`, `cook.py`, `sitecustomize.py` et les fichiers `__pycache__` correspondants dans chaque site-packages touché, tuez le daemon python détaché qui détient `/tmp/remote_code_loader.lock`, puis réinstallez en épinglant `litellm==1.106.2` [s1]. Pour une passerelle, les clés sont l'enjeu : selon SafeDep, le voleur vide `LiteLLM_CredentialsTable` et `LiteLLM_ProxyModelTable`, qui contiennent les clés d'API des fournisseurs LLM d'un proxy LiteLLM [s3]. Ma recommandation : renouvelez dès aujourd'hui chaque clé fournisseur stockée dans la base du proxy [s1], et ajoutez le RECORD de la wheel installée à la revue des dépendances [s2].
