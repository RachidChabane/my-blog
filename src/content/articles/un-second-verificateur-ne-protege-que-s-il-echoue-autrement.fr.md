---
translationKey: lean-kernel-cross-checks-only-help-when-kernels-fail-differently
lang: fr
slug: un-second-verificateur-ne-protege-que-s-il-echoue-autrement
title: Un second vérificateur de preuves ne protège que s'il échoue autrement
publishDate: 18-10-2026
tags:
- evaluation
- agentic-coding
category: essays
difficulty: 4
sources:
- label: Leonardo de Moura, Lean Now Ships with Verified Kernels (AI-found vulnerabilities)
  url: https://leodemoura.github.io/blog/2026-10-15-lean-now-ships-with-verified-kernels/
  date: 15-10-2026
- label: 'Leonardo de Moura, Postmortem for Kernel Soundness Bug #14576 (Collatz disproof)'
  url: https://leodemoura.github.io/blog/2026-8-1-postmortem-for-kernel-soundness-bug-14576/
  date: 01-08-2026
- label: Leonardo de Moura, Postmortem for the Kernel Soundness Bug Hunt (threat model)
  url: https://leodemoura.github.io/blog/2026-8-24-postmortem-for-the-kernel-soundness-bug-hunt/
  date: 24-08-2026
- label: Thomas Hales (guest post), What mathematicians should know about the Lean
    Theorem Prover (cross-checking)
  url: https://terrytao.wordpress.com/2026/10/09/what-mathematicians-should-know-about-the-lean-theorem-proverquestions-of-reliability-and-ai/
  date: 09-10-2026
- label: Ramana Kumar, CollatzLean README at the disproof commit (verification pipeline)
  url: https://raw.githubusercontent.com/xrchz/CollatzLean/a79357462a33d2a6babd4cf6c8d8bcd25425d653/README.md
  date: 25-07-2026
contentHash: sha256:1baf65119f798276
publishState: published
---


Un second vérificateur ne protège, à mon sens, contre les preuves générées par IA que s'il échoue autrement que le premier : écrit séparément, et à jour. Selon le postmortem du Lean FRO consacré à la chasse aux bogues, les auteurs considèrent les preuves générées par IA comme une source potentielle de preuves malveillantes [s12]. Ce même postmortem détaille les mesures que prend le Lean FRO pour renforcer la confiance [s24]. Le billet de version du FRO part de la menace : les agents d'IA sont très efficaces pour trouver des vulnérabilités dans son logiciel, y compris dans le noyau de l'assistant de preuve Lean [s1]. Je lis dans ce dossier deux façons dont un second vérificateur peut échouer comme le premier, et toute équipe qui filtre les sorties d'un modèle avec un vérificateur y est exposée.

## Ce qu'une revérification ajoute à la compilation

Je pense que la compilation qui a produit une preuve est le mauvais endroit pour lui faire confiance, et l'outillage de Lean le reconnaît désormais. D'après le postmortem du FRO sur la chasse aux bogues, `lake build` ne protège pas les utilisateurs contre des preuves adverses qui tentent, par exemple, de corrompre la mémoire au moyen d'extensions de Lean [s13]. Une compilation exécute ce que le développement lui demande d'exécuter : une preuve hostile a donc voix au chapitre dans sa propre vérification.

Le billet de version du FRO répond par une passe séparée. Selon le FRO, Lean v4.35.0 est livré avec la commande `lake check`, qui exporte un développement et le revérifie avec leanchecker, le noyau officiel de Lean débarrassé de tout ce qui l'entoure [s2]. Le billet du FRO va plus loin : Lean est désormais livré avec quatre noyaux supplémentaires, nanoda, lean4lean, con-leche et con-ron, et `lake check --paranoid` permet de revérifier un développement avec chacun d'eux [s3]. Dans ce mode, précise le billet du FRO, Lean lance aussi une variante du noyau officiel construite avec un allocateur mémoire durci, qui transforme une corruption mémoire en arrêt contrôlé [s30].

Tout cet appareillage ne répond qu'à une question : ce terme de preuve est-il bien typé ? Je compte ces passes comme je compterais les relecteurs d'une demande de fusion risquée : des relecteurs formés sur une seule base de code, par une seule personne, partagent un angle mort.

Reste à savoir combien de ces passes sont indépendantes.

## Comment une vérification croisée a laissé passer une fausse preuve

Je pense que l'incident est instructif, justement parce que la chaîne qui l'a laissé passer ressemble à celle que j'aurais écrite. Selon le postmortem Collatz du FRO, le 25 juillet, Ramana Kumar a publié un dépôt contenant une prétendue réfutation sans sorry de la conjecture de Collatz, produite avec l'aide de l'IA, qui exploite un bogue dans le traitement des types inductifs imbriqués par le noyau [s8].

