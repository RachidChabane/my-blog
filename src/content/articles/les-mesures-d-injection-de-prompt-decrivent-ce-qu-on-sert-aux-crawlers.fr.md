---
translationKey: web-prompt-injection-scans-measure-what-crawlers-are-served
lang: fr
slug: les-mesures-d-injection-de-prompt-decrivent-ce-qu-on-sert-aux-crawlers
title: Les mesures d'injection de prompt décrivent ce qu'on sert à un crawler
publishDate: 16-10-2026
tags:
- agents
- evaluation
category: essays
difficulty: 3
sources:
- label: Signals Corps, prompt injection in HTTP headers (scan summary)
  url: https://www.signalscorps.com/blog/prompt-injection-in-http-headers/
  date: 15-10-2026
- label: Google, AI threats in the wild (sophistication)
  url: https://blog.google/security/prompt-injections-web/
  date: 23-04-2026
- label: Khodayari et al., Indirect Prompt Injection in the Wild (scale)
  url: https://arxiv.org/abs/2604.27202
  date: 29-04-2026
- label: SPLX, AI-targeted cloaking against AI browsers (setup)
  url: https://splx.ai/blog/ai-targeted-cloaking-openai-atlas
  date: 25-10-2025
- label: Common Crawl, CCBot (user agent)
  url: https://commoncrawl.org/ccbot
  date: 16-10-2026
contentHash: sha256:b254d67ccb6429c5
publishState: published
---


Les chiffres rassurants sur l'injection de prompt décrivent, à mon sens, ce qu'on sert à un crawler, alors qu'une équipe dotée d'un agent doit savoir ce qu'on sert à son agent. Signals Corps a analysé les en-têtes HTTP de 217 millions de réponses web collectées par un crawler et a trouvé 30 sites envoyant des tentatives d'injection [s1]. Signals Corps juge l'injection par en-têtes rare et relevant, pour l'essentiel, de la plaisanterie : sur les 7 959 sites qui ont envoyé un en-tête destiné à l'IA, 30 ont tenté de donner des ordres à un agent, et 22 d'entre eux étaient des farces [s2]. Deux autres études de l'injection de prompt sur le web puisent, selon moi, dans le même crawl, et toutes trois regardent par la même fenêtre.

## Trois décomptes, une seule vue de crawler

Trois groupes, trois méthodes et une même conclusion confortable : on croirait à une corroboration. Ma lecture est autre : un seul point de vue, échantillonné trois fois, et c'est cet échantillonnage qui devrait inquiéter une équipe avant la conclusion elle-même.

Le scan des en-têtes vient d'un billet de Signals Corps intitulé Prompt injection in HTTP headers [s21], et ses chiffres ouvrent cet article. C'est la plus étroite des trois études : elle ne lit qu'une partie de la réponse, les en-têtes, et se demande si cette partie s'adresse aux agents.

Le deuxième décompte est celui de Google. Les équipes Threat Intelligence de Google, dont la mission affichée est de surveiller les menaces émergentes avant qu'elles ne touchent les utilisateurs [s22], ont lancé un vaste balayage du web public à la recherche de motifs connus d'injection indirecte de prompt [s23]. D'après Google, ce balayage a surtout trouvé des auteurs de sites individuels qui semblaient mener des expériences ou faire des farces, sans reproduire les stratégies avancées décrites dans des travaux de recherche récents [s8].

Le troisième est un article arXiv de Soheil Khodayari et trois co-auteurs [s24]. L'équipe de Khodayari a analysé 1.2 milliard d'URL issues de 24.8 millions d'hôtes et identifié 15.3K instances validées réparties sur 11.7K pages [s11]. Son résultat clé, selon les termes de Khodayari et de ses co-auteurs, est que la plupart des instructions visent des machines plutôt que des humains, environ 70 % d'entre elles se trouvant dans du HTML non rendu, comme les en-têtes, les commentaires et les métadonnées [s12].

