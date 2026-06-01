**Purpose:** A self-contained prompt to paste into Claude Design (claude.ai/design) to produce high-fidelity mockups of my-blog's load-bearing screens. Screens **inherit the published design system** (cool-ink + electric-violet palette, Fraunces/Inter/JetBrains Mono, the non-figurative avatar mark) automatically — this prompt references it, never redefines it. Per-screen specs derive from `app-ia.md` § 7.
**Status:** draft.

> **Stage 4.** Run after the design system is **published** (done) and `app-ia.md` is settled. The output of this stage — the designed screens — is exported to the build via **Handoff to Claude Code** (and/or Download .zip / standalone HTML for the raw CSS tokens), which Stage 5 (`claude-plan-execute`) consumes.

## How to use this file

1. **Confirm the design system is published** in your Claude Design org (new projects inherit it automatically — no re-upload).
2. **Create one project** for the site screens and **describe what you're building** (Claude Design is prompt-driven — there's no fixed "screen/prototype type" to pick).
3. **Iterate one screen at a time.** Paste the **prelude** (Blocks A–E) *once* to set the system, then paste each **per-screen spec** (Block F) individually. Single-screen mockups come out noticeably better than "make me 8 screens."
4. **Iterate with the two tools:** **chat** (broad changes) and **inline comments** (click an element for a targeted fix). Pushback lines are in § "Notes on iterating".
5. **Design desktop first** (1440×1024); treat mobile as a second pass per screen.
6. **When the screens are right, export via Handoff to Claude Code** to package them for the build (Stage 5). A Download .zip / standalone-HTML export is the fallback that carries the literal CSS tokens.
7. Copy everything between the `=== PROMPT ===` markers below.

Extraction one-liner:

```bash
awk '/^=== PROMPT ===$/{f=1;next} /^=== END PROMPT ===$/{f=0} f' docs/app-design-prompt.md
```

---

```
=== PROMPT ===

USE MY PUBLISHED DESIGN SYSTEM for everything below — its palette (cool-ink neutrals + the single electric-violet accent, in both light and dark), its typography (Fraunces display / Inter body / JetBrains Mono code), its components, spacing, motion, and the non-figurative avatar mark. Do NOT redefine palette or typography. I will give you screens one at a time; this first message sets the shared context.

## Block A — What this is
The personal site of Rachid Chabane, an AI engineer. It is an autonomously AI-maintained blog on cutting-edge AI engineering that doubles as a portfolio of his projects, with an always-present non-figurative chatbot avatar that answers visitor questions grounded only in the site's own content. It is bilingual (French + English); French is the primary register here. It is static, fast, and editorial — a serious practitioner's hub, not a product marketing site.

## Block B — Audience & tone
Two readers: an evaluator (recruiter / collaborator / client) judging engineering capability fast, and a practitioner reader who returns for sharp, correct takes. Tone: premium, restrained, editorial, technical-literate; confident, not boastful; no marketing fluff. The design itself is a credibility signal — taste and precision over decoration.

## Block C — Banned in the UI
No emojis anywhere (UI chrome or content), save a single deliberate exception if ever truly warranted — use a consistent professional line/solid SVG icon set instead. No marketing chrome words: avoid "Get started", "Welcome", "Click here", "Submit", "Loading…", "Sign up", "Join the community". Prefer quiet, editorial labels ("Read", "All articles", "Ask", "Switch to English"). No engagement metrics, no social-proof badges, no cookie/newsletter modals popping over content.

## Block D — Visual direction (from the inherited system)
Cool-ink neutrals (near-black charcoal in dark, cool paper in light — never warm/beige), a single electric-violet accent used sparingly (links, focus, the avatar's active state, key emphasis). Generous editorial whitespace; soft low-opacity shadows; subtle radius; sparing, tasteful motion. Render every screen in BOTH light and dark. Refuse: gradient heroes, coloured/glow shadows, generic icon clutter, stock photos, full-width candy buttons, skeuomorphic chrome, any face/mascot, any emoji.

## Block E — Output requirements (all screens)
- High-fidelity, real layout (not wireframe), desktop 1440×1024 primary; mobile is a separate pass.
- Show BOTH light and dark for each screen.
- Use REAL populated content from the per-screen spec — never lorem ipsum. Mockups must read as the real site.
- Bilingual: show the French version as primary; where useful, show the English parallel of the same screen so the language switch is visible. Text must render French diacritics cleanly.
- Semantic, accessible structure (clear landmarks: masthead, main, article, aside, nav, footer) — this carries into the build.
- The avatar launcher is present on every screen (idle), per its spec.

## Block F — Screens (I will send these one at a time; do not generate all at once)
The shared chrome on every screen: a top masthead with the typographic wordmark (links home), primary nav (Articles · Projets · À propos), a search affordance, a FR⇄EN language switcher, and a light/dark toggle; a footer with the RSS link, the language switch, and a quiet "écrit et maintenu de façon autonome" credit line; and the fixed-corner non-figurative avatar launcher.

=== END PROMPT ===
```

