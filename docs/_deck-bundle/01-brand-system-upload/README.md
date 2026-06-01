# Brand-system upload folder

Claude Design renders typography with substitute web fonts unless you give it the real files (it shows a **"Missing brand fonts"** warning with an **Upload fonts** button). This folder holds the three brand fonts as full **variable** TrueType files so you can upload them directly.

Upload all five `.ttf` files via the setup form's **"Add fonts, logos and assets"** option (or the **Upload fonts** button on the warning):

| File | Role in the design system |
|---|---|
| `Fraunces-Variable.ttf` + `Fraunces-Italic-Variable.ttf` | Display / headings / wordmark (variable optical-size serif) |
| `Inter-Variable.ttf` + `Inter-Italic-Variable.ttf` | Long-form body + UI |
| `JetBrainsMono-Variable.ttf` | Code |

All three are open-source under the **SIL Open Font License 1.1** (license text in `OFL-*.txt`), fetched from the canonical `google/fonts` repository — free to redistribute and embed. They are full-charset variable fonts (every weight; complete Latin incl. French diacritics), not the subsetted fragments a build pipeline emits.

The rest of the brand direction (palette approach, feel, motion, avatar constraint) is spelled out in text in `../../design-system-setup.md` — no other upload is needed.
