/**
 * A simulated player for the training game: it plays whole campaigns with the real rules
 * and a fixed share of the answers known, so the difficulty curve can be measured.
 */
import { bankOf } from '@/training/data/banks';
import { idsByDomain } from '@/training/domain/bank';
import type { Ctx, Fight, Foe, Member, Run } from '@/training/domain/engine';
import {
  able,
  act,
  alive,
  allyTarget,
  fightXp,
  foeTurn,
  isDark,
  isKnown,
  itemBlock,
  makeFight,
  memberDone,
  memberOf,
  memberTurn,
  nextSheet,
  openingReveals,
  outcome,
  powerBlock,
  preview,
  roundEnd,
  roundStart,
  setLevel,
  skillBlock,
  standing,
  targetable,
  tunedTo,
  useItem,
  usePower,
} from '@/training/domain/engine';
import { MOVES } from '@/training/domain/foes';
import type { Campaign } from '@/training/domain/campaign';
import { recruitAt } from '@/training/domain/campaign';
import {
  DEVELOPER_PROFESSIONAL,
  FOUNDATIONS,
  campaignOf,
} from '@/training/domain/campaigns';
import { affinity, weaknessOf } from '@/training/domain/elements';
import type { AllyKey, MemberKey, SkillKey } from '@/training/domain/party';
import { MEMBERS, SKILLS, lineupWith } from '@/training/domain/party';
import { seededRng } from '@/training/domain/random';
import type { FormatKey } from '@/training/domain/rules';
import { FIGHTS_PER_CHAPTER, FORMATS, levelOf } from '@/training/domain/rules';
import {
  afterStep,
  applyReward,
  delivery,
  genChest,
  genDoors,
  join,
  newRun,
  restAtCafe,
  setLineup,
} from '@/training/domain/run';
import type { Progress } from '@/training/domain/save';
import { bookFor, emptyProgress } from '@/training/domain/save';

/** A campaign's bank as question ids per domain. */
export const bankIdsOf = (camp: Campaign): Ctx['bank'] =>
  idsByDomain(
    bankOf(camp.key).map((q) => ({
      id: q.id,
      domain: q.domain,
      stem: '',
      why: '',
      options: q.options.en,
      answer: q.answer,
    }))
  );
/** The first campaign, and its bank. */
export const LIVE = campaignOf(FOUNDATIONS.key);
export const LIVE_BANK = bankIdsOf(LIVE);
/** The second campaign, eight chapters long, and its bank. */
export const DEV_PRO = campaignOf(DEVELOPER_PROFESSIONAL.key);
export const DEV_PRO_BANK = bankIdsOf(DEV_PRO);

export function ctxFor(
  seed = 1,
  save: Progress = emptyProgress(),
  bank: Ctx['bank'] = LIVE_BANK
) {
  const ctx: Ctx = {
    rng: seededRng(seed),
    book: bookFor(save, () => {}),
    bank,
  };
  return { save, ctx };
}

/** Chance of a right answer with `n` options shown, for a player who knows a share `k`. */
export const rightRate = (k: number, n: number) => k + (1 - k) / n;

export interface FightLog {
  ch: number;
  step: number;
  won: boolean;
  questions: number;
  right: number;
  /** Lowest share of the party's total health seen during the fight. */
  low: number;
  rounds: number;
}

const ratio = (F: Fight, run: Run) => {
  const ms = F.order.map((k) => memberOf(run, k));
  return ms.reduce((s, m) => s + m.hp, 0) / ms.reduce((s, m) => s + m.max, 0);
};

/**
 * The format a player of skill `k` picks: the one with the best expected damage, safer
 * when hurt. It reads the boss mechanics the way the screen shows them: an enemy out of
 * sight calls for every option shown, a fitted format is worth half, and a countdown
 * about to run out calls for a Duel.
 */
function formatFor(k: number, m: Member, F: Fight, e: Foe): FormatKey {
  const hurt = m.hp / m.max < 0.35;
  const options = (['duel', 'trident', 'exam'] as FormatKey[]).filter(
    (f) => !(F.fog > 0 && f === 'duel')
  );
  if (isDark(e) && options.includes('exam') && !hurt) return 'exam';
  if ((e.st.clock ?? 9) <= 2 && options.includes('duel')) return 'duel';
  const score = (f: FormatKey) => {
    const p = rightRate(k, FORMATS[f].options);
    const fit = tunedTo(e) === f ? 0.5 : 1;
    return p * FORMATS[f].power * fit - (1 - p) * (hurt ? 6 : 1.5);
  };
  return options.sort((a, b) => score(b) - score(a))[0];
}

function bestTarget(ctx: Ctx, F: Fight, m: Member): Foe {
  const ts = targetable(F);
  const val = (e: Foe) => {
    const known = isKnown(ctx, F, e);
    const aff = known ? affinity(m.el, e.el) : 'neutral';
    const mult = aff === 'weak' ? 2 : aff === 'resist' ? 0.5 : 1;
    return mult * 100 - e.hp;
  };
  return ts.sort((a, b) => val(b) - val(a))[0];
}

