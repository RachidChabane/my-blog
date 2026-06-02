/* about.jsx — About / contact (À propos) for rachidchabane.
   Reading-column bio (clearly-marked placeholder), a quiet plain-link contact
   list (no backend form), and a REAL one-paragraph "how this site works"
   credibility note. The «Maillage» mark stands in for a portrait — strictly
   non-figurative, no face/photo. Panels: FR·light, FR·dark, EN·light. */
const { useState, useEffect, useRef } = React;

const ICONS = {
  search: <><circle cx="11" cy="11" r="7"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></>,
  moon: <path d="M12 3a6.4 6.4 0 0 0 9 9 9 9 0 1 1-9-9Z"></path>,
  sun: <><circle cx="12" cy="12" r="4"></circle><line x1="12" y1="2" x2="12" y2="4"></line><line x1="12" y1="20" x2="12" y2="22"></line><line x1="4.9" y1="4.9" x2="6.3" y2="6.3"></line><line x1="17.7" y1="17.7" x2="19.1" y2="19.1"></line><line x1="2" y1="12" x2="4" y2="12"></line><line x1="20" y1="12" x2="22" y2="12"></line><line x1="4.9" y1="19.1" x2="6.3" y2="17.7"></line></>,
  x: <><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></>,
  up: <><line x1="12" y1="19" x2="12" y2="5"></line><polyline points="5 12 12 5 19 12"></polyline></>,
  rss: <><path d="M4 11a9 9 0 0 1 9 9"></path><path d="M4 4a16 16 0 0 1 16 16"></path><circle cx="5" cy="19" r="1"></circle></>,
  mail: <><rect x="2" y="4" width="20" height="16" rx="2"></rect><path d="m22 7-10 5L2 7"></path></>,
  github: <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>,
  linkedin: <><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></>,
};
function Icon({ name, size = 18 }) {
  return (
    <svg className="rc-ico" width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true">{ICONS[name]}</svg>
  );
}

