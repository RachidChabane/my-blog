/**
 * Combat engine: rules only, no DOM, no wording. It mutates the run and the fight and
 * returns events; the presenter animates and narrates them in the player's language.
 * Progress goes through the Book port, so tests run the same rules in memory.
 */
import type { Rng } from './random';
import { pickOne, shuffle } from './random';
import type { DamageKind } from './rules';
import type {
  BoonKey,
  ChapterRules,
  IntentKey,
  ItemKey,
  Perks,
  PowerKey,
  Traits,
  TypeKey,
  WeaponKey,
} from './rules';
import {
  BOON_KEYS,
  BOON_PV,
  CHAPTERS,
  FIGHTS_PER_CHAPTER,
  ITEM_KEYS,
  NO_PERKS,
  POWER_COST,
  RULES,
  TYPES,
  WEAPONS,
  damageFor,
  maxHpOf,
  maxInkOf,
} from './rules';

export interface Book {
  freed(): ReadonlySet<string>;
  /** Called only for a sheet the player answered right. */
  free(id: string): void;
  known(kind: string): Partial<Record<WeaponKey, DamageKind>>;
  /** Records a discovered weakness or resistance; true the first time. */
  know(kind: string, w: WeaponKey, d: DamageKind): boolean;
  reviewSet(): Readonly<Record<string, number>>;
  review(id: string, right: boolean): void;
}

export interface Ctx {
  readonly rng: Rng;
  readonly book: Book;
  /** Question ids of each domain. */
  readonly bank: Readonly<Record<string, readonly string[]>>;
}

export interface Status {
  tache: number;
  gag: number;
  rature: number;
  guard: boolean;
}

export interface Plan {
  readonly steps: readonly (readonly TypeKey[])[];
}

export interface Run {
  ch: number;
  step: number;
  plan: Plan;
  hp: number;
  maxHp: number;
  ink: number;
  maxInk: number;
  boons: Partial<Record<BoonKey, true>>;
  elite: boolean;
  verve: number;
  st: Status;
  items: ItemKey[];
  /** Sheets already put in play in this run, drawn last. */
  used: Set<string>;
  /** Wrong options to strike at the next question. */
  strike: number;
  tampon: boolean;
  echo: boolean;
  first: boolean;
}

export interface Intent {
  k: IntentKey;
  n: number;
}

export interface Foe {
  uid: number;
  type: TypeKey | 'boss';
  ch: number;
  boss: boolean;
  pack: boolean;
  elite: boolean;
  pv: number;
  max: number;
  sheets: string[];
  pi: number;
  intent: Intent;
  stun: number;
  immune: boolean;
  turns: number;
  dead: boolean;
}

export interface Fight {
  asked: Set<string>;
  ch: number;
  step: number;
  isBoss: boolean;
  elite: boolean;
  foes: Foe[];
  turn: number;
  freedHere: string[];
  xp: number;
  combo: number;
  summoned: boolean;
  mixNext: boolean;
  firstDone: boolean;
  /** Turns of fog left on the field: no Duel while it lasts. */
  fog: number;
}

export type Speaker = Foe | 'glose';

export type MsgKey =
  | 'hit'
  | 'hitCrit'
  | 'hitResist'
  | 'plume'
  | 'stun'
  | 'stunResisted'
  | 'knowWeak'
  | 'knowResist'
  | 'combo'
  | 'ratureHalves'
  | 'echo'
  | 'fall'
  | 'fled'
  | 'miss'
  | 'missBuffered'
  | 'ratureCut'
  | 'guard'
  | 'skip'
  | 'enemyHit'
  | 'charge'
  | 'inkDrain'
  | 'inkEmpty'
  | 'gag'
  | 'tache'
  | 'heal'
  | 'backIdle'
  | 'wave'
  | 'fog'
  | 'specialName'
  | 'specialAnnounce'
  | 'theftItem'
  | 'theftVerve'
  | 'summonCry'
  | 'summonArrive'
  | 'powerHint'
  | 'powerEcho'
  | 'powerBalm'
  | 'powerBlot'
  | 'itemCafe'
  | 'itemGomme'
  | 'itemTampon';

