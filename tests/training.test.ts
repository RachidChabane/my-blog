import { describe, expect, it } from 'vitest';
import { BANKS, bankOf } from '@/training/data/banks';
import { EXAMS, FOUNDATIONS_EXAM } from '@/training/domain/exams';
import { sheetLabel } from '@/training/domain/bank';
import v1Save from './fixtures/training-save-v1.json';
import { drawOptions } from '@/training/domain/options';
import { seededRng } from '@/training/domain/random';
import {
  AFFINITY_FACTOR,
  ELEMENTS,
  affinity,
  weaknessOf,
} from '@/training/domain/elements';
import type { Element } from '@/training/domain/elements';
import {
  BOSSES,
  BOSS_HP_SHARE,
  BOSS_KEYS,
  DARK_FACTOR,
  MOVES,
  TUNED_FACTOR,
  TYPES,
  TYPE_KEYS,
} from '@/training/domain/foes';
import type { MoveKey } from '@/training/domain/foes';
import {
  ALLY_KEYS,
  MEMBERS,
  SKILLS,
  lineupWith,
} from '@/training/domain/party';
import {
  FIGHTS_PER_CHAPTER,
  FORMATS,
  FORMAT_KEYS,
  LEVELS,
  levelOf,
} from '@/training/domain/rules';
import { STATUS, tickAmount } from '@/training/domain/statuses';
import type { Ctx, Ev, Fight, Foe, Run } from '@/training/domain/engine';
import {
  able,
  act,
  alive,
  blow,
  foeTurn,
  formatBlocked,
  makeFight,
  memberDone,
  memberOf,
  memberTurn,
  openingReveals,
  planIntent,
  powerBlock,
  preview,
  roundEnd,
  skillBlock,
  standing,
  isDark,
  targetable,
  tunedTo,
  useItem,
  usePower,
} from '@/training/domain/engine';
import {
  afterStep,
  assistOf,
  join,
  newRun,
  setLineup,
} from '@/training/domain/run';
import {
  SAVE_KEY,
  SAVE_KEY_V1,
  SAVE_VERSION,
  bookFor,
  emptyProgress,
  emptySave,
  loadSave,
  parseSave,
  progressOf,
  readable,
  serializeSave,
} from '@/training/domain/save';
import type { SaveData } from '@/training/domain/save';
import { COPY, cineCopy, storyOf } from '@/training/i18n/copy';
import { PAGE_COPY } from '@/training/i18n/page-copy';
import {
  PARTY_RECIPES,
  recipeOf,
  recipeSignature,
} from '@/training/client/game/fx-recipes';
import { phraseOf } from '@/training/client/game/sound';
import { DEV_PRO, DEV_PRO_BANK, LIVE, campaign, ctxFor } from './training-sim';
import { CAMPAIGNS, DEVELOPER_PROFESSIONAL } from '@/training/domain/campaigns';
import {
  CURVE,
  buildCampaign,
  recruitAt,
  recruitsOfBeaten,
} from '@/training/domain/campaign';

const questions = bankOf(FOUNDATIONS_EXAM.key);
const ids = new Set(questions.map((q) => q.id));

describe('question banks', () => {
  for (const exam of EXAMS)
    describe(exam.name, () => {
      const bank = bankOf(exam.key);
      const domains = exam.domains.map((d) => d.key);
      it('has unique ids, known domains, four options and a valid answer, in both languages', () => {
        expect(new Set(bank.map((q) => q.id)).size).toBe(bank.length);
        for (const q of bank) {
          expect(domains, q.id).toContain(q.domain);
          for (const l of ['fr', 'en'] as const) {
            expect(q.options[l], q.id).toHaveLength(4);
            expect(q.stem[l].trim(), q.id).not.toBe('');
            expect(q.why[l].trim(), q.id).not.toBe('');
            expect(
              q.options[l].every((o) => o.trim() !== ''),
              q.id
            ).toBe(true);
          }
          expect(Number.isInteger(q.answer)).toBe(true);
          expect(q.answer).toBeGreaterThanOrEqual(0);
          expect(q.answer).toBeLessThan(4);
        }
      });
      it('ships the game shape only, and questions for every domain', () => {
        for (const q of bank)
          expect(Object.keys(q).sort(), q.id).toEqual([
            'answer',
            'domain',
            'id',
            'options',
            'stem',
            'why',
          ]);
        for (const d of domains)
          expect(
            bank.some((q) => q.domain === d),
            d
          ).toBe(true);
      });
      it('labels every sheet with its domain and number', () => {
        const labels = bank.map(sheetLabel);
        expect(new Set(labels).size).toBe(bank.length);
        for (const l of labels) expect(l).toMatch(/^[A-Z]{2}-\d{3}$/);
      });
    });
  it('keeps one bank per exam, and no question in two banks', () => {
    expect(Object.keys(BANKS).sort()).toEqual(EXAMS.map((e) => e.key).sort());
    const all = Object.values(BANKS).flatMap((b) => b.map((q) => q.id));
    expect(new Set(all).size).toBe(all.length);
  });
});

describe('drawOptions', () => {
  it('always shows the right option, the asked count, no duplicate', () => {
    const rng = seededRng(42);
    for (const q of questions.slice(0, 60))
      for (const f of FORMAT_KEYS)
        for (let k = 0; k < 20; k++) {
          const n = FORMATS[f].options;
          const d = drawOptions(
            { options: q.options.en, answer: q.answer },
            n,
            rng
          );
          expect(d.order).toHaveLength(n);
          expect(new Set(d.order).size).toBe(n);
          expect(d.order[d.correct]).toBe(q.answer);
        }
  });
  it('varies which wrong options and which order are shown', () => {
    const rng = seededRng(7);
    const q = { options: ['a', 'b', 'c', 'd'], answer: 2 };
    const seen = new Set(
      Array.from({ length: 50 }, () => drawOptions(q, 2, rng).order.join())
    );
    expect(seen.size).toBeGreaterThan(3);
  });
});

describe('elements', () => {
  it('form one cycle: ink > paper > coffee > current > ink', () => {
    expect(affinity('encre', 'papier')).toBe('weak');
    expect(affinity('papier', 'cafe')).toBe('weak');
    expect(affinity('cafe', 'courant')).toBe('weak');
    expect(affinity('courant', 'encre')).toBe('weak');
    for (const e of ELEMENTS) {
      expect(affinity(e, e)).toBe('resist');
      expect(affinity(weaknessOf(e), e)).toBe('weak');
      expect(ELEMENTS.filter((a) => affinity(a, e) === 'weak')).toHaveLength(1);
    }
    expect(AFFINITY_FACTOR).toEqual({ weak: 2, neutral: 1, resist: 0.5 });
  });
  it('give every enemy kind and every boss phase an element', () => {
    for (const t of TYPE_KEYS) expect(ELEMENTS).toContain(TYPES[t].el);
    for (const c of LIVE.chapters)
      for (const p of c.boss.phases) expect(ELEMENTS).toContain(p.el);
  });
  it('let the party hit each boss on its weakness by the time it is met', () => {
    LIVE.chapters.forEach((c, i) => {
      const met: Element[] = [
        MEMBERS.hero.el,
        ...ALLY_KEYS.filter((k) => LIVE.joins[k].ch <= i).map(
          (k) => MEMBERS[k].el
        ),
      ];
      expect(met).toContain(weaknessOf(c.boss.phases[0].el));
    });
  });
});

