/**
 * A fight: the presenter of the combat engine. It asks, animates and narrates; the
 * engine decides. Every action plays as a beat the eye can follow: who acts and what,
 * the animation, the hit with its number and the bar draining, then the result line,
 * held for its reading time.
 */
import type { Question } from '../../domain/bank';
import { drawOptions } from '../../domain/options';
import type { Draw } from '../../domain/options';
import { pickOne, shuffle } from '../../domain/random';
import type { Ev, Fight, Foe, Ref, Run } from '../../domain/engine';
import {
  act,
  alive,
  foeBy,
  foeTurn,
  formatBlocked,
  isKnown,
  itemBlock,
  itemTarget,
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
  shielded,
  skillBlock,
  skillTarget,
  targetable,
  isDark,
  tunedTo,
  useItem,
  usePower,
  foeRef,
} from '../../domain/engine';
import type { Affinity, Element } from '../../domain/elements';
import { affinity } from '../../domain/elements';
import { MOVES } from '../../domain/foes';
import type { MemberKey, SkillKey } from '../../domain/party';
import { MEMBERS, SKILLS } from '../../domain/party';
import type { FormatKey, ItemKey, PowerKey } from '../../domain/rules';
import {
  FORMATS,
  FORMAT_KEYS,
  ITEM_KEYS,
  POWER_COST,
  POWER_KEYS,
} from '../../domain/rules';
import { sheetLabel } from '../../domain/bank';
import { chapterCopy } from '../../i18n/copy';
import { G, $, beat, domainOf, esc } from './state';
import {
  Zone,
  advance,
  bubbleAt,
  choose,
  gameHasFocus,
  goButton,
  holdLine,
  menuKind,
  pickMenu,
  renderStatus,
  say,
  sayOne,
  setScene,
  setStep,
  setTurn,
  showLine,
} from './ui';
import type { Who } from './ui';
import { elIcon, icon24 } from './art';
import {
  actorEl,
  cardEl,
  clearDeltas,
  foeArtEl,
  foeCard,
  foeEl,
  foeName,
  intentHelp,
  memberName,
  partyHtml,
  resetPartyBars,
  showDelta,
  showDown,
  showHp,
  showShield,
  showStatus,
  showUnit,
  statusLinesOf,
  syncShown,
  updateFoes,
  who,
} from './hud';
import {
  callout,
  clearStills,
  downFx,
  fogFx,
  missFx,
  phaseFx,
  playAct,
  popNumber,
  revealFx,
  shieldFx,
  statusFx,
  stealFx,
  tuneFx,
  upFx,
  walkIn,
} from './fx';
import { blip } from './sound';
import { chapterChrome, setForStep } from './screens';
import { playCine } from './cine';

/* ---------- reading the stage ---------- */
const run = () => G.run as Run;
const fight = () => G.F as Fight;
const spriteOf = (r: Ref): HTMLElement | null =>
  r.side === 'foe' ? foeArtEl(r.uid) : actorEl(r.key);
const nameOf = (r: Ref): string =>
  r.side === 'foe' ? foeName(foeBy(fight(), r.uid) as Foe) : memberName(r.key);
const whoOf = (r: Ref) =>
  r.side === 'foe' ? { name: nameOf(r), you: false } : who(r.key);
const elOfRef = (r: Ref): Element =>
  r.side === 'foe'
    ? (foeBy(fight(), r.uid) as Foe).el
    : memberOf(run(), r.key).el;

/** The name of an action, as the banner and the dialogue announce it. */
function actName(key: string, actor: string): string {
  const c = G.c;
  const [kind, a, b] = key.split(':');
  if (kind === 'atk') return c.members[a as MemberKey].attack;
  if (kind === 'skill') return c.skills[a as SkillKey].name;
  if (kind === 'power') return c.powers[a as PowerKey].name;
  if (kind === 'item') return c.items[a as ItemKey].name;
  if (kind === 'move') return c.moves[b as keyof typeof c.moves].name;
  if (kind === 'counter') return c.ev.counter(actor);
  return c.actions.guard;
}

export function refresh(acting: MemberKey | null = null): void {
  const F = G.F;
  if (!F) return;
  updateFoes(F, run(), G.sel, menuKind() === 'formats');
  renderStatus(acting);
}