export interface Say {
  say: MsgKey;
  who?: Speaker;
  foe?: Foe;
  n?: number;
  m?: number;
  w?: WeaponKey;
  item?: ItemKey;
  big?: boolean;
  guarded?: boolean;
}

export type Fx =
  | {
      fx: 'strike';
      uid: number;
      d: number;
      kind: DamageKind;
      xp: number;
      sheet: string | null;
    }
  | { fx: 'echo'; uid: number; hits: { uid: number; d: number }[] }
  | { fx: 'counter'; uid: number; d: number }
  | { fx: 'enemyHit'; uid: number; d: number; big: boolean }
  | { fx: 'wave'; uid: number; d: number; ink: number }
  | {
      fx:
        | 'fog'
        | 'charge'
        | 'ink'
        | 'gag'
        | 'tache'
        | 'heal'
        | 'steal'
        | 'skip'
        | 'die'
        | 'summon';
      uid: number;
    }
  | { fx: 'guard' }
  | { fx: 'heroHeal'; n: number };

export type Ev = Fx | Say;
export const isFx = (e: Ev): e is Fx => 'fx' in e;

/* ---------- reading the state ---------- */
export const alive = (F: Fight): Foe[] => F.foes.filter((e) => !e.dead);
export const foeBy = (F: Fight, uid: number): Foe | undefined =>
  F.foes.find((e) => e.uid === uid);
/** While a Mask stands next to others, only Masks can be targeted. */
export function targetable(F: Fight): Foe[] {
  const a = alive(F);
  const masks = a.filter((e) => e.type === 'mask');
  return masks.length && a.length > masks.length ? masks : a;
}
export const shielded = (F: Fight, e: Foe): boolean =>
  !e.dead && !targetable(F).includes(e);
export const chapterOf = (e: Foe): ChapterRules => CHAPTERS[e.ch];
export const traitsOf = (e: Foe): Traits =>
  e.type === 'boss' ? chapterOf(e).boss : TYPES[e.type];
/** Key under which discovered weaknesses are kept: per enemy type, per boss. */
export const knowKey = (e: Foe): string =>
  e.type === 'boss' ? `boss:${chapterOf(e).domain}` : e.type;
/** The Duel needs a clear field. */
export const weaponBlocked = (F: Fight, w: WeaponKey): boolean =>
  F.fog > 0 && w === 'duel';

const tier = (e: Foe) => chapterOf(e).tier + (e.elite ? 1 : 0);
export const hitDmg = (e: Foe): number =>
  (e.boss ? RULES.bossHit : e.pack ? RULES.packHit : RULES.hit) + tier(e);
export const bigDmg = (e: Foe): number =>
  (e.boss ? RULES.bossBig : e.pack ? RULES.packBig : RULES.big) + tier(e);
export const waveDmg = (e: Foe): number => Math.max(1, hitDmg(e) - 1);
const counterDmg = (e: Foe) => RULES.counter + Math.floor(e.ch / 2);
const guardCut = (run: Run, d: number) => (run.st.guard ? Math.ceil(d / 2) : d);

/* ---------- runs, chapters, fights ---------- */
function distinct(
  pool: readonly TypeKey[],
  n: number,
  rng: Rng,
  avoid: readonly TypeKey[] = []
): TypeKey[] {
  const left = pool.filter((t) => !avoid.includes(t));
  return shuffle(left.length >= n ? left : pool, rng).slice(0, n);
}

export function planChapter(ch: number, rng: Rng): Plan {
  const { first, mix } = CHAPTERS[ch];
  const duo = distinct(mix, 2, rng, [first]);
  const pair = distinct(mix, 2, rng, ['mask', 'pil']);
  const trio: TypeKey[] = mix.includes('mask')
    ? ['mask', ...distinct(mix, 2, rng, ['mask'])]
    : distinct(mix, 3, rng);
  return { steps: [[first], duo, pair, trio] };
}