function threatened(F: Fight, k: MemberKey): boolean {
  return alive(F).some(
    (e) =>
      !isDark(e) &&
      e.intent &&
      (e.intent.move === 'big' || MOVES[e.intent.move].reach === 'all') &&
      (e.intent.targets.includes(k) || MOVES[e.intent.move].reach === 'all')
  );
}

/** One member's turn: heal and protect first, then the best attack it can afford. */
function turn(
  ctx: Ctx,
  F: Fight,
  run: Run,
  k: MemberKey,
  skill: number,
  log: FightLog
): void {
  const m = memberOf(run, k);
  const can = (s: SkillKey) =>
    MEMBERS[k].skills.includes(s) && !skillBlock(F, run, k, s);
  const low = allyTarget(F, run, 'hurt');
  const down = allyTarget(F, run, 'down');
  const support = (s: SkillKey) =>
    act(ctx, F, run, k, { kind: 'skill', skill: s, target: 0 });
  /* free actions first: Glose and the bag */
  if (down && !itemBlock(F, run, 'reboot') && run.items.includes('reboot'))
    useItem(F, run, 'reboot');
  if (
    low &&
    low.hp / low.max < 0.3 &&
    run.items.includes('cafe') &&
    !itemBlock(F, run, 'cafe')
  )
    useItem(F, run, 'cafe');
  if (ratio(F, run) < 0.45 && !powerBlock(F, run, 'balm'))
    usePower(F, run, 'balm');
  if (
    standing(F, run).some((x) => x.st.sleep || x.st.poison) &&
    run.tokens >= 4 &&
    !powerBlock(F, run, 'blot')
  )
    usePower(F, run, 'blot');
  if (down && can('rempotage')) return void support('rempotage');
  if (low && low.hp / low.max < 0.4 && can('espresso'))
    return void support('espresso');
  if (ratio(F, run) < 0.55 && can('tournee')) return void support('tournee');
  if (low && low.hp / low.max < 0.45 && can('visa'))
    return void support('visa');
  if (threatened(F, 'hero') && can('provoc')) return void support('provoc');
  if (m.hp / m.max < 0.3 && can('relecture')) return void support('relecture');
  if (standing(F, run).some((x) => x.st.sleep) && can('desherbage'))
    return void support('desherbage');
  if (F.round % 3 === 1 && can('bouture')) return void support('bouture');
  if (
    alive(F).some((e) => !F.revealed.has(e.uid) || isDark(e)) &&
    can('balayage')
  )
    return void support('balayage');
  if (threatened(F, k) && m.hp / m.max < 0.3) {
    act(ctx, F, run, k, { kind: 'guard' });
    return;
  }
  const e = bestTarget(ctx, F, m);
  const offensive = MEMBERS[k].skills.filter(
    (s) => SKILLS[s].format && can(s) && run.tokens >= SKILLS[s].cost + 1
  );
  let skillPick: SkillKey | undefined;
  for (const s of offensive) {
    if (s === 'decharge' && (e.boss || e.intent?.move === 'charge'))
      skillPick = s;
    if (
      s === 'brouillage' &&
      e.intent &&
      e.intent.move !== 'hit' &&
      e.intent.move !== 'big'
    )
      skillPick = s;
    if (s === 'courtcircuit' && alive(F).length >= 2) skillPick = s;
    if ((s === 'coulure' || s === 'ebouillanter') && e.hp > e.max * 0.6)
      skillPick = s;
    if (s === 'allerretour' && e.hp > e.max * 0.4) skillPick = s;
    if (s === 'refuse' && e.shield > 0) skillPick = s;
  }
  const format = skillPick
    ? (SKILLS[skillPick].format as FormatKey)
    : formatFor(skill, m, F, e);
  const n = FORMATS[format].options - F.strike;
  F.strike = 0;
  const right = ctx.rng() < rightRate(skill, Math.max(1, n));
  const sheet = nextSheet(ctx, F, run);
  log.questions++;
  if (right) log.right++;
  preview(ctx, F, run, k, { format, skill: skillPick }, e.uid);
  act(
    ctx,
    F,
    run,
    k,
    skillPick
      ? { kind: 'skill', skill: skillPick, target: e.uid }
      : { kind: 'attack', format, target: e.uid },
    { sheet, right }
  );
}

export function playFight(
  ctx: Ctx,
  run: Run,
  skill: number,
  maxRounds = 60
): { F: Fight; log: FightLog } {
  const F = makeFight(ctx, run);
  openingReveals(ctx, F);
  const log: FightLog = {
    ch: run.ch,
    step: run.step,
    won: false,
    questions: 0,
    right: 0,
    low: 1,
    rounds: 0,
  };
  while (!outcome(F, run) && F.round < maxRounds) {
    roundStart(F, run);
    for (const k of F.order) {
      if (outcome(F, run)) break;
      const t = memberTurn(ctx, F, run, k);
      if (t.can) turn(ctx, F, run, k, skill, log);
      memberDone(run, k);
      log.low = Math.min(log.low, ratio(F, run));
    }
    for (const e of [...F.foes]) {
      if (outcome(F, run)) break;
      foeTurn(ctx, F, run, e);
      log.low = Math.min(log.low, ratio(F, run));
    }
    if (!outcome(F, run)) roundEnd(ctx, F, run);
    if (able(F, run).length === 0 && standing(F, run).length)
      throw new Error('a round started with nobody able to act');
  }
  log.won = outcome(F, run) === 'win';
  log.rounds = F.round;
  return { F, log };
}

