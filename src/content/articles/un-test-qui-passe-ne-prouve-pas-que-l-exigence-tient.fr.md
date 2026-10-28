---
translationKey: musthold-proof-in-the-loop
lang: fr
slug: un-test-qui-passe-ne-prouve-pas-que-l-exigence-tient
title: "Un test qui passe ne prouve pas que l'exigence tient"
publishDate: 27-10-2026
tags:
- agentic-coding
- evaluation
- agents
category: essays
difficulty: 3
sources:
- label: "Musthold, recorded agent loop transcript (BOX-4 session)"
  url: https://github.com/RachidChabane/musthold/blob/main/demo/loop/recording/transcript.md
  date: 27-10-2026
- label: "Musthold README"
  url: https://github.com/RachidChabane/musthold/blob/main/README.md
  date: 27-10-2026
- label: "musthold-demo scans README"
  url: https://github.com/RachidChabane/musthold-demo/blob/main/scans/README.md
  date: 27-10-2026
- label: "musthold scan report, my-blog @ d20d7a9"
  url: https://github.com/RachidChabane/musthold-demo/blob/main/scans/my-blog-d20d7a9-full.md
  date: 27-10-2026
- label: "musthold scan report, shallnot @ 397e092"
  url: https://github.com/RachidChabane/musthold-demo/blob/main/scans/shallnot-397e092-full.md
  date: 27-10-2026
- label: "musthold scan report, musthold module format @ ca1b54f"
  url: https://github.com/RachidChabane/musthold-demo/blob/main/scans/musthold-format-ca1b54f-full.md
  date: 27-10-2026
- label: "loop-1 pre-registration"
  url: https://github.com/RachidChabane/musthold/blob/main/experiments/loop-1/PREREG.md
  date: 27-10-2026
contentHash: sha256:dbf6744f8543f908
publishState: published
---


Un test qui passe prouve que le code a survécu à l'unique entrée choisie par l'agent, pas que l'exigence tient ; j'ai donc construit Musthold pour transformer chaque exigence en une preuve exécutée dans la boucle de l'agent. Cette preuve pose la question que la coche verte ne pose jamais : ces tests échoueraient-ils si le code violait l'exigence ?

> [!NOTE]
> Musthold ne prouve pas qu'un code est correct. Un succès signifie qu'aucune violation essayée n'a survécu aux tests. C'est un plancher, pas un certificat.

## Le test qui passe et ne vérifie rien

Un agent écrit le code et les tests d'un même geste, et ses tests ont tendance à affirmer ce que fait le code plutôt que ce qu'on lui a demandé. Une suite peut rester verte alors que les lignes qu'elle exécute sont cassées, parce que rien dans la suite ne le remarquerait.

Shallnot, mon premier outil, referme la première brèche. Il vérifie que chaque critère d'acceptation d'une spécification a un test qui le cite et que ce test a passé. Il repère ainsi l'exigence que personne n'a testée, mais pas le test qui cite l'exigence et ne contrôle presque rien.

Musthold ajoute deux preuves pour chaque exigence [s2] :

- **Pouvoir discriminant.** Ses tests doivent échouer sur un mutant, c'est-à-dire une petite modification du code qui viole l'exigence.
- **Alignement.** Chaque test doit vérifier ce que dit l'exigence, et non un sujet voisin.

Le verdict revient à l'exécution. Un mutant ne compte que s'il compile, passe les tests des autres exigences et échoue sur un exemple de sa propre exigence ou sur un test témoin écrit à partir de la spécification avant tout mutant [s2]. L'avis d'un modèle ne bloque jamais l'agent à lui seul.

## Une session enregistrée

La démonstration est un petit guichet de cinéma qui calcule le prix d'un billet selon l'âge de l'acheteur. J'ai lancé Claude Code avec Sonnet 5.5 sur la tâche BOX-4, qui demande l'entrée gratuite pour les moins de 3 ans. Le lanceur démarre la vraie CLI et les vrais modules dans des conteneurs et enregistre ce qu'ils affichent ; je n'ai donc rien écrit à la main dans la transcription [s1].

Un des tests existants est volontairement faible. Celui de BOX-2 (65 ans ou plus paient 8) cite le critère et passe, mais ne vérifie que l'âge de 70 ans.

L'agent implémente BOX-4, ajoute son test et lance la porte à la main. Elle annonce quatre exigences couvertes et passantes, mais aussi huit constats bloquants, parce qu'aucune preuve n'existe encore. Une preuve absente ne passe jamais. L'agent lance alors le skill `prove-all`.

Ensuite, `musthold-dp` bloque sur BOX-2. Trois mutants passent tous les tests du critère. Deux échouent sur son exemple `ticket_price(age=65) => 8` ; le troisième échoue sur un test témoin couvrant les âges de 65 à 120 [s1]. L'agent reçoit l'exigence et une entrée que ses tests ne distinguent pas. Il ne voit jamais le code du mutant, donc il ne peut pas y ajuster un test ; il ne peut que raisonner sur l'exigence.

