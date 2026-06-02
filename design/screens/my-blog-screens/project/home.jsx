/* home.jsx — Accueil (Home) screen for rachidchabane.
   A working React prototype: real chrome (masthead with wordmark, nav,
   search, FR/EN switch, theme toggle), restrained Fraunces hero, "Derniers
   articles" list, "Projets" teaser strip, rich footer, and the always-present
   idle <rc-avatar> launcher. Rendered into three review panels:
   FR·Light, FR·Dark, EN·Light. */
const { useState, useEffect, useRef } = React;

/* ---------------------------------------------------------------- icons --
   Lucide path data, drawn inline as React SVG (1.75 stroke) so they survive
   React re-renders. The design system's icon set is Lucide. */
const ICONS = {
  search: <><circle cx="11" cy="11" r="7"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></>,
  moon: <path d="M12 3a6.4 6.4 0 0 0 9 9 9 9 0 1 1-9-9Z"></path>,
  sun: <><circle cx="12" cy="12" r="4"></circle><line x1="12" y1="2" x2="12" y2="4"></line><line x1="12" y1="20" x2="12" y2="22"></line><line x1="4.9" y1="4.9" x2="6.3" y2="6.3"></line><line x1="17.7" y1="17.7" x2="19.1" y2="19.1"></line><line x1="2" y1="12" x2="4" y2="12"></line><line x1="20" y1="12" x2="22" y2="12"></line><line x1="4.9" y1="19.1" x2="6.3" y2="17.7"></line><line x1="17.7" y1="6.3" x2="19.1" y2="4.9"></line></>,
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

/* ----------------------------------------------------------------- data -- */
const T = {
  fr: {
    nav: { articles: "Articles", projects: "Projets", about: "À propos" },
    search: "Rechercher",
    hero: {
      eyebrow: "Ingénieur IA — Paris",
      line: "J’écris sur l’ingénierie de l’IA de pointe — et ce site s’en charge tout seul.",
      sub: "Évaluations, agents outillés, garde-fous. Un carnet tenu — et publié — par un agent, sous revue humaine.",
      cta: "Lire les écrits",
    },
    secArticles: "Derniers articles", secAll: "Tout voir",
    secProjects: "Projets", secPortfolio: "Voir le portfolio",
    read: "Lire",
    articles: [
      { id: "agents", date: "30-05-2026", read: "7 min", tags: ["agents", "agentic coding"],
        title: "Orchestrer des agents de code avec des workflows déterministes" },
      { id: "rag", date: "27-05-2026", read: "9 min", tags: ["RAG", "retrieval"],
        title: "RAG hybride : la fusion de rang réciproque en pratique" },
      { id: "gardefous", date: "23-05-2026", read: "6 min", tags: ["évaluation", "qualité"],
        title: "Garde-fous de publication : un pipeline de fact-checking automatisé" },
    ],
    projects: [
      { n: "01", note: "nom public à confirmer", status: "à venir" },
      { n: "02", note: "nom public à confirmer", status: "à venir" },
    ],
    projTitle: "Projet", projDesc: "Nom et résumé fournis ultérieurement.",
    chat: { title: "Demander à l’agent", placeholder: "Posez une question sur ce site…",
      seed: "Bonjour. Je réponds à partir du contenu de ce site — articles, projets, à propos. Que cherchez-vous ?",
      reply: "Je résume à partir des écrits publiés : évaluations déterministes, agents outillés, garde-fous de publication. Souhaitez-vous un article précis ?" },
    footer: { credit: "écrit et maintenu de façon autonome", rss: "RSS", rights: "Tous droits réservés." },
  },
  en: {
    nav: { articles: "Articles", projects: "Projects", about: "About" },
    search: "Search",
    hero: {
      eyebrow: "AI engineer — Paris",
      line: "I write about cutting-edge AI engineering — and this site runs itself.",
      sub: "Evaluations, tool-using agents, guardrails. A notebook kept — and published — by an agent, under human review.",
      cta: "Read the writing",
    },
    secArticles: "Latest articles", secAll: "See all",
    secProjects: "Projects", secPortfolio: "View the portfolio",
    read: "Read",
    articles: [
      { id: "agents", date: "30-05-2026", read: "7 min", tags: ["agents", "agentic coding"],
        title: "Orchestrating coding agents with deterministic workflows" },
      { id: "rag", date: "27-05-2026", read: "9 min", tags: ["RAG", "retrieval"],
        title: "Hybrid RAG: reciprocal rank fusion in practice" },
      { id: "gardefous", date: "23-05-2026", read: "6 min", tags: ["evaluation", "quality"],
        title: "Publication guardrails: an automated fact-checking pipeline" },
    ],
    projects: [
      { n: "01", note: "public name TBD", status: "upcoming" },
      { n: "02", note: "public name TBD", status: "upcoming" },
    ],
    projTitle: "Project", projDesc: "Name and summary provided later.",
    chat: { title: "Ask the agent", placeholder: "Ask a question about this site…",
      seed: "Hello. I answer only from this site’s content — articles, projects, about. What are you looking for?",
      reply: "From the published writing: deterministic evaluations, tool-using agents, publication guardrails. Want a specific article?" },
    footer: { credit: "written and maintained autonomously", rss: "RSS", rights: "All rights reserved." },
  },
};

/* --------------------------------------------------------------- chrome -- */
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
  const next = theme === "dark" ? "light" : "dark";
  return (
    <button className="rc-icon-btn" onClick={() => setTheme(next)}
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
        <a href="#" onClick={(e) => e.preventDefault()}>{t.nav.projects}</a>
        <a href="#" onClick={(e) => e.preventDefault()}>{t.nav.about}</a>
      </nav>
      <div className="rc-nav__right">
        <button className="rc-search" aria-label={t.search}>
          <Icon name="search" size={16} />
          <span>{t.search}</span>
          <kbd>⌘K</kbd>
        </button>
        <LangSwitch lang={lang} setLang={setLang} />
        <ThemeToggle theme={theme} setTheme={setTheme} />
      </div>
    </header>
  );
}

