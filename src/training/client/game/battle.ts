/** A fight: the presenter of the combat engine. It asks, animates and narrates; the engine decides. */
import type { Question } from '../../domain/bank';
import { drawOptions } from '../../domain/options';
import type { Draw } from '../../domain/options';
import { shuffle } from '../../domain/random';
import {
  alive,
  attack,
  enemyPhase,
  foeBy,
  guard,
  isFx,
  itemBlock,
  knowKey,
  makeFight,
  powerBlock,
  shielded,
  targetable,
  useItem,
  usePower,
  weaponBlocked,
} from '../../domain/engine';
import type { Ev, Foe, Fx } from '../../domain/engine';
import {
  ITEM_KEYS,
  POWER_COST,
  POWER_KEYS,
  RULES,
  WEAPONS,
  WEAPON_KEYS,
} from '../../domain/rules';
import type { IntentKey, WeaponKey } from '../../domain/rules';
import { chapterCopy } from '../../i18n/copy';
import type { IntentName } from '../../i18n/copy';
import { G, $, esc, reduced, wait } from './state';
import {
  Zone,
  blip,
  bubbleAt,
  choose,
  foeArt,
  foeName,
  goButton,
  holdLine,
  menuKind,
  pickMenu,
  renderStatus,
  say,
  sayOne,
  sayText,
  setScene,
  setStep,
  setTurn,
  showLine,
  gameHasFocus,
  advance,
} from './ui';
import { icon24 } from './art';
import { partyHtml, chapterChrome, setForStep } from './screens';
import { playCine } from './cine';

/* ---------- intents ---------- */
const INTENT_ICON: Record<IntentName, string> = {
  hit: '<path d="M8 1l2 4 5-1-3 4 3 4-5-1-2 4-2-4-5 1 3-4-3-4 5 1z"/>',
  big: '<path d="M8 0l2.4 4.4 5.6-1.2-3.6 4.8 3.6 4.8-5.6-1.2L8 16l-2.4-4.4L0 12.8l3.6-4.8L0 3.2l5.6 1.2z"/>',
  charge: '<path d="M8 1l6 7h-4v7H6V8H2z"/>',
  ink: '<path d="M8 1C8 1 3 8 3 11a5 5 0 0 0 10 0C13 8 8 1 8 1z"/>',
  gag: '<rect x="1" y="6" width="14" height="4"/>',
  tache:
    '<circle cx="8" cy="8" r="5"/><circle cx="3" cy="3" r="1.6"/><circle cx="13.5" cy="12.5" r="1.4"/>',
  back: '<path d="M7 2L1 8l6 6V10h8V6H7z"/>',
  wave: '<path d="M0 11q2-4 4 0t4 0 4 0 4 0v3H0z"/><path d="M0 6q2-4 4 0t4 0 4 0 4 0" fill="none" stroke="currentColor" stroke-width="2"/>',
  fog: '<path d="M1 5h10M4 9h11M1 13h9" stroke="currentColor" stroke-width="2.4" fill="none"/>',
  special:
    '<path d="M8 .5l2.2 4.8 5.3.6-3.9 3.6 1.1 5.2L8 12l-4.7 2.7 1.1-5.2L.5 5.9l5.3-.6z"/>',
  stun: '<circle cx="5" cy="8" r="3" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="11" cy="8" r="3" fill="none" stroke="currentColor" stroke-width="2"/>',
};
export const icon16 = (k: IntentName) =>
  `<svg viewBox="0 0 16 16" aria-hidden="true" fill="currentColor">${INTENT_ICON[k]}</svg>`;
const AREA: ReadonlySet<IntentKey> = new Set(['wave', 'fog']);
const intentOf = (e: Foe): IntentName => (e.stun ? 'stun' : e.intent.k);
const special = (e: Foe) =>
  e.type === 'boss' ? chapterCopy(G.c, e.ch).boss.move : '';
const intentLabel = (e: Foe) =>
  G.c.intentLabel(intentOf(e), e.intent.n, special(e));
const intentHelp = (e: Foe) =>
  G.c.intentHelp(intentOf(e), e.intent.n, special(e));

/* ---------- the foes on stage ---------- */
const idleOf = (e: Foe) => (e.type === 'boss' ? 'idle-boss' : `idle-${e.type}`);
function foeCard(e: Foe): string {
  return (
    `<button type="button" class="foe" data-uid="${e.uid}" tabindex="-1"><span class="intent" tabindex="0" role="button"></span>` +
    `<span class="art ${idleOf(e)}">${foeArt(e)}</span><span class="plate"><span class="fname"></span><span class="fpv"><span class="hb"><i></i></span><span class="pvn"></span></span><span class="toks"></span></span><span class="shield" hidden></span></button>`
  );
}
const foeEl = (uid: number) =>
  $('layer').querySelector<HTMLElement>(`.foe[data-uid="${uid}"]`);

