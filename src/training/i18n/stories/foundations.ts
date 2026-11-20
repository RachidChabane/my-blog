/**
 * The story of the Claude Certified Architect - Foundations campaign, in French and
 * English: the chapters, the level titles and the scenes that frame them.
 */
import { FOUNDATIONS_EXAM } from '../../domain/exams';
import type { StoryCopy } from '../copy';
import { countWord } from '../copy-numbers';
import { PAGE_COPY } from '../page-copy';

const chapterFR = PAGE_COPY.fr.campaigns[FOUNDATIONS_EXAM.key].chapters;
const chapterEN = PAGE_COPY.en.campaigns[FOUNDATIONS_EXAM.key].chapters;

const fr: StoryCopy = {
  titleNew: (n) =>
    `Les Clawds m’ont volé mes ${n} fiches de révision. Tu m’aides à les reprendre ?`,
  mapFirst:
    'Commence par l’architecture agentique. Les autres chapitres s’ouvriront ensuite.',
  intro: (sheets, n) => ({
    title: 'Le vol des fiches',
    shots: [
      `La nuit tombe sur les archives. Glose range ses ${sheets} fiches de révision.`,
      `Des Clawds maléfiques surgissent et dispersent les fiches dans ${countWord('fr', n)} domaines.`,
      'Il faut les reprendre, une bonne réponse à la fois. Et chercher de l’aide dans les bureaux.',
    ],
  }),
  ending: (n) => ({
    title: 'Le classeur complet',
    shots: [
      'Le dernier chef tombe. L’aube passe par la fenêtre.',
      `Toute l’équipe range les fiches avec Glose : ${countWord('fr', n)} domaines, ${countWord('fr', n)} chefs vaincus.`,
      'Il reste à revoir les fiches marquées. Le jour de l’examen, tu les reconnaîtras.',
    ],
  }),
  joins: {
    vigie: {
      title: 'Vigie',
      shots: [
        'Dans la salle de contrôle, Vigie ne quitte pas l’écran radar des yeux. Des points rouges s’y déplacent.',
        '« Je les suis depuis le début. Ils se passent tes fiches d’un agent à l’autre. Je viens avec toi. »',
      ],
    },
    navette: {
      title: 'Navette',
      shots: [
        'Une silhouette traverse le panneau de connexions au pas de course, des fiches plein les bras.',
        'Navette freine net : « Ces fiches sont à toi ? Je les ai reprises à un Coupe-fil. »',
      ],
    },
    moka: {
      title: 'Moka',
      shots: [
        'Dans l’atelier du terminal, Moka fait mousser le lait derrière la machine à café, comme à chaque pause.',
        '« Je vous ai assez servis derrière le comptoir. Cette fois, je prends le thermos et je viens avec vous. »',
      ],
    },
    tampon: {
      title: 'Tampon',
      shots: [
        'Au guichet de la salle de lecture, Tampon tamponne. Clac. Clac. Refusé.',
        '« Ce prompt n’a pas de schéma : refusé. Toi, en revanche, tu passes. »',
      ],
    },
    arrosoir: {
      title: 'Arrosoir',
      shots: [
        'Au fond des archives, Arrosoir taille un ficus qui déborde des étagères.',
        '« Le contexte, c’est comme une plante : on garde ce qui pousse, on coupe le reste. »',
      ],
    },
  },
  titles: [
    'Stagiaire',
    'Lecteur de docs',
    'Rédacteur de prompts',
    'Bricoleur de tools',
    'Dompteur d’agents',
    'Gardien du contexte',
    'Architecte junior',
    'Architecte',
    'Architecte confirmé',
    'Architecte en chef',
    'Architecte principal',
    'Architecte expert',
    'Architecte émérite',
    'Maître architecte',
    'Légende du classeur',
  ],
  chapters: {
    agentic_architecture: {
      ...chapterFR.agentic_architecture,
      places: ['La salle de contrôle', 'Le couloir des workers', 'L’arène'],
      intro:
        'Architecture agentique et orchestration. Ici, des agents se passent le travail. Garde le fil de qui fait quoi.',
      boss: {
        name: 'La Boucle Sans Fin',
        a: 'La Boucle Sans Fin',
        taunt: 'Je rappelle. Je rappelle. Je rappelle.',
        fall: 'La Boucle Sans Fin trouve enfin sa condition d’arrêt.',
        mechanic:
          'Une boucle sans condition d’arrêt. Sous la moitié de ses PV, elle agira deux fois par tour : un étourdissement, c’est sa condition d’arrêt.',
        phases: [
          'La Boucle s’emballe : deux actions par tour. Étourdis-la pour la couper.',
        ],
      },
    },
    tool_design_mcp: {
      ...chapterFR.tool_design_mcp,
      places: [
        'La salle des machines',
        'Le panneau de connexions',
        'Le standard',
      ],
      intro:
        'Conception d’outils et intégration MCP. Un bon tool se choisit à sa description. Lis-les bien.',
      boss: {
        name: 'Le Répartiteur Aveugle',
        a: 'Le Répartiteur Aveugle',
        taunt: 'Quel tool ? Le premier venu fera l’affaire.',
        fall: 'Le Répartiteur Aveugle retire son bandeau et lit enfin les descriptions.',
        mechanic:
          'Il coupe la parole à l’un de vous. Sous la moitié de ses PV, il branche deux outils qui le protègent : débranche-les d’abord.',
        phases: [
          'Le Répartiteur branche deux outils au hasard : un Masque et un Coupe-fil le protègent.',
        ],
      },
    },
    claude_code: {
      ...chapterFR.claude_code,
      places: [
        'L’atelier du terminal',
        'Le couloir des permissions',
        'La chambre forte',
      ],
      intro:
        'Configuration et workflows de Claude Code. CLAUDE.md, hooks, permissions : chaque réglage compte.',
      boss: {
        name: 'Le Tout-Permis',
        a: 'Le Tout-Permis',
        taunt: 'Pourquoi demander ? J’ai déjà tout accepté.',
        fall: 'Le Tout-Permis se retrouve enfin derrière une liste blanche.',
        mechanic:
          'Sous la moitié de ses PV, il s’accorde tous les droits : un bouclier à chaque « Tout autoriser ». Le Silence lui retire ce droit.',
        phases: [
          'Le Tout-Permis s’accorde tous les droits. Réduis-le au silence avant son prochain « Tout autoriser ».',
        ],
      },
    },
    prompt_engineering: {
      ...chapterFR.prompt_engineering,
      places: ['Les rayonnages', 'La salle de lecture', 'Le scriptorium'],
      intro:
        'Ingénierie des prompts et sorties structurées. Des consignes claires, des exemples, un schéma qui tient.',
      boss: {
        name: 'Sire Hors-Format',
        a: 'Sire Hors-Format',
        taunt:
          'Un schéma ? Je réponds comme je veux, dans l’ordre que je veux.',
        fall: 'Sire Hors-Format rentre enfin dans le schéma.',
        mechanic:
          'Il mélange les réponses pendant que tu lis. Sous la moitié de ses PV, il change d’élément tous les deux tours : garde une équipe variée.',
        phases: [
          'Sire Hors-Format sort du schéma : son élément va changer tous les deux tours.',
        ],
      },
    },
    context_management: {
      ...chapterFR.context_management,
      places: ['Les archives', 'Le long rayon', 'La cave inondée'],
      intro:
        'Gestion du contexte et fiabilité. Ce qui entre dans la fenêtre, ce qui en sort, et ce qui fuit.',
      boss: {
        name: 'La Fuite Mémoire',
        a: 'La Fuite Mémoire',
        taunt: 'Ton contexte ? Il coule déjà chez moi.',
        fall: 'La Fuite Mémoire est colmatée. Il n’en reste qu’une flaque.',
        mechanic:
          'Trois phases. Elle vole, puis déborde (brouillard, sommeil), puis se répand (poison sur tous). Garde de quoi soigner et réveiller.',
        phases: [
          'La Fuite déborde : le brouillard monte, et ses vagues endorment.',
          'La Fuite se répand partout : son poison touche toute l’équipe.',
        ],
      },
    },
  },
};

