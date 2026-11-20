/**
 * Cinematics: a few seconds each, made of shots drawn with the game's own sets and
 * sprites. Every scene can be skipped, and each one seen can be replayed from the title.
 * Under reduced motion a shot is a still that waits for the player.
 */
import { CHAPTERS } from '../../domain/rules';
import { chapterCopy, cineCopy } from '../../i18n/copy';
import { G, $, esc, reduced, wait } from './state';
import { blip, choose, setScene, setStep, setTurn, showLine } from './ui';
import { bossSvg, foeSvg, gloseSvg, heroSvg, icon24 } from './art';
import { placeSvg, titleSet } from './sets';

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

/** The shots of a scene, by id: intro, ending, chapter-N, boss-N, fall-N. */
function shotsOf(id: string): Shot[] {
  const [kind, n] = id.split('-');
  const i = Number(n);
  if (id === 'intro')
    return [
      {
        set: titleSet(),
        time: 'night',
        stage: actor(gloseSvg(), 'c-glose at-mid') + cards(6, 'stack'),
        ms: 2200,
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
        ms: 2400,
      },
      {
        set: titleSet(),
        time: 'dawn',
        stage:
          actor(gloseSvg(), 'c-glose at-l') +
          actor(heroSvg(), 'c-hero walk-in-l') +
          card(G.c.game, ''),
        ms: 2400,
      },
    ];
  if (id === 'ending')
    return [
      {
        set: placeSvg(CHAPTERS[CHAPTERS.length - 1].domain, 2, true),
        time: 'dawn',
        stage:
          actor(heroSvg(), 'c-hero at-l cheer') +
          actor(gloseSvg(), 'c-glose at-r cheer'),
        ms: 2200,
      },
      {
        set: titleSet(),
        time: 'dawn',
        stage: actor(gloseSvg(), 'c-glose at-mid') + cards(10, 'gather'),
        ms: 2400,
      },
      {
        set: titleSet(),
        time: 'day',
        stage:
          actor(heroSvg(), 'c-hero at-l') +
          actor(gloseSvg(), 'c-glose at-r') +
          card(G.c.game, `${G.host.save.freed.length} / ${G.qById.size}`),
        ms: 2400,
      },
    ];
  const domain = CHAPTERS[i].domain;
  const cc = chapterCopy(G.c, i);
  if (kind === 'chapter')
    return [
      {
        set: placeSvg(domain, 0),
        time: 'morning',
        stage:
          actor(heroSvg(), 'c-hero walk-in-l') +
          actor(gloseSvg(), 'c-glose walk-in-l late') +
          card(G.c.cineTitles.chapter(i + 1, cc.short), cc.domain),
        ms: 2600,
      },
      {
        set: placeSvg(domain, 2),
        time: 'night',
        cls: 'boss',
        stage:
          actor(bossSvg(domain), 'c-boss silhouette') + card(cc.places[2], ''),
        ms: 1800,
      },
    ];
  if (kind === 'boss')
    return [
      {
        set: placeSvg(domain, 2),
        time: 'night',
        cls: 'boss lights-out',
        stage:
          actor(bossSvg(domain), 'c-boss drop') +
          card(cc.boss.name, cc.boss.move),
        ms: 2400,
      },
    ];
  return [
    {
      set: placeSvg(domain, 2),
      time: 'night',
      cls: 'boss',
      stage: actor(bossSvg(domain), 'c-boss fall') + cards(8, 'burst'),
      ms: 2000,
    },
    {
      set: placeSvg(domain, 2, true),
      time: 'dawn',
      cls: 'lights-on',
      stage:
        actor(heroSvg(), 'c-hero at-l cheer') +
        actor(gloseSvg(), 'c-glose at-r cheer'),
      ms: 2000,
    },
  ];
}

/** Ids of every scene the game can show, in story order. */
export const CINE_IDS = (): string[] => [
  'intro',
  ...CHAPTERS.flatMap((_, i) => [`chapter-${i}`, `boss-${i}`, `fall-${i}`]),
  'ending',
];

export async function playCine(
  id: string,
  { inline = false } = {}
): Promise<void> {
  const save = G.host.save;
  if (!save.seen.includes(id)) {
    save.seen.push(id);
    G.host.persist();
  }
  const copy = cineCopy(G.c, id);
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
    setStep(copy.title);
    showLine(esc(copy.shots[Math.min(s, copy.shots.length - 1)]), null);
    if (shot.cls?.includes('quake') || shot.stage.includes(' drop'))
      blip('boom');
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
      : await Promise.race([pick, wait(shot.ms).then(() => 'auto')]);
    if (k === 'skip') break;
  }
  setStep(null);
  if (inline && keep) {
    $('fx').innerHTML = '';
    $('scene').className = keep.scene;
    $('scene').dataset.time = keep.time;
  }
  G.screen = prevScreen;
}

/** The title's "Scenes" menu: every scene already seen, to watch again. */
export async function replayMenu(): Promise<void> {
  const save = G.host.save;
  for (;;) {
    const seen = CINE_IDS().filter((x) => save.seen.includes(x));
    setScene(titleSet(), { time: 'night' });
    showLine(esc(G.c.labels.cines), null);
    const k = await choose({
      kind: 'cines',
      label: G.c.labels.cines,
      back: true,
      layout: 'list scroll',
      items: seen.map((x) => ({
        k: x,
        html: `${icon24('film')}<span>${esc(cineCopy(G.c, x).title)}</span>`,
        cls: 'reward',
      })),
    });
    if (k === 'back') return;
    await playCine(k);
  }
}
