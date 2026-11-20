/**
 * Behaviour of the office pages in the browser: navigation chrome, reading aids,
 * the library's sage, questions to the agent, and the passage into the 3D world.
 * Pages are complete without it; this only adds what needs a click.
 */
import { toggleTheme } from '@/lib/theme';
import { parseSSE, SSE_EVENT } from '@/lib/avatar/protocol';
import { takeFrames } from '@/lib/sse-frames';
import { SECTION_PATHS } from '@/office/sections';

interface Strings {
  left: string;
  done: string;
  size: string;
  noMatch: string;
  loading3d: string;
  outOfTokens: string[];
  sage: {
    quips: string[];
    shake: string;
    unknown: string;
    readOne: string;
    readMany: string;
    related: string;
    citedIn: string;
    trail: string;
    seeRelated: string;
    themes: Record<string, string>;
  };
}
interface Word {
  id: string;
  label: string;
  def: string;
  theme: string;
  related: string[];
  aliases: string[];
  cited: { title: string; href: string }[];
}
interface ReadingData {
  citations: { n: string; label: string; url: string; excerpt: string }[];
  terms: { id: string; term: string; def: string }[];
}
interface World {
  enter(place: string, done: () => void): void;
  leave(done: () => void): string;
  stop(): void;
}
interface AskOptions {
  q: string;
  persona?: string;
  scopeSlug?: string;
  /** Said in place of the agent's own line when it finds nothing in the texts. */
  idk?: string;
  onText?: (text: string) => void;
}
declare global {
  interface Window {
    __WORLD?: unknown;
    __boot3D?: () => void;
    __w3on?: boolean;
    __w3warm?: number;
    __frozen?: boolean;
    World?: World;
    Shell?: {
      to3D(): void;
      to2D(): void;
      ask(o: AskOptions): Promise<string>;
    };
  }
}

const READ_MIN = 14;
const READ_MAX = 26;
const READ_STEP = 2;
const READ_KEY = 'rc-read';
const WORDS_PER_MINUTE = 220;
const PHONE = matchMedia('(max-width: 640px)');
const WORLD_VENDOR = [
  'three.min.js',
  'CopyShader.js',
  'LuminosityHighPassShader.js',
  'FXAAShader.js',
  'EffectComposer.js',
  'RenderPass.js',
  'ShaderPass.js',
  'UnrealBloomPass.js',
];
/** Address of each stand of the world, relative to the locale. */
const PLACE_PATH: Record<string, string> = { home: '', ...SECTION_PATHS };

const root = document.documentElement;
const site = document.getElementById('site2d') as HTMLElement;
const $ = <T extends HTMLElement>(id: string) =>
  document.getElementById(id) as T | null;
const s2 = () => document.getElementById('s2') as HTMLElement;
const esc = (s: string) =>
  s.replace(
    /[&<>"]/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c] ?? c
  );
const pick = <T>(list: T[]): T => list[Math.floor(Math.random() * list.length)];
const fill = (template: string, value: string | number) =>
  template.replace(/\{[nq]\}/, String(value));
const plain = (s: string) =>
  s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

function json<T>(id: string): T | null {
  const el = document.getElementById(id);
  if (!el?.textContent) return null;
  return JSON.parse(el.textContent) as T;
}

let T: Strings;
let words: Word[] = [];
let wordById = new Map<string, Word>();
let reading: ReadingData = { citations: [], terms: [] };
const learned: string[] = [];
let trail: string[] = [];
let askCount = 0;
let lastY = 0;

function toast(message: string): void {
  const el = $('toast');
  if (!el) return;
  el.textContent = message;
  el.hidden = false;
  window.setTimeout(() => (el.hidden = true), 2200);
}

/* ---------------------------------------------------------------- chrome */

const LAMP_MS = 620;

/** Switches day and night; the new theme spreads from where the visitor pressed. */
function flipLamp(e: MouseEvent): void {
  const root = document.documentElement;
  const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!document.startViewTransition || still) return void toggleTheme();
  const x = e.clientX || window.innerWidth / 2;
  const y = e.clientY || 0;
  const reach = Math.hypot(
    Math.max(x, window.innerWidth - x),
    Math.max(y, window.innerHeight - y)
  );
  root.style.setProperty('--lamp-x', `${x}px`);
  root.style.setProperty('--lamp-y', `${y}px`);
  root.style.setProperty('--lamp-r', `${reach}px`);
  root.style.setProperty('--lamp-ms', `${LAMP_MS}ms`);
  root.classList.add('lamping');
  const done = () => root.classList.remove('lamping');
  document
    .startViewTransition(() => void toggleTheme())
    .finished.then(done, done);
}

