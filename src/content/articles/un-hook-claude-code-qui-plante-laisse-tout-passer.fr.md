---
translationKey: claude-code-hooks
lang: fr
slug: un-hook-claude-code-qui-plante-laisse-tout-passer
title: Un hook Claude Code qui plante laisse tout passer
publishDate: 28-11-2026
tags:
- agentic-coding
- agents
category: lessons
difficulty: 4
sources:
- label: Claude Code docs, Automate workflows with hooks
  url: https://code.claude.com/docs/en/hooks-guide
  date: 25-11-2026
- label: Claude Code docs, Hooks reference
  url: https://code.claude.com/docs/en/hooks
  date: 25-11-2026
- label: 'Blake Crosley, Claude Code Hooks Tutorial: 5 Production Hooks From Scratch'
  url: https://blakecrosley.com/blog/claude-code-hooks-tutorial
  date: 10-03-2026
- label: Blake Crosley, Claude Code Hooks Explained
  url: https://blakecrosley.com/blog/claude-code-hooks-explained
  date: 01-07-2026
- label: Wiz Research, keyv and cacheable npm supply chain attack
  url: https://www.wiz.io/blog/keyv-and-cacheable-npm-supply-chain-attack
  date: 04-08-2026
contentHash: sha256:4eb6f1f8c1ad420b
publishState: published
---


Le script de garde d'un hook Claude Code tombe sur une entrée qu'il n'attendait pas, Python sort en 1 avec une traceback, et la commande qu'il devait arrêter passe quand même. C'est la panne la plus courante, et elle n'a rien de spectaculaire : le hook garantit que votre commande tourne, et c'est tout. Pour qu'elle bloque, il faut le bon événement et le bon code de sortie ; pour qu'un plantage bloque aussi, il faut activer un réglage qui est désactivé par défaut.

## Où se branche un hook

Le guide promet que certaines actions ont toujours lieu, au lieu de dépendre du bon vouloir du modèle [s1]. Ce qui a toujours lieu, c'est une commande shell déclarée dans `settings.json` sous un événement comme `PreToolUse` ou `Stop`, et filtrée par un matcher [s6].

```
settings.json
  hooks
    PreToolUse                      <- événement : quand il se déclenche
      matcher: "Bash"               <- quels appels d'outil
        type: "command"
        command: .claude/hooks/guard.py   <- ce qui s'exécute ; son code de sortie décide
```

## Ceux qui peuvent bloquer

Parmi les événements qu'on croise dans presque toutes les configurations de production (Blake Crosley en compte cinq [s11]), trois peuvent dire non, et un quatrième en donne l'impression :

| Événement | Peut bloquer ? | Effet d'un exit 2 |
|---|---|---|
| PreToolUse | Oui | Bloque l'appel d'outil avant qu'il s'exécute [s2] |
| UserPromptSubmit | Oui | Bloque le prompt [s7] |
| Stop | Oui | Empêche Claude de s'arrêter, la conversation continue [s8] |
| PostToolUse | Non | Montre le stderr à Claude, une fois l'outil déjà passé [s9] |

On lit souvent mal la dernière ligne. Un hook qui cherche une clé d'API dans un fichier modifié la trouve une fois qu'elle est sur le disque : le contrôle qui l'empêche d'y arriver doit donc tourner en PreToolUse, et la version PostToolUse ne peut que prévenir Claude, un peu tard si un watcher a déjà synchronisé le fichier ailleurs.

## Exit 2, sinon l'appel passe

Pour une garde PreToolUse sur Bash, c'est le code de sortie qui décide. Exit 2 bloque la commande, alors qu'exit 1 sans sortie JSON valide n'est qu'une erreur non bloquante qui avertit et laisse tourner la commande : un hook censé faire respecter une règle doit donc sortir en 2 [s5] [s15]. Avec de simples codes de sortie, une garde se comporte ainsi :

```
appel d'outil --> garde PreToolUse --+-- exit 0 (sans JSON) ---------> appel exécuté
                                     +-- exit 2 ---------------------> appel bloqué
                                     +-- tout le reste --------------> appel exécuté, avec un avertissement
                                         (exit 1, traceback, mauvais chemin, délai dépassé)
```

