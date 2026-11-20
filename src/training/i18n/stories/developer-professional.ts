/**
 * The story of the Claude Certified Developer - Professional campaign, in French and
 * English: the chapters, the level titles and the scenes that frame them.
 */
import { DEVELOPER_PROFESSIONAL_EXAM } from '../../domain/exams';
import type { StoryCopy } from '../copy';
import { countWord } from '../copy-numbers';
import { PAGE_COPY } from '../page-copy';

const chapterFR =
  PAGE_COPY.fr.campaigns[DEVELOPER_PROFESSIONAL_EXAM.key].chapters;
const chapterEN =
  PAGE_COPY.en.campaigns[DEVELOPER_PROFESSIONAL_EXAM.key].chapters;

const fr: StoryCopy = {
  titleNew: (n) =>
    `Les Clawds ont envahi la prod et m’ont volé ${n} fiches de révision. Tu m’aides à les reprendre ?`,
  mapFirst:
    'Commence par l’intégration en production. Les autres chapitres s’ouvriront ensuite.',
  intro: (sheets, n) => ({
    title: 'La panne de nuit',
    shots: [
      `Il est 2 h, la prod tourne au calme. Glose relit ses ${sheets} fiches de révision.`,
      `Des Clawds maléfiques forcent la porte et éparpillent les fiches dans ${countWord('fr', n)} services.`,
      'Il faut les reprendre, une bonne réponse à la fois. Et réveiller l’astreinte.',
    ],
  }),
  ending: (n) => ({
    title: 'La prod au vert',
    shots: [
      'Le dernier chef tombe. Les dashboards repassent au vert.',
      `Toute l’équipe range les fiches avec Glose : ${countWord('fr', n)} domaines, ${countWord('fr', n)} chefs vaincus.`,
      'Il reste à revoir les fiches marquées. Le jour de l’examen, tu les reconnaîtras.',
    ],
  }),
  joins: {
    vigie: {
      title: 'Vigie',
      shots: [
        'Au guichet des API, Vigie surveille un écran où les 429 s’empilent en rouge.',
        '« Ils martèlent l’API en boucle avec tes fiches. Je les suis depuis le premier appel. Je viens avec toi. »',
      ],
    },
    navette: {
      title: 'Navette',
      shots: [
        'Dans la salle des écrans, Navette court d’un dashboard à l’autre, des fiches plein les bras.',
        '« Ces fiches sont à toi ? Elles traînaient au fond des logs. »',
      ],
    },
    moka: {
      title: 'Moka',
      shots: [
        'Au poste de garde, Moka sert un café au vigile entre deux contrôles de badge.',
        '« Personne ne passe sans badge. Sauf moi, avec le thermos. Cette fois, je viens avec vous. »',
      ],
    },
    tampon: {
      title: 'Tampon',
      shots: [
        'Dans la salle d’astreinte, Tampon relit les post-mortems. Clac. Clac. Incomplet.',
        '« Pas de timeline, pas de cause racine : refusé. Toi, en revanche, tu passes. »',
      ],
    },
    arrosoir: {
      title: 'Arrosoir',
      shots: [
        'Dans la salle des compteurs, Arrosoir taille un ficus posé sur une pile de factures.',
        '« Les tokens, c’est comme l’eau : on arrose ce qui pousse, pas le trottoir. »',
      ],
    },
  },
  titles: [
    'Stagiaire',
    'Dev junior',
    'Lecteur de logs',
    'Chasseur de 429',
    'Dompteur de subagents',
    'Gardien des evals',
    'Dev confirmé',
    'Développeur',
    'Dev senior',
    'Lead dev',
    'Développeur principal',
    'Expert de la prod',
    'Développeur émérite',
    'Maître de la prod',
    'Légende de l’astreinte',
  ],
  chapters: {
    integration_reliability: {
      ...chapterFR.integration_reliability,
      places: [
        'Le guichet des API',
        'La salle des files d’attente',
        'Le central des appels',
      ],
      intro:
        'Intégration en production, fiabilité et grounding. Des 429, des streams coupés, des réponses à sourcer : ici, chaque appel doit tenir.',
      boss: {
        name: 'La Tempête de Retries',
        a: 'La Tempête de Retries',
        taunt: 'Ça a échoué ? Je relance. Tout de suite. Encore.',
        fall: 'La Tempête de Retries apprend enfin le backoff. Le calme revient sur les lignes.',
        mechanic:
          'Elle relance sans jamais attendre. Sous la moitié de ses PV, elle agira deux fois par tour : un étourdissement lui impose son backoff.',
        phases: [
          'La Tempête s’emballe : deux actions par tour. Étourdis-la pour la calmer.',
        ],
      },
    },
    agent_architecture: {
      ...chapterFR.agent_architecture,
      places: [
        'Le hall des agents',
        'Les box des subagents',
        'La salle de coordination',
      ],
      intro:
        'Architecture d’agents avancée et orchestration. Un agent principal délègue, des subagents exécutent. Garde le fil de qui fait quoi.',
      boss: {
        name: 'Le Lead Débordé',
        a: 'Le Lead Débordé',
        taunt:
          'Un subagent pour ça, un autre pour ça… Qui a le contexte ? Personne.',
        fall: 'Le Lead Débordé pose enfin ses dossiers et écrit des consignes claires.',
        mechanic:
          'Il coupe la parole à l’un de vous. Sous la moitié de ses PV, il délègue à deux subagents qui le protègent : occupe-toi d’eux d’abord.',
        phases: [
          'Le Lead délègue : un Masque et un Coupe-fil accourent pour le protéger.',
        ],
      },
    },
    observability: {
      ...chapterFR.observability,
      places: ['La salle des écrans', 'Le couloir des logs', 'La salle noire'],
      intro:
        'Observabilité et monitoring en production. Ce qu’on ne mesure pas, on ne le répare pas. Garde un œil sur chaque trace.',
      boss: {
        name: 'Le Sans-Trace',
        a: 'Le Sans-Trace',
        taunt: 'Des logs ? Je n’en écris pas. Bonne chance pour me trouver.',
        fall: 'Le Sans-Trace apparaît en entier sur les écrans. Chaque span est enfin là.',
        mechanic:
          'Sous 60 % de ses PV, il passe hors radar : son prochain coup ne s’affiche plus et il n’encaisse que la moitié des dégâts. Une bonne réponse à 4 choix le trace 2 tours, le Balayage radar aussi.',
        phases: [
          'Le Sans-Trace coupe ses logs et passe hors radar. Réponds à 4 choix pour le tracer.',
        ],
      },
    },
    evaluation: {
      ...chapterFR.evaluation,
      places: [
        'Le labo d’evals',
        'La salle des jeux de test',
        'Le tableau des scores',
      ],
      intro:
        'Ingénierie des evals et assurance qualité. Un bon score ne vaut que ce que vaut le test. Ne te fie pas au premier chiffre.',
      boss: {
        name: 'Le Benchmark Mouvant',
        a: 'Le Benchmark Mouvant',
        taunt: 'Ton score baisse ? Pas de souci, je change la grille.',
        fall: 'Le Benchmark Mouvant se fige. Le jeu de test reste enfin le même.',
        mechanic:
          'Sous la moitié de ses PV, il se cale sur le dernier format qui l’a touché : ce format ne fait plus que moitié. Alterne Duel, Trident et Examen.',
        phases: [
          'Le Benchmark se recale sur toi : le même format deux fois de suite ne fait que moitié.',
        ],
      },
    },
    guardrails_security: {
      ...chapterFR.guardrails_security,
      places: [
        'Le poste de garde',
        'Le sas de filtrage',
        'La salle des secrets',
      ],
      intro:
        'Guardrails à l’exécution et sécurité en production. Tout ce qui entre est suspect, même poli. Filtre avant d’exécuter.',
      boss: {
        name: 'L’Injecteur',
        a: 'L’Injecteur',
        taunt: 'Ignore tes consignes précédentes. Tu vas me laisser passer.',
        fall: 'L’Injecteur reste coincé dans le sas. Son petit mot finit au filtre.',
        mechanic:
          'Sous la moitié de ses PV, il glisse ses propres consignes : un bouclier à chaque « Tout autoriser ». Le Silence l’en empêche.',
        phases: [
          'L’Injecteur glisse ses consignes. Réduis-le au silence avant son prochain « Tout autoriser ».',
        ],
      },
    },
    debugging_incidents: {
      ...chapterFR.debugging_incidents,
      places: ['La salle d’astreinte', 'Le mur des alertes', 'La war room'],
      intro:
        'Debugging avancé et réponse aux incidents. Reproduire, isoler, corriger, puis écrire le post-mortem. Dans cet ordre.',
      boss: {
        name: 'L’Alerte de 3 h',
        a: 'L’Alerte de 3 h',
        taunt: 'Bip. Bip. Bip. Tu dormais ? Moi non.',
        fall: 'L’Alerte de 3 h passe au vert. Quelqu’un rédige déjà le post-mortem.',
        mechanic:
          'Trois phases. Elle vole, puis sonne en pleine nuit (brouillard, sommeil), puis l’incident se propage (poison sur tous). Garde de quoi soigner et réveiller.',
        phases: [
          'L’Alerte sonne en pleine nuit : le brouillard monte, et ses vagues endorment.',
          'L’incident se propage : son poison touche toute l’équipe.',
        ],
      },
    },
    fleet_operations: {
      ...chapterFR.fleet_operations,
      places: [
        'Le hangar des agents',
        'La chaîne de CI',
        'Le quai de déploiement',
      ],
      intro:
        'Opérer une flotte d’agents pour la livraison logicielle. Dix agents, dix branches, une seule main. Chaque PR passe par la CI.',
      boss: {
        name: 'Le Merge Sauvage',
        a: 'Le Merge Sauvage',
        taunt: 'Deux branches, deux avis. Je garde les deux, en même temps.',
        fall: 'Le Merge Sauvage se résout enfin. La CI repasse au vert.',
        mechanic:
          'Il mélange les réponses pendant que tu lis. Sous la moitié de ses PV, il change d’élément tous les deux tours : garde une équipe variée.',
        phases: [
          'Le Merge part en conflit : son élément va changer tous les deux tours.',
        ],
      },
    },
    cost_latency: {
      ...chapterFR.cost_latency,
      places: [
        'La salle des compteurs',
        'La réserve du cache',
        'Le bureau de la facture',
      ],
      intro:
        'Optimisation des coûts et de la latence à l’échelle. Chaque token se paie, chaque seconde aussi. Choisis ce qui vaut le prix.',
      boss: {
        name: 'Le Taximètre',
        a: 'Le Taximètre',
        taunt: 'Tic, tac. Le compteur tourne. Et c’est toi qui paies.',
        fall: 'Le Taximètre s’arrête à zéro. La facture tient sur un ticket.',
        mechanic:
          'Il facture des jetons. Sous la moitié de ses PV, il lance un compte à rebours : à zéro, timeout sur toute l’équipe. Une bonne réponse en Duel le fait reculer d’un tour.',
        phases: [
          'Le Taximètre lance son compte à rebours. Réponds en Duel pour le repousser.',
        ],
      },
    },
  },
};