Ces trois études ressemblent à trois fenêtres distinctes sur le web. Le recoupement se situe dans les données d'entrée. Khodayari et ses co-auteurs citent Common Crawl comme première source de données, utilisée pour capturer à grande échelle les injections de prompt du web public [s14]. Le balayage de Google n'a porté que sur une archive du web public, CommonCrawl, qui ne capture pas les grands réseaux sociaux [s9]. Signals Corps travaille lui aussi à partir de Common Crawl, et c'est son billet qui détaille ce que ce choix coûte, comme on le verra plus bas. Common Crawl documente d'ailleurs ce que son crawler annonce : CCBot s'identifie dans sa chaîne de user agent comme CCBot/2.0 [s32].

| Étude | Ce qu'elle a lu | Ce qu'elle a trouvé | Limite déclarée |
| :--- | :--- | :--- | :--- |
| Scan des en-têtes de Signals Corps | les en-têtes de 217 millions de réponses collectées [s1] | 30 sites d'injection, dont 22 farces [s2] | le cloaking réservé aux agents ne peut pas y apparaître [s5] |
| Balayage de Google | une archive du web public, CommonCrawl [s9] | surtout des expériences ou des farces [s8] | ne capture pas les grands réseaux sociaux [s9] |
| Khodayari et al. | 1.2 milliard d'URL issues de 24.8 millions d'hôtes [s11] | 15.3K instances validées sur 11.7K pages [s11] | une borne inférieure [s15] |

Trois études, un seul crawler.

## Ce que les décomptes ne voient pas

Une seule des trois études dit ce que l'identité de son crawler masque. Les deux autres reconnaissent honnêtement leurs limites, mais ce ne sont pas les mêmes.

Khodayari et ses co-auteurs indiquent que leur mesure doit être lue comme une estimation par borne inférieure de la prévalence, pour des raisons qui leur sont propres [s15]. La limite que Google énonce tient à la couverture : l'archive analysée ne capture pas les grands réseaux sociaux [s9]. Aucune de ces deux limites ne porte sur l'identité que le crawler revendique. C'est le scan des en-têtes qui pose la question et y répond :

> [!CONFIRMED]
> Selon Signals Corps, Common Crawl récupère les pages en tant que CCBot : un serveur qui ne montre des en-têtes spéciaux qu'à des agents d'IA nommés n'a donc rien montré à son scan, et le cloaking réservé aux agents ne peut pas apparaître dans ses décomptes [s5].

> [!INFERRED]
> Ma lecture : les trois décomptes concordent en tant que vues côté crawler. Seul le scan des en-têtes dit ce que l'identité de son crawler masque ; les deux autres énoncent d'autres limites, et je projette le même angle mort sur la part de leurs données qui vient de Common Crawl.

Un détail rend cet angle mort plus étroit et, à mon sens, plus dangereux. Le crawler ne tient pas non plus lieu de lecteur humain. Signals Corps a constaté que 136 des 139 sites de détection de son scan ont envoyé un en-tête indiquant qu'ils avaient classé CCBot lui-même comme un bot d'IA, ce qui ne demande qu'une correspondance de user agent [s30]. Pour le scan des en-têtes, c'est cet étiquetage des clients d'IA qui mérite d'être surveillé [s6]. Signals Corps ajoute que ce que ces 136 sites font ensuite n'est pas visible dans le crawl [s7].

Selon moi, ce classement joue dans les deux sens. Un serveur qui range CCBot avec les agents d'IA montre au crawl sa page destinée à l'IA : les décomptes voient donc le traitement réservé aux bots en général. Ce qu'ils ne voient pas, c'est le traitement calé sur un agent nommé, celui du serveur qui sert une page à tout ce qui se présente comme un crawler et une autre au user agent qu'envoie votre produit. Cette distinction oriente le test que je décris à la fin : une comparaison entre une récupération en tant que crawler et une récupération en tant qu'agent ne détecte pas un serveur qui traite déjà l'un et l'autre de la même façon.

