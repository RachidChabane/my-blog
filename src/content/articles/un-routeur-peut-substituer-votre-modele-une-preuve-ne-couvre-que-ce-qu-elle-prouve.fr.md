---
translationKey: provable-inference-proves-greedy-integer-replay-not-sampled-traffic
lang: fr
slug: un-routeur-peut-substituer-votre-modele-une-preuve-ne-couvre-que-ce-qu-elle-prouve
title: Un routeur peut substituer votre modèle, et une preuve d'inférence ne couvre
  que ce qu'elle prouve
publishDate: 04-11-2026
tags:
- evaluation
- llm-oss
category: essays
difficulty: 4
sources:
- label: Anthropic Frontier Red Team with EPFL, StarkWare, MIT and Succinct co-authors,
    Progress on provable inference for large language models (users cannot check which
    model answered)
  url: https://www.anthropic.com/research/provable-inference
  date: 02-11-2026
- label: Cai, Shi, Zhao and Song (UC Berkeley), Are You Getting What You Pay For?
    Auditing Model Substitution in LLM APIs (arXiv 2504.04715) (providers may substitute
    quantized or smaller models)
  url: https://arxiv.org/abs/2504.04715
  date: 07-04-2025
contentHash: sha256:4f52d2af099af0af
publishState: published
---


À mon avis, l'équipe qui achète un modèle via un routeur ne doit créditer une preuve d'inférence qu'aux requêtes prouvées, sans rien en déduire sur le reste de son trafic. Les clients qui passent par un service de routage tiers veulent l'assurance que les jetons viennent bien du modèle qu'ils ont payé [s2]. Un article de Cai, Shi, Zhao et Song [s21], de l'université de Californie à Berkeley [s22], prévient que des fournisseurs peuvent substituer en secret des alternatives moins chères, versions quantifiées ou modèles plus petits, tout en conservant les prix affichés [s11]. Aucun des deux textes ne pense que la sortie suffit à trancher. Pour Anthropic, juger à partir de la seule sortie du modèle n'est pas fiable, même quand les réponses sont de grande qualité [s14]. Les auteurs de Berkeley qualifient les méthodes purement logicielles de fondamentalement peu fiables [s12]. La Frontier Red Team d'Anthropic, avec des auteurs de l'EPFL, de StarkWare, du MIT et de Succinct [s19], publie FlashProve, un prototype open source d'inférence prouvable [s20]. Les limites qu'il énonce tracent une frontière, et c'est à cette frontière que le plan d'intégrité d'une équipe doit changer.

## Ce que la preuve certifie

Je commence par rendre justice au billet : il énonce lui-même les limites de ce que FlashProve prouve, et elles sont étroites. La promesse, elle, est large : le fournisseur peut joindre à chaque réponse un zkSNARK prouvant que la sortie a été produite par le modèle annoncé sur l'entrée donnée [s15]. Le prototype prouve beaucoup moins. La preuve porte sur un modèle en entiers sous décodage glouton [s5], sur des contextes d'au plus 1 024 jetons [s8], et le système prouve après coup, sur un sous-ensemble de jetons [s16].

Sur Llama 4 Maverick, un mélange d'experts de 400 milliards de paramètres, avec des poids quantifiés sur 4 bits et une arithmétique entière au prefill, un seul H100 génère des preuves à environ 110 jetons par seconde, pour une preuve d'environ 19 Mo par requête de 1 024 jetons [s3]. Prouver demande 70 à 95 fois le temps GPU d'une exécution du modèle sur vLLM [s4].

| Dimension | Ce que FlashProve prouve | Une question pour votre trafic |
| :--- | :--- | :--- |
| Décodage | Décodage glouton [s5] | Lesquelles de vos requêtes sont décodées de façon gloutonne ? |
| Arithmétique | Un modèle en entiers [s5] | Quelle version des poids votre fournisseur vous sert-il ? |
| Contexte | Jusqu'à 1 024 jetons [s8] | Combien de vos requêtes tiennent dans cette fenêtre ? |
| Calendrier | Après coup, sur un sous-ensemble de jetons [s16] | Que pouvez-vous faire d'une garantie qui arrive après la réponse ? |
| Temps GPU | 70 à 95 fois le temps GPU d'une exécution sur vLLM [s4] | Quelles requêtes justifient autant de temps GPU ? |

À mon sens, l'écart se trouve dans le billet lui-même, entre l'usage qu'il promet et le calcul qu'il prouve. Tout ce qui sort de ce calcul reste non prouvé.

## Ce qu'une preuve ne peut pas garantir

À mon avis, la vraie question porte sur le sort d'une réponse que la preuve ne couvre pas. Le billet indique qu'une réponse issue d'une implémentation en virgule flottante, ou d'un décodage par échantillonnage, pourrait diverger à une certaine position et ne plus correspondre exactement au calcul prouvé [s6]. Il dresse aussi les limites de la preuve post hoc elle-même : la complexité supplémentaire du recalcul, le délai avant d'obtenir des garanties sur son trafic et un non-déterminisme inhérent [s17]. Une réponse échantillonnée retombe donc sur le contrôle de la sortie, que le billet juge peu fiable [s14]. Les auteurs de Berkeley détaillent cette faiblesse à leur manière : les tests statistiques sur les sorties textuelles exigent beaucoup de requêtes et échouent face à des substitutions subtiles, tandis que les méthodes fondées sur les log-probabilités sont mises en échec par le non-déterminisme inhérent à l'inférence en production [s12]. Le cas de la virgule flottante, dans l'avertissement du billet, appelle sa propre réponse, que j'aborde plus bas.