export function updateFoes(): void {
  const F = G.F;
  if (!F) return;
  const box = $('layer').querySelector<HTMLElement>('.foes');
  if (!box) return;
  box.dataset.n = String(alive(F).length || 1);
  for (const e of F.foes) {
    const el = foeEl(e.uid);
    if (!el) continue;
    el.classList.toggle('gone', e.dead && !el.classList.contains('dying'));
    const sh = shielded(F, e);
    el.classList.toggle('shielded', sh);
    el.classList.toggle(
      'targeted',
      !e.dead && G.sel === e.uid && menuKind() === 'weapons'
    );
    el.classList.toggle('sel', !e.dead && G.sel === e.uid);
    const k = intentOf(e);
    const it = el.querySelector('.intent') as HTMLElement;
    it.className = `intent i-${k}${AREA.has(e.intent.k) && !e.stun ? ' area' : ''}`;
    it.innerHTML = `${icon16(k)}<span>${esc(intentLabel(e))}</span>`;
    it.setAttribute(
      'aria-label',
      G.c.intentAria(intentLabel(e), intentHelp(e))
    );
    (el.querySelector('.fname') as HTMLElement).textContent = foeName(e);
    (el.querySelector('.hb i') as HTMLElement).style.width =
      `${(e.pv / e.max) * 100}%`;
    (el.querySelector('.pvn') as HTMLElement).textContent = `${e.pv}/${e.max}`;
    (el.querySelector('.toks') as HTMLElement).innerHTML = e.sheets
      .map(() => '<span></span>')
      .join('');
    const shield = el.querySelector('.shield') as HTMLElement;
    shield.hidden = !sh;
    shield.textContent = G.c.types.mask.name;
    el.setAttribute(
      'aria-label',
      `${foeName(e)}, ${G.c.status.hpAria(e.pv, e.max)}, ${e.sheets.length}`
    );
  }
  const field = G.root.getElementById('field');
  if (field) {
    field.hidden = !F.fog;
    field.textContent = G.c.status.fog(F.fog);
  }
  $('scene').classList.toggle('fogged', F.fog > 0);
}
function renderActors(): void {
  const r = G.run;
  if (!r) return;
  const c = G.c.chips;
  const h: string[] = [];
  const g: string[] = [];
  if (r.st.guard) h.push(c.guard);
  if (r.st.tache) h.push(c.tache(r.st.tache));
  if (r.st.rature) h.push(c.rature);
  if (r.strike) h.push(c.hint(r.strike));
  if (r.tampon) h.push(c.tampon);
  if (r.echo) g.push(c.echo);
  if (r.st.gag) g.push(c.gag(r.st.gag));
  const sh = G.root.getElementById('sts-hero');
  const sg = G.root.getElementById('sts-glose');
  if (sh)
    sh.innerHTML = h.map((x) => `<span class="chip">${esc(x)}</span>`).join('');
  if (sg)
    sg.innerHTML = g.map((x) => `<span class="chip">${esc(x)}</span>`).join('');
}
export function refresh(): void {
  updateFoes();
  renderStatus();
  renderActors();
}

/* ---------- effects: short, never blocking for long, instant under reduced motion ---------- */
function anim(el: Element | null, cls: string, ms: number): Promise<void> {
  if (!el) return wait(0);
  el.classList.remove(cls);
  void (el as HTMLElement).offsetWidth;
  el.classList.add(cls);
  return wait(ms).then(() => el.classList.remove(cls));
}
function centerIn(el: Element) {
  const sc = $('scene').getBoundingClientRect();
  const r = el.getBoundingClientRect();
  return {
    x: r.left - sc.left + r.width / 2,
    y: r.top - sc.top + r.height / 2,
    w: r.width,
    h: r.height,
  };
}
function pop(text: string, el: Element | null, cls = ''): void {
  if (!el) return;
  const c = centerIn(el);
  const d = document.createElement('span');
  d.className = `pop ${cls}`;
  d.textContent = text;
  d.style.left = `${c.x}px`;
  d.style.top = `${Math.max(4, c.y - c.h / 2)}px`;
  $('fx').appendChild(d);
  setTimeout(() => d.remove(), 1050);
}
const gloseEl = () => $('layer').querySelector('.actor.glose');
const heroEl = () => $('layer').querySelector('.actor.hero');
const QUILL =
  '<svg viewBox="0 0 24 24"><path d="M2 22L14 10C18 4 22 2 22 2S20 8 14 12L4 22Z" fill="var(--paper)" stroke="var(--line)" stroke-width="1.5"/></svg>';