function menu(open: boolean): void {
  const sheet = $('msheet');
  const scrim = $('scrim');
  if (!sheet || !scrim) return;
  sheet.hidden = scrim.hidden = !open;
  $('more')?.setAttribute('aria-expanded', String(open));
  if (open) showRead();
}

function placeRunner(): void {
  const floor = $('floor');
  if (!floor) return;
  const tabs = Array.from(document.querySelectorAll('#tabs a'));
  const i = tabs.findIndex((a) => a.getAttribute('aria-current') === 'page');
  const w = innerWidth / Math.max(1, tabs.length);
  floor.style.setProperty('--tx', i < 0 ? '-70px' : `${w * i + w / 2 - 19}px`);
}

function liveRoom(): void {
  const pano = $('pano');
  const strip = pano?.querySelector<HTMLElement>('.strip');
  if (!pano || !strip || !PHONE.matches) return;
  const rooms = pano.querySelectorAll('.rm');
  const idx = Math.max(
    0,
    Math.min(
      rooms.length - 1,
      Math.round(pano.scrollLeft / (strip.offsetWidth / rooms.length))
    )
  );
  rooms.forEach((room, n) => {
    room.classList.toggle('on', n === idx);
    room.classList.toggle('off', n !== idx);
  });
  pano.querySelectorAll('.dots i').forEach((dot, n) => {
    dot.classList.toggle('on', n === idx);
  });
  const links = Array.from(pano.querySelectorAll('svg a'));
  const href = links[idx]?.getAttribute('href');
  if (standShown === null && idx === 0) {
    for (const a of links) void standPage(a.getAttribute('href') ?? '');
    return;
  }
  if (href) void showStand(href, idx >= standIdx ? 1 : -1, idx);
}

/** Address of the stand whose texts are under the frieze; null on arrival. */
let standShown: string | null = null;
let standIdx = 0;
/** Section pages already asked for, so a swipe never waits on the network twice. */
const standPages = new Map<string, Promise<string>>();
const STAND_OUT_MS = 170;
const STAND_STAGGER_MAX = 6;

function standPage(href: string): Promise<string> {
  let page = standPages.get(href);
  if (!page) {
    page = fetch(href).then((r) => r.text());
    page.catch(() => standPages.delete(href));
    standPages.set(href, page);
  }
  return page;
}

/**
 * On a phone the frieze is swiped one stand at a time: the stand in view becomes
 * the selected section. What is under the frieze leaves the way the frieze went,
 * and the texts of the new stand come in from the other side, one after another.
 */
async function showStand(
  href: string,
  dir: 1 | -1,
  idx: number
): Promise<void> {
  if (href === standShown) return;
  standShown = href;
  standIdx = idx;
  document.querySelectorAll('#tabs a').forEach((a) => {
    if (a.getAttribute('href') === href) a.setAttribute('aria-current', 'page');
    else a.removeAttribute('aria-current');
  });
  placeRunner();
  const pano = $('pano');
  const main = $('main');
  if (!pano || !main) return;
  main.style.setProperty('--dir', String(dir));
  const old = Array.from(main.querySelectorAll<HTMLElement>(':scope > .wrap'));
  old.forEach((el) => {
    el.classList.remove('arrive');
    el.classList.add('leaving');
  });
  try {
    const [html] = await Promise.all([
      standPage(href),
      new Promise((done) => window.setTimeout(done, STAND_OUT_MS)),
    ]);
    if (standShown !== href) return;
    const next = new DOMParser()
      .parseFromString(html, 'text/html')
      .getElementById('main');
    if (!next) throw new Error('page');
    next
      .querySelectorAll('.room, [data-page-only]')
      .forEach((el) => el.remove());
    const fresh = document.createDocumentFragment();
    for (const node of Array.from(next.childNodes))
      fresh.append(document.importNode(node, true));
    for (const wrap of Array.from(fresh.children)) {
      if (!wrap.classList.contains('wrap')) continue;
      wrap.classList.add('arrive');
      Array.from(wrap.children).forEach((child, n) =>
        (child as HTMLElement).style.setProperty(
          '--i',
          String(Math.min(n, STAND_STAGGER_MAX))
        )
      );
    }
    while (pano.nextSibling) pano.nextSibling.remove();
    pano.after(fresh);
    words = json<Word[]>('words') ?? [];
    wordById = new Map(words.map((w) => [w.id, w]));
  } catch {
    old.forEach((el) => el.classList.remove('leaving'));
  }
}

