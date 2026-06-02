/* ============================================================================
   rachidchabane — Avatar mark  «Maillage»
   avatar.js  ·  <rc-avatar> custom element (light-DOM, capture-safe)
   ----------------------------------------------------------------------------
   A non-figurative 4×4 lattice of nodes inside a soft aperture. NOT a face,
   character, or mascot — an abstract generative mesh (a "maillage").

   Usage:
     <script src="avatar.js"></script>
     <rc-avatar size="40" state="idle"></rc-avatar>
     el.setAttribute('state', 'thinking');   // toggle active/thinking

   Attributes:
     size    px (default 40)
     state   "idle" | "thinking" | "static"   (default idle)

   Renders into light DOM (no shadow root) so DOM-rerendering screenshot /
   export tools capture it. All styles are scoped under .rc-mark and injected
   once. Honors prefers-reduced-motion. Inherits --accent from the theme.
   ============================================================================ */
(function () {
  const COLS = 4, ROWS = 4;
  const STYLE_ID = 'rc-avatar-styles';

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const s = document.createElement('style');
    s.id = STYLE_ID;
    s.textContent = `
      .rc-mark {
        display: inline-grid;
        grid-template-columns: repeat(${COLS}, 1fr);
        grid-template-rows: repeat(${ROWS}, 1fr);
        place-items: center;
        box-sizing: border-box;
        vertical-align: middle;
        background: var(--rc-avatar-bg, color-mix(in srgb, var(--accent, #7C6BFF) 13%, transparent));
        transform-origin: center;
        line-height: 0;
      }
      .rc-mark.is-idle { animation: rc-breathe 5.2s cubic-bezier(.22,.61,.36,1) infinite; }
      .rc-mark > b {
        display: block;
        border-radius: 50%;
        background: var(--accent, #7C6BFF);
        opacity: 0.5;
        transform: scale(1);
        will-change: opacity, transform;
      }
      .rc-mark.is-idle > b {
        animation: rc-drift 4.6s ease-in-out infinite;
        animation-delay: calc(var(--d) * -0.36s);
      }
      .rc-mark.is-thinking > b {
        animation: rc-shimmer 1.15s cubic-bezier(.4,0,.2,1) infinite;
        animation-delay: calc(var(--d) * 0.085s);
      }
      .rc-mark.is-static > b { opacity: 0.62; }
      .rc-mark.is-static > b:nth-child(6),
      .rc-mark.is-static > b:nth-child(11) { opacity: 1; }

      @keyframes rc-breathe { 0%,100% { transform: scale(1); } 50% { transform: scale(1.045); } }
      @keyframes rc-drift   { 0%,100% { opacity: 0.42; } 50% { opacity: 0.95; } }
      @keyframes rc-shimmer {
        0%   { opacity: 0.4;  transform: scale(0.82); }
        38%  { opacity: 1;    transform: scale(1.35); }
        70%  { opacity: 0.55; transform: scale(1); }
        100% { opacity: 0.4;  transform: scale(0.82); }
      }
      @media (prefers-reduced-motion: reduce) {
        .rc-mark.is-idle { animation: none; }
        .rc-mark > b { animation: none !important; opacity: 0.55; }
        .rc-mark > b:nth-child(6), .rc-mark > b:nth-child(11) { opacity: 1; }
      }
    `;
    (document.head || document.documentElement).appendChild(s);
  }

  class RCAvatar extends HTMLElement {
    static get observedAttributes() { return ['size', 'state']; }
    connectedCallback() { injectStyles(); this.render(); }
    attributeChangedCallback() { if (this.isConnected) this.render(); }

    render() {
      const size = parseInt(this.getAttribute('size') || '40', 10);
      const state = this.getAttribute('state') || 'idle';
      const pad = size * 0.16;
      const dot = Math.max(2.5, size * 0.1);
      const radius = Math.max(6, size * 0.22);

      this.style.display = 'inline-flex';
      this.style.width = size + 'px';
      this.style.height = size + 'px';

      let dots = '';
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          dots += `<b style="--d:${r + c};width:${dot}px;height:${dot}px"></b>`;
        }
      }
      this.innerHTML =
        `<span class="rc-mark is-${state}" style="width:${size}px;height:${size}px;` +
        `padding:${pad}px;border-radius:${radius}px;gap:${size * 0.05}px">${dots}</span>`;
    }
  }

  if (!customElements.get('rc-avatar')) customElements.define('rc-avatar', RCAvatar);
})();