Si la garde renvoie aussi du JSON, l'exit 2 l'emporte quand même : un « allow » dans la même sortie ne lève pas le blocage [s3]. Pour le reste, je laisse le JSON de côté.

Voici une garde assez courte pour se lire d'une traite. Il lui faut aussi être rapide : comme elle se place devant chaque appel concerné, elle doit répondre en moins de 500 ms [s5]. Elle reçoit l'événement en JSON sur stdin, en extrait la commande et refuse `rm -rf` :

```python
#!/usr/bin/env python3
import json
import re
import sys


def main() -> int:
    event = json.load(sys.stdin)
    command = event["tool_input"]["command"]
    if re.search(r"\brm\s+-rf\b", command):
        print("blocked: rm -rf", file=sys.stderr)
        return 2
    return 0


sys.exit(main())
```

Pas besoin de Claude Code pour la tester : il suffit de lui envoyer l'événement vous-même. Trois cas, avec leur vraie sortie :

```
$ printf '%s' '{"tool_name":"Bash","tool_input":{"command":"rm -rf /tmp/build"}}' | python3 guard.py; echo "exit=$?"
blocked: rm -rf
exit=2
$ printf '%s' '{"tool_name":"Bash","tool_input":{"command":"ls"}}' | python3 guard.py; echo "exit=$?"
exit=0
$ printf 'not json' | python3 guard.py 2>/dev/null; echo "exit=$?"
exit=1
```

Le troisième cas, c'est celui qui finira en prod. Une entrée que la garde n'attendait pas (un payload sans clé `command`, une forme jamais vue en l'écrivant, un octet qui fait tomber le décodeur) fait planter le script, et pour Claude Code un hook qui plante n'est qu'une erreur non bloquante. Le `rm -rf` passe alors, et la seule trace est un avertissement dans un transcript que personne ne lit à ce moment-là. (La référence dit tout ça noir sur blanc ; simplement, ce n'est pas la page qu'on lit avant d'écrire sa première garde.) On teste les deux premiers cas parce que c'est pour eux qu'on a écrit la garde. Mettez le troisième dans la CI à côté d'eux, avec une assertion sur le code de sortie.

## Quand la garde plante, on bloque

Le remède s'appelle `onFailure`. Posez `"onFailure": "block"` sur le hook, et un échec (mauvais chemin, script qui plante, délai dépassé) bloque l'action au lieu de la laisser passer comme il le fait par défaut sur la plupart des événements ; il faut pour ça Claude Code v2.1.295 ou plus récent [s14]. Appliquée à la garde ci-dessus, l'entrée de configuration devient :

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "${CLAUDE_PROJECT_DIR}/.claude/hooks/guard.py",
            "onFailure": "block"
          }
        ]
      }
    ]
  }
}
```

Je le mettrais sur chaque hook PreToolUse qui fait respecter une règle, en acceptant ce que ça coûte. Une garde avec une faute de frappe dans son chemin refuse désormais chaque appel Bash jusqu'à ce que quelqu'un la corrige, et une garde parfois lente devient un refus intermittent. Ça reste la meilleure façon d'échouer. Une garde cassée qui bloque se signale dès le premier appel, alors qu'une garde cassée qui laisse passer ressemble trait pour trait à une garde qui marche, jusqu'au seul appel pour lequel elle existait.

Si vous êtes coincé sur un client antérieur à v2.1.295 [s14], c'est à la garde de transformer ses propres plantages en exit 2 :

```python
try:
    sys.exit(main())
except Exception:
    print("guard crashed, blocking", file=sys.stderr)
    sys.exit(2)
