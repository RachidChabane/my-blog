---
translationKey: claude-code-cursor-extension-comment-grep-versus-fingerprint-hunt
lang: fr
slug: extension-claude-code-piegee-cursor-confirmer-la-cle-ssh-par-empreinte
title: L'extension Claude Code piégée du marketplace de Cursor étiquette sa clé SSH
  svc-telemetry, et Microsoft comme Phorion conseillent de la confirmer par son empreinte
publishDate: 31-10-2026
kind: security
tags:
- Claude
- Claude Code
- Cursor
- security
summary: 'Selon Cursor, une version malveillante d''Anthropic.claude-code, en 2.1.312
  et 2.1.313 pour Windows et MacOS, était proposée sur son marketplace entre 2:27am
  PT et 1:35pm PT environ le 29 octobre 2026, et tente d''installer une porte dérobée
  SSH persistante. Le contrôle d''impact de Cursor sur macOS cherche le commentaire
  svc-telemetry par grep, et un échec affiche No key found; machine not impacted.
  Selon Phorion, le script vérifie lui-même la présence de svc-telemetry avant d''ajouter
  sa clé, et Microsoft demande de confirmer la clé par son empreinte. Ma recommandation
  : garder le grep comme tri, vérifier l''empreinte, alerter sur les processus de
  l''IDE qui écrivent dans ~/.ssh/authorized_keys et passer en 2.1.314 ou plus, comme
  le conseille ThreatDefence.'
sources:
- label: Cursor, security notice on malicious Anthropic.claude-code 2.1.312 and 2.1.313
    in the Cursor VS Code Extension Marketplace
  url: https://cursor.com/blog/claude-code-extension-security-notice
  date: 29-10-2026
- label: Microsoft Security, Inside a malicious Claude Code-branded extension and
    its persistent SSH backdoor
  url: https://www.microsoft.com/en-us/security/blog/2026/10/30/inside-malicious-claude-code-branded-cursor-extension-persistent-ssh-backdoor/
  date: 30-10-2026
- label: 'Phorion, Official Claude Code Extension Compromise: Security Advisory'
  url: https://phorion.io/blog/offical-claude-code-vsx-compromise/
  date: 30-10-2026
- label: StepSecurity, Trojanized Claude Code Extension Delivered Persistent SSH Backdoor
    to Developer Machines
  url: https://www.stepsecurity.io/blog/claude-code-extension-trojanized
  date: 30-10-2026
- label: 'ThreatDefence, Malicious Claude Code Extension in the Cursor Marketplace:
    Check Developer Machines'
  url: https://threatdefence.com/article/claude-code-openvsx-extension-backdoor-advisory
  date: 30-10-2026
contentHash: sha256:7718bc9f43d5773c
publishState: published
---

## Ce qui change

Selon Cursor, entre 2:27am PT et 1:35pm PT environ le 29 octobre 2026, une version malveillante d'Anthropic.claude-code, en 2.1.312 et 2.1.313 pour Windows et MacOS, était proposée sur le Cursor VS Code Extension Marketplace, et tente d'installer une porte dérobée SSH persistante [s1]. Microsoft précise que les paquets malveillants n'ont jamais été publiés ni distribués sur le Microsoft Visual Studio Marketplace ni sur npm [s2].

## Le contrôle cherche l'étiquette de l'attaquant

À mon avis, le contrôle d'impact de Cursor ne doit pas décider si une machine est saine. Sur macOS, celui de Cursor se résume à `grep -qs svc-telemetry ~/.ssh/authorized_keys`, et un échec affiche `No key found; machine not impacted` [s1]. Selon Phorion, le script vérifie si svc-telemetry figure déjà dans le fichier avant d'ajouter sa clé, et mieux vaut vérifier l'empreinte de la clé publique [s3]. Microsoft précise qu'un marqueur absent ne remplace pas, à lui seul, l'examen des traces d'installation, de processus, de réseau et de persistance [s2].

> [!CONFIRMED]
> Selon Phorion, la télémétrie des modifications de fichiers est indispensable : surveiller les processus auxiliaires de l'IDE (Code Helper, Cursor Helper) qui créent ou modifient `~/.ssh/authorized_keys` [s3].

> [!INFERRED]
> Ma lecture : le grep de Cursor et la garde du malware reposent tous deux sur le commentaire, une étiquette choisie par l'attaquant. Un échec ne prouve donc pas grand-chose. J'alerterais plutôt sur un processus d'éditeur qui écrit dans les clés SSH.

## Le grep pour trier, l'empreinte pour trancher

L'objection la plus solide : le grep est un premier tri rapide, et Cursor publie l'empreinte, `SHA256:0Z6R+DF64Do2nwQic8a7kkfDLNNk4IiK+2U2Rci4htk`, dans le même avis [s1]. Je suis d'accord. Je garderais donc le grep comme simple tri, puis vérifierais l'empreinte et les traces de persistance sur chaque machine où l'extension a tourné.

Microsoft recommande aussi de restreindre les extensions aux éditeurs approuvés et de configurer un délai d'attente avant l'installation des versions nouvellement publiées [s2]. Selon StepSecurity, la version piégée est apparue sous l'identifiant légitime [s4]. À mon sens, une liste d'éditeurs approuvés laisse passer cette version, alors que le délai vise au moins une publication récente comme 2.1.313.

## Impact pour une équipe

Si vos développeurs utilisent l'extension Claude Code dans Cursor, ma recommandation : vérifiez l'empreinte, alertez sur les processus auxiliaires de l'IDE qui écrivent dans `~/.ssh/authorized_keys`, configurez le délai, puis mettez à jour. Cursor indique que le serveur de l'attaquant ne fonctionne plus [s1]. Je n'y verrais pas pour autant une remédiation : Microsoft demande de confirmer la clé par son empreinte avant de supprimer l'entrée non autorisée exacte [s2]. Selon ThreatDefence, un dossier 2.1.312 installé avant le 29 octobre peut être la version saine, et il faut passer l'extension en 2.1.314 ou plus [s5].