/* ---------- playing events, one beat per action ---------- */
interface BeatState {
  lines: string[];
  speaker: Who;
  /** The one acting, and the name of the action, said again with the result. */
  who: Ref | null;
  name: string;
  /** Element of the one acting, for the weak and resisted call-outs. */
  el: Element | null;
  act: string;
  actor: string;
}
const MAX_LINE = 118;

async function flush(b: BeatState): Promise<void> {
  if (!b.lines.length) return;
  const chunks: string[] = [];
  let cur = '';
  for (const l of b.lines.filter(Boolean)) {
    if (cur && (cur + ' ' + l).length > MAX_LINE) {
      chunks.push(cur);
      cur = l;
    } else cur = cur ? `${cur} ${l}` : l;
  }
  if (cur) chunks.push(cur);
  b.lines = [];
  for (const [i, text] of chunks.entries())
    await sayOne({
      who: b.speaker,
      text: i === 0 && b.name ? G.c.ev.result(b.name, text) : text,
      bubble: false,
    });
  b.speaker = null;
  b.name = '';
}

export async function play(
  events: Ev[],
  acting: MemberKey | null = null
): Promise<void> {
  const F = fight();
  const c = G.c;
  const b: BeatState = {
    lines: [],
    speaker: null,
    who: null,
    name: '',
    el: null,
    act: '',
    actor: '',
  };
  for (const e of events) {
    switch (e.k) {
      case 'act': {
        await flush(b);
        G.hurry = false;
        clearDeltas();
        clearStills();
        const isPower = e.act.startsWith('power:');
        const actor = isPower ? c.glose : nameOf(e.who);
        b.act = e.act;
        b.actor = actor;
        b.who = e.who;
        b.name = actName(e.act, actor);
        b.speaker = isPower
          ? 'glose'
          : e.who.side === 'foe'
            ? (foeBy(F, e.who.uid) as Foe)
            : e.who.key;
        b.el = isPower ? null : elOfRef(e.who);
        if (e.who.side === 'foe') setTurn('foe');
        showLine(
          esc(c.ev.announce(actor, actName(e.act, actor))),
          isPower
            ? 'glose'
            : e.who.side === 'foe'
              ? (foeBy(F, e.who.uid) as Foe)
              : e.who.key
        );
        spriteOf(e.who)?.classList.add('acting-now');
        await beat(900);
        spriteOf(e.who)?.classList.remove('acting-now');
        break;
      }
      case 'fx': {
        const from = b.act.startsWith('power:')
          ? $('layer').querySelector('.actor.glose')
          : spriteOf(e.from);
        const to = e.to.map(spriteOf).filter((x): x is HTMLElement => !!x);
        await playAct(e.act, actName(e.act, nameOf(e.from)), from, to);
        break;
      }
      case 'dmg': {
        const el = spriteOf(e.to);
        const w = whoOf(e.to);
        if (el) {
          popNumber(el, `−${e.before - e.after}`, `hurt ${e.aff}`);
          if (
            e.aff !== 'neutral' &&
            (e.cause === 'hit' || e.cause === 'counter')
          )
            callout(el, e.aff === 'weak' ? 'weak' : 'resist');
        }
        blip(e.cause === 'poison' || e.cause === 'burn' ? 'tick' : 'hurt');
        if (e.cause === 'poison' || e.cause === 'burn') {
          if (el) void statusFx(el, e.cause, 'tick');
          b.lines.push(
            c.ev.tick(
              c.statuses[e.cause].name,
              w,
              e.before - e.after,
              e.before,
              e.after
            )
          );
        } else {
          b.lines.push(
            [
              c.ev.dmg(w, e.before - e.after, e.before, e.after),
              e.aff !== 'neutral' && b.el && e.cause !== 'echo'
                ? c.ev.aff(e.aff, b.el)
                : '',
              e.absorbed ? c.ev.absorbed(e.absorbed) : '',
            ]
              .filter(Boolean)
              .join(' ')
          );
        }
        showHp(e.to, e.after);
        if (e.absorbed) showShield(e.to, e.shield);
        refresh(acting);
        showDelta(
          e.to.side === 'foe' ? foeEl(e.to.uid) : cardEl(e.to.key),
          e.before,
          e.after,
          'hurt'
        );
        await beat(700);
        break;
      }
      case 'heal': {
        const el = spriteOf(e.to);
        if (el) popNumber(el, `+${e.n}`, 'heal');
        if (e.cause === 'regen' && el) void statusFx(el, 'regen', 'tick');
        blip('heal');
        if (e.n > 0)
          b.lines.push(c.ev.heal(whoOf(e.to), e.n, e.before, e.after));
        showHp(e.to, e.after);
        refresh(acting);
        showDelta(
          e.to.side === 'foe' ? foeEl(e.to.uid) : cardEl(e.to.key),
          e.before,
          e.after,
          'heal'
        );
        await beat(500);
        break;
      }
      case 'status': {
        const el = spriteOf(e.to);
        const w = whoOf(e.to);
        if (el && e.change !== 'resist')
          await statusFx(el, e.s, e.change === 'on' ? 'on' : 'off');
        b.lines.push(
          e.change === 'on'
            ? e.s === 'guard'
              ? c.ev.guard(w)
              : c.ev.on(e.s, w, e.turns)
            : e.change === 'wake'
              ? c.ev.wake(w)
              : e.change === 'resist'
                ? c.ev.resist(e.s, w)
                : c.ev.off(e.s, w)
        );
        if (e.change !== 'resist')
          showStatus(e.to, e.s, e.change === 'on' ? e.turns : 0);
        refresh(acting);
        if (e.change === 'on' && !toldStatus) {
          toldStatus = true;
          await flush(b);
          await say({ who: 'glose', text: c.lines.teachStatus });
        }
        break;
      }
      case 'shield': {
        const el = spriteOf(e.to);
        if (el) await shieldFx(el, e.change);
        const w = whoOf(e.to);
        b.lines.push(
          e.change === 'on'
            ? c.ev.shieldOn(w, e.points)
            : e.change === 'break'
              ? c.ev.shieldBreak(w)
              : c.ev.shieldOff(w)
        );
        showShield(e.to, e.change === 'on' ? e.points : 0);
        refresh(acting);
        break;
      }
      case 'skip': {
        await flush(b);
        clearDeltas();
        const el = spriteOf(e.who);
        if (el) await statusFx(el, e.why, 'tick');
        b.lines.push(c.ev.skip(e.why, whoOf(e.who)));
        break;
      }
      case 'down': {
        const el = spriteOf(e.who);
        if (e.who.side === 'foe') {
          const foe = foeBy(F, e.who.uid) as Foe;
          const card = foeEl(foe.uid);
          card?.classList.add('dying');
          if (el) await downFx(el);
          showDown(e.who);
          card?.classList.remove('dying');
          b.lines.push(
            foe.kind === 'boss'
              ? chapterCopy(G.s, foe.chapter.domain).boss.fall
              : c.types[foe.kind].fall
          );
        } else {
          if (el) await downFx(el);
          b.lines.push(c.ev.down(who(e.who.key)));
        }
        refresh(acting);
        break;
      }
      case 'up': {
        showHp(e.who, e.hp);
        refresh(acting);
        const el = spriteOf(e.who);
        if (el) await upFx(el);
        b.lines.push(c.ev.up(whoOf(e.who), e.hp));
        break;
      }
      case 'reveal': {
        await flush(b);
        const foe = foeBy(F, e.uid) as Foe;
        refresh(acting);
        const el = foeArtEl(e.uid);
        if (el) await revealFx(el, e.el);
        await sayOne({
          who: e.how === 'hit' ? 'glose' : 'vigie',
          text: c.ev.reveal(foeName(foe), e.el, e.how),
          bubble: false,
        });
        break;
      }
      case 'phase': {
        await flush(b);
        const foe = foeBy(F, e.uid) as Foe;
        const el = foeArtEl(e.uid);
        refresh(acting);
        if (el) await phaseFx(el);
        $('scene').dataset.phase = String(e.phase);
        await sayOne({
          who: foe,
          text:
            chapterCopy(G.s, foe.chapter.domain).boss.phases[e.phase - 1] ?? '',
          wait: true,
          bubble: false,
        });
        break;
      }
      case 'summon': {
        const foe = foeBy(F, e.uid) as Foe;
        showUnit(foe);
        $('layer')
          .querySelector('.foes')
          ?.insertAdjacentHTML('beforeend', foeCard(foe));
        refresh(acting);
        const el = foeArtEl(e.uid);
        if (el) await walkIn(el);
        b.lines.push(c.ev.summon(foeName(foe)));
        break;
      }
      case 'fog':
        await fogFx(e.turns > 0);
        b.lines.push(e.turns > 0 ? c.ev.fog(e.turns) : c.ev.fogOff);
        refresh(acting);
        break;
      case 'tokens':
        if (e.after > e.before && b.act.startsWith('atk'))
          b.lines.push(c.ev.tokens(e.after - e.before));
        refresh(acting);
        break;
      case 'steal': {
        const victim = spriteOf({ side: 'party', key: e.from });
        const thief = b.who ? spriteOf(b.who) : null;
        if (victim && thief) await stealFx(thief, victim);
        b.lines.push(
          e.item
            ? c.ev.stealItem(b.actor, c.items[e.item].name)
            : c.ev.stealTokens(b.actor, e.tokens)
        );
        refresh(acting);
        break;
      }
      case 'miss': {
        const el = spriteOf(e.who);
        if (el) await missFx(el);
        b.lines.push(c.ev.miss);
        break;
      }
      case 'free':
        blip('free');
        b.lines.push(
          c.ev.free(sheetLabel(G.qById.get(e.sheet) as Question), e.xp)
        );
        break;
      case 'combo':
        b.lines.push(c.ev.combo(e.n));
        break;
      case 'mix':
        b.lines.push(c.ev.mix);
        break;
      case 'shift': {
        const foe = foeBy(F, e.uid) as Foe;
        const el = foeArtEl(e.uid);
        refresh(acting);
        if (el && isKnown(G.ctx, F, foe)) await revealFx(el, e.el);
        b.lines.push(c.ev.shift(foeName(foe), e.el));
        break;
      }
      case 'fizzle':
        b.lines.push(c.ev.fizzle(foeName(foeBy(F, e.uid) as Foe)));
        break;
      case 'strike':
        b.lines.push(c.ev.strike);
        break;
      case 'echo':
        b.lines.push(b.act === 'power:echo' ? c.ev.echoReady : c.ev.echo);
        break;
      case 'tune': {
        const foe = foeBy(F, e.uid) as Foe;
        const el = foeArtEl(e.uid);
        refresh(acting);
        blip(`move:${foe.chapter.domain}:refit`);
        if (el) await tuneFx(el);
        b.lines.push(c.ev.tune(foeName(foe), c.formats[e.format].name));
        break;
      }
      case 'clock': {
        const foe = foeBy(F, e.uid) as Foe;
        showStatus(foeRef(e.uid), 'clock', e.n);
        refresh(acting);
        const el = foeArtEl(e.uid);
        if (el)
          await statusFx(el, 'clock', e.change === 'tick' ? 'tick' : 'on');
        b.lines.push(c.ev.clock(foeName(foe), e.n, e.change));
        break;
      }
    }
  }
  await flush(b);
  syncShown(F, run());
  refresh(acting);
  Zone.idle();
}