/* ---------- a fight set up by hand ---------- */
function setup(
  o: {
    ch?: number;
    step?: number;
    allies?: (typeof ALLY_KEYS)[number][];
    seed?: number;
  } = {}
) {
  const { save, ctx } = ctxFor(o.seed ?? 1);
  const run = newRun(LIVE, o.ch ?? 0, {
    level: 1,
    recruits: o.allies ?? [],
    lineup: (o.allies ?? []).slice(0, 2),
  });
  run.step = o.step ?? 0;
  const F = makeFight(ctx, run);
  return { save, ctx, run, F };
}
const dmgOf = (evs: Ev[]) =>
  evs.filter((e) => e.k === 'dmg') as Extract<Ev, { k: 'dmg' }>[];
const answer = (ctx: Ctx, F: Fight, run: Run, right = true) => ({
  sheet: ctx.bank[LIVE.chapters[F.ch].domain].find(
    (id) => !F.asked.has(id)
  ) as string,
  right,
});

describe('damage', () => {
  it('is strength × format power × element, halved by burn and guard, minus red tape', () => {
    const at = {
      el: 'encre' as Element,
      hp: 10,
      max: 10,
      atk: 5,
      st: {},
      shield: 0,
    };
    const paper = { ...at, el: 'papier' as Element };
    expect(blow(5, 4, 'encre', at, paper)).toEqual({ d: 40, aff: 'weak' });
    expect(blow(5, 4, 'encre', at, at)).toEqual({ d: 10, aff: 'resist' });
    expect(blow(5, 4, 'encre', { ...at, st: { burn: 1 } }, paper).d).toBe(20);
    expect(blow(5, 4, 'encre', at, { ...paper, st: { guard: 1 } }).d).toBe(20);
    const tampon = { ...paper, el: 'cafe' as Element, key: 'tampon' as const };
    expect(blow(5, 2, 'encre', at, tampon).d).toBe(8);
    expect(blow(0.1, 1, 'encre', at, at).d).toBe(1);
  });
  it('the formats are 2, 3 and 4 options for power 2, 3 and 4', () => {
    expect(
      FORMAT_KEYS.map((f) => [FORMATS[f].options, FORMATS[f].power])
    ).toEqual([
      [2, 2],
      [3, 3],
      [4, 4],
    ]);
  });
  it('lands exactly what the card promised once the element is known', () => {
    for (const ally of ALLY_KEYS)
      for (const f of FORMAT_KEYS) {
        const { ctx, run, F } = setup({
          ch: 2,
          step: 3,
          allies: [ally],
          seed: 11,
        });
        F.revealed = new Set(F.foes.map((e) => e.uid));
        for (const k of F.order) {
          const e = targetable(F)[0];
          if (!e) break;
          const p = preview(ctx, F, run, k, { format: f }, e.uid);
          const evs = act(
            ctx,
            F,
            run,
            k,
            { kind: 'attack', format: f, target: e.uid },
            answer(ctx, F, run)
          );
          expect(dmgOf(evs)[0].d).toBe(p.hits[0].d);
          expect(dmgOf(evs)[0].aff).toBe(p.aff);
        }
      }
  });
  it('lands what offensive skills promised, hit by hit and target by target', () => {
    for (const k of ['hero', 'vigie', 'moka', 'tampon', 'navette'] as const)
      for (const s of MEMBERS[k].skills.filter((x) => SKILLS[x].format)) {
        const { ctx, run, F } = setup({
          ch: 4,
          step: 2,
          allies: k === 'hero' ? [] : [k],
          seed: 5,
        });
        F.revealed = new Set(F.foes.map((e) => e.uid));
        run.tokens = 10;
        const e = targetable(F)[0];
        const p = preview(
          ctx,
          F,
          run,
          k,
          { format: SKILLS[s].format as 'exam', skill: s },
          e.uid
        );
        const evs = act(
          ctx,
          F,
          run,
          k,
          { kind: 'skill', skill: s, target: e.uid },
          answer(ctx, F, run)
        );
        const hits = dmgOf(evs).filter((d) => d.cause === 'hit');
        expect(hits.map((h) => h.d)).toEqual(p.hits.map((h) => h.d));
      }
  });
  it('prices an unknown element as neutral and says it is unknown', () => {
    const { ctx, run, F } = setup({ seed: 3 });
    const e = F.foes[0];
    const p = preview(ctx, F, run, 'hero', { format: 'exam' }, e.uid);
    expect(p.aff).toBeNull();
    expect(p.hits[0].d).toBe(memberOf(run, 'hero').atk * 4);
    act(
      ctx,
      F,
      run,
      'hero',
      { kind: 'attack', format: 'exam', target: e.uid },
      answer(ctx, F, run)
    );
    expect(F.revealed.has(e.uid)).toBe(true);
    expect(preview(ctx, F, run, 'hero', { format: 'exam' }, e.uid).aff).toBe(
      'weak'
    );
  });
});