/* --------------------------------------------------------------- reading */

function readSize(): number {
  return parseFloat(getComputedStyle(root).getPropertyValue('--read')) || 18;
}

function showRead(): void {
  const el = $('mRead');
  if (el) el.textContent = `${T.size} ${Math.round(readSize())}`;
}

function setRead(direction: number): void {
  const v = Math.max(
    READ_MIN,
    Math.min(READ_MAX, readSize() + direction * READ_STEP)
  );
  root.style.setProperty('--read', `${v}px`);
  try {
    localStorage.setItem(READ_KEY, String(v));
  } catch {
    /* private mode: the size simply is not remembered */
  }
  showRead();
  progress();
}

function progress(): void {
  const host = s2();
  if (host.dataset.reading !== '1' || window.__frozen) return;
  const sheet = host.querySelector<HTMLElement>('.sheet.text');
  if (!sheet) return;
  const r = sheet.getBoundingClientRect();
  const span = Math.max(1, r.height - innerHeight * 0.6);
  const p = Math.max(0, Math.min(1, -r.top / span));
  root.style.setProperty('--p', p.toFixed(4));
  const left = $('left');
  const total = Number(host.dataset.words) || 0;
  if (left)
    left.textContent =
      p >= 0.995
        ? T.done
        : fill(T.left, Math.ceil((total * (1 - p)) / WORDS_PER_MINUTE));
  const heads = Array.from(host.querySelectorAll('#prose h2'));
  let current = -1;
  heads.forEach((h, i) => {
    if (h.getBoundingClientRect().top < 140) current = i;
  });
  host
    .querySelectorAll('#toc a')
    .forEach((a, i) => a.classList.toggle('on', i === current));
}

function buildToc(): void {
  const toc = $('toc');
  if (!toc) return;
  s2()
    .querySelectorAll<HTMLElement>('#prose h2')
    .forEach((h, i) => {
      if (!h.id) h.id = `part-${i + 1}`;
      const a = document.createElement('a');
      a.href = `#${h.id}`;
      a.textContent = h.textContent;
      toc.appendChild(a);
    });
}

function closeNotes(): void {
  s2()
    .querySelectorAll('.note')
    .forEach((n) => n.remove());
  s2()
    .querySelectorAll('.rc-cite.on, .term.on')
    .forEach((a) => a.classList.remove('on'));
}

function openNote(anchor: HTMLElement, html: string, kind = ''): void {
  const sheet = anchor.closest<HTMLElement>('.sheet');
  if (!sheet) return;
  const note = document.createElement('div');
  note.className = `note ${kind}`;
  note.innerHTML = html;
  sheet.appendChild(note);
  const a = anchor.getBoundingClientRect();
  const b = sheet.getBoundingClientRect();
  note.style.top = `${a.bottom - b.top + 8}px`;
  note.style.left = `${Math.max(12, Math.min(a.left - b.left - 20, b.width - note.offsetWidth - 12))}px`;
  anchor.classList.add('on');
}

function openCitation(ref: HTMLElement): void {
  const n = ref.dataset.cite ?? '';
  const c = reading.citations.find((x) => x.n === n);
  if (c) {
    openNote(
      ref,
      `<q>${esc(c.excerpt)}</q><a href="${esc(c.url)}">${esc(c.label)}</a>`
    );
    return;
  }
  const source = document.querySelector(`#source-${n} a`);
  if (source instanceof HTMLAnchorElement)
    openNote(
      ref,
      `<a href="${esc(source.href)}">${esc(source.textContent ?? '')}</a>`
    );
}