### Per-screen specs — paste one at a time, after the prelude

Each is its own paste. Real populated examples included; keep them (swap in your own real content where marked `[…]`).

```
=== SCREEN: Home (Accueil) ===
Purpose: orient an evaluator or reader in one screen and route them to a project or the latest article; establish the premium brand in the first viewport.
Layout: full-width masthead; a restrained hero with the wordmark and a one-line statement set typographically in Fraunces; below it, a "Derniers articles" list of 3–5 items (title, date DD-MM-YYYY, tags, reading time); then a "Projets" teaser strip of 2–3 project cards linking to the portfolio. Avatar idle in the corner.
Populated content:
  - Hero line (FR): « J'écris sur l'ingénierie de l'IA de pointe — et ce site s'en charge tout seul. »
  - Latest articles:
    1. « Orchestrer des agents de code avec des workflows déterministes » — 30-05-2026 — agents, agentic coding — 7 min
    2. « RAG hybride : la fusion de rang réciproque en pratique » — 27-05-2026 — RAG, retrieval — 9 min
    3. « Garde-fous de publication : un pipeline de fact-checking automatisé » — 23-05-2026 — évaluation, qualité — 6 min
  - Project teaser cards: [Projet 1 — nom public], [Projet 2 — nom public] (placeholders — I will supply public-safe names; do not invent project names).
States to also show (small): dark-mode variant of the hero.
Must NOT become: a SaaS landing page, a gradient hero, a stat-counter wall, a stock-photo banner, an email-capture modal.
=== END SCREEN ===
```

```
=== SCREEN: Article ===
Purpose: the core reading surface — one post with its metadata and sources; the page the practitioner reader judges the whole site by.
Layout: single editorial reading column (~680px measure) centered; title in Fraunces; a meta row (date, tags, reading time); long-form body in Inter with code blocks in JetBrains Mono; a "Sources" list at the end with resolving links; a language switcher that lands on the same article in English; prev/next-by-topic at the foot. Avatar idle.
Populated content:
  - Title (FR): « RAG hybride : la fusion de rang réciproque en pratique »
  - Meta: 27-05-2026 · RAG · retrieval · 9 min
  - Body: 3–4 real-looking paragraphs on combining lexical + vector retrieval and fusing with reciprocal rank fusion, including ONE short code block (a few lines of Python) and ONE blockquote.
  - Sources: 2–3 entries with titles + dates + links (e.g. a paper and a docs page).
States to also show (small): dark-mode variant; the "Sources" block close-up.
Must NOT become: a post cluttered with share widgets, inline ads, related-content spam, a comment section, or any emoji in headings/callouts.
=== END SCREEN ===
```

```
=== SCREEN: Article index (Articles) ===
Purpose: browse all published posts, newest first; also the layout reused by the tag and search result pages.
Layout: a clean editorial list (not a card grid): per item, title (Fraunces), one-line dek, date, tags, reading time; a tag filter rail or chips at the top; simple pagination at the foot.
Populated content: 6–8 items reusing and extending the article titles above (cutting-edge AI engineering topics, FR), with plausible dates across May 2026 and varied tags (agents, RAG, LLM open-source, agentic coding, évaluation).
States to also show (small): the same list filtered to one tag; empty-search state with a quiet "Aucun résultat" message.
Must NOT become: a magazine grid with a hero image per post, trending/engagement badges, or multiple author bylines.
=== END SCREEN ===
```