const STAMP =
  '<svg viewBox="0 0 24 24"><rect x="3" y="15" width="18" height="6" fill="var(--s-stamp)" stroke="var(--line)" stroke-width="1.5"/><rect x="9" y="4" width="6" height="11" fill="var(--s-wood)" stroke="var(--line)" stroke-width="1.5"/></svg>';

/** Each weapon has its own gesture: a quill for the Duel, a thread for the Trident, a stamp for the Exam. */
async function heroAttack(
  w: WeaponKey,
  target: HTMLElement | null
): Promise<void> {
  const h = heroEl();
  const t = target?.querySelector('.art');
  if (!h || !t || reduced()) return;
  void anim(h, 'lunge', 380);
  const a = centerIn(h);
  const b = centerIn(t);
  if (w === 'duel') {
    const q = document.createElement('div');
    q.className = 'proj';
    q.innerHTML = QUILL;
    q.style.left = `${a.x - 17}px`;
    q.style.top = `${a.y - 30}px`;
    $('fx').appendChild(q);
    void q.offsetWidth;
    q.classList.add('fly');
    q.style.transform = `translate(${b.x - a.x}px, ${b.y - a.y + 30}px) rotate(40deg)`;
    await wait(360);
    q.remove();
  } else if (w === 'trident') {
    const sc = $('scene').getBoundingClientRect();
    $('fx').insertAdjacentHTML(
      'beforeend',
      `<svg class="thread" viewBox="0 0 ${sc.width} ${sc.height}">${[-14, 0, 14].map((o) => `<path d="M${a.x} ${a.y - 20}Q${(a.x + b.x) / 2} ${Math.min(a.y, b.y) - 60 + o} ${b.x + o} ${b.y}"/>`).join('')}</svg>`
    );
    await wait(380);
    $('fx').querySelector('.thread')?.remove();
  } else {
    const s = document.createElement('div');
    s.className = 'stampfx';
    s.innerHTML = STAMP;
    s.style.left = `${b.x - 28}px`;
    s.style.top = `${b.y - b.h / 2 - 20}px`;
    $('fx').appendChild(s);
    await wait(320);
    setTimeout(() => s.remove(), 250);
  }
}
async function bead(fromEl: Element | null, xp: number): Promise<void> {
  const g = gloseEl();
  if (!fromEl || !g) return;
  pop(`+${xp} XP`, fromEl, 'good');
  if (reduced()) return;
  const a = centerIn(fromEl);
  const b = centerIn(g);
  const d = document.createElement('span');
  d.className = 'bead';
  d.style.left = `${a.x - 9}px`;
  d.style.top = `${a.y - 9}px`;
  $('fx').appendChild(d);
  void d.offsetWidth;
  d.style.transform = `translate(${b.x - a.x}px, ${b.y - a.y + b.h * 0.2}px) scale(.6)`;
  await wait(560);
  d.remove();
}
/** An area move is drawn across the whole party, so it reads as hitting both heroes. */
async function areaWave(fromEl: Element | null): Promise<void> {
  const party = $('layer').querySelector('.party');
  if (!party) return;
  const p = centerIn(party);
  const f = fromEl ? centerIn(fromEl) : { x: p.x + 200, y: p.y };
  const w = document.createElement('div');
  w.className = 'wavefx';
  w.style.left = `${Math.min(p.x, f.x) - 40}px`;
  w.style.width = `${Math.abs(f.x - p.x) + 120}px`;
  w.style.top = `${p.y - p.h / 2}px`;
  w.style.height = `${p.h}px`;
  $('fx').appendChild(w);
  const zone = document.createElement('div');
  zone.className = 'zonefx';
  zone.style.left = `${p.x - p.w / 2 - 16}px`;
  zone.style.top = `${p.y - p.h / 2 - 12}px`;
  zone.style.width = `${p.w + 32}px`;
  zone.style.height = `${p.h + 24}px`;
  $('fx').appendChild(zone);
  await wait(420);
  setTimeout(() => {
    w.remove();
    zone.remove();
  }, 400);
}
async function fx(ev: Fx): Promise<void> {
  const F = G.F;
  const el = 'uid' in ev ? foeEl(ev.uid) : null;
  const art = el?.querySelector('.art') ?? null;
  switch (ev.fx) {
    case 'strike': {
      if (ev.kind === 'crit' && art) {
        blip('crit');
        const c = centerIn(art);
        const s = document.createElement('div');
        s.className = 'critstamp';
        s.textContent = G.c.lines.crit;
        s.style.left = `${c.x}px`;
        s.style.top = `${c.y}px`;
        $('fx').appendChild(s);
        setTimeout(() => s.remove(), 900);
        void anim(gloseEl(), 'cheer', 500);
        await wait(220);
      } else blip(ev.kind === 'resist' ? 'clank' : 'free');
      pop(
        `-${ev.d}`,
        art,
        ev.kind === 'crit' ? 'big' : ev.kind === 'resist' ? 'gray' : ''
      );
      await Promise.all([
        anim(
          art,
          ev.kind === 'crit' ? 'crit' : ev.kind === 'resist' ? 'clank' : 'hit',
          420
        ),
        ev.sheet ? bead(art, ev.xp) : wait(0),
      ]);
      break;
    }
    case 'echo': {
      blip('crit');
      const from = art ? centerIn(art) : null;
      for (const h of ev.hits) {
        const t = foeEl(h.uid)?.querySelector('.art');
        if (!t) continue;
        const to = centerIn(t);
        if (from && !reduced()) {
          const ring = document.createElement('span');
          ring.className = 'ripple';
          ring.style.left = `${from.x}px`;
          ring.style.top = `${from.y}px`;
          ring.style.setProperty('--dx', `${to.x - from.x}px`);
          ring.style.setProperty('--dy', `${to.y - from.y}px`);
          $('fx').appendChild(ring);
          setTimeout(() => ring.remove(), 600);
        }
        pop(`-${h.d}`, t);
        void anim(t, 'hit', 420);
      }
      await wait(480);
      break;
    }
    case 'counter':
    case 'enemyHit': {
      if (ev.fx === 'enemyHit') setTurn('foe');
      await anim(
        art,
        ev.fx === 'enemyHit' && ev.big ? 'lunge-big' : 'attack',
        450
      );
      if (ev.d === 0) {
        pop('0', heroEl(), 'gray');
        break;
      }
      blip('hit');
      void anim($('scene'), 'hurt', 450);
      void anim(heroEl(), 'recoil', 420);
      pop(`-${ev.d}`, heroEl(), ev.fx === 'enemyHit' && ev.big ? 'big' : '');
      if (ev.fx === 'counter') {
        const g = gloseEl();
        g?.classList.add('hide');
        setTimeout(() => g?.classList.remove('hide'), 900);
      }
      break;
    }
    case 'wave': {
      setTurn('foe');
      blip('boom');
      await anim(art, 'attack', 300);
      void anim($('scene'), 'quake', 500);
      await areaWave(art);
      void anim(heroEl(), 'recoil', 420);
      void anim(gloseEl(), 'recoil', 420);
      pop(`-${ev.d}`, heroEl(), 'big');
      if (ev.ink) pop(`-${G.c.inkCost(ev.ink)}`, gloseEl(), 'gray');
      break;
    }
    case 'fog':
      setTurn('foe');
      await anim(art, 'charge', 450);
      $('scene').classList.add('fogged');
      void anim($('scene'), 'fog-in', 700);
      await wait(400);
      break;
    case 'charge':
      await anim(art, 'charge', 550);
      break;
    case 'ink':
    case 'gag':
    case 'tache':
    case 'steal':
      await anim(art, 'attack', 450);
      void anim(
        ev.fx === 'tache' || ev.fx === 'steal' ? heroEl() : gloseEl(),
        'shake',
        400
      );
      break;
    case 'heal':
      await anim(art, 'retreat', 500);
      pop(`+${RULES.heal}`, art, 'good');
      break;
    case 'heroHeal':
      pop(`+${ev.n}`, heroEl(), 'good');
      void anim(heroEl(), 'cheer', 400);
      break;
    case 'skip':
      await anim(art, 'dizzy', 550);
      break;
    case 'die': {
      if (!el || !art || !F) break;
      const e = foeBy(F, ev.uid);
      el.classList.add('dying');
      art.classList.add(
        e?.type === 'boss' || e?.type === 'grib'
          ? 'die-melt'
          : e?.type === 'fau'
            ? 'die-run'
            : e?.type === 'cut'
              ? 'die-spin'
              : e?.type === 'mask'
                ? 'die-fade'
                : 'die-runl'
      );
      await wait(800);
      el.classList.remove('dying');
      break;
    }
    case 'summon': {
      if (!F) break;
      const e = foeBy(F, ev.uid);
      if (!e) break;
      $('layer')
        .querySelector('.foes')
        ?.insertAdjacentHTML('beforeend', foeCard(e));
      updateFoes();
      await anim(foeEl(ev.uid)?.querySelector('.art') ?? null, 'walk-in', 650);
      break;
    }
    case 'guard':
      void anim(heroEl(), 'cheer', 400);
      break;
  }
  refresh();
}
export async function play(events: Ev[]): Promise<void> {
  for (const ev of events) {
    if (isFx(ev)) await fx(ev);
    else
      await sayOne({
        who: ev.who === 'glose' ? 'glose' : (ev.who ?? null),
        text: sayText(ev),
      });
  }
  Zone.idle();
}

