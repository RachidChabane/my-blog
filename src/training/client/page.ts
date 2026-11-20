/**
 * The light-DOM side of the training page: progress on the launch card, the sheets
 * (search, domain filter, freed and to-review marks), and opening the game, whose
 * module is only loaded when the player presses Play.
 */
import type { Locale } from '@/i18n/index';
import { fold } from '../domain/bank';
import type { Question } from '../domain/bank';
import { LEGACY_CAMPAIGN, campaignOf } from '../domain/campaigns';
import {
  SAVE_KEY,
  loadSave,
  progressOf,
  readable,
  serializeSave,
  storedSave,
} from '../domain/save';
import type { SaveData } from '../domain/save';
import { PAGE_COPY } from '../i18n/page-copy';
import type { GameHost } from './host';
import { PHONE } from './host';

const root = document.getElementById('tg');
if (root) setup(root);

function setup(root: HTMLElement): void {
  const lang = (root.dataset.lang === 'en' ? 'en' : 'fr') as Locale;
  const c = PAGE_COPY[lang];
  const q = <T extends HTMLElement>(sel: string) =>
    document.querySelector(sel) as T;
  const sheets = [
    ...document.querySelectorAll<HTMLDetailsElement>('.tg-sheet'),
  ];
  const questions: Question[] = sheets.map((el) => ({
    id: el.dataset.id ?? '',
    domain: el.dataset.domain ?? '',
    answer: Number(el.dataset.answer),
    stem: el.querySelector('.tg-stem')?.textContent ?? '',
    options: [...el.querySelectorAll('.tg-opt')].map(
      (o) => o.textContent ?? ''
    ),
    why: el.querySelector('.tg-why-t')?.textContent ?? '',
  }));
  const camp = campaignOf(root.dataset.campaign ?? '');
  const shelves = [{ camp, ids: new Set(questions.map((x) => x.id)) }];
  const haystack = new Map(
    sheets.map((el) => [el, fold(el.textContent ?? '')])
  );

  let save: SaveData = loadSave(readStore, shelves, LEGACY_CAMPAIGN);
  /* a save this build cannot read (newer, damaged) is played from scratch, never overwritten */
  const locked = !readable(storedSave(readStore));
  const progress = () => progressOf(save, camp.key);
  const persist = () => {
    if (!locked) writeStore(serializeSave(save));
  };

  /* ---------- marks and counts ---------- */
  function refresh(): void {
    const freed = new Set(progress().freed);
    const total = questions.length;
    q('#tg-progress').textContent = c.launch.progress(freed.size, total);
    q('#tg-bar').style.width = `${(freed.size / total) * 100}%`;
    q('#tg-sheets-sum').textContent = c.sheets.sum(total, freed.size);
    const per: Record<string, number> = {};
    questions.forEach((x) => {
      if (freed.has(x.id)) per[x.domain] = (per[x.domain] ?? 0) + 1;
    });
    document.querySelectorAll<HTMLElement>('.tg-domains li').forEach((li) => {
      const n = per[li.dataset.domain ?? ''] ?? 0;
      const of = Number(li.dataset.total);
      (li.querySelector('.tg-dn') as HTMLElement).textContent = c.sheets.count(
        n,
        of
      );
    });
    document.querySelectorAll<HTMLElement>('[data-gcount]').forEach((el) => {
      const d = el.dataset.gcount ?? '';
      const of = questions.filter((x) => x.domain === d).length;
      el.textContent = c.sheets.count(per[d] ?? 0, of);
    });
    sheets.forEach((el) => {
      const id = el.dataset.id ?? '';
      (el.querySelector('.tg-freed') as HTMLElement).hidden = !freed.has(id);
      (el.querySelector('.tg-review') as HTMLElement).hidden =
        !progress().review[id];
    });
    q('#tg-play-label').textContent =
      freed.size || progress().xp ? c.resume : c.play;
  }

  /* ---------- search and domain filter ---------- */
  let filter = 'all';
  function applyFilter(): void {
    const needle = fold(q<HTMLInputElement>('#tg-q').value);
    let shown = 0;
    document.querySelectorAll<HTMLElement>('.tg-group').forEach((g) => {
      let n = 0;
      g.querySelectorAll<HTMLDetailsElement>('.tg-sheet').forEach((el) => {
        const ok =
          (filter === 'all' || el.dataset.domain === filter) &&
          (!needle || (haystack.get(el) ?? '').includes(needle));
        el.hidden = !ok;
        if (ok) n++;
      });
      g.hidden = n === 0;
      shown += n;
    });
    q('#tg-empty').hidden = shown > 0;
  }
  q('#tg-q').addEventListener('input', applyFilter);
  q('#tg-filters').addEventListener('click', (e) => {
    const b = (e.target as HTMLElement).closest<HTMLButtonElement>('button');
    if (!b) return;
    filter = b.dataset.f ?? 'all';
    document
      .querySelectorAll('#tg-filters button')
      .forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    applyFilter();
  });

  /* ---------- the game: overlay on a phone, inline on a desktop ---------- */
  const host = q('#tg-host');
  const launch = q('#tg-launch');
  const panel = q('#tg-sheets');
  const phone = matchMedia(PHONE);
  let open = false;
  /* the history entry the open game owns, and the back it triggers itself when closing */
  let pushed = false;
  let ownBack = false;
  let mounted: Promise<void> | null = null;
  let scrollY = 0;

  /* Full screen is laid out from the body, so no ancestor of the page can clip it. */
  const anchor = document.createComment('tg-host');
  host.before(anchor);
  const panelAnchor = document.createComment('tg-sheets');
  panel.before(panelAnchor);
  function layout(): void {
    const overlay = open && phone.matches;
    host.classList.toggle('is-overlay', overlay);
    if (overlay && host.parentElement !== document.body)
      document.body.appendChild(host);
    if (!overlay && host.parentElement === document.body) anchor.after(host);
    document.documentElement.classList.toggle('tg-locked', overlay);
    if (!phone.matches) closePanel();
  }
  function openGame(): void {
    if (open) return;
    open = true;
    scrollY = window.scrollY;
    host.hidden = false;
    launch.hidden = true;
    layout();
    if (phone.matches) {
      history.pushState({ tg: 'game' }, '');
      pushed = true;
    } else host.scrollIntoView({ block: 'start' });
    mounted = mounted ?? mount();
    void mounted.then(() => host.focus({ preventScroll: true }));
  }
  function closeGame(fromHistory = false): void {
    if (!open) return;
    open = false;
    closePanel();
    host.hidden = true;
    launch.hidden = false;
    const wasOverlay = host.classList.contains('is-overlay');
    layout();
    refresh();
    if (wasOverlay) window.scrollTo(0, scrollY);
    if (pushed && !fromHistory) {
      ownBack = true;
      history.back();
    }
    pushed = false;
    q('#tg-play').focus({ preventScroll: true });
  }
  function openPanel(): void {
    refresh();
    if (!phone.matches) {
      panel.scrollIntoView({ block: 'start' });
      q('#tg-sheets-h').focus({ preventScroll: true });
      return;
    }
    document.body.appendChild(panel);
    panel.classList.add('is-panel');
    panel.scrollTop = 0;
    q('#tg-sheets-h').focus({ preventScroll: true });
  }
  function closePanel(): void {
    if (!panel.classList.contains('is-panel')) return;
    panel.classList.remove('is-panel');
    panelAnchor.after(panel);
    if (open) host.focus({ preventScroll: true });
  }
  const panelOpen = () => panel.classList.contains('is-panel');

  async function mount(): Promise<void> {
    const { mountGame } = await import('./game/index');
    const api: GameHost = {
      lang,
      questions,
      campaign: camp,
      get save() {
        return save;
      },
      get progress() {
        return progress();
      },
      persist,
      reset() {
        delete save.campaigns[camp.key];
        persist();
        refresh();
        return save;
      },
      refresh,
      openSheets: openPanel,
      sheetsOpen: panelOpen,
      close: () => closeGame(),
      isOverlay: () => open && phone.matches,
    };
    mountGame(host, api);
  }

  q('#tg-play').addEventListener('click', openGame);
  q('#tg-sheets-close').addEventListener('click', closePanel);
  phone.addEventListener('change', layout);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && panelOpen()) closePanel();
  });
  /* Android back closes the full-screen game instead of leaving the page. */
  window.addEventListener(
    'popstate',
    (e) => {
      if (ownBack) {
        ownBack = false;
        e.stopImmediatePropagation();
        return;
      }
      if (!open || !pushed) return;
      e.stopImmediatePropagation();
      closeGame(true);
    },
    { capture: true }
  );

  refresh();
  /* a link from elsewhere on the site asks for the game already started */
  if (location.hash === '#play') {
    history.replaceState(history.state, '', location.pathname);
    openGame();
  }
}

function readStore(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}
function writeStore(v: string): void {
  try {
    localStorage.setItem(SAVE_KEY, v);
  } catch {
    /* storage unavailable: progress lasts for this visit */
  }
}
