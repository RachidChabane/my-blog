/** Interface copy of the office, per locale. Content strings live with the content. */
import type { Locale } from '@/i18n/index';

export type SectionKey =
  | 'radar'
  | 'blog'
  | 'journal'
  | 'work'
  | 'library'
  | 'about';

export interface OfficeStrings {
  sections: Record<SectionKey, string>;
  /** Short label of the library on the phone bar. */
  libraryShort: string;
  enter3d: string;
  enter3dShort: string;
  night: string;
  day: string;
  menu: string;
  theme: string;
  language: string;
  /** Name of the locale itself. */
  thisLanguage: string;
  textSize: string;
  size: string;
  smaller: string;
  bigger: string;
  aboutSub: string;
  read: string;
  sources: string;
  consulted: string;
  checked: string;
  toc: string;
  left: (min: number) => string;
  done: string;
  search: string;
  noMatch: string;
  counts: {
    briefs: (n: number) => string;
    articles: (n: number) => string;
    texts: (n: number) => string;
    projects: (n: number) => string;
    words: (n: number) => string;
  };
  kinds: Record<string, string>;
  frieze: { aria: string; say: Record<string, string> };
  ask: {
    placeholder: string;
    send: string;
    suggestions: string[];
    outOfTokens: string[];
  };
  sage: {
    placeholder: string;
    ask: string;
    random: string;
    hello: string;
    inBeard: (n: number) => string;
    readCount: (n: number) => string;
    quips: string[];
    shake: string;
    unknown: (q: string) => string;
    related: string;
    citedIn: string;
    trail: string;
    seeRelated: string;
    themes: Record<string, string>;
  };
  project: { code: string; others: string; enlarge: string };
  journal: { written: string; empty: string };
  about: { team: string; portrait: string };
  next: string;
  notFound: { title: string; body: string; home: string };
  months: string[];
  loading3d: string;
}

const FR: OfficeStrings = {
  sections: {
    radar: 'Radar',
    blog: 'Articles',
    journal: 'Journal',
    work: 'Projets',
    library: 'Bibliothèque',
    about: 'À propos',
  },
  libraryShort: 'Biblio',
  enter3d: 'Entrer en 3D',
  enter3dShort: '3D',
  night: 'Nuit',
  day: 'Jour',
  menu: 'Menu',
  theme: 'Thème',
  language: 'Langue',
  thisLanguage: 'Français',
  textSize: 'Texte',
  size: 'taille',
  smaller: 'Texte plus petit',
  bigger: 'Texte plus grand',
  aboutSub: 'Rachid, l’équipe',
  read: 'Lire',
  sources: 'Sources',
  consulted: 'consultée le',
  checked: 'TAMPON',
  toc: 'Sommaire',
  left: (min) => `reste ${min} min`,
  done: 'lu',
  search: 'Chercher un titre ou un sujet',
  noMatch: 'Aucun texte ne correspond. Essaie un autre mot.',
  counts: {
    briefs: (n) => `${n} briefs`,
    articles: (n) => `${n} articles`,
    texts: (n) => `${n} ${n > 1 ? 'textes' : 'texte'}`,
    projects: (n) => `${n} projets`,
    words: (n) => `${n} mots`,
  },
  kinds: {
    security: 'sécurité',
    release: 'sortie',
    research: 'recherche',
    benchmark: 'mesure',
    radar: 'Radar',
    blog: 'Articles',
  },
  frieze: {
    aria: 'Le bureau des agents, vu en coupe',
    say: {
      radar: 'Du nouveau ce matin !',
      blog: 'On écrit. Entre lire.',
      work: 'Viens voir les maquettes.',
      library: 'Un mot ? Il est dans ma barbe.',
      journal: '',
    },
  },
  ask: {
    placeholder: 'Une question sur ce texte',
    send: 'Envoyer',
    suggestions: [
      'Résume en trois phrases',
      'Qu’est-ce que je dois changer chez moi ?',
    ],
    outOfTokens: [
      'Panne d’encre : le budget de tokens du jour est épuisé. Reviens demain, j’aurai de quoi écrire. En attendant, le texte est juste au-dessus.',
      'J’ai beau secouer le stylo, il ne sort plus un mot. Demain.',
      'Bon. Je vais tailler mes crayons jusqu’à demain.',
    ],
  },
  sage: {
    placeholder: 'Un mot : agent, rappel, cache…',
    ask: 'Demander',
    random: 'Au hasard',
    hello: 'Demande-moi un mot.',
    inBeard: (n) => `${n} mots dans la barbe`,
    readCount: (n) => `${n} ${n > 1 ? 'mots lus' : 'mot lu'} · la barbe pousse`,
    quips: [
      'Attends, il est coincé… voilà.',
      'Celui-là, je le garde près du menton.',
      'Je l’avais rangé là en 1987.',
      'Ah ! Il était sous un point-virgule.',
      'Tiens, il sent encore le café.',
      'Je l’ai. Ne tire pas sur la barbe.',
    ],
    shake: 'Je secoue… et il en tombe un.',
    unknown: (q) =>
      `« ${q} » n’est pas dans ma barbe. En fouillant, j’ai trouvé ça.`,
    related: 'Mots liés',
    citedIn: 'Cité dans',
    trail: 'fil suivi',
    seeRelated: 'Voir les mots liés',
    themes: {
      'evals-quality': 'Évaluation',
      'agentic-ai': 'Agents',
      'infra-tooling': 'Infrastructure',
      'ml-fundamentals': 'Fondamentaux',
    },
  },
  project: {
    code: 'Code source',
    others: 'Autres projets',
    enlarge: 'Agrandir',
  },
  journal: { written: 'Écrit le', empty: 'Rien encore sur ce bureau.' },
  about: { team: 'L’équipe', portrait: 'Portrait de Rachid Chabane' },
  next: 'À lire ensuite',
  notFound: {
    title: 'Cette page a quitté le bureau',
    body: 'Verrou et Cadenas ne l’ont pas vue sortir.',
    home: 'Retour à l’accueil',
  },
  months: [
    'janvier',
    'février',
    'mars',
    'avril',
    'mai',
    'juin',
    'juillet',
    'août',
    'septembre',
    'octobre',
    'novembre',
    'décembre',
  ],
  loading3d: 'Le bureau ouvre…',
};

