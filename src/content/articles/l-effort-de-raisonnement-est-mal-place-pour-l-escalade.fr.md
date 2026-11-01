---
translationKey: reasoning-effort-switches-and-tool-edits-break-the-agent-prefix-cache
lang: fr
slug: l-effort-de-raisonnement-est-mal-place-pour-l-escalade
title: L'effort de raisonnement est mal placé pour l'escalade
publishDate: 01-11-2026
tags:
- agents
- agentic-coding
category: essays
difficulty: 4
sources:
- label: Neuralwatt, Why harnesses matter for energy efficiency (cause of breaks)
  url: https://neuralwatt.com/news/why-harnesses-matter-for-energy-efficiency
  date: 16-10-2026
- label: OpenCodex issue 6895, keep the Anthropic prompt cache across reasoning effort
    changes (goal)
  url: https://github.com/lidge-jun/opencodex/issues/6895
  date: 10-10-2026
- label: 'Manus, Context Engineering for AI Agents: Lessons from Building Manus (single-token
    difference)'
  url: https://manus.im/blog/Context-Engineering-for-AI-Agents-Lessons-from-Building-Manus
  date: 18-07-2025
contentHash: sha256:0e472b585c459513
publishState: published
---


Relever l'effort de raisonnement en cours de session est, je pense, un bug de placement : le réglage d'effort se trouve avant l'historique qu'il est censé gouverner. Neuralwatt [s14] indique que les templates de chat de GLM-5.3 et de DeepSeek V4.1 écrivent le niveau d'effort dans les tout premiers tokens du prompt [s2], et que la première différence apparaissait au token 8 sur les deux modèles : un changement fait donc tout relire [s3]. Une issue d'OpenCodex décrit un symptôme analogue sur un modèle Claude à réflexion adaptative, atteint via l'adaptateur Anthropic [s26] : les lectures en cache s'arrêtent au premier message utilisateur, et tout ce qui le suit est réécrit à chaque changement d'effort [s18]. Selon moi, quand le harness (le programme qui pilote l'agent) relève l'effort après une tentative ratée, la conversation est facturée de nouveau sur les deux routes. Le conseil habituel, figer l'effort pour la session, sacrifie l'escalade qui justifie l'effort adaptatif, et je pense que le correctif relève du template et de l'API.

## La ligne d'effort passe avant l'historique

Je lis les deux rapports comme deux mécanismes pour une seule facture. Sur les templates open-weight, l'effort est une ligne placée près du début du prompt ; sur la seconde route, c'est un réglage de premier niveau qu'une règle du fournisseur, d'après l'issue, lie au cache des messages.

Seule cette valeur change, précise Neuralwatt [s14], et sa longueur comme tout ce qui la suit restent identiques [s35]. À mon sens, le serveur recalcule une conversation dont pas un octet n'a bougé après la valeur d'effort.

L'issue d'OpenCodex affirme que le projet ne touche pas au préfixe et attribue l'échec de cache à une règle amont : changer l'effort de premier niveau invalide le cache des messages [s17]. Elle ajoute que les corps des requêtes n'ont pas été conservés : la cause exacte n'a pas été prouvée par comparaison octet par octet [s21].

Neuralwatt rapporte que, dans ses tests en laboratoire, chaque rupture de cache venait d'un harness qui modifiait ce qu'il avait déjà envoyé, ce qui forçait une relecture à partir de la première différence [s1]. Manus avait formulé la règle générale plus tôt : même une différence d'un seul token peut invalider le cache à partir de ce token [s22].

La règle est ancienne. Ce qui change la facture, à mon sens, c'est la valeur placée en tête du prompt, et qui la possède.

## L'escalade tombe là où la relecture coûte le plus

L'escalade que nomme l'issue d'OpenCodex suit une tentative ratée [s26], ce qui, selon mon expérience, veut dire tard dans la session.

D'après les chiffres de Neuralwatt [s14], changer la liste d'outils ou le niveau d'effort rend une rupture de cache plus de 20 fois plus probable et coûte en moyenne environ 40 % du prompt précédent [s4].

Au-delà de 128k tokens de contexte, environ 3 tours sur 1 000 relisent de zéro plus de la moitié du prompt [s9]. Un tour normal à cette profondeur ajoute une médiane d'environ 370 nouveaux tokens, donc un seul de ces tours coûte autant de prefill qu'environ 600 tours ordinaires [s10]. Je lis ce chiffre comme le prix de toute relecture profonde, quelle qu'en soit la cause. Neuralwatt le dit sans détour : modifier une fois le début du prompt, tôt, coûte peu ; le faire au tour 200 d'une longue session provoque une pause longue et visible et un coût énergétique élevé [s34].

Servie en grande partie hors cache, une requête consomme à peu près deux fois l'énergie d'une requête en cache de même taille, rapporte Neuralwatt [s11].