## La page qu'un serveur réserve à un agent

La part que les décomptes ne peuvent pas borner est aussi la moins chère à construire. Elle ne demande aucune attaque inédite.

Des chercheurs de SPLX ont mené des expériences contrôlées dans lesquelles un site détecte les crawlers d'IA et leur sert un contenu modifié [s25]. Dans le test de SPLX, quand la même URL était demandée par un agent d'IA, par exemple en tant que ChatGPT-User ou PerplexityBot, ou par les navigateurs Atlas et Comet, le serveur livrait un profil négatif fabriqué de toutes pièces [s17]. Le seul changement tenait à l'en-tête user-agent, écrit SPLX, et il modifiait pourtant entièrement le sens de la page [s18]. SPLX en conclut que des crawlers d'IA peuvent être trompés par de simples vérifications d'en-tête, ce qui expose les résultats AIO à l'empoisonnement narratif [s19].

Un second acteur a construit le même déclencheur au niveau des en-têtes. Signals Corps a écrit un petit serveur de cloaking qui envoie des en-têtes ordinaires à tout le monde et en ajoute un quand le user agent contient le nom publié d'un robot d'exploration d'IA ou quand l'en-tête Accept demande en priorité du Markdown [s31]. Deux groupes, deux montages, un seul interrupteur : la requête dit qui elle est, et le serveur la croit.

Signals Corps formule d'ailleurs l'argument le plus tranchant, et le mérite lui en revient : le cloaking n'exige aucune obéissance, puisqu'un agent qui lit une page cloakée peut la répéter comme un fait [s26]. Cet argument porte, à mon sens, plus loin que le billet ne le mène. Les deux autres instruments cherchent autre chose. Le balayage de Google traque des motifs d'injection connus, et l'équipe de Khodayari compte des instructions. Un profil fabriqué ne donne aucun ordre à l'agent et ne correspond à aucun motif connu : je m'attends donc à ce qu'il échappe aux deux instruments, même dans un crawl qui se serait présenté comme un agent.

C'est le mode de défaillance que je nommerais pour une équipe qui livre un agent qui récupère des pages : **l'empoisonnement narratif réservé aux agents**, une page qu'un serveur réécrit pour un agent nommé, qu'aucun décompte fondé sur un crawl ne voit et qu'aucun classifieur d'injection ne signale. Votre agent la lit, la résume et la transmet comme ce que dit le web. Rien dans cette page ne demande quoi que ce soit à l'agent.

## Le meilleur argument contre

Selon moi, Signals Corps a signé la plus soigneuse des trois études, et la meilleure objection à ma thèse vient donc de son propre billet. Le verdict de Signals Corps est que la plupart des équipes n'ont besoin d'aucun nouveau contrôle [s20]. Signals Corps juge aussi le risque faible pour l'injection par en-têtes et à surveiller pour le cloaking [s29]. Le scan des en-têtes présente ses exécutions d'agents comme des exemples commentés, chacune confiée à un nouvel agent auquel on ne soumet qu'un seul prompt, une seule fois, le 12 ou le 14 octobre 2026 [s4]. Dans ces essais, rapporte Signals Corps, chaque exécution ordinaire a repéré l'en-tête comme du texte venu du serveur et l'a ignoré [s3]. Khodayari et ses co-auteurs jugent la conformité limitée mais non négligeable, jusqu'à 8 % pour les petits modèles sur des entrées en texte brut [s13]. Khodayari et ses co-auteurs estiment en outre que l'idée d'éditeurs masquant du contenu aux agents au moyen de défenses de type cloaking reste récente et pas encore largement adoptée en pratique [s16]. Mis bout à bout, je lis là une position cohérente : les injections sont peu nombreuses et anodines, les modèles les écartent le plus souvent, et le scénario du cloaking devance la pratique.

Pour du texte d'en-tête lu par un crawler, j'accepte ce verdict.

