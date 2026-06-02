/* project-detail.jsx — Project detail (Projet) for rachidchabane.
   A credible deep-write-up scaffold in the article's reading column. Section
   HEADINGS are real; body is clearly-marked OWNER-FILLED placeholders — no
   invented numbers, codenames, or anything private. Shared chrome + idle avatar.
   Panels: FR·light (primary), FR·dark, EN·light. */
const { useState, useEffect, useRef } = React;

const ICONS = {
  search: <><circle cx="11" cy="11" r="7"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></>,
  moon: <path d="M12 3a6.4 6.4 0 0 0 9 9 9 9 0 1 1-9-9Z"></path>,
  sun: <><circle cx="12" cy="12" r="4"></circle><line x1="12" y1="2" x2="12" y2="4"></line><line x1="12" y1="20" x2="12" y2="22"></line><line x1="4.9" y1="4.9" x2="6.3" y2="6.3"></line><line x1="17.7" y1="17.7" x2="19.1" y2="19.1"></line><line x1="2" y1="12" x2="4" y2="12"></line><line x1="20" y1="12" x2="22" y2="12"></line><line x1="4.9" y1="19.1" x2="6.3" y2="17.7"></line></>,
  x: <><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></>,
  up: <><line x1="12" y1="19" x2="12" y2="5"></line><polyline points="5 12 12 5 19 12"></polyline></>,
  rss: <><path d="M4 11a9 9 0 0 1 9 9"></path><path d="M4 4a16 16 0 0 1 16 16"></path><circle cx="5" cy="19" r="1"></circle></>,
  link: <><path d="M9 15 15 9"></path><path d="M11 6l1-1a4 4 0 0 1 6 6l-1 1"></path><path d="M13 18l-1 1a4 4 0 0 1-6-6l1-1"></path></>,
};
function Icon({ name, size = 18 }) {
  return (
    <svg className="rc-ico" width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true">{ICONS[name]}</svg>
  );
}

const STACK = ["Python", "LLM", "RAG", "PostgreSQL"];