function bindStage(): void {
  const layer = $('layer');
  layer.onclick = (e) => {
    const F = G.F;
    const target = e.target as HTMLElement;
    const tag = target.closest<HTMLElement>('.intent');
    if (tag && F) {
      e.stopPropagation();
      const f = foeBy(F, Number(tag.closest<HTMLElement>('.foe')?.dataset.uid));
      if (f) bubbleAt(tag, intentHelp(f), 'tip');
      return;
    }
    const b = target.closest<HTMLElement>('.foe');
    if (!b || !F) return;
    const f = foeBy(F, Number(b.dataset.uid));
    if (!f || f.dead || menuKind() !== 'weapons') return;
    e.stopPropagation();
    if (shielded(F, f)) {
      bubbleAt(b.querySelector('.art'), G.c.lines.shieldSay);
      return;
    }
    pickMenu(`target:${f.uid}`);
  };
}

/* ---------- the fight loop ---------- */
export type Outcome = 'win' | 'lose' | 'flee';
let toldGuard = false;
let toldArea = false;

export async function battle(): Promise<Outcome> {
  const run = G.run;
  if (!run) return 'flee';
  const F = (G.F = makeFight(G.ctx, run));
  const cc = chapterCopy(G.c, run.ch);
  G.sel = targetable(F)
    .slice()
    .sort((a, b) => a.pv - b.pv)[0].uid;
  G.screen = 'battle';
  const stage = setForStep(run);
  setScene(stage.html, {
    boss: F.isBoss,
    cls: F.isBoss ? 'boss-fight' : '',
    time: stage.time,
  });
  $('layer').innerHTML =
    `<div class="foes" data-n="1">${F.foes.map(foeCard).join('')}</div>` +
    partyHtml();
  bindStage();
  chapterChrome();
  refresh();
  $('layer')
    .querySelectorAll('.foe .art')
    .forEach((a) => void anim(a, 'walk-in', 650));
  const first = F.foes[0];
  if (F.isBoss) {
    await playCine(`boss-${run.ch}`, { inline: true });
    await say({ who: first, text: cc.boss.taunt, wait: true });
  } else {
    const names = F.foes.map(foeName);
    await say(
      F.foes.length === 1
        ? G.c.lines.appearsOne(
            first.type === 'boss' ? cc.boss.a : G.c.types[first.type].a,
            F.elite
          )
        : G.c.lines.appearsMany(names),
      {
        who: first,
        text: first.type === 'boss' ? '' : G.c.types[first.type].taunt,
      }
    );
  }
  const save = G.host.save;
  if (!save.taught && run.ch === 0 && run.step === 0) {
    await say(
      { who: 'glose', text: G.c.lines.teachIntent, wait: true },
      { who: 'glose', text: G.c.lines.teachWeapons, wait: true }
    );
    save.taught = true;
    G.host.persist();
  }
  if (F.foes.some((e) => e.type === 'mask') && F.foes.length > 1)
    await say({ who: 'glose', text: G.c.lines.maskWarn });
  if (F.foes.some((e) => e.type === 'pil'))
    await say({ who: 'glose', text: G.c.lines.pilWarn });
  if (F.foes.some((e) => e.type === 'din'))
    await say({ who: 'glose', text: G.c.lines.dinWarn });

  while (alive(F).length && run.hp > 0) {
    F.turn++;
    let actions = 1;
    while (actions > 0 && alive(F).length && run.hp > 0) {
      const out = await playerAction(actions);
      if (out === 'flee') {
        setTurn(null);
        await say(G.c.lines.fled);
        return 'flee';
      }
      if (out === 'second') {
        actions++;
        continue;
      }
      actions--;
    }
    if (!alive(F).length || run.hp <= 0) break;
    setTurn('foe');
    const evs = enemyPhase(G.ctx, F, run);
    await play(evs);
    refresh();
    if (
      !toldArea &&
      evs.some((e) => isFx(e) && e.fx === 'wave') &&
      run.hp > 0
    ) {
      toldArea = true;
      await say({ who: 'glose', text: G.c.lines.teachArea });
    }
    if (
      !toldGuard &&
      alive(F).some((e) => e.intent.k === 'big') &&
      run.hp > 0
    ) {
      toldGuard = true;
      await say({ who: 'glose', text: G.c.lines.guardTip });
    }
  }
  setTurn(null);
  return run.hp <= 0 ? 'lose' : 'win';
}