export function newRun(ch: number, rng: Rng, perks: Perks = NO_PERKS): Run {
  const hp = maxHpOf(perks);
  const ink = maxInkOf(perks);
  return {
    ch,
    step: 0,
    plan: planChapter(ch, rng),
    hp,
    maxHp: hp,
    ink,
    maxInk: ink,
    boons: {},
    elite: false,
    verve: 0,
    st: { tache: 0, gag: 0, rature: 0, guard: false },
    items: ['cafe'],
    used: new Set(),
    strike: 0,
    tampon: false,
    echo: false,
    first: true,
  };
}

/** Sheets to review come first, then the ones never freed, then the rest; fresh ones before reused ones. */
export function pickSheets(
  ctx: Ctx,
  domain: string,
  n: number,
  used: Set<string>,
  busy: ReadonlySet<string> = new Set()
): string[] {
  const freed = ctx.book.freed();
  const rev = ctx.book.reviewSet();
  const rank = (id: string) =>
    (rev[id] ? 0 : freed.has(id) ? 2 : 1) + (used.has(id) ? 3 : 0);
  const pool = shuffle(
    (ctx.bank[domain] ?? []).filter((id) => !busy.has(id)),
    ctx.rng
  ).sort((a, b) => rank(a) - rank(b));
  return pool.slice(0, n).map((id) => {
    used.add(id);
    return id;
  });
}

let uidCounter = 0;
function makeFoe(
  type: TypeKey | 'boss',
  ch: number,
  o: { boss?: boolean; pack?: boolean; elite?: boolean; sheets: string[] }
): Foe {
  const pv =
    (o.boss ? CHAPTERS[ch].boss.pv : o.pack ? RULES.packPv : RULES.soloPv) +
    (o.elite ? RULES.elitePv : 0);
  return {
    uid: ++uidCounter,
    type,
    ch,
    boss: !!o.boss,
    pack: !!o.pack,
    elite: !!o.elite,
    pv,
    max: pv,
    sheets: o.sheets,
    pi: 0,
    intent: { k: 'hit', n: 0 },
    stun: 0,
    immune: false,
    turns: 0,
    dead: false,
  };
}

export function makeFight(ctx: Ctx, run: Run): Fight {
  const isBoss = run.step === FIGHTS_PER_CHAPTER;
  const domain = CHAPTERS[run.ch].domain;
  const comp: readonly (TypeKey | 'boss')[] = isBoss
    ? ['boss']
    : run.plan.steps[run.step];
  const n = isBoss
    ? RULES.bossSheets
    : comp.length > 1
      ? RULES.packSheets
      : RULES.soloSheets;
  const elite = !isBoss && run.elite;
  const foes = comp.map((t) =>
    makeFoe(t, run.ch, {
      boss: isBoss,
      pack: comp.length > 1,
      elite,
      sheets: pickSheets(ctx, domain, n, run.used),
    })
  );
  const F: Fight = {
    asked: new Set(),
    ch: run.ch,
    step: run.step,
    isBoss,
    elite,
    foes,
    turn: 0,
    freedHere: [],
    xp: 0,
    combo: 0,
    summoned: false,
    mixNext: false,
    firstDone: false,
    fog: 0,
  };
  foes.forEach((e) => planIntent(F, e));
  return F;
}

function patternOf(F: Fight, e: Foe): readonly IntentKey[] {
  if (e.type === 'boss') return ['hit', 'special', 'charge', 'big'];
  const T = TYPES[e.type];
  return T.packPattern && alive(F).length > 1 ? T.packPattern : T.pattern;
}
function planIntent(F: Fight, e: Foe): void {
  const p = patternOf(F, e);
  const k = p[e.pi % p.length];
  e.pi++;
  e.intent = {
    k,
    n:
      k === 'hit'
        ? hitDmg(e)
        : k === 'big'
          ? bigDmg(e)
          : k === 'wave'
            ? waveDmg(e)
            : 0,
  };
}

