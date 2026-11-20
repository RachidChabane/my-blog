/**
 * Cinematics: a few seconds each, made of shots drawn with the game's own sets and
 * sprites. Each ally who joins has a scene in a place that suits them, and the chapter
 * scenes show the allies already met. Every scene can be skipped, each one seen can be
 * replayed from the title, and every shot stays at least its caption's reading time.
 * Under reduced motion a shot is a still that waits for the player.
 */
import type { AllyKey, MemberKey } from '../../domain/party';
import { metBy as joinedBy } from '../../domain/campaign';
import { chapterCopy, cineCopy } from '../../i18n/copy';
import { FIGHTS_PER_CHAPTER } from '../../domain/rules';
import {
  G,
  $,
  FAST_READ,
  chapters,
  domainOf,
  esc,
  fast,
  reduced,
  wait,
} from './state';
import {
  choose,
  readingTime,
  setScene,
  setStep,
  setTurn,
  showLine,
} from './ui';
import {
  bossSvg,
  cafeSvg,
  castSvg,
  foeSvg,
  gloseSvg,
  heldCan,
  heldSheet,
  heldStamp,
  icon24,
  propSvg,
} from './art';
import { placeSvg, titleSet } from './sets';
import { blip } from './sound';

interface Shot {
  set: string;
  time: string;
  cls?: string;
  stage: string;
  ms: number;
}

const actor = (art: string, cls: string) =>
  `<span class="cast ${cls}">${art}</span>`;
const cards = (n: number, cls: string) =>
  `<span class="flock ${cls}">${Array.from({ length: n }, (_, i) => `<i style="--i:${i}"></i>`).join('')}</span>`;
const card = (title: string, sub: string) =>
  `<div class="titlecard"><b>${esc(title)}</b>${sub ? `<span>${esc(sub)}</span>` : ''}</div>`;
const prop = (html: string, cls: string) =>
  `<span class="prop ${cls}">${html}</span>`;

/** Allies met before the given chapter and room, in the order they joined. */
const metBy = (ch: number, step = 0): AllyKey[] =>
  joinedBy(G.host.campaign, ch, step).filter((k) =>
    G.host.progress.recruits.includes(k)
  );
/** The party walking in, the allies a step behind. */
const troupe = (ks: readonly MemberKey[], cls = 'walk-in-l') =>
  ks
    .map((k, i) =>
      actor(castSvg(k), `c-ally ${cls} late${Math.min(i + 1, 5)} slot${i + 1}`)
    )
    .join('');

/* ---------- each ally, in the place that suits them ---------- */
/** The domain of the chapter where an ally is met in the campaign being played. */
const joinDomain = (k: AllyKey): string =>
  domainOf(G.host.campaign.joins[k].ch);
