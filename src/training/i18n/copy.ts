/**
 * Every word of the game, in French and English. The `Copy` interface is the contract:
 * both tables implement it, so a string missing in one language fails the type check.
 * French keeps the English tech words (prompt, token, workflow, tool, hook).
 */
import type { Locale } from '@/i18n/index';
import exam from '../data/exam.json';
import type { DoorKey, MsgKey } from '../domain/engine';
import { CHAPTERS } from '../domain/rules';
import type {
  BoonKey,
  IntentKey,
  ItemKey,
  PowerKey,
  TypeKey,
  WeaponKey,
} from '../domain/rules';

/** What an enemy tag can show: its intent, or that it is stunned. */
export type IntentName = IntentKey | 'stun';

export interface MsgArgs {
  name: string;
  n: number;
  m: number;
  weapon: string;
  item: string;
  big: boolean;
  guarded: boolean;
  /** The line an enemy uses when it hits you, already filled in. */
  hitLine: string;
  boss: string;
}
type Msg = (a: MsgArgs) => string;

export interface FoeCopy {
  name: string;
  /** With an indefinite article: "Un Gribouille". */
  a: string;
  taunt: string;
  hit: (d: number) => string;
  fall: string;
}

export interface BossCopy extends FoeCopy {
  move: string;
  announce: string;
}

export interface ChapterCopy {
  /** Fits the top bar of a 360 px phone. */
  short: string;
  /** The exam domain, as exam.json names it. */
  domain: string;
  places: [string, string, string];
  intro: string;
  boss: BossCopy;
}

export interface CineCopy {
  title: string;
  shots: string[];
}

export interface Copy {
  lang: Locale;
  game: string;
  pitch: string;
  play: string;
  resume: string;
  close: string;
  help: string;
  sound: string;
  skip: string;
  next: string;
  cont: string;
  back: string;
  enterKey: string;
  scrollHint: string;
  you: string;
  glose: string;
  moka: string;
  scene: string;
  yourSide: string;
  launch: {
    progress: (f: number, total: number) => string;
  };
  /** Keyed by exam domain. */
  chapters: Record<string, ChapterCopy>;
  types: Record<TypeKey, FoeCopy>;
  weapons: Record<WeaponKey, { name: string; options: string }>;
  dmg: (n: number) => string;
  weak: string;
  resist: string;
  unknown: string;
  fogBlocked: string;
  intentLabel: (k: IntentName, n: number, special: string) => string;
  intentHelp: (k: IntentName, n: number, special: string) => string;
  intentAria: (label: string, help: string) => string;
  powers: Record<PowerKey, { name: string; text: string }>;
  powerBlocked: {
    ink: (cost: number) => string;
    full: string;
    clean: string;
    echo: string;
  };
  inkCost: (n: number) => string;
  items: Record<ItemKey, { name: string; text: string }>;
  itemBlocked: { full: string; waiting: string };
  boons: Record<BoonKey, { name: string; text: string }>;
  doors: Record<DoorKey, { name: string; text: string }>;
  titles: string[];
  status: {
    level: (l: number) => string;
    xpAria: (xp: number, of: number) => string;
    sheets: (f: number, total: number) => string;
    hp: string;
    hpAria: (hp: number, max: number) => string;
    inkAria: (ink: number, max: number) => string;
    verveAria: (v: number, max: number) => string;
    step: (i: number, of: number) => string;
    bossStep: string;
    chapterTag: (i: number) => string;
    fog: (n: number) => string;
  };
  chips: {
    guard: string;
    tache: (n: number) => string;
    rature: string;
    hint: (n: number) => string;
    tampon: string;
    echo: string;
    gag: (n: number) => string;
  };
  actions: {
    glose: string;
    guard: string;
    bag: (n: number) => string;
    verve: string;
    flee: string;
    sheets: string;
    howto: string;
    reset: string;
    cines: string;
    start: string;
    cont: string;
    enter: (short: string) => string;
    locked: (boss: string) => string;
    lockedWhy: string;
    faceBoss: string;
  };
  labels: {
    sound: string;
    whichDoor: string;
    chest: string;
    powers: string;
    bag: string;
    verveFull: string;
    confirmReset: string;
    resetYes: string;
    resetNo: string;
    fleeAsk: string;
    fleeYes: string;
    fleeNo: string;
    progress: string;
    mixing: string;
    answer: string;
    pickWeapon: string;
    yourTurn: string;
    foeTurn: string;
    victory: string;
    bossDown: string;
    retreat: string;
    yes: string;
    no: string;
    cines: string;
  };
  verve: {
    plume: { name: string; text: (foe: string) => string };
    second: { name: string; text: string };
    secondSay: string;
  };
  lines: {
    titleNew: string;
    titleBack: string;
    mapFirst: string;
    mapAll: string;
    mapAt: (short: string, f: number, total: number) => string;
    lockedTip: (boss: string) => string;
    roomAria: (
      i: number,
      domain: string,
      f: number,
      total: number,
      locked: boolean
    ) => string;
    refill: (ink: number, hp: number) => string;
    twoDoors: string;
    bossDoor: (boss: string) => string;
    bossWaits: string;
    chapterWon: (next: string) => string;
    allWon: string;
    cafe: string;
    cafeGlose: (hp: number, ink: number) => string;
    chestPlain: string;
    chestRich: string;
    took: (name: string) => string;
    appearsOne: (a: string, elite: boolean) => string;
    appearsMany: (names: string[]) => string;
    teachIntent: string;
    teachWeapons: string;
    teachArea: string;
    maskWarn: string;
    pilWarn: string;
    dinWarn: string;
    guardTip: string;
    aim: (name: string, many: boolean, second: boolean) => string;
    shieldSay: string;
    fled: string;
    bufferStrike: (answer: string) => string;
    verdictRight: string;
    verdictWrong: string;
    tallyNone: string;
    tallyCard: (n: string, answer: string) => string;
    tallySum: (n: number, xp: number) => string;
    levelUp: (l: number, title: string) => string;
    levelName: (l: number) => string;
    perkPv: (n: number) => string;
    perkPvText: string;
    perkInk: string;
    perkInkText: string;
    perkCapped: string;
    defeat: string;
    defeatGlose: string;
    inked: string;
    gagged: (n: number) => string;
    bagEmpty: string;
    crit: string;
  };
  msg: Record<MsgKey, Msg>;
  howto: { title: string; items: string[]; close: string };
  legend: Partial<Record<IntentName, string>>;
  cines: Record<string, CineCopy>;
  cineTitles: {
    chapter: (i: number, short: string) => string;
    fall: (boss: string) => string;
  };
  sheets: {
    heading: string;
    sum: (n: number, f: number) => string;
    search: string;
    placeholder: string;
    all: string;
    empty: string;
    right: string;
    why: string;
    freed: string;
    review: string;
    close: string;
    domains: string;
    count: (f: number, total: number) => string;
  };
}

const domainName = (key: string, l: Locale) =>
  exam.domains.find((d) => d.key === key)?.name[l] ?? key;