/* ---------- the player's side ---------- */
function kill(e: Foe): Ev[] {
  e.dead = true;
  const left = e.sheets.splice(0);
  const ev: Ev[] = [
    { fx: 'die', uid: e.uid },
    { say: 'fall', who: e, foe: e },
  ];
  if (left.length) ev.push({ say: 'fled', foe: e, n: left.length });
  return ev;
}

/** A missed sheet leaves the fight: the enemy draws a fresh one from the same domain. */
function swapSheet(ctx: Ctx, F: Fight, run: Run, e: Foe): void {
  const missed = e.sheets.shift();
  if (missed === undefined) return;
  const busy = new Set([...F.foes.flatMap((x) => x.sheets), ...F.asked]);
  const [fresh] = pickSheets(ctx, CHAPTERS[F.ch].domain, 1, run.used, busy);
  if (fresh) e.sheets.unshift(fresh);
  else e.sheets.push(missed);
}

export function attack(
  ctx: Ctx,
  F: Fight,
  run: Run,
  uid: number,
  w: WeaponKey,
  right: boolean,
  { plume = false }: { plume?: boolean } = {}
): Ev[] {
  const ev: Ev[] = [];
  const e = foeBy(F, uid);
  if (!e || e.dead) return ev;
  const sheet = e.sheets[0];
  if (!right) {
    F.asked.add(sheet);
    F.combo = 0;
    ctx.book.review(sheet, false);
    swapSheet(ctx, F, run, e);
    if (run.tampon) {
      run.tampon = false;
      ev.push({ fx: 'counter', uid, d: 0 }, { say: 'missBuffered', foe: e });
      return ev;
    }
    run.verve = Math.max(0, run.verve - RULES.verveDrain);
    const d = guardCut(run, counterDmg(e));
    run.hp = Math.max(0, run.hp - d);
    ev.push({ fx: 'counter', uid, d }, { say: 'miss', foe: e, n: d });
    if (e.type === 'cut' && run.hp > 0) {
      run.st.rature = 1;
      ev.push({ say: 'ratureCut', foe: e });
    }
    return ev;
  }
  let { d, kind } = plume
    ? { d: RULES.plumeDmg, kind: 'crit' as DamageKind }
    : damageFor(traitsOf(e), w);
  const boonCrit =
    !plume && !!run.boons.crit && !F.firstDone && kind !== 'crit';
  if (boonCrit) {
    d = WEAPONS[w].dmg * 2;
    kind = 'crit';
  }
  F.firstDone = true;
  if (!plume && run.st.rature) {
    d = Math.max(1, Math.floor(d / 2));
    run.st.rature = 0;
    ev.push({ say: 'ratureHalves' });
  }
  const fresh =
    !plume && !boonCrit && kind ? ctx.book.know(knowKey(e), w, kind) : false;
  e.pv = Math.max(0, e.pv - d);
  if (!plume) {
    F.asked.add(sheet);
    e.sheets.shift();
    ctx.book.free(sheet);
    ctx.book.review(sheet, true);
    if (!F.freedHere.includes(sheet)) F.freedHere.push(sheet);
  }
  F.combo++;
  const xp = Math.round(
    WEAPONS[plume ? 'exam' : w].xp * (1 + 0.25 * (F.combo - 1))
  );
  F.xp += xp;
  run.verve = Math.min(
    RULES.verveMax,
    run.verve +
      (plume ? 0 : WEAPONS[w].verve) +
      (F.combo >= 2 ? RULES.verveStreak : 0)
  );
  const stuns = kind === 'crit' && !e.immune;
  if (stuns) e.stun = 1;
  ev.push({ fx: 'strike', uid, d, kind, xp, sheet: plume ? null : sheet });
  ev.push({
    say: plume
      ? 'plume'
      : kind === 'crit'
        ? 'hitCrit'
        : kind === 'resist'
          ? 'hitResist'
          : 'hit',
    foe: e,
    n: d,
  });
  if (stuns) ev.push({ say: 'stun', foe: e });
  else if (kind === 'crit') ev.push({ say: 'stunResisted', foe: e });
  if (fresh)
    ev.push({
      say: kind === 'crit' ? 'knowWeak' : 'knowResist',
      who: 'glose',
      foe: e,
      w,
    });
  if (F.combo >= 2) ev.push({ say: 'combo', n: F.combo, m: xp });
  const fallen: Foe[] = [];
  if (!plume && run.echo) {
    run.echo = false;
    const others = alive(F).filter((x) => x !== e);
    const hits = others.map((x) => {
      x.pv = Math.max(0, x.pv - RULES.echoDmg);
      return { uid: x.uid, d: RULES.echoDmg };
    });
    if (hits.length) {
      ev.push({ fx: 'echo', uid, hits }, { say: 'echo', n: hits.length });
      fallen.push(...others.filter((x) => x.pv <= 0));
    }
  }
  if (e.pv <= 0 || !e.sheets.length) ev.push(...kill(e));
  fallen.forEach((x) => ev.push(...kill(x)));
  return ev;
}

