import { describe, expect, it } from 'vitest';
import questions from '@/training/data/questions.json';
import exam from '@/training/data/exam.json';
import { drawOptions } from '@/training/domain/options';
import { seededRng } from '@/training/domain/random';
import {
  RULES,
  CHAPTERS,
  WEAPONS,
  WEAPON_KEYS,
  damageFor,
} from '@/training/domain/rules';
import {
  afterStep,
  alive,
  applyReward,
  guard,
  knowKey,
  powerBlock,
  usePower,
  weaponBlocked,
  attack,
  enemyPhase,
  makeFight,
  newRun,
  targetable,
} from '@/training/domain/engine';
import type { Ctx } from '@/training/domain/engine';
import {
  bookFor,
  emptySave,
  parseSave,
  serializeSave,
} from '@/training/domain/save';
import { idsByDomain } from '@/training/domain/bank';
import { COPY } from '@/training/i18n/copy';

const ids = new Set(questions.map((q) => q.id));
const domains = new Set(exam.domains.map((d) => d.key));

describe('question bank', () => {
  it('has unique ids, known domains, four options and a valid answer', () => {
    expect(ids.size).toBe(questions.length);
    for (const q of questions) {
      expect(domains.has(q.domain)).toBe(true);
      expect(q.options.fr).toHaveLength(4);
      expect(q.options.en).toHaveLength(4);
      expect(q.answer).toBeGreaterThanOrEqual(0);
      expect(q.answer).toBeLessThan(4);
    }
  });
});