/** The two allies a player brings: the healer, then whoever hits the boss's weakness. */
function chooseLineup(camp: Campaign, save: Progress, ch: number): AllyKey[] {
  const weak = weaknessOf(camp.chapters[ch].boss.phases[0].el);
  const pool = save.recruits;
  const pick: AllyKey[] = [];
  const healer = pool.find((k) => MEMBERS[k].role === 'heal');
  if (healer) pick.push(healer);
  const striker = pool.find((k) => !pick.includes(k) && MEMBERS[k].el === weak);
  if (striker) pick.push(striker);
  for (const k of [...pool].reverse())
    if (pick.length < 2 && !pick.includes(k)) pick.push(k);
  return pick;
}

export interface CampaignLog {
  attempts: number[];
  fights: FightLog[];
  finished: boolean;
  level: number;
}

/** A whole campaign: each chapter is retried until won, carrying XP, levels and allies. */
export function campaign(
  seed: number,
  skill: number,
  o: { camp?: Campaign; bank?: Ctx['bank']; maxAttempts?: number } = {}
): CampaignLog {
  const camp = o.camp ?? LIVE;
  const maxAttempts = o.maxAttempts ?? 15;
  const { save, ctx } = ctxFor(
    seed,
    emptyProgress(),
    o.bank ?? bankIdsOf(camp)
  );
  const out: CampaignLog = {
    attempts: [],
    fights: [],
    finished: true,
    level: 1,
  };
  for (let ch = 0; ch < camp.chapters.length; ch++) {
    let tries = 0;
    let won = false;
    while (!won && tries < maxAttempts) {
      won = playChapter(ctx, camp, save, ch, skill, out.fights, tries);
      tries++;
    }
    out.attempts.push(tries);
    if (!won) {
      out.finished = false;
      break;
    }
  }
  out.level = levelOf(save.xp);
  return out;
}

function playChapter(
  ctx: Ctx,
  camp: Campaign,
  save: Progress,
  ch: number,
  skill: number,
  fights: FightLog[],
  defeats: number
): boolean {
  save.lineup = chooseLineup(camp, save, ch);
  const run = newRun(camp, ch, {
    level: levelOf(save.xp),
    perks: save.perks,
    recruits: save.recruits,
    lineup: save.lineup,
    defeats,
  });
  for (run.step = 0; run.step <= FIGHTS_PER_CHAPTER; ) {
    const newcomer = recruitAt(camp, ch, run.step);
    if (newcomer && !save.recruits.includes(newcomer)) {
      save.recruits.push(newcomer);
      join(run, newcomer);
      setLineup(run, lineupWith(run.lineup, newcomer));
      if (save.recruits.length > 2)
        setLineup(run, chooseLineup(camp, save, ch));
    }
    const doors = genDoors(run, ctx.rng);
    const hurt = ratioRun(run) < 0.6;
    const door =
      doors.find((d) => d === 'cafe' && hurt) ??
      doors.find((d) => d === 'coffre') ??
      doors.find((d) => d === (skill > 0.8 ? 'elite' : 'combat')) ??
      doors[0];
    run.elite = door === 'elite';
    if (door === 'cafe') {
      restAtCafe(run);
      run.step++;
      continue;
    }
    if (door === 'coffre') {
      applyReward(run, genChest(run, false, ctx.rng)[0]);
      afterStep(run);
      run.step++;
      continue;
    }
    const { F, log } = playFight(ctx, run, skill);
    fights.push(log);
    const before = levelOf(save.xp);
    save.xp += fightXp(F, run, log.won);
    const after = levelOf(save.xp);
    if (after > before) {
      for (let l = before; l < after; l++)
        if (l % 2) save.perks.pv++;
        else save.perks.ink++;
      run.perks = save.perks;
      setLevel(run, after);
    }
    if (!log.won) return false;
    if (run.step === FIGHTS_PER_CHAPTER) {
      const domain = camp.chapters[ch].domain;
      if (!save.beaten.includes(domain)) save.beaten.push(domain);
      return true;
    }
    delivery(run, ctx.rng);
    applyReward(run, genChest(run, run.elite, ctx.rng)[0]);
    afterStep(run);
    run.step++;
  }
  return true;
}

const ratioRun = (run: Run) => {
  const ms = Object.values(run.party).filter((m): m is Member => !!m);
  return ms.reduce((s, m) => s + m.hp, 0) / ms.reduce((s, m) => s + m.max, 0);
};