L'agent ajoute un test :

```python
@pytest.mark.verifies("BOX-2~1")
def test_senior_prices_start_at_sixty_five():
    assert ticket_price(age=65) == 8
    assert ticket_price(age=120) == 8
```

La preuve passe à l'exécution suivante ; l'agent publie ses preuves et la porte de fin de tour de Shallnot autorise l'arrêt [s1]. Dans son propre compte rendu, l'agent écrit que le seul test existant de BOX-2 utilisait l'âge de 70 ans, si bien que les mutants qui décalaient la frontière de 65 ans survivaient.

Dans cet enregistrement, le blocage vient du verdict de `musthold-dp` dans la sortie de l'agent, après qu'il a lancé les preuves que la porte disait manquantes. Le hook de fin de tour s'est déclenché une seule fois, à la fin, et a autorisé l'arrêt [s1]. Par conception, le hook retient l'agent tant qu'une preuve est due ou échoue [s2] ; cette session montre le contre-exemple et la correction, mais pas le hook en train de retenir l'agent.

La session a duré 9 min 17 s et la CLI a rapporté 2,38 USD [s1]. Ce montant est théorique : l'exécution utilisait un token d'abonnement, et personne ne l'a donc payé à l'appel.

## Scanner un dépôt sans spécification

La plupart des dépôts n'ont pas de spécification au format de Shallnot. `musthold-dp scan` n'en demande aucune. Il lance la suite, casse le code qu'exécute un test vert échantillonné et liste les tests qui passent encore sur chaque changement prouvé [s2].

Je l'ai lancé sur mes propres dépôts. Un scan complet échantillonne 40 tests verts [s3]. Les rapports donnent :

| Dépôt | Tests verts échantillonnés qui ne vérifient rien |
| --- | ---: |
| my-blog | 3 sur 40 [s4] |
| Shallnot | 1 sur 40 [s5] |
| Musthold, module `format` | 1 sur 40 [s6] |

« Ne vérifient rien » a un sens étroit : le test passe sur tous les changements prouvés dans les lignes qu'il exécute. Chaque rapport nomme le changement et fournit un script qui le rejoue. Les autres tests échantillonnés sont soit rattrapés, soit non prouvés, et les rapports disent lesquels. Il s'agit d'échantillons de 40 tests tirés de mon propre code, qui ne donnent pas un taux valable pour les logiciels en général.

Je trouve ces chiffres assez petits pour être crédibles et assez grands pour compter. Même dans un dépôt dont l'auteur tient à ses tests, quelques tests verts ne remarqueraient pas une ligne cassée.

## Ce que je n'ai pas montré

Musthold n'a pas encore montré que les agents livrent moins de défauts avec lui. La session ci-dessus montre la boucle fonctionner une fois, sur une fixture que j'ai construite et avec une faiblesse que j'y ai plantée, si bien qu'elle sert d'illustration et non de mesure.

La mesure passe par une étude appelée `loop-1`, préenregistrée et figée avec son kit de réplication. Un oracle en aveugle, que l'agent ne voit jamais, comptera les changements défectueux dans deux bras : une porte qui exige la seule traçabilité et une porte qui exige aussi le pouvoir discriminant et l'alignement [s7]. Je publierai le résultat quel qu'il soit, y compris un résultat nul.

> [!NOTE]
> Mise à jour du 28 octobre 2026 : `loop-1` a tourné, et son résultat n'est pas concluant. L'agent n'a livré aucun changement défectueux, ni dans un bras ni dans l'autre, 0 sur 18 chacun : la porte n'avait rien à arrêter. L'étude a aussi montré que la porte qui exige les preuves a rejeté 4 changements corrects sur 18, dont la session n'avait jamais publié les preuves. Le rapport est [`experiments/loop-1/results/REPORT.md`](https://github.com/RachidChabane/musthold/blob/main/experiments/loop-1/results/REPORT.md).

## L'essayer

Le scan tient en une commande, tirée du README du dépôt [s2] :

```
go install github.com/RachidChabane/musthold/discpower/cmd/musthold-dp@latest
musthold-dp scan
```

Il n'exige ni spécification, ni modèle, ni configuration, et le scan rapide prend environ une minute et demie.

Pour la boucle, installez les quatre binaires et le plugin Claude Code (`/plugin marketplace add RachidChabane/musthold`, puis `/plugin install musthold@musthold`), puis lancez `shallnot init` et `init` suivi de `enable` pour chaque module. Le [dépôt](https://github.com/RachidChabane/musthold) donne le détail.

Qui veut répliquer ou réfuter l'étude trouvera le protocole dans [`experiments/loop-1/PREREG.md`](https://github.com/RachidChabane/musthold/blob/main/experiments/loop-1/PREREG.md).