À mon sens, sur les deux templates qui écrivent l'effort en tête, chaque changement d'effort touche le début du prompt : une escalade tardive paie donc le prix tardif que décrit Neuralwatt. Le réglage ne coûte rien tant que personne n'en a besoin.

## Figer l'effort revient à renoncer à l'escalade

Aux utilisateurs de harness, Neuralwatt [s14] conseille de choisir un effort par session [s29] et de fixer les réglages comme l'effort, les serveurs MCP et les skills avant que la session ne s'allonge, moment où, selon lui, une rupture de cache fait le plus mal [s30].

Pour l'instant, l'issue d'OpenCodex maintient l'effort constant pendant toute la conversation [s19]. Ses deux autres contournements se paient autrement : ouvrir un nouveau fil lors d'une escalade fait perdre le contexte et réécrit tout le prompt [s40], et retirer le raisonnement rejoué préserve le cache et sacrifie la continuité de la réflexion [s20].

Son objectif déclaré est de changer d'effort en cours de conversation sans payer de nouveau l'écriture en cache de tout l'historique [s16]. Je lis l'effort figé comme un pis-aller que l'issue elle-même veut abandonner. Je pense que figer l'effort supprime la raison d'être de l'effort adaptatif.

## La règle d'ajout s'arrête avant l'effort

Neuralwatt donne déjà la règle aux auteurs de harness [s14] : ajouter les nouveaux messages et les résultats d'outils à la fin de la conversation, et y décrire aussi les changements de réglages, sans toucher au texte antérieur [s43]. Dans sa capture en laboratoire, chacune des requêtes de suivi de deepseek-harness était un pur ajout à la précédente [s32]. Ce harness place l'état qui change après l'historique : quand la politique d'approbation ou les skills changent, il ajoute un court instantané indiquant qu'il remplace les précédents [s42].

Sur les deux templates mesurés par Neuralwatt, c'est le template lui-même qui écrit la ligne d'effort [s2][s3]. À mon sens, la règle des auteurs de harness n'atteint pas une ligne que le harness ne possède pas ; voilà pourquoi le conseil de Neuralwatt aux utilisateurs se replie sur un effort fixe.

L'issue d'OpenCodex propose de conserver le préfixe en cache lors des changements d'effort en cours de conversation, sur les modèles qui prennent en charge l'effort par message d'Anthropic [s38]. Elle réinsérerait chaque point de changement antérieur à la même position dans les requêtes suivantes, pour que le préfixe reste identique octet pour octet [s39]. Elle n'a pas encore mesuré si les blocs d'outils et de système restent en cache au tour où l'effort change, l'expérience n'ayant pas d'outils [s41].

> [!CONFIRMED]
> Neuralwatt [s14] demande aux auteurs de harness d'écrire les changements de réglages en fin de conversation [s43]. L'issue d'OpenCodex propose l'effort par message d'Anthropic pour garder le préfixe en cache [s38].

> [!INFERRED]
> Selon moi, un changement d'effort a sa place dans la transcription, ajouté au tour où il prend effet, comme tout autre changement d'état. Un template qui place l'effort dès ses premiers tokens est le réglage par défaut que je changerais, car le harness ne peut pas déplacer cette ligne.

## D'ici là, chiffrer l'escalade selon la pile

Je pense que, d'ici là, tant qu'aucun template n'offre cet emplacement et que la proposition d'OpenCodex reste à mesurer avec des outils, une escalade a un prix, qui dépend de la pile.

Revenir à l'effort précédent a donné de 10.6k à 27.5k tokens lus en cache dans les essais de Neuralwatt [s14], si bien qu'une bascule coûte une relecture complète la première fois que chaque nouvel état sert [s28].

Sur la route Claude mesurée par l'issue d'OpenCodex [s26], chaque changement d'effort réécrit tout ce qui suit le premier message utilisateur, où s'arrêtent les quelque 11.6k tokens lus en cache [s18].

Côte à côte, les deux rapports chiffrent ainsi un changement d'effort :

| | Templates open-weight, laboratoire de Neuralwatt [s14] | Claude via l'adaptateur Anthropic, issue d'OpenCodex [s26] |
| :--- | :--- | :--- |
| Où l'effort se place | Dans les tout premiers tokens [s2] ; première différence au token 8 [s3] | Un réglage de premier niveau ; les lectures s'arrêtent au premier message utilisateur [s18] |
| Prix d'une bascule | Une relecture complète la première fois que chaque nouvel état sert [s28] | Historique après le premier message utilisateur réécrit à chaque changement [s18] |
| Cause | Une modification du harness dans chaque rupture en laboratoire [s1] | Une règle amont [s17], non prouvée par comparaison octet par octet [s21] |
| Question ouverte | Réutilisation côté serveur après une petite modification en tête, encore à l'étude [s31] | Blocs d'outils et de système au tour du changement, pas encore mesurés [s41] |

