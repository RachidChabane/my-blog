---
translationKey: fabricated-statistics-site-keeps-feeding-live-llm-retrieval
lang: fr
slug: arreter-la-remontee-de-provenance-la-ou-le-chiffre-a-ete-produit
title: Arrêter la remontée de provenance à la page qui dit comment le chiffre a été
  produit
publishDate: 31-10-2026
tags:
- retrieval
- rag
- qualite
category: essays
difficulty: 3
sources:
- label: Peec AI, Publish stats, get cited (vantage)
  url: https://peec.ai/blog/publish-stats-get-cited-the-tactic-that-put-my-data-all-over-the-web
  date: 07-10-2026
- label: 'Aggarwal et al., GEO: Generative Engine Optimization, arXiv 2311.09735 (method
    definition)'
  url: https://arxiv.org/abs/2311.09735
  date: 16-11-2023
- label: 'Trakkr Research, Zombie Stats: where the numbers AI quotes come from (method)'
  url: https://trakkr.ai/trakkr-research/zombie-stats
  date: 28-10-2026
contentHash: sha256:703728cb37697b55
publishState: published
---


À mon avis, vérifier que la page citée contient le chiffre laisse passer une statistique blanchie, tout comme remonter jusqu'à la première page crédible qui la cite. Trakkr Research a posé à cinq assistants IA 200 questions qui appellent un chiffre [s21], recherche web activée [s20], puis a remonté la piste d'un échantillon aléatoire de 1 285 statistiques citées [s14]. D'après Trakkr, la page citée par un assistant contenait le chiffre dans 82 % des cas [s16], alors que 40 % des statistiques remontées aboutissaient à une étude qui dit la même chose [s15]. Selon moi, cet écart expose le mode d'échec : un contrôle d'inclusion à un seul saut certifie une copie fidèle, et une remontée qui s'en remet à la première source crédible certifie une copie blanchie.

## Ce que contient la page citée

Les deux chiffres tiennent ensemble parce qu'ils ne notent pas la même étape. Le contrôle d'inclusion, celui que pratique un contrôle d'ancrage (grounding) à un seul saut, juge la copie, et il ne dit rien de l'endroit d'où elle vient. Trakkr rapporte que seulement 21 % des pages citées pour un chiffre étaient la recherche d'origine [s17]. Son étude ajoute que les pages que cite l'IA sont surtout des blogs et des compilations qui répètent un chiffre [s22] ; elle prévient d'ailleurs les éditeurs que la page citée pour leurs chiffres est souvent une compilation ou un blog qui les a copiés, parfois avec un chiffre plus ancien [s23]. Trakkr relève aussi que 8 % de plus des statistiques remontées aboutissaient à l'étude avec un chiffre ou un contexte modifié en chemin [s15]. À mon sens, un contrôle d'inclusion sur une telle copie passe quand même.

Le billet de Peec AI aborde le même échec par un cas distinct. Son auteur écrit depuis une entreprise où l'on parle de GEO et de SEO tous les jours [s1], et le billet nomme le phénomène citation laundering, autrement dit blanchiment de citations [s30]. Le premier jour, raconte le billet, un faux chiffre de son site n'avait aucune autorité ; puis un article universitaire l'a cité, puis une banque, si bien que la prochaine personne ou le prochain modèle qui le trouve voit une statistique avec une source [s24]. Le billet ajoute que chaque citation a rendu les fausses données plus dignes de confiance en apparence [s25].

Selon moi, cette chaîne fabrique précisément les pages sur lesquelles une remontée s'arrête. Un article universitaire a l'air d'une origine. Une banque aussi.

## Des chiffres faits pour être récupérés

Le chiffre au bout de cette chaîne a été produit en une journée, et cette vitesse compte pour quiconque récupère des pages au moment de répondre. Environ 7 mois avant le billet, son auteur a lancé un site web de 50 000 statistiques [s2], toutes fausses de son propre aveu [s3]. L'auteur a acheté un domaine tout neuf, stateglobe.com, et généré 50 000 pages de statistiques en une seule journée avec GPT-4.1 [s4] ; d'après le billet, chaque chiffre était entièrement inventé [s5].