Le README du dépôt était soigné. Le README indique que le projet épingle Lean et Mathlib à la version v4.32.1 [s20]. Le README présente l'argument comme sans témoin : il prétend établir l'existence d'une orbite exceptionnelle sans choisir d'entier naturel concret [s22]. D'après le README, sa chaîne de vérification comprend les avertissements traités comme des erreurs, un rejeu leanchecker ordinaire et un rejeu complet à neuf, des contrôles de sûreté, de clôture, de noyau direct et de dépendance aux axiomes, un lean4export ciblé du résultat public, et une vérification indépendante par Nanoda, épinglé, sans aucun axiome autorisé [s25]. Le README qualifie lui-même la vérification par Nanoda d'épinglée, c'est-à-dire figée à une version [s21].

Lue par lignée, cette liste rétrécit. Selon mon décompte, le rejeu leanchecker relance le noyau officiel, la lignée qui portait le bogue ; des contrôles que liste le README, un seul est donc un noyau externe.

> [!CONFIRMED]
> Le postmortem Collatz rapporte que le dépôt a aussi passé une version de nanoda vieille d'une semaine, le principal vérificateur externe [s9]. Le postmortem ajoute que le bogue de nanoda avait été corrigé une semaine avant le signalement du bogue de Lean, et que la preuve était construite de sorte que l'expression que le noyau n'inspecte jamais soit une expression acceptée par l'ancien nanoda [s26]. Sa conclusion, toujours selon le postmortem : la vérification avec un noyau indépendant continue de fonctionner, puisqu'il a fallu deux bogues distincts dans deux implémentations, mais ceux qui s'y fient ont besoin des versions courantes des deux [s10].

> [!INFERRED]
> Ma lecture : le Nanoda épinglé du README est l'ancienne version de nanoda que décrit le postmortem. Rien dans le dossier ne l'affirme. Si c'est le cas, l'épinglage a rempli son rôle pour la reproductibilité, et il a gardé dans le chemin d'acceptation un bogue déjà corrigé en amont.

Le FRO tire lui-même la leçon de la mise à jour pour ses propres outils. D'après le postmortem Collatz, comparator.live lance désormais nanoda par défaut, et nanoda est suivi quotidiennement pour que lean-eval et comparator restent à jour après les correctifs en amont [s28]. Le FRO fait donc avancer sa copie du vérificateur pendant que la chaîne du projet utilisateur le laissait figé, et je pense que cet écart est la vraie leçon pour le praticien. Épingler, c'est ce que fait un ingénieur soigneux pour une compilation. Suivre l'amont, c'est ce qu'il fait pour un filtre d'acceptation. Le README a appliqué au filtre l'habitude de la compilation.

## Compter les noyaux par lignée

Je pense que les noyaux supplémentaires apportent moins de voix indépendantes que leur nombre ne le laisse croire, et le billet de version du FRO montre lui-même pourquoi. Le postmortem Collatz décrit nanoda comme un noyau indépendant pour Lean, implémenté en Rust [s27]. Ce même postmortem indique que lean4lean est touché par le bogue du noyau, car son traitement des types inductifs est un portage de l'implémentation de référence [s11]. Le billet de version du FRO présente con-leche comme le premier noyau de Lean écrit en Lean et prouvé cohérent ; Claude (Fable et Opus) l'a implémenté et en a prouvé la cohérence, sous une supervision étroite au Lean FRO [s4]. Le billet du FRO décrit aussi con-ron : l'IA a servi à traduire con-leche en Rust, puis Aeneas a servi à prouver que la version Rust raffine l'algorithme de vérification de con-leche [s29].

Voici comment je range les vérificateurs que lance `lake check --paranoid`, selon ce contre quoi chacun est indépendant.

| Vérificateur | Lignée du code, selon le Lean FRO | Ce que j'y compte |
| :--- | :--- | :--- |
| leanchecker | le noyau officiel, allégé [s2] | la voix de référence |
| variante durcie | le noyau officiel, allocateur durci [s30] | la voix de référence, avec une corruption mémoire rendue bruyante |
| lean4lean | types inductifs portés depuis la référence [s11] | pas indépendant sur les types inductifs |
| nanoda | indépendant, écrit en Rust [s27] | une voix distincte, s'il est à jour |
| con-leche | écrit en Lean, prouvé cohérent [s4] | une voix distincte sur l'algorithme |
| con-ron | con-leche traduit en Rust, avec une preuve qu'il le raffine [s29] | la voix de con-leche, sur un autre compilateur |

La ligne con-ron relève d'un choix de conception : partager l'algorithme de con-leche est tout l'intérêt d'un raffinement prouvé. La ligne lean4lean est d'une autre nature, car le portage a emporté le bogue avec lui.

Un billet invité de Thomas Hales aborde la même inquiétude du côté des mathématiciens [s23]. Hales écrit que la vérification croisée d'une preuve par différents noyaux ne lève pas tout doute [s16]. Hales ajoute que des noyaux différents peuvent avoir les mêmes défauts, et qu'une partie de ces erreurs peut être atténuée en faisant tourner des noyaux implémentés dans des langages de programmation différents, sur des matériels et des systèmes d'exploitation différents [s17]. Hales évoque une implémentation du noyau qui ne regarde pas le code source du noyau officiel, pour éviter de recopier des bogues d'un noyau à l'autre [s18]. Hales a découvert un bogue de Lean cet été, lorsque ce bogue a produit une courte preuve illicite de la conjecture de Kepler en Lean [s19].

