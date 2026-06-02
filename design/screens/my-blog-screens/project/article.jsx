/* article.jsx — Article reading surface for rachidchabane.
   A single editorial column (~680px measure): Fraunces title, meta row,
   long-form Inter body with one Python code block and one pull-quote, a
   Sources list with resolving links, and prev/next-by-topic at the foot.
   Shared chrome (masthead, FR/EN, theme, footer, idle avatar) on every panel.
   Rendered into four review panels: FR·light, FR·dark, EN·light, Sources close-up. */
const { useState, useEffect, useRef } = React;

/* ----------------------------------------------------------------- icons */
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

/* ------------------------------------------------------------------ data */
const T = {
  fr: {
    nav: { articles: "Articles", projects: "Projets", about: "À propos" },
    search: "Rechercher",
    back: "Tous les articles",
    eyebrow: "RAG · maintenu par l’agent",
    title: "RAG hybride : la fusion de rang réciproque en pratique",
    meta: ["27-05-2026", "RAG", "retrieval", "9 min", "FR / EN"],
    body: [
      "La récupération lexicale et la récupération dense échouent rarement aux mêmes endroits. BM25 excelle sur les correspondances exactes — un nom de fonction, une référence, un identifiant rare — mais reste sourd au sens. Les vecteurs denses capturent la proximité sémantique, et passent à côté du terme littéral que l’utilisateur a pourtant tapé. Choisir l’un contre l’autre, c’est accepter une cécité que l’on connaît d’avance.",
      "L’hybride ne cherche pas le meilleur des deux par moyenne pondérée — ce réglage est fragile et ne survit pas au changement de corpus. La fusion de rang réciproque (RRF) procède autrement : elle ignore les scores bruts, incomparables d’un système à l’autre, et ne retient que le rang. Chaque document reçoit une contribution décroissante selon sa position dans chaque classement, puis on additionne.",
      "Concrètement, on somme 1 / (k + rang) sur l’ensemble des classements, avec k une constante d’amortissement — 60 est la valeur de référence de l’article d’origine. Un document bien placé partout remonte ; un document seul en tête d’une seule liste est tempéré. C’est sans paramètre à apprendre, déterministe, et trivial à rejouer.",
      "En production, trois détails comptent davantage que la formule : dédupliquer les identifiants avant la fusion, plafonner la profondeur de chaque liste pour borner la latence, et journaliser le rang d’origine de chaque source pour le débogage. Le reste — pondérations savantes, re-ranking neuronal — vient après, une fois que la base hybride tient.",
    ],
    pull: "Fusionner deux classements imparfaits vaut mieux que sur-optimiser un seul.",
    sourcesH: "Sources",
    sources: [
      { title: "Reciprocal Rank Fusion outperforms Condorcet and individual rank learning methods",
        who: "Cormack, Clarke & Büttcher", date: "SIGIR 2009",
        href: "https://dl.acm.org/doi/10.1145/1571941.1572114" },
      { title: "Reciprocal rank fusion (RRF) — Elasticsearch Reference",
        who: "Elastic", date: "2024",
        href: "https://www.elastic.co/guide/en/elasticsearch/reference/current/rrf.html" },
      { title: "Hybrid search — combiner BM25 et vecteurs",
        who: "Weaviate Docs", date: "2025",
        href: "https://weaviate.io/developers/weaviate/search/hybrid" },
    ],
    prev: { dir: "Précédent", topic: "retrieval", title: "Récupération dense : quand l’embedding suffit" },
    next: { dir: "Suivant", topic: "retrieval", title: "Re-ranking : le dernier kilomètre de la pertinence" },
    chat: { title: "Demander à l’agent", placeholder: "Une question sur cet article…",
      seed: "Je réponds à partir de cet article et du reste du site. Sur le RAG hybride, que voulez-vous préciser ?",
      reply: "En bref : RRF fusionne les classements lexical et dense par leur rang, pas leur score, avec k = 60. Voulez-vous le détail du code ?" },
    footer: { credit: "écrit et maintenu de façon autonome", rss: "RSS", rights: "Tous droits réservés." },
  },
  en: {
    nav: { articles: "Articles", projects: "Projects", about: "About" },
    search: "Search",
    back: "All articles",
    eyebrow: "RAG · agent-maintained",
    title: "Hybrid RAG: reciprocal rank fusion in practice",
    meta: ["27-05-2026", "RAG", "retrieval", "9 min", "FR / EN"],
    body: [
      "Lexical and dense retrieval rarely fail in the same places. BM25 excels at exact matches — a function name, a citation, a rare identifier — but is deaf to meaning. Dense vectors capture semantic proximity and miss the literal term the user actually typed. Picking one over the other means accepting a blindness you already know about.",
      "Hybrid retrieval isn’t a weighted average of the two — that knob is brittle and doesn’t survive a change of corpus. Reciprocal rank fusion (RRF) takes another route: it ignores raw scores, which aren’t comparable across systems, and keeps only rank. Each document earns a decreasing contribution from its position in each ranking, and we sum.",
      "Concretely, you sum 1 / (k + rank) across all rankings, with k a damping constant — 60 is the value from the original paper. A document ranked well everywhere rises; one alone at the top of a single list is tempered. No parameter to learn, deterministic, trivial to replay.",
      "In production, three details matter more than the formula: deduplicate ids before fusing, cap each list’s depth to bound latency, and log every source’s original rank for debugging. The rest — clever weightings, neural re-ranking — comes after, once the hybrid base holds.",
    ],
    pull: "Fusing two imperfect rankings beats over-optimizing a single one.",
    sourcesH: "Sources",
    sources: [
      { title: "Reciprocal Rank Fusion outperforms Condorcet and individual rank learning methods",
        who: "Cormack, Clarke & Büttcher", date: "SIGIR 2009",
        href: "https://dl.acm.org/doi/10.1145/1571941.1572114" },
      { title: "Reciprocal rank fusion (RRF) — Elasticsearch Reference",
        who: "Elastic", date: "2024",
        href: "https://www.elastic.co/guide/en/elasticsearch/reference/current/rrf.html" },
      { title: "Hybrid search — combining BM25 and vectors",
        who: "Weaviate Docs", date: "2025",
        href: "https://weaviate.io/developers/weaviate/search/hybrid" },
    ],
    prev: { dir: "Previous", topic: "retrieval", title: "Dense retrieval: when the embedding is enough" },
    next: { dir: "Next", topic: "retrieval", title: "Re-ranking: the last mile of relevance" },
    chat: { title: "Ask the agent", placeholder: "A question about this article…",
      seed: "I answer from this article and the rest of the site. On hybrid RAG, what would you like clarified?",
      reply: "In short: RRF fuses lexical and dense rankings by rank, not score, with k = 60. Want the code walked through?" },
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

/* --------------------------------------------------------------- sources */
function Sources({ t }) {
  return (
    <section className="rc-sources" aria-label={t.sourcesH}>
      <h2 className="rc-sources__h">{t.sourcesH}</h2>
      {t.sources.map((s, i) => (
        <div className="rc-source" key={i}>
          <span className="rc-source__n">{String(i + 1).padStart(2, "0")}</span>
          <div className="rc-source__main">
            <div className="rc-source__title">
              <a href={s.href} target="_blank" rel="noopener noreferrer">{s.title}<span className="rc-source__ext">↗</span></a>
            </div>
            <div className="rc-source__meta">
              <span>{s.who}</span><span className="rc-meta__dot"></span><span>{s.date}</span>
              <span className="rc-meta__dot"></span><span>{new URL(s.href).hostname.replace(/^www\./, "")}</span>
            </div>
          </div>
        </div>
      ))}
    </section>
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

/* ----------------------------------------------------------- article view */
function ArticleBody({ t }) {
  return (
    <main className="rc-main rc-article is-narrow rc-enter">
      <button className="rc-back">← {t.back}</button>
      <span className="rc-eyebrow">{t.eyebrow}</span>
      <h1 className="rc-article__title">{t.title}</h1>
      <div className="rc-meta">
        {t.meta.map((m, i) => (
          <React.Fragment key={i}>
            {i > 0 && <span className="rc-meta__dot"></span>}<span>{m}</span>
          </React.Fragment>
        ))}
      </div>

      <div className="rc-article__body">
        <p className="rc-drop">{t.body[0]}</p>
        <p>{t.body[1]}</p>
        <blockquote className="rc-pull">« {t.pull} »</blockquote>
        <p>{t.body[2]}</p>
        <pre className="rc-code"><code><span className="c"># reciprocal rank fusion — fusionne N classements par leur rang</span>{"\n"}<span className="k">from</span> collections <span className="k">import</span> defaultdict{"\n"}{"\n"}<span className="k">def</span> rrf(rankings, k=<span className="k">60</span>):{"\n"}    scores = defaultdict(<span className="k">float</span>){"\n"}    <span className="k">for</span> ranking <span className="k">in</span> rankings:{"\n"}        <span className="k">for</span> rank, doc_id <span className="k">in</span> enumerate(ranking):{"\n"}            scores[doc_id] += <span className="k">1</span> / (k + rank + <span className="k">1</span>){"\n"}    <span className="k">return</span> sorted(scores, key=scores.get, reverse=<span className="k">True</span>)</code></pre>
        <p>{t.body[3]}</p>
      </div>

      <Sources t={t} />

      <nav className="rc-pn" aria-label={t.prev.dir + " / " + t.next.dir}>
        <button className="rc-pn__card rc-pn__card--prev">
          <span className="rc-pn__dir">← {t.prev.dir}</span>
          <span className="rc-pn__title">{t.prev.title}</span>
          <span className="rc-pn__topic">{t.prev.topic}</span>
        </button>
        <button className="rc-pn__card rc-pn__card--next">
          <span className="rc-pn__dir">{t.next.dir} →</span>
          <span className="rc-pn__title">{t.next.title}</span>
          <span className="rc-pn__topic">{t.next.topic}</span>
        </button>
      </nav>
    </main>
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
          <ArticleBody t={t} />
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

function CloseupPanel({ num, name, meta, scale }) {
  return (
    <section className="panel">
      <div className="panel__label">
        <span className="panel__num">{num}</span>
        <span className="panel__name">{name}</span>
        <span className="panel__meta">{meta}</span>
      </div>
      <div className="closeup-card" data-theme="light">
        <Sources t={T.fr} />
        <nav className="rc-pn" aria-label="prev / next">
          <button className="rc-pn__card rc-pn__card--prev">
            <span className="rc-pn__dir">← {T.fr.prev.dir}</span>
            <span className="rc-pn__title">{T.fr.prev.title}</span>
            <span className="rc-pn__topic">{T.fr.prev.topic}</span>
          </button>
          <button className="rc-pn__card rc-pn__card--next">
            <span className="rc-pn__dir">{T.fr.next.dir} →</span>
            <span className="rc-pn__title">{T.fr.next.title}</span>
            <span className="rc-pn__topic">{T.fr.next.topic}</span>
          </button>
        </nav>
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
      <span className="gallery__eyebrow">rachidchabane · écran 02</span>
      <h1 className="gallery__title">Article — Reading view</h1>
      <p className="gallery__lead">
        Colonne de lecture unique (~680px), titre Fraunces, méta (date · tags · durée), corps Inter avec
        un bloc de code Python et une citation, liste « Sources » à liens résolvables, et précédent/suivant
        par sujet. Le sélecteur FR⇄EN retombe sur le même article. Avatar idle, aucun widget de partage.
      </p>
      <div className="gallery__notes">
        <span className="gallery__chip">mesure ~680px · Inter 19/1.78</span>
        <span className="gallery__chip">code JetBrains Mono · RRF, k = 60</span>
        <span className="gallery__chip">Sources : paper + docs, liens réels</span>
        <span className="gallery__chip">aucun partage · aucun commentaire · aucun emoji</span>
      </div>
      <div className="panels">
        <Panel num="A" name="Article · FR · clair" meta="primaire · 1440×1024" theme="light" lang="fr" scale={scale} />
        <Panel num="B" name="Article · FR · sombre" meta="registre sombre · 1440×1024" theme="dark" lang="fr" scale={scale} />
        <Panel num="C" name="Article · EN · clair" meta="le switch retombe sur le même post" theme="light" lang="en" scale={scale} />
        <CloseupPanel num="D" name="Bloc « Sources » — gros plan" meta="détail · clair" scale={Math.min(1, scale + 0.18)} />
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<Gallery />);
