/* projects.jsx — Portfolio index (Projets) for rachidchabane.
   A restrained, uniform grid of project cards generated from an inventory.
   Every card is an OWNER-FILLED PLACEHOLDER — bracketed name + one-line
   description; no invented project names, claims, or metrics. Stack chips,
   a status label, and a quiet link affordance per card.
   Panels: FR·light (primary), FR·dark, EN·light, and a single-card hover
   close-up (rest vs. hover) showing the accent used sparingly. */
const { useState, useEffect, useRef } = React;

const ICONS = {
  search: <><circle cx="11" cy="11" r="7"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></>,
  moon: <path d="M12 3a6.4 6.4 0 0 0 9 9 9 9 0 1 1-9-9Z"></path>,
  sun: <><circle cx="12" cy="12" r="4"></circle><line x1="12" y1="2" x2="12" y2="4"></line><line x1="12" y1="20" x2="12" y2="22"></line><line x1="4.9" y1="4.9" x2="6.3" y2="6.3"></line><line x1="17.7" y1="17.7" x2="19.1" y2="19.1"></line><line x1="2" y1="12" x2="4" y2="12"></line><line x1="20" y1="12" x2="22" y2="12"></line><line x1="4.9" y1="19.1" x2="6.3" y2="17.7"></line></>,
  x: <><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></>,
  up: <><line x1="12" y1="19" x2="12" y2="5"></line><polyline points="5 12 12 5 19 12"></polyline></>,
  rss: <><path d="M4 11a9 9 0 0 1 9 9"></path><path d="M4 4a16 16 0 0 1 16 16"></path><circle cx="5" cy="19" r="1"></circle></>,
};
function Icon({ name, size = 18 }) {
  return (
    <svg className="rc-ico" width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true">{ICONS[name]}</svg>
  );
}

/* ---- inventory: OWNER-FILLED PLACEHOLDERS (no real names/claims) -------- */
const PROJECTS = [
  { n: "01", stack: ["Python", "LLM", "RAG"], live: true, status: { fr: "En production", en: "In production" } },
  { n: "02", stack: ["Rust", "inférence"], live: true, status: { fr: "Actif", en: "Active" } },
  { n: "03", stack: ["Python", "évals"], live: false, status: { fr: "Open-source", en: "Open-source" } },
  { n: "04", stack: ["TypeScript", "agents"], live: false, status: { fr: "En cours", en: "In progress" } },
  { n: "05", stack: ["Python", "vLLM"], live: true, status: { fr: "Actif", en: "Active" } },
];

const T = {
  fr: {
    nav: { articles: "Articles", projects: "Projets", about: "À propos" }, search: "Rechercher",
    eyebrow: "Travaux", title: "Projets", meta: "Sélection — code et systèmes",
    name: "[Projet — nom public]", desc: "[description publique en une ligne]", view: "Voir",
    chat: { title: "Demander à l’agent", placeholder: "Une question sur les projets…",
      seed: "Je peux décrire un projet à partir de ce qui est publié ici. Lequel vous intéresse ?",
      reply: "Les noms publics seront renseignés par l’auteur ; je ne divulgue rien d’interne. Souhaitez-vous le périmètre d’un projet ?" },
    footer: { credit: "écrit et maintenu de façon autonome", rss: "RSS", rights: "Tous droits réservés." },
    demoRest: "Au repos", demoHover: "Survol — accent",
  },
  en: {
    nav: { articles: "Articles", projects: "Projects", about: "About" }, search: "Search",
    eyebrow: "Work", title: "Projects", meta: "Selection — code and systems",
    name: "[Project — public name]", desc: "[public one-line description]", view: "View",
    chat: { title: "Ask the agent", placeholder: "A question about the projects…",
      seed: "I can describe a project from what’s published here. Which one interests you?",
      reply: "Public names are owner-filled; I don’t disclose anything internal. Want a project’s scope?" },
    footer: { credit: "written and maintained autonomously", rss: "RSS", rights: "All rights reserved." },
    demoRest: "At rest", demoHover: "Hover — accent",
  },
};