/* ---------- the stage: tapping enemies and party cards ---------- */
function bindStage(): void {
  $('layer').onclick = (e) => {
    const F = G.F;
    if (!F) return;
    const target = e.target as HTMLElement;
    const tag = target.closest<HTMLElement>('.intent');
    if (tag) {
      e.stopPropagation();
      const f = foeBy(F, Number(tag.closest<HTMLElement>('.foe')?.dataset.uid));
      if (f)
        bubbleAt(
          tag,
          [intentHelp(F, run(), f), ...statusLinesOf(f)].join(' '),
          'tip'
        );
      return;
    }
    const b = target.closest<HTMLElement>('.foe');
    if (!b) return;
    const f = foeBy(F, Number(b.dataset.uid));
    if (!f || f.dead) return;
    e.stopPropagation();
    if (menuKind() !== 'formats' && menuKind() !== 'skills') {
      const sts = statusLinesOf(f);
      if (sts.length) bubbleAt(b.querySelector('.art'), sts.join(' '), 'tip');
      return;
    }
    if (shielded(F, f)) {
      bubbleAt(b.querySelector('.art'), G.c.lines.shieldSay);
      return;
    }
    pickMenu(`target:${f.uid}`);
  };
  $('status').onclick = (e) => {
    const card = (e.target as HTMLElement).closest<HTMLElement>('.pc');
    if (!card || !G.run) return;
    e.stopPropagation();
    const k = card.dataset.k as MemberKey;
    const m = memberOf(G.run, k);
    const c = G.c;
    const head = `${memberName(k)} · ${c.elements[m.el].name} · ${c.roles[MEMBERS[k].role]}`;
    const sts = statusLinesOf(m);
    bubbleAt(
      actorEl(k),
      sts.length
        ? `${head}. ${sts.join(' ')}`
        : `${head}. ${c.passives[MEMBERS[k].passive].name} : ${c.passives[MEMBERS[k].passive].text}`,
      'tip'
    );
  };
}

