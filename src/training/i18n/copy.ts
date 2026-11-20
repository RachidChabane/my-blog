/**
 * Every word of the game, in French and English. The `Copy` interface is the contract:
 * both tables implement it, so a string missing in one language fails the type check.
 * French keeps the English tech words (prompt, token, workflow, tool, hook). The page's
 * own words (launch card, sheets, chapter names) live in page-copy.ts.
 */
import type { Locale } from '@/i18n/index';
import type { Affinity, Element } from '../domain/elements';
import type { MoveKey, TypeKey } from '../domain/foes';
import type { MemberKey, PassiveKey, Role, SkillKey } from '../domain/party';
import type { BoonKey, FormatKey, ItemKey, PowerKey } from '../domain/rules';
import type { DoorKey } from '../domain/run';
import type { StatusKey } from '../domain/statuses';
import type { ChapterName, PageCopy } from './page-copy';
import { PAGE_COPY } from './page-copy';

/** Someone named in a line: their name, and whether it is the player. */
export interface Who {
  name: string;
  you: boolean;
}

export interface FoeCopy {
  name: string;
  /** With an indefinite article: "Un Gribouille". */
  a: string;
  taunt: string;
  fall: string;
}

export interface BossCopy extends FoeCopy {
  /** What the boss does that no one else does, as Glose explains it. */
  mechanic: string;
  /** Lines of the phases after the first, in order. */
  phases: string[];
}

export interface ChapterCopy extends ChapterName {
  places: [string, string, string];
  intro: string;
  boss: BossCopy;
}

export interface CineCopy {
  title: string;
  shots: string[];
}

export interface MemberCopy {
  name: string;
  /** Their basic attack. */
  attack: string;
  /** What they say when they join. */
  hello: string;
}

export interface Copy {
  lang: Locale;
  page: PageCopy;
  close: string;
  help: string;
  sound: string;
  skip: string;
  next: string;
  cont: string;
  back: string;
  enterKey: string;
  scrollHint: string;
  glose: string;
  scene: string;
  yourSide: string;
  elements: Record<Element, { name: string; to: string }>;
  roles: Record<Role, string>;
  members: Record<MemberKey, MemberCopy>;
  passives: Record<PassiveKey, { name: string; text: string }>;
  skills: Record<SkillKey, { name: string; text: string }>;
  statuses: Record<StatusKey, { name: string; help: string }>;
  /** Keyed by exam domain. */
  chapters: Record<string, ChapterCopy>;
  types: Record<TypeKey, FoeCopy>;
  moves: Record<
    MoveKey,
    { name: string; help: (n: number, who: string) => string }
  >;
  formats: Record<FormatKey, { name: string; options: string }>;
  powers: Record<PowerKey, { name: string; text: string }>;
  items: Record<ItemKey, { name: string; text: string }>;
  boons: Record<BoonKey, { name: string; text: string }>;
  doors: Record<DoorKey, { name: string; text: string }>;
  titles: string[];
  /** Short words stamped on the scene by the animations. */
  stamps: Record<string, string>;
  card: {
    /** A figure the card promises: "−12". */
    dmg: (n: number) => string;
    hits: (n: number, times: number) => string;
    all: string;
    unknown: string;
    aff: Record<Affinity, string>;
    /** The same, short enough for a format card. */
    short: Record<Affinity, string>;
    heal: (n: number, who: string) => string;
    healAll: (pct: number) => string;
    shield: (n: number, who: string) => string;
    revive: (who: string) => string;
    cost: (n: number) => string;
    format: (f: string) => string;
  };
  blocked: {
    tokens: (n: number) => string;
    silence: string;
    nobody: string;
    full: string;
    clean: string;
    known: string;
    echo: string;
    fog: string;
  };
  status: {
    level: (l: number) => string;
    xpAria: (xp: number, of: number) => string;
    sheets: (f: number, total: number) => string;
    hp: string;
    hpAria: (h: number, max: number) => string;
    tokens: string;
    tokensAria: (n: number, max: number) => string;
    memberAria: (name: string, h: number, max: number, sts: string) => string;
    foeAria: (name: string, h: number, max: number, el: string) => string;
    step: (i: number, of: number) => string;
    bossStep: string;
    chapterTag: (i: number) => string;
    fog: (n: number) => string;
    turns: (n: number) => string;
    unknownEl: string;
    down: string;
  };
  actions: {
    skills: string;
    glose: string;
    guard: string;
    bag: (n: number) => string;
    flee: string;
    sheets: string;
    howto: string;
    reset: string;
    cines: string;
    team: string;
    options: string;
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
    skillsOf: (name: string) => string;
    confirmReset: string;
    resetYes: string;
    resetNo: string;
    fleeAsk: string;
    fleeYes: string;
    fleeNo: string;
    progress: string;
    mixing: string;
    answer: string;
    pickFormat: string;
    turnOf: (name: string) => string;
    foeTurn: string;
    victory: string;
    bossDown: string;
    retreat: string;
    yes: string;
    no: string;
    cines: string;
    team: string;
    teamPick: string;
    teamDone: string;
    options: string;
    speed: string;
    speeds: { normal: string; fast: string };
    speedHelp: string;
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
    refill: (tokens: number, hp: number) => string;
    twoDoors: string;
    bossDoor: (boss: string) => string;
    bossWaits: string;
    chapterWon: (next: string) => string;
    allWon: string;
    cafe: string;
    cafeGlose: (hp: number, tokens: number) => string;
    chestPlain: string;
    chestRich: string;
    took: (name: string) => string;
    delivery: (item: string) => string;
    notes: (n: number) => string;
    appearsOne: (a: string, elite: boolean) => string;
    appearsMany: (names: string[]) => string;
    teachIntent: string;
    teachFormats: string;
    teachElements: string;
    teachParty: string;
    teachStatus: string;
    teachArea: string;
    guardTip: string;
    maskWarn: string;
    aim: (name: string, many: boolean) => string;
    shieldSay: string;
    fled: string;
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
    bagEmpty: string;
    lineupFull: (name: string) => string;
    teamAt: (names: string) => string;
    sleeping: (who: string) => string;
  };
  ev: {
    announce: (actor: string, action: string) => string;
    /** The result line, opened with the action it follows. */
    result: (action: string, text: string) => string;
    dmg: (w: Who, d: number, before: number, after: number) => string;
    tick: (
      s: string,
      w: Who,
      d: number,
      before: number,
      after: number
    ) => string;
    heal: (w: Who, n: number, before: number, after: number) => string;
    aff: (a: Affinity, el: Element) => string;
    absorbed: (n: number) => string;
    on: (s: StatusKey, w: Who, turns: number) => string;
    off: (s: StatusKey, w: Who) => string;
    wake: (w: Who) => string;
    resist: (s: StatusKey, w: Who) => string;
    shieldOn: (w: Who, n: number) => string;
    shieldBreak: (w: Who) => string;
    shieldOff: (w: Who) => string;
    skip: (why: 'sleep' | 'stun', w: Who) => string;
    down: (w: Who) => string;
    up: (w: Who, hp: number) => string;
    reveal: (
      name: string,
      el: Element,
      how: 'hit' | 'scan' | 'radar'
    ) => string;
    summon: (name: string) => string;
    fog: (n: number) => string;
    fogOff: string;
    stealItem: (thief: string, item: string) => string;
    stealTokens: (thief: string, n: number) => string;
    miss: string;
    counter: (name: string) => string;
    free: (label: string, xp: number) => string;
    tokens: (n: number) => string;
    combo: (n: number) => string;
    mix: string;
    shift: (name: string, el: Element) => string;
    fizzle: (name: string) => string;
    strike: string;
    echo: string;
    echoReady: string;
    guard: (w: Who) => string;
  };
  howto: { title: string; items: string[]; close: string };
  legend: Partial<Record<MoveKey, string>>;
  cines: Record<string, CineCopy>;
  cineTitles: {
    chapter: (i: number, short: string) => string;
    fall: (boss: string) => string;
    join: (name: string) => string;
  };
}