/** Underline, once each, the words the sage can define. */
function linkTerms(): void {
  const prose = $('prose');
  if (!prose || !reading.terms.length) return;
  const terms = reading.terms
    .filter((t) => t.term.length >= 6)
    .sort((a, b) => b.term.length - a.term.length);
  const used = new Set<string>();
  const walker = document.createTreeWalker(prose, NodeFilter.SHOW_TEXT, {
    acceptNode: (n) =>
      n.parentElement?.closest('a, code, pre, h2, h3, table, button')
        ? NodeFilter.FILTER_REJECT
        : NodeFilter.FILTER_ACCEPT,
  });
  const nodes: Text[] = [];
  while (walker.nextNode()) nodes.push(walker.currentNode as Text);
  for (const node of nodes) {
    const low = node.data.toLowerCase();
    for (const t of terms) {
      if (used.has(t.id)) continue;
      const needle = t.term.toLowerCase();
      const at = low.indexOf(needle);
      if (at < 0) continue;
      const before = low[at - 1];
      const after = low[at + needle.length];
      const letter = /[a-zà-ÿ0-9]/;
      if (
        (before && letter.test(before)) ||
        (after && letter.test(after) && after !== 's')
      )
        continue;
      const mid = node.splitText(at);
      mid.splitText(needle.length);
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'term';
      b.dataset.term = t.id;
      b.textContent = mid.data;
      mid.replaceWith(b);
      used.add(t.id);
      break;
    }
  }
}

/* ------------------------------------------------------------------ lists */

function filterList(): void {
  const list = $('list');
  if (!list) return;
  const q = plain($<HTMLInputElement>('q')?.value.trim() ?? '');
  const kind =
    s2()
      .querySelector('.tools button[aria-pressed="true"]')
      ?.getAttribute('data-k') ?? '';
  let shown = 0;
  list.querySelectorAll<HTMLElement>('.mgroup').forEach((group) => {
    let any = false;
    group.querySelectorAll<HTMLElement>('li').forEach((li) => {
      const ok =
        (!q || plain(li.dataset.q ?? '').includes(q)) &&
        (!kind || li.dataset.k === kind || li.dataset.s === kind);
      li.hidden = !ok;
      if (ok) any = true;
    });
    group.hidden = !any;
    if (any) shown++;
  });
  const empty = $('empty');
  if (empty) empty.hidden = shown > 0;
}

/* ------------------------------------------------------------------- sage */

function findWords(query: string): Word[] {
  const q = plain(query.trim());
  if (!q) return [];
  return words
    .filter(
      (w) =>
        plain(w.label).includes(q) ||
        w.aliases.some((a) => plain(a).includes(q))
    )
    .sort(
      (a, b) =>
        Number(!plain(a.label).startsWith(q)) -
          Number(!plain(b.label).startsWith(q)) ||
        a.label.length - b.label.length
    );
}

function showWord(w: Word, quip?: string): void {
  const box = $('scrollBox');
  const glose = $('glose');
  if (!box || !glose) return;
  if (!learned.includes(w.id)) learned.push(w.id);
  trail = [...trail.filter((id) => id !== w.id), w.id].slice(-6);
  const says = $('says');
  if (says) says.textContent = quip ?? pick(T.sage.quips);
  glose.style.setProperty(
    '--beard',
    String(Math.min(1.9, 1 + learned.length * 0.08))
  );
  glose.classList.remove('stroke');
  void glose.offsetWidth;
  glose.classList.add('stroke');
  const count = $('beardCount');
  if (count)
    count.textContent = fill(
      learned.length > 1 ? T.sage.readMany : T.sage.readOne,
      learned.length
    );
  const related = w.related
    .map((id) => wordById.get(id))
    .filter((x): x is Word => x !== undefined);
  const strands = related.length
    ? `<div class="lbl">${esc(T.sage.related)}</div><div class="strands">${related
        .map(
          (r, i) =>
            `<a href="#word-${r.id}" data-c="${r.id}" style="--len:${12 + ((i * 7) % 3) * 13}px">${esc(r.label)}<small>+${r.related.length}</small></a>`
        )
        .join('')}</div>`
    : '';
  const cited = w.cited.length
    ? `<div class="lbl">${esc(T.sage.citedIn)}</div><div class="cited">${w.cited
        .map((c) => `<a href="${esc(c.href)}">${esc(c.title)}</a>`)
        .join('')}</div>`
    : '';
  const path =
    trail.length > 1
      ? `<div class="thread"><span class="mono">${esc(T.sage.trail)}</span>${trail
          .slice(0, -1)
          .map(
            (id) =>
              `<button type="button" data-c="${id}">${esc(wordById.get(id)?.label ?? '')}</button>`
          )
          .join('')}</div>`
      : '';
  box.innerHTML = `<div class="scroll"><span class="chip" style="--c:var(--radar)">${esc(T.sage.themes[w.theme] ?? w.theme)}</span><h3>${esc(w.label)}</h3><p>${esc(w.def)}</p>${strands}${cited}${path}</div>`;
  const hints = $('hints');
  if (hints) hints.innerHTML = '';
}

