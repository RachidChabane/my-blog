---
translationKey: patch-quality-rate-needs-a-consistent-grader
lang: fr
slug: l-evaluateur-doit-s-accorder-avec-lui-meme
title: Un taux de qualité des correctifs exige un évaluateur qui s'accorde avec lui-même
publishDate: 18-09-2026
tags:
- evaluation
- agentic-coding
- qualite
category: essays
difficulty: 3
sources:
- label: 1Password Off-by-1 Labs FLAWED study, headline clean-fix rate
  url: https://1password.com/blog/why-ai-generated-patches-still-require-human-review
  date: 06-08-2026
- label: Trail of Bits review of the 1Password FLAWED study, the four design choices
    behind the headline
  url: https://blog.trailofbits.com/2026/09/15/1passwords-ai-patching-benchmark-is-misleading/
  date: 15-09-2026
contentHash: sha256:ef14c490cdb073d2
publishState: published
---


Je ne cite pas un taux de qualité des correctifs tant que je ne sais pas si l'évaluateur qui l'a produit donnerait deux fois le même verdict au même correctif. La pédanterie apparente tient jusqu'au moment où l'on veut se servir d'un de ces chiffres, et voici celui que tout le monde a sous les yeux : sur six CVE récemment divulguées, 1Password a produit 6,080 correctifs avec deux modèles de raisonnement de pointe, capables en cybersécurité, et le taux de réussite moyen pour un correctif résolvant pleinement la vulnérabilité sans modifier sensiblement le comportement de l'application était de 26.0% [s1].

Le chiffre jumeau voyage plus loin encore. Les correctifs générés n'ont pas résolu la vulnérabilité, en ont ajouté une nouvelle, ou les deux, dans 53.9% des cas en moyenne [s2]. Or ces deux chiffres comptent des étiquettes, et je les lis comme les sorties d'une étape d'étiquetage dont personne, dans cette querelle, n'a montré la reproductibilité. Tant que cette étape n'est pas caractérisée, aucun des deux ne dit à une équipe sécurité où placer sa capacité de revue.

## Ce que le chiffre mis en avant mélange

Le reproche habituel fait à un banc d'essai porte sur sa taille, sa facilité ou son âge. Celui qui compte ici est d'une autre nature : le chiffre répond à plusieurs questions à la fois et se lit comme s'il n'en tranchait qu'une seule. Trail of Bits a examiné le code et les données de 1Password et relève quatre choix qui font du taux de correctifs propres de 26% un guide trompeur du travail de correction ordinaire [s3]. Le mot est d'eux ; je le cite comme leur caractérisation et ne le reprends pas à mon compte.

Deux d'entre eux portent sur ce que la moyenne agrège. Le chiffre mis en avant inclut des expériences qui demandaient délibérément aux agents d'appliquer le mauvais correctif, ainsi que des expériences où les agents ne pouvaient ni compiler ni tester ce qu'ils venaient d'écrire [s4]. Deux invites demandent aux agents d'appliquer le mauvais correctif, et ces invites représentent 22% des données [s5]. Un mode d'évaluation empêche les agents de compiler ou d'exécuter du code, et il représente 36% des données [s6].

L'examen ne dit pas si ces deux tranches se recouvrent : les additionner relèverait de mon arithmétique et du constat d'aucune des deux parties. Les parts ne sont d'ailleurs pas le sujet. Trois expériences posant trois questions produisent une seule moyenne, et cette moyenne se lit ensuite comme une mesure de capacité.

| Tranche des essais | Ce que l'examen rapporte | Comment je le lis |
| --- | --- | --- |
| Les invites qui imposent le mauvais correctif | deux invites, 22% des données [s5] | la fréquence à laquelle les chercheurs ont choisi de donner un mauvais conseil |
| Le mode qui bloque compilation et tests | un mode d'évaluation, 36% des données [s6] | écrire un correctif sans boucle de retour |
| Tout fondu dans un seul chiffre | le chiffre mis en avant combine ces essais avec ceux qui pouvaient tester [s4] | un nombre qui ne répond à aucune question précise |

Le défaut tient à l'agrégation.

## Le résultat caché dans les mêmes données

Une réanalyse qui ne fait que tirer un chiffre vers le bas relève de la chicane. Celle-ci en tire un vers le haut, à partir des données publiées par l'étude elle-même. Dans les essais examinés par Trail of Bits, 2,634 des 3,067 correctifs générés par les modèles de 1Password, soit 86%, ont bloqué l'exploit fourni [s7].

Placez ce chiffre à côté du taux mis en avant et la tentation est immédiate : l'un des deux serait faux. Aucun ne l'est. Bloquer un exploit fourni et résoudre pleinement une vulnérabilité sans changer le comportement sont deux prédicats distincts, et le chiffre le plus élevé n'est pas un taux de correctifs propres déguisé. Un banc d'essai qui donnerait les deux, avec le prédicat attaché à chacun, vaudrait mieux que celui qui n'en retient qu'un.