Sur ce site, à mon sens, la visibilité dans Google et les lectures en direct ont divergé. Deux mises à jour de Google sont sorties juste après le lancement, et la visibilité de l'auteur sur Google s'est effondrée [s6]. Or, sur les 30 derniers jours, rapporte le billet, le site a encore reçu plus de 600 000 requêtes de bots [s7], dont environ 72 000 venaient de ChatGPT-User [s8], l'agent qu'utilise ChatGPT pour ouvrir une page en temps réel pendant qu'il répond à quelqu'un [s9]. Le billet y voit, à chaque fois, ChatGPT qui récupère une fausse page de statistiques pour répondre à une vraie question [s10]. J'en tire une leçon étroite : une page que Google ne met plus en avant continue d'être lue par la recherche en direct, et une visibilité effondrée dans Google ne protège en rien un pipeline qui récupère ses pages pendant qu'il répond.

L'incitation va dans le même sens. Aggarwal et al. [s29] définissent Statistics Addition comme le fait de modifier un contenu pour y inclure des statistiques quantitatives à la place d'une discussion qualitative [s11]. Leurs méthodes les plus performantes, dont Statistics Addition, ont obtenu une amélioration relative de 30 à 40 % sur Position-Adjusted Word Count et de 15 à 30 % sur Subjective Impression [s12], et les auteurs précisent qu'elles demandent des modifications minimes [s13]. À mon sens, un moteur génératif récompense une page parce qu'elle porte des chiffres. Je m'attends donc à voir plus de pages chargées de chiffres sans aucune étude derrière ; c'est une prévision personnelle, et aucune source citée ici ne la mesure.

## Pourquoi la recherche garde le chiffre

Le côté recherche explique pourquoi la copie survit jusqu'à la réponse. Le billet de Peec AI décrit un contenu ancré dans la recherche comme tenu par un budget serré en latence et en coût : le système récupère quelques pages, extrait les passages pertinents et commence à écrire [s26]. Il s'appuie sur des rerankers qui notent la pertinence et laissent la vérité de côté, si bien qu'un passage qui correspond à la requête et semble faire autorité est utilisé [s27]. Trakkr en tire la leçon qu'une citation indique où l'IA a trouvé un chiffre, et laisse ouverte la question de son origine [s18].

À mon avis, cette leçon s'arrête une marche trop tôt. Une remontée qui part de la page citée et accepte la première page d'apparence sérieuse qui cite le chiffre hérite de l'angle mort du reranker, car l'autorité est justement la propriété que fabrique la chaîne de blanchiment. Tout se joue sur la condition d'arrêt. La réputation y répond mal.

> [!WARNING]
> Le mode d'échec, c'est une remontée qui s'arrête sur un article universitaire ou un rapport de banque parce qu'il a l'air d'une origine. À mon sens, une page qui cite tient son autorité de la chaîne même qui a blanchi le chiffre.

## La règle d'arrêt que je retiendrais

> [!CONFIRMED]
> Le billet de Peec AI : un faux chiffre sans aucune autorité le premier jour a été cité par un article universitaire, puis par une banque, et le lecteur suivant voit une statistique avec une source [s24].

> [!INFERRED]
> À mon sens, la remontée ne s'arrête qu'à une page qui dit comment le chiffre a été produit, et tout autre chiffre part avec l'étiquette secondaire. Un article ou une banque qui cite le chiffre m'apprend où il est apparu, sans rien dire de sa production ; aucune de ces deux pages ne vaut donc comme point d'arrêt.

Concrètement, j'ajoute un champ de provenance par chiffre cité, avec deux valeurs. Un chiffre n'est primaire que si l'enregistrement conserve un extrait de la page porteuse qui dit comment il a été produit, rangé à côté du chiffre pour qu'un lecteur puisse le vérifier. Tout le reste part en secondaire.