function askSage(query: string): void {
  const hit = findWords(query)[0];
  if (hit) showWord(hit);
  else if (words.length)
    showWord(pick(words), fill(T.sage.unknown, query.trim()));
}

/* ------------------------------------------------------------------ agent */

async function ask(o: AskOptions): Promise<string> {
  const res = await fetch('/api/avatar/query', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      query: o.q,
      lang: s2().dataset.lang,
      scopeSlug: o.scopeSlug,
      persona: o.persona,
    }),
  });
  if (!res.ok || !res.body) throw new Error('unavailable');
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let text = '';
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    const taken = takeFrames(buffer + decoder.decode(value, { stream: true }));
    buffer = taken.rest;
    for (const frame of taken.frames)
      for (const ev of parseSSE(frame)) {
        const data = ev.data as { text?: string; message?: string } | null;
        if (ev.event === SSE_EVENT.token && data?.text) {
          text += data.text;
          o.onText?.(text);
        } else if (ev.event === SSE_EVENT.idk && data?.message) {
          text = o.idk ?? data.message;
          o.onText?.(text);
        } else if (ev.event === SSE_EVENT.error) throw new Error('stream');
      }
  }
  if (!text) throw new Error('empty');
  return text;
}

function askHere(question: string): void {
  const q = question.trim();
  const log = $('log');
  const box = s2().querySelector<HTMLElement>('.ask');
  if (!q || !log || !box) return;
  const me = document.createElement('p');
  me.className = 'me';
  me.textContent = q;
  const answer = document.createElement('p');
  answer.className = 'cl';
  answer.textContent = '…';
  log.append(me, answer);
  // Naming the text keeps a general question ("sum it up") on this text's passages.
  const title = s2().querySelector('.sheet.text h1')?.textContent ?? '';
  ask({
    q: title ? `${q} (${title})` : q,
    persona: box.dataset.persona,
    scopeSlug: box.dataset.slug,
    onText: (t) => (answer.textContent = t),
  }).then(
    (t) => (answer.textContent = t),
    () => {
      askCount++;
      answer.textContent =
        T.outOfTokens[Math.min(askCount, T.outOfTokens.length) - 1];
    }
  );
}

/* ------------------------------------------------------------------ world */

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const el = document.createElement('script');
    el.src = src;
    el.onload = () => resolve();
    el.onerror = () => reject(new Error(src));
    document.head.appendChild(el);
  });
}

let worldReady: Promise<void> | null = null;

function loadWorld(): Promise<void> {
  if (worldReady) return worldReady;
  worldReady = (async () => {
    const lang = s2().dataset.lang ?? 'fr';
    const css = document.createElement('link');
    css.rel = 'stylesheet';
    css.href = '/world/world.css';
    document.head.appendChild(css);
    const [html, data] = await Promise.all([
      fetch('/world/world.html').then((r) => r.text()),
      fetch(`/world/data.${lang}.json`).then((r) => r.json()),
    ]);
    const mount = document.getElementById('w3') as HTMLElement;
    mount.innerHTML = html;
    window.__WORLD = data;
    for (const file of WORLD_VENDOR) await loadScript(`/world/vendor/${file}`);
    await loadScript('/world/world.js');
    window.__w3warm = 4;
    window.__boot3D?.();
  })();
  worldReady.catch(() => (worldReady = null));
  return worldReady;
}

let busy = false;

function freeze(): void {
  const y = window.scrollY;
  window.__frozen = true;
  site.style.height = `${window.innerHeight}px`;
  site.style.overflow = 'hidden';
  site.scrollTop = y;
  window.scrollTo(0, 0);
}