describe('statuses', () => {
  it('poison ticks a share of max health at the start of each turn, then expires', () => {
    const { ctx, run, F } = setup({ seed: 2 });
    const e = F.foes[0];
    e.st.poison = 3;
    const before = e.hp;
    for (let t = 0; t < 3; t++) foeTurn(ctx, F, run, e);
    expect(before - e.hp).toBeGreaterThanOrEqual(
      3 * tickAmount('poison', e.max)
    );
    expect(e.st.poison).toBeUndefined();
  });
  it('burn ticks and halves the burnt one’s blows', () => {
    const { ctx, run, F } = setup({ seed: 4 });
    const e = F.foes[0];
    e.intent = { move: 'hit', targets: ['hero'] };
    const clean = blow(e.atk, 1, e.el, e, memberOf(run, 'hero')).d;
    e.st.burn = 2;
    const evs = foeTurn(ctx, F, run, e);
    expect(dmgOf(evs).find((d) => d.cause === 'burn')?.d).toBe(
      tickAmount('burn', e.max)
    );
    expect(dmgOf(evs).find((d) => d.cause === 'hit')?.d).toBeLessThanOrEqual(
      Math.ceil(clean / 2)
    );
  });
  it('sleep skips turns and ends on a hit, not on a poison tick', () => {
    const { ctx, run, F } = setup({ seed: 6 });
    const e = F.foes[0];
    e.st.sleep = 2;
    e.st.poison = 3;
    const evs = foeTurn(ctx, F, run, e);
    expect(evs.some((x) => x.k === 'skip' && x.why === 'sleep')).toBe(true);
    expect(e.st.sleep).toBe(1);
    act(
      ctx,
      F,
      run,
      'hero',
      { kind: 'attack', format: 'duel', target: e.uid },
      answer(ctx, F, run)
    );
    expect(e.st.sleep).toBeUndefined();
  });
  it('stun skips one turn, then the target stands steady against a new stun', () => {
    const { ctx, run, F } = setup({ seed: 8, allies: ['vigie'] });
    const e = F.foes[0];
    e.st.stun = 1;
    const evs = foeTurn(ctx, F, run, e);
    expect(evs.some((x) => x.k === 'skip' && x.why === 'stun')).toBe(true);
    run.tokens = 10;
    const again = act(
      ctx,
      F,
      run,
      'vigie',
      { kind: 'skill', skill: 'decharge', target: e.uid },
      answer(ctx, F, run)
    );
    expect(
      again.some(
        (x) => x.k === 'status' && x.s === 'stun' && x.change === 'resist'
      )
    ).toBe(true);
  });
  it('silence blocks skills but never attacks, and turns an enemy special into a hit', () => {
    const { ctx, run, F } = setup({ seed: 9, allies: ['vigie'] });
    memberOf(run, 'vigie').st.silence = 2;
    expect(skillBlock(F, run, 'vigie', 'balayage')).toBe('silence');
    expect(formatBlocked(F, 'exam')).toBe(false);
    const e = F.foes[0];
    e.st.silence = 2;
    e.intent = { move: 'smudge', targets: ['hero'] };
    const evs = foeTurn(ctx, F, run, e);
    expect(evs.some((x) => x.k === 'fizzle')).toBe(true);
    expect(memberOf(run, 'hero').st.smudge).toBeUndefined();
  });
  it('guard halves until the guard’s next turn; a shield soaks up then breaks', () => {
    const { ctx, run, F } = setup({ seed: 10, allies: ['tampon'] });
    act(ctx, F, run, 'hero', { kind: 'guard' });
    expect(memberOf(run, 'hero').st.guard).toBe(1);
    memberTurn(ctx, F, run, 'hero');
    expect(memberOf(run, 'hero').st.guard).toBeUndefined();
    run.tokens = 10;
    memberOf(run, 'hero').hp -= 10;
    act(ctx, F, run, 'tampon', { kind: 'skill', skill: 'visa', target: 0 });
    const hero = memberOf(run, 'hero');
    expect(hero.shield).toBe(Math.round(memberOf(run, 'tampon').max * 0.4));
    const e = F.foes[0];
    e.atk = 200;
    e.intent = { move: 'hit', targets: ['hero'] };
    const evs = foeTurn(ctx, F, run, e);
    expect(evs.some((x) => x.k === 'shield' && x.change === 'break')).toBe(
      true
    );
    expect(hero.shield).toBe(0);
  });
  it('taunt draws single-target moves to the taunter', () => {
    const { ctx, run, F } = setup({
      ch: 3,
      step: 2,
      seed: 12,
      allies: ['tampon'],
    });
    run.tokens = 10;
    F.foes.forEach((e) => (e.intent = { move: 'hit', targets: ['hero'] }));
    act(ctx, F, run, 'tampon', { kind: 'skill', skill: 'provoc', target: 0 });
    expect(F.foes.every((e) => e.intent?.targets[0] === 'tampon')).toBe(true);
  });
  it('can be cleared: Espresso, the Blotter and blotting paper cure ailments', () => {
    const { ctx, run, F } = setup({ seed: 13, allies: ['moka'] });
    run.tokens = 10;
    const hero = memberOf(run, 'hero');
    hero.hp = 5;
    hero.st.poison = 3;
    act(ctx, F, run, 'moka', { kind: 'skill', skill: 'espresso', target: 0 });
    expect(hero.st.poison).toBeUndefined();
    hero.st.burn = 2;
    usePower(F, run, 'blot');
    expect(hero.st.burn).toBeUndefined();
    hero.st.smudge = 2;
    run.items.push('buvard');
    useItem(F, run, 'buvard');
    expect(hero.st.smudge).toBeUndefined();
    expect(powerBlock(F, run, 'blot')).toBe('clean');
  });
});

describe('no dead turn', () => {
  it('sleep never takes the last member who can act', () => {
    const { ctx, run, F } = setup({ seed: 14 });
    const e = F.foes[0];
    e.intent = { move: 'sleep', targets: ['hero'] };
    const evs = foeTurn(ctx, F, run, e);
    expect(evs.some((x) => x.k === 'status' && x.change === 'resist')).toBe(
      true
    );
    expect(able(F, run)).toHaveLength(1);
  });
  it('when the last member awake falls, the noise wakes the others', () => {
    const { ctx, run, F } = setup({ seed: 15, allies: ['vigie'] });
    memberOf(run, 'hero').st.sleep = 2;
    const e = F.foes[0];
    e.atk = 999;
    e.intent = { move: 'hit', targets: ['vigie'] };
    foeTurn(ctx, F, run, e);
    expect(memberOf(run, 'vigie').hp).toBe(0);
    expect(memberOf(run, 'hero').st.sleep).toBeUndefined();
    expect(able(F, run).map((m) => m.key)).toEqual(['hero']);
  });
  it('holds over thousands of random enemy rounds: someone standing can always act', () => {
    const moves: MoveKey[] = [
      'sleep',
      'overflow',
      'hit',
      'big',
      'silence',
      'poison',
      'area',
      'bill',
      'timeout',
      'unlog',
      'refit',
    ];
    for (let seed = 1; seed <= 60; seed++) {
      const { ctx, run, F } = setup({
        ch: 4,
        step: 3,
        seed,
        allies: ['vigie', 'moka'],
      });
      const rng = seededRng(seed);
      for (let round = 0; round < 25 && standing(F, run).length; round++) {
        for (const e of alive(F)) {
          e.intent = {
            move: moves[Math.floor(rng() * moves.length)],
            targets: standing(F, run)
              .map((m) => m.key)
              .slice(0, 2),
          };
          foeTurn(ctx, F, run, e);
        }
        if (standing(F, run).length)
          expect(able(F, run).length).toBeGreaterThan(0);
        for (const k of F.order) {
          memberTurn(ctx, F, run, k);
          memberDone(run, k);
        }
        roundEnd(ctx, F, run);
      }
    }
  });
});