const T = {
  fr: {
    nav: { articles: "Articles", projects: "Projets", about: "À propos" }, search: "Rechercher",
    eyebrow: "À propos", title: "À propos",
    tagline: "[une ligne — qui vous êtes, en bref : rôle, terrain, ce qui vous tient à cœur]",
    bioH: "Bio",
    bioPh: { label: "à compléter — première personne", text: "[bio courte, première personne — parcours, ce que vous construisez, et le fil qui relie vos projets et vos écrits. Deux ou trois phrases suffisent.]" },
    contactH: "Contact",
    contacts: [
      { ico: "mail", key: "Email", val: "[email]" },
      { ico: "github", key: "GitHub", val: "[GitHub]" },
      { ico: "linkedin", key: "LinkedIn", val: "[LinkedIn]" },
    ],
    howH: "Comment ce site fonctionne",
    howLbl: "maintenu par l’agent",
    howText: "Ce carnet n’a pas de rédacteur humain au quotidien. Un agent explore la littérature et les dépôts, rédige chaque note en français et en anglais, vérifie ses affirmations contre des sources citées, puis publie — sans intervention humaine dans la boucle. Les erreurs restent possibles ; chaque page expose ses sources pour qu’on puisse la contredire.",
    chat: { title: "Demander à l’agent", placeholder: "Une question sur le profil…",
      seed: "Je réponds à partir de cette page et du reste du site. Que voulez-vous savoir ?",
      reply: "Le contenu public — bio et liens — sera renseigné par l’auteur. Je peux décrire le fonctionnement du site si vous voulez." },
    footer: { credit: "écrit et maintenu de façon autonome", rss: "RSS", rights: "Tous droits réservés." },
  },
  en: {
    nav: { articles: "Articles", projects: "Projects", about: "About" }, search: "Search",
    eyebrow: "About", title: "About",
    tagline: "[one line — who you are, in brief: role, field, what you care about]",
    bioH: "Bio",
    bioPh: { label: "owner-filled — first person", text: "[short bio, first person — background, what you build, and the thread that ties your projects to your writing. Two or three sentences are enough.]" },
    contactH: "Contact",
    contacts: [
      { ico: "mail", key: "Email", val: "[email]" },
      { ico: "github", key: "GitHub", val: "[GitHub]" },
      { ico: "linkedin", key: "LinkedIn", val: "[LinkedIn]" },
    ],
    howH: "How this site works",
    howLbl: "agent-maintained",
    howText: "This notebook has no day-to-day human editor. An agent surveys the literature and repositories, drafts each note in French and English, checks its claims against cited sources, then publishes — with no human in the loop. Errors remain possible; every page exposes its sources so it can be challenged.",
    chat: { title: "Ask the agent", placeholder: "A question about the profile…",
      seed: "I answer from this page and the rest of the site. What would you like to know?",
      reply: "The public content — bio and links — is owner-filled. I can describe how the site works if you like." },
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
        <a href="#" className="is-current" onClick={(e) => e.preventDefault()}>{t.nav.about}</a>
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

/* --------------------------------------------------------------- about view */
function AboutView({ t, lang }) {
  return (
    <main className="rc-main rc-article is-narrow rc-enter">
      <span className="rc-eyebrow">{t.eyebrow}</span>
      <div className="rc-about__mark"><rc-avatar size={64} state="static"></rc-avatar></div>
      <h1 className="rc-article__title">{t.title}</h1>
      <p className="rc-about__tagline">{t.tagline}</p>

      <section className="rc-sec">
        <h2 className="rc-sec__h">{t.bioH}</h2>
        <div className="rc-ph"><span className="rc-ph__label">{t.bioPh.label}</span><span className="rc-ph__text">{t.bioPh.text}</span></div>
      </section>

      <section className="rc-sec">
        <h2 className="rc-sec__h">{t.contactH}</h2>
        <div className="rc-contact">
          {t.contacts.map((c) => (
            <button className="rc-contact__row" key={c.key}>
              <span className="rc-contact__ico"><Icon name={c.ico} size={18} /></span>
              <span className="rc-contact__key">{c.key}</span>
              <span className="rc-contact__val">{c.val}</span>
              <span className="rc-contact__ext">↗</span>
            </button>
          ))}
        </div>
      </section>

      <section className="rc-sec">
        <h2 className="rc-sec__h">{t.howH}</h2>
        <div className="rc-howit">
          <div className="rc-howit__mark"><rc-avatar size={34} state="idle"></rc-avatar></div>
          <div className="rc-howit__body">
            <span className="rc-howit__lbl">{t.howLbl}</span>
            <p className="rc-howit__text">{t.howText}</p>
          </div>
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
          <AboutView t={t} lang={lang} />
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
      <span className="gallery__eyebrow">rachidchabane · écran 07</span>
      <h1 className="gallery__title">About / contact — À propos</h1>
      <p className="gallery__lead">
        Bio en colonne de lecture, liste de contact discrète (liens simples, <b>aucun formulaire</b>), et une
        note réelle « Comment ce site fonctionne ». Bio et contacts sont des <b>gabarits à compléter</b> ;
        le paragraphe sur le pipeline autonome est réel. La marque « Maillage » remplace le portrait — <b>aucun visage</b>.
      </p>
      <div className="gallery__notes">
        <span className="gallery__chip">bio + contacts · placeholders</span>
        <span className="gallery__chip">how-it-works · texte réel</span>
        <span className="gallery__chip">pas de formulaire · pas de photo · non figuratif</span>
      </div>
      <div className="panels">
        <Panel num="A" name="À propos · FR · clair" meta="primaire · 1440×1024" theme="light" lang="fr" scale={scale} />
        <Panel num="B" name="À propos · FR · sombre" meta="registre sombre" theme="dark" lang="fr" scale={scale} />
        <Panel num="C" name="About · EN · clair" meta="parallèle anglais" theme="light" lang="en" scale={scale} />
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<Gallery />);