/* ---------- the fight loop ---------- */
export type Outcome = 'win' | 'lose' | 'flee';
let toldStatus = false;
let toldArea = false;
let toldGuard = false;

/** The default target: the enemy this member hits hardest, then the most hurt. */
function bestTarget(k: MemberKey): number {
  const F = fight();
  const m = memberOf(run(), k);
  const ts = targetable(F);
  const score = (e: Foe) => {
    const aff: Affinity = isKnown(G.ctx, F, e)
      ? affinity(m.el, e.el)
      : 'neutral';
    return (aff === 'weak' ? 1000 : aff === 'resist' ? -1000 : 0) - e.hp;
  };
  return ts.slice().sort((a, b) => score(b) - score(a))[0].uid;
}

export async function battle(): Promise<Outcome> {
  const r = run();
  const F = (G.F = makeFight(G.ctx, r));
  syncShown(F, r);
  const c = G.c;
  const cc = chapterCopy(G.s, domainOf(r.ch));
  G.screen = 'battle';
  G.sel = null;
  resetPartyBars();
  const stage = setForStep(r);
  setScene(stage.html, {
    boss: F.isBoss,
    cls: F.isBoss ? 'boss-fight' : '',
    time: stage.time,
  });
  $('scene').dataset.phase = '0';
  $('layer').innerHTML =
    `<div class="foes" data-n="1">${F.foes.map(foeCard).join('')}</div>` +
    partyHtml(F.order);
  bindStage();
  chapterChrome();
  refresh();
  $('layer')
    .querySelectorAll('.foe .art')
    .forEach((a) => void walkIn(a));
  const first = F.foes[0];
  if (F.isBoss) {
    await playCine(`boss-${r.ch}`, { inline: true });
    await say(
      { who: first, text: cc.boss.taunt, wait: true },
      { who: 'glose', text: cc.boss.mechanic, wait: true }
    );
  } else {
    await say(
      F.foes.length === 1
        ? c.lines.appearsOne(
            c.types[first.kind as keyof typeof c.types].a,
            F.elite
          )
        : c.lines.appearsMany(F.foes.map(foeName)),
      {
        who: first,
        text: first.kind === 'boss' ? '' : c.types[first.kind].taunt,
      }
    );
  }
  const save = G.host.save;
  if (!save.taught) {
    await say(
      { who: 'glose', text: c.lines.teachIntent, wait: true },
      { who: 'glose', text: c.lines.teachFormats, wait: true },
      { who: 'glose', text: c.lines.teachElements, wait: true }
    );
    save.taught = true;
    G.host.persist();
  }
  if (F.foes.some((e) => e.taunts) && F.foes.length > 1)
    await say({ who: 'glose', text: c.lines.maskWarn });
  await play(openingReveals(G.ctx, F));

  for (;;) {
    await play(roundStart(F, r));
    for (const k of F.order) {
      if (outcome(F, r)) break;
      setTurn(k);
      refresh(k);
      const t = memberTurn(G.ctx, F, r, k);
      await play(t.ev, k);
      if (t.can && !outcome(F, r)) {
        const out = await memberAction(k);
        if (out === 'flee') {
          setTurn(null);
          await say(c.lines.fled);
          return 'flee';
        }
      }
      await play(memberDone(r, k), k);
    }
    if (outcome(F, r)) break;
    setTurn('foe');
    refresh();
    for (const e of [...F.foes]) {
      if (e.dead || outcome(F, r)) continue;
      const evs = foeTurn(G.ctx, F, r, e);
      await play(evs);
      if (
        !toldArea &&
        evs.some(
          (x) =>
            x.k === 'act' &&
            x.act.startsWith('move:') &&
            MOVES[x.act.split(':')[2] as keyof typeof MOVES]?.reach === 'all'
        )
      ) {
        toldArea = true;
        await say({ who: 'glose', text: c.lines.teachArea });
      }
    }
    if (outcome(F, r)) break;
    await play(roundEnd(G.ctx, F, r));
    if (
      !toldGuard &&
      alive(F).some((e) => !isDark(e) && e.intent?.move === 'big')
    ) {
      toldGuard = true;
      await say({ who: 'glose', text: c.lines.guardTip });
    }
  }
  setTurn(null);
  clearStills();
  return outcome(F, r) === 'win' ? 'win' : 'lose';
}