Le second résultat est plus discret et fait plus de dégâts. La moyenne sur les six cibles porte une erreur type d'environ neuf points de pourcentage, que le rapport ne divulgue pas [s8]. Une dispersion de cet ordre, non divulguée, sur une moyenne prise sur six cibles, explique pourquoi je traite un taux unique issu de cette étude comme une fourchette qu'on ne m'a pas montrée.

## Un évaluateur qui ne s'accorde pas avec lui-même

Toute la querelle porte sur la justesse du 26%. À mon avis, la question qui tranche ce genre de débat est plus terne : faites évaluer deux fois les mêmes correctifs et regardez si les étiquettes tiennent. Sur ce point, le matériel publié en dit plus que le chiffre de couverture, et ce qu'il montre n'a rien de rassurant.

Les deux modèles ont attribué des résultats différents à 36.8% des mêmes correctifs [s13]. Les modèles évaluant leurs propres correctifs ont concordé avec les relecteurs humains sur le résultat complet à cinq catégories dans 65.9% des cas examinés [s12]. Et sur la classe de défaut qu'un évaluateur automatique devrait le mieux repérer, les auteurs ont trouvé 248 correctifs générés qui reproduisaient une erreur de décalage d'une unité, un off-by-one déjà présent dans le correctif amont, l'évaluateur ne l'ayant signalée que dans 24 d'entre eux [s14].

Une étape d'étiquetage qui se contredit à ce point ne produit pas un taux. Elle produit un tirage dans une distribution qu'aucune des deux parties n'a caractérisée, et le chiffre publié est la moyenne de deux tirages de cette sorte. C'est la thèse que ce texte offre au désaccord : on peut soutenir qu'une concordance de cet ordre suffit pour une lecture directionnelle, et la réponse à cette objection vient deux sections plus bas.

> [!NOTE]
> Avant de citer un pourcentage de qualité des correctifs, cherchez le taux d'accord qui l'accompagne : la fréquence à laquelle deux évaluateurs de même classe ont donné la même étiquette au même correctif, et celle à laquelle un évaluateur a rejoint un relecteur humain. Si aucun des deux n'est publié, vous lisez une mesure dont l'instrument n'a pas été mesuré.

## Le chiffre humain se mesure sur une autre règle

Tous les résumés de cette querelle que j'ai lus finissent par soustraire un taux de l'autre, parce que les deux ressemblent à la même sorte de grandeur. Ils ne le sont pas, et les conditions attachées au chiffre humain pèsent autant que le chiffre : les développeurs avaient écrit le logiciel qu'ils corrigeaient, disposaient de rapports détaillés des ingénieurs qui les relisaient, et savaient qu'une relecture viendrait.

> [!CONFIRMED]
> Trail of Bits a examiné les premiers correctifs soumis pour 2,265 vulnérabilités dans 236 de ses audits de sécurité de 2024 à 2026, et 283 d'entre eux, soit 12.5% ou un sur huit, n'ont pas pleinement résolu le problème signalé [s9]. En tenant compte de plusieurs correctifs issus d'un même audit, l'intervalle de confiance à 95% sur ce taux va de 10.5% à 14.5% [s10].

> [!INFERRED]
> Je lis ce taux d'échec et le taux de correctifs propres du banc d'essai comme les réponses à deux questions différentes, posées sur deux ensembles de tâches différents, et je ne les mettrais donc pas sur un même axe. C'est ma lecture de ce que chacun mesure, et non un constat de l'une ou l'autre partie.

La polarité est le piège. Un chiffre compte les correctifs sortis propres, l'autre compte ceux qui sont sortis faux, et les deux ont été mesurés sur des ensembles de tâches distincts par des procédures distinctes. Les soustraire fabrique un écart qui n'est qu'un artefact de la soustraction. L'intervalle de confiance publié [s10] resserre le taux humain sans rien changer à cela : je lis ce dossier comme l'essentiel des premiers correctifs aboutissant du premier coup dans ces conditions, ce qui mérite d'être su et ne constitue pas un nombre à poser à côté d'un banc d'essai.

Un résultat devrait rendre prudent quiconque traite l'échec humain et l'échec d'un agent comme différents par nature : deux auteurs, un humain et un agent, travaillant séparément, ont commis la même erreur sur le même bug [s11]. Trail of Bits fournit le seul point de comparaison humain dans cet échange, ce qui dit quelque chose de cette discussion et rien de ce qui existe ailleurs. Ce qu'aucune des deux parties n'a mené, c'est un bras de contrôle : les mêmes tâches, les deux sortes d'auteurs, une seule procédure d'évaluation.

