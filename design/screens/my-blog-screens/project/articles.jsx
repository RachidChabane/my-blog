/* articles.jsx — Article index (Articles) for rachidchabane.
   A clean editorial list, newest first, with a tag-filter chip rail and an
   inline find field; pagination at the foot. The same component renders the
   tag-filtered and empty-search states. Shared chrome + idle avatar throughout.
   Panels: FR·light (primary), FR·dark, EN·light, FR filtered to one tag,
   FR empty-search. */
const { useState, useEffect, useMemo, useRef } = React;

/* ----------------------------------------------------------------- icons */
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

/* ------------------------------------------------------------- articles */
/* tag keys are language-neutral; labels resolve per language */
const ART = [
  { id: "agents-det", date: "30-05-2026", read: "7 min", tags: ["agents", "agentic-coding"],
    title: { fr: "Orchestrer des agents de code avec des workflows déterministes",
             en: "Orchestrating coding agents with deterministic workflows" },
    dek: { fr: "Découper une tâche d’ingénierie en étapes vérifiables, et laisser l’agent échouer tôt plutôt que tard.",
           en: "Break an engineering task into verifiable steps, and let the agent fail early rather than late." } },
  { id: "rag-hybride", date: "27-05-2026", read: "9 min", tags: ["rag", "retrieval"],
    title: { fr: "RAG hybride : la fusion de rang réciproque en pratique",
             en: "Hybrid RAG: reciprocal rank fusion in practice" },
    dek: { fr: "Combiner BM25 et vecteurs sans régler dix poids : le rang suffit.",
           en: "Combine BM25 and vectors without tuning ten weights: rank is enough." } },
  { id: "garde-fous", date: "23-05-2026", read: "6 min", tags: ["evaluation", "qualite"],
    title: { fr: "Garde-fous de publication : un pipeline de fact-checking automatisé",
             en: "Publication guardrails: an automated fact-checking pipeline" },
    dek: { fr: "Avant de publier, l’agent doit prouver ce qu’il avance — sources à l’appui.",
           en: "Before publishing, the agent must prove its claims — sources attached." } },
  { id: "quantif", date: "19-05-2026", read: "8 min", tags: ["llm-oss"],
    title: { fr: "Quantifier un modèle ouvert sans le casser",
             en: "Quantizing an open model without breaking it" },
    dek: { fr: "GPTQ, AWQ, GGUF : ce que la quantification coûte vraiment, mesuré.",
           en: "GPTQ, AWQ, GGUF: what quantization actually costs, measured." } },
  { id: "contexte", date: "15-05-2026", read: "5 min", tags: ["agents", "evaluation"],
    title: { fr: "Le contexte n’est pas gratuit : budget de tokens et latence",
             en: "Context isn’t free: token budget and latency" },
    dek: { fr: "Chaque token de contexte est un arbitrage entre rappel, coût et délai.",
           en: "Every context token is a trade-off between recall, cost and delay." } },
  { id: "eval-agent", date: "12-05-2026", read: "10 min", tags: ["agents", "evaluation"],
    title: { fr: "Évaluer un agent outillé : au-delà du taux de réussite",
             en: "Evaluating a tool-using agent: beyond success rate" },
    dek: { fr: "Un agent qui réussit la tâche mais saccage l’état n’a pas réussi.",
           en: "An agent that completes the task but wrecks the state hasn’t succeeded." } },
  { id: "index-code", date: "08-05-2026", read: "7 min", tags: ["rag", "agentic-coding"],
    title: { fr: "Indexer du code pour la récupération : AST plutôt que lignes",
             en: "Indexing code for retrieval: AST over lines" },
    dek: { fr: "Découper sur la structure, pas sur les sauts de ligne, change tout au rappel.",
           en: "Chunking on structure, not line breaks, changes everything for recall." } },
  { id: "servir-llm", date: "04-05-2026", read: "11 min", tags: ["llm-oss", "retrieval"],
    title: { fr: "Servir un LLM open-source en production : le coût réel",
             en: "Serving an open-source LLM in production: the real cost" },
    dek: { fr: "vLLM, batching continu, KV-cache : où part vraiment la VRAM.",
           en: "vLLM, continuous batching, KV-cache: where the VRAM really goes." } },
];