const fr: Copy = {
  lang: 'fr',
  game: 'Les fiches volées',
  pitch:
    'Un RPG au tour par tour pour réviser l’examen Claude Certified Architect : chaque bonne réponse reprend une fiche aux Clawds.',
  play: 'Jouer',
  resume: 'Reprendre',
  close: 'Fermer le jeu',
  help: 'Comment jouer',
  sound: 'Son',
  skip: 'Passer la scène',
  next: 'Suite',
  cont: 'Continuer',
  back: 'Retour',
  enterKey: 'Entrée',
  scrollHint: 'Faire défiler',
  you: 'Toi',
  glose: 'Glose',
  moka: 'Moka',
  scene: 'Scène',
  yourSide: 'Ton côté',
  launch: {
    progress: (f, t) => `${f} / ${t} fiches libérées`,
  },
  chapters: {
    agentic_architecture: {
      short: 'Agents',
      domain: domainName('agentic_architecture', 'fr'),
      places: ['La salle de contrôle', 'Le couloir des workers', 'L’arène'],
      intro:
        'Architecture agentique et orchestration. Ici, des agents se passent le travail. Garde le fil de qui fait quoi.',
      boss: {
        name: 'La Boucle Sans Fin',
        a: 'La Boucle Sans Fin',
        move: 'Rappel en boucle',
        taunt: 'Je rappelle. Je rappelle. Je rappelle.',
        announce:
          'La Boucle Sans Fin se relance : deux coups d’affilée, sans condition d’arrêt !',
        hit: (d) =>
          `La Boucle Sans Fin t’entraîne dans un tour de plus : ${d} PV.`,
        fall: 'La Boucle Sans Fin trouve enfin sa condition d’arrêt.',
      },
    },
    claude_code: {
      short: 'Claude Code',
      domain: domainName('claude_code', 'fr'),
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
        move: 'Tout autoriser',
        taunt: 'Pourquoi demander ? J’ai déjà tout accepté.',
        announce:
          'Le Tout-Permis ouvre toutes les vannes : une onde vous frappe tous les deux et vide 2 encres !',
        hit: (d) => `Le Tout-Permis exécute sans demander : ${d} PV.`,
        fall: 'Le Tout-Permis se retrouve enfin derrière une liste blanche.',
      },
    },
    prompt_engineering: {
      short: 'Prompts',
      domain: domainName('prompt_engineering', 'fr'),
      places: ['Les rayonnages', 'La salle de lecture', 'Le scriptorium'],
      intro:
        'Ingénierie des prompts et sorties structurées. Des consignes claires, des exemples, un schéma qui tient.',
      boss: {
        name: 'Sire Hors-Format',
        a: 'Sire Hors-Format',
        move: 'Format libre',
        taunt:
          'Un schéma ? Je réponds comme je veux, dans l’ordre que je veux.',
        announce: 'Sire Hors-Format mélange les réponses sous tes yeux !',
        hit: (d) => `Sire Hors-Format te noie sous la prose : ${d} PV.`,
        fall: 'Sire Hors-Format rentre enfin dans le schéma.',
      },
    },
    tool_design_mcp: {
      short: 'Outils et MCP',
      domain: domainName('tool_design_mcp', 'fr'),
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
        move: 'Appel à l’aveugle',
        taunt: 'Quel tool ? Le premier venu fera l’affaire.',
        announce:
          'Le Répartiteur Aveugle coupe la ligne : Glose ne peut plus rien faire pendant 2 tours.',
        hit: (d) =>
          `Le Répartiteur Aveugle branche le mauvais câble : ${d} PV.`,
        fall: 'Le Répartiteur Aveugle retire son bandeau et lit enfin les descriptions.',
      },
    },
    context_management: {
      short: 'Contexte',
      domain: domainName('context_management', 'fr'),
      places: ['Les archives', 'Le long rayon', 'La cave inondée'],
      intro:
        'Gestion du contexte et fiabilité. Ce qui entre dans la fenêtre, ce qui en sort, et ce qui fuit.',
      boss: {
        name: 'La Fuite Mémoire',
        a: 'La Fuite Mémoire',
        move: 'Fuite',
        taunt: 'Ton contexte ? Il coule déjà chez moi.',
        announce:
          'La Fuite Mémoire aspire une encre et tache tes questions pendant 2 tours.',
        hit: (d) => `La Fuite Mémoire déborde sur toi : ${d} PV.`,
        fall: 'La Fuite Mémoire est colmatée. Il n’en reste qu’une flaque.',
      },
    },
  },
  types: {
    grib: {
      name: 'Gribouille',
      a: 'Un Gribouille',
      taunt: 'Hé hé. Plus personne ne lira cette fiche.',
      hit: (d) => `Le Gribouille te barbouille d’encre : ${d} PV.`,
      fall: 'Le Gribouille fond en une flaque d’encre.',
    },
    fau: {
      name: 'Faussaire',
      a: 'Un Faussaire',
      taunt: 'Ma réponse a l’air juste. Cherche donc la faille.',
      hit: (d) => `Le Faussaire te colle un faux en pleine figure : ${d} PV.`,
      fall: 'Le Faussaire détale, ses faux sous le bras.',
    },
    cut: {
      name: 'Coupe-fil',
      a: 'Un Coupe-fil',
      taunt: 'Une étape, la suivante… snip. Plus rien ne les relie.',
      hit: (d) => `Le Coupe-fil te taille en pointe : ${d} PV.`,
      fall: 'Le Coupe-fil s’emmêle dans ses propres fils et file.',
    },
    mask: {
      name: 'Masque',
      a: 'Un Masque',
      taunt: 'Tu me reconnais ? Non ? Parfait.',
      hit: (d) => `Le Masque te prend par surprise : ${d} PV.`,
      fall: 'Le masque tombe. Il n’y avait personne dessous.',
    },
    pil: {
      name: 'Pilleur',
      a: 'Un Pilleur',
      taunt: 'Je prends ce qui traîne. Ton sac, par exemple.',
      hit: (d) => `Le Pilleur te fait les poches : ${d} PV.`,
      fall: 'Le Pilleur lâche son butin et décampe.',
    },
    din: {
      name: 'Brouhaha',
      a: 'Un Brouhaha',
      taunt: 'Plus il y a de bruit dans le contexte, mieux je me porte.',
      hit: (d) => `Le Brouhaha te crie dans les oreilles : ${d} PV.`,
      fall: 'Le Brouhaha se tait. Le silence revient d’un coup.',
    },
  },
  weapons: {
    duel: { name: 'Duel', options: '2 options' },
    trident: { name: 'Trident', options: '3 options' },
    exam: { name: 'Examen', options: '4 options' },
  },
  dmg: (n) => `${n} dégât${n > 1 ? 's' : ''}`,
  weak: 'Faible x2',
  resist: 'Résiste',
  unknown: '?',
  fogBlocked: 'Le brouillard couvre le terrain : pas de Duel tant qu’il dure.',
  intentLabel: (k, n, special) =>
    ({
      hit: `Frappe ${n}`,
      big: `Grosse frappe ${n}`,
      charge: 'Charge…',
      ink: 'Vol d’encre',
      gag: 'Bâillon',
      tache: 'Tache',
      back: 'Recule',
      wave: `Onde ${n}`,
      fog: 'Brouillard',
      special,
      stun: 'Étourdi',
    })[k],
  intentHelp: (k, n, special) =>
    ({
      hit: `Il te frappera de ${n} PV après ton action.`,
      big: `Il cogne fort : ${n} PV. La Garde divise par deux.`,
      charge: 'Il prend son élan : grosse frappe au tour suivant.',
      ink: 'Il volera une encre à Glose.',
      gag: 'Il bâillonnera Glose pendant 2 tours.',
      tache: 'Il tachera un mot de tes questions pendant 2 tours.',
      back: 'Il recule et regagne 2 PV.',
      wave: `Zone : touche vos deux héros, ${n} PV pour toi et 1 encre pour Glose. La Garde divise les PV par deux.`,
      fog: 'Zone : il couvre le terrain de brouillard, pas de Duel pendant 2 tours. Le Buvard le dissipe.',
      special: `Coup spécial : ${special}.`,
      stun: 'Il chancelle : il ne fera rien ce tour-ci.',
    })[k],
  intentAria: (label, help) => `Intention : ${label}. ${help}`,
  powers: {
    hint: {
      name: 'Indice',
      text: 'Raye une mauvaise réponse à ta prochaine question.',
    },
    echo: {
      name: 'Écho',
      text: 'Ta prochaine bonne réponse touche aussi tous les autres ennemis : 1 PV chacun.',
    },
    balm: { name: 'Baume', text: 'Rend 6 PV.' },
    blot: { name: 'Buvard', text: 'Efface Tache, Rature et Brouillard.' },
  },
  powerBlocked: {
    ink: (c) => `Il faut ${c} encre. La Garde en rend 1.`,
    full: 'Tes PV sont au maximum.',
    clean: 'Rien à éponger.',
    echo: 'L’Écho est déjà prêt.',
  },
  inkCost: (n) => `${n} encre`,
  items: {
    cafe: { name: 'Café', text: 'Rend 8 PV.' },
    gomme: {
      name: 'Gomme',
      text: 'Efface une mauvaise réponse à ta prochaine question.',
    },
    tampon: {
      name: 'Tampon',
      text: 'Absorbe ta prochaine erreur : ni PV ni Verve perdus.',
    },
  },
  itemBlocked: {
    full: 'Tes PV sont au maximum.',
    waiting: 'Un Tampon attend déjà.',
  },
  boons: {
    ink: { name: '+1 encre max', text: 'Pour le reste du chapitre.' },
    crit: {
      name: 'Premier trait',
      text: 'Ta première bonne réponse de chaque combat est critique.',
    },
    pv: { name: '+4 PV max', text: 'Et soigne 4 PV tout de suite.' },
  },
  doors: {
    combat: { name: 'Combat', text: 'Une rencontre ordinaire.' },
    elite: { name: 'Élite', text: 'Plus coriace, meilleur coffre.' },
    cafe: { name: 'Café de Moka', text: 'Rend 12 PV et 1 encre.' },
    coffre: { name: 'Coffre', text: 'Un coffre sans gardien.' },
    boss: { name: 'Le chef', text: '' },
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
  ],
  status: {
    level: (l) => `Niv. ${l}`,
    xpAria: (xp, of) => `${xp} XP sur ${of}`,
    sheets: (f, t) => `${f}/${t} fiches`,
    hp: 'PV',
    hpAria: (h, m) => `PV ${h} sur ${m}`,
    inkAria: (i, m) => `Encre ${i} sur ${m}`,
    verveAria: (v, m) => `Verve ${v} sur ${m}`,
    step: (i, o) => `Étape ${i} sur ${o}`,
    bossStep: 'Chef',
    chapterTag: (i) => `Ch. ${i}`,
    fog: (n) => `Brouillard ${n}`,
  },
  chips: {
    guard: 'Garde',
    tache: (n) => `Tache ${n}`,
    rature: 'Rature',
    hint: (n) => `Indice x${n}`,
    tampon: 'Tampon',
    echo: 'Écho',
    gag: (n) => `Bâillon ${n}`,
  },
  actions: {
    glose: 'Glose',
    guard: 'Garde',
    bag: (n) => `Sac ${n}`,
    verve: 'Verve',
    flee: 'Fuir',
    sheets: 'Les fiches',
    howto: 'Comment jouer',
    reset: 'Recommencer',
    cines: 'Scènes',
    start: 'Commencer',
    cont: 'Continuer',
    enter: (s) => `Entrer : ${s}`,
    locked: (b) => `Verrouillé : bats ${b}`,
    lockedWhy: 'Ce chapitre est encore fermé.',
    faceBoss: 'Affronter le chef',
  },
  labels: {
    sound: 'Avec le son ?',
    whichDoor: 'Quelle porte ?',
    chest: 'Choisis ton trésor',
    powers: 'Pouvoirs de Glose',
    bag: 'Sac',
    verveFull: 'Verve pleine',
    confirmReset: 'Tout effacer ?',
    resetYes: 'Oui, effacer',
    resetNo: 'Non, garder',
    fleeAsk: 'Rentrer à la carte ?',
    fleeYes: 'Oui, rentrer',
    fleeNo: 'Non, rester',
    progress: 'Ton progrès',
    mixing: 'Regarde bien… il mélange.',
    answer: 'Choisis ta réponse',
    pickWeapon: 'Choisis ton arme',
    yourTurn: 'À toi',
    foeTurn: 'Tour ennemi',
    victory: 'Victoire',
    bossDown: 'Chef vaincu',
    retreat: 'Repli',
    yes: 'Oui',
    no: 'Non',
    cines: 'Revoir une scène',
  },
  verve: {
    plume: {
      name: 'Coup de plume',
      text: (f) => `Frappe ${f} de 6 sans question. La fiche reste à gagner.`,
    },
    second: { name: 'Second souffle', text: 'Tu agis deux fois ce tour-ci.' },
    secondSay: 'Second souffle ! Tu agis deux fois avant eux.',
  },
  lines: {
    titleNew:
      'Les Clawds m’ont volé mes 300 fiches de révision. Tu m’aides à les reprendre ?',
    titleBack:
      'Te revoilà. Mon classeur se souvient de chaque fiche que tu as libérée.',
    mapFirst:
      'Commence par l’architecture agentique. Les autres chapitres s’ouvriront ensuite.',
    mapAll:
      'Les cinq chefs sont tombés. Rejoue un chapitre pour libérer les fiches qui restent.',
    mapAt: (s, f, t) => `${s}, c’est par là. ${f} fiches libérées sur ${t}.`,
    lockedTip: (b) => `Fermé tant que ${b} tient debout.`,
    roomAria: (i, d, f, t, locked) =>
      `Chapitre ${i}, ${d}, ${f} fiches sur ${t}${locked ? ', verrouillé' : ''}`,
    refill: (ink, hp) =>
      ink && hp
        ? `Je recharge ma plume : +${ink} encre, et je panse tes bleus : +${hp} PV.`
        : ink
          ? `Je recharge ma plume : +${ink} encre.`
          : `Je panse tes bleus : +${hp} PV.`,
    twoDoors: 'Deux portes. À toi de choisir.',
    bossDoor: (b) => `Derrière cette porte : ${b}. Respire, et lis bien.`,
    bossWaits: 'Le chef attend derrière la porte.',
    chapterWon: (n) => `Chapitre gagné. ${n} s’ouvre sur la carte.`,
    allWon:
      'Les cinq chefs sont tombés. Mon classeur n’a jamais été aussi complet.',
    cafe: 'Moka pose deux tasses fumantes sur le comptoir.',
    cafeGlose: (hp, ink) =>
      `Ah, Moka. Toujours là quand il faut. +${hp} PV, +${ink} encre.`,
    chestPlain: 'Un coffre. Prends ce qui t’aidera le plus.',
    chestRich: 'Un coffre d’élite : trois trésors, un seul à prendre.',
    took: (n) => `Tu prends : ${n}.`,
    appearsOne: (a, elite) =>
      `${a} apparaît${elite ? ', plus coriace que les autres' : ''} !`,
    appearsMany: (names) =>
      `${names.slice(0, -1).join(', ')} et ${names[names.length - 1]} surgissent !`,
    teachIntent:
      'L’étiquette au-dessus de lui, c’est ce qu’il fera après toi. Touche-la pour la lire.',
    teachWeapons:
      'Choisis une arme : le Duel montre 2 réponses et frappe 1, le Trident 3 et frappe 2, l’Examen les 4 et frappe 3.',
    teachArea:
      'Une attaque de zone ! Elle vous touche tous les deux. La Garde en divise les PV par deux.',
    maskWarn: 'Un Masque ! Tant qu’il tient debout, il protège les autres.',
    pilWarn: 'Un Pilleur : tous les trois tours, il vole un objet de ton sac.',
    dinWarn:
      'Un Brouhaha : ses ondes nous touchent tous les deux, et son brouillard bloque le Duel.',
    guardTip:
      'Il a chargé : la grosse frappe tombe après ton action. La Garde la divise par deux.',
    aim: (name, many, second) =>
      `${second ? 'Second souffle : deux actions. ' : ''}Tu vises <b>${name}</b>. ${many ? 'Touche un autre ennemi pour changer de cible.' : 'Choisis ton arme.'}`,
    shieldSay: 'Le Masque me protège !',
    fled: 'Tu files vers la carte. Les fiches libérées restent libérées.',
    bufferStrike: (a) => `Réponse : « ${a} ».`,
    verdictRight: 'Juste.',
    verdictWrong: 'Pas cette fois.',
    tallyNone: 'Aucune fiche libérée dans ce combat. Elles t’attendent encore.',
    tallyCard: (n, a) => `<b>${n}</b> · réponse : ${a}`,
    tallySum: (n, xp) =>
      `${n} ${n > 1 ? 'fiches libérées' : 'fiche libérée'}. Tu gagnes ${xp} XP.`,
    levelUp: (l, t) => `Niveau ${l} ! Te voilà ${t}. Choisis ton progrès.`,
    levelName: (l) => `Niveau ${l}`,
    perkPv: (n) => `+${n} PV max`,
    perkPvText: 'Pour tous les chapitres.',
    perkInk: '+1 encre max',
    perkInkText: 'Glose en garde une goutte de plus.',
    perkCapped: 'Déjà au plafond.',
    defeat: 'Tu tombes à genoux…',
    defeatGlose:
      'Je te rattrape par la manche. On rentre. Ce que tu as libéré reste libéré.',
    inked: 'mot taché',
    gagged: (n) => `Glose est bâillonné encore ${n} tour${n > 1 ? 's' : ''}.`,
    bagEmpty: 'Ton sac est vide.',
    crit: 'CRITIQUE !',
  },
  msg: {
    hit: (a) =>
      `Touché ! ${a.name} perd ${a.n} PV. La fiche rejoint le classeur de Glose.`,
    hitCrit: (a) =>
      `Coup critique ! ${a.name} perd ${a.n} PV. La fiche rejoint le classeur de Glose.`,
    hitResist: (a) =>
      `${a.name} encaisse : ${a.n} PV seulement. La fiche rejoint le classeur de Glose.`,
    plume: (a) => `Coup de plume ! ${a.name} perd ${a.n} PV.`,
    stun: (a) => `${a.name} perd l’équilibre : son prochain tour saute.`,
    stunResisted: (a) =>
      `${a.name} vacille mais tient bon : il sort à peine d’un étourdissement.`,
    knowWeak: (a) => `Je note : ${a.name} craint le ${a.weapon}.`,
    knowResist: (a) => `Je note : ${a.name} encaisse bien le ${a.weapon}.`,
    combo: (a) => `Série x${a.n} : ${a.m} XP.`,
    ratureHalves: () =>
      'La rature alourdit ta plume : dégâts divisés par deux.',
    echo: (a) =>
      `L’écho se propage : ${a.n > 1 ? `${a.n} autres ennemis perdent` : 'l’autre ennemi perd'} 1 PV.`,
    fall: (a) => a.hitLine,
    fled: (a) =>
      `${a.name} s’enfuit avec ${a.n > 1 ? `${a.n} fiches` : 'une fiche'} : tu les retrouveras dans un autre combat.`,
    miss: (a) => `Raté. Riposte : ${a.hitLine}`,
    missBuffered: () =>
      'Raté, mais le Tampon absorbe l’erreur : ni PV ni Verve perdus.',
    ratureCut: () =>
      'Ses ciseaux entaillent ta plume. Rature : ta prochaine attaque fera moitié moins mal.',
    guard: (a) =>
      `Tu te mets en garde : le prochain coup fera moitié moins mal.${a.n ? ' Glose trempe sa plume : +1 encre.' : ''}`,
    skip: (a) => `${a.name} reprend ses esprits et laisse passer son tour.`,
    enemyHit: (a) =>
      `${a.big ? 'Grosse frappe ! ' : ''}${a.hitLine}${a.guarded ? ' La garde amortit.' : ''}`,
    charge: (a) =>
      `${a.name} prend son élan. Au prochain tour : grosse frappe.`,
    inkDrain: (a) => `${a.name} siphonne l’encrier de Glose : -1 encre.`,
    inkEmpty: (a) => `${a.name} fouille l’encrier de Glose. Il est vide.`,
    gag: (a) =>
      `${a.name} bâillonne Glose : plus de pouvoirs pendant ${a.n} tours.`,
    tache: (a) =>
      `${a.name} t’éclabousse. Tache : un mot de tes questions sera noirci pendant ${a.n} tours.`,
    heal: (a) => `${a.name} recule et reprend ${a.n} PV.`,
    backIdle: (a) => `${a.name} recule et t’observe.`,
    wave: (a) =>
      `Onde de ${a.name} ! Elle vous touche tous les deux : ${a.n} PV pour toi${a.m ? `, ${a.m} encre${a.m > 1 ? 's' : ''} pour Glose` : ''}.${a.guarded ? ' La garde amortit.' : ''}`,
    fog: (a) =>
      `${a.name} noie le terrain sous le brouillard : pas de Duel pendant ${a.n} tours.`,
    specialName: (a) => `${a.boss} !`,
    specialAnnounce: (a) => a.hitLine,
    theftItem: (a) =>
      `${a.name} plonge la main dans ton sac et file avec : ${a.item} !`,
    theftVerve: (a) => `${a.name} te vole ton élan : -${a.n} Verve.`,
    summonCry: () => 'À moi, la garde !',
    summonArrive: (a) => `${a.name} accourt au secours du chef.`,
    powerHint: () => 'À ta prochaine question, je raye une mauvaise réponse.',
    powerEcho: () =>
      'Je prépare un écho : ta prochaine bonne réponse résonnera sur tous les autres.',
    powerBalm: (a) => `Un peu d’encre tiède sur les bleus. +${a.n} PV.`,
    powerBlot: () => 'Un coup de buvard, et on y voit clair.',
    itemCafe: (a) => `Une gorgée de café. +${a.n} PV.`,
    itemGomme: () =>
      'La Gomme effacera une mauvaise réponse à ta prochaine question.',
    itemTampon: () => 'Le Tampon absorbera ta prochaine erreur.',
  },
  howto: {
    title: 'Comment jouer',
    items: [
      'Chaque Clawd tient des fiches de l’examen. Touche un ennemi pour le viser, choisis une arme, puis la bonne réponse : la fiche est libérée et l’ennemi perd des PV.',
      'Les trois armes posent la même question. Le <b>Duel</b> montre 2 réponses et frappe 1, le <b>Trident</b> 3 et frappe 2, l’<b>Examen</b> les 4, comme le jour J, et frappe 3.',
      'Chaque type d’ennemi craint une arme (x2, il chancelle) et en encaisse une autre (moitié).',
      'L’étiquette au-dessus d’un ennemi annonce ce qu’il fera après ton action. Une erreur ajoute une riposte, et la fiche passe « à revoir ».',
      '<b>Zone</b> : l’Onde touche vos deux héros, le Brouillard bloque le Duel 2 tours. L’<b>Écho</b> de Glose fait rebondir ta prochaine bonne réponse sur tous les autres ennemis.',
      '<b>Garde</b> divise le prochain coup par deux et rend 1 encre. Pleine, la <b>Verve</b> offre un coup spécial. Tant qu’un <b>Masque</b> tient debout, il protège les autres.',
    ],
    close: 'Fermer',
  },
  legend: {
    hit: 'Frappe',
    charge: 'Charge',
    big: 'Grosse frappe',
    wave: 'Onde (zone)',
    fog: 'Brouillard (zone)',
    ink: 'Vol d’encre',
    gag: 'Bâillon',
    tache: 'Tache',
    back: 'Recule',
    stun: 'Étourdi',
  },
  cines: {
    intro: {
      title: 'Le vol des fiches',
      shots: [
        'La nuit tombe sur les archives. Glose range ses 300 fiches pour l’examen.',
        'Des Clawds maléfiques surgissent et dispersent les fiches dans cinq domaines.',
        'Il faut les reprendre, une bonne réponse à la fois.',
      ],
    },
    ending: {
      title: 'Le classeur complet',
      shots: [
        'Le dernier chef tombe. L’aube passe par la fenêtre.',
        'Glose referme son classeur : cinq domaines, cinq chefs vaincus.',
        'Il reste à revoir les fiches marquées. Le jour de l’examen, tu les reconnaîtras.',
      ],
    },
  },
  cineTitles: {
    chapter: (i, s) => `Chapitre ${i} · ${s}`,
    fall: (b) => `La chute : ${b}`,
  },
  sheets: {
    heading: 'Les fiches',
    sum: (n, f) => `${n} fiches, ${f} déjà libérées.`,
    search: 'Chercher une fiche',
    placeholder: 'prompt, hook, MCP…',
    all: 'Toutes',
    empty: 'Aucune fiche ne correspond. Essaie un autre mot.',
    right: 'Bonne réponse',
    why: 'Pourquoi',
    freed: 'Libérée',
    review: 'À revoir',
    close: 'Fermer les fiches',
    domains: 'Domaines',
    count: (f, t) => `${f} / ${t} libérées`,
  },
};