const JOIN_SHOTS: Record<AllyKey, () => Shot[]> = {
  vigie: () => {
    const set = placeSvg(joinDomain('vigie'), 0);
    return [
      {
        set,
        time: 'night',
        stage:
          actor(castSvg('vigie'), 'c-recruit at-radar scanning') +
          prop('', 'radar-blips'),
        ms: 2600,
      },
      {
        set,
        time: 'night',
        stage:
          actor(castSvg('vigie'), 'c-recruit at-mid turn') +
          actor(castSvg('hero'), 'c-hero at-l'),
        ms: 2600,
      },
      {
        set,
        time: 'morning',
        stage:
          troupe(['hero', 'vigie'], 'at-row') +
          actor(gloseSvg(), 'c-glose at-r'),
        ms: 2400,
      },
    ];
  },
  navette: () => {
    const set = placeSvg(joinDomain('navette'), 1);
    return [
      {
        set,
        time: 'day',
        stage:
          actor(castSvg('navette', heldSheet()), 'c-recruit run-across') +
          cards(5, 'trail'),
        ms: 2400,
      },
      {
        set,
        time: 'day',
        stage:
          actor(castSvg('navette', heldSheet()), 'c-recruit at-mid skid') +
          actor(castSvg('hero'), 'c-hero at-l'),
        ms: 2600,
      },
      {
        set,
        time: 'day',
        stage:
          troupe(['hero', ...metBy(1, 1)], 'at-row') +
          actor(gloseSvg(), 'c-glose at-r'),
        ms: 2400,
      },
    ];
  },
  moka: () => {
    const set = placeSvg(joinDomain('moka'), 0);
    return [
      {
        set,
        time: 'morning',
        cls: 'warm',
        stage:
          prop(cafeSvg(), 'machine') +
          actor(castSvg('moka'), 'c-recruit behind-bar'),
        ms: 2600,
      },
      {
        set,
        time: 'morning',
        cls: 'warm',
        stage:
          prop(cafeSvg(), 'machine') +
          actor(castSvg('moka'), 'c-recruit behind-bar pour') +
          actor(castSvg('hero'), 'c-hero at-l') +
          prop(propSvg('cup'), 'cup-slide'),
        ms: 2600,
      },
      {
        set,
        time: 'day',
        stage:
          troupe(['hero', ...metBy(2, 1)], 'at-row') +
          actor(gloseSvg(), 'c-glose at-r'),
        ms: 2400,
      },
    ];
  },
  tampon: () => {
    const set = placeSvg(joinDomain('tampon'), 1);
    return [
      {
        set,
        time: 'day',
        stage:
          prop('', 'counter') +
          actor(castSvg('tampon', heldStamp()), 'c-recruit at-desk stamping') +
          cards(3, 'pile'),
        ms: 2600,
      },
      {
        set,
        time: 'day',
        stage:
          prop('', 'counter') +
          actor(castSvg('tampon', heldStamp()), 'c-recruit at-desk stamping') +
          actor(castSvg('hero'), 'c-hero at-l') +
          prop(`<span>${esc(G.c.stamps.visa)}</span>`, 'visa-mark'),
        ms: 2600,
      },
      {
        set,
        time: 'dusk',
        stage:
          troupe(['hero', ...metBy(3, 1)], 'at-row') +
          actor(gloseSvg(), 'c-glose at-r'),
        ms: 2400,
      },
    ];
  },
  arrosoir: () => {
    const set = placeSvg(joinDomain('arrosoir'), 0);
    const plants = prop(
      [1, 2, 3, 4].map(() => propSvg('pot')).join(''),
      'plants'
    );
    return [
      {
        set,
        time: 'morning',
        stage:
          plants +
          actor(
            castSvg('arrosoir', heldCan()),
            'c-recruit among-plants watering'
          ) +
          prop('', 'drops'),
        ms: 2600,
      },
      {
        set,
        time: 'morning',
        stage:
          plants +
          actor(castSvg('arrosoir', heldCan()), 'c-recruit among-plants') +
          actor(castSvg('hero'), 'c-hero at-l') +
          prop(propSvg('leaf'), 'leaf-fall'),
        ms: 2600,
      },
      {
        set,
        time: 'day',
        stage:
          troupe(['hero', ...metBy(4, 0)], 'at-row') +
          actor(gloseSvg(), 'c-glose at-r'),
        ms: 2400,
      },
    ];
  },
};

/** The shots of a scene, by id: intro, ending, chapter-N, boss-N, fall-N, join-K. */
function shotsOf(id: string): Shot[] {
  const [kind, n] = id.split('-');
  if (kind === 'join') return JOIN_SHOTS[n as AllyKey]();
  if (id === 'intro')
    return [
      {
        set: titleSet(),
        time: 'night',
        stage: actor(gloseSvg(), 'c-glose at-mid') + cards(6, 'stack'),
        ms: 2400,
      },
      {
        set: titleSet(),
        time: 'night',
        cls: 'quake',
        stage:
          actor(gloseSvg(), 'c-glose at-mid scared') +
          actor(foeSvg('grib'), 'c-foe rush-l') +
          actor(foeSvg('din'), 'c-foe rush-r') +
          cards(10, 'scatter'),
        ms: 2600,
      },
      {
        set: titleSet(),
        time: 'dawn',
        stage:
          actor(gloseSvg(), 'c-glose at-l') +
          actor(castSvg('hero'), 'c-hero walk-in-l') +
          card(G.c.page.game, ''),
        ms: 2600,
      },
    ];
  if (id === 'ending') {
    const all = metBy(chapters().length);
    return [
      {
        set: placeSvg(domainOf(chapters().length - 1), 2, true),
        time: 'dawn',
        stage:
          actor(castSvg('hero'), 'c-hero at-l cheer') +
          actor(gloseSvg(), 'c-glose at-r cheer'),
        ms: 2400,
      },
      {
        set: titleSet(),
        time: 'dawn',
        stage:
          troupe(all, 'at-row cheer') +
          actor(gloseSvg(), 'c-glose at-mid') +
          cards(10, 'gather'),
        ms: 2800,
      },
      {
        set: titleSet(),
        time: 'day',
        stage:
          actor(castSvg('hero'), 'c-hero at-l') +
          actor(gloseSvg(), 'c-glose at-r') +
          card(
            G.c.page.game,
            `${G.host.progress.freed.length} / ${G.qById.size}`
          ),
        ms: 2600,
      },
    ];
  }
  const i = Number(n);
  const C = chapters()[i];
  const domain = C.domain;
  const cc = chapterCopy(G.c, domain);
  if (kind === 'chapter')
    return [
      {
        set: placeSvg(domain, 0),
        time: 'morning',
        stage:
          actor(castSvg('hero'), 'c-hero walk-in-l') +
          actor(gloseSvg(), 'c-glose walk-in-l late') +
          troupe(metBy(i), 'walk-in-l') +
          card(G.c.cineTitles.chapter(i + 1, cc.short), cc.domain),
        ms: 2800,
      },
      {
        set: placeSvg(domain, 2),
        time: 'night',
        cls: 'boss',
        stage:
          actor(bossSvg(C.boss.key), 'c-boss silhouette') +
          card(cc.places[2], ''),
        ms: 2200,
      },
    ];
  if (kind === 'boss')
    return [
      {
        set: placeSvg(domain, 2),
        time: 'night',
        cls: 'boss lights-out',
        stage:
          actor(bossSvg(C.boss.key), 'c-boss drop') + card(cc.boss.name, ''),
        ms: 2600,
      },
    ];
  return [
    {
      set: placeSvg(domain, 2),
      time: 'night',
      cls: 'boss',
      stage: actor(bossSvg(C.boss.key), 'c-boss fall') + cards(8, 'burst'),
      ms: 2200,
    },
    {
      set: placeSvg(domain, 2, true),
      time: 'dawn',
      cls: 'lights-on',
      stage:
        actor(castSvg('hero'), 'c-hero at-l cheer') +
        troupe(metBy(i + 1), 'at-row cheer') +
        actor(gloseSvg(), 'c-glose at-r cheer'),
      ms: 2200,
    },
  ];
}

