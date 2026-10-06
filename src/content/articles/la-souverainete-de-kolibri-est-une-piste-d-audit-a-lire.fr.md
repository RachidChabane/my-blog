---
translationKey: kolibri-tokenizer-is-the-sovereign-model-cost-lever
lang: fr
slug: la-souverainete-de-kolibri-est-une-piste-d-audit-a-lire
title: La souveraineté de Kolibri est une piste d'audit qu'il faut lire
publishDate: 06-10-2026
tags:
- llm-oss
category: essays
difficulty: 3
sources:
- label: Aleph Alpha blog, Kolibri release, architecture
  url: https://aleph-alpha.com/en/blog/kolibri-has-landed-a-sovereign-open-weight-model
  date: 03-10-2026
- label: tej.as, independent Kolibri tokenizer measurement on legal German
  url: https://tej.as/blog/aleph-alpha-kolibri
  date: 03-10-2026
- label: Aleph Alpha Kolibri-1 model card, synthetic data policy
  url: https://huggingface.co/Aleph-Alpha/Kolibri-1
  date: 06-10-2026
contentHash: sha256:a61e8f113a548e2f
publishState: published
---


Le label souverain de Kolibri promet une chaîne d'approvisionnement tracée et la liberté de déployer ; il ne promet pas, à mon sens, un corpus vierge de tout modèle extérieur. Aleph Alpha le formule avec précision : l'éditeur revendique une chaîne d'approvisionnement maîtrisée et documentée de bout en bout [s7], et ses clients disposent d'une entière liberté de déploiement [s8]. L'éditeur destine le modèle à des travaux souverains et critiques dans des secteurs réglementés [s4]. La fiche du modèle, elle, nomme les modèles extérieurs qui ont reformulé le texte d'entraînement [s3] [s11] [s12]. Si vous achetez Kolibri pour tenir les modèles extérieurs à l'écart de votre lignée de données, le label n'est pas le bon document à lire.

## La souveraineté telle qu'Aleph Alpha la définit

En réunion d'achat, souverain est un mot lourd, et chaque acheteur y loge une exigence qui lui est propre. Mieux vaut partir de la définition de l'éditeur, plus étroite que le mot et bien plus utile. Pour Aleph Alpha, la souveraineté combine deux dimensions : la façon dont le modèle a été construit et la façon dont il est transmis aux clients [s6]. Côté construction, l'éditeur revendique une chaîne d'approvisionnement maîtrisée et documentée de bout en bout et dit rendre compte de chaque décision, de l'ingestion des données au pré-entraînement et au post-entraînement, jusqu'aux évaluations finales [s7]. Côté transmission, Aleph Alpha promet à ses clients une entière liberté de déploiement et une protection juridique en matière de propriété intellectuelle, si bien que la conformité devient une propriété héritée du modèle [s8].

L'ingestion ouvre la liste des décisions dont l'éditeur rend compte : la promesse couvre donc bien le corpus, et prétendre le contraire serait trahir le billet de lancement. Sur le corpus, elle fournit un registre : ce qui a été fait, par qui, à quelle étape. Rien dans la définition n'engage l'éditeur à tenir chaque modèle extérieur loin du texte, et un lecteur attentif n'a pas à tirer cet engagement du seul mot.

La promesse, c'est une piste d'audit.

## Gemma 4 et Mistral-NeMo dans le pipeline de données

Une piste d'audit ne vaut que si quelqu'un la lit, et c'est dans la fiche du modèle que celle-ci devient précise. La fiche indique que le Common Crawl anglais dédupliqué a été reformulé avec Gemma-4-26B-A4B selon une recette de type Nemotron-CC [s12]. Toujours d'après la fiche, les reformulations synthétiques en allemand de données web ont été produites avec Mistral-NeMo-12B [s11]. Qwen3-32B y figure aussi : la fiche décrit des annotations de type LLM-as-a-judge produites avec ce modèle sur un échantillon aléatoire du Common Crawl anglais, qui ont servi de données d'entraînement aux classifieurs de qualité de texte [s13]. La fiche précise aussi comment ces modèles ont été choisis : les données synthétiques ont été générées avec des LLM sous licence permissive [s10]. Un lecteur extérieur qui reprend la fiche arrive aux trois mêmes noms et précise que Gemma est le modèle de Google [s3].