> [!CONFIRMED]
> Le billet d'Anthropic : une réponse issue d'un décodage par échantillonnage pourrait diverger à une certaine position et ne plus correspondre exactement au calcul prouvé [s6]. L'article de Berkeley : les méthodes purement logicielles sont fondamentalement peu fiables, et les contrôles par log-probabilités sont mis en échec par le non-déterminisme inhérent à l'inférence en production [s12].

> [!INFERRED]
> À mon sens, le trafic échantillonné qu'une preuve ne peut pas couvrir retombe sur les contrôles de sortie que les deux textes jugent peu fiables. Ce rapprochement est le mien ; aucun des deux textes ne le fait.

La preuve se tait sur les réponses qu'elle ne couvre pas, et aucun des deux textes ne prétend que le non-déterminisme de production la casse.

## Une tranche prouvable qui se signale d'elle-même

Le mode de défaillance que je crains repose sur une hypothèse : un routeur voit passer chaque requête qu'il transmet. À mon sens, cela inclut les réglages de décodage et la longueur de chaque requête. Je suppose qu'une requête envoyée à température nulle est décodée de façon gloutonne ; aucun des deux textes ne le dit. Si seules les requêtes gloutonnes et courtes peuvent être prouvées, tandis que le reste de mon trafic ne le peut pas, la tranche prouvable se reconnaît à sa forme. Un routeur qui substitue les modèles pourrait servir le modèle payé sur cette tranche précise, et un modèle moins cher partout ailleurs.

Une tranche que le routeur sait reconnaître n'audite donc pas le reste, et prouver un échantillon ne m'apprend rien sur les autres requêtes. Je crédite une preuve valide aux requêtes qu'elle a prouvées, et à rien d'autre.

> [!WARNING]
> Si vos requêtes prouvées se distinguent par leur mode de décodage ou leur longueur, partez du principe que le routeur sait les distinguer aussi. Une preuve valide sur cette tranche ne dit rien des requêtes qui en sortent.

## Le meilleur argument en faveur des preuves

L'objection la plus forte à ma lecture soutient qu'un échantillon prouvé renforce malgré tout la confiance dans le routeur pris dans son ensemble. Un routeur qui triche doit faire tourner deux chaînes, l'une pour les requêtes susceptibles d'être prouvées, l'autre pour le reste, et il risque d'être pris sur toute requête qu'il classe mal. Vu sous cet angle, même une preuve étroite renchérit la triche, et une équipe devrait lui accorder un certain poids sur l'ensemble de son trafic.

Les preuves ont aussi un argument technique. Le billet indique que la version en entiers reste, d'après ses tests, dans une petite marge d'erreur par rapport à l'inférence en virgule flottante, même en tenant compte du non-déterminisme des calculs flottants, sans que cela couvre les prompts conçus de manière adversariale [s7]. L'alternative repose d'ailleurs sur sa propre hypothèse de confiance : les environnements d'exécution de confiance (TEEs) offrent confidentialité et attestation en s'appuyant sur un fabricant qui produit du matériel inviolable [s18]. Et le billet voit dans le matériel de confiance et la cryptographie des approches complémentaires, aux garanties et aux compromis différents [s9].

Ma réponse part de ce que chacun de ces arguments couvre réellement. Le résultat sur la marge d'erreur oppose les entiers aux flottants, alors que l'avertissement du billet nomme aussi le décodage par échantillonnage, que ce résultat ne touche pas. Ce résultat exclut en outre les prompts conçus de manière adversariale ; or un routeur qui substitue les modèles est précisément l'adversaire, et c'est le seul cas qui compte ici. Je concède le point sur les flottants. L'argument du prix de la triche ne tient que pour les requêtes que le routeur ne sait pas distinguer ; dans une enveloppe reconnaissable, il les distingue, et une preuve n'ajoute rien au prix de la triche hors de l'enveloppe. La confiance dans le fabricant est un vrai sujet, et je pense que c'est précisément là qu'une preuve justifie son temps GPU : quand celui qui vérifie ne peut pas faire confiance au fabricant du matériel.

## Ce que je mettrais en place

Je répartirais le trafic selon le type de garantie dont chaque requête a besoin. Le problème dont part le billet est bien réel : un utilisateur qui interroge un modèle aujourd'hui ne peut pas vérifier que les réponses viennent bien du modèle annoncé par le développeur [s1].

Pour les requêtes hors de l'enveloppe, l'article de Berkeley indique que les TEEs peuvent fournir des garanties cryptographiques prouvables de l'intégrité du modèle, pour un surcoût de performance modeste [s13]. Cette attestation repose toujours sur un fabricant qui produit du matériel inviolable [s18].

Pour son propre trafic, Anthropic décrit un projet distinct mais apparenté, qui signe son trafic d'inférence et recalcule l'inférence sur un serveur de confiance [s10]. C'est la pratique du fournisseur lui-même, et je ne compterais pas sur un routeur pour l'offrir.

À mon sens, ce qu'une preuve achète, c'est une garantie sur les requêtes prouvées qui ne dépend ni du jugement des sorties ni de la confiance dans un fabricant de matériel. Je ferais donc passer par les preuves les seules requêtes qui entrent dans l'enveloppe et qui ont besoin de ce type de garantie, et je couvrirais tout le reste par du matériel attesté, sans jamais porter une preuve à son crédit. Pour une équipe qui passe par des fournisseurs tiers, la décision se prend dès l'achat : demandez au routeur lesquelles de vos requêtes il pourrait un jour prouver, et traitez sa réponse comme la limite de la garantie.

Si un futur prouveur couvre le décodage par échantillonnage sur de longs contextes, la tranche cesse d'être reconnaissable, et cette répartition perd sa raison d'être.