/* ----------------------------------------------------------------- views */
function Hero({ h }) {
  return (
    <section className="rc-hero">
      <span className="rc-eyebrow">{h.eyebrow}</span>
      <h1 className="rc-hero__line">{h.line}</h1>
      <p className="rc-hero__sub">{h.sub}</p>
      <button className="rc-btn rc-btn--primary">{h.cta} →</button>
    </section>
  );
}

function ArticleRow({ a, t }) {
  return (
    <button className="rc-arow">
      <div className="rc-arow__head">
        <span className="rc-eyebrow">{a.tags[0]}</span>
        <div className="rc-meta">
          <span>{a.date}</span><span className="rc-meta__dot"></span><span>{a.read}</span>
        </div>
      </div>
      <h3 className="rc-arow__title">{a.title}</h3>
      <div className="rc-arow__tags">
        {a.tags.map((tag) => <span key={tag} className="rc-tag">{tag}</span>)}
      </div>
      <span className="rc-arow__cta">{t.read} →</span>
    </button>
  );
}

function ProjectCard({ p, t }) {
  return (
    <article className="rc-pcard is-ph">
      <div className="rc-pcard__cap">
        <span className="rc-pcard__n">PROJET · {p.n}</span>
        <rc-avatar size={48} state="static"></rc-avatar>
        <span className="rc-pcard__status is-ph">{p.status}</span>
      </div>
      <div className="rc-pcard__body">
        <h3 className="rc-pcard__title is-ph">{t.projTitle} {p.n}</h3>
        <p className="rc-pcard__note">{p.note}</p>
        <p className="rc-pcard__desc">{t.projDesc}</p>
        <div className="rc-pcard__foot">
          <span className="rc-pcard__arrow">→</span>
        </div>
      </div>
    </article>
  );
}