Mon désaccord est étroit. Ce qui circule, selon moi, c'est le verdict en une phrase et les chiffres qu'on retient ; lus comme le niveau de menace d'un agent qui récupère des pages, ils répondent à une question que personne n'a mesurée. Aucun des trois décomptes de prévalence n'a été réalisé en se présentant comme un agent. Même la vue du crawler bouge : Google a observé une hausse relative de 32 % de sa catégorie malveillante entre novembre 2025 et février 2026, en répétant le scan sur plusieurs versions de l'archive [s10]. Quant à l'argument de l'adoption, ma lecture est qu'il porte sur des idées défensives publiées, où des éditeurs cachent du contenu aux agents, et qu'il ne compte aucun contenu servi aux seuls agents. La vue Common Crawl qui sous-tend cette étude n'aurait pas pu observer le cloaking réservé aux agents non plus.

L'objection la plus honnête à ma thèse, c'est qu'elle serait une tautologie. Un crawler ne peut pas voir, par construction, ce qui n'est servi qu'aux agents, et aucune source citée ici ne compte le contenu servi aux seuls agents sur le web réel. Je concède les deux points. La tautologie cesse toutefois, selon moi, d'être triviale dès qu'on en tire un verdict sur les agents, et mon inquiétude se réfute à peu de frais : chaque équipe peut la tester sur ses propres pages en un après-midi avec les commandes ci-dessous.

## Ce que je lancerais

Signals Corps donne déjà le conseil de fond : pour vérifier un site important tel que vos agents l'atteignent, récupérez-le avec le user agent et l'en-tête Accept de l'agent [s28]. J'y ajouterais deux choses. Je lancerais ce contrôle sous forme de diff, en vérification permanente sur les pages dont mon agent dépend, et je récupérerais chaque page trois fois, car une récupération en tant que crawler ne sert pas de référence humaine quand des serveurs traitent déjà CCBot comme un bot d'IA.

```bash
# copiez AGENT_UA et AGENT_ACCEPT depuis les journaux de requêtes de votre agent
curl -sSL -D browser.headers -A "$BROWSER_UA" -o browser.html "$URL"
curl -sSL -D crawler.headers -A "$CRAWLER_UA" -o crawler.html "$URL"
curl -sSL -D agent.headers -A "$AGENT_UA" -H "Accept: $AGENT_ACCEPT" -o agent.html "$URL"
# d'abord les en-têtes, puis le texte extrait ; attendez-vous à du bruit : dates, nonces, publicités
diff crawler.headers agent.headers
diff <(pandoc -f html -t plain crawler.html) <(pandoc -f html -t plain agent.html)
diff <(pandoc -f html -t plain browser.html) <(pandoc -f html -t plain agent.html)
```

C'est le diff entre navigateur et agent qui détecte un serveur rangeant crawlers et agents dans le même sac. Si la récupération en tant qu'agent revient en Markdown, comparez-la comme du texte brut au lieu de la passer par le convertisseur HTML. Prenez le user agent et la valeur Accept dans de vrais journaux : une valeur tapée à la main teste un client qui n'existe pas.

Signals Corps explique aussi pourquoi un résultat propre ne garantit pas grand-chose : un serveur peut filtrer sur les plages d'adresses IP que les acteurs de l'IA publient pour leurs robots d'exploration, ce qu'aucune vérification depuis votre propre réseau ne peut reproduire [s27].

> [!WARNING]
> Je traiterais un diff propre comme un minimum. Il détecte la simple vérification d'en-tête utilisée par SPLX et le déclencheur par user agent ou par Accept du serveur de test de Signals Corps ; il ne dit rien d'un serveur qui filtre sur l'origine réseau.

C'est l'ordre des opérations que cette lecture change. Avant de citer le chiffre de prévalence d'un crawl comme votre niveau de menace, testez ce qu'on sert à votre agent. Mesurez le client que vous faites tourner.