Sur une pile comme celle de Neuralwatt, une politique à deux niveaux (un effort de base, une escalade) paie une relecture par nouveau niveau ; je laisserais donc libre le retour à la base. Sur la seconde route, chaque changement se paie : je compterais chacun dans le budget de la session et je n'escaladerais qu'une fois, et seulement après un échec. Les points que l'issue laisse ouverts bornent cette seconde règle.

```python
from enum import Enum


class EffortCache(Enum):
    KEEPS_EARLIER_PREFIXES = "keeps-earlier-prefixes"
    REWRITES_ON_EVERY_CHANGE = "rewrites-on-every-change"


def effort_change_rereads_history(
    stack: EffortCache, levels_used: frozenset[str], new_level: str
) -> bool:
    if stack is EffortCache.REWRITES_ON_EVERY_CHANGE:
        return True
    return new_level not in levels_used
```

La fonction résume la règle de budget que je mettrais dans un harness avant qu'il relève l'effort.

## La liste d'outils obéit à la même règle

Je pense qu'une liste d'outils mérite le même prix, puisque c'est le second élément d'état placé près du début.

Dans les données de Neuralwatt [s14], OpenCode 1.x et Kilo Code insèrent les nouveaux outils par ordre alphabétique, au milieu de la liste [s6], alors qu'OpenCode 2.x laisse la liste intacte et ajoute une note : la connexion comme la déconnexion étaient de purs ajouts [s7]. Selon ses chiffres, les changements de liste d'outils touchent environ 0.5 % des tours et représentent 19 % de tous les tokens relus sur ces modèles [s5] ; trois comptes en concentrent environ les deux tiers, et l'effet par tour se vérifie chez tous les autres [s27].

Manus énonce une règle tirée de ses expériences : sauf nécessité absolue, éviter d'ajouter ou de retirer dynamiquement des outils en cours d'itération [s23]. Dans la plupart des LLM, explique Manus, les définitions d'outils se trouvent près du début du contexte, et toute modification invalide donc le KV-cache pour la suite [s24]. Manus gère la disponibilité des outils avec une machine à états sensible au contexte et masque les logits des tokens pendant le décodage [s25].

À mon sens, OpenCode 2.x ajoute une note et Manus masque au décodage : les deux gardent le début du prompt fixe, geste qui manque encore à l'effort.

> [!TIP]
> L'élagage est lui aussi une modification. Neuralwatt [s14] indique qu'omp élague les résultats d'outils « sans événement » et, après 90 minutes d'inactivité, à n'importe quelle profondeur ; régler `compaction.supersedeReads: false` et `compaction.dropUseless: false` préserve le cache [s8].

## Les objections

L'objection la plus forte tient à l'échelle. Neuralwatt [s14] rapporte que les trois quarts restants des tokens relus surviennent sur des tours où ni l'effort ni le nombre d'outils n'ont changé [s33]. Côté serveur, Neuralwatt ne distingue pas toujours une modification du prompt par le harness d'une éviction du cache sous pression mémoire [s13]. Il ajoute qu'OpenCode 2.x corrige en laboratoire la plupart des ruptures de cache de la 1.x, sans que la différence apparaisse en production, pour des raisons qu'il ignore encore [s12].

La deuxième objection disculpe le template. Neuralwatt rapporte aussi qu'aucune de ses ruptures en laboratoire ne venait de ses templates de chat [s44]. Sur l'autre route, la cause avancée par OpenCodex n'est elle-même pas prouvée [s21].

Reste l'intérêt en jeu. Neuralwatt facture à l'énergie mesurée, donc il voit le coût directement [s36], et Session Insights, dans son tableau de bord, montre chaque session d'agent tour par tour [s37]. Je lis ses chiffres avec cet intérêt en tête, et je les retiens.

Neuralwatt veut étudier des moyens pour que le serveur réutilise le travail en cache après une petite modification près du début du prompt, comme la ligne d'effort ou la date [s31].

La dernière objection est la mienne : un effort plus élevé après un échec peut valoir une relecture, quel qu'en soit le coût.

Je concède l'objection d'échelle pour le trafic agrégé et pour les sessions courtes. Sur l'innocence du template, je pense que les deux affirmations tiennent : le harness fait le changement, et le template décide de la part du prompt qu'il coûte, ce qu'aucun concepteur de harness ne peut contourner. Quant au correctif côté serveur, un harness branché sur une API fermée n'y peut rien. Sur la qualité, je suis d'accord, et c'est pourquoi je chiffre l'escalade et je la garde. Pour les sessions longues, je maintiens la règle : les changements d'effort et de liste d'outils sont des ruptures que le harness choisit de provoquer, et Neuralwatt rapporte qu'ils rendent une rupture de cache plus de 20 fois plus probable [s4].

Je garde donc l'effort adaptatif, et je fais apparaître chaque escalade dans le budget avant qu'elle n'apparaisse sur la facture.
