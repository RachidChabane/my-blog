---
translationKey: 'cca-f-exam-trainer'
lang: 'en'
slug: 'cca-f-exam-trainer'
name: 'CCA-F Exam Trainer: Bilingual Certification Practice'
summary: 'A fully client-side, bilingual (English and French) practice trainer for Anthropic''s Claude Certified Architect Foundations (CCA-F) exam: timed mocks weighted across the five official domains, a scaled score with a per-domain breakdown and a full answer review, plus a study mode of original course summaries grounded in first-party Anthropic documentation.'
stack:
  - 'React 19'
  - 'TypeScript'
  - 'Vite'
  - 'Tailwind CSS v4'
  - 'Zustand'
  - 'Playwright'
  - 'GitHub Actions'
status: 'in production'
links:
  - label: 'Live app'
    url: 'https://rachidchabane.github.io/cca-f-exam-trainer/'
  - label: 'GitHub'
    url: 'https://github.com/RachidChabane/cca-f-exam-trainer'
relatedArticles:
  - 'context-budget'
  - 'evaluating-tool-using-agents'
  - 'deterministic-agent-workflows'
publishState: 'published'
year: '2026'
highlights:
  - 'A timed mock built like the real exam: weighted across the five official domains, with a flag-and-navigator grid, a 120-minute countdown, auto-submit, and a scaled 100-1000 score (pass at 720).'
  - 'Every result breaks accuracy down per domain and opens a full review: your answer, the correct answer, why it is best, and why each distractor falls short.'
  - 'A total English / French toggle flips all UI and all content at once; language, theme, and an in-progress attempt persist locally, with no backend and no accounts.'
  - 'Original content grounded in first-party Anthropic docs, guarded by a deterministic fact-check, an optional Claude answer-key review, and a Playwright suite that runs against the production bundle before each GitHub Pages deploy.'
metrics:
  - value: '300+'
    label: 'scenario questions'
  - value: '5'
    label: 'weighted domains'
  - value: '11'
    label: 'course summaries'
  - value: 'EN / FR'
    label: 'fully bilingual'
architecture:
  caption: 'Local-first, content-validated, continuously deployed'
  layers:
    - label: 'Content (bilingual JSON)'
      nodes:
        - 'question pool'
        - 'course summaries'
        - 'exam blueprint'
    - label: 'App (Vite, React 19, TS)'
      nodes:
        - 'exam runner'
        - 'scaled scoring'
        - 'study reader'
        - 'EN / FR + theme'
    - label: 'State'
      nodes:
        - 'Zustand store'
        - 'localStorage (resume, history, prefs)'
    - label: 'Quality gates (CI)'
      nodes:
        - 'schema check'
        - 'deterministic fact-check'
        - 'Playwright e2e'
    - label: 'Deploy'
      nodes:
        - 'GitHub Actions'
        - 'GitHub Pages'
gallery:
  - src: '/work/cca-f-exam-trainer/home.en.png'
    alt: 'CCA-F Exam Trainer home screen in English, with the exam and study mode cards and the exam blueprint'
    caption: 'Home: exam and study modes, with the blueprint at a glance'
  - src: '/work/cca-f-exam-trainer/exam.en.png'
    alt: 'A timed exam question in English with its domain tag, four options, and the numbered question-navigator grid'
    caption: 'Exam: a scenario question, its domain, and the navigator grid'
  - src: '/work/cca-f-exam-trainer/results.en.png'
    alt: 'The results screen in English showing a scaled score out of 1000, the pass mark, and accuracy by domain'
    caption: 'Results: scaled score, pass line, and accuracy by domain'
  - src: '/work/cca-f-exam-trainer/review.en.png'
    alt: 'The answer review in English with the chosen answer, the correct answer, and why it is best'
    caption: 'Review: your answer, the correct answer, and why it is best'
  - src: '/work/cca-f-exam-trainer/study.en.png'
    alt: 'Study mode in English with a course index, a course summary, and highlighted key concepts'
    caption: 'Study: course summaries with key concepts and self-checks'
---

CCA-F Exam Trainer is a fully client-side single-page app (Vite, React 19, TypeScript, Tailwind CSS v4) with no backend, no database, and no accounts: every in-progress exam, results history, and preference lives only in the browser's localStorage. The exam runner assembles a timed mock weighted across the five official domains, with a flag-and-navigator grid, a 120-minute countdown, and auto-submit at zero. Each sitting is graded on a documented linear approximation of the scaled 100-1000 score (pass at 720), with a per-domain accuracy breakdown and a full answer review that shows your answer, the correct one, why it is best, and why each distractor falls short. A Zustand store persists session state, so an in-progress mock survives a refresh or a slept laptop, recent attempts build a score history, and you can re-quiz only the questions you missed or drill a single weak domain untimed. The English and French toggle is total: one click swaps every label and every piece of content, including stems, options, explanations, and the study-mode course bodies. All questions and summaries are original and grounded in first-party Anthropic documentation, with no third-party question banks; a deterministic fact-check pins the exam parameters and keeps community-reported numbers labeled as such, an optional Claude-powered pass reviews the answer keys, and a Playwright suite runs against the real production bundle. Continuous integration ties it together: every push runs schema validation, the fact-check, and end-to-end tests before deploying to GitHub Pages.