const TAG_LABELS = {
  fr: { agents: "agents", rag: "RAG", "agentic-coding": "agentic coding", evaluation: "évaluation",
        "llm-oss": "LLM open-source", retrieval: "retrieval", qualite: "qualité" },
  en: { agents: "agents", rag: "RAG", "agentic-coding": "agentic coding", evaluation: "evaluation",
        "llm-oss": "open-source LLM", retrieval: "retrieval", qualite: "quality" },
};
const TAG_ORDER = ["agents", "rag", "agentic-coding", "evaluation", "llm-oss", "retrieval"];

const T = {
  fr: {
    nav: { articles: "Articles", projects: "Projets", about: "À propos" }, search: "Rechercher",
    pageTitle: "Articles", all: "Tous",
    count: (n) => `${n} écrits · du plus récent`, find: "Filtrer par mot…",
    read: "Lire", prev: "Précédent", next: "Suivant",
    emptyTitle: "Aucun résultat", clear: "Effacer la recherche",
    emptyNote: (q) => <>Rien ne correspond à <b>« {q} »</b> dans les écrits publiés. Essayez un autre terme ou un tag.</>,
    chat: { title: "Demander à l’agent", placeholder: "Chercher dans les écrits…",
      seed: "Je peux retrouver un écrit par sujet ou par tag. Que cherchez-vous ?",
      reply: "Je vois plusieurs écrits sur les agents et l’évaluation. Voulez-vous le plus récent ?" },
    footer: { credit: "écrit et maintenu de façon autonome", rss: "RSS", rights: "Tous droits réservés." },
  },
  en: {
    nav: { articles: "Articles", projects: "Projects", about: "About" }, search: "Search",
    pageTitle: "Articles", all: "All",
    count: (n) => `${n} posts · newest first`, find: "Filter by keyword…",
    read: "Read", prev: "Previous", next: "Next",
    emptyTitle: "No results", clear: "Clear search",
    emptyNote: (q) => <>Nothing matches <b>“{q}”</b> in the published writing. Try another term or a tag.</>,
    chat: { title: "Ask the agent", placeholder: "Search the writing…",
      seed: "I can find a post by topic or tag. What are you looking for?",
      reply: "I see several posts on agents and evaluation. Want the most recent?" },
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
        <a href="#" className="is-current" onClick={(e) => e.preventDefault()}>{t.nav.articles}</a>
        <a href="#" onClick={(e) => e.preventDefault()}>{t.nav.projects}</a>
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

/* ------------------------------------------------------------- index view */
function IndexRow({ a, t, lang }) {
  return (
    <button className="rc-arow">
      <div className="rc-arow__head">
        <div className="rc-meta">
          <span>{a.date}</span><span className="rc-meta__dot"></span><span>{a.read}</span>
        </div>
      </div>
      <h3 className="rc-arow__title">{a.title[lang]}</h3>
      <p className="rc-arow__dek">{a.dek[lang]}</p>
      <div className="rc-arow__tags">
        {a.tags.map((tg) => <span key={tg} className="rc-tag">{TAG_LABELS[lang][tg]}</span>)}
      </div>
      <span className="rc-arow__cta">{t.read} →</span>
    </button>
  );
}

function IndexView({ t, lang, initialTag = null, initialQuery = "" }) {
  const [tag, setTag] = useState(initialTag);
  const [q, setQ] = useState(initialQuery);
  const [page, setPage] = useState(1);

  const results = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return ART.filter((a) => {
      if (tag && !a.tags.includes(tag)) return false;
      if (!needle) return true;
      const hay = (a.title[lang] + " " + a.dek[lang] + " " + a.tags.map((x) => TAG_LABELS[lang][x]).join(" ")).toLowerCase();
      return hay.includes(needle);
    });
  }, [tag, q, lang]);

  return (
    <main className="rc-main rc-index rc-enter">
      <div className="rc-pagehd">
        <span className="rc-eyebrow">{lang === "fr" ? "Carnet" : "Notebook"}</span>
        <h1 className="rc-pagehd__title">{t.pageTitle}</h1>
        <span className="rc-pagehd__meta">{t.count(ART.length)}</span>
      </div>

      <div className="rc-filterbar">
        <div className="rc-chiprow" role="group" aria-label={lang === "fr" ? "Filtrer par tag" : "Filter by tag"}>
          <button className={"rc-chip" + (tag === null ? " is-on" : "")} onClick={() => setTag(null)}>{t.all}</button>
          {TAG_ORDER.map((tg) => (
            <button key={tg} className={"rc-chip" + (tag === tg ? " is-on" : "")}
              onClick={() => setTag(tag === tg ? null : tg)}>{TAG_LABELS[lang][tg]}</button>
          ))}
        </div>
        <label className="rc-find">
          <Icon name="search" size={16} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t.find}
            aria-label={t.find} />
        </label>
      </div>

      {results.length > 0 ? (
        <div className="rc-arows">
          {results.map((a) => <IndexRow key={a.id} a={a} t={t} lang={lang} />)}
        </div>
      ) : (
        <div className="rc-empty">
          <rc-avatar size={56} state="static"></rc-avatar>
          <h2 className="rc-empty__title">{t.emptyTitle}</h2>
          <p className="rc-empty__note">{t.emptyNote(q || (tag ? TAG_LABELS[lang][tag] : ""))}</p>
          <button className="rc-empty__clear" onClick={() => { setQ(""); setTag(null); }}>{t.clear} ←</button>
        </div>
      )}

      {results.length > 0 && (
        <nav className="rc-pager" aria-label="Pagination">
          <button className="rc-pager__btn rc-pager__edge" disabled>← {t.prev}</button>
          <button className="rc-pager__btn is-on">1</button>
          <button className="rc-pager__btn">2</button>
          <button className="rc-pager__btn">3</button>
          <button className="rc-pager__btn rc-pager__edge">{t.next} →</button>
        </nav>
      )}
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
function SiteApp({ initialTheme, initialLang, initialTag, initialQuery }) {
  const [theme, setTheme] = useState(initialTheme);
  const [lang, setLang] = useState(initialLang);
  const [avatarState, setAvatarState] = useState("idle");
  const t = T[lang];
  return (
    <div className="frame" data-theme={theme}>
      <div className="frame-scroll">
        <div className="rc-app">
          <Nav t={t} lang={lang} setLang={setLang} theme={theme} setTheme={setTheme} avatarState={avatarState} />
          <IndexView t={t} lang={lang} initialTag={initialTag} initialQuery={initialQuery} key={lang} />
          <Footer t={t} lang={lang} setLang={setLang} theme={theme} setTheme={setTheme} />
        </div>
      </div>
      <ChatDock t={t} onState={setAvatarState} />
    </div>
  );
}

/* ------------------------------------------------------------- panels */
function Panel({ num, name, meta, theme, lang, scale, initialTag, initialQuery }) {
  return (
    <section className="panel">
      <div className="panel__label">
        <span className="panel__num">{num}</span>
        <span className="panel__name">{name}</span>
        <span className="panel__meta">{meta}</span>
      </div>
      <div className="frame-outer" style={{ width: 1440 * scale, height: 1024 * scale }}>
        <div style={{ transform: `scale(${scale})`, transformOrigin: "top left", width: 1440, height: 1024 }}>
          <SiteApp initialTheme={theme} initialLang={lang} initialTag={initialTag} initialQuery={initialQuery} />
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
      <span className="gallery__eyebrow">rachidchabane · écran 03</span>
      <h1 className="gallery__title">Article index — Articles</h1>
      <p className="gallery__lead">
        Liste éditoriale (pas de grille magazine) : titre Fraunces, dek d’une ligne, date, tags, durée.
        Rail de tags + filtre par mot en tête, pagination au pied. Le même gabarit sert les pages de tag
        et de recherche — d’où l’état filtré et l’état « Aucun résultat ». Chips et recherche réellement actifs.
      </p>
      <div className="gallery__notes">
        <span className="gallery__chip">8 écrits · mai 2026</span>
        <span className="gallery__chip">tags : agents · RAG · agentic coding · évaluation · LLM open-source</span>
        <span className="gallery__chip">aucune image héro · aucun badge · un seul auteur</span>
      </div>
      <div className="panels">
        <Panel num="A" name="Articles · FR · clair" meta="primaire · tous les tags" theme="light" lang="fr" scale={scale} />
        <Panel num="B" name="Articles · FR · sombre" meta="registre sombre" theme="dark" lang="fr" scale={scale} />
        <Panel num="C" name="Articles · EN · clair" meta="parallèle anglais" theme="light" lang="en" scale={scale} />
        <Panel num="D" name="Filtré · tag « agents »" meta="page de tag · même gabarit" theme="light" lang="fr" scale={scale} initialTag="agents" />
        <Panel num="E" name="Recherche · aucun résultat" meta="état vide · quiet" theme="light" lang="fr" scale={scale} initialQuery="kubernetes" />
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<Gallery />);
