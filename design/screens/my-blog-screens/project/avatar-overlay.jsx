/* avatar-overlay.jsx — Avatar (overlay) for rachidchabane.
   The always-present non-figurative «Maillage» mark. TWO core states:
   (1) Idle — the unobtrusive fixed-corner mark; (2) Active — an expanded panel
   whose grounded answers put the CITATION before the prose and link the source
   article. Also the refusal state ("je ne sais pas", no source, no fabrication).
   Strictly non-figurative: no face, character, or mascot — ever.
   Panels: idle (light + dark), grounded (light + dark), refusal, thinking, EN grounded. */
const { useState, useEffect, useRef } = React;

const ICONS = {
  search: <><circle cx="11" cy="11" r="7"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></>,
  moon: <path d="M12 3a6.4 6.4 0 0 0 9 9 9 9 0 1 1-9-9Z"></path>,
  sun: <><circle cx="12" cy="12" r="4"></circle><line x1="12" y1="2" x2="12" y2="4"></line><line x1="12" y1="20" x2="12" y2="22"></line><line x1="4.9" y1="4.9" x2="6.3" y2="6.3"></line><line x1="17.7" y1="17.7" x2="19.1" y2="19.1"></line><line x1="2" y1="12" x2="4" y2="12"></line><line x1="20" y1="12" x2="22" y2="12"></line><line x1="4.9" y1="19.1" x2="6.3" y2="17.7"></line></>,
  x: <><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></>,
  up: <><line x1="12" y1="19" x2="12" y2="5"></line><polyline points="5 12 12 5 19 12"></polyline></>,
  rss: <><path d="M4 11a9 9 0 0 1 9 9"></path><path d="M4 4a16 16 0 0 1 16 16"></path><circle cx="5" cy="19" r="1"></circle></>,
  quote: <><path d="M10 11H6a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v7c0 2-1 3-3 4"></path><path d="M19 11h-4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v7c0 2-1 3-3 4"></path></>,
};
function Icon({ name, size = 18 }) {
  return (
    <svg className="rc-ico" width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true">{ICONS[name]}</svg>
  );
}

/* ---- grounded knowledge (answers are grounded ONLY in site content) ----- */
const SOURCES = {
  rag: { fr: "« RAG hybride : la fusion de rang réciproque en pratique »", en: "“Hybrid RAG: reciprocal rank fusion in practice”", date: "27-05-2026" },
  eval: { fr: "« Évaluer un agent outillé : au-delà du taux de réussite »", en: "“Evaluating a tool-using agent: beyond success rate”", date: "12-05-2026" },
};

const T = {
  fr: {
    nav: { articles: "Articles", projects: "Projets", about: "À propos" }, search: "Rechercher",
    avaTitle: "Demander à l’agent", avaSub: "répond à partir du site, avec sources",
    sourceLbl: "Source", thinking: "recherche dans le site…", refuseTag: "hors périmètre",
    placeholder: "Posez une question sur ce site…",
    bdTitle: "RAG hybride : la fusion de rang réciproque en pratique",
    bdBody: "La récupération lexicale et la récupération dense échouent rarement aux mêmes endroits. BM25 excelle sur les correspondances exactes ; les vecteurs denses capturent le sens. Choisir l’un contre l’autre, c’est accepter une cécité que l’on connaît d’avance.",
    qRag: "Est-ce que Rachid a déjà construit un système RAG ?",
    aRag: "Oui. Il décrit un système RAG hybride qui fusionne récupération lexicale (BM25) et dense par rang réciproque — RRF, k = 60. L’article en détaille l’architecture et les arbitrages, et reste reproductible.",
    qPhone: "Quel est son numéro de téléphone ?",
    aRefuse: "Je ne sais pas — cette information n’est pas dans le contenu du site.",
    qEval: "Comment évalue-t-il ses agents ?",
    footer: { credit: "écrit et maintenu de façon autonome", rss: "RSS", rights: "Tous droits réservés." },
  },
  en: {
    nav: { articles: "Articles", projects: "Projects", about: "About" }, search: "Search",
    avaTitle: "Ask the agent", avaSub: "answers from the site, with sources",
    sourceLbl: "Source", thinking: "searching the site…", refuseTag: "out of scope",
    placeholder: "Ask a question about this site…",
    bdTitle: "Hybrid RAG: reciprocal rank fusion in practice",
    bdBody: "Lexical and dense retrieval rarely fail in the same places. BM25 excels at exact matches; dense vectors capture meaning. Picking one over the other means accepting a blindness you already know about.",
    qRag: "Has Rachid ever built a RAG system?",
    aRag: "Yes. He documents a hybrid RAG system that fuses lexical (BM25) and dense retrieval by reciprocal rank — RRF, k = 60. The post details the architecture and trade-offs, and stays reproducible.",
    qPhone: "What is his phone number?",
    aRefuse: "I don’t know — that information isn’t in the site’s content.",
    qEval: "How does he evaluate his agents?",
    footer: { credit: "written and maintained autonomously", rss: "RSS", rights: "All rights reserved." },
  },
};

