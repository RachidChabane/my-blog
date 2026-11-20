/** Interface copy of the office, per locale. Content strings live with the content. */
import type { Locale } from '@/i18n/index';
import type { RoomKey, SectionKey } from '@/office/sections';

export interface OfficeStrings {
  sections: Record<SectionKey, string>;
  /** Label of each section where room is short: the phone bar and the mini nav. */
  short: Record<SectionKey, string>;
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
  frieze: {
    aria: string;
    say: Record<RoomKey, string>;
    sayNight: Record<RoomKey, string>;
  };
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
  drill: {
    description: string;
    intro: string;
    /** Label of the link that opens the page with the game started. */
    play: string;
    domainsLine: (n: number, code: string) => string;
    count: (questions: number, domains: number) => string;
    certifications: string;
    certCaption: string;
    certCols: {
      title: string;
      issuer: string;
      date: string;
      score: string;
      proof: string;
    };
    proofLink: (host: string) => string;
    exam: string;
    examCaption: (code: string) => string;
    examCols: { domain: string; weight: string; inGame: string };
    total: string;
    format: (n: number, minutes: number, pass: number, max: number) => string;
  };
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
    training: 'Entraînement',
    about: 'À propos',
  },
  short: {
    radar: 'Radar',
    blog: 'Articles',
    journal: 'Journal',
    work: 'Projets',
    library: 'Biblio',
    training: 'Quiz',
    about: 'À propos',
  },
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
      training: 'Je chronomètre. Prêt ?',
    },
    sayNight: {
      radar: 'Je veille. Rien ne passe.',
      blog: 'Chut, on écrit encore.',
      work: 'Les maquettes dorment.',
      library: 'Un mot ? Même la nuit.',
      journal: '',
      training: 'Une dernière série ?',
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
  drill: {
    description:
      'Entraînement aux examens Claude Certified Architect d’Anthropic, sous forme de jeu, avec les certifications de Rachid Chabane et le détail de l’examen CCAR-F.',
    play: 'Jouer',
    intro:
      'Un entraînement aux examens Claude Certified Architect d’Anthropic, sous forme de jeu.',
    domainsLine: (n, code) =>
      `Les questions couvrent les ${n} domaines de l’examen ${code}.`,
    count: (q, d) => `${q} questions · ${d} domaines`,
    certifications: 'Certifications',
    certCaption: 'Certifications de Rachid Chabane',
    certCols: {
      title: 'Certification',
      issuer: 'Organisme',
      date: 'Date',
      score: 'Score',
      proof: 'Justificatif',
    },
    proofLink: (host) => `Badge sur ${host}`,
    exam: 'L’examen',
    examCaption: (code) => `Domaines de l’examen ${code}`,
    examCols: {
      domain: 'Domaine',
      weight: 'Poids dans l’examen',
      inGame: 'Questions dans le jeu',
    },
    total: 'Total',
    format: (n, min, pass, max) =>
      `${n} questions · ${min} minutes · réussite à ${pass} sur ${max}`,
  },
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
    training: 'Training',
    about: 'About',
  },
  short: {
    radar: 'Radar',
    blog: 'Articles',
    journal: 'Journal',
    work: 'Projects',
    library: 'Library',
    training: 'Quiz',
    about: 'About',
  },
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
      training: 'I’ll time you. Ready?',
    },
    sayNight: {
      radar: 'On watch. Nothing gets by.',
      blog: 'Hush, still writing.',
      work: 'The models are asleep.',
      library: 'A word? Even at night.',
      journal: '',
      training: 'One more round?',
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
  drill: {
    description:
      'Practice for Anthropic’s Claude Certified Architect exams, played as a game, with Rachid Chabane’s certifications and the outline of the CCAR-F exam.',
    play: 'Play',
    intro:
      'Practice for Anthropic’s Claude Certified Architect exams, played as a game.',
    domainsLine: (n, code) =>
      `The questions cover the ${n} domains of the ${code} exam.`,
    count: (q, d) => `${q} questions · ${d} domains`,
    certifications: 'Certifications',
    certCaption: 'Certifications held by Rachid Chabane',
    certCols: {
      title: 'Certification',
      issuer: 'Issuer',
      date: 'Date',
      score: 'Score',
      proof: 'Proof',
    },
    proofLink: (host) => `Badge on ${host}`,
    exam: 'The exam',
    examCaption: (code) => `Domains of the ${code} exam`,
    examCols: {
      domain: 'Domain',
      weight: 'Weight in the exam',
      inGame: 'Questions in the game',
    },
    total: 'Total',
    format: (n, min, pass, max) =>
      `${n} questions · ${min} minutes · pass mark ${pass} out of ${max}`,
  },
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