/* ----------------------------------------------------------------- chrome */
function Wordmark({ state, size = 32 }) {
  return (
    <a className="rc-wordmark" href="#" onClick={(e) => e.preventDefault()} aria-label="rachid chabane — accueil">
      <rc-avatar size={size} state={state}></rc-avatar>
      <span className="rc-wordmark__txt">rachid chabane<span className="rc-dot">.</span></span>
    </a>
  );
}
function LangSwitch({ lang, setLang }) {
  return (
    <div className="rc-seg" role="group" aria-label="Langue / Language">
      {["fr", "en"].map((l) => (
        <button key={l} className={"rc-seg__btn" + (lang === l ? " is-on" : "")}
          onClick={() => setLang(l)} aria-pressed={lang === l}>{l.toUpperCase()}</button>
      ))}
    </div>
  );
}
function ThemeToggle({ theme, setTheme }) {
  return (
    <button className="rc-icon-btn" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      aria-label={theme === "dark" ? "Passer au thème clair" : "Passer au thème sombre"}>
      <Icon name={theme === "dark" ? "sun" : "moon"} />
    </button>
  );
}
function Nav({ t, lang, setLang, theme, setTheme, avatarState }) {
  return (
    <header className="rc-nav">
      <Wordmark state={avatarState} />
      <nav className="rc-nav__links" aria-label="Navigation principale">
        <a href="#" onClick={(e) => e.preventDefault()}>{t.nav.articles}</a>
        <a href="#" className="is-current" onClick={(e) => e.preventDefault()}>{t.nav.projects}</a>
        <a href="#" onClick={(e) => e.preventDefault()}>{t.nav.about}</a>
      </nav>
      <div className="rc-nav__right">
        <button className="rc-search" aria-label={t.search}>
          <Icon name="search" size={16} /><span>{t.search}</span><kbd>⌘K</kbd>
        </button>
        <LangSwitch lang={lang} setLang={setLang} />
        <ThemeToggle theme={theme} setTheme={setTheme} />
      </div>
    </header>
  );
}
function Footer({ t, lang, setLang, theme, setTheme }) {
  return (
    <footer className="rc-footer">
      <div className="rc-footer__top">
        <span className="rc-footer__word">rachid chabane<span className="rc-dot">.</span></span>
        <a className="rc-rss" href="#" onClick={(e) => e.preventDefault()}><Icon name="rss" size={14} />{t.footer.rss}</a>
        <span className="rc-footer__spacer"></span>
        <div className="rc-footer__controls">
          <LangSwitch lang={lang} setLang={setLang} />
          <ThemeToggle theme={theme} setTheme={setTheme} />
        </div>
      </div>
      <div className="rc-footer__credit"><span className="rc-eyebrow">{t.footer.credit}</span></div>
      <span className="rc-footer__small">© 2026 rachid chabane · {t.footer.rights}</span>
    </footer>
  );
}

/* ----------------------------------------------------------------- card */
function ProjectCard({ p, t, lang, forceHover }) {
  return (
    <article className={"rc-proj" + (forceHover ? " is-hover" : "")}>
      <div className="rc-proj__top">
        <span className="rc-proj__n">PROJET · {p.n}</span>
        <span className={"rc-pstatus" + (p.live ? " is-live" : "")}>
          <span className="rc-pstatus__dot"></span>{p.status[lang]}
        </span>
      </div>
      <h3 className="rc-proj__title">{t.name}</h3>
      <p className="rc-proj__desc">{t.desc}</p>
      <div className="rc-proj__chips">
        {p.stack.map((s) => <span key={s} className="rc-tag">{s}</span>)}
      </div>
      <div className="rc-proj__foot">
        <span className="rc-proj__ph">{lang === "fr" ? "à compléter" : "owner-filled"}</span>
        <span className="rc-proj__link">{t.view} →</span>
      </div>
    </article>
  );
}

function PortfolioView({ t, lang }) {
  return (
    <main className="rc-main rc-enter">
      <div className="rc-pagehd">
        <span className="rc-eyebrow">{t.eyebrow}</span>
        <h1 className="rc-pagehd__title">{t.title}</h1>
        <span className="rc-pagehd__meta">{t.meta}</span>
      </div>
      <div className="rc-projgrid">
        {PROJECTS.map((p) => <ProjectCard key={p.n} p={p} t={t} lang={lang} />)}
      </div>
    </main>
  );
}