## Le meilleur argument pour prendre le chiffre au sérieux

Voici l'objection à pleine puissance, et elle est solide. Une concordance de résultat complet autour des deux tiers suffit à une lecture directionnelle ; un désaccord entre évaluateurs qui joue dans les deux sens se compense dans une moyenne au lieu de la biaiser ; et le dossier du critique lui-même montre que les correctifs écrits par des agents exigent une vraie relecture avant d'être fusionnés. Sous cette lecture, le chiffre mis en avant est à peu près juste et réclamer des statistiques d'évaluateur tient du perfectionnisme.

Le dossier du critique est la meilleure part de cet argument. Les mainteneurs ont fusionné 126 des 186 pull requests de Trail of Bits, soit un taux d'acceptation de 67.7% [s15]. Dans 91 de ces 126, soit 72.2%, ils ont accepté le correctif de sécurité initialement proposé [s16]. Ce sont de vrais correctifs, relus par des gens sans intérêt dans la querelle.

Je concède les deux chiffres. Aucun n'est en doute ici, et il n'est pas nécessaire de les contester pour que la thèse tienne, car la réponse est plus étroite que l'objection ne le suppose. Une lecture directionnelle est précisément ce qu'un pourcentage cesse de porter dès que ses étiquettes bougent avec l'évaluateur : la direction est ce qu'une moyenne entre deux étiqueteurs en désaccord répare le moins bien, puisque la compensation est une hypothèse sur le désaccord et non une mesure de celui-ci. Je ne réclame ni un échantillon plus grand, ni un banc d'essai plus dur, ni une réplication. J'exigerais le taux d'accord, qui coûte une fraction de l'étude déjà menée.

## Ce que l'audit de suivi a trouvé, et ce qu'il ne pouvait pas trouver

La part la plus intéressante de cet échange est celle où une partie part chercher ses propres erreurs. La forme de cette recherche décide de ce que vaut le constat. Trail of Bits a examiné environ 33,500 commits ultérieurs dans les projets Patch the Planet et, lorsqu'un commit ultérieur touchait un fichier modifié par l'un de ses correctifs, a cherché si ce commit corrigeait un problème introduit par le correctif [s17]. L'examen a trouvé au moins dix bogues fonctionnels, quatre bogues de compilation, de test ou d'automatisation de publication, et un bogue de performance, et il n'a trouvé aucune vulnérabilité de sécurité exploitable [s18].

Regardez ce que sont devenues les preuves à ce point du texte. Depuis les chiffres de fusion, la partie qui mesure est celle dont les correctifs sont mesurés. Je pense qu'il vaut mieux le dire franchement que d'en faire une disqualification : la procédure de recherche est décrite, ce qui permet au lecteur de la peser, et c'est plus de transparence que le chiffre critiqué n'en offre sur son propre étiquetage.

Un résultat négatif de ce genre reste un énoncé sur ce qu'une recherche a trouvé. Je le lis comme borné par le balayage qui l'a produit, lequel suivait les modifications postérieures apportées aux fichiers corrigés, et ne ferait pas remonter un défaut contre lequel personne n'a encore livré quoi que ce soit.

## Ce que j'exigerais avant de citer un taux

Trail of Bits écrit que les lecteurs qui décident d'utiliser ou non des agents doivent savoir comment leurs échecs se comparent à ceux des développeurs humains, et qu'établir lequel est le plus fiable exige de mesurer les deux dans des conditions comparables [s19]. C'est leur exigence et je la partage. La mienne est plus modeste et vient avant, car comparer deux mesures instables ne vaut pas le déplacement.

```text
outcome_rate:        <le chiffre mis en avant, et le prédicat qu'il compte>
grader_agreement:    <deux évaluateurs sur les mêmes correctifs, ou non publié>
human_agreement:     <évaluateur contre relecteurs humains, ou non publié>
working_conditions:  <rapportées séparément, ou fondues dans une seule moyenne>
task_set:            <le même ensemble pour les deux bras, ou deux ensembles différents>
verdict:             <citable | citable avec son taux d'accord | pas encore un taux>
```

Cette liste est la mienne et ne vient d'aucune source. Passez-la sur la prochaine étude de qualité des correctifs qu'on vous demande d'appliquer : vous vous arrêterez le plus souvent à la deuxième ligne, et cet arrêt est déjà le constat.

Je n'ai refait tourner aucune des deux analyses, et rien ici ne conteste un chiffre publié par l'une ou l'autre. C'est une règle de lecture des taux publiés, et elle change ce que je fais quand un chiffre de fournisseur tombe et qu'on me demande si l'on peut confier des correctifs de sécurité à des agents. Ma première question ne porte plus sur le nombre. Elle porte sur ce qui l'a produit, et sur sa capacité à le produire une seconde fois.