```python
from dataclasses import dataclass
from enum import Enum


class Provenance(Enum):
    PRIMARY = "primary"
    SECONDARY = "secondary"


@dataclass(frozen=True)
class QuotedFigure:
    value: str
    carrying_url: str
    method_statement: str | None

    @property
    def provenance(self) -> Provenance:
        if self.method_statement:
            return Provenance.PRIMARY
        return Provenance.SECONDARY
```

L'étiquette se déduit d'un seul champ stocké : elle ne coûte rien à calculer et s'audite facilement après coup.

Appliquée aux sources de cet article, la règle les trie vite. Les chiffres de Trakkr sont primaires pour ce que Trakkr a mesuré, puisque sa page décrit l'échantillon [s14] et le panel [s20]. Le billet de Peec AI est lui-même la page qui dit comment ses 50 000 chiffres ont été faits : générés en une seule journée avec GPT-4.1 [s4]. Selon la règle, ce billet est la source primaire du fait qu'ils ont été générés, et l'extrait stocké le dit en toutes lettres, ce qui permet justement au lecteur de les écarter. Quant aux chiffres de trafic, ils viennent de l'auteur sur son propre site, et je les étiquette comme tels.

La règle ne certifie pas qu'un chiffre est vrai. Une page peut décrire une méthode qu'elle n'a jamais appliquée, et un site qui a généré 50 000 pages de statistiques en une seule journée [s4] pourrait tout aussi bien inventer des méthodes. Ce qu'elle apporte est plus modeste : une déclaration vérifiable à la place d'une réputation supposée, et aucun statut primaire pour une page qui ne fait que citer.

À mon sens, les quatre options se comparent ainsi :

| Contrôle | Où il s'arrête | Chaîne blanchie | Coût par chiffre |
| :--- | :--- | :--- | :--- |
| Contrôle d'inclusion | La page citée par le modèle | Acceptée | Une récupération |
| Première page crédible qui cite | Un article universitaire ou une banque | Acceptée | Une remontée en plusieurs sauts |
| Déclaration de production | Une page qui dit comment le chiffre a été produit | Pages qui ne font que citer, rejetées | Une remontée, puis une lecture |
| Étiquette secondaire | Nulle part | Étiquetée secondaire | Un champ |

## L'objection du coût

L'objection la plus solide porte sur le coût, et elle mérite d'être posée honnêtement. Les données de Trakkr montrent que l'étape de copie est le plus souvent fidèle : la page citée contenait le chiffre dans 82 % des cas [s16]. Remonter une piste se prête d'ailleurs mal à l'automatisation. Trakkr rapporte que des personnes ont trouvé des originaux que son modèle avait manqués, et qu'avec le modèle seul 23 % des statistiques étaient sourcées [s19]. Le billet de Peec AI soutient que sur des milliards de prompts envoyés par des millions d'utilisateurs, la vérification serait trop lente et trop chère pour un usage pratique [s28].

Les deux éditeurs travaillent dans la visibilité en recherche IA. Le site de Trakkr présente Visibility comme un score quotidien sur 8 modèles d'IA [s31], et le billet de Peec AI vient d'une entreprise où l'on parle de GEO et de SEO tous les jours [s1]. Je lis les chiffres de chacun avec cet intérêt en tête, et je les conserve.

Pour un assistant grand public qui répond à cette échelle, j'accepte l'objection. En revanche, selon moi, elle tombe pour un pipeline de recherche qui publie une poignée de chiffres. Là, la valeur par défaut est l'étiquette secondaire : un champ par chiffre, et aucune remontée. On ne remonte que les quelques chiffres qui méritent d'être présentés comme primaires, et c'est l'auteur qui fixe ce budget. Les 82 % [s16] notent l'étape de copie. Or une copie fidèle d'un chiffre blanchi reste blanchie. Les 23 % [s19] plaident pour l'étiquette, puisqu'elle n'exige aucune remontée.

Ce champ coûte donc une ligne par chiffre, et c'est la ligne que je voudrais lire avant de citer n'importe lequel d'entre eux.
