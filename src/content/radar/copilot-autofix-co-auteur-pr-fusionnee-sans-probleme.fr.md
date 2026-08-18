---
translationKey: copilot-autofix-co-authored-commit-review-did-not-flag
lang: fr
slug: copilot-autofix-co-auteur-pr-fusionnee-sans-probleme
title: 'Wiz a mis à jour sa divulgation : Copilot Autofix était co-auteur, a examiné
  la PR fusionnée et l''a déclarée sans problème'
publishDate: 18-08-2026
kind: security
tags:
- GitHub Copilot
- Wiz
- security
- code review
summary: 'Wiz a mis à jour sa divulgation Snowflake le 17 août 2026, 1957 UTC : Copilot
  était co-auteur, il a examiné la PR fusionnée et la modification de code et l''a
  déclarée sans problème sans repérer les vulnérabilités critiques, et on ignore si
  la modification de code a été assistée par IA. The Register a consigné sa propre
  correction. À mon sens, la relecture manquée est ce qui survit.'
sources:
- label: Wiz Research disclosure
  url: https://www.wiz.io/blog/red-agent-snowflake-copilot-cicd-bug
  date: 17-08-2026
- label: The Register
  url: https://www.theregister.com/security/2026/08/17/an-ai-broke-snowflakes-code-then-another-ai-agent-exploited-it/5288666
  date: 17-08-2026
- label: The Hacker News
  url: https://thehackernews.com/2026/08/snowflake-github-actions-flaw-lets_0330881554.html
  date: 17-08-2026
contentHash: sha256:766bd98308afd804
publishState: published
---

## Ce qui change

Wiz a révisé sa divulgation Snowflake, et la révision déplace l'attribution. La
mise à jour, horodatée au 17 août 2026, 1957 UTC, indique que Copilot était co-auteur, qu'il a
examiné la PR fusionnée et la modification de code et les a déclarées sans problème sans repérer les
vulnérabilités critiques ; elle ajoute qu'on ignore si la modification a été assistée par IA [s1].
The Register a consigné sa propre correction, notée Update 08/18, 0000 GMT : Wiz juge désormais
possible qu'un humain ait introduit l'erreur [s2]. Autofix, dans
cette version, s'est contenté de ne pas la corriger [s2].

## Ce que l'historique des commits établit

The Hacker News est allé lire l'historique GitHub et rapporte que le commit co-signé par Copilot,
6d0e2fa, touchait jira_close.yml, que la refonte risquée de jira_issue.yml provient d'un autre
commit, 094038e, daté du 25 août 2025 et attribué par GitHub à sfc-gh-hpathak, et que les deux ont
été absorbés par la fusion écrasée 4a1b8ce du 18 juin, qui liste Copilot Autofix parmi ses
co-auteurs [s3]. À mon sens, c'est ce paragraphe qu'il faut garder, et pas parce
qu'il disculpe quelqu'un. Une fusion écrasée replie plusieurs commits en un seul, si bien qu'une
mention de co-auteur se rattache à la fusion plutôt qu'à une ligne. Les deux dates disent le reste :
un changement du 25 août 2025 s'est retrouvé dans une fusion du 18 juin [s3].

> [!CONFIRMED]
> The Hacker News rapporte que la refonte risquée de jira_issue.yml provient du commit 094038e
> du 25 août 2025, attribué par GitHub à sfc-gh-hpathak, et que la fusion écrasée 4a1b8ce
> du 18 juin liste Copilot Autofix parmi ses co-auteurs [s3].

> [!INFERRED]
> J'y lis une correction qui laisse un fait intact : un relecteur automatique a regardé la
> modification fusionnée et l'a déclarée sans problème. C'est un faux négatif de la relecture, et il
> tient quel que soit l'auteur des lignes.

## Impact pour une équipe

Si cet épisode part dans un post-mortem ou une note interne, reprenez le texte corrigé : Wiz a
révisé son propre récit et The Register a révisé son article [s1][s2]. Si votre file de fusion
écrase les commits, cessez de lire une mention de co-auteur comme une preuve portant sur une ligne ; The Hacker News a dû ouvrir les commits un à un pour
distinguer jira_close.yml de jira_issue.yml [s3]. Ce qui reste dessous, c'est la relecture manquée.
Un feu vert automatique sur une PR fusionnée n'a rien acheté ici [s1] : gardez une lecture humaine
sur les fichiers de workflow et tenez un verdict automatique pour un avis dans la pull request.