describe('the party', () => {
  it('meets one ally per chapter, in a room of that chapter', () => {
    expect(ALLY_KEYS.map((k) => LIVE.joins[k].ch).sort()).toEqual([
      0, 1, 2, 3, 4,
    ]);
    expect(recruitAt(LIVE, 0, 1)).toBe('vigie');
    expect(recruitAt(LIVE, 0, 0)).toBeNull();
    expect(recruitsOfBeaten(LIVE, [0, 1])).toEqual(['vigie', 'navette']);
    expect(recruitsOfBeaten(LIVE, [0, 1, 2, 3])).not.toContain('arrosoir');
    for (const k of ALLY_KEYS) {
      expect(MEMBERS[k].skills.length).toBeGreaterThanOrEqual(2);
      expect(new Set(ALLY_KEYS.map((x) => MEMBERS[x].role)).size).toBe(
        ALLY_KEYS.length
      );
    }
  });
  it('a recruit joins the run, takes a free place in the line-up and acts in the fight', () => {
    const { ctx } = ctxFor(16);
    const run = newRun(LIVE, 0, { level: 1 });
    join(run, 'vigie');
    expect(run.lineup).toEqual(['vigie']);
    run.step = 1;
    const F = makeFight(ctx, run);
    expect(F.order).toEqual(['hero', 'vigie']);
    const t = memberTurn(ctx, F, run, 'vigie');
    expect(t.can).toBe(true);
    const evs = act(
      ctx,
      F,
      run,
      'vigie',
      { kind: 'attack', format: 'trident', target: targetable(F)[0].uid },
      answer(ctx, F, run)
    );
    expect(evs[0]).toEqual({
      k: 'act',
      who: { side: 'party', key: 'vigie' },
      act: 'atk:vigie',
    });
  });
  it('keeps two allies in the line-up, the newcomer replacing the oldest', () => {
    expect(lineupWith(['vigie', 'navette'], 'moka')).toEqual([
      'navette',
      'moka',
    ]);
    expect(lineupWith(['vigie'], 'navette')).toEqual(['vigie', 'navette']);
    const run = newRun(LIVE, 2, {
      level: 3,
      recruits: ['vigie', 'navette', 'moka'],
      lineup: ['vigie', 'moka'],
    });
    setLineup(run, ['navette', 'moka', 'vigie']);
    expect(run.lineup).toEqual(['navette', 'moka']);
  });
  it('Vigie’s radar shows every element at the start of a fight', () => {
    const { ctx, run, F } = setup({ ch: 1, step: 1, allies: ['vigie'] });
    const evs = openingReveals(ctx, F);
    expect(evs.filter((e) => e.k === 'reveal')).toHaveLength(F.foes.length);
    void run;
  });
  it('after a room everyone gets back up, statuses gone', () => {
    const run = newRun(LIVE, 0, {
      level: 1,
      recruits: ['vigie'],
      lineup: ['vigie'],
    });
    memberOf(run, 'vigie').hp = 0;
    memberOf(run, 'hero').st.poison = 2;
    afterStep(run);
    expect(memberOf(run, 'vigie').hp).toBeGreaterThan(0);
    expect(memberOf(run, 'hero').st).toEqual({});
  });
  it('Glose’s notes add a coffee and a token per defeat, up to three', () => {
    expect([0, 1, 2, 5].map(assistOf)).toEqual([0, 1, 2, 3]);
    const run = newRun(LIVE, 0, { level: 1, defeats: 2 });
    expect(run.items.filter((i) => i === 'cafe')).toHaveLength(3);
  });
});

describe('progress', () => {
  it('frees a sheet only on a right answer', () => {
    const { save, ctx, run, F } = setup({ seed: 20 });
    const e = targetable(F)[0];
    const wrong = answer(ctx, F, run, false);
    act(
      ctx,
      F,
      run,
      'hero',
      { kind: 'attack', format: 'exam', target: e.uid },
      wrong
    );
    expect(save.freed).not.toContain(wrong.sheet);
    expect(save.review[wrong.sheet]).toBe(2);
    const right = answer(ctx, F, run, true);
    act(
      ctx,
      F,
      run,
      'hero',
      { kind: 'attack', format: 'exam', target: e.uid },
      right
    );
    expect(save.freed).toEqual([right.sheet]);
  });
  it('damage without a question frees nothing: poison, echo, an area skill frees one sheet only', () => {
    const { save, ctx, run, F } = setup({
      ch: 1,
      step: 3,
      seed: 21,
      allies: ['navette'],
    });
    const e = F.foes[0];
    e.st.poison = 3;
    e.hp = 1;
    foeTurn(ctx, F, run, e);
    expect(e.dead).toBe(true);
    expect(save.freed).toEqual([]);
    run.tokens = 10;
    usePower(F, run, 'echo');
    act(
      ctx,
      F,
      run,
      'navette',
      { kind: 'skill', skill: 'courtcircuit', target: targetable(F)[0].uid },
      answer(ctx, F, run)
    );
    expect(save.freed).toHaveLength(1);
  });
  it('a wrong answer brings a counter from the target', () => {
    const { ctx, run, F } = setup({ seed: 22 });
    const hp = memberOf(run, 'hero').hp;
    const evs = act(
      ctx,
      F,
      run,
      'hero',
      { kind: 'attack', format: 'duel', target: F.foes[0].uid },
      answer(ctx, F, run, false)
    );
    expect(evs.some((e) => e.k === 'act' && e.act === 'counter')).toBe(true);
    expect(memberOf(run, 'hero').hp).toBeLessThan(hp);
  });
});

describe('bosses', () => {
  const bossFight = (ch: number, seed = 30) => {
    const s = setup({
      ch,
      step: 4,
      seed,
      allies: ALLY_KEYS.filter((k) => LIVE.joins[k].ch <= ch).slice(-2),
    });
    return { ...s, boss: s.F.foes[0] as Foe };
  };
  it('the Loop acts twice a turn past half its health', () => {
    const { ctx, run, F, boss } = bossFight(0);
    boss.hp = Math.floor(boss.max / 2) + 1;
    boss.atk = 0.01;
    const evs = act(
      ctx,
      F,
      run,
      'hero',
      { kind: 'attack', format: 'duel', target: boss.uid },
      answer(ctx, F, run)
    );
    expect(evs.some((e) => e.k === 'phase' && e.phase === 1)).toBe(true);
    const turn = foeTurn(ctx, F, run, boss);
    expect(turn.filter((e) => e.k === 'act')).toHaveLength(2);
  });
  it('the Dispatcher calls in two tools that shield it', () => {
    const { ctx, run, F, boss } = bossFight(1);
    boss.hp = Math.floor(boss.max / 2) + 1;
    act(
      ctx,
      F,
      run,
      'hero',
      { kind: 'attack', format: 'duel', target: boss.uid },
      answer(ctx, F, run)
    );
    expect(alive(F)).toHaveLength(3);
    expect(targetable(F).every((e) => e.kind === 'mask')).toBe(true);
  });
  it('the Allow-All shields itself past half health, unless silenced', () => {
    const { ctx, run, F, boss } = bossFight(2);
    boss.hp = Math.floor(boss.max / 2);
    boss.phase = 1;
    boss.pi = 0;
    planIntent(ctx, F, run, boss);
    expect(boss.intent?.move).toBe('allow');
    boss.st.silence = 1;
    foeTurn(ctx, F, run, boss);
    expect(boss.shield).toBe(0);
    boss.pi = 0;
    planIntent(ctx, F, run, boss);
    foeTurn(ctx, F, run, boss);
    expect(boss.shield).toBeGreaterThan(0);
  });
  it('Sir Off-Schema shuffles the next question, then changes element', () => {
    const { ctx, run, F, boss } = bossFight(3);
    boss.intent = { move: 'shuffle', targets: ['hero'] };
    foeTurn(ctx, F, run, boss);
    expect(F.mixNext).toBe(true);
    boss.intent = { move: 'shift', targets: [] };
    const el = boss.el;
    foeTurn(ctx, F, run, boss);
    expect(boss.el).not.toBe(el);
  });
  it('the Memory Leak has three phases: fog, then sleep, then poison on everyone', () => {
    const { ctx, run, F, boss } = bossFight(4);
    boss.hp = Math.floor(boss.max * 0.66);
    act(
      ctx,
      F,
      run,
      'hero',
      { kind: 'attack', format: 'duel', target: boss.uid },
      answer(ctx, F, run)
    );
    expect(boss.phase).toBe(1);
    expect(F.fog).toBeGreaterThan(0);
    boss.hp = Math.floor(boss.max * 0.33);
    act(
      ctx,
      F,
      run,
      'hero',
      { kind: 'attack', format: 'trident', target: boss.uid },
      answer(ctx, F, run)
    );
    expect(boss.phase).toBe(2);
    boss.intent = { move: 'spill', targets: [] };
    foeTurn(ctx, F, run, boss);
    expect(standing(F, run).every((m) => m.st.poison)).toBe(true);
  });
  it('every move in every pattern exists and has a reach', () => {
    for (const t of TYPE_KEYS)
      for (const m of TYPES[t].pattern) expect(MOVES[m].reach).toBeTruthy();
  });
});