function thaw(): void {
  site.style.height = '';
  site.style.overflow = '';
  window.__frozen = false;
  window.scrollTo(0, 0);
  s2().classList.remove('scrolled');
}

async function to3D(): Promise<void> {
  if (busy) return;
  busy = true;
  const door = $('door');
  door?.setAttribute('aria-busy', 'true');
  if (!window.World) toast(T.loading3d);
  try {
    await loadWorld();
  } catch {
    busy = false;
    door?.removeAttribute('aria-busy');
    return;
  }
  door?.removeAttribute('aria-busy');
  menu(false);
  freeze();
  root.classList.add('w3show', 'cine');
  window.__w3on = true;
  window.World?.enter(s2().dataset.place ?? 'home', () => {
    root.classList.remove('cine');
    busy = false;
  });
  site.classList.add('away');
  window.setTimeout(() => root.classList.add('in3d'), 760);
}

/** Swap the page for another one of the site without leaving the document. */
async function swapPage(url: string): Promise<void> {
  if (new URL(url, location.href).pathname === location.pathname) return;
  const html = await fetch(url).then((r) => r.text());
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const next = doc.getElementById('s2');
  if (!next) throw new Error('page');
  s2().replaceWith(document.importNode(next, true));
  document.title = doc.title;
  root.lang = doc.documentElement.lang;
  history.pushState({}, '', url);
  mount();
}

function to2D(): void {
  if (busy || !root.classList.contains('in3d') || !window.World) return;
  busy = true;
  root.classList.add('cine');
  const place = window.World.leave(() => {
    const lang = s2().dataset.lang ?? 'fr';
    const target = `/${lang}/${PLACE_PATH[place] ?? ''}`;
    const land = () => {
      site.scrollTop = 0;
      root.classList.remove('in3d');
      site.classList.add('back');
      void site.offsetWidth;
      site.classList.remove('away');
      window.setTimeout(() => {
        window.World?.stop();
        window.__w3on = false;
        root.classList.remove('w3show', 'cine');
        site.classList.remove('back');
        thaw();
        busy = false;
      }, 760);
    };
    const keep = s2().dataset.place === place;
    (keep ? Promise.resolve() : swapPage(target)).then(land, () =>
      location.assign(target)
    );
  });
}

/* ---------------------------------------------------------------- wiring */

/** Read the page that is in the document and set up what depends on it. */
function mount(): void {
  T = json<Strings>('office-strings') as Strings;
  words = json<Word[]>('words') ?? [];
  wordById = new Map(words.map((w) => [w.id, w]));
  reading = json<ReadingData>('reading-data') ?? { citations: [], terms: [] };
  askCount = 0;
  standShown = null;
  standIdx = 0;
  placeRunner();
  buildToc();
  linkTerms();
  progress();
  const pano = $('pano');
  if (pano) {
    let queued = false;
    pano.addEventListener(
      'scroll',
      () => {
        if (queued) return;
        queued = true;
        requestAnimationFrame(() => {
          queued = false;
          liveRoom();
        });
      },
      { passive: true }
    );
    window.setTimeout(liveRoom, 300);
  }
  const wanted = location.hash.startsWith('#word-')
    ? wordById.get(location.hash.slice(6))
    : undefined;
  if (wanted) showWord(wanted);
}

