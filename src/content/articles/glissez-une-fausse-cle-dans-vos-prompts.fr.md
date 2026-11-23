---
translationKey: prompt-leaks-went-around-the-privacy-flag
lang: fr
slug: glissez-une-fausse-cle-dans-vos-prompts
title: Glissez une fausse clé dans vos prompts
publishDate: 23-11-2026
tags:
- agents
- llm-oss
category: essays
difficulty: 3
sources:
- label: 'Dragos, Three breaches, endless leaks: Your AI supply chain needs canaries:
    We found attackers actively stealing data'
  url: https://www.dragos.com/blog/ai-supply-chain-security-canary-tokens
  date: 19-11-2026
- label: 'Phala, November Preliminary Incident Report: The attacker used a similar
    access'
  url: https://phala.com/posts/phala-november-preliminary-incident-report
  date: 10-11-2026
- label: 'Together AI, Security event: Prompt leakage for requests in June and July
    of 2026: As part of routine software testing'
  url: https://www.together.ai/blog/security-event-prompt-leakage-for-requests-in-june-and-july-of-2026
  date: 21-11-2026
- label: 'OpenRouter, Data Processing Incidents on Inference Providers: Removed 125
    endpoints from Zero Data'
  url: https://openrouter.ai/blog/announcements/data-processing-incidents-on-inference-providers/
  date: 22-11-2026
contentHash: sha256:49ca13d36ad4fe95
publishState: published
---


Glissez une fausse clé dans les prompts que vous envoyez aux modèles hébergés, et considérez comme un voleur quiconque l'essaie. C'est comme ça que les récents vols de prompts ont été mis au jour. La société de sécurité Dragos a surpris des attaquants en train de voler des données chez trois hébergeurs différents [s1], et un chercheur extérieur a montré à l'hébergeur Phala que des requêtes envoyées à l'un de ses modèles avaient fuité [s29].

## Copié dès l'entrée

Une option de confidentialité n'engage que le premier maillon, le service à qui vous confiez la requête [s4], et un réglage de rétention ne couvre que ce que ce service conserve. Or les prompts volés ont été copiés sur des requêtes en cours, avant que l'un ou l'autre ait son mot à dire. Une partie des clés volées venait même de requêtes que le fournisseur avait rejetées avant qu'un modèle ne tourne [s3], et dans deux des brèches, le butin comprenait des requêtes envoyées avec le ZDR activé [s2].

Quand j'ai écrit ici sur Fireworks, la question portait sur ce qu'un fournisseur garde au repos, et pendant combien de temps. Chez Phala, elle n'aurait servi à rien. L'attaquant contrôlait la VM d'inférence, si bien que les données des requêtes étaient lisibles pendant leur traitement [s9]. C'était un nouveau serveur GPU, qui servait du trafic de production sans avoir été entièrement durci [s30].

Together AI conseille aux clients qui traitent des prompts sensibles d'activer le ZDR dans les paramètres de leur compte [s33]. Pour sa propre fuite, le conseil est bon. Ce qui est parti de chez elle, ce sont des échantillons de prompts stockés pour des tests de routine dans un dépôt Hugging Face privé [s14], et le ZDR porte justement sur ce qu'on stocke. Il ne change rien pour une requête copiée dès l'entrée ou lue sur une VM en marche, puisque personne ne l'a stockée.

## L'hébergeur a vu un serveur

Chez Phala, la supervision a repéré une activité non autorisée sur un serveur le 5 novembre [s28]. Restait à savoir si quelqu'un avait lu les requêtes des clients, et la réponse est venue du chercheur extérieur. La supervision des machines répond à « ce serveur est-il compromis ? », et elle le fait bien. Elle ne répond pas à « la requête de ce client a-t-elle été lue, et quelqu'un s'est-il servi de son contenu ? », or c'est la question qu'on se pose quand on envoie ses prompts sur le GPU de quelqu'un d'autre.

Les autres hébergeurs en savaient encore moins. Aucun des trois du rapport de Dragos n'était au courant de sa brèche avant d'être prévenu, alors que le premier incident remontait à la mi-juillet [s25]. Le rapport ne les nomme pas, donc impossible de savoir si Phala en fait partie. Chez Together AI, le scan automatique a bien repéré l'identifiant fuité et le commit a été annulé [s16]. Les échantillons de prompts stockés ont été téléchargés quand même pendant cette fenêtre d'exposition [s32].

Ces rapports ne parlent que de brèches qu'un canari a fait remonter. On ne peut donc pas en conclure que les canaris attrapent plus de choses que la supervision des machines. En revanche, un canari répond bien à la deuxième question, et un client peut la poser lui-même sans attendre son fournisseur.

## Une fausse clé par requête et par route