describe('the boss mechanics of the eight-domain campaign', () => {
  const at = (key: string) =>
    DEV_PRO.chapters.findIndex((c) => c.boss.key === key);
  const bossFight = (key: string, seed = 5) => {
    const ch = at(key);
    const { save, ctx } = ctxFor(seed, emptyProgress(), DEV_PRO_BANK);
    const allies = ALLY_KEYS.filter((k) => DEV_PRO.joins[k].ch <= ch).slice(-2);
    const run = newRun(DEV_PRO, ch, {
      level: 5,
      recruits: allies,
      lineup: allies,
    });
    run.step = FIGHTS_PER_CHAPTER;
    const F = makeFight(ctx, run);
    const boss = F.foes[0] as Foe;
    const hit = (format: 'duel' | 'trident' | 'exam', right = true) =>
      act(
        ctx,
        F,
        run,
        'hero',
        { kind: 'attack', format, target: boss.uid },
        {
          sheet: DEV_PRO_BANK[DEV_PRO.chapters[ch].domain].find(
            (id) => !F.asked.has(id)
          ) as string,
          right,
        }
      );
    const toPhase = (share: number, format: 'duel' | 'trident' | 'exam') => {
      boss.hp = Math.floor(boss.max * share);
      return hit(format);
    };
    return { save, ctx, run, F, boss, hit, toPhase };
  };
  const dmgTo = (evs: Ev[], uid: number) =>
    dmgOf(evs).find((e) => e.to.side === 'foe' && e.to.uid === uid)?.d ?? 0;

  it('the Untraced goes off the radar past 60%: hidden, half damage, until a 4-option answer traces it', () => {
    const { ctx, F, run, boss, hit, toPhase } = bossFight('dark');
    const before = dmgTo(hit('trident'), boss.uid);
    toPhase(0.6, 'trident');
    expect(boss.phase).toBe(1);
    expect(isDark(boss)).toBe(true);
    boss.st = {};
    const dark = dmgTo(hit('trident'), boss.uid);
    expect(dark).toBeLessThan(before);
    expect(dark).toBe(Math.max(1, Math.floor(before * DARK_FACTOR)));
    expect(boss.st.traced).toBeUndefined();
    const traced = hit('exam');
    expect(
      traced.some(
        (e) => e.k === 'status' && e.s === 'traced' && e.change === 'on'
      )
    ).toBe(true);
    expect(isDark(boss)).toBe(false);
    expect(dmgTo(hit('trident'), boss.uid)).toBe(before);
    boss.intent = { move: 'unlog', targets: [] };
    foeTurn(ctx, F, run, boss);
    expect(isDark(boss)).toBe(true);
  });
  it('the Untraced is traced by a radar sweep too, and a sweep stays possible while it is dark', () => {
    const { F, run, boss, toPhase } = bossFight('dark');
    toPhase(0.6, 'trident');
    F.revealed.add(boss.uid);
    run.tokens = run.maxTokens;
    expect(skillBlock(F, run, 'vigie', 'balayage')).toBeNull();
  });
  it('the Shifting Benchmark fits itself to the last format: that format deals half until another lands', () => {
    const { ctx, F, run, boss, hit, toPhase } = bossFight('overfit');
    const full = dmgTo(hit('trident'), boss.uid);
    toPhase(0.5, 'duel');
    expect(boss.phase).toBe(1);
    const tune = hit('trident');
    expect(tune.some((e) => e.k === 'tune' && e.format === 'trident')).toBe(
      true
    );
    expect(tunedTo(boss)).toBe('trident');
    const p = preview(ctx, F, run, 'hero', { format: 'trident' }, boss.uid);
    const fitted = dmgTo(hit('trident'), boss.uid);
    expect(fitted).toBe(p.hits[0].d);
    expect(fitted).toBe(Math.max(1, Math.floor(full * TUNED_FACTOR)));
    hit('exam');
    expect(tunedTo(boss)).toBe('exam');
    expect(dmgTo(hit('trident'), boss.uid)).toBe(full);
  });
  it('the Meter bills tokens, then counts down to a timeout that a right Duel winds back', () => {
    const { ctx, F, run, boss, hit, toPhase } = bossFight('meter');
    run.tokens = 5;
    boss.intent = { move: 'bill', targets: ['hero'] };
    foeTurn(ctx, F, run, boss);
    expect(run.tokens).toBe(3);
    const start = toPhase(0.5, 'trident');
    expect(start.some((e) => e.k === 'clock' && e.change === 'start')).toBe(
      true
    );
    expect(boss.st.clock).toBe(3);
    boss.atk = 0.01;
    const turn = () => {
      foeTurn(ctx, F, run, boss);
      roundEnd(ctx, F, run);
    };
    turn();
    turn();
    expect(boss.st.clock).toBe(1);
    expect(boss.intent?.move).toBe('timeout');
    const back = hit('duel');
    expect(back.some((e) => e.k === 'clock' && e.change === 'back')).toBe(true);
    expect(boss.st.clock).toBe(2);
    expect(boss.intent?.move).not.toBe('timeout');
    hit('trident');
    expect(boss.st.clock).toBe(2);
    turn();
    expect(boss.intent?.move).toBe('timeout');
    const out = foeTurn(ctx, F, run, boss);
    expect(
      out.filter((e) => e.k === 'dmg' && e.to.side === 'party').length
    ).toBe(standing(F, run).length);
    expect(boss.st.clock).toBe(3);
  });
});

describe('the difficulty curve', () => {
  const SEEDS = 16;
  const stats = (k: number) => {
    const runs = Array.from({ length: SEEDS }, (_, s) => campaign(s + 1, k));
    const first = (ch: number) =>
      runs.filter((r) => r.attempts[ch] === 1).length / runs.length;
    const fights = runs.flatMap((r) => r.fights);
    const qs = (ch: number) => {
      const f = fights.filter((x) => x.ch === ch);
      return f.reduce((a, x) => a + x.questions, 0) / f.length;
    };
    const close =
      fights.filter((f) => f.won && f.low < 0.3).length /
      fights.filter((f) => f.won).length;
    const acc =
      fights.reduce((a, f) => a + f.right, 0) /
      fights.reduce((a, f) => a + f.questions, 0);
    return { runs, first, qs, close, acc };
  };
  const lazy = <T>(f: () => T) => {
    let v: T | undefined;
    return () => (v ??= f());
  };
  const P50 = lazy(() => stats(1 / 3));
  const P75 = lazy(() => stats(2 / 3));
  const P90 = lazy(() => stats(0.867));
  it('the simulated players answer about 50%, 75% and 90% right', () => {
    expect(P50().acc).toBeGreaterThan(0.45);
    expect(P50().acc).toBeLessThan(0.6);
    expect(P75().acc).toBeGreaterThan(0.7);
    expect(P75().acc).toBeLessThan(0.82);
    expect(P90().acc).toBeGreaterThan(0.86);
  });
  it('a 90% player clears almost every chapter at the first try', () => {
    const all = [0, 1, 2, 3, 4].map(P90().first);
    expect(all.reduce((a, b) => a + b, 0) / 5).toBeGreaterThan(0.9);
  });
  it('a 75% player wins most chapters at once, with some close fights, and the last chapter is the hardest', () => {
    const firsts = [0, 1, 2, 3, 4].map(P75().first);
    expect(firsts.reduce((a, b) => a + b, 0) / 5).toBeGreaterThan(0.7);
    expect(firsts.reduce((a, b) => a + b, 0) / 5).toBeLessThan(1);
    expect(P75().close).toBeGreaterThan(0.04);
    expect(P75().first(4)).toBeLessThan(Math.max(...firsts.slice(0, 4)));
  });
  it('a 50% player struggles but always finds a way forward', () => {
    const firsts = [0, 1, 2, 3, 4].map(P50().first);
    expect(firsts.reduce((a, b) => a + b, 0) / 5).toBeLessThan(0.6);
    expect(P50().runs.every((r) => r.finished)).toBe(true);
  });
  it('fights get longer chapter after chapter', () => {
    expect(P75().qs(4)).toBeGreaterThan(P75().qs(0) * 1.6);
    expect(P75().qs(2)).toBeGreaterThan(P75().qs(0));
  });
});

