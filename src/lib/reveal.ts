/**
 * Scroll-reveal — progressive enhancement. Elements marked `data-reveal` are
 * VISIBLE BY DEFAULT (server-rendered, no JS, no flash). This inline head script
 * adds `.js-reveal` to <html> synchronously (pre-paint, so there is no
 * visible→hidden flash), and the matching CSS in global.css only hides the
 * elements under `prefers-reduced-motion: no-preference`. So:
 *   - no JS            → `.js-reveal` never set → always visible
 *   - reduced motion   → hidden state media query never matches → always visible
 *   - JS + motion ok   → hidden until the IntersectionObserver adds `.is-in`
 *
 * Stagger is per-batch: items that cross into view in the SAME observer callback
 * (e.g. a grid row that scrolls in together) fan out left-to-right via an inline
 * transition-delay; a vertical list reveals each item on its own with no
 * accumulated lag. The observer is one-shot per element (unobserve on first
 * intersection).
 *
 * CRITICAL: once an element has revealed, we REMOVE `data-reveal` (and the inline
 * delay) on transitionend. The reveal rule `.js-reveal [data-reveal]` (specificity
 * 0,2,0) sets a `transition` that outranks a component's own hover transition
 * (e.g. `.rc-proj`, 0,1,0); leaving it attached would make a revealed card hover
 * with the reveal's opacity/transform timing (slow + delayed) instead of its own.
 * Stripping the hook reverts the element to its designed transitions. Under reduced
 * motion we skip the whole observer (content is already visible via CSS) so no
 * inline delay is ever written.
 *
 * On a browser without IntersectionObserver, the hook class is stripped on ready so
 * nothing ever stays hidden.
 *
 * Injected via `<script is:inline set:html={revealInitScript} />`. Self-contained
 * (inline scripts cannot import); fully inline, so it is exempt from the
 * external-script perf budget.
 */
export const revealInitScript =
  `(function(){var d=document.documentElement;d.classList.add('js-reveal');` +
  `if(!('IntersectionObserver' in window)){` +
  `function strip(){d.classList.remove('js-reveal');}` +
  `if(document.readyState==='loading'){addEventListener('DOMContentLoaded',strip);}else{strip();}return;}` +
  `function reveal(el,delay){` +
  `el.style.transitionDelay=delay+'ms';` +
  `function done(ev){if(ev.target!==el)return;` +
  `el.removeEventListener('transitionend',done);` +
  `el.style.transitionDelay='';el.removeAttribute('data-reveal');}` +
  `el.addEventListener('transitionend',done);` +
  `el.classList.add('is-in');}` +
  `function init(){` +
  `if(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches)return;` +
  `var io=new IntersectionObserver(function(entries,obs){` +
  `var shown=0;` +
  `for(var i=0;i<entries.length;i++){if(entries[i].isIntersecting){` +
  `reveal(entries[i].target,Math.min(shown,6)*70);obs.unobserve(entries[i].target);shown++;}}` +
  `},{rootMargin:'0px 0px -8% 0px',threshold:0.1});` +
  `var els=document.querySelectorAll('[data-reveal]');` +
  `for(var i=0;i<els.length;i++)io.observe(els[i]);}` +
  `if(document.readyState==='loading'){addEventListener('DOMContentLoaded',init);}else{init();}})();`;