L'éditeur avait promis ce registre [s7] ; le voici, décisions comprises, avec le nom et la taille des modèles. C'est une bonne pratique, et j'aimerais que les autres éditeurs de modèles à poids ouverts s'y tiennent. Or c'est précisément sur cette page qu'un acheteur qui ne voulait aucun modèle extérieur dans sa lignée de données en trouve trois, nommément.

La fiche énonce une règle de licence et, selon moi, celle-ci sert le volet propriété intellectuelle de la promesse de l'éditeur [s8]. Une licence permissive dit si vous pouvez utiliser ce qu'un modèle a produit. Où ce modèle a été entraîné, et par qui, relève d'une autre question, à laquelle la licence ne répond pas. Un acheteur dont la règle porte sur l'origine doit l'appliquer à chaque modèle nommé.

> [!CONFIRMED]
> La fiche du modèle indique que les données web allemandes ont été reformulées avec Mistral-NeMo-12B [s11], le Common Crawl anglais avec Gemma-4-26B-A4B [s12], et que des annotations de Qwen3-32B ont entraîné les classifieurs de qualité de texte [s13].

> [!INFERRED]
> Deux des trois modèles nommés par la fiche ont, selon moi, façonné la formulation du corpus, et le troisième a pesé sur ce que les classifieurs ont gardé.

## L'objection la plus solide

La meilleure objection à ma lecture vient de la description qu'Aleph Alpha donne de sa propre méthode. L'éditeur dit avoir reformulé des documents allemands dont il disposait déjà : un LLM réécrit un document allemand d'origine sous la forme d'une entrée d'encyclopédie, d'un dialogue questions-réponses ou d'un passage de texte, en préservant son contenu [s9]. Sous cet angle, la lignée reste allemande et le modèle extérieur n'a touché qu'à la formulation. Ajoutez la promesse de traçabilité de l'éditeur [s7], et le fait même que les générateurs figurent dans la fiche du modèle [s3] : la chaîne d'approvisionnement est alors exactement aussi souveraine qu'annoncé. L'argument est sérieux, et il tient en partie.

Ma réponse commence par la forme : un modèle apprend la formulation autant que les faits. Le générateur qui a écrit les phrases sur lesquelles il s'entraîne pose une question de lignée à part entière, car le style, les tournures et l'allure d'une bonne réponse passent tous par la reformulation. Une règle d'achat qui exige « aucun modèle tiers dans le pipeline de données » échoue donc sur la fiche du modèle, même quand chaque fait du texte reformulé vient d'un original allemand.

La sélection pose un problème plus discret. D'après la fiche, des annotations de Qwen3-32B ont servi de données d'entraînement aux classifieurs de qualité de texte [s13]. Un classifieur de qualité décide des documents qui restent dans un corpus ; un modèle extérieur a donc, je pense, pesé sur ce qui a été gardé autant que sur la manière dont c'était formulé.

C'est ici que l'objection marque un point. Deux exigences se cachent sous un seul mot. La première est une lignée auditable : on voit ce qui est entré dans le modèle et qui l'a décidé. Kolibri y satisfait, et c'est la divulgation qui le lui permet. La seconde est une lignée sans aucun générateur extérieur. Kolibri n'y satisfait pas, et sa propre documentation le montre à quiconque lit la section sur les données. Une équipe attachée à la première exigence peut signer ; une équipe attachée à la seconde s'était fiée au label. Quelle que soit votre exigence, écrivez-la dans le contrat : un contrat qui ne dit que « souverain » sera, je le crains, interprété selon la définition de l'éditeur, la seule que quiconque ait couchée sur le papier.

> [!WARNING]
> Le mode de défaillance que j'anticiperais : une grille d'achat validée sur le mot souverain, puis un audit qui échoue sur la fiche du modèle.