describe('the eight-domain campaign (Developer - Professional)', () => {
  const spec = DEVELOPER_PROFESSIONAL;
  const camp = DEV_PRO;
  const bank = DEV_PRO_BANK;
  it('gets one chapter per domain, each with its rooms and a boss of at least two phases', () => {
    expect(camp.chapters.map((c) => c.domain)).toEqual(spec.domains);
    for (const c of camp.chapters) {
      expect(c.steps).toHaveLength(FIGHTS_PER_CHAPTER);
      expect(c.boss.phases.length).toBeGreaterThanOrEqual(2);
      expect(c.boss.phases).toBe(BOSSES[spec.bosses[c.domain]]);
    }
  });
  it('climbs from the first chapter to the last, never repeating a step of the curve', () => {
    const climbs = (xs: number[]) =>
      xs.every((x, i) => i === 0 || x > xs[i - 1]);
    expect(climbs(camp.chapters.map((c) => c.hp))).toBe(true);
    expect(climbs(camp.chapters.map((c) => c.atk))).toBe(true);
    expect(
      climbs(camp.chapters.map((c) => c.boss.hp / BOSS_HP_SHARE[c.boss.key]))
    ).toBe(true);
    expect(camp.chapters[0].hp).toBe(CURVE.hp[0]);
    expect(camp.chapters[7].hp).toBe(CURVE.hp[CURVE.hp.length - 1]);
    expect(camp.chapters.map((c) => c.progress)).toEqual(
      spec.domains.map((_, i) => i / 7)
    );
  });
  it('meets every kind of enemy, each first alone at the head of its chapter, then combines them', () => {
    const met = new Set<string>();
    camp.chapters.forEach((c, i) => {
      const fresh = c.steps.flat().filter((k) => !met.has(k));
      if (i < 7) {
        expect(fresh.length, c.domain).toBeGreaterThan(0);
        expect(c.steps[0], c.domain).toEqual([fresh[0]]);
      } else expect(fresh).toEqual([]);
      expect(c.steps.map((r) => r.length)).toEqual(
        [1, 2, 2, 3].map((n, j) => (i === 7 ? [2, 2, 3, 3][j] : n))
      );
      fresh.forEach((k) => met.add(k));
    });
    expect([...met].sort()).toEqual([...TYPE_KEYS].sort());
  });
  it('gives every ally a room of their own, whatever the number of chapters', () => {
    for (let n = 1; n <= 10; n++) {
      const c = buildCampaign({
        key: `N${n}`,
        domains: spec.domains
          .slice(0, Math.min(n, 8))
          .concat(
            Array.from({ length: Math.max(0, n - 8) }, (_, i) => `extra_${i}`)
          ),
        bosses: new Proxy({}, { get: () => 'loop' }),
      });
      const at = ALLY_KEYS.map((k) => c.joins[k]);
      expect(new Set(at.map((j) => `${j.ch}:${j.step}`)).size, `n=${n}`).toBe(
        at.length
      );
      for (const j of at) expect(recruitAt(c, j.ch, j.step)).not.toBeNull();
      for (const j of at)
        expect(j.step).toBeLessThanOrEqual(FIGHTS_PER_CHAPTER);
    }
  });
  it('spreads the allies from the first chapter to the last, one room each', () => {
    const at = ALLY_KEYS.map((k) => camp.joins[k]);
    expect(at[0].ch).toBe(0);
    expect(at[at.length - 1].ch).toBe(7);
    expect(new Set(at.map((j) => `${j.ch}:${j.step}`)).size).toBe(at.length);
    at.forEach((j, i) => {
      if (i) expect(j.ch - at[i - 1].ch).toBeGreaterThanOrEqual(1);
      if (i) expect(j.ch - at[i - 1].ch).toBeLessThanOrEqual(2);
      expect(recruitAt(camp, j.ch, j.step)).toBe(ALLY_KEYS[i]);
    });
  });
  it('pays less XP per answer than a five-chapter campaign, so levels keep pace with the curve', () => {
    expect(LIVE.xpShare).toBe(1);
    expect(camp.xpShare).toBeLessThan(1);
    const { ctx } = ctxFor(3, emptyProgress(), bank);
    const xpOf = (c: typeof camp) => {
      const run = newRun(c, 0, { level: 1 });
      const F = makeFight(ctx, run);
      const evs = act(
        ctx,
        F,
        run,
        'hero',
        { kind: 'attack', format: 'exam', target: targetable(F)[0].uid },
        { sheet: bank[spec.domains[0]][0], right: true }
      );
      return (evs.find((e) => e.k === 'free') as { xp: number }).xp;
    };
    expect(xpOf(camp)).toBeLessThan(xpOf({ ...camp, xpShare: 1 }));
  });
  it('uses each boss mechanic once, the three new ones included', () => {
    const keys = camp.chapters.map((c) => c.boss.key);
    expect(new Set(keys).size).toBe(keys.length);
    expect(keys).toEqual(expect.arrayContaining(['dark', 'overfit', 'meter']));
    expect([...BOSS_KEYS].sort()).toEqual(
      [
        ...new Set(
          CAMPAIGNS.flatMap((c) => c.chapters.map((ch) => ch.boss.key))
        ),
      ].sort()
    );
  });
  it('a 75% player wins most chapters at the first try, and a 50% player finishes', () => {
    const SEEDS = 16;
    const p75 = Array.from({ length: SEEDS }, (_, s) =>
      campaign(s + 1, 2 / 3, { camp })
    );
    const firsts = camp.chapters.map(
      (_, ch) => p75.filter((r) => r.attempts[ch] === 1).length / SEEDS
    );
    expect(firsts.reduce((a, b) => a + b, 0) / firsts.length).toBeGreaterThan(
      0.75
    );
    expect(firsts.filter((f) => f >= 0.5)).toHaveLength(firsts.length);
  });
  it('is played to the end by the simulated players, harder chapter after chapter', () => {
    const SEEDS = 8;
    const play = (k: number) =>
      Array.from({ length: SEEDS }, (_, s) =>
        campaign(s + 1, k, { camp, bank })
      );
    const p75 = play(2 / 3);
    const p50 = play(1 / 3);
    expect(p75.every((r) => r.finished)).toBe(true);
    expect(p50.every((r) => r.finished)).toBe(true);
    const qs = (ch: number) => {
      const f = p75.flatMap((r) => r.fights).filter((x) => x.ch === ch);
      return f.reduce((a, x) => a + x.questions, 0) / f.length;
    };
    expect(qs(7)).toBeGreaterThan(qs(0) * 1.6);
    const tries = (runs: typeof p75) =>
      runs.reduce((a, r) => a + r.attempts.reduce((x, y) => x + y, 0), 0) /
      runs.length;
    expect(tries(p50)).toBeGreaterThan(tries(p75));
  });
});