function weaponItems(e: Foe) {
  const F = G.F;
  const kn = G.ctx.book.known(knowKey(e));
  return WEAPON_KEYS.map((w) => {
    const tag =
      kn[w] === 'crit'
        ? `<span class="tag weak">${esc(G.c.weak)}</span>`
        : kn[w] === 'resist'
          ? `<span class="tag res">${esc(G.c.resist)}</span>`
          : `<span class="tag">${esc(G.c.unknown)}</span>`;
    return {
      k: w,
      cls: 'weapon',
      dis: !!F && weaponBlocked(F, w),
      why: G.c.fogBlocked,
      html: `${esc(G.c.weapons[w].name)}<span class="c">${esc(G.c.dmg(WEAPONS[w].dmg))}</span><span class="d">${esc(G.c.weapons[w].options)}</span>${tag}`,
    };
  });
}

async function playerAction(
  actions: number
): Promise<'acted' | 'second' | 'flee'> {
  const F = G.F;
  const run = G.run;
  if (!F || !run) return 'flee';
  const c = G.c;
  for (;;) {
    setTurn('me');
    const ts = targetable(F);
    if (!ts.some((e) => e.uid === G.sel))
      G.sel = ts.slice().sort((a, b) => a.pv - b.pv)[0].uid;
    const target = foeBy(F, G.sel as number) as Foe;
    const full = run.verve >= RULES.verveMax;
    showLine(
      c.lines.aim(esc(foeName(target)), ts.length > 1, actions > 1),
      null
    );
    const pending = choose({
      kind: 'weapons',
      step: c.labels.pickWeapon,
      layout: 'c3',
      items: weaponItems(target),
      secondary: [
        {
          k: 'glose',
          html: `${icon24('glose')}${esc(c.actions.glose)}`,
          dis: run.st.gag > 0,
          why: c.lines.gagged(run.st.gag),
        },
        { k: 'guard', html: `${icon24('garde')}${esc(c.actions.guard)}` },
        {
          k: 'bag',
          html: `${icon24('sac')}${esc(c.actions.bag(run.items.length))}`,
          dis: !run.items.length,
          why: c.lines.bagEmpty,
        },
        {
          k: 'verve',
          cls: full ? 'ready' : '',
          html: `${icon24('verve')}${esc(c.actions.verve)}`,
          dis: !full,
          why: c.status.verveAria(run.verve, RULES.verveMax),
        },
        { k: 'flee', html: `${icon24('fuir')}${esc(c.actions.flee)}` },
      ],
      onKey: (e) => {
        if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return false;
        const list = targetable(F);
        if (list.length < 2) return false;
        const i = list.findIndex((x) => x.uid === G.sel);
        pickMenu(
          `target:${list[(i + (e.key === 'ArrowRight' ? 1 : list.length - 1)) % list.length].uid}`
        );
        return true;
      },
    });
    updateFoes();
    const k = await pending;
    updateFoes();
    if (k.startsWith('target:')) {
      G.sel = Number(k.slice(7));
      updateFoes();
      continue;
    }
    if ((WEAPON_KEYS as readonly string[]).includes(k)) {
      const w = k as WeaponKey;
      const res = await doQuestion(target, w);
      if (res === 'back') continue;
      setStep(null);
      await heroAttack(w, foeEl(target.uid));
      await play(attack(G.ctx, F, run, target.uid, w, res));
      G.host.refresh();
      return 'acted';
    }
    if (k === 'glose') {
      await gloseMenu();
      continue;
    }
    if (k === 'guard') {
      await play(guard(run));
      return 'acted';
    }
    if (k === 'bag') {
      await bagMenu();
      continue;
    }
    if (k === 'verve') {
      const v = await choose({
        kind: 'verve',
        label: c.labels.verveFull,
        back: true,
        layout: 'c2',
        items: [
          {
            k: 'plume',
            html: `${esc(c.verve.plume.name)}<span class="d">${esc(c.verve.plume.text(foeName(target)))}</span>`,
          },
          {
            k: 'second',
            html: `${esc(c.verve.second.name)}<span class="d">${esc(c.verve.second.text)}</span>`,
          },
        ],
      });
      if (v === 'back') continue;
      run.verve = 0;
      renderStatus();
      if (v === 'second') {
        await say(c.verve.secondSay);
        return 'second';
      }
      await heroAttack('exam', foeEl(target.uid));
      await play(
        attack(G.ctx, F, run, target.uid, 'exam', true, { plume: true })
      );
      return 'acted';
    }
    if (k === 'flee') {
      const r = await choose({
        kind: 'confirm',
        label: c.labels.fleeAsk,
        layout: 'c2',
        items: [
          { k: 'yes', label: c.labels.fleeYes },
          { k: 'no', label: c.labels.fleeNo, back: true },
        ],
      });
      if (r === 'yes') return 'flee';
    }
  }
}