/* answer the (interactive) query, grounded in site content only */
function resolve(query, lang) {
  const q = query.toLowerCase();
  if (/(t[ée]l[ée]phone|num[ée]ro|email|e-mail|courriel|adresse|priv[ée]|phone|address)/.test(q))
    return { kind: "refuse" };
  if (/(rag|r[ée]cup|retrieval|vecteur|vector|bm25|rrf|recherche augment)/.test(q))
    return { kind: "grounded", src: "rag", prose: T[lang].aRag };
  if (/([ée]val|agent|garde|guardrail|rubri)/.test(q))
    return { kind: "grounded", src: "eval",
      prose: lang === "fr"
        ? "Il évalue ses agents au-delà du taux de réussite : un agent qui réussit la tâche mais saccage l’état n’a pas réussi. Traces rejouables et scoring déterministe à l’appui."
        : "He evaluates agents beyond success rate: an agent that completes the task but wrecks the state hasn’t succeeded. Backed by replayable traces and deterministic scoring." };
  return { kind: "refuse" };
}

/* ----------------------------------------------------------------- chrome */
function Wordmark({ state, size = 32 }) {
  return (
    <a className="rc-wordmark" href="#" onClick={(e) => e.preventDefault()} aria-label="rachid chabane — accueil">
      <rc-avatar size={size} state={state}></rc-avatar>
      <span className="rc-wordmark__txt">rachid chabane<span className="rc-dot">.</span></span>
    </a>
  );
}
function LangSwitch({ lang }) {
  return (
    <div className="rc-seg" role="group" aria-label="Langue / Language">
      {["fr", "en"].map((l) => (
        <span key={l} className={"rc-seg__btn" + (lang === l ? " is-on" : "")}>{l.toUpperCase()}</span>
      ))}
    </div>
  );
}
function Nav({ t, lang, theme }) {
  return (
    <header className="rc-nav">
      <Wordmark state="idle" />
      <nav className="rc-nav__links" aria-label="Navigation principale">
        <a href="#" onClick={(e) => e.preventDefault()}>{t.nav.articles}</a>
        <a href="#" onClick={(e) => e.preventDefault()}>{t.nav.projects}</a>
        <a href="#" onClick={(e) => e.preventDefault()}>{t.nav.about}</a>
      </nav>
      <div className="rc-nav__right">
        <button className="rc-search" aria-label={t.search}><Icon name="search" size={16} /><span>{t.search}</span><kbd>⌘K</kbd></button>
        <LangSwitch lang={lang} />
        <button className="rc-icon-btn" aria-label="thème"><Icon name={theme === "dark" ? "sun" : "moon"} /></button>
      </div>
    </header>
  );
}