export function guard(run: Run): Ev[] {
  run.st.guard = true;
  const gain = run.ink < run.maxInk ? 1 : 0;
  run.ink += gain;
  return [{ fx: 'guard' }, { say: 'guard', n: gain }];
}

/** Why a Glose power cannot be used right now, or null when it can. */
export function powerBlock(
  F: Fight,
  run: Run,
  k: PowerKey
): 'ink' | 'full' | 'clean' | 'echo' | null {
  if (k === 'balm' && run.hp >= run.maxHp) return 'full';
  if (k === 'blot' && !run.st.tache && !run.st.rature && !F.fog) return 'clean';
  if (k === 'echo' && run.echo) return 'echo';
  return run.ink < POWER_COST[k] ? 'ink' : null;
}

export function usePower(F: Fight, run: Run, k: PowerKey): Ev[] {
  if (powerBlock(F, run, k)) return [];
  run.ink -= POWER_COST[k];
  if (k === 'hint') {
    run.strike++;
    return [{ say: 'powerHint', who: 'glose' }];
  }
  if (k === 'echo') {
    run.echo = true;
    return [{ say: 'powerEcho', who: 'glose', n: RULES.echoDmg }];
  }
  if (k === 'balm') {
    const before = run.hp;
    run.hp = Math.min(run.maxHp, run.hp + RULES.balm);
    return [
      { fx: 'heroHeal', n: run.hp - before },
      { say: 'powerBalm', who: 'glose', n: run.hp - before },
    ];
  }
  run.st.tache = 0;
  run.st.rature = 0;
  F.fog = 0;
  return [{ say: 'powerBlot', who: 'glose' }];
}

export function itemBlock(run: Run, k: ItemKey): 'full' | 'waiting' | null {
  if (k === 'cafe' && run.hp >= run.maxHp) return 'full';
  if (k === 'tampon' && run.tampon) return 'waiting';
  return null;
}

export function useItem(run: Run, k: ItemKey): Ev[] {
  const at = run.items.indexOf(k);
  if (at < 0 || itemBlock(run, k)) return [];
  run.items.splice(at, 1);
  if (k === 'cafe') {
    const before = run.hp;
    run.hp = Math.min(run.maxHp, run.hp + RULES.cafe);
    return [
      { fx: 'heroHeal', n: run.hp - before },
      { say: 'itemCafe', n: run.hp - before },
    ];
  }
  if (k === 'gomme') {
    run.strike++;
    return [{ say: 'itemGomme' }];
  }
  run.tampon = true;
  return [{ say: 'itemTampon' }];
}