function onClick(e: MouseEvent): void {
  const t = e.target as HTMLElement;
  if (!t.closest) return;
  const cite = t.closest<HTMLElement>('a.rc-cite');
  if (cite) {
    e.preventDefault();
    const was = cite.classList.contains('on');
    closeNotes();
    if (!was) openCitation(cite);
    return;
  }
  const term = t.closest<HTMLElement>('.term');
  if (term) {
    const was = term.classList.contains('on');
    closeNotes();
    const found = reading.terms.find((x) => x.id === term.dataset.term);
    if (!was && found) {
      const lang = s2().dataset.lang ?? 'fr';
      openNote(
        term,
        `<div><b>${esc(found.term)}</b>${esc(found.def)}<a href="/${lang}/library/#word-${found.id}">${esc(T.sage.seeRelated)}</a></div>`,
        'gl'
      );
    }
    return;
  }
  if (!t.closest('.note')) closeNotes();
  if (t.closest('#door')) return void to3D();
  if (t.closest('#lamp')) return flipLamp(e);
  if (t.closest('#more')) return menu($('msheet')?.hidden !== false);
  if (t.id === 'scrim') return menu(false);
  const act = t.closest<HTMLElement>('[data-act]')?.dataset.act;
  if (act === 'smaller') return setRead(-1);
  if (act === 'bigger') return setRead(1);
  if (act === 'lamp') return flipLamp(e);
  const word = t.closest<HTMLElement>('[data-c]');
  if (word && $('scrollBox')) {
    e.preventDefault();
    const w = wordById.get(word.dataset.c ?? '');
    if (w) showWord(w);
    return;
  }
  if (t.id === 'sageRandom' && words.length)
    return showWord(pick(words), T.sage.shake);
  const theme = t.closest<HTMLElement>('#themes button');
  if (theme) {
    const on = theme.getAttribute('aria-pressed') === 'true';
    document
      .querySelectorAll('#themes button')
      .forEach((b) => b.setAttribute('aria-pressed', 'false'));
    theme.setAttribute('aria-pressed', String(!on));
    const hints = $('hints');
    if (hints)
      hints.innerHTML = on
        ? ''
        : words
            .filter((w) => w.theme === theme.dataset.t)
            .slice(0, 40)
            .map(
              (w) =>
                `<button type="button" data-c="${w.id}">${esc(w.label)}</button>`
            )
            .join('');
    return;
  }
  const kind = t.closest<HTMLElement>('.tools button');
  if (kind) {
    const on = kind.getAttribute('aria-pressed') === 'true';
    document
      .querySelectorAll('.tools button')
      .forEach((b) => b.setAttribute('aria-pressed', 'false'));
    kind.setAttribute('aria-pressed', String(!on));
    return filterList();
  }
  const sugg = t.closest<HTMLElement>('.sugg button');
  if (sugg) return askHere(sugg.textContent ?? '');
  const shot = t.closest<HTMLElement>('[data-shot]');
  if (shot) {
    const light = document.createElement('div');
    light.className = 'light';
    light.innerHTML = `<div><img src="${esc(shot.dataset.shot ?? '')}" alt=""><p>${esc(shot.dataset.caption ?? '')}</p></div>`;
    light.addEventListener('click', () => light.remove());
    s2().appendChild(light);
  }
}

function onScroll(): void {
  if (window.__frozen) return;
  const y = window.scrollY;
  s2().classList.toggle('scrolled', y > 96);
  if (PHONE.matches) {
    const top = $('top');
    if (y > lastY + 6 && y > 160) top?.classList.add('tuck');
    else if (y < lastY - 6 || y < 80) top?.classList.remove('tuck');
  }
  lastY = y;
  progress();
}

try {
  const saved = parseFloat(localStorage.getItem(READ_KEY) ?? '');
  if (saved) root.style.setProperty('--read', `${saved}px`);
} catch {
  /* private mode: keep the default size */
}

window.Shell = { to3D: () => void to3D(), to2D, ask };
document.addEventListener('click', onClick);
document.addEventListener('input', (e) => {
  const t = e.target as HTMLInputElement;
  if (t.id === 'q') filterList();
  if (t.id === 'sageInput') {
    const hints = $('hints');
    if (hints)
      hints.innerHTML = findWords(t.value)
        .slice(0, 8)
        .map(
          (w) =>
            `<button type="button" data-c="${w.id}">${esc(w.label)}</button>`
        )
        .join('');
  }
});
document.addEventListener('submit', (e) => {
  const form = e.target as HTMLFormElement;
  if (form.id === 'sageForm') {
    e.preventDefault();
    const input = $<HTMLInputElement>('sageInput');
    if (input?.value.trim()) askSage(input.value);
  }
  if (form.id === 'askForm') {
    e.preventDefault();
    const input = $<HTMLInputElement>('qaInput');
    if (input) {
      askHere(input.value);
      input.value = '';
    }
  }
});
document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  document.querySelector('.light')?.remove();
  menu(false);
});
addEventListener('scroll', onScroll, { passive: true });
addEventListener('resize', () => {
  placeRunner();
  progress();
});
addEventListener('popstate', () => location.reload());
mount();