Je lis ses remèdes comme les deux axes de mon tableau : l'écriture séparée pour l'algorithme, des langages et des matériels différents pour la chaîne d'outils. Je compte les vérificateurs par lignée, et je compte un noyau vérifié et sa traduction prouvée comme une seule voix sur l'algorithme et deux voix sur la chaîne d'outils. Des binaires ne sont pas des voix.

## L'épinglage périmé, et ce que j'exécute avant d'accepter une preuve

J'appelle ce mode de défaillance **l'épinglage périmé** : un vérificateur figé dans le fichier de verrouillage pour la reproductibilité, qui continue d'accepter un bogue que son amont a déjà corrigé. Il est silencieux par construction. L'épinglage existe pour que rien ne change, et un correctif est un changement.

Une version courante ne protège que contre les bogues que quelqu'un a déjà trouvés et corrigés. Ma lecture du postmortem est que le volet nanoda de l'exploit Collatz relevait exactement de ce genre de bogue.

Ma règle garde les deux habitudes et assigne à chacune son rôle. Je garde la chaîne d'outils épinglée pour reproduire la compilation. À l'acceptation, je lance le même développement sur la chaîne d'outils à jour avec `lake check --paranoid`, puis la version courante de chaque vérificateur écrit séparément, et je rejette la preuve au moindre désaccord. Selon moi, comme les noyaux supplémentaires sont livrés avec Lean, une chaîne d'outils épinglée fige vraisemblablement tous les noyaux d'un coup.

```bash
# reproduire : la chaîne d'outils épinglée par le projet, inchangée
lake build
lake check
# accepter : le même développement sur la chaîne d'outils à jour, avec chaque noyau livré
lake check --paranoid
# puis lancez la version courante de chaque vérificateur écrit séparément auquel vous vous fiez
```

Je pense que ces deux tâches répondent à des questions différentes, et que la seconde décide de ce qui est fusionné.

À mon sens, le même épinglage périmé guette toute équipe qui filtre les sorties d'un modèle avec un vérificateur. Les tests que l'agent a écrits pour son propre correctif partagent une lignée avec ce correctif. Un juge construit sur le même modèle que le générateur en partage une avec les sorties qu'il note. Je pense qu'un évaluateur épinglé convient pour reproduire un score, et qu'il ne convient pas comme seul filtre à l'acceptation.

## Le meilleur argument contre

Je pense que l'argument du FRO contre mon inquiétude est solide. Le postmortem conclut que la vérification avec un noyau indépendant continue de fonctionner. Le billet de version du FRO affirme que l'approche de con-leche élimine une classe entière de bogues : les erreurs de programmation dans l'implémentation du noyau [s5]. Et le postmortem du FRO sur la chasse aux bogues indique qu'aucun des groupes qui utilisaient des modèles accessibles au public n'a signalé de bogue [s15]. Vu ainsi, les noyaux supplémentaires fonctionnent comme prévu, et l'inquiétude sur la lignée reste théorique.

J'accepte l'argument du FRO : même un noyau externe périmé a obligé l'attaquant à trouver un second bogue, dans une seconde implémentation, et cela a renchéri l'attaque. Ma lecture est que le coût a monté une fois, et que l'épinglage l'a empêché de monter encore.

La conclusion du postmortem porte d'ailleurs sa propre condition : les versions courantes des deux. Le billet de version du FRO reconnaît que con-leche n'est pas à toute épreuve, car le compilateur et l'environnement d'exécution qui servent à le construire peuvent contenir des bogues [s6]. La réponse du FRO à cette réserve est con-ron. Je lis le calme de la chasse aux bogues menée avec des modèles publics comme un indice faible sur les agents que le FRO juge très efficaces pour trouver des vulnérabilités, ceux-là mêmes qui écriront ma prochaine preuve.

L'objection la plus sérieuse à ma propre règle : une version courante est aussi la plus neuve, donc celle dont personne n'a encore trouvé les bogues. Je pense que c'est vrai, et c'est pourquoi je limite la règle aux bogues corrigés.

> [!WARNING]
> Le postmortem du FRO sur la chasse aux bogues rapporte que la distribution officielle de Lean pour Linux n'utilisait pas la dernière version de GMP, la v6.3.0 [s31]. Ce même postmortem explique que son intégration continue Linux construisait les binaires de Lean avec GMP v6.1.2 pour des raisons de compatibilité avec la libc, une version qui contenait un bogue exploitable pour construire une preuve de `False` [s14]. Je lis là l'épinglage périmé, une couche plus bas : une dépendance retenue pour une bonne raison, sous le noyau sur lequel repose chaque voix.

Compter par lignée, épingler pour reproduire, lancer la version courante pour accepter. Lancez les noyaux à jour avant de fusionner la preuve.
