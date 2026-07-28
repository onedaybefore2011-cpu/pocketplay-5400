# Pocket Play — Design System

A casual "quick break" games portal. Bright, rounded, playful yet calm. All ages / family friendly. Tone blends **playful & fun** with **chill & minimal** — friendly words, light touches, generous breathing room. Emojis used sparingly as accents, never clutter.

## Brand

- **Name:** Pocket Play
- **Vibe:** candy-bright, soft rounded shapes, cozy but energetic. Think a friendly arcade lounge.

## Typography

- **Display / headings:** `Fredoka` (rounded, chunky, playful) — weights 500/600/700.
- **Body / UI:** `Poppins` — weights 400/500/600.
- Loaded via Google Fonts in `index.html`.
- Hierarchy through size + weight, generous line-height (1.5 body, 1.1 display).

## Color

Warm cream canvas with candy accents. Each game category owns an accent color.

- `--background`: soft cream `oklch(0.985 0.012 95)`
- `--foreground`: warm near-black `oklch(0.26 0.02 285)`
- `--card`: white `oklch(1 0 0)`
- `--muted`: `oklch(0.95 0.01 95)`
- `--border`: `oklch(0.9 0.01 90)`

Candy accents (also used as category colors):
- **Grape / primary** `--primary`: `oklch(0.62 0.2 300)` (violet)
- **Word — Coral** `--coral`: `oklch(0.7 0.19 25)`
- **Puzzle — Sky** `--sky`: `oklch(0.72 0.15 230)`
- **Reflex — Lime** `--lime`: `oklch(0.78 0.17 140)`
- **Creative — Sunset/Amber** `--amber`: `oklch(0.82 0.16 75)`
- **Pink pop** `--pink`: `oklch(0.75 0.18 350)`

Use accents for emphasis (buttons, category tags, active states) — not decoration.

## Shape & Elevation

- Rounded everything: `--radius: 1.25rem`. Cards `rounded-3xl`, buttons `rounded-full` or `rounded-2xl`.
- Soft chunky shadows: `shadow-[0_8px_0_rgba(0,0,0,0.06)]` style depth on interactive cards; playful "press" effect (translate-y on active).
- Layered gradient-mesh blobs in the background for warmth.

## Layout

- Max content width ~1100px, centered, generous padding.
- Home: hero with big "Surprise Me" CTA → category tab filter → responsive game card grid.
- Game page: focused single-column play area, back button, title, best-score badge, instructions.
- Sticky top nav with logo + category quick links.

## Motion

- One orchestrated page-load: staggered card reveals (fade + rise) using Motion.
- Hover: cards lift slightly. Active/press: cards depress.
- In-game feedback animations kept snappy and readable.

## Components

- `GameCard` — icon, title, one-line pitch, category tag, accent-tinted.
- `CategoryTabs` — pill filter (All / Puzzle / Reflex / Word / Creative).
- `GameShell` — shared wrapper for every game (header, back, best score, reset).
- `Button` — rounded, chunky, accent-fillable.

## UX patterns

- Instant play, no login. Best scores saved to `localStorage`.
- Every game: clear objective line, restart button, win/lose feedback.
- Fully keyboard + touch friendly.