/* ---------- français ---------- */
const frEl: Copy['elements'] = {
  encre: { name: 'Encre', to: 'à l’Encre' },
  papier: { name: 'Papier', to: 'au Papier' },
  cafe: { name: 'Café', to: 'au Café' },
  courant: { name: 'Courant', to: 'au Courant' },
};
const frStatus: Copy['statuses'] = {
  poison: {
    name: 'Poison',
    help: 'Perd 8 % de ses PV max au début de chacun de ses tours.',
  },
  burn: {
    name: 'Brûlure',
    help: 'Perd 5 % de ses PV max par tour et frappe moitié moins fort.',
  },
  sleep: { name: 'Sommeil', help: 'Passe ses tours. Un coup le réveille.' },
  stun: { name: 'Étourdi', help: 'Passe son prochain tour.' },
  silence: {
    name: 'Silence',
    help: 'Plus de talent ni de coup spécial : seulement des frappes.',
  },
  smudge: {
    name: 'Tache',
    help: 'Un mot d’une mauvaise réponse est taché à ses questions.',
  },
  guard: {
    name: 'Garde',
    help: 'Reçoit moitié moins de dégâts jusqu’à son prochain tour.',
  },
  shield: { name: 'Bouclier', help: 'Absorbe les dégâts jusqu’à se briser.' },
  regen: {
    name: 'Régénération',
    help: 'Récupère 10 % de ses PV max au début de chacun de ses tours.',
  },
  taunt: {
    name: 'Provocation',
    help: 'Attire sur lui les coups qui visent une seule cible.',
  },
  steady: {
    name: 'Aplomb',
    help: 'Vient d’être étourdi : ne peut pas l’être de nouveau tout de suite.',
  },
};
const frYou = (w: Who, verb: [string, string]) =>
  w.you ? `Tu ${verb[0]}` : `${w.name} ${verb[1]}`;