function Footer({ t, lang, setLang, theme, setTheme }) {
  return (
    <footer className="rc-footer">
      <div className="rc-footer__top">
        <span className="rc-footer__word">rachid chabane<span className="rc-dot">.</span></span>
        <a className="rc-rss" href="#" onClick={(e) => e.preventDefault()}>
          <Icon name="rss" size={14} />{t.footer.rss}
        </a>
        <span className="rc-footer__spacer"></span>
        <div className="rc-footer__controls">
          <LangSwitch lang={lang} setLang={setLang} />
          <ThemeToggle theme={theme} setTheme={setTheme} />
        </div>
      </div>
      <div className="rc-footer__credit">
        <span className="rc-eyebrow">{t.footer.credit}</span>
      </div>
      <span className="rc-footer__small">© 2026 rachid chabane · {t.footer.rights}</span>
    </footer>
  );
}

/* ------------------------------------------------------- chat dock (idle) */
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
    setMsgs((m) => [...m, { who: "me", text: v }]);
    setVal(""); setThinking(true);
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

/* ------------------------------------------------------- full home screen */
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
          <main className="rc-main rc-enter">
            <Hero h={t.hero} />

            <section className="rc-block">
              <div className="rc-block__head">
                <h2 className="rc-block__title">{t.secArticles}</h2>
                <button className="rc-btn rc-btn--ghost">{t.secAll} →</button>
              </div>
              <div className="rc-arows">
                {t.articles.map((a) => <ArticleRow key={a.id} a={a} t={t} />)}
              </div>
            </section>

            <section className="rc-block">
              <div className="rc-block__head">
                <h2 className="rc-block__title">{t.secProjects}</h2>
                <a className="rc-teaser-all" href="#" onClick={(e) => e.preventDefault()}>{t.secPortfolio} →</a>
              </div>
              <div className="rc-pgrid rc-teaser">
                {t.projects.map((p) => <ProjectCard key={p.n} p={p} t={t} />)}
              </div>
            </section>
          </main>
          <Footer t={t} lang={lang} setLang={setLang} theme={theme} setTheme={setTheme} />
        </div>
      </div>
      <ChatDock t={t} onState={setAvatarState} />
    </div>
  );
}

/* ----------------------------------------------------------- review panels */
function Panel({ num, name, meta, theme, lang, scale }) {
  return (
    <section className="panel">
      <div className="panel__label">
        <span className="panel__num">{num}</span>
        <span className="panel__name">{name}</span>
        <span className="panel__meta">{meta}</span>
      </div>
      <div className="frame-outer" style={{ width: 1440 * scale, height: 1024 * scale }}>
        <div style={{ transform: `scale(${scale})`, transformOrigin: "top left", width: 1440, height: 1024 }}>
          <SiteApp initialTheme={theme} initialLang={lang} />
        </div>
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
      <span className="gallery__eyebrow">rachidchabane · écran 01</span>
      <h1 className="gallery__title">Accueil — Home</h1>
      <p className="gallery__lead">
        Hero typographique, liste « Derniers articles », teaser « Projets » et chrome partagé
        (masthead, recherche, FR⇄EN, clair/sombre, avatar idle). Trois registres réels en 1440×1024 —
        chaque panneau est interactif : changez de thème, de langue, ouvrez l’agent.
      </p>
      <div className="gallery__notes">
        <span className="gallery__chip">Fraunces · Inter · JetBrains Mono</span>
        <span className="gallery__chip">accent Iris, parcimonieux</span>
        <span className="gallery__chip">noms de projets en attente — placeholders</span>
        <span className="gallery__chip">aucun emoji · aucune chrome marketing</span>
      </div>

      <div className="panels">
        <Panel num="A" name="Accueil · FR · clair" meta="primaire · 1440×1024" theme="light" lang="fr" scale={scale} />
        <Panel num="B" name="Accueil · FR · sombre" meta="registre sombre · 1440×1024" theme="dark" lang="fr" scale={scale} />
        <Panel num="C" name="Home · EN · clair" meta="parallèle anglais · 1440×1024" theme="light" lang="en" scale={scale} />
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<Gallery />);