/** Ids of every scene the game can show, in story order. */
export const CINE_IDS = (): string[] => [
  'intro',
  ...chapters().flatMap((_, i) => [
    `chapter-${i}`,
    ...joinedBy(G.host.campaign, i, FIGHTS_PER_CHAPTER)
      .filter((k) => G.host.campaign.joins[k].ch === i)
      .map((k) => `join-${k}`),
    `boss-${i}`,
    `fall-${i}`,
  ]),
  'ending',
];

const shotTime = (shot: Shot, caption: string) =>
  Math.max(shot.ms, readingTime(caption) * (fast() ? FAST_READ : 1));

export async function playCine(
  id: string,
  { inline = false } = {}
): Promise<void> {
  const prog = G.host.progress;
  if (!prog.seen.includes(id)) {
    prog.seen.push(id);
    G.host.persist();
  }
  const copy = cineCopy(
    G.c,
    id,
    chapters().map((x) => x.domain)
  );
  const shots = shotsOf(id);
  const keep = inline
    ? { scene: $('scene').className, time: $('scene').dataset.time ?? '' }
    : null;
  const prevScreen = G.screen;
  G.screen = 'cine';
  setTurn(null);
  for (let s = 0; s < shots.length; s++) {
    const shot = shots[s];
    if (inline) {
      $('fx').innerHTML =
        `<div class="cine ${shot.cls ?? ''}">${shot.set.replace('class="setsvg', 'class="setsvg cine-set')}<div class="cine-stage">${shot.stage}</div></div>`;
    } else {
      setScene(shot.set, { cls: `in-cine ${shot.cls ?? ''}`, time: shot.time });
      $('layer').innerHTML = `<div class="cine-stage">${shot.stage}</div>`;
    }
    $('scene').dataset.time = shot.time;
    $('scene').dataset.cine = id;
    setStep(copy.title);
    const caption = copy.shots[Math.min(s, copy.shots.length - 1)];
    showLine(esc(caption), null);
    if (shot.cls?.includes('quake') || shot.stage.includes(' drop'))
      blip('boom');
    if (shot.stage.includes('stamping')) blip('skill:visa');
    const last = s === shots.length - 1;
    const pick = choose({
      kind: 'cine',
      layout: 'c2',
      items: [
        {
          k: 'next',
          cls: 'primary',
          html: `${esc(last ? G.c.cont : G.c.next)} ${icon24('arrow')}`,
        },
        { k: 'skip', html: `${icon24('skip')}${esc(G.c.skip)}` },
      ],
    });
    const k = reduced()
      ? await pick
      : await Promise.race([
          pick,
          wait(shotTime(shot, caption)).then(() => 'auto'),
        ]);
    if (k === 'skip') break;
  }
  setStep(null);
  delete $('scene').dataset.cine;
  if (inline && keep) {
    $('fx').innerHTML = '';
    $('scene').className = keep.scene;
    $('scene').dataset.time = keep.time;
  }
  G.screen = prevScreen;
}

/** The title's "Scenes" menu: every scene already seen, to watch again. */
export async function replayMenu(): Promise<void> {
  const prog = G.host.progress;
  for (;;) {
    const seen = CINE_IDS().filter((x) => prog.seen.includes(x));
    setScene(titleSet(), { time: 'night' });
    showLine(esc(G.c.labels.cines), null);
    const k = await choose({
      kind: 'cines',
      label: G.c.labels.cines,
      back: true,
      layout: 'list scroll',
      items: seen.map((x) => ({
        k: x,
        html: `${icon24('film')}<span>${esc(
          cineCopy(
            G.c,
            x,
            chapters().map((y) => y.domain)
          ).title
        )}</span>`,
        cls: 'reward',
      })),
    });
    if (k === 'back') return;
    await playCine(k);
  }
}