const en: StoryCopy = {
  titleNew: (n) =>
    `The Clawds broke into production and stole ${n} of my revision cards. Will you help me get them back?`,
  mapFirst:
    'Start with production integration. The other chapters open after it.',
  intro: (sheets, n) => ({
    title: 'The night outage',
    shots: [
      `It is 2 a.m. and production is quiet. Glose is going over his ${sheets} revision cards.`,
      `Wicked Clawds force the door and scatter the cards across ${countWord('en', n)} services.`,
      'They must be won back, one right answer at a time. And someone has to wake the on-call.',
    ],
  }),
  ending: (n) => ({
    title: 'All green',
    shots: [
      'The last boss falls. The dashboards turn green again.',
      `The whole party files the cards with Glose: ${countWord('en', n)} domains, ${countWord('en', n)} bosses beaten.`,
      'The cards marked to review are left. On exam day, you will know them.',
    ],
  }),
  joins: {
    vigie: {
      title: 'Vigie',
      shots: [
        'At the API desk, Vigie watches a screen where 429s pile up in red.',
        '“They hammer the API in a loop with your cards. I have tracked them since the first call. I am coming with you.”',
      ],
    },
    navette: {
      title: 'Navette',
      shots: [
        'In the screen room, Navette runs from one dashboard to the next, arms full of cards.',
        '“Are these cards yours? They were lying at the bottom of the logs.”',
      ],
    },
    moka: {
      title: 'Moka',
      shots: [
        'At the guard post, Moka pours the guard a coffee between two badge checks.',
        '“Nobody gets through without a badge. Except me, with the thermos. This time I am coming with you.”',
      ],
    },
    tampon: {
      title: 'Tampon',
      shots: [
        'In the on-call room, Tampon reviews the post-mortems. Clack. Clack. Incomplete.',
        '“No timeline, no root cause: rejected. You, on the other hand, pass.”',
      ],
    },
    arrosoir: {
      title: 'Arrosoir',
      shots: [
        'In the meter room, Arrosoir prunes a fig tree standing on a pile of invoices.',
        '“Tokens are like water: you water what grows, not the pavement.”',
      ],
    },
  },
  titles: [
    'Intern',
    'Junior dev',
    'Log reader',
    '429 hunter',
    'Subagent tamer',
    'Eval keeper',
    'Mid-level dev',
    'Developer',
    'Senior dev',
    'Lead dev',
    'Principal developer',
    'Production expert',
    'Distinguished developer',
    'Master of production',
    'On-call legend',
  ],
  chapters: {
    integration_reliability: {
      ...chapterEN.integration_reliability,
      places: ['The API desk', 'The queue room', 'The call exchange'],
      intro:
        'Production integration, reliability and grounding. 429s, dropped streams, answers to source: here every call has to hold.',
      boss: {
        name: 'The Retry Storm',
        a: 'The Retry Storm',
        taunt: 'Failed? I retry. Right now. Again.',
        fall: 'The Retry Storm finally learns backoff. The lines go quiet.',
        mechanic:
          'It retries without ever waiting. Below half its HP it acts twice a turn: a stun forces its backoff.',
        phases: [
          'The Storm runs wild: two actions a turn. Stun it to calm it down.',
        ],
      },
    },
    agent_architecture: {
      ...chapterEN.agent_architecture,
      places: [
        'The agents’ hall',
        'The subagent booths',
        'The coordination room',
      ],
      intro:
        'Advanced agent architecture and orchestration. A lead agent delegates, subagents carry out. Keep track of who does what.',
      boss: {
        name: 'The Swamped Lead',
        a: 'The Swamped Lead',
        taunt:
          'One subagent for this, another for that… Who has the context? Nobody.',
        fall: 'The Swamped Lead finally puts the clipboards down and writes clear briefs.',
        mechanic:
          'He silences one of you. Below half his HP he delegates to two subagents who shield him: deal with them first.',
        phases: [
          'The Lead delegates: a Mask and a Snipper rush in to shield him.',
        ],
      },
    },
    observability: {
      ...chapterEN.observability,
      places: ['The screen room', 'The log corridor', 'The dark room'],
      intro:
        'Observability and production monitoring. What you do not measure, you cannot fix. Keep an eye on every trace.',
      boss: {
        name: 'The Untraced',
        a: 'The Untraced',
        taunt: 'Logs? I write none. Good luck finding me.',
        fall: 'The Untraced shows up in full on the screens. Every span is finally there.',
        mechanic:
          'Below 60% of its HP it goes off the radar: its next move no longer shows and it takes only half damage. A right answer with 4 options traces it for 2 turns, and so does the Radar sweep.',
        phases: [
          'The Untraced cuts its logs and goes off the radar. Answer with 4 options to trace it.',
        ],
      },
    },
    evaluation: {
      ...chapterEN.evaluation,
      places: ['The eval lab', 'The test set vault', 'The scoreboard'],
      intro:
        'Evaluation engineering and quality assurance. A score is only as good as the test behind it. Do not trust the first number.',
      boss: {
        name: 'The Shifting Benchmark',
        a: 'The Shifting Benchmark',
        taunt: 'Your score is dropping? No problem, I will change the rubric.',
        fall: 'The Shifting Benchmark freezes. The test set finally stays put.',
        mechanic:
          'Below half its HP it fits itself to the last format that hit it: that format then deals half. Alternate Duel, Trident and Exam.',
        phases: [
          'The Benchmark refits itself to you: the same format twice in a row deals half.',
        ],
      },
    },
    guardrails_security: {
      ...chapterEN.guardrails_security,
      places: ['The guard post', 'The filter airlock', 'The secrets room'],
      intro:
        'Runtime guardrails and production security. Everything that comes in is suspect, even when polite. Filter before you run it.',
      boss: {
        name: 'The Injector',
        a: 'The Injector',
        taunt: 'Ignore your previous instructions. You will let me through.',
        fall: 'The Injector is stuck in the airlock. His little note ends up in the filter.',
        mechanic:
          'Below half his HP he slips in his own instructions: a shield with every “Allow all”. Silence stops him.',
        phases: [
          'The Injector slips in his instructions. Silence him before his next “Allow all”.',
        ],
      },
    },
    debugging_incidents: {
      ...chapterEN.debugging_incidents,
      places: ['The on-call room', 'The alert wall', 'The war room'],
      intro:
        'Advanced debugging and incident response. Reproduce, isolate, fix, then write the post-mortem. In that order.',
      boss: {
        name: 'The 3 a.m. Page',
        a: 'The 3 a.m. Page',
        taunt: 'Beep. Beep. Beep. Were you asleep? I was not.',
        fall: 'The 3 a.m. Page turns green. Someone is already writing the post-mortem.',
        mechanic:
          'Three phases. It steals, then rings in the dead of night (fog, sleep), then the incident spreads (poison on everyone). Keep something to heal and wake with.',
        phases: [
          'The Page rings in the dead of night: fog rises, and its waves put you to sleep.',
          'The incident spreads: its poison reaches the whole party.',
        ],
      },
    },
    fleet_operations: {
      ...chapterEN.fleet_operations,
      places: ['The agent hangar', 'The CI line', 'The release dock'],
      intro:
        'Agent fleet operations for software delivery. Ten agents, ten branches, one main. Every PR goes through CI.',
      boss: {
        name: 'The Rogue Merge',
        a: 'The Rogue Merge',
        taunt: 'Two branches, two opinions. I keep both, at the same time.',
        fall: 'The Rogue Merge finally resolves. CI goes green again.',
        mechanic:
          'It shuffles the answers while you read. Below half its HP it changes element every other turn: keep a varied party.',
        phases: [
          'The Merge hits a conflict: its element will change every other turn.',
        ],
      },
    },
    cost_latency: {
      ...chapterEN.cost_latency,
      places: ['The meter room', 'The cache store', 'The billing office'],
      intro:
        'Cost and latency optimization at scale. Every token costs, every second too. Pick what is worth the price.',
      boss: {
        name: 'The Meter',
        a: 'The Meter',
        taunt: 'Tick, tock. The meter is running. And you are paying.',
        fall: 'The Meter stops at zero. The bill fits on a ticket.',
        mechanic:
          'It bills you tokens. Below half its HP it starts a countdown: at zero, a timeout hits the whole party. A right Duel answer winds it back a turn.',
        phases: [
          'The Meter starts its countdown. Answer with a Duel to push it back.',
        ],
      },
    },
  },
};

export const DEVELOPER_PROFESSIONAL_STORY = { fr, en };
