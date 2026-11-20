/**
 * Mounts the game console in a shadow root, so the site's styles and the game's never
 * meet, and starts on the title screen. The theme follows the site's [data-theme].
 */
import { idsByDomain } from '../../domain/bank';
import { seededRng } from '../../domain/random';
import { bookFor } from '../../domain/save';
import { COPY } from '../../i18n/copy';
import type { GameHost } from '../host';
import css from './game.css?raw';
import { icon16 } from './battle';
import { G, $, esc } from './state';
import { bindInput, blip, closeHowto, openHowto } from './ui';
import { renderToggles, titleScreen } from './screens';
import { icon24 } from './art';
import type { IntentName } from '../../i18n/copy';

function markup(): string {
  const c = G.c;
  return `<div class="game" id="game">
  <div class="console" id="console">
    <header class="topbar">
      <div class="where"><b id="where-t"></b><span class="sub" id="where-s"></span></div>
      <div class="sys">
        <button class="btn" type="button" id="help" aria-label="${esc(c.help)}">${icon24('help')}</button>
        <button class="btn" type="button" id="snd" aria-pressed="false" aria-label="${esc(c.sound)}"><svg class="off" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 9h4l5-4v14l-5-4H3z" fill="currentColor"/><path d="M16 9l5 6M21 9l-5 6" stroke="currentColor" stroke-width="2.4"/></svg><svg class="on" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 9h4l5-4v14l-5-4H3z" fill="currentColor"/><path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13" fill="none" stroke="currentColor" stroke-width="2.2"/></svg></button>
        <button class="btn close" type="button" id="quit" aria-label="${esc(c.close)}">${icon24('close')}</button>
      </div>
    </header>
    <section class="scene" id="scene" aria-label="${esc(c.scene)}">
      <div id="set"></div>
      <div class="layer" id="layer"></div>
      <div class="banner" id="banner" aria-live="polite"></div>
      <div class="field" id="field" hidden></div>
      <div class="fx" id="fx" aria-hidden="true"></div>
    </section>
    <section class="dialog narr" id="dialog" aria-live="polite">
      <div class="face" id="dlg-face"></div>
      <div class="body"><span class="tab" id="dlg-who"></span><div class="txt" id="dlg-txt"></div></div>
      <span class="prog" id="dlg-prog"></span>
    </section>
    <section class="side" aria-label="${esc(c.yourSide)}">
      <div class="status" id="status"></div>
      <div class="zone" id="zone"></div>
    </section>
    <div class="howto" id="howto" role="dialog" aria-modal="true" aria-labelledby="howto-t" hidden>
      <h2 id="howto-t">${esc(c.howto.title)}</h2>
      <ul>${c.howto.items.map((x) => `<li>${x}</li>`).join('')}</ul>
      <div class="legend">${(Object.entries(c.legend) as [IntentName, string][]).map(([k, l]) => `<span>${icon16(k)}${esc(l)}</span>`).join('')}</div>
      <button class="btn" type="button" id="howto-close">${esc(c.howto.close)}</button>
    </div>
  </div>
</div>`;
}

/** Mirrors the site's theme onto the host, where the game's tokens read it. */
function followTheme(host: HTMLElement): void {
  const sync = () => {
    host.dataset.theme =
      document.documentElement.getAttribute('data-theme') === 'dark'
        ? 'dark'
        : 'light';
  };
  sync();
  new MutationObserver(sync).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme'],
  });
}

export function mountGame(host: HTMLElement, api: GameHost): void {
  const root = host.attachShadow({ mode: 'open' });
  const style = document.createElement('style');
  style.textContent = css;
  root.appendChild(style);
  const wrap = document.createElement('div');
  wrap.className = 'frame';
  root.appendChild(wrap);
  G.root = root;
  G.host = api;
  G.c = COPY[api.lang];
  G.rng = seededRng(Date.now());
  G.qById = new Map(api.questions.map((q) => [q.id, q]));
  G.ctx = {
    rng: G.rng,
    bank: idsByDomain(api.questions),
    get book() {
      return bookFor(api.save, () => api.persist());
    },
  };
  G.run = null;
  G.F = null;
  G.screen = 'title';
  G.sel = null;
  wrap.innerHTML = markup();
  followTheme(host);
  $('help').onclick = (e) => {
    e.stopPropagation();
    openHowto();
  };
  $('howto-close').onclick = (e) => {
    e.stopPropagation();
    closeHowto();
  };
  $('snd').onclick = (e) => {
    e.stopPropagation();
    api.save.sound = !api.save.sound;
    api.persist();
    renderToggles();
    blip('ok');
  };
  $('quit').onclick = (e) => {
    e.stopPropagation();
    api.close();
  };
  bindInput();
  renderToggles();
  void titleScreen();
}