describe('drawOptions', () => {
  it('always shows the right option, the asked count, no duplicate', () => {
    const rng = seededRng(42);
    for (const q of questions.slice(0, 60))
      for (const w of WEAPON_KEYS)
        for (let k = 0; k < 20; k++) {
          const n = WEAPONS[w].options;
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

describe('damage', () => {
  it('weapons hit 1, 2, 3 for 2, 3, 4 options', () => {
    expect(
      WEAPON_KEYS.map((w) => [WEAPONS[w].options, WEAPONS[w].dmg])
    ).toEqual([
      [2, 1],
      [3, 2],
      [4, 3],
    ]);
  });
  it('doubles on the weakness, halves (at least 1) on the resistance', () => {
    const t = { weak: 'trident', resist: 'duel' } as const;
    expect(damageFor(t, 'trident')).toEqual({ d: 4, kind: 'crit' });
    expect(damageFor(t, 'duel')).toEqual({ d: 1, kind: 'resist' });
    expect(damageFor(t, 'exam')).toEqual({ d: 3, kind: '' });
  });
});

describe('chapters', () => {
  it('follow the exam domains in exam.json order', () => {
    expect(CHAPTERS.map((c) => c.domain)).toEqual(
      exam.domains.map((d) => d.key)
    );
  });
});

function ctxFor(seed = 1) {
  const save = emptySave();
  const ctx: Ctx = {
    rng: seededRng(seed),
    book: bookFor(save, () => {}),
    bank: idsByDomain(
      questions.map((q) => ({
        id: q.id,
        domain: q.domain,
        stem: '',
        why: '',
        options: q.options.en,
        answer: q.answer,
      }))
    ),
  };
  return { save, ctx };
}

describe('progress', () => {
  it('frees a sheet only on a right answer', () => {
    const { save, ctx } = ctxFor();
    const run = newRun(0, ctx.rng);
    const F = makeFight(ctx, run);
    const e = targetable(F)[0];
    const sheet = e.sheets[0];
    attack(ctx, F, run, e.uid, 'exam', false);
    expect(save.freed).not.toContain(sheet);
    expect(save.review[sheet]).toBe(2);
    const next = e.sheets[0];
    attack(ctx, F, run, e.uid, 'exam', true);
    expect(save.freed).toEqual([next]);
  });
  it('a quill strike and a fleeing enemy free nothing', () => {
    const { save, ctx } = ctxFor(3);
    const run = newRun(0, ctx.rng);
    const F = makeFight(ctx, run);
    const e = targetable(F)[0];
    e.pv = 20;
    attack(ctx, F, run, e.uid, 'exam', true, { plume: true });
    expect(save.freed).toEqual([]);
    expect(e.sheets).toHaveLength(3);
    e.pv = 1;
    attack(ctx, F, run, e.uid, 'duel', true);
    expect(e.dead).toBe(true);
    expect(save.freed).toHaveLength(1);
  });
  it('an echo hits every other enemy', () => {
    const { ctx } = ctxFor(5);
    const run = newRun(0, ctx.rng);
    run.step = 1;
    const F = makeFight(ctx, run);
    run.echo = true;
    const [a, b] = F.foes;
    const before = b.pv;
    attack(ctx, F, run, targetable(F)[0].uid, 'duel', true);
    const other = targetable(F)[0] === a ? b : a;
    expect(other.pv).toBeLessThan(before + 1);
    expect(run.echo).toBe(false);
  });
  it('a wave hits both heroes: health and ink', () => {
    const { ctx } = ctxFor(9);
    const run = newRun(4, ctx.rng);
    const F = makeFight(ctx, run);
    F.foes[0].intent = { k: 'wave', n: 3 };
    const hp = run.hp;
    const ink = run.ink;
    enemyPhase(ctx, F, run);
    expect(run.hp).toBe(hp - 3);
    expect(run.ink).toBe(ink - 1);
  });
  it('a careful player clears most chapters at first try', () => {
    let won = 0;
    const SEEDS = 30;
    for (let s = 1; s <= SEEDS; s++) {
      const { ctx } = ctxFor(s);
      for (let ch = 0; ch < CHAPTERS.length; ch++) {
        /* by chapter N a player has levelled up about N times: one perk each */
        const run = newRun(ch, ctx.rng, {
          pv: Math.ceil(ch / 2),
          ink: Math.floor(ch / 2),
        });
        let ok = true;
        for (run.step = 0; run.step <= 4 && ok; run.step++) {
          const F = makeFight(ctx, run);
          while (alive(F).length && run.hp > 0) {
            if (run.hp <= 10 && powerBlock(F, run, 'balm') === null)
              usePower(F, run, 'balm');
            const big = alive(F).some((x) => x.intent.k === 'big' && !x.stun);
            const e = targetable(F).sort((a, b) => a.pv - b.pv)[0];
            if (big && run.hp <= 14) guard(run);
            else if (run.verve >= RULES.verveMax) {
              run.verve = 0;
              attack(ctx, F, run, e.uid, 'exam', true, { plume: true });
            } else {
              const kn = ctx.book.known(knowKey(e));
              const w =
                WEAPON_KEYS.find((k) => kn[k] === 'crit') ??
                WEAPON_KEYS.filter(
                  (k) => kn[k] !== 'resist' && !weaponBlocked(F, k)
                ).pop() ??
                'trident';
              attack(ctx, F, run, e.uid, w, ctx.rng() < 0.8);
            }
            if (alive(F).length && run.hp > 0) enemyPhase(ctx, F, run);
          }
          ok = run.hp > 0;
          if (ok && run.step < 4) {
            applyReward(run, run.boons.pv ? 'item:cafe' : 'boon:pv');
            afterStep(run);
          }
        }
        if (ok) won++;
      }
    }
    expect(won / (SEEDS * CHAPTERS.length)).toBeGreaterThan(0.6);
  });
});

describe('save format', () => {
  it('round-trips and drops unknown ids and bad data', () => {
    const s = emptySave();
    s.freed = ['aa-001', 'zz-999'];
    s.review = { 'aa-002': 2, 'zz-1': 1 };
    s.beaten = ['agentic_architecture', 'nope'];
    const back = parseSave(serializeSave(s), ids, domains);
    expect(back.freed).toEqual(['aa-001']);
    expect(back.review).toEqual({ 'aa-002': 2 });
    expect(back.beaten).toEqual(['agentic_architecture']);
    expect(parseSave('{bad', ids, domains)).toEqual(emptySave());
    expect(parseSave('{"v":99}', ids, domains)).toEqual(emptySave());
  });
});

describe('copy', () => {
  it('has no French in the English game', () => {
    const texts: string[] = [];
    const walk = (x: unknown) => {
      if (typeof x === 'string') texts.push(x);
      else if (typeof x === 'function') {
        let out: unknown;
        try {
          out = (x as (...a: unknown[]) => unknown)(1, 2, 'X');
        } catch {
          out = (x as (...a: unknown[]) => unknown)(['X', 'Y']);
        }
        if (typeof out === 'string') texts.push(out);
      } else if (x && typeof x === 'object') Object.values(x).forEach(walk);
    };
    walk(COPY.en);
    const leaks = texts.filter(
      (t) => /[àâçéèêëîïôûùüœ«»]/i.test(t) && !/^Moka|caf/i.test(t)
    );
    expect(leaks).toEqual([]);
  });
});