Une fausse clé se déclenche parce que celui qui détient des prompts volés y cherche des identifiants et essaie ce qu'il trouve. Together AI a vu son intrus fouiller les échantillons téléchargés et vérifier si les identifiants trouvés étaient valides [s32]. Cinq d'entre eux étaient des canaris liés à une expérience de sécurité de Dragos [s18], si bien que ce vol-là, on le connaît des deux côtés. L'attaquant a essayé chacune des clés de Dragos pour voir si elle marchait, parfois quelques heures seulement après la requête qui la transportait [s27].

Dans la plus grosse brèche de Dragos, quelques centaines de ses clés AWS ont été envoyées chacune dans une seule requête, à un seul fournisseur, pendant quelques courtes fenêtres fin octobre, et toutes les requêtes envoyées pendant ces fenêtres ont été volées [s26]. Comme chaque clé n'est partie que chez un fournisseur, une clé qui réapparaît entre d'autres mains vous dit chez qui elle est partie.

Pour savoir quand ça a fuité, il faut une clé différente à chaque requête. Un chercheur a glissé un identifiant canari unique dans chaque requête envoyée à Phala, du 1er juillet au 7 novembre, puis a surveillé son utilisation [s11]. Seuls les canaris des requêtes envoyées les 21 et 22 octobre ont ensuite été détournés [s12].

Le conseil existe déjà chez Dragos, qui propose de semer ses propres canaris dans le contexte qu'envoient vos agents et vos pipelines, et de traiter toute utilisation comme un incident [s5]. Un agent envoie tout ce qu'il peut lire, identifiants compris [s4]. D'ailleurs, chez Together AI, tout est parti d'un agent de code qui a poussé dans un commit un identifiant donnant accès au dépôt Hugging Face privé [s15]. La fausse clé est donc aussi la seule qu'on ait envie de laisser à portée d'un agent. Ce que le conseil laisse de côté, c'est le registre. Une fausse clé ne vaut quelque chose que si vous pouvez la relier à la requête, à la route et à l'heure, et la route est justement le champ qui disparaît dès qu'un routeur choisit le fournisseur à votre place (ce qu'il fera le premier après-midi où votre fournisseur habituel a un coup de mou). Au minimum, écrivez une ligne au moment où la requête est construite :

```python
from datetime import datetime, timezone

def plant_canary(request_id: str, route: str, ledger: list) -> str:
    # issue_decoy_key() désigne le faux identifiant que surveille votre système d'alerte
    key = issue_decoy_key()
    ledger.append({
        "key": key,
        "request": request_id,
        "route": route,  # fournisseur + modèle + région choisis par le routeur
        "sent_at": datetime.now(timezone.utc).isoformat(),
    })
    return key  # va dans le contexte de la requête, nulle part ailleurs
```

C'est une ébauche, je ne l'ai pas fait tourner. Le code ne fait pas le plus dur à votre place. Le leurre doit ressembler à quelque chose qu'un attaquant prendra la peine d'essayer, l'alerte doit arriver jusqu'à un humain, et la route doit être celle que le routeur a réellement choisie, lue dans sa réponse et non dans votre configuration. Si le routeur retente sur un deuxième fournisseur après une erreur, notez les deux routes, parce qu'une clé qui a fuité sur le fallback ressemble trait pour trait à une clé qui a fuité sur le premier choix. Attendez-vous aussi à un faux positif bien à vous : votre propre agent qui trouve le leurre dans son contexte et l'essaie. La première alerte viendra peut-être de chez vous.

Le registre est d'ailleurs le seul endroit qui sache quel fournisseur a servi telle requête. Un routeur juge ses fournisseurs en bloc, et on le voit bien chez OpenRouter, qui a retiré 125 endpoints de l'éligibilité au ZDR [s22], dont une partie par simple précaution [s35]. Quand la méthode de test des chercheurs tournera chez lui en continu [s34], la liste sera mieux tenue. Elle ne vous dira pas pour autant par où est passé votre trafic de mardi dernier.

Méfiez-vous du silence d'un canari. Phala elle-même garde une période de précaution plus large dans ses consignes, et pour une bonne raison : ses tests par canaris ne portaient que sur un échantillon de requêtes et ne repéraient que l'usage d'identifiants volés. Ils ne voyaient ni toutes les requêtes, ni tous les accès aux données [s31]. Un canari resté muet veut dire que personne n'a utilisé cette clé-là. Il ne dit rien de la requête d'à côté, ni d'un attaquant qui lit les prompts sans jamais essayer d'identifiant. Quand un fournisseur publie une fenêtre d'exposition, considérez comme exposées toutes les requêtes envoyées pendant cette période, même si tous vos canaris sont restés silencieux.