/* ---------- a member's turn ---------- */
/** A menu that has been answered leaves the zone while its action plays. */
function menuDone(): void {
  Zone.go();
  Zone.idle();
}

function formatItems(k: MemberKey, target: Foe) {
  const F = fight();
  const c = G.c;
  return FORMAT_KEYS.map((f) => {
    const p = preview(G.ctx, F, run(), k, { format: f }, target.uid);
    const tag =
      p.aff === null
        ? `<span class="tag unk">${esc(c.card.unknown)}</span>`
        : p.aff === 'neutral'
          ? ''
          : `<span class="tag ${p.aff}">${esc(c.card.short[p.aff])}</span>`;
    const tuned = tunedTo(target) === f;
    return {
      k: f,
      cls: `fmt${p.aff ? ` aff-${p.aff}` : ''}${tuned ? ' tuned' : ''}`,
      dis: formatBlocked(F, f),
      why: c.blocked.fog,
      html: `<span class="fn">${esc(c.formats[f].name)}</span><span class="d">${esc(c.formats[f].options)}</span><span class="fig"><span class="big">${esc(c.card.dmg(p.hits[0]?.d ?? 0))}</span>${tag}${tuned ? `<span class="tag tuned" title="${esc(c.status.tuned(c.formats[f].name))}">${esc(c.status.tunedShort)}</span>` : ''}</span>`,
    };
  });
}