/* ---------- the enemies' side ---------- */
export function enemyPhase(ctx: Ctx, F: Fight, run: Run): Ev[] {
  const ev: Ev[] = [];
  if (run.st.tache) run.st.tache--;
  if (run.st.gag) run.st.gag--;
  if (F.fog) F.fog--;
  const strike = (e: Foe, n: number, big: boolean) => {
    const d = guardCut(run, n);
    run.hp = Math.max(0, run.hp - d);
    ev.push(
      { fx: 'enemyHit', uid: e.uid, d, big },
      { say: 'enemyHit', foe: e, n: d, big, guarded: run.st.guard }
    );
  };
  const wave = (e: Foe, n: number, ink: number) => {
    const d = guardCut(run, n);
    const lost = Math.min(run.ink, ink);
    run.hp = Math.max(0, run.hp - d);
    run.ink -= lost;
    ev.push(
      { fx: 'wave', uid: e.uid, d, ink: lost },
      { say: 'wave', foe: e, n: d, m: lost, guarded: run.st.guard }
    );
  };
  for (const e of alive(F)) {
    if (run.hp <= 0) break;
    e.turns++;
    if (e.stun) {
      e.stun = 0;
      e.immune = true;
      ev.push({ fx: 'skip', uid: e.uid }, { say: 'skip', foe: e });
      continue;
    }
    e.immune = false;
    const k = e.intent.k;
    if (k === 'hit' || k === 'big') strike(e, e.intent.n, k === 'big');
    else if (k === 'wave') wave(e, e.intent.n, 1);
    else if (k === 'fog') {
      F.fog = RULES.fogTurns;
      ev.push(
        { fx: 'fog', uid: e.uid },
        { say: 'fog', foe: e, n: RULES.fogTurns }
      );
    } else if (k === 'charge')
      ev.push({ fx: 'charge', uid: e.uid }, { say: 'charge', foe: e });
    else if (k === 'ink') {
      if (run.ink > 0) {
        run.ink--;
        ev.push({ fx: 'ink', uid: e.uid }, { say: 'inkDrain', foe: e });
      } else ev.push({ say: 'inkEmpty', foe: e });
    } else if (k === 'gag') {
      run.st.gag = RULES.statusTurns;
      ev.push(
        { fx: 'gag', uid: e.uid },
        { say: 'gag', foe: e, n: RULES.statusTurns }
      );
    } else if (k === 'tache') {
      run.st.tache = RULES.statusTurns;
      ev.push(
        { fx: 'tache', uid: e.uid },
        { say: 'tache', foe: e, n: RULES.statusTurns }
      );
    } else if (k === 'back') {
      const before = e.pv;
      e.pv = Math.min(e.max, e.pv + RULES.heal);
      if (e.pv > before)
        ev.push(
          { fx: 'heal', uid: e.uid },
          { say: 'heal', foe: e, n: e.pv - before }
        );
      else ev.push({ say: 'backIdle', foe: e });
    } else if (k === 'special') {
      const special = chapterOf(e).boss.special;
      ev.push(
        { fx: 'charge', uid: e.uid },
        { say: 'specialName', who: e, foe: e },
        { say: 'specialAnnounce', foe: e }
      );
      if (special === 'shuffle') F.mixNext = true;
      if (special === 'silence') run.st.gag = RULES.statusTurns;
      if (special === 'double') {
        strike(e, hitDmg(e), false);
        if (run.hp > 0) strike(e, hitDmg(e), false);
      }
      if (special === 'flood') wave(e, hitDmg(e), 2);
      if (special === 'steal') {
        if (run.ink > 0) run.ink--;
        run.st.tache = RULES.statusTurns;
      }
    }
    if (e.type === 'pil' && e.turns % RULES.theftEvery === 0 && run.hp > 0) {
      const item = run.items.pop();
      if (item) {
        ev.push(
          { fx: 'steal', uid: e.uid },
          { say: 'theftItem', foe: e, item }
        );
      } else if (run.verve > 0) {
        const n = Math.min(run.verve, RULES.theftVerve);
        run.verve -= n;
        ev.push({ fx: 'steal', uid: e.uid }, { say: 'theftVerve', foe: e, n });
      }
    }
  }
  const boss = alive(F).find((x) => x.boss);
  if (boss && !F.summoned && boss.pv <= boss.max / 2 && run.hp > 0) {
    F.summoned = true;
    const t = pickOne(CHAPTERS[F.ch].mix, ctx.rng);
    const busy = new Set([...F.foes.flatMap((x) => x.sheets), ...F.asked]);
    const add = makeFoe(t, F.ch, {
      pack: true,
      sheets: pickSheets(
        ctx,
        CHAPTERS[F.ch].domain,
        RULES.summonSheets,
        run.used,
        busy
      ),
    });
    if (add.sheets.length) {
      F.foes.push(add);
      ev.push(
        { fx: 'summon', uid: add.uid },
        { say: 'summonCry', who: boss, foe: boss },
        { say: 'summonArrive', foe: add }
      );
    }
  }
  run.st.guard = false;
  alive(F).forEach((e) => planIntent(F, e));
  return ev;
}

