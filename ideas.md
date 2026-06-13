# Einbürgerungstest Quiz — Design Brainstorm

## Three Stylistic Approaches

### 1. Civic Precision
Clean government-document aesthetic: crisp white cards, German flag accent stripe, serif headlines, structured grid. Feels official and trustworthy.
**Probability:** 0.04

### 2. Dark Study Mode ✓ SELECTED
Deep navy/charcoal background with sharp white text, vivid green/red reveal animations. Feels like a focused exam simulator — serious, immersive, distraction-free.
**Probability:** 0.07

### 3. Warm Notebook
Cream paper texture, hand-drawn borders, warm amber accents. Feels like studying with flashcards in a café.
**Probability:** 0.02

---

## Chosen Approach: Dark Study Mode

**Design Movement:** Precision Dark UI — think VS Code meets exam simulator

**Core Principles:**
1. Maximum focus: dark background eliminates visual noise so only the question matters
2. Instant feedback: green/red reveal is the central interaction — it must feel satisfying and unambiguous
3. Information hierarchy: question number → question text → answer options, each clearly separated
4. Zero clutter: no decorative elements that compete with the content

**Color Philosophy:**
- Background: deep navy `#0f1117` — serious, focused, not harsh black
- Card surface: `#1a1f2e` — subtle elevation above background
- Correct answer: vivid `#22c55e` green with `#052e16` background — unmistakable success
- Wrong answer: bold `#ef4444` red with `#2d0a0a` background — clear failure
- Neutral (unclicked): `#2a3045` with white text — waiting, neutral
- Accent: German gold `#FFCE00` for question numbers and section headers
- Text: `#e2e8f0` primary, `#94a3b8` secondary (English translations)

**Layout Paradigm:**
- Single-column centered content, max-width 720px — exam-room focus
- Sticky header with progress bar and section tabs (General / NRW)
- Questions stack vertically; each card is self-contained
- Answer options in a 2×2 grid on desktop, 1-column on mobile

**Signature Elements:**
1. German flag thin stripe at the very top of the page (3px black/red/gold)
2. Question number badge in gold on dark navy — like a numbered exam paper
3. Answer reveal: all 4 options simultaneously flip/flash to green or red on click

**Interaction Philosophy:**
- Click any answer → all 4 options instantly reveal their state (no delay, no hover states)
- Correct answer glows green, wrong answers turn red — immediate, unambiguous
- Once revealed, options are locked (no re-clicking)
- "Reset question" button appears after reveal
- Progress tracker shows how many questions answered

**Animation:**
- Answer reveal: 150ms color transition + subtle scale pulse on correct answer
- Card entrance: fade-up 200ms staggered as user scrolls
- Progress bar: smooth width transition
- No heavy animations — this is a study tool, not entertainment

**Typography System:**
- Headlines: `IBM Plex Sans` Bold — technical, precise, German-engineering feel
- Body: `IBM Plex Sans` Regular — highly readable at small sizes
- Question numbers: `IBM Plex Mono` — monospace for the exam-paper feel
- English translations: italic, 85% size, muted color

**Brand Essence:**
"The sharpest way to pass the Einbürgerungstest" — for citizenship applicants who want to study efficiently, not just browse questions.
Personality: **Focused. Reliable. Uncompromising.**

**Brand Voice:**
- Headlines: Direct and factual. "310 Questions. One Goal."
- CTAs: Action-oriented. "Start Practicing" not "Begin your journey"
- Microcopy: Precise. "Correct" / "Wrong" — no emojis, no exclamation marks

**Wordmark & Logo:**
Eagle silhouette (Bundesadler-inspired) reduced to a minimal geometric mark — single color, works at 16px favicon size.

**Signature Brand Color:**
German Gold `#FFCE00` — ownable, instantly recognizable, ties to the flag.