## Le coût, mesuré une seule fois

Si l'on choisit Kolibri pour des raisons pratiques, le coût est, je pense, l'argument le plus solide. Selon Aleph Alpha, la part de 21 % d'allemand dans ses données explique une compression de l'allemand supérieure à celle des autres modèles de pointe [s5]. Un comptage extérieur sur de l'allemand juridique a montré que Kolibri produisait 15 % de tokens en moins que le tokenizer de GPT-5, et que les deux étaient à égalité en anglais [s2]. L'architecture va dans le même sens : selon Aleph Alpha, Kolibri est un Transformer anglais-allemand à mélange d'experts de 78 milliards de paramètres au total, dont 3 milliards actifs [s1], ce qui, je pense, rapproche le calcul par token de celui d'un petit modèle bien plus que sa taille totale ne le laisse croire. Moins de tokens par document allemand, c'est moins de dépense pour le même travail et plus de place dans chaque requête.

Le détail à ne pas négliger, c'est l'égalité en anglais. L'économie ne porte que sur la part allemande de votre trafic : une charge mixte en verra moins que ce chiffre, une charge surtout anglophone presque rien. Il s'agit en outre d'un seul comptage, sur un seul domaine. L'allemand juridique n'est qu'un type de texte parmi d'autres, et le résultat ne s'étend pas aux tickets de support, aux transcriptions de chat ou aux commentaires de code en allemand.

Dans le tableau ci-dessous, la colonne de droite est ma propre lecture ; les trois autres viennent des sources.

| Propriété | Selon la source | Où c'est documenté | À vérifier |
| --- | --- | --- | --- |
| Qui l'a construit | construit par l'éditeur, chaque décision tracée [s6][s7] | billet de lancement | le registre de décisions derrière cette promesse |
| Où il tourne | entière liberté de déploiement [s8] | billet de lancement | vos propres contraintes d'hébergement |
| Influences sur le corpus | reformulation par Gemma 4 et Mistral-NeMo, annotations de Qwen3-32B pour les classifieurs de qualité [s3][s11][s12][s13] | fiche du modèle | votre règle d'achat face à cette liste |
| Coût en tokens de l'allemand | 15 % de tokens en moins que le tokenizer de GPT-5 sur l'allemand juridique, égalité en anglais [s2] | un seul comptage extérieur | un comptage sur vos propres documents |

## Mes vérifications avant de signer

Avant d'inscrire Kolibri au budget, je relancerais le comptage sur mes propres documents avec un script de ce genre, en séparant fichiers allemands et anglais.

```python
from pathlib import Path

from transformers import AutoTokenizer

CANDIDATE = "<kolibri-tokenizer-repo>"
BASELINE = "<your-current-tokenizer-repo>"
SAMPLE_DIR = Path("<dossier de vos propres documents allemands et anglais>")


def count_tokens(repo_id, texts):
    tokenizer = AutoTokenizer.from_pretrained(repo_id)
    return sum(len(tokenizer.encode(text)) for text in texts)


for pattern in ("*.de.txt", "*.en.txt"):
    # Un total par langue : l'économie dépend de votre part d'allemand.
    texts = [path.read_text() for path in SAMPLE_DIR.glob(pattern)]
    candidate = count_tokens(CANDIDATE, texts)
    baseline = count_tokens(BASELINE, texts)
    print(pattern, candidate, baseline, candidate / baseline)
```

La vérification de la lignée, elle, se passe de code. Ouvrez la section sur les données de la fiche du modèle, listez chaque modèle qui a reformulé, annoté ou filtré quoi que ce soit, et confrontez cette liste à la règle que votre organisation a réellement écrite. Si cette règle porte sur la traçabilité, Kolibri vous fournit les pièces. Si elle porte sur l'origine, les mêmes pièces vous disent quels modèles il vous reste à examiner.

> [!NOTE]
> Prenez des documents issus des charges que vous enverrez réellement, puis pondérez les deux ratios par votre part réelle d'allemand avant de croire à une économie.