describe('save format', () => {
  const shelves = [{ camp: LIVE, ids }];
  const live = (s: SaveData) => s.campaigns[LIVE.key];
  it('migrates a real first-version save into the live campaign: sheets, review marks, level, sound, scenes', () => {
    const raw = JSON.stringify(v1Save);
    const s = loadSave((k) => (k === SAVE_KEY_V1 ? raw : null), shelves, LIVE);
    expect(s.v).toBe(SAVE_VERSION);
    expect(Object.keys(s.campaigns)).toEqual([LIVE.key]);
    const p = live(s);
    expect(p.freed).toEqual(v1Save.freed);
    expect(p.review).toEqual(v1Save.review);
    expect(levelOf(p.xp)).toBe(levelOf(v1Save.xp));
    expect(p.seen).toEqual(v1Save.seen);
    expect(p.known).toEqual([]);
    expect(p.recruits).toEqual([]);
    expect(s.sound).toBe(true);
    expect(s.soundAsked).toBe(true);
    expect(s.taught).toBe(true);
    expect(s.speed).toBe('normal');
  });
  it('gives a veteran the allies of the chapters already won, and keeps their level and perks', () => {
    const vet = {
      ...v1Save,
      xp: 700,
      beaten: [LIVE.chapters[0].domain, LIVE.chapters[1].domain],
      perks: { pv: 2, ink: 1 },
    };
    const p = live(parseSave(JSON.stringify(vet), shelves, LIVE));
    expect(p.beaten).toEqual(vet.beaten);
    expect(p.recruits).toEqual(['vigie', 'navette']);
    expect(p.lineup).toEqual(['vigie', 'navette']);
    expect(levelOf(p.xp)).toBe(6);
    expect(p.perks).toEqual({ pv: 2, ink: 1 });
    const four = live(
      parseSave(
        JSON.stringify({
          ...vet,
          beaten: LIVE.chapters.slice(0, 4).map((c) => c.domain),
        }),
        shelves,
        LIVE
      )
    );
    expect(four.recruits).toEqual(['vigie', 'navette', 'moka', 'tampon']);
    expect(four.seen).not.toContain('join-vigie');
  });
  it('reads this version first and leaves the old save where it was', () => {
    const v2 = emptySave();
    progressOf(v2, LIVE.key).freed = ['aa-001'];
    const s = loadSave(
      (k) => (k === SAVE_KEY ? serializeSave(v2) : JSON.stringify(v1Save)),
      shelves,
      LIVE
    );
    expect(live(s).freed).toEqual(['aa-001']);
    expect(SAVE_KEY).not.toBe(SAVE_KEY_V1);
  });
  it('keeps progress per campaign, and carries a campaign this build does not know untouched', () => {
    const other = { ...LIVE, key: 'OTHER', chapters: [] };
    const s = emptySave();
    progressOf(s, LIVE.key).freed = ['aa-001'];
    progressOf(s, 'OTHER').freed = ['x-1'];
    progressOf(s, 'LATER').xp = 42;
    const back = parseSave(
      serializeSave(s),
      [...shelves, { camp: other, ids: new Set(['x-1']) }],
      LIVE
    );
    expect(back.campaigns[LIVE.key].freed).toEqual(['aa-001']);
    expect(back.campaigns.OTHER.freed).toEqual(['x-1']);
    expect(back.campaigns.LATER.xp).toBe(42);
  });
  it('migrates a first-version save into the campaign it played, from any campaign page', () => {
    const other = { ...LIVE, key: 'OTHER' };
    const s = parseSave(
      JSON.stringify(v1Save),
      [{ camp: other, ids: new Set(['x-1']) }],
      LIVE
    );
    expect(Object.keys(s.campaigns)).toEqual([LIVE.key]);
    expect(s.campaigns[LIVE.key].freed).toEqual(v1Save.freed);
    expect(s.campaigns[LIVE.key].review).toEqual(v1Save.review);
  });
  it('keeps the two exams apart: playing one never changes the other', () => {
    const devIds = new Set(bankOf(DEV_PRO.key).map((q) => q.id));
    const both = [...shelves, { camp: DEV_PRO, ids: devIds }];
    const s = loadSave(
      (k) => (k === SAVE_KEY_V1 ? JSON.stringify(v1Save) : null),
      both,
      LIVE
    );
    const foundations = serializeSave({ ...s, campaigns: { ...s.campaigns } });
    const dev = progressOf(s, DEV_PRO.key);
    const book = bookFor(dev, () => {});
    const devId = [...devIds][0];
    book.free(devId);
    book.review([...devIds][1], false);
    book.learn('grib');
    dev.beaten.push(DEV_PRO.chapters[0].domain);
    dev.xp = 120;
    const back = parseSave(serializeSave(s), both, LIVE);
    expect(back.campaigns[LIVE.key]).toEqual(
      JSON.parse(foundations).campaigns[LIVE.key]
    );
    expect(back.campaigns[LIVE.key].freed).not.toContain(devId);
    expect(back.campaigns[DEV_PRO.key].freed).toEqual([devId]);
    expect(back.campaigns[DEV_PRO.key].beaten).toEqual([
      DEV_PRO.chapters[0].domain,
    ]);
    const fromFoundationsPage = parseSave(serializeSave(s), shelves, LIVE);
    expect(fromFoundationsPage.campaigns[DEV_PRO.key].freed).toEqual([devId]);
    const fromDevPage = parseSave(
      serializeSave(s),
      [{ camp: DEV_PRO, ids: devIds }],
      LIVE
    );
    expect(fromDevPage.campaigns[LIVE.key].freed).toEqual(v1Save.freed);
  });
  it('drops ids of the other exam from a campaign’s progress', () => {
    const devIds = new Set(bankOf(DEV_PRO.key).map((q) => q.id));
    const s = emptySave();
    progressOf(s, DEV_PRO.key).freed = ['aa-001', [...devIds][0]];
    const back = parseSave(
      serializeSave(s),
      [{ camp: DEV_PRO, ids: devIds }],
      LIVE
    );
    expect(back.campaigns[DEV_PRO.key].freed).toEqual([[...devIds][0]]);
  });
  it('tells which stored saves must never be written over', () => {
    expect(readable(null)).toBe(true);
    expect(readable(JSON.stringify(v1Save))).toBe(true);
    expect(readable(serializeSave(emptySave()))).toBe(true);
    expect(readable('{"v":3,"campaigns":{}}')).toBe(false);
    expect(readable('{bad')).toBe(false);
  });
  it('round-trips and drops unknown ids and bad data', () => {
    const s = emptySave();
    s.speed = 'fast';
    const p = progressOf(s, LIVE.key);
    p.freed = ['aa-001', 'zz-999'];
    p.review = { 'aa-002': 2, 'zz-1': 1 };
    p.beaten = ['agentic_architecture', 'nope'];
    p.recruits = ['vigie'];
    p.lineup = ['vigie', 'moka'];
    p.defeats = { agentic_architecture: 2 };
    const back = parseSave(serializeSave(s), shelves, LIVE);
    expect(live(back).freed).toEqual(['aa-001']);
    expect(live(back).review).toEqual({ 'aa-002': 2 });
    expect(live(back).beaten).toEqual(['agentic_architecture']);
    expect(live(back).lineup).toEqual(['vigie']);
    expect(live(back).defeats).toEqual({ agentic_architecture: 2 });
    expect(back.speed).toBe('fast');
    expect(parseSave('{bad', shelves, LIVE)).toEqual(emptySave());
    expect(parseSave('{"v":99}', shelves, LIVE)).toEqual(emptySave());
  });
  it('levels keep their thresholds, so a migrated level stays the same', () => {
    expect(LEVELS.slice(0, 10)).toEqual([
      0, 60, 150, 280, 450, 660, 900, 1200, 1550, 1950,
    ]);
  });
  it('the book records what the player found out', () => {
    const book = bookFor(emptyProgress(), () => {});
    expect(book.learn('grib')).toBe(true);
    expect(book.learn('grib')).toBe(false);
    expect(book.knows('grib')).toBe(true);
  });
});