/* ---- answer renderers -------------------------------------------------- */
function GroundedAnswer({ t, lang, srcKey, prose }) {
  const s = SOURCES[srcKey];
  return (
    <div className="rc-ans">
      <div className="rc-cite">
        <span className="rc-cite__lbl"><Icon name="quote" size={12} />{t.sourceLbl}</span>
        <span className="rc-cite__title">{s[lang]}</span>
        <span className="rc-cite__date">{s.date}</span>
      </div>
      <div className="rc-ans__prose">{prose}</div>
    </div>
  );
}
function RefuseAnswer({ t, prose }) {
  return (
    <div className="rc-ans rc-ans--refuse">
      <span className="rc-refuse-tag">{t.refuseTag}</span>
      <div className="rc-ans__prose">{prose}</div>
    </div>
  );
}
function ThinkingRow({ t }) {
  return (
    <div className="rc-think-row">
      <rc-avatar size={22} state="thinking"></rc-avatar>
      <span className="rc-think-lbl">{t.thinking}</span>
    </div>
  );
}

/* ---- the expanded avatar panel (active) -------------------------------- */
function AvatarPanel({ t, lang, convo, thinking, onClose, val, setVal, onSend }) {
  const bodyRef = useRef(null);
  useEffect(() => { if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight; }, [convo, thinking]);
  return (
    <div className="rc-ava">
      <div className="rc-ava__head">
        <rc-avatar size={30} state={thinking ? "thinking" : "idle"}></rc-avatar>
        <div className="rc-ava__titles">
          <span className="rc-ava__title">{t.avaTitle}</span>
          <span className="rc-ava__sub">{t.avaSub}</span>
        </div>
        <button className="rc-icon-btn" onClick={onClose} aria-label="Fermer"><Icon name="x" size={16} /></button>
      </div>
      <div className="rc-ava__body" ref={bodyRef}>
        {convo.map((m, i) => {
          if (m.who === "me") return <div key={i} className="rc-bub rc-bub--me">{m.text}</div>;
          if (m.kind === "grounded") return <GroundedAnswer key={i} t={t} lang={lang} srcKey={m.src} prose={m.prose} />;
          return <RefuseAnswer key={i} t={t} prose={m.prose} />;
        })}
        {thinking && <ThinkingRow t={t} />}
      </div>
      <div className="rc-ava__input">
        <input value={val} onChange={(e) => setVal(e.target.value)} onKeyDown={(e) => e.key === "Enter" && onSend()}
          placeholder={t.placeholder} />
        <button className="rc-send" onClick={onSend} aria-label="Envoyer"><Icon name="up" size={17} /></button>
      </div>
    </div>
  );
}

/* ---- backdrop (editorial context behind the overlay) ------------------- */
function Backdrop({ t, lang, theme }) {
  return (
    <div className="rc-app">
      <Nav t={t} lang={lang} theme={theme} />
      <main className="rc-main rc-bd">
        <span className="rc-eyebrow" style={{ color: "var(--accent)" }}>RAG · {lang === "fr" ? "maintenu par l’agent" : "agent-maintained"}</span>
        <h1 className="rc-bd__title">{t.bdTitle}</h1>
        <p>{t.bdBody}</p>
      </main>
    </div>
  );
}