const T = {
  fr: {
    nav: { articles: "Articles", projects: "Projets", about: "À propos" }, search: "Rechercher",
    back: "Tous les projets",
    eyebrow: "PROJET · 01 · maintenu par l’agent",
    name: "[Projet — nom public]",
    summary: "[résumé public en une ligne — ce que résout le projet, sans détail interne]",
    status: "En production",
    statusLine: "maintenu en continu, sous revue humaine",
    h: { what: "Ce que c’est", eng: "Ingénierie", stack: "Stack", status: "Statut", links: "Liens", related: "Articles liés" },
    whatPh: { label: "à compléter — public", text: "[ce que fait le projet, en clair : le problème, l’usage, pour qui]" },
    engIntro: "La section de fond — architecture, décisions, et ce que les mesures ont révélé. Renseignée par l’auteur en texte public-safe ; rien d’interne.",
    engBlocks: [
      { label: "architecture", text: "[schéma des composants et du flux de données ; où vit l’état, où passe la latence]" },
      { label: "choix techniques", text: "[les arbitrages assumés : pourquoi cette approche plutôt qu’une autre, ce qu’elle coûte]" },
      { label: "résultats", text: "[ce que les évaluations ont montré — formulé sans chiffre inventé, sources à l’appui]" },
    ],
    figure: "[schéma d’architecture — à fournir]",
    stackPh: "+ dépendances",
    linkKeys: { repo: "Repo", demo: "Démo" }, linkVal: "[url publique]",
    related: [
      { title: "RAG hybride : la fusion de rang réciproque en pratique", date: "27-05-2026", read: "9 min" },
      { title: "Indexer du code pour la récupération : AST plutôt que lignes", date: "08-05-2026", read: "7 min" },
    ],
    chat: { title: "Demander à l’agent", placeholder: "Une question sur ce projet…",
      seed: "Je décris ce projet à partir du texte public de cette page. Que voulez-vous savoir ?",
      reply: "Le contenu public sera renseigné par l’auteur. Je ne divulgue ni codename ni détail interne. Souhaitez-vous le périmètre fonctionnel ?" },
    footer: { credit: "écrit et maintenu de façon autonome", rss: "RSS", rights: "Tous droits réservés." },
  },
  en: {
    nav: { articles: "Articles", projects: "Projects", about: "About" }, search: "Search",
    back: "All projects",
    eyebrow: "PROJECT · 01 · agent-maintained",
    name: "[Project — public name]",
    summary: "[public one-line summary — what the project solves, no internal detail]",
    status: "In production",
    statusLine: "continuously maintained, under human review",
    h: { what: "What it is", eng: "Engineering", stack: "Stack", status: "Status", links: "Links", related: "Related articles" },
    whatPh: { label: "owner-filled — public", text: "[what the project does, plainly: the problem, the use, for whom]" },
    engIntro: "The substance — architecture, decisions, and what the measurements revealed. Owner-filled in public-safe prose; nothing internal.",
    engBlocks: [
      { label: "architecture", text: "[component and data-flow diagram; where state lives, where latency goes]" },
      { label: "technical choices", text: "[the owned trade-offs: why this approach over another, what it costs]" },
      { label: "results", text: "[what the evaluations showed — stated without invented numbers, sources attached]" },
    ],
    figure: "[architecture diagram — to be provided]",
    stackPh: "+ dependencies",
    linkKeys: { repo: "Repo", demo: "Demo" }, linkVal: "[public url]",
    related: [
      { title: "Hybrid RAG: reciprocal rank fusion in practice", date: "27-05-2026", read: "9 min" },
      { title: "Indexing code for retrieval: AST over lines", date: "08-05-2026", read: "7 min" },
    ],
    chat: { title: "Ask the agent", placeholder: "A question about this project…",
      seed: "I describe this project from the public text on this page. What would you like to know?",
      reply: "The public content is owner-filled. I disclose no codename or internal detail. Want the functional scope?" },
    footer: { credit: "written and maintained autonomously", rss: "RSS", rights: "All rights reserved." },
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

function Ph({ label, text, figure }) {
  return (
    <div className={"rc-ph" + (figure ? " rc-ph--figure" : "")}>
      <span className="rc-ph__label">{label}</span>
      <span className="rc-ph__text">{text}</span>
    </div>
  );
}

/* ------------------------------------------------------ project detail view */
function ProjectDetail({ t, lang }) {
  return (
    <main className="rc-main rc-article is-narrow rc-enter">
      <button className="rc-back">← {t.back}</button>
      <span className="rc-eyebrow">{t.eyebrow}</span>
      <h1 className="rc-article__title">{t.name}</h1>
      <p className="rc-projd__summary">{t.summary}</p>
      <div className="rc-projd__meta">
        <span className="rc-pstatus is-live"><span className="rc-pstatus__dot"></span>{t.status}</span>
        <span className="rc-meta__dot"></span>
        <span className="rc-meta"><span>{STACK.slice(0, 3).join(" · ")}</span></span>
        <span className="rc-meta__dot"></span>
        <span className="rc-meta"><span>FR / EN</span></span>
      </div>

      <section className="rc-sec">
        <h2 className="rc-sec__h"><span className="rc-sec__n">01</span>{t.h.what}</h2>
        <Ph label={t.whatPh.label} text={t.whatPh.text} />
      </section>

      <section className="rc-sec">
        <h2 className="rc-sec__h"><span className="rc-sec__n">02</span>{t.h.eng}</h2>
        <p className="rc-sec__intro">{t.engIntro}</p>
        {t.engBlocks.map((b, i) => <Ph key={i} label={b.label} text={b.text} />)}
        <div style={{ marginTop: 12 }}><Ph label="figure" text={t.figure} figure /></div>
      </section>

      <section className="rc-sec">
        <h2 className="rc-sec__h"><span className="rc-sec__n">03</span>{t.h.stack}</h2>
        <div className="rc-stack">
          {STACK.map((s) => <span key={s} className="rc-tag">{s}</span>)}
          <span className="rc-tag is-ph">{t.stackPh}</span>
        </div>
      </section>

      <section className="rc-sec">
        <h2 className="rc-sec__h"><span className="rc-sec__n">04</span>{t.h.status}</h2>
        <p className="rc-statusline">
          <span className="rc-pstatus is-live"><span className="rc-pstatus__dot"></span>{t.status}</span>
          <span>— {t.statusLine}</span>
        </p>
      </section>

      <section className="rc-sec">
        <h2 className="rc-sec__h"><span className="rc-sec__n">05</span>{t.h.links}</h2>
        <div className="rc-links">
          {["repo", "demo"].map((k) => (
            <span className="rc-linkchip" key={k}>
              <Icon name="link" size={14} />
              <span className="rc-linkchip__key">{t.linkKeys[k]}</span>
              <span className="rc-linkchip__val">{t.linkVal}</span>
              <span className="rc-linkchip__ext">↗</span>
            </span>
          ))}
        </div>
      </section>

      <section className="rc-sec">
        <h2 className="rc-sec__h"><span className="rc-sec__n">06</span>{t.h.related}</h2>
        <div className="rc-rel">
          {t.related.map((r, i) => (
            <button className="rc-rel__row" key={i}>
              <span className="rc-rel__title">{r.title}</span>
              <span className="rc-rel__meta">{r.date} · {r.read}</span>
            </button>
          ))}
        </div>
      </section>
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
          <ProjectDetail t={t} lang={lang} />
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
      <span className="gallery__eyebrow">rachidchabane · écran 05</span>
      <h1 className="gallery__title">Project detail — Projet</h1>
      <p className="gallery__lead">
        Écriture de fond d’un projet phare, en colonne de lecture. Les <b>titres de section sont réels</b>
        (Ce que c’est · Ingénierie · Stack · Statut · Liens · Articles liés), le corps reste un
        <b> gabarit à compléter</b> en texte public-safe. Aucun chiffre inventé, aucun codename, rien d’interne.
      </p>
      <div className="gallery__notes">
        <span className="gallery__chip">colonne ~680px · comme l’article</span>
        <span className="gallery__chip">placeholders explicites · owner-filled</span>
        <span className="gallery__chip">liens repo/démo en attente</span>
      </div>
      <div className="panels">
        <Panel num="A" name="Projet · FR · clair" meta="primaire · 1440×1024" theme="light" lang="fr" scale={scale} />
        <Panel num="B" name="Projet · FR · sombre" meta="registre sombre" theme="dark" lang="fr" scale={scale} />
        <Panel num="C" name="Project · EN · clair" meta="parallèle anglais" theme="light" lang="en" scale={scale} />
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<Gallery />);