/* ---------- the question ---------- */
interface Asked {
  q: Question;
  draw: Draw;
  /** Positions in the draw struck out by a hint or an eraser. */
  removed: Set<number>;
  /** A smudged word on one wrong option, while Tache lasts. */
  ink: { pos: number; html: string } | null;
}
function inkOption(a: Asked): Asked['ink'] {
  const wrong = a.draw.order
    .map((_, i) => i)
    .filter((i) => i !== a.draw.correct && !a.removed.has(i));
  if (!wrong.length) return null;
  const pos = wrong[Math.floor(G.rng() * wrong.length)];
  const t = a.q.options[a.draw.order[pos]];
  const words = [...t.matchAll(/[A-Za-zÀ-ÖØ-öø-ÿœŒ’'-]{5,}/g)];
  if (!words.length) return null;
  const m = words[Math.floor(G.rng() * words.length)];
  const at = m.index ?? 0;
  return {
    pos,
    html: `${esc(t.slice(0, at))}<span class="tache" role="img" aria-label="${esc(G.c.lines.inked)}">${esc(m[0])}</span>${esc(t.slice(at + m[0].length))}`,
  };
}
/** A hint keeps one wrong option standing, and spares the smudged one while a legible one remains. */
function strikeOne(a: Asked): boolean {
  const wrong = a.draw.order
    .map((_, i) => i)
    .filter((i) => i !== a.draw.correct && !a.removed.has(i));
  if (wrong.length < 2) return false;
  const legible = wrong.filter((i) => a.ink?.pos !== i);
  const pool = legible.length ? legible : wrong;
  a.removed.add(pool[Math.floor(G.rng() * pool.length)]);
  return true;
}
function scrollHint(): void {
  const z = $('zone');
  z.insertAdjacentHTML(
    'beforeend',
    `<div class="scroll-hint" aria-hidden="true"><span>${esc(G.c.scrollHint)} ↓</span></div>`
  );
  const h = z.querySelector('.scroll-hint') as HTMLElement;
  const upd = () => {
    h.hidden = z.scrollHeight - z.scrollTop - z.clientHeight < 8;
  };
  z.onscroll = upd;
  upd();
}

async function doQuestion(e: Foe, w: WeaponKey): Promise<boolean | 'back'> {
  const F = G.F;
  const run = G.run;
  if (!F || !run) return 'back';
  const q = G.qById.get(e.sheets[0]) as Question;
  const a: Asked = {
    q,
    draw: drawOptions(q, WEAPONS[w].options, G.rng),
    removed: new Set(),
    ink: null,
  };
  if (run.st.tache) a.ink = inkOption(a);
  while (run.strike > 0 && strikeOne(a)) run.strike--;
  renderActors();
  showLine(
    `<span class="lvl">${esc(G.c.weapons[w].name)}</span>${esc(q.stem)}`,
    e
  );
  const card = (pos: number) =>
    a.ink?.pos === pos ? a.ink.html : esc(q.options[a.draw.order[pos]]);
  const items = () =>
    a.draw.order.map((_, pos) => ({
      k: `o${pos}`,
      cls: `ans${a.removed.has(pos) ? ' gone' : ''}`,
      html: `<span class="t">${card(pos)}</span>`,
    }));
  const label = `${G.c.weapons[w].name} · ${foeName(e)}`;
  if (F.mixNext) {
    F.mixNext = false;
    void choose({
      kind: 'mixing',
      label: G.c.labels.mixing,
      grow: true,
      numbered: true,
      layout: 'answers',
      items: items().map((x) => ({ ...x, dis: true })),
    });
    await wait(1400);
    const order = shuffle(a.draw.order, G.rng);
    const remap = new Map(
      a.draw.order.map((idx, pos) => [pos, order.indexOf(idx)])
    );
    a.removed = new Set([...a.removed].map((p) => remap.get(p) as number));
    if (a.ink) a.ink = { ...a.ink, pos: remap.get(a.ink.pos) as number };
    a.draw = { order, correct: order.indexOf(q.answer) };
  }
  const pending = choose({
    kind: 'answers',
    step: G.c.labels.answer,
    label,
    back: true,
    grow: true,
    numbered: true,
    layout: 'answers',
    items: items(),
  });
  scrollHint();
  const pick = await pending;
  if (pick === 'back') {
    return 'back';
  }
  const right = pick === `o${a.draw.correct}`;
  $('zone')
    .querySelectorAll<HTMLElement>('.choice')
    .forEach((b) => {
      if (b.dataset.k === `o${a.draw.correct}`) b.classList.add('right');
      else if (b.dataset.k === pick) b.classList.add('wrong');
      b.setAttribute('aria-disabled', 'true');
    });
  blip(right ? 'ok' : 'clank');
  await wait(250);
  await explain(q, right);
  /* back in the fixed dialogue box, only the verdict stays: the explanation was read above */
  showLine(
    `<b class="verdict ${right ? 'ok' : 'ko'}">${esc(right ? G.c.lines.verdictRight : G.c.lines.verdictWrong)}</b>`,
    'glose'
  );
  Zone.go();
  Zone.idle();
  return right;
}

/** The lesson: the explanation takes the stem's place and waits for Continue, under the marked options. */
function explain(q: Question, right: boolean): Promise<void> {
  const dlg = $('dialog');
  dlg.style.height = `${dlg.offsetHeight}px`;
  const z = $('zone');
  z.querySelector('.scroll-hint')?.remove();
  z.dataset.mode = 'why';
  z.querySelectorAll('.go, .back-btn').forEach((old) => old.remove());
  z.insertAdjacentHTML('beforeend', goButton('sticky'));
  const done = holdLine(
    `<b class="verdict ${right ? 'ok' : 'ko'}">${esc(right ? G.c.lines.verdictRight : G.c.lines.verdictWrong)}</b> ${esc(q.why)}`,
    'glose'
  );
  const go = $('go');
  go.onclick = (ev) => {
    ev.stopPropagation();
    blip('move');
    advance(true);
  };
  if (gameHasFocus()) go.focus({ preventScroll: true });
  z.querySelector('.choice.right')?.scrollIntoView({ block: 'nearest' });
  return done;
}

async function gloseMenu(): Promise<void> {
  const F = G.F;
  const run = G.run;
  if (!F || !run) return;
  const c = G.c;
  const why = (k: (typeof POWER_KEYS)[number]) => {
    const b = powerBlock(F, run, k);
    return b === 'ink'
      ? c.powerBlocked.ink(POWER_COST[k])
      : b
        ? c.powerBlocked[b]
        : '';
  };
  const k = await choose({
    kind: 'glose',
    label: c.labels.powers,
    back: true,
    layout: 'c2',
    items: POWER_KEYS.map((p) => ({
      k: p,
      html: `${esc(c.powers[p].name)} <span class="c">${esc(c.inkCost(POWER_COST[p]))}</span><span class="d">${esc(c.powers[p].text)}</span>`,
      dis: !!powerBlock(F, run, p),
      why: why(p),
      cls: p === 'echo' ? 'area' : '',
    })),
  });
  if (k === 'back') return;
  const evs = usePower(F, run, k as (typeof POWER_KEYS)[number]);
  refresh();
  await play(evs);
  refresh();
}
async function bagMenu(): Promise<void> {
  const run = G.run;
  if (!run) return;
  const c = G.c;
  const kinds = ITEM_KEYS.filter((k) => run.items.includes(k));
  const k = await choose({
    kind: 'bag',
    label: c.labels.bag,
    back: true,
    layout: kinds.length > 2 ? 'c3' : kinds.length > 1 ? 'c2' : 'list',
    items: kinds.map((key) => {
      const b = itemBlock(run, key);
      return {
        k: key,
        html: `${esc(c.items[key].name)} <span class="c">x${run.items.filter((x) => x === key).length}</span><span class="d">${esc(c.items[key].text)}</span>`,
        dis: !!b,
        why: b ? c.itemBlocked[b] : '',
      };
    }),
  });
  if (k === 'back') return;
  await play(useItem(run, k as (typeof ITEM_KEYS)[number]));
  refresh();
}