/* ---- the stage: backdrop + (idle launcher | active panel + scrim) ------ */
function AvatarStage({ theme, lang, mode }) {
  const t = T[lang];
  const initialConvo = () => {
    if (mode === "grounded") return [{ who: "me", text: t.qRag }, { who: "bot", kind: "grounded", src: "rag", prose: t.aRag }];
    if (mode === "refuse") return [{ who: "me", text: t.qPhone }, { who: "bot", kind: "refuse", prose: t.aRefuse }];
    if (mode === "thinking") return [{ who: "me", text: t.qEval }];
    return [];
  };
  const [open, setOpen] = useState(mode !== "idle");
  const [convo, setConvo] = useState(initialConvo);
  const [thinking, setThinking] = useState(mode === "thinking");
  const [val, setVal] = useState("");

  function send() {
    const text = val.trim(); if (!text) return;
    setConvo((c) => [...c, { who: "me", text }]); setVal(""); setThinking(true);
    setTimeout(() => {
      const r = resolve(text, lang);
      setThinking(false);
      setConvo((c) => [...c, r.kind === "grounded"
        ? { who: "bot", kind: "grounded", src: r.src, prose: r.prose }
        : { who: "bot", kind: "refuse", prose: t.aRefuse }]);
    }, 1500);
  }

  return (
    <div className="frame" data-theme={theme}>
      <div className="frame-scroll"><Backdrop t={t} lang={lang} theme={theme} /></div>
      {open && <div className="rc-scrim" onClick={() => setOpen(false)}></div>}
      {!open && (
        <div className="rc-idle-cap">
          <span className="rc-idle-cap__txt">{lang === "fr" ? "au repos · discret" : "idle · unobtrusive"}</span>
          <span className="rc-idle-cap__line"></span>
        </div>
      )}
      <div className="rc-dock">
        {open && (
          <AvatarPanel t={t} lang={lang} convo={convo} thinking={thinking} onClose={() => setOpen(false)}
            val={val} setVal={setVal} onSend={send} />
        )}
        <button className={"rc-fab" + (open ? " is-open" : "")} onClick={() => setOpen((o) => !o)} aria-label={t.avaTitle}>
          <rc-avatar size={open ? 26 : 40} state={thinking ? "thinking" : "idle"}></rc-avatar>
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------- panels */
function Panel({ num, name, meta, theme, lang, mode, scale }) {
  return (
    <section className="panel">
      <div className="panel__label">
        <span className="panel__num">{num}</span><span className="panel__name">{name}</span><span className="panel__meta">{meta}</span>
      </div>
      <div className="frame-outer" style={{ width: 1440 * scale, height: 1024 * scale }}>
        <div style={{ transform: `scale(${scale})`, transformOrigin: "top left", width: 1440, height: 1024 }}>
          <AvatarStage theme={theme} lang={lang} mode={mode} />
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
      <span className="gallery__eyebrow">rachidchabane · écran 06</span>
      <h1 className="gallery__title">Avatar — l’agent « Maillage »</h1>
      <p className="gallery__lead">
        Marque non figurative, toujours présente. <b>Au repos</b> : le maillage discret dans le coin.
        <b> Actif</b> : un panneau où la <b>citation précède la prose</b> et lie l’article source ; l’accent violet
        marque l’état « en réflexion ». L’agent répond uniquement à partir du contenu du site et dit
        <b> « je ne sais pas »</b> sinon — sans rien inventer. Chaque panneau est interactif : posez une question.
      </p>
      <div className="gallery__notes">
        <span className="gallery__chip">non figuratif — aucun visage, aucune mascotte</span>
        <span className="gallery__chip">réponse sourcée · citation d’abord</span>
        <span className="gallery__chip">refus honnête · aucune fabrication</span>
      </div>
      <div className="panels">
        <Panel num="A" name="Au repos · clair" meta="marque discrète · coin fixe" theme="light" lang="fr" mode="idle" scale={scale} />
        <Panel num="B" name="Au repos · sombre" meta="registre sombre" theme="dark" lang="fr" mode="idle" scale={scale} />
        <Panel num="C" name="Actif · réponse sourcée · clair" meta="citation avant la prose" theme="light" lang="fr" mode="grounded" scale={scale} />
        <Panel num="D" name="Actif · réponse sourcée · sombre" meta="registre sombre" theme="dark" lang="fr" mode="grounded" scale={scale} />
        <Panel num="E" name="Refus · « je ne sais pas »" meta="hors périmètre · aucune source" theme="light" lang="fr" mode="refuse" scale={scale} />
        <Panel num="F" name="En réflexion · accent actif" meta="shimmer violet" theme="light" lang="fr" mode="thinking" scale={scale} />
        <Panel num="G" name="Active · cited answer · EN" meta="parallèle anglais" theme="dark" lang="en" mode="grounded" scale={scale} />
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<Gallery />);
