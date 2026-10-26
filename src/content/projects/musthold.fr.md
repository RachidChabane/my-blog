---
translationKey: 'musthold'
lang: 'fr'
slug: 'musthold-fr'
name: 'musthold : des preuves, exigence par exigence, que les tests d''un agent vérifient la spec'
summary: 'Des modules de preuve derrière la porte shallnot, qui vérifient exigence par exigence que les tests d''un agent de code échoueraient sur un code qui enfreint la spec, et qui renvoient un contre-exemple à l''agent quand ce n''est pas le cas.'
stack:
  - 'Go'
  - 'Mutation testing'
  - 'Claude Code'
  - 'Codex'
  - 'Copilot CLI'
  - 'Sigstore'
status: 'actif'
links:
  - label: 'GitHub'
    url: 'https://github.com/RachidChabane/musthold'
  - label: 'shallnot'
    url: 'https://github.com/RachidChabane/shallnot'
publishState: 'published'
year: '2026'
highlights:
  - 'Quatre preuves par exigence : traçabilité (shallnot), pouvoir discriminant, alignement et exhaustivité. Une exigence ne passe que si la traçabilité et chaque preuve requise passent'
  - 'Un mutant ne compte que s''il compile, passe les tests des autres exigences et échoue sur un exemple de son exigence, ou sur un test témoin écrit depuis la spec avant qu''aucun mutant n''existe'
  - 'Quand les tests ratent une violation, la porte nomme l''exigence et une entrée qu''ils ne distinguent pas, jamais le code fautif, pour qu''aucun test ne soit taillé sur ce code'
  - 'Aucun binaire n''appelle de modèle. Un module écrit une requête, et le harnais déjà en place y répond dans un sous-agent qui ne voit rien d''autre'
  - 'Une session Claude Code enregistrée montre la boucle en 9 min 17 s. Bloqué par trois mutants survivants d''un critère, l''agent ajoute un test aux âges 65 et 120, et la porte laisse l''agent s''arrêter'
  - 'Le scan n''a besoin d''aucune spec. Sur la suite de ce site, 3 des 40 tests tirés au sort passaient sur chaque changement prouvé des lignes qu''ils exécutent'
  - 'musthold passe sa propre porte : 907 exigences réparties sur 12 modules Go sont tracées jusqu''à des tests étiquetés en CI'
metrics:
  - value: '4'
    label: 'preuves par exigence'
  - value: '907'
    label: 'exigences propres tracées en CI'
  - value: '5'
    label: 'runners de test pris en charge'
architecture:
  caption: 'D''une spec à un verdict sur lequel l''agent peut agir'
  layers:
    - label: 'Spec'
      nodes:
        - 'exigences ID~RÉVISION'
        - 'exemples en ligne'
    - label: 'Preuves'
      nodes:
        - 'musthold-dp'
        - 'musthold-alignment'
        - 'musthold-completeness'
    - label: 'Harnais'
      nodes:
        - 'sous-agents aveugles'
        - 'Claude Code'
        - 'Codex'
        - 'Copilot CLI'
    - label: 'Publication'
      nodes:
        - 'musthold-verify'
        - 'preuves locales'
        - 'preuves CI signées'
    - label: 'Porte'
      nodes:
        - 'shallnot gate'
        - 'hook de fin de tour'
        - 'contre-exemple'
---

musthold fait passer shallnot de « un test cite cette exigence et il a passé » à « les tests de cette exigence échoueraient sur un code qui l'enfreint ». Il lit une spec écrite en langage courant et, pour chaque exigence, tire des mutants du code qu'elle régit. Un mutant ne compte que s'il compile, passe les tests de toutes les autres exigences et échoue sur un exemple de sa propre exigence, ou sur un test témoin écrit depuis la spec avant qu'aucun mutant n'existe. Si tous les tests de l'exigence passent encore sur un tel mutant, l'exigence est bloquée. La porte nomme alors l'exigence et une entrée que les tests ne distinguent pas, jamais le code du mutant, et l'agent renforce ses tests. L'alignement fait remonter un test qui vérifie autre chose que ce que dit son exigence, et l'exhaustivité signale ce que la spec laisse non dit sur un changement. Aucun binaire n'appelle de modèle. Quand une preuve demande un jugement, le module écrit une requête, et le harnais déjà en place (Claude Code, Codex ou Copilot CLI) y répond dans un sous-agent aveugle. Le jugement d'un modèle seul ne bloque jamais et ne blanchit jamais un survivant. Le scan applique la même mécanique à n'importe quelle suite pytest, Go, Jest ou Vitest, sans spec. Il liste les tests qui passent encore quand le code qu'ils exécutent est cassé, avec un script qui rejoue chaque changement. Un run vert prouve que les tests attrapent les mutants tirés, pas qu'ils attrapent tous les bugs possibles, et cette limite est écrite.