/* --------------------------------------------------------------- chat dock */
function ChatDock({ t, onState }) {
  const [open, setOpen] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [msgs, setMsgs] = useState([{ who: "bot", text: t.chat.seed }]);
  const [val, setVal] = useState("");
  const bodyRef = useRef(null);
  useEffect(() => { setMsgs([{ who: "bot", text: t.chat.seed }]); }, [t]);
  useEffect(() => { if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight; });
  useEffect(() => { onState && onState(thinking ? "thinking" : "idle"); }, [thinking]);
  function send() {
    const v = val.trim(); if (!v) return;
    setMsgs((m) => [...m, { who: "me", text: v }]); setVal(""); setThinking(true);
    setTimeout(() => { setThinking(false); setMsgs((m) => [...m, { who: "bot", text: t.chat.reply }]); }, 1400);
  }
  return (
    <div className="rc-dock">
      {open && (
        <div className="rc-chat rc-chat--in">
          <div className="rc-chat__head">
            <rc-avatar size={28} state={thinking ? "thinking" : "idle"}></rc-avatar>
            <span className="rc-chat__title">{t.chat.title}</span>
            <button className="rc-icon-btn" onClick={() => setOpen(false)} aria-label="Fermer"><Icon name="x" size={16} /></button>
          </div>
          <div className="rc-chat__body" ref={bodyRef}>
            {msgs.map((m, i) => <div key={i} className={"rc-bub rc-bub--" + m.who}>{m.text}</div>)}
            {thinking && <div className="rc-bub rc-bub--bot rc-bub--think"><rc-avatar size={20} state="thinking"></rc-avatar></div>}
          </div>
          <div className="rc-chat__input">
            <input value={val} onChange={(e) => setVal(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()} placeholder={t.chat.placeholder} />
            <button className="rc-send" onClick={send} aria-label="Envoyer"><Icon name="up" size={17} /></button>
          </div>
        </div>
      )}
      <button className={"rc-fab" + (open ? " is-open" : "")} onClick={() => setOpen((o) => !o)} aria-label={t.chat.title}>
        <rc-avatar size={open ? 26 : 40} state={thinking ? "thinking" : "idle"}></rc-avatar>
      </button>
    </div>
  );
}

/* --------------------------------------------------------- full screen */
function SiteApp({ initialTheme, initialLang }) {
  const [theme, setTheme] = useState(initialTheme);
  const [lang, setLang] = useState(initialLang);
  const [avatarState, setAvatarState] = useState("idle");
  const t = T[lang];
  return (
    <div className="frame" data-theme={theme}>
      <div className="frame-scroll">
        <div className="rc-app">
          <Nav t={t} lang={lang} setLang={setLang} theme={theme} setTheme={setTheme} avatarState={avatarState} />
          <PortfolioView t={t} lang={lang} />
          <Footer t={t} lang={lang} setLang={setLang} theme={theme} setTheme={setTheme} />
        </div>
      </div>
      <ChatDock t={t} onState={setAvatarState} />
    </div>
  );
}

/* ------------------------------------------------------------- panels */
function Panel({ num, name, meta, theme, lang, scale }) {
  return (
    <section className="panel">
      <div className="panel__label">
        <span className="panel__num">{num}</span><span className="panel__name">{name}</span><span className="panel__meta">{meta}</span>
      </div>
      <div className="frame-outer" style={{ width: 1440 * scale, height: 1024 * scale }}>
        <div style={{ transform: `scale(${scale})`, transformOrigin: "top left", width: 1440, height: 1024 }}>
          <SiteApp initialTheme={theme} initialLang={lang} />
        </div>
      </div>
    </section>
  );
}

function HoverPanel({ num, name, meta }) {
  const t = T.fr;
  return (
    <section className="panel">
      <div className="panel__label">
        <span className="panel__num">{num}</span><span className="panel__name">{name}</span><span className="panel__meta">{meta}</span>
      </div>
      <div className="hover-demo" data-theme="light">
        <div className="hover-demo__tag"><span>{t.demoRest}</span><span>{t.demoHover}</span></div>
        <ProjectCard p={PROJECTS[0]} t={t} lang="fr" />
        <ProjectCard p={PROJECTS[0]} t={t} lang="fr" forceHover />
      </div>
    </section>
  );
}

function Gallery() {
  const [scale, setScale] = useState(0.8);
  useEffect(() => {
    function fit() {
      const target = Math.min(1180, window.innerWidth - 96);
      setScale(Math.max(0.34, Math.min(0.82, target / 1440)));
    }
    fit(); window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []);
  return (
    <div className="gallery">
      <span className="gallery__eyebrow">rachidchabane · écran 04</span>
      <h1 className="gallery__title">Portfolio index — Projets</h1>
      <p className="gallery__lead">
        Grille sobre et uniforme générée depuis un inventaire : nom du projet, description d’une ligne,
        chips de stack, statut, et un lien discret. Chaque carte est un <b>gabarit à compléter par l’auteur</b> —
        aucun nom réel, aucune métrique, rien d’interne. L’accent ne sert qu’au survol et au statut « en production ».
      </p>
      <div className="gallery__notes">
        <span className="gallery__chip">5 cartes · placeholders</span>
        <span className="gallery__chip">statut : En production · Actif · Open-source · En cours</span>
        <span className="gallery__chip">pas de logos · pas de métriques · rien de privé</span>
      </div>
      <div className="panels">
        <Panel num="A" name="Projets · FR · clair" meta="primaire · inventaire" theme="light" lang="fr" scale={scale} />
        <Panel num="B" name="Projets · FR · sombre" meta="registre sombre" theme="dark" lang="fr" scale={scale} />
        <Panel num="C" name="Projects · EN · clair" meta="parallèle anglais" theme="light" lang="en" scale={scale} />
        <HoverPanel num="D" name="Carte — repos vs survol" meta="accent parcimonieux · gros plan" />
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<Gallery />);
