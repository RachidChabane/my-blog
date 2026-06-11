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
 * intersection). On a browser without IntersectionObserver, the hook class is
 * stripped on ready so nothing ever stays hidden.
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
  `function init(){` +
  `var io=new IntersectionObserver(function(entries,obs){` +
  `var shown=0;` +
  `for(var i=0;i<entries.length;i++){if(entries[i].isIntersecting){` +
  `var el=entries[i].target;` +
  `el.style.transitionDelay=(Math.min(shown,6)*70)+'ms';` +
  `el.classList.add('is-in');obs.unobserve(el);shown++;}}` +
  `},{rootMargin:'0px 0px -8% 0px',threshold:0.1});` +
  `var els=document.querySelectorAll('[data-reveal]');` +
  `for(var i=0;i<els.length;i++)io.observe(els[i]);}` +
  `if(document.readyState==='loading'){addEventListener('DOMContentLoaded',init);}else{init();}})();`;