```

`SystemExit` ne dérive pas d'`Exception`, du coup les sorties normales 0 et 2 passent telles quelles et seuls les vrais plantages sont convertis. Un mauvais chemin ou un interpréteur absent n'atteint jamais le `try`, si bien que sur un vieux client ces deux cas laissent toujours passer l'appel.

Le test en shell prouve le script, pas le client, et je n'ai pas vu `onFailure` agir dans une vraie session. Le vérifier prend une minute : pointez le hook vers un chemin qui n'existe pas, demandez un `ls` à Claude et vérifiez que l'appel est refusé.

## Les hooks Stop qui ne lâchent rien

Un hook Stop peut refuser que Claude s'arrête, ce qui prolonge la conversation [s8]. C'est comme ça qu'on construit « ne termine pas tant que les tests ne passent pas », et c'est aussi comme ça qu'on construit une boucle. Il y a bien un plafond : au bout de 8 blocages consécutifs (réglable via `CLAUDE_CODE_STOP_HOOK_BLOCK_CAP`), Claude Code passe outre le suivant et termine le tour [s12] [s16].

Ne comptez pas dessus pour la garde qu'on a le plus envie d'écrire. Avec une garde qui bloque sur des tests en échec, Claude relance les tests à chaque passage ; or chaque relance est un appel d'outil, et chaque appel d'outil remet à zéro le compte des continuations consécutives, si bien que la garde peut ne jamais atteindre les huit [s16]. Dans une session où les tests ne peuvent pas passer, elle dépense continuation sur continuation pour une condition qui ne bougera pas. (Une suite de tests qui dépend d'une base de données en panne ne s'améliore pas à force d'insister.)

La boucle vient d'une garde qui ne vérifie jamais si elle a déjà forcé une continuation [s12], et pourtant Claude Code lui donne l'information : `stop_hook_active` vaut true quand Claude Code continue déjà à cause d'un hook Stop [s16]. Faites-en la première chose que lit la garde, et sortez en 0 quand il vaut true.

## Le fichier de hooks tourne avec vos droits

Un hook de type command tourne avec tous vos droits : il peut lire, modifier ou supprimer n'importe quel fichier auquel votre compte a accès [s4]. Les attaquants l'ont remarqué. Dans l'analyse de Wiz Research sur la compromission des paquets npm keyv et cacheable, le malware essayait de s'installer durablement en passant par les hooks Claude Code, mais aussi par le `tasks.json` de VS Code [s13].

Traitez donc `.claude/settings.json` et `.claude/hooks/` comme un workflow de CI. Toute modification passe par une revue, et un nouveau hook dans une pull request mérite la même lecture qu'une nouvelle étape du pipeline. Avant de lancer une session dans un dépôt que vous venez de cloner, regardez ce qu'il déclare. Cette commande ne lit que le fichier du projet (les hooks de vos réglages utilisateur, d'un fichier local ou d'un plugin n'y apparaissent pas), donc elle vous dit ce que ce dépôt ajoute :

```
jq '.hooks' .claude/settings.json
```

## Quiz

<details><summary>Un hook PostToolUse sort en 2 quand une modification écrit une clé d'API dans un fichier. La clé est-elle sur le disque ?</summary>Oui. PostToolUse s'exécute après l'outil : le stderr parvient à Claude, mais l'écriture a déjà eu lieu [s9]. Si la clé ne doit jamais atterrir, le contrôle va en PreToolUse.</details>

<details><summary>Votre garde PreToolUse lève une exception sur une entrée qu'elle ne sait pas lire. Que devient l'appel Bash, et quel réglage change ça ?</summary>L'appel passe : le plantage finit en erreur non bloquante, et une erreur non bloquante n'arrête pas l'action [s10]. Avec `"onFailure": "block"` sur le hook, un échec bloque l'appel [s14].</details>

<details><summary>Vous avez mis `"onFailure": "block"` sur la garde, puis un refactoring déplace `guard.py` sans que personne ne corrige le chemin. Claude demande un `ls`. Que se passe-t-il, et que se serait-il passé sans ce réglage ?</summary>Le `ls` est refusé : un hook qui ne peut pas s'exécuter est un échec, et le réglage transforme les échecs en blocages [s14]. Sans lui, le `ls` passerait, le prochain `rm -rf` aussi, et rien dans la session ne vous dirait que la garde a disparu.</details>

<details><summary>Une garde Stop bloque dès que les tests échouent et ne lit jamais `stop_hook_active`. Que se passe-t-il dans une session où les tests ne peuvent pas passer ?</summary>Claude s'acharne sur les tests, et rien ne garantit que ça s'arrête à huit continuations : s'il relance les tests à chaque passage, chacun de ces appels d'outil remet le compte à zéro [s16]. C'est à la garde elle-même de lire ce champ et d'abandonner dès la première répétition.</details>