/* ---------- between fights ---------- */
export type DoorKey = 'combat' | 'elite' | 'cafe' | 'coffre' | 'boss';

/** One of the two doors always leads to a fight. */
export function genDoors(run: Run, rng: Rng): DoorKey[] {
  if (run.step === 0) return ['combat'];
  if (run.step === FIGHTS_PER_CHAPTER) return ['boss'];
  const fight: DoorKey = rng() < 0.5 ? 'combat' : 'elite';
  const other = shuffle(
    (['combat', 'elite', 'cafe', 'coffre'] as DoorKey[]).filter(
      (d) => d !== fight
    ),
    rng
  )[0];
  return shuffle([fight, other], rng);
}

export type Reward = `item:${ItemKey}` | `boon:${BoonKey}`;

export function genChest(run: Run, rich: boolean, rng: Rng): Reward[] {
  const pool: Reward[] = [
    ...ITEM_KEYS.map((k) => `item:${k}` as const),
    ...BOON_KEYS.filter((k) => !run.boons[k]).map((k) => `boon:${k}` as const),
  ];
  return shuffle(pool, rng).slice(0, rich ? 3 : 2);
}

export function applyReward(run: Run, r: Reward): void {
  const [kind, k] = r.split(':');
  if (kind === 'item') {
    if (run.items.length >= RULES.maxItems) run.items.shift();
    run.items.push(k as ItemKey);
    return;
  }
  const boon = k as BoonKey;
  run.boons[boon] = true;
  if (boon === 'ink') {
    run.maxInk++;
    run.ink++;
  }
  if (boon === 'pv') {
    run.maxHp = Math.min(RULES.hpCap, run.maxHp + BOON_PV);
    run.hp = Math.min(run.maxHp, run.hp + BOON_PV);
  }
}

export function restAtCafe(run: Run): { hp: number; ink: number } {
  const hp = run.hp;
  const ink = run.ink;
  run.hp = Math.min(run.maxHp, run.hp + RULES.cafeMoka);
  run.ink = Math.min(run.maxInk, run.ink + 1);
  return { hp: run.hp - hp, ink: run.ink - ink };
}

/** After each room: a little ink and health back, statuses cleared. */
export function afterStep(run: Run): { ink: number; hp: number } {
  const ink = run.ink;
  const hp = run.hp;
  run.ink = Math.min(run.maxInk, run.ink + RULES.inkRefill);
  run.hp = Math.min(run.maxHp, run.hp + RULES.restPv);
  run.st = { tache: 0, gag: 0, rature: 0, guard: false };
  return { ink: run.ink - ink, hp: run.hp - hp };
}

/** XP a fight is worth once it ends. */
export const fightXp = (F: Fight, won: boolean): number =>
  Math.round(F.xp * (F.elite ? RULES.eliteXp : 1)) +
  (won && F.isBoss ? RULES.xpBoss : 0);