```
=== SCREEN: Portfolio index (Projets) ===
Purpose: an evaluator's first proof of depth — a set of project cards.
Layout: a restrained grid of project cards; each card: project name, one-line description, stack chips, a status label, a quiet link affordance. Generated from an inventory, so keep it uniform.
Populated content: use 4–5 PLACEHOLDER cards — "[Projet — nom public]", "[description publique en une ligne]", stack chips like "Python · LLM · RAG", status "En production" / "Actif". Do NOT invent real project names or claims; these are owner-filled placeholders.
States to also show (small): dark-mode variant; a single card hover state (accent used sparingly).
Must NOT become: hand-authored marketing prose, a company-logo wall, fabricated metrics, or exposure of anything private/internal.
=== END SCREEN ===
```

```
=== SCREEN: Project detail (Projet) ===
Purpose: a credible deep write-up of one flagship project.
Layout: project name (Fraunces) + one-line summary; a "Ce que c'est" section; an "Ingénierie" section (the depth); a stack list; a status line; public links (repo/demo where public-safe); optional related articles. Reading-column width, like the article.
Populated content: keep section HEADINGS real but body as clearly-marked placeholders ("[ce que fait le projet]", "[profondeur technique : architecture, choix, résultats]") — owner fills with public-safe text.
States to also show (small): dark-mode variant.
Must NOT become: a generic case-study template with invented numbers, internal codenames, or anything private.
=== END SCREEN ===
```

```
=== SCREEN: Avatar (overlay) ===
Purpose: the always-present non-figurative chatbot; answers grounded only in site content, with citations, and says "je ne sais pas" when unsupported.
Layout: render TWO states. (1) Idle: the fixed-corner non-figurative mark from the design system, unobtrusive. (2) Active: an expanded chat panel — a question, a streamed answer with the CITATION shown before the prose (linking the source article), and the violet accent on the "thinking"/active state.
Populated content:
  - Question (FR): « Est-ce que Rachid a déjà construit un système RAG ? »
  - Answer: a 2–3 sentence grounded reply that first cites the source — e.g. "Source : « RAG hybride : la fusion de rang réciproque en pratique » (27-05-2026)" — then summarizes.
  - Also render the refusal state: question « Quel est son numéro de téléphone ? » → answer « Je ne sais pas — cette information n'est pas dans le contenu du site. » (no fabrication, no source).
Must NOT become: a face, character, mascot, or any living being (hard constraint); a generic support-bot bubble; an answer without a citation; anything that presents outside knowledge as site content.
=== END SCREEN ===
```

```
=== SCREEN: About / contact (À propos) ===
Purpose: who Rachid is, how to reach him, and a short "how this site works" credibility note.
Layout: a short bio block (reading-column width); a quiet contact list (email + professional links as plain links, no backend form); an optional "Comment ce site fonctionne" section describing the autonomous pipeline as a one-paragraph credibility asset.
Populated content: bio as a clearly-marked placeholder ("[bio courte, première personne]"); contact links as "[email]", "[GitHub]", "[LinkedIn]"; the how-it-works paragraph can be real (the site researches, drafts in FR+EN, fact-checks, and publishes itself with no human in the loop).
Must NOT become: a résumé dump, a contact form needing a server, or a photo/face treatment that breaks the non-figurative brand rule.
=== END SCREEN ===
```

## Notes on iterating

Iterate with **chat** (broad) and **inline comments** (click an element). Each screen usually needs 1–2 rounds. Common pushbacks:

### Pushback A — generic SaaS register snuck in
> This screen reads as a tech-startup product page, not a serious AI engineer's editorial site. Remove [gradient / coloured shadow / generic icons / full-width candy button]. Apply my published design system: cool-ink neutrals, single violet accent, editorial whitespace, sparing motion.

### Pushback B — it redefined the brand instead of inheriting it
> Apply my published design system — same palette, typography, components, and motion. Do not invent new brand styling.

### Pushback C — an emoji or banned chrome word appeared
> Remove the emoji — no emojis anywhere; use a professional SVG icon instead. Replace "[Get started / Welcome / Click here]" with a quiet editorial label.

### Pushback D — placeholder/lorem text instead of the populated example
> Use the exact populated content from the screen spec (real French titles, real dates, the real code block). The mockup must read as the live site, not a wireframe.

### Pushback E — the avatar drifted figurative
> The avatar must stay non-figurative — no face, character, mascot, or living being, ever. Use the abstract mark from the published design system.

### Pushback F — French diacritics broke / wrong language
> Render French text with correct diacritics (é è ê à ç …) in the body and display faces. Primary language is French here; show the English parallel only where the spec asks.