async function memberAction(k: MemberKey): Promise<'acted' | 'flee'> {
  const F = fight();
  const r = run();
  const c = G.c;
  const m = memberOf(r, k);
  for (;;) {
    setTurn(k);
    const ts = targetable(F);
    if (!ts.some((e) => e.uid === G.sel)) G.sel = bestTarget(k);
    const target = foeBy(F, G.sel as number) as Foe;
    const known = isKnown(G.ctx, F, target);
    const aff = known ? affinity(m.el, target.el) : null;
    showLine(
      `${c.lines.aim(esc(foeName(target)), ts.length > 1)}${aff && aff !== 'neutral' ? ` <b class="affline ${aff}">${esc(c.ev.aff(aff, m.el))}</b>` : ''}`,
      k
    );
    const pending = choose({
      kind: 'formats',
      step: c.labels.pickFormat,
      label: `${memberName(k)} · ${c.elements[m.el].name}`,
      labelIcon: elIcon(m.el),
      layout: 'c3',
      items: formatItems(k, target),
      secondary: [
        {
          k: 'skills',
          html: `${icon24('skills')}${esc(c.actions.skills)}`,
          dis: !!m.st.silence,
          why: c.blocked.silence,
        },
        { k: 'glose', html: `${icon24('glose')}${esc(c.actions.glose)}` },
        { k: 'guard', html: `${icon24('garde')}${esc(c.actions.guard)}` },
        {
          k: 'bag',
          html: `${icon24('sac')}${esc(c.actions.bag(r.items.length))}`,
          dis: !r.items.length,
          why: c.lines.bagEmpty,
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
    refresh(k);
    const pick = await pending;
    refresh(k);
    if (pick.startsWith('target:')) {
      G.sel = Number(pick.slice(7));
      continue;
    }
    if ((FORMAT_KEYS as readonly string[]).includes(pick)) {
      const f = pick as FormatKey;
      const res = await question(k, target, f);
      if (res === 'back') continue;
      setStep(null);
      await play(
        act(
          G.ctx,
          F,
          r,
          k,
          { kind: 'attack', format: f, target: target.uid },
          res
        ),
        k
      );
      G.host.refresh();
      return 'acted';
    }
    if (pick === 'skills') {
      const done = await skillMenu(k, target);
      if (done) return 'acted';
      continue;
    }
    if (pick === 'glose') {
      await gloseMenu(k);
      continue;
    }
    if (pick === 'bag') {
      await bagMenu(k);
      continue;
    }
    if (pick === 'guard') {
      menuDone();
      await play(act(G.ctx, F, r, k, { kind: 'guard' }), k);
      return 'acted';
    }
    if (pick === 'flee') {
      const yes = await choose({
        kind: 'confirm',
        label: c.labels.fleeAsk,
        layout: 'c2',
        items: [
          { k: 'yes', label: c.labels.fleeYes },
          { k: 'no', label: c.labels.fleeNo, back: true },
        ],
      });
      if (yes === 'yes') return 'flee';
    }
  }
}

/** One line of what a skill will do, read before choosing it. */
function skillFigure(k: MemberKey, s: SkillKey, target: Foe): string {
  const F = fight();
  const r = run();
  const c = G.c;
  const S = SKILLS[s];
  if (S.format) {
    const p = preview(
      G.ctx,
      F,
      r,
      k,
      { format: S.format, skill: s },
      target.uid
    );
    const d = p.hits[0]?.d ?? 0;
    const fig = S.hits ? c.card.hits(d, S.hits) : c.card.dmg(d);
    const aff =
      p.aff === null
        ? ` ${c.card.unknown}`
        : p.aff !== 'neutral'
          ? ` ${c.card.aff[p.aff]}`
          : '';
    return `${c.formats[S.format].options} · ${fig}${S.target === 'foes' ? ` ${c.card.all}` : aff}`;
  }
  const t = skillTarget(F, r, k, s);
  if (S.revive) return t ? c.card.revive(memberName(t.key)) : '';
  if (S.heal && t)
    return c.card.heal(
      Math.min(t.max - t.hp, Math.round(t.max * S.heal)),
      memberName(t.key)
    );
  if (S.heal && S.target === 'party')
    return c.card.healAll(Math.round(S.heal * 100));
  if (S.shield && t)
    return c.card.shield(
      Math.round(memberOf(r, k).max * S.shield),
      memberName(t.key)
    );
  if (S.status)
    return `${c.statuses[S.status[0]].name} · ${c.status.turns(S.status[1])}`;
  return '';
}

async function skillMenu(k: MemberKey, target: Foe): Promise<boolean> {
  const F = fight();
  const r = run();
  const c = G.c;
  const skills = MEMBERS[k].skills;
  const why = (s: SkillKey) => {
    const b = skillBlock(F, r, k, s);
    return b === 'tokens'
      ? c.blocked.tokens(SKILLS[s].cost)
      : b
        ? c.blocked[b]
        : '';
  };
  const pick = await choose({
    kind: 'skills',
    label: c.labels.skillsOf(memberName(k)),
    back: true,
    grow: true,
    layout: 'list',
    items: skills.map((s) => ({
      k: s,
      cls: `skill${SKILLS[s].format ? ' off' : ''}`,
      dis: !!skillBlock(F, r, k, s),
      why: why(s),
      html: `<span class="sn">${esc(c.skills[s].name)}<span class="c">${icon24('token')}${SKILLS[s].cost}</span></span><span class="fig">${esc(skillFigure(k, s, target))}</span><span class="d">${esc(c.skills[s].text)}</span>`,
    })),
  });
  if (pick === 'back') return false;
  const s = pick as SkillKey;
  const S = SKILLS[s];
  if (!S.format) {
    menuDone();
    await play(
      act(G.ctx, F, r, k, { kind: 'skill', skill: s, target: target.uid }),
      k
    );
    return true;
  }
  const res = await question(k, target, S.format, c.skills[s].name);
  if (res === 'back') return false;
  setStep(null);
  await play(
    act(G.ctx, F, r, k, { kind: 'skill', skill: s, target: target.uid }, res),
    k
  );
  G.host.refresh();
  return true;
}

async function gloseMenu(k: MemberKey): Promise<void> {
  const F = fight();
  const r = run();
  const c = G.c;
  const why = (p: PowerKey) => {
    const b = powerBlock(F, r, p);
    return b === 'tokens'
      ? c.blocked.tokens(POWER_COST[p])
      : b
        ? c.blocked[b]
        : '';
  };
  const pick = await choose({
    kind: 'glose',
    label: c.labels.powers,
    back: true,
    grow: true,
    layout: 'list',
    items: POWER_KEYS.map((p) => ({
      k: p,
      html: `${esc(c.powers[p].name)} <span class="c">${icon24('token')}${POWER_COST[p]}</span><span class="d">${esc(c.powers[p].text)}</span>`,
      dis: !!powerBlock(F, r, p),
      why: why(p),
    })),
  });
  if (pick === 'back') return;
  menuDone();
  await play(usePower(F, r, pick as PowerKey), k);
}

async function bagMenu(k: MemberKey): Promise<void> {
  const F = fight();
  const r = run();
  const c = G.c;
  const kinds = ITEM_KEYS.filter((x) => r.items.includes(x));
  const pick = await choose({
    kind: 'bag',
    label: c.labels.bag,
    back: true,
    grow: true,
    layout: 'list',
    items: kinds.map((key) => {
      const b = itemBlock(F, r, key);
      const t = itemTarget(F, r, key);
      return {
        k: key,
        html: `${esc(c.items[key].name)} <span class="c">×${r.items.filter((x) => x === key).length}</span><span class="d">${esc(c.items[key].text)}${t ? ` → ${esc(memberName(t.key))}` : ''}</span>`,
        dis: !!b,
        why: b === 'tokens' ? '' : b ? c.blocked[b] : '',
      };
    }),
  });
  if (pick === 'back') return;
  menuDone();
  await play(useItem(F, r, pick as ItemKey), k);
}

/* ---------- the question ---------- */
interface Asked {
  q: Question;
  draw: Draw;
  /** Positions in the draw struck out by a hint or an eraser. */
  removed: Set<number>;
  /** A smudged word on one wrong option, while Smudge lasts. */
  ink: { pos: number; html: string } | null;
}
function inkOption(a: Asked): Asked['ink'] {
  const wrong = a.draw.order
    .map((_, i) => i)
    .filter((i) => i !== a.draw.correct && !a.removed.has(i));
  if (!wrong.length) return null;
  const pos = pickOne(wrong, G.rng);
  const t = a.q.options[a.draw.order[pos]];
  const words = [...t.matchAll(/[A-Za-zÀ-ÖØ-öø-ÿœŒ’'-]{5,}/g)];
  if (!words.length) return null;
  const m = pickOne(words, G.rng);
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
  a.removed.add(pickOne(pool, G.rng));
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

async function question(
  k: MemberKey,
  e: Foe,
  f: FormatKey,
  skillName = ''
): Promise<{ sheet: string; right: boolean } | 'back'> {
  const F = fight();
  const r = run();
  const sheet = nextSheet(G.ctx, F, r);
  const q = G.qById.get(sheet) as Question;
  const a: Asked = {
    q,
    draw: drawOptions(q, FORMATS[f].options, G.rng),
    removed: new Set(),
    ink: null,
  };
  if (memberOf(r, k).st.smudge) a.ink = inkOption(a);
  let struck = 0;
  while (F.strike > 0 && strikeOne(a)) {
    F.strike--;
    struck++;
  }
  refresh(k);
  showLine(
    `<span class="lvl">${esc(skillName || G.c.formats[f].name)}</span>${esc(q.stem)}`,
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
  /* the enemy is named in the question box, which it asks */
  const label = `${memberName(k)} · ${G.c.formats[f].options}`;
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
    await beat(1600);
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
    F.strike += struck;
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
  await beat(250);
  await explain(q, right);
  showLine(
    `<b class="verdict ${right ? 'ok' : 'ko'}">${esc(right ? G.c.lines.verdictRight : G.c.lines.verdictWrong)}</b>`,
    'glose'
  );
  Zone.go();
  Zone.idle();
  return { sheet, right };
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