const en: Copy = {
  lang: 'en',
  game: 'The Stolen Cards',
  pitch:
    'A turn-based RPG to revise for the Claude Certified Architect exam: every right answer wins a card back from the Clawds.',
  play: 'Play',
  resume: 'Resume',
  close: 'Close the game',
  help: 'How to play',
  sound: 'Sound',
  skip: 'Skip the scene',
  next: 'Next',
  cont: 'Continue',
  back: 'Back',
  enterKey: 'Enter',
  scrollHint: 'Scroll',
  you: 'You',
  glose: 'Glose',
  moka: 'Moka',
  scene: 'Scene',
  yourSide: 'Your side',
  launch: {
    progress: (f, t) => `${f} / ${t} cards freed`,
  },
  chapters: {
    agentic_architecture: {
      short: 'Agents',
      domain: domainName('agentic_architecture', 'en'),
      places: ['The control room', 'The workers’ corridor', 'The arena'],
      intro:
        'Agentic architecture and orchestration. Agents hand work to each other here. Keep track of who does what.',
      boss: {
        name: 'The Endless Loop',
        a: 'The Endless Loop',
        move: 'Recursive call',
        taunt: 'I call again. I call again. I call again.',
        announce:
          'The Endless Loop restarts itself: two blows in a row, no stop condition!',
        hit: (d) =>
          `The Endless Loop drags you through one more turn: ${d} HP.`,
        fall: 'The Endless Loop finally finds its stop condition.',
      },
    },
    claude_code: {
      short: 'Claude Code',
      domain: domainName('claude_code', 'en'),
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
        move: 'Allow everything',
        taunt: 'Why ask? I already said yes to everything.',
        announce:
          'The Allow-All opens every valve: a wave hits you both and drains 2 ink!',
        hit: (d) => `The Allow-All runs it without asking: ${d} HP.`,
        fall: 'The Allow-All is finally put behind an allowlist.',
      },
    },
    prompt_engineering: {
      short: 'Prompts',
      domain: domainName('prompt_engineering', 'en'),
      places: ['The stacks', 'The reading room', 'The scriptorium'],
      intro:
        'Prompt engineering and structured output. Clear instructions, examples, a schema that holds.',
      boss: {
        name: 'Sir Off-Schema',
        a: 'Sir Off-Schema',
        move: 'Freeform',
        taunt: 'A schema? I answer however I like, in whatever order I like.',
        announce: 'Sir Off-Schema shuffles the answers right in front of you!',
        hit: (d) => `Sir Off-Schema buries you in prose: ${d} HP.`,
        fall: 'Sir Off-Schema finally fits the schema.',
      },
    },
    tool_design_mcp: {
      short: 'Tools & MCP',
      domain: domainName('tool_design_mcp', 'en'),
      places: ['The machine room', 'The patch panel', 'The switchboard'],
      intro:
        'Tool design and MCP integration. A good tool is picked by its description. Read them well.',
      boss: {
        name: 'The Blind Dispatcher',
        a: 'The Blind Dispatcher',
        move: 'Blind call',
        taunt: 'Which tool? Any tool will do.',
        announce:
          'The Blind Dispatcher cuts the line: Glose can do nothing for 2 turns.',
        hit: (d) => `The Blind Dispatcher plugs in the wrong cable: ${d} HP.`,
        fall: 'The Blind Dispatcher takes off the blindfold and finally reads the descriptions.',
      },
    },
    context_management: {
      short: 'Context',
      domain: domainName('context_management', 'en'),
      places: ['The archives', 'The long shelf', 'The flooded cellar'],
      intro:
        'Context management and reliability. What goes into the window, what comes out, and what leaks.',
      boss: {
        name: 'The Memory Leak',
        a: 'The Memory Leak',
        move: 'Leak',
        taunt: 'Your context? It is already leaking into me.',
        announce:
          'The Memory Leak drains 1 ink and smudges your questions for 2 turns.',
        hit: (d) => `The Memory Leak spills over you: ${d} HP.`,
        fall: 'The Memory Leak is plugged. Only a puddle is left.',
      },
    },
  },
  types: {
    grib: {
      name: 'Scribbler',
      a: 'A Scribbler',
      taunt: 'Heh heh. Nobody will ever read this card again.',
      hit: (d) => `The Scribbler smears ink all over you: ${d} HP.`,
      fall: 'The Scribbler melts into a puddle of ink.',
    },
    fau: {
      name: 'Forger',
      a: 'A Forger',
      taunt: 'My answer looks right. Go on, find the flaw.',
      hit: (d) => `The Forger slaps a fake right in your face: ${d} HP.`,
      fall: 'The Forger bolts, fakes under his arm.',
    },
    cut: {
      name: 'Snipper',
      a: 'A Snipper',
      taunt: 'One step, the next… snip. Nothing links them now.',
      hit: (d) => `The Snipper trims you to a point: ${d} HP.`,
      fall: 'The Snipper gets tangled in its own threads and runs.',
    },
    mask: {
      name: 'Mask',
      a: 'A Mask',
      taunt: 'Do you recognise me? No? Perfect.',
      hit: (d) => `The Mask catches you by surprise: ${d} HP.`,
      fall: 'The mask falls. There was nobody underneath.',
    },
    pil: {
      name: 'Looter',
      a: 'A Looter',
      taunt: 'I take whatever is lying around. Your bag, for instance.',
      hit: (d) => `The Looter picks your pockets: ${d} HP.`,
      fall: 'The Looter drops the loot and scarpers.',
    },
    din: {
      name: 'Din',
      a: 'A Din',
      taunt: 'The more noise in the context, the better I feel.',
      hit: (d) => `The Din yells in your ears: ${d} HP.`,
      fall: 'The Din goes quiet. Silence falls at once.',
    },
  },
  weapons: {
    duel: { name: 'Duel', options: '2 options' },
    trident: { name: 'Trident', options: '3 options' },
    exam: { name: 'Exam', options: '4 options' },
  },
  dmg: (n) => `${n} damage`,
  weak: 'Weak x2',
  resist: 'Resists',
  unknown: '?',
  fogBlocked: 'Fog covers the field: no Duel while it lasts.',
  intentLabel: (k, n, special) =>
    ({
      hit: `Hit ${n}`,
      big: `Heavy hit ${n}`,
      charge: 'Charging…',
      ink: 'Ink theft',
      gag: 'Gag',
      tache: 'Smudge',
      back: 'Retreat',
      wave: `Wave ${n}`,
      fog: 'Fog',
      special,
      stun: 'Stunned',
    })[k],
  intentHelp: (k, n, special) =>
    ({
      hit: `He will hit you for ${n} HP after your action.`,
      big: `He hits hard: ${n} HP. Guard halves it.`,
      charge: 'He is winding up: a heavy hit next turn.',
      ink: 'He will steal 1 ink from Glose.',
      gag: 'He will gag Glose for 2 turns.',
      tache: 'He will smudge a word of your questions for 2 turns.',
      back: 'He backs off and gets 2 HP back.',
      wave: `Area: hits both heroes, ${n} HP for you and 1 ink for Glose. Guard halves the HP.`,
      fog: 'Area: he covers the field in fog, no Duel for 2 turns. The Blotter clears it.',
      special: `Special move: ${special}.`,
      stun: 'He is reeling: he will do nothing this turn.',
    })[k],
  intentAria: (label, help) => `Intent: ${label}. ${help}`,
  powers: {
    hint: {
      name: 'Hint',
      text: 'Strikes out a wrong answer at your next question.',
    },
    echo: {
      name: 'Echo',
      text: 'Your next right answer also hits every other enemy: 1 HP each.',
    },
    balm: { name: 'Balm', text: 'Gives back 6 HP.' },
    blot: { name: 'Blotter', text: 'Clears Smudge, Scratch and Fog.' },
  },
  powerBlocked: {
    ink: (c) => `It takes ${c} ink. Guard gives 1 back.`,
    full: 'Your HP is full.',
    clean: 'Nothing to clear.',
    echo: 'The Echo is already set.',
  },
  inkCost: (n) => `${n} ink`,
  items: {
    cafe: { name: 'Coffee', text: 'Gives back 8 HP.' },
    gomme: {
      name: 'Eraser',
      text: 'Erases a wrong answer at your next question.',
    },
    tampon: {
      name: 'Buffer',
      text: 'Absorbs your next mistake: no HP or Verve lost.',
    },
  },
  itemBlocked: {
    full: 'Your HP is full.',
    waiting: 'A Buffer is already set.',
  },
  boons: {
    ink: { name: '+1 max ink', text: 'For the rest of the chapter.' },
    crit: {
      name: 'First strike',
      text: 'Your first right answer of each fight is critical.',
    },
    pv: { name: '+4 max HP', text: 'And heals 4 HP right away.' },
  },
  doors: {
    combat: { name: 'Fight', text: 'An ordinary encounter.' },
    elite: { name: 'Elite', text: 'Tougher, better chest.' },
    cafe: { name: 'Moka’s café', text: 'Gives back 12 HP and 1 ink.' },
    coffre: { name: 'Chest', text: 'An unguarded chest.' },
    boss: { name: 'The boss', text: '' },
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
  ],
  status: {
    level: (l) => `Lvl ${l}`,
    xpAria: (xp, of) => `${xp} XP of ${of}`,
    sheets: (f, t) => `${f}/${t} cards`,
    hp: 'HP',
    hpAria: (h, m) => `HP ${h} of ${m}`,
    inkAria: (i, m) => `Ink ${i} of ${m}`,
    verveAria: (v, m) => `Verve ${v} of ${m}`,
    step: (i, o) => `Step ${i} of ${o}`,
    bossStep: 'Boss',
    chapterTag: (i) => `Ch. ${i}`,
    fog: (n) => `Fog ${n}`,
  },
  chips: {
    guard: 'Guard',
    tache: (n) => `Smudge ${n}`,
    rature: 'Scratch',
    hint: (n) => `Hint x${n}`,
    tampon: 'Buffer',
    echo: 'Echo',
    gag: (n) => `Gag ${n}`,
  },
  actions: {
    glose: 'Glose',
    guard: 'Guard',
    bag: (n) => `Bag ${n}`,
    verve: 'Verve',
    flee: 'Flee',
    sheets: 'The cards',
    howto: 'How to play',
    reset: 'Start over',
    cines: 'Scenes',
    start: 'Start',
    cont: 'Continue',
    enter: (s) => `Enter: ${s}`,
    locked: (b) => `Locked: beat ${b}`,
    lockedWhy: 'This chapter is still closed.',
    faceBoss: 'Face the boss',
  },
  labels: {
    sound: 'With sound?',
    whichDoor: 'Which door?',
    chest: 'Pick your treasure',
    powers: 'Glose’s powers',
    bag: 'Bag',
    verveFull: 'Verve full',
    confirmReset: 'Erase everything?',
    resetYes: 'Yes, erase',
    resetNo: 'No, keep it',
    fleeAsk: 'Back to the map?',
    fleeYes: 'Yes, go back',
    fleeNo: 'No, stay',
    progress: 'Your progress',
    mixing: 'Watch closely… he is shuffling.',
    answer: 'Pick your answer',
    pickWeapon: 'Pick your weapon',
    yourTurn: 'Your turn',
    foeTurn: 'Enemy turn',
    victory: 'Victory',
    bossDown: 'Boss beaten',
    retreat: 'Retreat',
    yes: 'Yes',
    no: 'No',
    cines: 'Watch a scene again',
  },
  verve: {
    plume: {
      name: 'Quill strike',
      text: (f) =>
        `Hits ${f} for 6 with no question. The card is still to win.`,
    },
    second: { name: 'Second wind', text: 'You act twice this turn.' },
    secondSay: 'Second wind! You act twice before they do.',
  },
  lines: {
    titleNew:
      'The Clawds stole my 300 revision cards. Will you help me get them back?',
    titleBack: 'You are back. My binder remembers every card you freed.',
    mapFirst:
      'Start with agentic architecture. The other chapters open after it.',
    mapAll:
      'All five bosses have fallen. Replay a chapter to free the cards still out there.',
    mapAt: (s, f, t) => `${s} is this way. ${f} cards freed out of ${t}.`,
    lockedTip: (b) => `Closed while ${b} still stands.`,
    roomAria: (i, d, f, t, locked) =>
      `Chapter ${i}, ${d}, ${f} cards of ${t}${locked ? ', locked' : ''}`,
    refill: (ink, hp) =>
      ink && hp
        ? `I refill my quill: +${ink} ink, and patch up your bruises: +${hp} HP.`
        : ink
          ? `I refill my quill: +${ink} ink.`
          : `I patch up your bruises: +${hp} HP.`,
    twoDoors: 'Two doors. Your call.',
    bossDoor: (b) => `Behind this door: ${b}. Breathe, and read carefully.`,
    bossWaits: 'The boss is waiting behind the door.',
    chapterWon: (n) => `Chapter won. ${n} opens on the map.`,
    allWon:
      'All five bosses have fallen. My binder has never been so complete.',
    cafe: 'Moka sets two steaming cups on the counter.',
    cafeGlose: (hp, ink) =>
      `Ah, Moka. Always there when it counts. +${hp} HP, +${ink} ink.`,
    chestPlain: 'A chest. Take whatever helps you most.',
    chestRich: 'An elite chest: three treasures, take one.',
    took: (n) => `You take: ${n}.`,
    appearsOne: (a, elite) =>
      `${a} appears${elite ? ', tougher than the others' : ''}!`,
    appearsMany: (names) =>
      `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]} burst in!`,
    teachIntent:
      'The tag above him is what he will do after you. Tap it to read it.',
    teachWeapons:
      'Pick a weapon: the Duel shows 2 answers and hits 1, the Trident 3 and hits 2, the Exam all 4 and hits 3.',
    teachArea: 'An area attack! It hits you both. Guard halves the HP part.',
    maskWarn: 'A Mask! While it stands, it shields the others.',
    pilWarn: 'A Looter: every three turns, it steals an item from your bag.',
    dinWarn: 'A Din: its waves hit us both, and its fog blocks the Duel.',
    guardTip:
      'He charged: the heavy hit lands after your action. Guard halves it.',
    aim: (name, many, second) =>
      `${second ? 'Second wind: two actions. ' : ''}You are aiming at <b>${name}</b>. ${many ? 'Tap another enemy to switch target.' : 'Pick your weapon.'}`,
    shieldSay: 'The Mask protects me!',
    fled: 'You head back to the map. Freed cards stay freed.',
    bufferStrike: (a) => `Answer: “${a}”.`,
    verdictRight: 'Right.',
    verdictWrong: 'Not this time.',
    tallyNone: 'No card freed in this fight. They are still waiting for you.',
    tallyCard: (n, a) => `<b>${n}</b> · answer: ${a}`,
    tallySum: (n, xp) =>
      `${n} ${n > 1 ? 'cards freed' : 'card freed'}. You earn ${xp} XP.`,
    levelUp: (l, t) => `Level ${l}! You are now ${t}. Pick your progress.`,
    levelName: (l) => `Level ${l}`,
    perkPv: (n) => `+${n} max HP`,
    perkPvText: 'For every chapter.',
    perkInk: '+1 max ink',
    perkInkText: 'Glose keeps one more drop.',
    perkCapped: 'Already at the cap.',
    defeat: 'You drop to your knees…',
    defeatGlose:
      'I catch you by the sleeve. We head back. What you freed stays freed.',
    inked: 'smudged word',
    gagged: (n) => `Glose is gagged for ${n} more turn${n > 1 ? 's' : ''}.`,
    bagEmpty: 'Your bag is empty.',
    crit: 'CRITICAL!',
  },
  msg: {
    hit: (a) =>
      `Hit! ${a.name} loses ${a.n} HP. The card goes into Glose’s binder.`,
    hitCrit: (a) =>
      `Critical hit! ${a.name} loses ${a.n} HP. The card goes into Glose’s binder.`,
    hitResist: (a) =>
      `${a.name} takes it: only ${a.n} HP. The card goes into Glose’s binder.`,
    plume: (a) => `Quill strike! ${a.name} loses ${a.n} HP.`,
    stun: (a) => `${a.name} loses balance: his next turn is skipped.`,
    stunResisted: (a) =>
      `${a.name} reels but holds: he has only just recovered from a stun.`,
    knowWeak: (a) => `Noted: ${a.name} fears the ${a.weapon}.`,
    knowResist: (a) => `Noted: ${a.name} shrugs off the ${a.weapon}.`,
    combo: (a) => `Streak x${a.n}: ${a.m} XP.`,
    ratureHalves: () => 'The scratch weighs your quill down: damage halved.',
    echo: (a) =>
      `The echo spreads: ${a.n > 1 ? `${a.n} other enemies lose` : 'the other enemy loses'} 1 HP.`,
    fall: (a) => a.hitLine,
    fled: (a) =>
      `${a.name} runs off with ${a.n > 1 ? `${a.n} cards` : 'a card'}: you will meet them in another fight.`,
    miss: (a) => `Missed. Counter: ${a.hitLine}`,
    missBuffered: () =>
      'Missed, but the Buffer absorbs the mistake: no HP or Verve lost.',
    ratureCut: () =>
      'Its blades nick your quill. Scratch: your next attack does half damage.',
    guard: (a) =>
      `You raise your guard: the next blow does half damage.${a.n ? ' Glose dips his quill: +1 ink.' : ''}`,
    skip: (a) => `${a.name} comes to and lets the turn go by.`,
    enemyHit: (a) =>
      `${a.big ? 'Heavy hit! ' : ''}${a.hitLine}${a.guarded ? ' Your guard softens it.' : ''}`,
    charge: (a) => `${a.name} winds up. Next turn: a heavy hit.`,
    inkDrain: (a) => `${a.name} siphons Glose’s inkwell: -1 ink.`,
    inkEmpty: (a) => `${a.name} rummages in Glose’s inkwell. It is empty.`,
    gag: (a) => `${a.name} gags Glose: no powers for ${a.n} turns.`,
    tache: (a) =>
      `${a.name} splashes you. Smudge: a word of your questions is blacked out for ${a.n} turns.`,
    heal: (a) => `${a.name} backs off and gets ${a.n} HP back.`,
    backIdle: (a) => `${a.name} backs off and watches you.`,
    wave: (a) =>
      `${a.name}’s wave! It hits you both: ${a.n} HP for you${a.m ? `, ${a.m} ink for Glose` : ''}.${a.guarded ? ' Your guard softens it.' : ''}`,
    fog: (a) => `${a.name} drowns the field in fog: no Duel for ${a.n} turns.`,
    specialName: (a) => `${a.boss}!`,
    specialAnnounce: (a) => a.hitLine,
    theftItem: (a) =>
      `${a.name} reaches into your bag and runs off with: ${a.item}!`,
    theftVerve: (a) => `${a.name} steals your momentum: -${a.n} Verve.`,
    summonCry: () => 'Guards, to me!',
    summonArrive: (a) => `${a.name} rushes to the boss’s side.`,
    powerHint: () => 'At your next question, I strike out a wrong answer.',
    powerEcho: () =>
      'I am setting up an echo: your next right answer will ring through all the others.',
    powerBalm: (a) => `A little warm ink on the bruises. +${a.n} HP.`,
    powerBlot: () => 'A dab of the blotter, and we can see clearly.',
    itemCafe: (a) => `A sip of coffee. +${a.n} HP.`,
    itemGomme: () =>
      'The Eraser will erase a wrong answer at your next question.',
    itemTampon: () => 'The Buffer will absorb your next mistake.',
  },
  howto: {
    title: 'How to play',
    items: [
      'Each Clawd holds exam cards. Tap an enemy to aim, pick a weapon, then the right answer: the card is freed and the enemy loses HP.',
      'The three weapons ask the same question. The <b>Duel</b> shows 2 answers and hits 1, the <b>Trident</b> 3 and hits 2, the <b>Exam</b> all 4, as on the day, and hits 3.',
      'Each enemy type fears one weapon (x2, it reels) and shrugs off another (half).',
      'The tag above an enemy shows what it will do after your action. A mistake adds a counter, and the card is marked “to review”.',
      '<b>Area</b>: the Wave hits both heroes, the Fog blocks the Duel for 2 turns. Glose’s <b>Echo</b> bounces your next right answer onto every other enemy.',
      '<b>Guard</b> halves the next blow and gives 1 ink back. When full, <b>Verve</b> gives a special move. While a <b>Mask</b> stands, it shields the others.',
    ],
    close: 'Close',
  },
  legend: {
    hit: 'Hit',
    charge: 'Charge',
    big: 'Heavy hit',
    wave: 'Wave (area)',
    fog: 'Fog (area)',
    ink: 'Ink theft',
    gag: 'Gag',
    tache: 'Smudge',
    back: 'Retreat',
    stun: 'Stunned',
  },
  cines: {
    intro: {
      title: 'The stolen cards',
      shots: [
        'Night falls on the archives. Glose files away his 300 cards for the exam.',
        'Wicked Clawds burst in and scatter the cards across five domains.',
        'They must be won back, one right answer at a time.',
      ],
    },
    ending: {
      title: 'The full binder',
      shots: [
        'The last boss falls. Dawn comes through the window.',
        'Glose closes his binder: five domains, five bosses beaten.',
        'The cards marked to review are left. On exam day, you will know them.',
      ],
    },
  },
  cineTitles: {
    chapter: (i, s) => `Chapter ${i} · ${s}`,
    fall: (b) => `The fall: ${b}`,
  },
  sheets: {
    heading: 'The cards',
    sum: (n, f) => `${n} cards, ${f} freed so far.`,
    search: 'Search the cards',
    placeholder: 'prompt, hook, MCP…',
    all: 'All',
    empty: 'No card matches. Try another word.',
    right: 'Right answer',
    why: 'Why',
    freed: 'Freed',
    review: 'To review',
    close: 'Close the cards',
    domains: 'Domains',
    count: (f, t) => `${f} / ${t} freed`,
  },
};

/** Chapter scenes are built from the chapter's own copy: entry, boss entrance, boss defeat. */
export function cineCopy(c: Copy, id: string): CineCopy {
  if (c.cines[id]) return c.cines[id];
  const [kind, n] = id.split('-');
  const i = Number(n);
  const ch = chapterCopy(c, i);
  if (kind === 'chapter')
    return {
      title: c.cineTitles.chapter(i + 1, ch.short),
      shots: [ch.domain, ch.places[0]],
    };
  if (kind === 'boss') return { title: ch.boss.name, shots: [ch.boss.taunt] };
  return { title: c.cineTitles.fall(ch.boss.name), shots: [ch.boss.fall] };
}

/** The copy of the chapter at position `i` of the exam. */
export const chapterCopy = (c: Copy, i: number): ChapterCopy =>
  c.chapters[CHAPTERS[i].domain];

export const COPY: Record<Locale, Copy> = { fr, en };