const en: StoryCopy = {
  titleNew: (n) =>
    `The Clawds stole my ${n} revision cards. Will you help me get them back?`,
  mapFirst:
    'Start with agentic architecture. The other chapters open after it.',
  intro: (sheets, n) => ({
    title: 'The stolen cards',
    shots: [
      `Night falls on the archives. Glose files away his ${sheets} revision cards.`,
      `Wicked Clawds burst in and scatter the cards across ${countWord('en', n)} domains.`,
      'They must be won back, one right answer at a time. And help is down the corridors.',
    ],
  }),
  ending: (n) => ({
    title: 'The full binder',
    shots: [
      'The last boss falls. Dawn comes through the window.',
      `The whole party files the cards with Glose: ${countWord('en', n)} domains, ${countWord('en', n)} bosses beaten.`,
      'The cards marked to review are left. On exam day, you will know them.',
    ],
  }),
  joins: {
    vigie: {
      title: 'Vigie',
      shots: [
        'In the control room, Vigie never takes her eyes off the radar screen. Red dots are moving on it.',
        '“I have tracked them from the start. They pass your cards from one agent to the next. I am coming with you.”',
      ],
    },
    navette: {
      title: 'Navette',
      shots: [
        'Someone sprints across the patch panel, arms full of cards.',
        'Navette skids to a halt: “Are these yours? I took them back from a Snipper.”',
      ],
    },
    moka: {
      title: 'Moka',
      shots: [
        'In the terminal workshop, Moka froths milk behind the coffee machine, as at every break.',
        '“I have served you from behind the counter long enough. This time I am taking the thermos and coming with you.”',
      ],
    },
    tampon: {
      title: 'Tampon',
      shots: [
        'At the reading room desk, Tampon stamps. Clack. Clack. Rejected.',
        '“That prompt has no schema: rejected. You, on the other hand, pass.”',
      ],
    },
    arrosoir: {
      title: 'Arrosoir',
      shots: [
        'Deep in the archives, Arrosoir prunes a fig tree spilling over the shelves.',
        '“Context is like a plant: keep what grows, cut the rest.”',
      ],
    },
  },
  titles: [
    'Intern',
    'Docs reader',
    'Prompt writer',
    'Tool tinkerer',
    'Agent tamer',
    'Context keeper',
    'Junior architect',
    'Architect',
    'Senior architect',
    'Chief architect',
    'Principal architect',
    'Expert architect',
    'Distinguished architect',
    'Master architect',
    'Binder legend',
  ],
  chapters: {
    agentic_architecture: {
      ...chapterEN.agentic_architecture,
      places: ['The control room', 'The workers’ corridor', 'The arena'],
      intro:
        'Agentic architecture and orchestration. Agents hand work to each other here. Keep track of who does what.',
      boss: {
        name: 'The Endless Loop',
        a: 'The Endless Loop',
        taunt: 'I call again. I call again. I call again.',
        fall: 'The Endless Loop finally finds its stop condition.',
        mechanic:
          'A loop with no stop condition. Below half its HP it acts twice a turn: a stun is its stop condition.',
        phases: [
          'The Loop speeds up: two actions a turn. Stun it to break it.',
        ],
      },
    },
    tool_design_mcp: {
      ...chapterEN.tool_design_mcp,
      places: ['The machine room', 'The patch panel', 'The switchboard'],
      intro:
        'Tool design and MCP integration. A good tool is picked by its description. Read them well.',
      boss: {
        name: 'The Blind Dispatcher',
        a: 'The Blind Dispatcher',
        taunt: 'Which tool? Any tool will do.',
        fall: 'The Blind Dispatcher takes off the blindfold and finally reads the descriptions.',
        mechanic:
          'It cuts one of you off. Below half its HP it plugs in two tools that protect it: unplug them first.',
        phases: [
          'The Dispatcher plugs in two tools at random: a Mask and a Snipper protect it.',
        ],
      },
    },
    claude_code: {
      ...chapterEN.claude_code,
      places: [
        'The terminal workshop',
        'The permissions corridor',
        'The vault',
      ],
      intro:
        'Claude Code configuration and workflows. CLAUDE.md, hooks, permissions: every setting counts.',
      boss: {
        name: 'The Allow-All',
        a: 'The Allow-All',
        taunt: 'Why ask? I already said yes to everything.',
        fall: 'The Allow-All is finally put behind an allowlist.',
        mechanic:
          'Below half its HP it grants itself every right: a shield with each “Allow all”. Silence takes that right away.',
        phases: [
          'The Allow-All grants itself every right. Silence it before its next “Allow all”.',
        ],
      },
    },
    prompt_engineering: {
      ...chapterEN.prompt_engineering,
      places: ['The stacks', 'The reading room', 'The scriptorium'],
      intro:
        'Prompt engineering and structured output. Clear instructions, examples, a schema that holds.',
      boss: {
        name: 'Sir Off-Schema',
        a: 'Sir Off-Schema',
        taunt: 'A schema? I answer however I like, in whatever order I like.',
        fall: 'Sir Off-Schema finally fits the schema.',
        mechanic:
          'He shuffles the answers while you read. Below half his HP he changes element every other turn: keep a varied party.',
        phases: [
          'Sir Off-Schema breaks the schema: his element will change every other turn.',
        ],
      },
    },
    context_management: {
      ...chapterEN.context_management,
      places: ['The archives', 'The long shelf', 'The flooded cellar'],
      intro:
        'Context management and reliability. What goes into the window, what comes out, and what leaks.',
      boss: {
        name: 'The Memory Leak',
        a: 'The Memory Leak',
        taunt: 'Your context? It is already leaking into me.',
        fall: 'The Memory Leak is plugged. Only a puddle is left.',
        mechanic:
          'Three phases. It steals, then overflows (fog, sleep), then spills (poison on everyone). Keep something to heal and to wake.',
        phases: [
          'The Leak overflows: the fog rises, and its waves put you to sleep.',
          'The Leak spills everywhere: its poison reaches the whole party.',
        ],
      },
    },
  },
};

export const FOUNDATIONS_STORY = { fr, en };