const fr: Copy = {
  lang: 'fr',
  page: PAGE_COPY.fr,
  close: 'Fermer le jeu',
  help: 'Comment jouer',
  sound: 'Son',
  skip: 'Passer la scène',
  next: 'Suite',
  cont: 'Continuer',
  back: 'Retour',
  enterKey: 'Entrée',
  scrollHint: 'Faire défiler',
  glose: 'Glose',
  scene: 'Scène',
  yourSide: 'Ton équipe',
  elements: frEl,
  roles: {
    balance: 'Polyvalent',
    control: 'Contrôle',
    heal: 'Soins',
    defence: 'Défense',
    speed: 'Vitesse',
    support: 'Soutien',
  },
  members: {
    hero: {
      name: 'Toi',
      attack: 'Trait d’encre',
      hello: 'On reprend les fiches. Une bonne réponse à la fois.',
    },
    vigie: {
      name: 'Vigie',
      attack: 'Ping',
      hello: 'Je les suis au radar depuis le début. Je viens avec toi.',
    },
    navette: {
      name: 'Navette',
      attack: 'Navette éclair',
      hello: 'Ces fiches sont à toi ? Je cours plus vite que les câbles.',
    },
    moka: {
      name: 'Moka',
      attack: 'Jet brûlant',
      hello: 'Assez servi derrière le comptoir. Je viens, avec le thermos.',
    },
    tampon: {
      name: 'Tampon',
      attack: 'Coup de tampon',
      hello: 'Ce prompt n’a pas de schéma : refusé. Toi, tu passes.',
    },
    arrosoir: {
      name: 'Arrosoir',
      attack: 'Jet d’arrosoir',
      hello: 'Le contexte, c’est comme une plante : on taille ce qui déborde.',
    },
  },
  passives: {
    diligent: {
      name: 'Appliqué',
      text: 'Une bonne réponse à l’Examen rapporte 1 jeton de plus.',
    },
    radar: {
      name: 'Radar',
      text: 'Révèle l’élément des ennemis au début de chaque combat.',
    },
    pause: {
      name: 'Pause café',
      text: 'Après chaque salle, l’équipe récupère 10 % de PV en plus.',
    },
    paperwork: {
      name: 'Paperasse',
      text: 'Chaque coup reçu lui fait 2 PV de moins.',
    },
    delivery: {
      name: 'Livraison',
      text: 'Après chaque victoire, rapporte un objet dans le sac.',
    },
    greenThumb: {
      name: 'Main verte',
      text: 'Au début de chaque tour, l’équipe récupère 2 PV.',
    },
  },
  skills: {
    coulure: {
      name: 'Coulure',
      text: 'Frappe à 3 choix et empoisonne 3 tours.',
    },
    relecture: {
      name: 'Relecture',
      text: 'Rend 35 % de tes PV et efface tes maux.',
    },
    balayage: {
      name: 'Balayage radar',
      text: 'Révèle l’élément de chaque ennemi. Sans question.',
    },
    brouillage: {
      name: 'Brouillage',
      text: 'Frappe à 3 choix (moitié) et réduit au silence 2 tours.',
    },
    decharge: {
      name: 'Décharge',
      text: 'Frappe à 4 choix et étourdit 1 tour.',
    },
    espresso: {
      name: 'Espresso',
      text: 'Rend 40 % des PV au plus blessé et efface ses maux.',
    },
    tournee: {
      name: 'Tournée générale',
      text: 'Rend 25 % des PV à tous, puis régénération 3 tours.',
    },
    ebouillanter: {
      name: 'Ébouillanter',
      text: 'Frappe à 3 choix et brûle 2 tours.',
    },
    provoc: {
      name: 'Guichet unique',
      text: 'Attire les coups 2 tours, en garde.',
    },
    visa: {
      name: 'Visa',
      text: 'Un bouclier sur le plus blessé : 40 % des PV de Tampon.',
    },
    refuse: {
      name: 'Refusé',
      text: 'Brise le bouclier, puis frappe à 4 choix.',
    },
    courtcircuit: {
      name: 'Court-circuit',
      text: 'Frappe tous les ennemis à 3 choix (60 %).',
    },
    allerretour: {
      name: 'Aller-retour',
      text: 'Deux coups à 4 choix, 60 % chacun.',
    },
    bouture: {
      name: 'Bouture',
      text: 'Régénération 3 tours pour toute l’équipe.',
    },
    desherbage: {
      name: 'Désherbage',
      text: 'Efface les maux de l’équipe et le brouillard.',
    },
    rempotage: {
      name: 'Rempotage',
      text: 'Relève un équipier à terre avec 50 % des PV.',
    },
  },
  statuses: frStatus,
  chapters: {
    agentic_architecture: {
      ...PAGE_COPY.fr.chapters.agentic_architecture,
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
      ...PAGE_COPY.fr.chapters.tool_design_mcp,
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
      ...PAGE_COPY.fr.chapters.claude_code,
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
      ...PAGE_COPY.fr.chapters.prompt_engineering,
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
      ...PAGE_COPY.fr.chapters.context_management,
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
  types: {
    grib: {
      name: 'Gribouille',
      a: 'Un Gribouille',
      taunt: 'Hé hé. Plus personne ne lira cette fiche.',
      fall: 'Le Gribouille fond en une flaque d’encre.',
    },
    fau: {
      name: 'Faussaire',
      a: 'Un Faussaire',
      taunt: 'Ma réponse a l’air juste. Cherche donc la faille.',
      fall: 'Le Faussaire détale, ses faux sous le bras.',
    },
    mask: {
      name: 'Masque',
      a: 'Un Masque',
      taunt: 'Tu me reconnais ? Non ? Parfait.',
      fall: 'Le masque tombe. Il n’y avait personne dessous.',
    },
    spam: {
      name: 'Pourriel',
      a: 'Un Pourriel',
      taunt: 'Tu as un nouveau message. Et un autre. Et un autre.',
      fall: 'Le Pourriel file dans les indésirables.',
    },
    cut: {
      name: 'Coupe-fil',
      a: 'Un Coupe-fil',
      taunt: 'Une étape, la suivante… snip. Plus rien ne les relie.',
      fall: 'Le Coupe-fil s’emmêle dans ses propres fils et file.',
    },
    deca: {
      name: 'Déca',
      a: 'Un Déca',
      taunt: 'Chut… Ferme les yeux. Rien ne presse.',
      fall: 'Le Déca s’endort pour de bon.',
    },
    pil: {
      name: 'Pilleur',
      a: 'Un Pilleur',
      taunt: 'Je prends ce qui traîne. Ton sac, par exemple.',
      fall: 'Le Pilleur lâche son butin et décampe.',
    },
    din: {
      name: 'Brouhaha',
      a: 'Un Brouhaha',
      taunt: 'Plus il y a de bruit dans le contexte, mieux je me porte.',
      fall: 'Le Brouhaha se tait. Le silence revient d’un coup.',
    },
    kettle: {
      name: 'Bouilloire',
      a: 'Une Bouilloire',
      taunt: 'Ça chauffe… ça chauffe… ça va déborder.',
      fall: 'La Bouilloire siffle une dernière fois et refroidit.',
    },
  },
  moves: {
    hit: { name: 'Frappe', help: (n, w) => `Frappera ${w} : ${n} PV.` },
    charge: {
      name: 'Élan',
      help: () => 'Prend son élan : grosse frappe au tour suivant.',
    },
    big: {
      name: 'Grosse frappe',
      help: (n, w) => `Frappera ${w} : ${n} PV. La Garde divise par deux.`,
    },
    area: {
      name: 'Onde',
      help: (n) => `Zone : touchera toute l’équipe, jusqu’à ${n} PV chacun.`,
    },
    smudge: {
      name: 'Tache',
      help: (n, w) =>
        `Frappera ${w} (${n} PV) et tachera ses questions 2 tours.`,
    },
    silence: {
      name: 'Bâillon',
      help: (n, w) =>
        `Frappera ${w} (${n} PV) et le réduira au silence 2 tours.`,
    },
    poison: {
      name: 'Venin',
      help: (n, w) => `Frappera ${w} (${n} PV) et l’empoisonnera 3 tours.`,
    },
    sleep: {
      name: 'Berceuse',
      help: (_n, w) => `Endormira ${w} 2 tours. Un coup le réveille.`,
    },
    burn: {
      name: 'Ébullition',
      help: (n) => `Zone : ${n} PV chacun et brûlure 2 tours.`,
    },
    steal: {
      name: 'Larcin',
      help: (n, w) =>
        `Frappera ${w} (${n} PV) et volera un objet, ou 2 jetons.`,
    },
    mend: {
      name: 'Rafistolage',
      help: () => 'Soignera l’ennemi le plus blessé.',
    },
    shield: { name: 'Bouclier', help: () => 'Se protégera d’un bouclier.' },
    fog: {
      name: 'Brouillard',
      help: () => 'Zone : brouillard 2 tours, pas de Duel.',
    },
    shuffle: {
      name: 'Mélange',
      help: (n, w) =>
        `Frappera ${w} (${n} PV) et mélangera ta prochaine question.`,
    },
    allow: {
      name: 'Tout autoriser',
      help: () =>
        'Se donnera un bouclier et effacera ses maux. Le Silence l’en empêche.',
    },
    shift: {
      name: 'Hors schéma',
      help: () => 'Changera d’élément.',
    },
    overflow: {
      name: 'Débordement',
      help: (_n, w) => `Endormira ${w}.`,
    },
    spill: {
      name: 'Fuite',
      help: (n) => `Zone : ${n} PV chacun et poison 3 tours.`,
    },
  },
  formats: {
    duel: { name: 'Duel', options: '2 choix' },
    trident: { name: 'Trident', options: '3 choix' },
    exam: { name: 'Examen', options: '4 choix' },
  },
  powers: {
    hint: {
      name: 'Indice',
      text: 'Raye une mauvaise réponse à la prochaine question.',
    },
    echo: {
      name: 'Écho',
      text: 'La prochaine bonne réponse touche aussi les autres ennemis, à moitié.',
    },
    balm: { name: 'Baume', text: 'Rend 30 % des PV à toute l’équipe.' },
    blot: {
      name: 'Buvard',
      text: 'Efface les maux de l’équipe et le brouillard.',
    },
  },
  items: {
    cafe: { name: 'Café', text: 'Rend 50 % des PV au plus blessé.' },
    gomme: {
      name: 'Gomme',
      text: 'Efface une mauvaise réponse à la prochaine question.',
    },
    buvard: { name: 'Buvard', text: 'Efface les maux d’un équipier.' },
    reboot: {
      name: 'Redémarrage',
      text: 'Relève un équipier à terre avec 50 % des PV.',
    },
  },
  boons: {
    ink: { name: '+1 jeton max', text: 'Pour le reste du chapitre.' },
    crit: {
      name: 'Élan',
      text: 'La première bonne réponse de chaque combat frappe ×1,5.',
    },
    pv: { name: '+4 PV max', text: 'Pour toute l’équipe, jusqu’au chef.' },
  },
  doors: {
    combat: { name: 'Combat', text: 'Une rencontre ordinaire.' },
    elite: { name: 'Élite', text: 'Plus coriace, meilleur coffre.' },
    cafe: { name: 'Café de Moka', text: 'Rend 50 % des PV et 3 jetons.' },
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
    'Architecte principal',
    'Architecte expert',
    'Architecte émérite',
    'Maître architecte',
    'Légende du classeur',
  ],
  stamps: {
    stampHit: 'CLAC',
    visa: 'VISA',
    refused: 'REFUSÉ',
    mute: 'CHUT',
    smudge: 'TACHE',
    allow: 'TOUT OK',
    weak: 'FAIBLE !',
    resist: 'RÉSISTE',
    miss: 'RATÉ',
    phase: 'PHASE',
  },
  card: {
    dmg: (n) => `−${n}`,
    hits: (n, t) => `−${n} ×${t}`,
    all: 'tous',
    unknown: '?',
    aff: { weak: 'Faible ×2', neutral: '', resist: 'Résiste ½' },
    short: { weak: '×2', neutral: '', resist: '½' },
    heal: (n, w) => `+${n} → ${w}`,
    healAll: (p) => `+${p} % → tous`,
    shield: (n, w) => `${n} → ${w}`,
    revive: (w) => `relève ${w}`,
    cost: (n) => `${n} jeton${n > 1 ? 's' : ''}`,
    format: (f) => f,
  },
  blocked: {
    tokens: (n) =>
      `Il faut ${n} jeton${n > 1 ? 's' : ''}. Une bonne réponse au Trident ou à l’Examen en rapporte.`,
    silence:
      'Réduit au silence : plus de talent ce tour-ci. Les frappes restent possibles.',
    nobody: 'Personne n’est à terre.',
    full: 'Tout le monde est en pleine forme.',
    clean: 'Rien à effacer.',
    known: 'Les éléments sont déjà connus.',
    echo: 'L’Écho est déjà prêt.',
    fog: 'Le brouillard couvre le terrain : pas de Duel tant qu’il dure.',
  },
  status: {
    level: (l) => `Niv. ${l}`,
    xpAria: (xp, of) => `${xp} XP sur ${of}`,
    sheets: (f, t) => `${f}/${t} fiches`,
    hp: 'PV',
    hpAria: (h, m) => `PV ${h} sur ${m}`,
    tokens: 'Jetons',
    tokensAria: (n, m) => `${n} jetons sur ${m}`,
    memberAria: (name, h, m, sts) =>
      `${name}, PV ${h} sur ${m}${sts ? `, ${sts}` : ''}`,
    foeAria: (name, h, m, el) => `${name}, PV ${h} sur ${m}, élément ${el}`,
    step: (i, o) => `Étape ${i} sur ${o}`,
    bossStep: 'Chef',
    chapterTag: (i) => `Ch. ${i}`,
    fog: (n) => `Brouillard ${n}`,
    turns: (n) => `${n} tour${n > 1 ? 's' : ''}`,
    unknownEl: 'élément inconnu',
    down: 'À terre',
  },
  actions: {
    skills: 'Talents',
    glose: 'Glose',
    guard: 'Garde',
    bag: (n) => `Sac ${n}`,
    flee: 'Fuir',
    sheets: 'Les fiches',
    howto: 'Comment jouer',
    reset: 'Recommencer',
    cines: 'Scènes',
    team: 'Équipe',
    options: 'Options',
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
    skillsOf: (n) => `Talents de ${n}`,
    confirmReset: 'Tout effacer ?',
    resetYes: 'Oui, effacer',
    resetNo: 'Non, garder',
    fleeAsk: 'Rentrer à la carte ?',
    fleeYes: 'Oui, rentrer',
    fleeNo: 'Non, rester',
    progress: 'Ton progrès',
    mixing: 'Regarde bien… il mélange.',
    answer: 'Choisis ta réponse',
    pickFormat: 'Combien de choix ?',
    turnOf: (n) => (n === 'Toi' ? 'À toi' : `Tour de ${n}`),
    foeTurn: 'Tour ennemi',
    victory: 'Victoire',
    bossDown: 'Chef vaincu',
    retreat: 'Repli',
    yes: 'Oui',
    no: 'Non',
    cines: 'Revoir une scène',
    team: 'Ton équipe',
    teamPick: 'Choisis deux équipiers',
    teamDone: 'Valider l’équipe',
    options: 'Options',
    speed: 'Vitesse des combats',
    speeds: { normal: 'Normale', fast: 'Rapide' },
    speedHelp:
      'Normale laisse le temps de tout lire. Rapide raccourcit les animations et les pauses.',
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
    refill: (t, hp) =>
      `On souffle un peu : +${hp} PV pour l’équipe${t ? `, +${t} jeton${t > 1 ? 's' : ''}` : ''}.`,
    twoDoors: 'Deux portes. À toi de choisir.',
    bossDoor: (b) => `Derrière cette porte : ${b}. Respire, et lis bien.`,
    bossWaits: 'Le chef attend derrière la porte.',
    chapterWon: (n) => `Chapitre gagné. ${n} s’ouvre sur la carte.`,
    allWon:
      'Les cinq chefs sont tombés. Mon classeur n’a jamais été aussi complet.',
    cafe: 'Moka pose des tasses fumantes sur le comptoir.',
    cafeGlose: (hp, t) =>
      `Ah, Moka. Toujours là quand il faut. +${hp} PV pour l’équipe, +${t} jetons.`,
    chestPlain: 'Un coffre. Prends ce qui t’aidera le plus.',
    chestRich: 'Un coffre d’élite : trois trésors, un seul à prendre.',
    took: (n) => `Tu prends : ${n}.`,
    delivery: (i) => `Navette revient en courant avec un objet : ${i}.`,
    notes: (n) =>
      `J’ai relu mes notes après notre défaite : ${n} café${n > 1 ? 's' : ''} et ${n} jeton${n > 1 ? 's' : ''} de plus pour ce chapitre.`,
    appearsOne: (a, elite) =>
      `${a} apparaît${elite ? ', plus coriace que les autres' : ''} !`,
    appearsMany: (names) =>
      `${names.slice(0, -1).join(', ')} et ${names[names.length - 1]} surgissent !`,
    teachIntent:
      'L’étiquette au-dessus de lui, c’est ce qu’il fera à son tour, et à qui. Touche-la pour la lire.',
    teachFormats:
      'Choisis combien de réponses voir : 2 choix frappent ×2, 3 choix ×3, 4 choix ×4. Le chiffre sur la carte, c’est ce qu’il perdra.',
    teachElements:
      'Chaque attaque a un élément. L’Encre bat le Papier, le Papier bat le Café, le Café bat le Courant, le Courant bat l’Encre.',
    teachParty:
      'Chaque équipier joue à son tour, avec son élément et ses talents. Les jetons paient les talents et mes pouvoirs.',
    teachStatus:
      'Les petites pastilles, ce sont les effets : le chiffre dit combien de tours il en reste. Touche une carte de l’équipe pour les lire.',
    teachArea:
      'Une attaque de zone : elle touche toute l’équipe. La Garde en divise les dégâts par deux.',
    guardTip:
      'Il a pris son élan : sa grosse frappe tombe à son prochain tour. La Garde la divise par deux.',
    maskWarn: 'Un Masque ! Tant qu’il tient debout, il protège les autres.',
    aim: (name, many) =>
      `Tu vises <b>${name}</b>. ${many ? 'Touche un autre ennemi pour changer de cible.' : 'Choisis combien de choix.'}`,
    shieldSay: 'Le Masque me protège !',
    fled: 'Tu files vers la carte. Les fiches libérées restent libérées.',
    verdictRight: 'Juste.',
    verdictWrong: 'Pas cette fois.',
    tallyNone: 'Aucune fiche libérée dans ce combat. Elles t’attendent encore.',
    tallyCard: (n, a) => `<b>${n}</b> · réponse : ${a}`,
    tallySum: (n, xp) =>
      `${n} ${n > 1 ? 'fiches libérées' : 'fiche libérée'}. L’équipe gagne ${xp} XP.`,
    levelUp: (l, t) =>
      `Niveau ${l} ! Te voilà ${t}. Toute l’équipe se renforce. Choisis ton progrès.`,
    levelName: (l) => `Niveau ${l}`,
    perkPv: (n) => `+${n} PV max`,
    perkPvText: 'Pour toute l’équipe, dans tous les chapitres.',
    perkInk: '+1 jeton max',
    perkInkText: 'Pour les talents et les pouvoirs.',
    perkCapped: 'Déjà au plafond.',
    defeat: 'L’équipe tombe à genoux…',
    defeatGlose:
      'Je vous rattrape par la manche. On rentre. Ce que tu as libéré reste libéré.',
    inked: 'mot taché',
    bagEmpty: 'Ton sac est vide.',
    lineupFull: (n) =>
      `${n} veut se joindre à vous. Deux équipiers seulement t’accompagnent : choisis.`,
    teamAt: (n) => `Avec toi : ${n}.`,
    sleeping: (w) => `${w} dort. Un coup le réveillera.`,
  },
  ev: {
    announce: (a, x) => `${a} · ${x}`,
    result: (x, t) => `${x} : ${t}`,
    dmg: (w, d, b, a) =>
      `${frYou(w, ['perds', 'perd'])} ${d} PV (${b} → ${a}).`,
    tick: (s, w, d, b, a) =>
      `${s} : ${frYou(w, ['perds', 'perd'])} ${d} PV (${b} → ${a}).`,
    heal: (w, n, b, a) =>
      `${frYou(w, ['récupères', 'récupère'])} ${n} PV (${b} → ${a}).`,
    aff: (a, el) =>
      a === 'weak'
        ? `Faible ${frEl[el].to} !`
        : a === 'resist'
          ? `Résiste ${frEl[el].to}.`
          : '',
    absorbed: (n) => `Le bouclier en absorbe ${n}.`,
    on: (s, w, t) =>
      `${frStatus[s].name} sur ${w.you ? 'toi' : w.name} : ${t} tour${t > 1 ? 's' : ''}.`,
    off: (s, w) =>
      `${frStatus[s].name} s’efface sur ${w.you ? 'toi' : w.name}.`,
    wake: (w) => `${frYou(w, ['te réveilles', 'se réveille'])} !`,
    resist: (s, w) =>
      s === 'stun'
        ? `${frYou(w, ['tiens', 'tient'])} bon : déjà étourdi il y a peu.`
        : `${frYou(w, ['résistes', 'résiste'])} : quelqu’un doit rester debout.`,
    shieldOn: (w, n) =>
      `Bouclier sur ${w.you ? 'toi' : w.name} : il absorbe ${n} PV.`,
    shieldBreak: (w) => `Le bouclier de ${w.you ? 'toi' : w.name} se brise !`,
    shieldOff: (w) => `Le bouclier de ${w.you ? 'toi' : w.name} s’efface.`,
    skip: (why, w) =>
      why === 'sleep'
        ? `${frYou(w, ['dors', 'dort'])} et ${w.you ? 'passes ton' : 'passe son'} tour.`
        : `${frYou(w, ['es étourdi', 'est étourdi'])} et ${w.you ? 'passes ton' : 'passe son'} tour.`,
    down: (w) =>
      `${frYou(w, ['es à terre', 'est à terre'])}. Un Redémarrage ou un Rempotage ${w.you ? 'te' : 'le'} relève.`,
    up: (w, hp) => `${frYou(w, ['te relèves', 'se relève'])} avec ${hp} PV.`,
    reveal: (name, el, how) =>
      how === 'hit'
        ? `Je note : ${name} est de l’élément ${frEl[el].name}.`
        : `Radar : ${name}, élément ${frEl[el].name}.`,
    summon: (n) => `${n} accourt au secours du chef.`,
    fog: (n) =>
      `Le brouillard couvre le terrain : pas de Duel pendant ${n} tours.`,
    fogOff: 'Le brouillard se lève : le Duel revient.',
    stealItem: (t, i) =>
      `${t} plonge la main dans le sac et file avec : ${i} !`,
    stealTokens: (t, n) => `${t} rafle ${n} jeton${n > 1 ? 's' : ''}.`,
    miss: 'Raté : la fiche passe « à revoir ».',
    counter: (n) => `${n} riposte`,
    free: (l, xp) => `Fiche ${l} libérée : +${xp} XP.`,
    tokens: (n) => (n > 0 ? `+${n} jeton${n > 1 ? 's' : ''}.` : ''),
    combo: (n) => `Série ×${n}.`,
    mix: 'Il mélangera les réponses de ta prochaine question.',
    shift: (n, el) => `${n} change d’élément : ${frEl[el].name}.`,
    fizzle: (n) => `Réduit au silence, ${n} ne peut que frapper.`,
    strike: 'Une mauvaise réponse sera rayée à la prochaine question.',
    echo: 'L’écho rebondit sur les autres ennemis.',
    echoReady:
      'L’écho est prêt : la prochaine bonne réponse résonnera sur les autres.',
    guard: (w) =>
      `${frYou(w, ['te mets', 'se met'])} en garde : dégâts divisés par deux jusqu’au prochain tour.`,
  },
  howto: {
    title: 'Comment jouer',
    items: [
      'Chaque Clawd garde des fiches de l’examen. À ton tour, choisis combien de réponses voir, puis la bonne : la fiche est libérée et l’ennemi perd des PV.',
      '<b>2 choix</b> frappent ×2, <b>3 choix</b> ×3, <b>4 choix</b> ×4, comme le jour J. Le chiffre sur la carte est la perte exacte de l’ennemi. Une erreur : il riposte, et la fiche passe « à revoir ».',
      '<b>Éléments</b> : l’Encre bat le Papier, le Papier bat le Café, le Café bat le Courant, le Courant bat l’Encre (×2). Contre son propre élément : moitié. Un coup faible ou résisté révèle l’élément.',
      '<b>L’équipe</b> : tes équipiers jouent chacun leur tour. Leurs talents et les pouvoirs de Glose coûtent des jetons. Le Trident rend 1 jeton, l’Examen 2, la Garde 1.',
      '<b>Effets</b> : Poison, Brûlure, Sommeil (un coup réveille), Étourdi, Silence, Tache ; Garde, Bouclier, Régénération, Provocation. Le chiffre sur la pastille dit les tours restants.',
      'L’étiquette au-dessus d’un ennemi annonce son prochain coup et sa cible. Un <b>Masque</b> protège les autres tant qu’il tient. Le sac et Glose ne coûtent pas de tour.',
    ],
    close: 'Fermer',
  },
  legend: {
    hit: 'Frappe',
    charge: 'Élan',
    big: 'Grosse frappe',
    area: 'Onde (zone)',
    fog: 'Brouillard (zone)',
    sleep: 'Berceuse',
    poison: 'Venin',
    burn: 'Ébullition',
    silence: 'Bâillon',
    smudge: 'Tache',
    steal: 'Larcin',
    mend: 'Rafistolage',
    shield: 'Bouclier',
  },
  cines: {
    intro: {
      title: 'Le vol des fiches',
      shots: [
        'La nuit tombe sur les archives. Glose range ses 300 fiches pour l’examen.',
        'Des Clawds maléfiques surgissent et dispersent les fiches dans cinq domaines.',
        'Il faut les reprendre, une bonne réponse à la fois. Et chercher de l’aide dans les bureaux.',
      ],
    },
    ending: {
      title: 'Le classeur complet',
      shots: [
        'Le dernier chef tombe. L’aube passe par la fenêtre.',
        'Toute l’équipe range les fiches avec Glose : cinq domaines, cinq chefs vaincus.',
        'Il reste à revoir les fiches marquées. Le jour de l’examen, tu les reconnaîtras.',
      ],
    },
    'join-vigie': {
      title: 'Vigie',
      shots: [
        'Dans la salle de contrôle, Vigie ne quitte pas l’écran radar des yeux. Des points rouges s’y déplacent.',
        '« Je les suis depuis le début. Ils se passent tes fiches d’un agent à l’autre. Je viens avec toi. »',
        'Vigie rejoint l’équipe. Élément Courant, contrôle : elle voit venir les coups.',
      ],
    },
    'join-navette': {
      title: 'Navette',
      shots: [
        'Une silhouette traverse le panneau de connexions au pas de course, des fiches plein les bras.',
        'Navette freine net : « Ces fiches sont à toi ? Je les ai reprises à un Coupe-fil. »',
        'Navette rejoint l’équipe. Élément Courant, vitesse : deux coups quand les autres en donnent un.',
      ],
    },
    'join-moka': {
      title: 'Moka',
      shots: [
        'Dans l’atelier du terminal, Moka fait mousser le lait derrière la machine à café, comme à chaque pause.',
        '« Je vous ai assez servis derrière le comptoir. Cette fois, je prends le thermos et je viens avec vous. »',
        'Moka rejoint l’équipe. Élément Café, soins : ses tasses remettent debout.',
      ],
    },
    'join-tampon': {
      title: 'Tampon',
      shots: [
        'Au guichet de la salle de lecture, Tampon tamponne. Clac. Clac. Refusé.',
        '« Ce prompt n’a pas de schéma : refusé. Toi, en revanche, tu passes. »',
        'Tampon rejoint l’équipe. Élément Papier, défense : rien ne passe sans son visa.',
      ],
    },
    'join-arrosoir': {
      title: 'Arrosoir',
      shots: [
        'Au fond des archives, Arrosoir taille un ficus qui déborde des étagères.',
        '« Le contexte, c’est comme une plante : on garde ce qui pousse, on coupe le reste. »',
        'Arrosoir rejoint l’équipe. Élément Café, soutien : il fait repousser ce qui flétrit.',
      ],
    },
  },
  cineTitles: {
    chapter: (i, s) => `Chapitre ${i} · ${s}`,
    fall: (b) => `La chute : ${b}`,
    join: (n) => n,
  },
};

/* ---------- English ---------- */
const enEl: Copy['elements'] = {
  encre: { name: 'Ink', to: 'to Ink' },
  papier: { name: 'Paper', to: 'to Paper' },
  cafe: { name: 'Coffee', to: 'to Coffee' },
  courant: { name: 'Current', to: 'to Current' },
};
const enStatus: Copy['statuses'] = {
  poison: {
    name: 'Poison',
    help: 'Loses 8% of max HP at the start of each of its turns.',
  },
  burn: {
    name: 'Burn',
    help: 'Loses 5% of max HP each turn and hits half as hard.',
  },
  sleep: { name: 'Sleep', help: 'Skips its turns. A hit wakes it up.' },
  stun: { name: 'Stunned', help: 'Skips its next turn.' },
  silence: {
    name: 'Silence',
    help: 'No skill and no special move: plain hits only.',
  },
  smudge: {
    name: 'Smudge',
    help: 'A word of a wrong answer is smudged in its questions.',
  },
  guard: { name: 'Guard', help: 'Takes half damage until its next turn.' },
  shield: { name: 'Shield', help: 'Soaks up damage until it breaks.' },
  regen: {
    name: 'Regen',
    help: 'Gets 10% of max HP back at the start of each of its turns.',
  },
  taunt: { name: 'Taunt', help: 'Draws every single-target blow.' },
  steady: {
    name: 'Steady',
    help: 'Was just stunned: cannot be stunned again right away.',
  },
};
const enYou = (w: Who, verb: [string, string]) =>
  w.you ? `You ${verb[0]}` : `${w.name} ${verb[1]}`;

const en: Copy = {
  lang: 'en',
  page: PAGE_COPY.en,
  close: 'Close the game',
  help: 'How to play',
  sound: 'Sound',
  skip: 'Skip the scene',
  next: 'Next',
  cont: 'Continue',
  back: 'Back',
  enterKey: 'Enter',
  scrollHint: 'Scroll',
  glose: 'Glose',
  scene: 'Scene',
  yourSide: 'Your party',
  elements: enEl,
  roles: {
    balance: 'All-rounder',
    control: 'Control',
    heal: 'Healer',
    defence: 'Defender',
    speed: 'Speed',
    support: 'Support',
  },
  members: {
    hero: {
      name: 'You',
      attack: 'Ink Stroke',
      hello: 'Let us win the cards back. One right answer at a time.',
    },
    vigie: {
      name: 'Vigie',
      attack: 'Ping',
      hello:
        'I have tracked them on radar from the start. I am coming with you.',
    },
    navette: {
      name: 'Navette',
      attack: 'Flash Run',
      hello: 'Are these cards yours? I run faster than the cables.',
    },
    moka: {
      name: 'Moka',
      attack: 'Hot Splash',
      hello:
        'Enough serving from behind the counter. I am coming, with the thermos.',
    },
    tampon: {
      name: 'Tampon',
      attack: 'Stamp',
      hello:
        'That prompt has no schema: rejected. You, on the other hand, pass.',
    },
    arrosoir: {
      name: 'Arrosoir',
      attack: 'Watering Jet',
      hello: 'Context is like a plant: you prune what overflows.',
    },
  },
  passives: {
    diligent: {
      name: 'Diligent',
      text: 'A right answer in the Exam brings 1 more token.',
    },
    radar: {
      name: 'Radar',
      text: 'Shows every enemy’s element at the start of each fight.',
    },
    pause: {
      name: 'Coffee break',
      text: 'After each room, the party gets 10% more HP back.',
    },
    paperwork: {
      name: 'Red tape',
      text: 'Every blow taken deals 2 HP less to him.',
    },
    delivery: {
      name: 'Delivery',
      text: 'After each win, brings an item back to the bag.',
    },
    greenThumb: {
      name: 'Green thumb',
      text: 'At the start of each round, the party gets 2 HP back.',
    },
  },
  skills: {
    coulure: {
      name: 'Ink Drip',
      text: 'Hits with 3 options and poisons for 3 turns.',
    },
    relecture: {
      name: 'Proofread',
      text: 'Gives back 35% of your HP and clears your ailments.',
    },
    balayage: {
      name: 'Radar Sweep',
      text: 'Shows every enemy’s element. No question.',
    },
    brouillage: {
      name: 'Jamming',
      text: 'Hits with 3 options (half) and silences for 2 turns.',
    },
    decharge: {
      name: 'Discharge',
      text: 'Hits with 4 options and stuns for 1 turn.',
    },
    espresso: {
      name: 'Espresso',
      text: 'Gives 40% HP back to the most hurt and clears their ailments.',
    },
    tournee: {
      name: 'Round for All',
      text: 'Gives 25% HP back to all, then regen for 3 turns.',
    },
    ebouillanter: {
      name: 'Scald',
      text: 'Hits with 3 options and burns for 2 turns.',
    },
    provoc: {
      name: 'Single Desk',
      text: 'Draws the blows for 2 turns, on guard.',
    },
    visa: {
      name: 'Visa',
      text: 'A shield on the most hurt: 40% of Tampon’s HP.',
    },
    refuse: {
      name: 'Rejected',
      text: 'Breaks the shield, then hits with 4 options.',
    },
    courtcircuit: {
      name: 'Short Circuit',
      text: 'Hits every enemy with 3 options (60%).',
    },
    allerretour: {
      name: 'Round Trip',
      text: 'Two hits with 4 options, 60% each.',
    },
    bouture: {
      name: 'Cutting',
      text: 'Regen for 3 turns for the whole party.',
    },
    desherbage: {
      name: 'Weeding',
      text: 'Clears the party’s ailments and the fog.',
    },
    rempotage: {
      name: 'Repotting',
      text: 'Gets a fallen teammate back up with 50% HP.',
    },
  },
  statuses: enStatus,
  chapters: {
    agentic_architecture: {
      ...PAGE_COPY.en.chapters.agentic_architecture,
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
      ...PAGE_COPY.en.chapters.tool_design_mcp,
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
      ...PAGE_COPY.en.chapters.claude_code,
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
      ...PAGE_COPY.en.chapters.prompt_engineering,
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
      ...PAGE_COPY.en.chapters.context_management,
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
  types: {
    grib: {
      name: 'Scribbler',
      a: 'A Scribbler',
      taunt: 'Heh heh. Nobody will ever read this card again.',
      fall: 'The Scribbler melts into a puddle of ink.',
    },
    fau: {
      name: 'Forger',
      a: 'A Forger',
      taunt: 'My answer looks right. Go on, find the flaw.',
      fall: 'The Forger bolts, fakes under his arm.',
    },
    mask: {
      name: 'Mask',
      a: 'A Mask',
      taunt: 'Do you recognise me? No? Perfect.',
      fall: 'The mask falls. There was nobody underneath.',
    },
    spam: {
      name: 'Spammer',
      a: 'A Spammer',
      taunt: 'You have a new message. And another. And another.',
      fall: 'The Spammer files itself under junk.',
    },
    cut: {
      name: 'Snipper',
      a: 'A Snipper',
      taunt: 'One step, the next… snip. Nothing links them now.',
      fall: 'The Snipper gets tangled in its own threads and runs.',
    },
    deca: {
      name: 'Decaf',
      a: 'A Decaf',
      taunt: 'Shh… Close your eyes. There is no rush.',
      fall: 'The Decaf falls asleep for good.',
    },
    pil: {
      name: 'Looter',
      a: 'A Looter',
      taunt: 'I take whatever is lying around. Your bag, for instance.',
      fall: 'The Looter drops the loot and scarpers.',
    },
    din: {
      name: 'Din',
      a: 'A Din',
      taunt: 'The more noise in the context, the better I feel.',
      fall: 'The Din goes quiet. Silence falls at once.',
    },
    kettle: {
      name: 'Kettle',
      a: 'A Kettle',
      taunt: 'It is heating up… heating up… about to boil over.',
      fall: 'The Kettle whistles one last time and cools down.',
    },
  },
  moves: {
    hit: { name: 'Hit', help: (n, w) => `Will hit ${w}: ${n} HP.` },
    charge: {
      name: 'Wind-up',
      help: () => 'Winds up: a heavy hit next turn.',
    },
    big: {
      name: 'Heavy hit',
      help: (n, w) => `Will hit ${w}: ${n} HP. Guard halves it.`,
    },
    area: {
      name: 'Wave',
      help: (n) => `Area: will hit the whole party, up to ${n} HP each.`,
    },
    smudge: {
      name: 'Smudge',
      help: (n, w) =>
        `Will hit ${w} (${n} HP) and smudge their questions for 2 turns.`,
    },
    silence: {
      name: 'Gag',
      help: (n, w) => `Will hit ${w} (${n} HP) and silence them for 2 turns.`,
    },
    poison: {
      name: 'Venom',
      help: (n, w) => `Will hit ${w} (${n} HP) and poison them for 3 turns.`,
    },
    sleep: {
      name: 'Lullaby',
      help: (_n, w) => `Will put ${w} to sleep for 2 turns. A hit wakes them.`,
    },
    burn: {
      name: 'Boil-over',
      help: (n) => `Area: ${n} HP each and a burn for 2 turns.`,
    },
    steal: {
      name: 'Pickpocket',
      help: (n, w) => `Will hit ${w} (${n} HP) and steal an item, or 2 tokens.`,
    },
    mend: { name: 'Patch-up', help: () => 'Will heal the most hurt enemy.' },
    shield: { name: 'Shield', help: () => 'Will raise a shield.' },
    fog: { name: 'Fog', help: () => 'Area: fog for 2 turns, no Duel.' },
    shuffle: {
      name: 'Shuffle',
      help: (n, w) => `Will hit ${w} (${n} HP) and shuffle your next question.`,
    },
    allow: {
      name: 'Allow all',
      help: () =>
        'Will grant itself a shield and clear its ailments. Silence stops it.',
    },
    shift: { name: 'Off-schema', help: () => 'Will change element.' },
    overflow: { name: 'Overflow', help: (_n, w) => `Will put ${w} to sleep.` },
    spill: {
      name: 'Spill',
      help: (n) => `Area: ${n} HP each and poison for 3 turns.`,
    },
  },
  formats: {
    duel: { name: 'Duel', options: '2 options' },
    trident: { name: 'Trident', options: '3 options' },
    exam: { name: 'Exam', options: '4 options' },
  },
  powers: {
    hint: {
      name: 'Hint',
      text: 'Strikes out a wrong answer at the next question.',
    },
    echo: {
      name: 'Echo',
      text: 'The next right answer also hits the other enemies, for half.',
    },
    balm: { name: 'Balm', text: 'Gives 30% HP back to the whole party.' },
    blot: { name: 'Blotter', text: 'Clears the party’s ailments and the fog.' },
  },
  items: {
    cafe: { name: 'Coffee', text: 'Gives 50% HP back to the most hurt.' },
    gomme: {
      name: 'Eraser',
      text: 'Erases a wrong answer at the next question.',
    },
    buvard: { name: 'Blotting paper', text: 'Clears a teammate’s ailments.' },
    reboot: {
      name: 'Reboot',
      text: 'Gets a fallen teammate back up with 50% HP.',
    },
  },
  boons: {
    ink: { name: '+1 max token', text: 'For the rest of the chapter.' },
    crit: {
      name: 'Momentum',
      text: 'The first right answer of each fight hits ×1.5.',
    },
    pv: { name: '+4 max HP', text: 'For the whole party, until the boss.' },
  },
  doors: {
    combat: { name: 'Fight', text: 'An ordinary encounter.' },
    elite: { name: 'Elite', text: 'Tougher, better chest.' },
    cafe: { name: 'Moka’s café', text: 'Gives back 50% HP and 3 tokens.' },
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
    'Principal architect',
    'Expert architect',
    'Distinguished architect',
    'Master architect',
    'Binder legend',
  ],
  stamps: {
    stampHit: 'THUD',
    visa: 'VISA',
    refused: 'REJECTED',
    mute: 'HUSH',
    smudge: 'SMUDGE',
    allow: 'ALL OK',
    weak: 'WEAK!',
    resist: 'RESISTED',
    miss: 'MISS',
    phase: 'PHASE',
  },
  card: {
    dmg: (n) => `−${n}`,
    hits: (n, t) => `−${n} ×${t}`,
    all: 'all',
    unknown: '?',
    aff: { weak: 'Weak ×2', neutral: '', resist: 'Resists ½' },
    short: { weak: '×2', neutral: '', resist: '½' },
    heal: (n, w) => `+${n} → ${w}`,
    healAll: (p) => `+${p}% → all`,
    shield: (n, w) => `${n} → ${w}`,
    revive: (w) => `revives ${w}`,
    cost: (n) => `${n} token${n > 1 ? 's' : ''}`,
    format: (f) => f,
  },
  blocked: {
    tokens: (n) =>
      `It takes ${n} token${n > 1 ? 's' : ''}. A right answer in the Trident or the Exam brings some.`,
    silence: 'Silenced: no skill this turn. Plain attacks still work.',
    nobody: 'Nobody is down.',
    full: 'Everyone is in full health.',
    clean: 'Nothing to clear.',
    known: 'The elements are already known.',
    echo: 'The Echo is already set.',
    fog: 'Fog covers the field: no Duel while it lasts.',
  },
  status: {
    level: (l) => `Lvl ${l}`,
    xpAria: (xp, of) => `${xp} XP of ${of}`,
    sheets: (f, t) => `${f}/${t} cards`,
    hp: 'HP',
    hpAria: (h, m) => `HP ${h} of ${m}`,
    tokens: 'Tokens',
    tokensAria: (n, m) => `${n} tokens of ${m}`,
    memberAria: (name, h, m, sts) =>
      `${name}, HP ${h} of ${m}${sts ? `, ${sts}` : ''}`,
    foeAria: (name, h, m, el) => `${name}, HP ${h} of ${m}, element ${el}`,
    step: (i, o) => `Step ${i} of ${o}`,
    bossStep: 'Boss',
    chapterTag: (i) => `Ch. ${i}`,
    fog: (n) => `Fog ${n}`,
    turns: (n) => `${n} turn${n > 1 ? 's' : ''}`,
    unknownEl: 'unknown element',
    down: 'Down',
  },
  actions: {
    skills: 'Skills',
    glose: 'Glose',
    guard: 'Guard',
    bag: (n) => `Bag ${n}`,
    flee: 'Flee',
    sheets: 'The cards',
    howto: 'How to play',
    reset: 'Start over',
    cines: 'Scenes',
    team: 'Party',
    options: 'Options',
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
    skillsOf: (n) => `${n}’s skills`,
    confirmReset: 'Erase everything?',
    resetYes: 'Yes, erase',
    resetNo: 'No, keep it',
    fleeAsk: 'Back to the map?',
    fleeYes: 'Yes, go back',
    fleeNo: 'No, stay',
    progress: 'Your progress',
    mixing: 'Watch closely… he is shuffling.',
    answer: 'Pick your answer',
    pickFormat: 'How many options?',
    turnOf: (n) => (n === 'You' ? 'Your turn' : `${n}’s turn`),
    foeTurn: 'Enemy turn',
    victory: 'Victory',
    bossDown: 'Boss beaten',
    retreat: 'Retreat',
    yes: 'Yes',
    no: 'No',
    cines: 'Watch a scene again',
    team: 'Your party',
    teamPick: 'Pick two teammates',
    teamDone: 'Confirm the party',
    options: 'Options',
    speed: 'Fight speed',
    speeds: { normal: 'Normal', fast: 'Fast' },
    speedHelp:
      'Normal leaves time to read everything. Fast shortens animations and pauses.',
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
    refill: (t, hp) =>
      `A short breather: +${hp} HP for the party${t ? `, +${t} token${t > 1 ? 's' : ''}` : ''}.`,
    twoDoors: 'Two doors. Your choice.',
    bossDoor: (b) => `Behind this door: ${b}. Breathe, and read carefully.`,
    bossWaits: 'The boss is waiting behind the door.',
    chapterWon: (n) => `Chapter won. ${n} opens on the map.`,
    allWon: 'All five bosses have fallen. My binder has never been so full.',
    cafe: 'Moka sets steaming cups on the counter.',
    cafeGlose: (hp, t) =>
      `Ah, Moka. Always there when needed. +${hp} HP for the party, +${t} tokens.`,
    chestPlain: 'A chest. Take what will help you most.',
    chestRich: 'An elite chest: three treasures, take one.',
    took: (n) => `You take: ${n}.`,
    delivery: (i) => `Navette runs back with an item: ${i}.`,
    notes: (n) =>
      `I went over my notes after our defeat: ${n} more coffee${n > 1 ? 's' : ''} and ${n} more token${n > 1 ? 's' : ''} for this chapter.`,
    appearsOne: (a, elite) =>
      `${a} appears${elite ? ', tougher than the others' : ''}!`,
    appearsMany: (names) =>
      `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]} burst in!`,
    teachIntent:
      'The tag above it is what it will do on its turn, and to whom. Tap it to read it.',
    teachFormats:
      'Pick how many answers to see: 2 options hit ×2, 3 options ×3, 4 options ×4. The figure on the card is what it will lose.',
    teachElements:
      'Every attack has an element. Ink beats Paper, Paper beats Coffee, Coffee beats Current, Current beats Ink.',
    teachParty:
      'Each teammate plays in turn, with their element and skills. Tokens pay for skills and for my powers.',
    teachStatus:
      'The small badges are effects: the figure says how many turns are left. Tap a party card to read them.',
    teachArea:
      'An area attack: it hits the whole party. Guard halves the damage.',
    guardTip:
      'It wound up: its heavy hit lands on its next turn. Guard halves it.',
    maskWarn: 'A Mask! While it stands, it shields the others.',
    aim: (name, many) =>
      `You aim at <b>${name}</b>. ${many ? 'Tap another enemy to switch targets.' : 'Pick how many options.'}`,
    shieldSay: 'The Mask protects me!',
    fled: 'You head back to the map. Freed cards stay freed.',
    verdictRight: 'Right.',
    verdictWrong: 'Not this time.',
    tallyNone: 'No card freed in this fight. They are still waiting.',
    tallyCard: (n, a) => `<b>${n}</b> · answer: ${a}`,
    tallySum: (n, xp) =>
      `${n} ${n > 1 ? 'cards freed' : 'card freed'}. The party earns ${xp} XP.`,
    levelUp: (l, t) =>
      `Level ${l}! You are now ${t}. The whole party grows stronger. Pick your progress.`,
    levelName: (l) => `Level ${l}`,
    perkPv: (n) => `+${n} max HP`,
    perkPvText: 'For the whole party, in every chapter.',
    perkInk: '+1 max token',
    perkInkText: 'For skills and powers.',
    perkCapped: 'Already at the cap.',
    defeat: 'The party drops to its knees…',
    defeatGlose:
      'I catch you by the sleeve. Back we go. What you freed stays freed.',
    inked: 'smudged word',
    bagEmpty: 'Your bag is empty.',
    lineupFull: (n) =>
      `${n} wants to join. Only two teammates come along: choose.`,
    teamAt: (n) => `With you: ${n}.`,
    sleeping: (w) => `${w} is asleep. A hit will wake them.`,
  },
  ev: {
    announce: (a, x) => `${a} · ${x}`,
    result: (x, t) => `${x}: ${t}`,
    dmg: (w, d, b, a) =>
      `${enYou(w, ['lose', 'loses'])} ${d} HP (${b} → ${a}).`,
    tick: (s, w, d, b, a) =>
      `${s}: ${enYou(w, ['lose', 'loses'])} ${d} HP (${b} → ${a}).`,
    heal: (w, n, b, a) =>
      `${enYou(w, ['get', 'gets'])} ${n} HP back (${b} → ${a}).`,
    aff: (a, el) =>
      a === 'weak'
        ? `Weak ${enEl[el].to}!`
        : a === 'resist'
          ? `Resists ${enEl[el].name}.`
          : '',
    absorbed: (n) => `The shield soaks up ${n}.`,
    on: (s, w, t) =>
      `${enStatus[s].name} on ${w.you ? 'you' : w.name}: ${t} turn${t > 1 ? 's' : ''}.`,
    off: (s, w) => `${enStatus[s].name} wears off ${w.you ? 'you' : w.name}.`,
    wake: (w) => `${enYou(w, ['wake', 'wakes'])} up!`,
    resist: (s, w) =>
      s === 'stun'
        ? `${enYou(w, ['hold', 'holds'])} firm: just stunned a moment ago.`
        : `${enYou(w, ['resist', 'resists'])}: someone has to stay up.`,
    shieldOn: (w, n) =>
      `Shield on ${w.you ? 'you' : w.name}: it soaks up ${n} HP.`,
    shieldBreak: (w) => `${w.you ? 'Your' : `${w.name}’s`} shield breaks!`,
    shieldOff: (w) => `${w.you ? 'Your' : `${w.name}’s`} shield fades.`,
    skip: (why, w) =>
      why === 'sleep'
        ? `${enYou(w, ['are asleep', 'is asleep'])} and ${w.you ? 'skip your' : 'skips a'} turn.`
        : `${enYou(w, ['are stunned', 'is stunned'])} and ${w.you ? 'skip your' : 'skips a'} turn.`,
    down: (w) =>
      `${enYou(w, ['are down', 'is down'])}. A Reboot or a Repotting gets ${w.you ? 'you' : 'them'} back up.`,
    up: (w, hp) => `${enYou(w, ['get', 'gets'])} back up with ${hp} HP.`,
    reveal: (name, el, how) =>
      how === 'hit'
        ? `Noted: ${name} is of the ${enEl[el].name} element.`
        : `Radar: ${name}, ${enEl[el].name} element.`,
    summon: (n) => `${n} rushes to the boss’s side.`,
    fog: (n) => `Fog covers the field: no Duel for ${n} turns.`,
    fogOff: 'The fog lifts: the Duel is back.',
    stealItem: (t, i) => `${t} reaches into the bag and runs off with: ${i}!`,
    stealTokens: (t, n) => `${t} grabs ${n} token${n > 1 ? 's' : ''}.`,
    miss: 'Missed: the card is marked “to review”.',
    counter: (n) => `${n} strikes back`,
    free: (l, xp) => `Card ${l} freed: +${xp} XP.`,
    tokens: (n) => (n > 0 ? `+${n} token${n > 1 ? 's' : ''}.` : ''),
    combo: (n) => `Streak ×${n}.`,
    mix: 'It will shuffle the answers of your next question.',
    shift: (n, el) => `${n} changes element: ${enEl[el].name}.`,
    fizzle: (n) => `Silenced, ${n} can only hit.`,
    strike: 'A wrong answer will be struck out at the next question.',
    echo: 'The echo bounces onto the other enemies.',
    echoReady:
      'The echo is set: the next right answer will ring through the others.',
    guard: (w) =>
      `${enYou(w, ['take', 'takes'])} guard: half damage until the next turn.`,
  },
  howto: {
    title: 'How to play',
    items: [
      'Each Clawd keeps exam cards. On your turn, pick how many answers to see, then the right one: the card is freed and the enemy loses HP.',
      '<b>2 options</b> hit ×2, <b>3 options</b> ×3, <b>4 options</b> ×4, as on exam day. The figure on the card is exactly what the enemy loses. A mistake: it strikes back, and the card is marked “to review”.',
      '<b>Elements</b>: Ink beats Paper, Paper beats Coffee, Coffee beats Current, Current beats Ink (×2). Against its own element: half. A weak or resisted hit shows the element.',
      '<b>The party</b>: your teammates each play their turn. Their skills and Glose’s powers cost tokens. The Trident gives 1 token back, the Exam 2, Guard 1.',
      '<b>Effects</b>: Poison, Burn, Sleep (a hit wakes), Stunned, Silence, Smudge; Guard, Shield, Regen, Taunt. The figure on the badge is the turns left.',
      'The tag above an enemy shows its next move and its target. A <b>Mask</b> shields the others while it stands. The bag and Glose cost no turn.',
    ],
    close: 'Close',
  },
  legend: {
    hit: 'Hit',
    charge: 'Wind-up',
    big: 'Heavy hit',
    area: 'Wave (area)',
    fog: 'Fog (area)',
    sleep: 'Lullaby',
    poison: 'Venom',
    burn: 'Boil-over',
    silence: 'Gag',
    smudge: 'Smudge',
    steal: 'Pickpocket',
    mend: 'Patch-up',
    shield: 'Shield',
  },
  cines: {
    intro: {
      title: 'The stolen cards',
      shots: [
        'Night falls on the archives. Glose files away his 300 cards for the exam.',
        'Wicked Clawds burst in and scatter the cards across five domains.',
        'They must be won back, one right answer at a time. And help is down the corridors.',
      ],
    },
    ending: {
      title: 'The full binder',
      shots: [
        'The last boss falls. Dawn comes through the window.',
        'The whole party files the cards with Glose: five domains, five bosses beaten.',
        'The cards marked to review are left. On exam day, you will know them.',
      ],
    },
    'join-vigie': {
      title: 'Vigie',
      shots: [
        'In the control room, Vigie never takes her eyes off the radar screen. Red dots are moving on it.',
        '“I have tracked them from the start. They pass your cards from one agent to the next. I am coming with you.”',
        'Vigie joins the party. Current element, control: she sees the blows coming.',
      ],
    },
    'join-navette': {
      title: 'Navette',
      shots: [
        'Someone sprints across the patch panel, arms full of cards.',
        'Navette skids to a halt: “Are these yours? I took them back from a Snipper.”',
        'Navette joins the party. Current element, speed: two hits while the others land one.',
      ],
    },
    'join-moka': {
      title: 'Moka',
      shots: [
        'In the terminal workshop, Moka froths milk behind the coffee machine, as at every break.',
        '“I have served you from behind the counter long enough. This time I am taking the thermos and coming with you.”',
        'Moka joins the party. Coffee element, healer: her cups get you back on your feet.',
      ],
    },
    'join-tampon': {
      title: 'Tampon',
      shots: [
        'At the reading room desk, Tampon stamps. Clack. Clack. Rejected.',
        '“That prompt has no schema: rejected. You, on the other hand, pass.”',
        'Tampon joins the party. Paper element, defender: nothing gets through without his visa.',
      ],
    },
    'join-arrosoir': {
      title: 'Arrosoir',
      shots: [
        'Deep in the archives, Arrosoir prunes a fig tree spilling over the shelves.',
        '“Context is like a plant: keep what grows, cut the rest.”',
        'Arrosoir joins the party. Coffee element, support: he makes what wilts grow back.',
      ],
    },
  },
  cineTitles: {
    chapter: (i, s) => `Chapter ${i} · ${s}`,
    fall: (b) => `The fall: ${b}`,
    join: (n) => n,
  },
};

/**
 * Chapter scenes are built from the chapter's own copy: entry, boss entrance, boss
 * defeat. `domains` are the campaign's, in chapter order.
 */
export function cineCopy(
  c: Copy,
  id: string,
  domains: readonly string[]
): CineCopy {
  if (c.cines[id]) return c.cines[id];
  const [kind, n] = id.split('-');
  const i = Number(n);
  const ch = chapterCopy(c, domains[i]);
  if (kind === 'chapter')
    return {
      title: c.cineTitles.chapter(i + 1, ch.short),
      shots: [ch.domain, ch.places[0]],
    };
  if (kind === 'boss')
    return { title: ch.boss.name, shots: [ch.boss.taunt, ch.boss.mechanic] };
  return { title: c.cineTitles.fall(ch.boss.name), shots: [ch.boss.fall] };
}

/** The copy of a domain's chapter. */
export const chapterCopy = (c: Copy, domain: string): ChapterCopy =>
  c.chapters[domain];

export const COPY: Record<Locale, Copy> = { fr, en };