const EN: OfficeStrings = {
  sections: {
    radar: 'Radar',
    blog: 'Articles',
    journal: 'Journal',
    work: 'Projects',
    library: 'Library',
    about: 'About',
  },
  libraryShort: 'Library',
  enter3d: 'Enter 3D',
  enter3dShort: '3D',
  night: 'Night',
  day: 'Day',
  menu: 'Menu',
  theme: 'Theme',
  language: 'Language',
  thisLanguage: 'English',
  textSize: 'Text',
  size: 'size',
  smaller: 'Smaller text',
  bigger: 'Larger text',
  aboutSub: 'Rachid, the team',
  read: 'Read',
  sources: 'Sources',
  consulted: 'read on',
  checked: 'STAMPED',
  toc: 'Contents',
  left: (min) => `${min} min left`,
  done: 'read',
  search: 'Search a title or a topic',
  noMatch: 'No text matches. Try another word.',
  counts: {
    briefs: (n) => `${n} briefs`,
    articles: (n) => `${n} articles`,
    texts: (n) => `${n} ${n > 1 ? 'texts' : 'text'}`,
    projects: (n) => `${n} projects`,
    words: (n) => `${n} words`,
  },
  kinds: {
    security: 'security',
    release: 'release',
    research: 'research',
    benchmark: 'benchmark',
    radar: 'Radar',
    blog: 'Articles',
  },
  frieze: {
    aria: 'The agents’ office, seen in section',
    say: {
      radar: 'Fresh this morning!',
      blog: 'We write. Come read.',
      work: 'Come see the models.',
      library: 'A word? It’s in my beard.',
      journal: '',
    },
  },
  ask: {
    placeholder: 'A question about this text',
    send: 'Send',
    suggestions: ['Sum it up in three sentences', 'What should I change?'],
    outOfTokens: [
      'Out of ink: today’s token budget is spent. Come back tomorrow and I’ll have something to write with. Meanwhile, the text is right above.',
      'I keep shaking the pen and not a word comes out. Tomorrow.',
      'Right. I’ll go sharpen pencils until tomorrow.',
    ],
  },
  sage: {
    placeholder: 'A word: agent, recall, cache…',
    ask: 'Ask',
    random: 'Random',
    hello: 'Ask me a word.',
    inBeard: (n) => `${n} words in the beard`,
    readCount: (n) => `${n} ${n > 1 ? 'words' : 'word'} read · the beard grows`,
    quips: [
      'Hold on, it’s stuck… there.',
      'That one I keep close to the chin.',
      'I filed it there in 1987.',
      'Ah! It was under a semicolon.',
      'Here, it still smells of coffee.',
      'Got it. Don’t pull the beard.',
    ],
    shake: 'I shake… and one falls out.',
    unknown: (q) =>
      `“${q}” is not in my beard. Digging around, I found this instead.`,
    related: 'Related words',
    citedIn: 'Cited in',
    trail: 'trail',
    seeRelated: 'See related words',
    themes: {
      'evals-quality': 'Evaluation',
      'agentic-ai': 'Agents',
      'infra-tooling': 'Infrastructure',
      'ml-fundamentals': 'Fundamentals',
    },
  },
  project: {
    code: 'Source code',
    others: 'Other projects',
    enlarge: 'Enlarge',
  },
  journal: { written: 'Written on', empty: 'Nothing on this desk yet.' },
  about: { team: 'The team', portrait: 'Portrait of Rachid Chabane' },
  next: 'Read next',
  notFound: {
    title: 'This page has left the office',
    body: 'Verrou and Cadenas did not see it go.',
    home: 'Back to the home page',
  },
  months: [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ],
  loading3d: 'The office is opening…',
};

const STRINGS: Record<Locale, OfficeStrings> = { fr: FR, en: EN };

export function officeStrings(lang: Locale): OfficeStrings {
  return STRINGS[lang];
}

/** Path of each section under a locale, in navigation order. */
export const SECTION_PATHS: Record<SectionKey, string> = {
  radar: 'radar/',
  blog: 'blog/',
  journal: 'journal/',
  work: 'work/',
  library: 'library/',
  about: 'about/',
};

export const SECTION_ORDER: SectionKey[] = [
  'radar',
  'blog',
  'journal',
  'work',
  'library',
  'about',
];

/** Colour token of each section's wall and sign. */
export const SECTION_COLOR: Record<SectionKey, string> = {
  radar: 'var(--radar)',
  blog: 'var(--art)',
  journal: 'var(--jrnl)',
  work: 'var(--ctrl)',
  library: 'var(--arch)',
  about: 'var(--wains)',
};