describe('every action looks and sounds its own way', () => {
  const keys = () => {
    const out = new Set<string>(Object.keys(PARTY_RECIPES));
    out.add('counter');
    for (const t of TYPE_KEYS)
      for (const m of [...TYPES[t].pattern, 'hit' as MoveKey])
        out.add(`move:${t}:${m}`);
    for (const camp of CAMPAIGNS)
      for (const ch of camp.chapters) {
        for (const p of ch.boss.phases)
          for (const m of [
            ...p.pattern,
            'hit',
            ...(p.clock ? ['timeout'] : []),
          ] as MoveKey[])
            out.add(`move:${ch.domain}:${m}`);
        for (const p of ch.boss.phases)
          for (const t of p.summon ?? [])
            for (const m of TYPES[t].pattern) out.add(`move:${t}:${m}`);
      }
    return [...out];
  };
  it('has a recipe for every action, and no two recipes alike', () => {
    const all = keys();
    expect(all.length).toBeGreaterThan(80);
    const sigs = all.map((k) => {
      const r = recipeOf(k);
      expect(r, k).not.toBeNull();
      return recipeSignature(r!);
    });
    expect(new Set(sigs).size).toBe(sigs.length);
  });
  it('has a sound for every action, and no two sounds alike', () => {
    const all = keys();
    const sounds = all.map((k) => JSON.stringify(phraseOf(k)));
    expect(new Set(sounds).size).toBe(sounds.length);
  });
});

describe('copy', () => {
  it('has no French in the English game', () => {
    const texts: string[] = [];
    const walk = (x: unknown) => {
      if (typeof x === 'string') texts.push(x);
      else if (typeof x === 'function') {
        const who = { name: 'X', you: false };
        const you = { name: 'X', you: true };
        for (const args of [
          [1, 2, 'X', 4, 5],
          [['X', 'Y']],
          ['poison', who, 2],
          ['stun', you, 2],
          [who, 2, 3, 4],
          [you, 2, 3, 4],
          ['weak', 'encre'],
          ['resist', 'cafe'],
          ['sleep', who],
          ['X', 'courant', 'hit'],
          ['X', 'papier', 'scan'],
          ['Poison', who, 2, 3, 4],
        ]) {
          try {
            const out = (x as (...a: unknown[]) => unknown)(...args);
            if (typeof out === 'string') texts.push(out);
          } catch {
            /* this function takes other arguments */
          }
        }
      } else if (x && typeof x === 'object') Object.values(x).forEach(walk);
    };
    walk(COPY.en);
    walk(PAGE_COPY.en);
    const leaks = texts.filter(
      (t) => /[àâçéèêëîïôûùüœ«»]/i.test(t) && !/^Moka|caf/i.test(t)
    );
    expect(leaks).toEqual([]);
  });
  it('names every skill, status, member and move in both languages', () => {
    for (const c of [COPY.fr, COPY.en]) {
      for (const s of Object.keys(SKILLS))
        expect(c.skills[s as keyof typeof SKILLS].name).toBeTruthy();
      for (const s of Object.keys(STATUS))
        expect(c.statuses[s as keyof typeof STATUS].help).toBeTruthy();
      for (const m of Object.keys(MOVES))
        expect(c.moves[m as MoveKey].name).toBeTruthy();
      for (const camp of CAMPAIGNS) {
        const story = storyOf(c, camp.key);
        const domains = camp.chapters.map((ch) => ch.domain);
        for (const k of ALLY_KEYS)
          expect(
            cineCopy(c, story, `join-${k}`, domains, 1).shots
          ).toHaveLength(3);
        expect(story.titles.length).toBe(LEVELS.length);
        expect(Object.keys(story.chapters).sort()).toEqual([...domains].sort());
        camp.chapters.forEach((ch) => {
          const cc = story.chapters[ch.domain];
          expect(cc.boss.phases, ch.domain).toHaveLength(
            ch.boss.phases.length - 1
          );
          expect(cc.short.length, ch.domain).toBeLessThanOrEqual(13);
          expect(cc.places.every((p) => p.length > 0)).toBe(true);
        });
      }
    }
  });
  it('tells each campaign its own numbers: sheets in its bank, bosses in its chapters', () => {
    for (const camp of CAMPAIGNS) {
      const sheets = bankOf(camp.key).length;
      const n = camp.chapters.length;
      const domains = camp.chapters.map((ch) => ch.domain);
      const fr = storyOf(COPY.fr, camp.key);
      const en = storyOf(COPY.en, camp.key);
      expect(fr.titleNew(sheets)).toContain(String(sheets));
      expect(en.intro(sheets, n).shots.join(' ')).toContain(String(sheets));
      expect(
        cineCopy(COPY.en, en, 'intro', domains, sheets).shots[1]
      ).toContain(['five', 'eight'][n === 5 ? 0 : 1]);
      expect(COPY.fr.lines.allWon(n)).toContain(n === 5 ? 'cinq' : 'huit');
    }
  });
  it('writes no em-dash in either language', () => {
    const texts: string[] = [];
    const walk = (x: unknown): void => {
      if (typeof x === 'string') texts.push(x);
      else if (typeof x === 'function') {
        for (const args of [
          [1, 2],
          ['X', 2, 'tick'],
          ['X', 'Y'],
        ])
          try {
            const out = (x as (...a: unknown[]) => unknown)(...args);
            walk(out);
          } catch {
            /* other arguments */
          }
      } else if (x && typeof x === 'object') Object.values(x).forEach(walk);
    };
    walk(COPY);
    walk(PAGE_COPY);
    expect(texts.filter((t) => t.includes('\u2014'))).toEqual([]);
  });
});
