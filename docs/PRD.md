# peak: Product Requirements Document

Version 1.1 (scope update, 2026-10-16: 50 scenes, 16 color worlds, always-changing color, Tour page, shared kits). Owner: [YOUR NAME]. Builder: Claude Code.
Companion files: `CLAUDE.md` (how to work), `docs/SCENES.md` (the 50 scenes), `docs/PLAN.md` (step-by-step build), `reference/peak-prototype.html` (working prototype of six scenes), `reference/riso-demo.html` (riso demo with four more scenes).

---

## §0 TL;DR

**The point of peak:** anyone can tweak any animation's physics, colors and text until it looks exactly right, then copy one precise prompt, so Claude Code builds it right the first time instead of the visitor burning tokens trying to describe motion in words.

peak is a website where people **see an animation they love, tweak it with sliders, copy a ready-made prompt, and build their own version with Claude Code.** It also teaches the words that make prompts work, walks first-timers through setting up Claude Code, helps them fix things when they break, and shows them how to put their page online.

peak launches with 50 animations, about 20 of them text and headline effects. As you scroll the home page, the whole site travels through color "worlds" (16 in all, from candy pink and desert spice to aurora, lava lamp and newsprint). Each animation lives in its own world, the colors blend smoothly from one world to the next, and inside each world the accent colors slowly drift so nothing ever looks frozen. A Tour page plays all 50 back to back.

---

## §1 The problem

People can recognize great work when they see it, but they can't describe it, and Claude Code can only build what you can describe.

Most people have seen a website with a beautiful animation and thought "I want that." Claude Code could build it in minutes. But they type "make a cool animated website," get something generic, and decide it's not for them. The gap is rarely coding skill. People get stuck at five points:

| # | Stuck point | What it sounds like | What peak does about it |
|---|---|---|---|
| 1 | Discover | "I didn't know you could do that." | The gallery and home journey show what's possible, live. |
| 2 | Describe | "I don't know what to call it." | The playground turns sliders into a written prompt. The word bank teaches the vocabulary. |
| 3 | Set up | "I've never opened Claude Code." | The Start here guide. |
| 4 | Fix | "It's blank / laggy / weird on my phone." | The Fix it guide: symptom, then the exact words to tell Claude Code. |
| 5 | Ship | "It only works on my laptop." | The Put it online guide. |

Every feature in this PRD maps to one of these five points. If a proposed feature doesn't, it goes to the backlog (§24).

---

## §2 Audience

**Primary: curious beginners around the owner.** Friends, classmates, coworkers. Some have never written code. They're comfortable with a browser and copy-paste. They want something to show people: a portfolio intro, a birthday page, an event page.

**Secondary: developers and designers** who want a good starting prompt for a specific effect, or want to learn how an effect works.

Assumptions: visitors arrive on phones about half the time (shared links), and on laptops when they actually build. The site must be fully usable on a phone, but building with Claude Code happens on a computer.

---

## §3 Goals, non-goals, success

### Goals
1. A first-time visitor who has never used Claude Code can go from "I like that one" to their own animated page, online, in one afternoon.
2. Every prompt peak generates produces a result at least as good as the demo when pasted into a fresh Claude Code session.
3. The site itself is the best advertisement for the idea: it should feel playful, premium, and very smooth.

### Non-goals (v1)
- No accounts, logins, databases, or user-generated galleries.
- No in-browser code editor. peak writes prompts; Claude Code writes code.
- No AI calls from the site itself.
- No monetization.

### Success measures
- Primary: in a test with 3–5 people who have never used Claude Code, at least 3 ship their own page online within an afternoon (test script in PLAN Phase 12).
- Secondary (if analytics is enabled, §20): prompt copies per scene visit; follow-up copies; "It worked" vs. "It didn't" votes; return visits after a new drop.

---

## §4 Product principles

1. **Show, then tell.** Every concept appears as a live, touchable thing before any explanation.
2. **The prompt is the product.** Animations attract people; prompts are what they take home. Prompt quality gets the same care as animation quality.
3. **Plain words first, real words second.** Explanations use everyday language, then name the technical term once and link it to the word bank ("Each dot is on an invisible spring. That's called a **spring** with **damping**.").
4. **Small steps beat one perfect prompt.** Every scene offers follow-up prompts to teach iteration.
5. **Respect the visitor.** Fast pages, honest copy, reduced-motion support, no trackers by default, no dark patterns.

---

## §5 Information architecture

| Route | Page | Serves stuck point |
|---|---|---|
| `/` | Home: the world journey (§6) through featured scenes | 1 |
| `/gallery` | All scenes, filterable by use case (§8, §13) | 1 |
| `/tour` | Tour: all 50 scenes back to back, full-screen, colors blending between every one (§6.7) | 1 |
| `/scenes/[slug]` | Scene page: live demo + playground + prompt builder (§9, §10) | 1, 2 |
| `/start` | Start here: Claude Code for first-timers (§11.1) | 3 |
| `/fix` | Fix it: symptoms and what to say (§11.2) | 4 |
| `/ship` | Put it online (§11.3) | 5 |
| `/words` | Word bank: animation vocabulary with mini demos (§12) | 2 |
| `/drops` | Weekly drops archive + RSS at `/rss.xml` (§14) | 1 |
| `/about` | About the maker (portfolio) (§15) | none (trust) |
| `/404` | Not found, with a small playful animation and links back | none |

Header (all pages): wordmark "peak" (links home), nav links: Gallery, Tour, Start here, Words, Drops. A pause/play motion button. A "Living colors" toggle (on by default, §6.7). A sound toggle (off by default, §9.8). On phones, nav collapses into a menu button that opens a full-screen sheet.

Footer: the five-step journey as links (Discover → Describe → Set up → Fix → Ship), "Made by [YOUR NAME]", link to About, RSS link.

---

## §6 The world journey (home page)

This is the signature experience. As the visitor scrolls, the entire site (background, text, header, buttons, and every animation's colors) travels through a sequence of color worlds. Each featured scene sits in its own world. Between scenes, the colors blend smoothly instead of cutting.

### §6.1 Home page structure (top to bottom)

| Section | World | Content |
|---|---|---|
| Hero | Dreamhouse | Particle text scene (`particles`) spelling "peak". Headline (h1): "Don't describe it. Tweak it, copy it, build it." Subline: "Animations you can play with, plus the exact prompt to make your own." Buttons: "Browse the gallery" and "I've never used Claude Code". |
| Featured 1 | Spice Dunes | `elastic` scene |
| Featured 2 | Doomsday | `velocity` scene |
| Featured 3 | Lava Lamp | `lava` scene |
| Featured 4 | Cherry Cola | `marbles` scene |
| Featured 5 | Toxic | `lightning` scene |
| Featured 6 | Aurora | `flock` scene |
| Featured 7 | Abyss | `ripple` scene |
| Featured 8 | Blueprint | `cloth` scene |
| Featured 9 | Neon Arcade | `neon` scene |
| Featured 10 | Vapor Mall | `glitch` scene |
| Featured 11 | Golden Hour | `fireworks` scene |
| How it works | Matcha | The four steps as a real sequence (numbered is correct here): 1 Find an animation, 2 Tweak it, 3 Copy the prompt, 4 Paste it into Claude Code. Each step has a tiny looping illustration. |
| Latest drop + Start here | Matcha | The newest weekly drop as a card-free row (title, one line, link), then a large "Start here" call to action. |

The home page features 12 scenes (the hero plus 11), each in a different world and each in its own default world from `docs/SCENES.md`.

**Why this order (proposed in v1.1, owner to confirm):** it opens with Dreamhouse → Spice Dunes → Doomsday, stays dark through the warm worlds (Lava Lamp, Cherry Cola), moves through acid green, teal and deep blue (Toxic, Aurora, Abyss, Blueprint), peaks in Neon Arcade, then comes back into the light (Vapor Mall, Golden Hour, and Matcha for the closing sections). That is only two light↔dark crossings (Spice Dunes → Doomsday, Neon Arcade → Vapor Mall) where v1.0's order had six, so text colors and canvas blend modes switch as rarely as possible (§6.3, §6.4). The lineup mixes 5 text scenes, 5 physics scenes and 2 shapes. Glacier, Newsprint and Riso don't appear on the home page.

**While scenes are still being built (Waves 1–6 in PLAN):** a featured slot whose scene doesn't exist yet shows an already-built scene in that slot's world, so the whole color journey can be reviewed from Wave 1. Each featured scene replaces its stand-in when it's built; launch requires that no stand-ins remain.

Each featured section is full-viewport (`100svh`, min 560px) with the live scene behind a caption at the bottom-left: the scene's use-case title (h2), one line of what to do, and a button: **"Tweak it and get the prompt"** linking to `/scenes/[slug]`.

The world order lives in one config array (`src/theme/journey.ts`) so it can be reordered without touching code elsewhere.

### §6.2 How blending works

- Each journey section declares its world (`data-world="dunes"`).
- Measure at the viewport's vertical center. Around each boundary between two sections there is a **blend zone** equal to 35% of the viewport height, centered on the boundary. Outside blend zones, the current world holds steady. Inside, `t` goes 0 → 1 across the zone, eased with smootherstep (`6t^5 - 15t^4 + 10t^3`).
- Interpolate every color token in **OKLab** (not RGB, not HSL), so blends stay vivid and never pass through muddy gray.
- Recompute only when scroll position changes. Write CSS custom properties on `:root` only when a value actually changes (compare rounded hex).
- Animations do not call `getComputedStyle` per frame. The theme engine publishes a `Theme` object; scenes subscribe and receive updates (§16.4).
- On scene pages, gallery, and guides there is no journey: the page uses one world (scene pages use the scene's world or the one the visitor picks; content pages use Riso and follow system light/dark). The Tour page has its own journey through all 50 scenes (§6.7).

### §6.3 Text contrast during blends (hard requirement)

Blending a light world into a dark one makes background and text cross through the same lightness. Guardrail:

- Text colors are never interpolated blindly. For every `t`, compute the blended ground, then run `ensureContrast(fg, bg, min)`: start from the blended ink, and if contrast is below `min`, move the foreground's OKLab lightness away from the ground (toward white or black, whichever gives more contrast) until it passes.
- Minimums: `--ink` and `--ink-soft` ≥ 4.5:1 against `--ground` at every `t`. `--accent-text` (accent-colored display text ≥ 24px) ≥ 3:1.
- A unit test samples every pair of worlds (all 16, in both directions, since the Tour can put any two side by side, §6.7) at `t = 0.00, 0.01, … 1.00` and fails if any minimum is broken.

### §6.4 Canvas blend mode during blends

A canvas composite mode can't be interpolated. Choose it from the blended ground's OKLab lightness `L`: `L ≥ 0.62` → `multiply` (ink-on-paper look); `L ≤ 0.45` → `lighter` (glow); in between → `source-over`.

### §6.5 World rail (navigation)

On the home page only, a slim vertical rail on the right edge shows one small dot per section, filled with that section's world ground and accent. The active one is larger. Clicking a dot scrolls to that section. Hidden under 700px wide. Each dot is a real `<a href="#section-id">` with an `aria-label` ("Go to Ripple").

### §6.6 Reduced motion

Color blending follows scroll and is not autonomous motion, so it stays on. Scenes follow §17.

### §6.7 Always-changing color

Color never sits still on peak. Everything below runs through the theme store (§16.4, §16.5), so scenes and page chrome always agree.

1. **Home journey.** The 12 featured scenes (§6.1), each in a different world, blend on scroll exactly as in §6.2–§6.4.
2. **Tour page (`/tour`).** All 50 scenes back to back, each full-screen in its own world, with colors blending between every pair using the same blend zones as the home journey.
   - **Shuffle order** reorders the scenes (and so their worlds) at random. The order lives in the URL (`?order=…`) so it can be shared; **Reset order** returns to catalog order.
   - **Autoplay** (off when the page loads) scrolls to the next scene every 12 seconds: a smooth scroll, or an instant jump under reduced motion. It stops as soon as the visitor touches anything: pointer down, wheel, touch, or any key.
   - Only the one or two scenes on screen run (never more than 2). Scenes mount when they come within one screen of the viewport and are destroyed when they're more than two screens away, so memory stays flat across 50 scenes.
   - Each scene keeps its caption and its "Tweak it and get the prompt" link. Instead of the world rail (§6.5) there's a compact "12 of 50" counter.
3. **Living colors.** Inside each world, the three accent colors (`c1`–`c3`) slowly drift in hue so nothing ever looks frozen.
   - Hue in OKLCH moves by up to ±12° on a 30-second loop: `h = h0 + 12° × sin(2π × seconds / 30 + phase)`, with phases 0°, 120° and 240° for c1, c2 and c3 so they never move in lockstep. Lightness and chroma stay fixed; if a drifted color falls outside sRGB, its chroma is reduced until it fits.
   - On by default. The **Living colors** toggle in the header turns it off, and the choice is remembered in `localStorage` (in try/catch, like sound). It also stops whenever motion is paused, so under reduced motion it starts paused (it's autonomous motion, unlike scroll blending).
   - Text colors never drift: `ink`, `inkSoft`, `accentText` and `focus` come from the undrifted world (or blend), so contrast results never change.
   - Drift is applied after journey blending and after scene-page crossfades. The theme store recomputes drifted accents at most 20 times a second, sends them to scenes via `setTheme`, and writes `--c1`–`--c3` only when the rounded hex changes.
4. **Scene pages.** Next to the world picker (§9.2):
   - **Shuffle world** switches to a random different world with the usual 400ms crossfade.
   - **Cycle worlds** (a toggle, off by default) crossfades to the next world every 8 seconds, with a slower 1.5-second crossfade. The cycle is a loop of four worlds: the current one plus three picked at random when the toggle is turned on; pressing Shuffle world while cycling picks a new set. The loop is stored in the URL (`cycle=dunes,abyss,toxic,vapor`, §9.6), so a shared link and the prompt reproduce it. Cycling pauses with motion; under reduced motion it switches instantly instead of crossfading.
5. **Prompts.** When Cycle worlds is on, the Detailed prompt's Look section (§10.2) adds: "Slowly crossfade the whole page between these palettes, holding each for 8 seconds and blending in OKLab over about 1.5 seconds: {name}: background {ground}, text {ink}, secondary text {inkSoft}, accents {c1}, {c2}, {c3}; {next palette}; …", listing all four palettes, plus "Keep all text readable at every moment of the crossfade (contrast at least 4.5:1)." The Quick prompt adds one line naming the four palettes' backgrounds. Visitors can take the effect home.
6. **Gallery.** Every tile is shown in its own scene's world, so the grid reads as a patchwork of color (§13). Living colors applies to the tiles too.

---

## §7 Color worlds

Each world is a set of tokens. Public names are original. Do not use film or brand names (for example Barbie or Dune) anywhere in visible UI, URLs, metadata, or prompts. The "inspired by" column is internal only.

| id | Public name | Inspired by (internal) | Mode | ground | surface | ink | inkSoft | c1 | c2 | c3 |
|---|---|---|---|---|---|---|---|---|---|---|
| `dreamhouse` | Dreamhouse | Barbie-style pink plastic | light | #FFE3F1 | #FFF4FA | #4A0532 | #8A2B66 | #FF1F8E | #1FA9DB | #FFC21A |
| `dunes` | Spice Dunes | Desert-planet sci-fi | light | #E8C9A0 | #F3DDBE | #2A1405 | #5E3517 | #D9561A | #8C2F14 | #2F6FA3 |
| `doomsday` | Doomsday | End-of-the-world ember and fallout | dark | #1E1412 | #2B1D19 | #F1E6DC | #BFAEA1 | #FF3B1F | #FF9F1C | #B5E61D |
| `abyss` | Abyss | Bioluminescent deep sea | dark | #021B2E | #06293F | #DDF7FF | #93BFD3 | #00E6D2 | #8B7DFF | #FF5FC8 |
| `glacier` | Glacier | Arctic ice | light | #E6F2F8 | #F4FAFD | #0B2A3C | #3D5F73 | #1679BF | #2BA7D6 | #E64545 |
| `arcade` | Neon Arcade | 80s synthwave | dark | #1B0A33 | #2A1250 | #FFF0FB | #CDB0EA | #FF2E97 | #00D9FF | #FFE14D |
| `matcha` | Matcha | Calm green tea | light | #ECF1DC | #F6F9EC | #1D3321 | #47604B | #3F8A22 | #D98A1F | #D0473F |
| `riso` (light) | Riso | Risograph print | light | #F4F2FF | #FFFFFF | #1A1240 | #4E4777 | #EC1C7F | #2A47EA | #FF7A00 |
| `riso` (dark) | Riso | Risograph print, night | dark | #160E44 | #21185A | #F4F1FF | #BDB5EA | #FF4FA3 | #3EE6D0 | #FFD23F |
| `aurora` | Aurora | Northern lights | dark | #06161A | #0C2329 | #E8FFF8 | #9CC9BE | #3DF5A8 | #6C7BFF | #E66CFF |
| `lava` | Lava Lamp | Retro wax lamp | dark | #240B1C | #34112A | #FFEDE3 | #E0AFA0 | #FF5A1F | #FF2E88 | #FFC23D |
| `vapor` | Vapor Mall | Vaporwave pastels | light | #F6E8FF | #FDF6FF | #2B1240 | #6A4C86 | #FF71CE | #01CDFE | #B967FF |
| `blueprint` | Blueprint | Technical drawing | dark | #0B2A5B | #12376F | #F0F6FF | #A9C3EA | #7FD3FF | #FFD447 | #FF7A59 |
| `golden` | Golden Hour | Sunset light | light | #FFE8CC | #FFF3E3 | #3A1A0A | #7A4A2A | #FF8A3D | #D9467A | #7B5CD6 |
| `cherry` | Cherry Cola | Soda-fountain red | dark | #2A0A0E | #3A1015 | #FFF1E6 | #E3B5AC | #E8203A | #FFB38A | #FFE9C7 |
| `newsprint` | Newsprint | Black-and-red newspaper print | light | #ECECEA | #F7F7F5 | #111111 | #4A4A4A | #E3001B | #111111 | #8C8C8C |
| `toxic` | Toxic | Acid green and hazard orange | dark | #10140A | #1A2010 | #F1FFD9 | #B5C99A | #B6FF1A | #FF6A00 | #9B5CFF |

Notes:
- There are 16 worlds: the 8 from v1.0 (Riso counts once, with its two variants) and 8 added in v1.1 (Aurora to Toxic).
- All `ink` and `inkSoft` values in all 16 worlds were checked at ≥ 6:1 against their ground and surface (lowest: 6.0:1, the inkSoft of Glacier, Matcha and Vapor Mall on ground). Keep it that way if you edit them.
- Newsprint's c2 is the same near-black as its ink on purpose: black is one of its two printing inks.
- `c1`–`c3` are **art colors** for animations, not text colors. Several are low-contrast on light grounds by design. Any text drawn in an accent uses the derived `--accent-text` (§6.3).
- Derived tokens (computed by the theme engine, not hand-picked): `--accent-text`, `--focus` (c1, contrast-adjusted to ≥ 3:1), `--header-bg` (ground at 74% alpha), `--scrim` (ground), `--line` (ink at 14% alpha), `--blend` (§6.4).
- Riso is the only world with light and dark variants. It's used for content pages and follows `prefers-color-scheme`.
- Adding a world must be a data-only change: one entry in `src/theme/worlds.ts`, then the contrast tests run against it automatically. (There is a `/new-world` command for this.)

---

## §8 Scene catalog

peak launches with **50 scenes**. Each one is specified in **`docs/SCENES.md`**, in the same format v1.0 used here: use case, world, what happens, interactions, params with plain-language labels, ranges and defaults, still frame, mobile notes, tags, difficulty, time. SCENES.md is the source of truth for scene details; this section holds the rules that apply to all of them.

### §8.1 The mix

| Group | Scenes | SCENES.md |
|---|---|---|
| Text and headlines | 20 | 1–20 |
| Particles and physics | 14 | 21–34 |
| Shapes and optical | 10 | 35–44 |
| Interface and micro-interactions | 6 | 45–50 |

- **Ported scenes** keep their physics and feel exactly, with params defaulting to their source's constants: 6 from `reference/peak-prototype.html` (`particles`, `elastic`, `velocity`, `ripple`, `flow`, `warp`) and 4 from `reference/riso-demo.html` (`drop`, `pluck`, `overprint`, `halftone`).
- **Difficulty** is Easy, Medium or Spicy. The 10 Spicy scenes are the wildest ones.
- Scenes are named for what people want to make (use case), with the technique explained underneath.
- New scenes are built on the shared kits (§16.8), so each scene module stays small.

### §8.2 Flashing safety (hard requirement)
Applies to `neon`, `lightning`, `glitch`, `fireworks`, `fire`, `moire` and `tunnel` (marked ⚠ in SCENES.md) and to any scene that flashes or flickers:
- Never more than 3 flashes per second, whatever the params are and however fast the visitor clicks. Params that set a rate are capped in the schema.
- No large or full-screen flashes: a single brightness change never covers more than a quarter of the stage, and the background never flashes.
- Under reduced motion, the still frame shows no flash, and flicker effects stay off even after Play is pressed.
- Each flashing scene has a test that runs its timing at the most extreme params and fails if more than 3 flashes start in any one-second window.

### §8.3 Phones and touch
- Each scene uses lower counts when `isSmall` (under 700px wide), as listed in SCENES.md.
- Stages use `touch-action: pan-y`, so vertical swipes always scroll the page. Sideways drags can drive a scene directly.
- Drags that need free movement (grabbing letters, cloth, drawing) start only after the finger stays still for about 250ms (press and hold), so a normal swipe still scrolls. In Just play mode (§9.7) drags start immediately.

### §8.5 Every number is a setting (owner, 2026-10-16)
- Every number that shapes how a scene moves or looks is a param (a slider, toggle or select). The most important ones sit in Look, Motion and Interaction; the rest go in a collapsed **Advanced** group. Defaults equal the source's constants for ported scenes.
- The only numbers allowed in a scene's code are 0, 1, 2 and 0.5 (structural), digits passed to `toFixed()`, params, and the scene's `FIXED` constants, each with a written reason (for example a divide-by-zero guard, a still-frame composition, or the shared phone breakpoint). `tests/unit/constants.test.ts` enforces this.
- Nothing that changes the result stays hard-coded in a scene's behavior lines: the numbers live in param phrases.

### §8.6 Proven parity
- Ported scenes match their source pixel for pixel under identical conditions (`tests/e2e/parity.spec.ts`: same seed, viewport, frames and colors; under 2% of pixels differ at 1280×800 and 390×844).
- Every scene's prompt is proven to rebuild it: a fresh agent in an empty folder builds from the prompt alone, and `tests/e2e/prompt-parity.spec.ts` compares its page with the scene by the rule in §8.7 (`docs/PROMPT_TESTS.md`).

### §8.7 Prompt tests: the pass rule (owner, 2026-10-17)
Parity tests (our scene against the prototype) stay pixel-based. A **prompt test** (a fresh agent builds the scene from its prompt alone, then we compare) passes when the fresh build matches on what a person can measure, not on identical random numbers or frame timing:
- **Palette:** the same colors (hue mix overlap of at least 0.80 on clearly colored pixels).
- **Amount:** ink or element count within ±10%. Between 10% and 30% apart the test records "judge by eye" and the side-by-side picture decides; beyond 30% it fails. Frames with under 1% ink are judged on layout only.
- **Layout:** the same on-screen box (middle 90% of the ink within 5% of the screen size) and the same ink center when there is enough ink (at least 2%). While things are moving fast between moments, a box that differs is judged by eye instead, because one frame of timing moves a fast letter several percent.
- **Speed and settle time:** the amount of motion between scripted moments within ±20%, for motion large enough to be real movement (small jitter, like an idle shake, depends on the phase it was sampled at).
- **Reactions:** every scripted interaction (move, click, press) changes the picture the same way (more or less ink).
- **Side by side:** every run saves a picture of the built page next to ours (`docs/prompt-tests/<slug>/side-by-side-<size>.png`) for the owner to judge by eye.
A scene that fails because of a real difference in look or behavior gets its prompt phrases fixed and retested. A difference that comes only from random numbers or timing is not a failure.

### §8.4 Scene definition of done
A scene is done only when it has: the module interface (§16.3), a params schema with labels and plain-language help text for each param, a prompt phrase for every param (§10.4), 3–5 follow-up prompts, a "How it works" explanation (3–5 short sentences, §9.5), linked word-bank terms, a still frame, `destroy()` that removes all listeners and stops all work, mobile behavior (§8.3), passing tests (§21), and a row in `docs/PROMPT_TESTS.md`. Scenes marked ⚠ also pass the flash test (§8.2). If the scene is one of the 12 featured on the home page (§6.1), it replaces its stand-in there.

---

## §9 Scene page and playground (`/scenes/[slug]`)

The scene page is where "I like that" becomes a prompt.

### §9.1 Layout
- **Desktop (≥ 1024px):** the live scene fills the left area (the "stage"). A 400px panel on the right holds three tabs: **Tweak**, **Prompt**, **How it works**. The panel can collapse to give the stage the full width.
- **Tablet and phone:** the stage fills the screen. A bottom sheet with the same three tabs peeks 72px up (showing the tab names and a "Copy prompt" button), drags up to 50%, and expands to 90%. The sheet must not block the scene's own touch gestures when collapsed.
- Above the stage: the scene's use-case title (h1), one-line summary, difficulty, and time estimate.

### §9.2 Tweak tab
- Controls are **generated from the params schema** (§16.3). Never hand-build per-scene controls.
- Control types: slider (with a live value readout and unit), two-thumb range (for min/max pairs) or two linked sliders, text input (with a character counter at 80% of the limit), toggle, select (segmented control when ≤ 4 options), datetime.
- Every control has a label in plain language and an info button that shows its help text plus the linked word-bank term ("This is called **damping**. See it in the word bank.").
- Group controls under small headings ("Look", "Motion", "Interaction") as defined in the schema, plus a collapsed "Advanced" group holding every other number that shapes the scene (§8.5).
- **World picker:** 16 swatches (the worlds in §7; two rows of 8 on desktop, one swipeable row on phones). Selecting one re-themes the stage and the page with a 400ms OKLab crossfade (instant under reduced motion). A "Custom colors" option reveals three color inputs for c1–c3 plus ground; ink is derived automatically with `ensureContrast`.
- **Shuffle world** and the **Cycle worlds** toggle sit next to the picker (§6.7).
- Buttons: **Reset** (back to defaults), **Surprise me** (randomize within each param's range, keeping text params), **Share my version** (copies the URL, §9.6).
- Changes apply to the live scene immediately. Heavy params (`density`, `count`, `stars`, `spacing`) rebuild the scene, debounced to 150ms.

### §9.3 Prompt tab
- The live prompt (§10), regenerated on every change, shown in a scrollable, readable block (monospace is fine here because it's code-like content), with a word count.
- Options above it:
  - **Where is this going?** New page (default) / Add to my existing project / React component
  - **How much detail?** Detailed (default) / Quick
  - **Your experience:** I'm new to this (default) / I've done this before
- Primary button: **Copy prompt**. Shows a toast: "Prompt copied. Paste it into Claude Code." Secondary: **Download as PROMPT.md**.
- Below: **Next steps**, the scene's follow-up prompts (§10.6), each with its own copy button.
- Below that: "Did it work?" with two buttons, It worked / It didn't (§20).

### §9.4 Stage controls
On the stage itself: Pause/Play (mirrors the global button), **Just play** (fidget mode, §9.7), and Restart (re-runs the intro).

### §9.5 How it works tab
- 3–5 short sentences in plain language explaining the trick, with technical terms in bold linking to the word bank. Example for `particles`: "The word is drawn once on an invisible canvas, and we record where its pixels are. Each dot gets one of those spots as its home. Every frame, an invisible **spring** pulls each dot toward home, and **damping** slowly calms it down. Your cursor pushes nearby dots away; a click gives every dot a kick outward (an **impulse**)."
- "Words in this scene": chips for each linked term.
- "What else you could make with this": 2–3 ideas, each linking to a related scene or a follow-up prompt.

### §9.6 Shareable state (URL)
- The scene's world and every non-default param live in the query string: `/scenes/particles?w=arcade&text=MAYA&stiffness=0.05&bounce=0.9`. Custom colors: `w=custom&g=FFE3F1&c1=FF1F8E&c2=…&c3=…`. When Cycle worlds is on, its loop is stored as `cycle=dunes,abyss,toxic,vapor` (§6.7).
- On load, parse, validate, clamp to schema ranges, and ignore unknown keys. Text params are sanitized (plain text only, max length enforced).
- Update the URL with `history.replaceState`, debounced to 300ms, so the back button isn't flooded.
- "Share my version" copies the URL and uses the Web Share API on phones when available.

### §9.7 Fidget mode ("Just play")
Hides all UI except a small exit button in the corner. Requests fullscreen where supported. Esc or the exit button leaves. Keyboard shortcut: `F` on scene pages (only when focus isn't in an input).

### §9.8 Sound (optional, off by default)
- A global sound toggle in the header. Remember the choice in `localStorage` (wrapped in try/catch).
- All sounds are synthesized with the Web Audio API (no audio files): soft clicks for buttons, a pop for the particle explosion, a water drop for ripples, a rising whoosh for warp, little ticks for countdown flips. Quiet by default; never autoplay before the first user gesture.
- Each scene declares its sound hooks; scenes without sounds are fine.

---

## §10 Prompt builder

The prompt builder is the core of peak. It turns the current scene, world, and params into a prompt that Claude Code can build from in one go.

### §10.1 Requirements
1. **Self-contained.** The prompt never refers to peak, its code, or this repository. Someone pastes it into an empty folder and gets a working result.
2. **Exact.** Every param appears with its actual value plus a plain-language reason ("stiffness 0.05, so dots snap back quickly").
3. **Deterministic.** Same inputs → byte-identical prompt (snapshot-tested).
4. **Honest about the target.** The default build is one `index.html` with inline CSS and JS, no frameworks, no libraries, only Google Fonts allowed.
5. **Teaches.** For beginners, it asks Claude Code to explain how to open the result and suggest what to change next.

### §10.2 Detailed prompt structure

```
# Build: {use-case title}

## What I want
{2–3 sentences describing the experience in plain language, from the scene's meta.}

## Look
- Colors ("{world public name}" palette): background {ground}, text {ink}, secondary text {inkSoft}, accents {c1}, {c2}, {c3}.
- {Blend sentence: "Where accent colors overlap, multiply them like ink on paper." or "...add them so they glow."}
- {Cycle sentence, only when Cycle worlds is on (§6.7): crossfade between the four palettes, every hex value listed.}
- Font: "Anybody" from Google Fonts (variable width 50–150, weight 100–900), with a system sans-serif fallback.
- {Scene-specific look lines.}

## How it moves
{One bullet per param, from its prompt phrase (§10.4), in schema order.}
{Scene-specific behavior lines that aren't params (the fixed physics from the prototype).}

## How people interact
{Interaction bullets, desktop and touch.}

## Where this goes
{One of three blocks, §10.3.}

## Rules
- Smooth on a mid-range laptop and a phone: one requestAnimationFrame loop, batched canvas drawing, devicePixelRatio capped at 2, pause when off-screen.
- Respect prefers-reduced-motion: start paused and show a meaningful still frame, with a visible Play/Pause button.
- Accessible: real buttons, visible keyboard focus, text contrast of at least 4.5:1, decorative canvases hidden from screen readers.
- Works on touch screens without blocking vertical scrolling.

## When you're done
{Experience block, §10.5.}
```

### §10.3 "Where is this going?" blocks
- **New page (default):** "Create a single index.html file with all CSS and JavaScript inline, ready to open by double-clicking it. Don't use any libraries or build tools."
- **Add to my existing project:** "First, look at my project's files and figure out what framework and styling it uses. Add this as a component that fits how the project is already built. Don't change unrelated files. When you finish, tell me which files you added or changed and how to put the component on a page."
- **React component:** "Write this as a single React component file (.jsx, or .tsx if my project uses TypeScript) with no extra libraries. Include a short usage example."

### §10.4 Param phrases
Every param has a `phrase(value, allParams)` function returning one sentence. Rules: lead with the plain meaning, then the number; mention the direction of the effect; never use internal ids. **Every number is stated exactly once:** when one param's phrase already states another's value (for example a formula that uses both), the other param sets `phraseIn` and gets no line of its own. The Detailed prompt therefore includes every value, changed or not, so the result matches what the visitor saw without follow-up questions. Where randomness is involved, the scene's behavior lines spell out the order of random draws so a seeded run reproduces it exactly. Examples:
- `stiffness` 0.05 → "Each dot is tied to its home by a spring with stiffness 0.05 (higher snaps back faster; 0.035 feels natural)."
- `bounce` 0.92 → "Damping: multiply each dot's velocity by 0.92 every frame (closer to 1 means bouncier and slower to settle)."
- `text` "MAYA" → "The word is \"MAYA\", set in Anybody at weight 900, as large as fits within 82% of the screen width."

### §10.5 Experience blocks
- **I'm new to this:** "I'm new to coding. When you're done: 1) tell me in simple steps how to open the page in my browser, 2) explain in two or three sentences how it works, 3) suggest three small changes I could ask you for next."
- **I've done this before:** "Keep the explanation short: list the files and the key parameters I can tweak."

### §10.6 Quick prompt
For "Quick" detail: only the title line, "What I want", a one-line palette, the most important params (schema marks them `key: true`) plus every param the visitor changed, each as a short "Label: value" line, a one-line "Where this goes", and the line "Keep it smooth, accessible, and respectful of reduced motion." It's for people who want to spend fewer tokens: under 150 words (tested).

### §10.7 Follow-up prompts
Each scene ships 3–5 follow-ups, written to be pasted into the same Claude Code session after the first build. They may interpolate params. Examples for `particles`: "Make the dots change color depending on how fast they're moving." "Replace the dots with small emoji of my choice: ✨." "Add a soft pop sound when the dots explode, using the Web Audio API, off until I click once." "Make the word change every 5 seconds between: {text}, HELLO, BYE."

### §10.8 Prompt quality bar
Before launch, each scene's Detailed + New page + I'm new prompt (at defaults) is tested in a fresh Claude Code session in an empty folder. Pass = it runs without edits and looks and feels like the demo. Results go in `docs/PROMPT_TESTS.md` (template in PLAN Phase 5). A failing prompt gets fixed in its phrases or meta, not by special-casing.

### §10.9 Example output (abbreviated)
```
# Build: Your name in particles

## What I want
A full-screen intro where my word is made of thousands of small dots. When the page loads, the dots swarm in from all over the screen and settle into the letters. Moving my cursor pushes dots out of the way, and clicking makes them explode outward and then pull back into the word.

## Look
- Colors ("Dreamhouse" palette): background #FFE3F1, text #4A0532, secondary text #8A2B66, accents #FF1F8E, #1FA9DB, #FFC21A.
- Where accent colors overlap, multiply them like ink on paper.
...
## How it moves
- The word is "MAYA", set in Anybody at weight 900, as large as fits within 82% of the screen width.
- Use about 3,800 dots on desktop and 45% of that on screens under 700px wide.
- Each dot is tied to its home by a spring with stiffness 0.035 (higher snaps back faster; randomize each dot by ±40% so they arrive at different times).
...
```

---

## §11 Guides

Guides are Markdown/MDX content (§16.6), rendered with a readable layout in the Riso world. Each guide ends with a "Sources" list and a "Last checked: {date}" line.

**Facts about Claude Code (installation, requirements, plans, commands, features) must not be written from memory.** Look them up in the official documentation (start at https://docs.claude.com/en/docs/claude-code/overview), link to the exact pages, and keep the guide's wording general where details may change ("follow the install steps for your system on the official page"). The same applies to hosting providers in §11.3.

### §11.1 Start here (`/start`)
Audience: has never opened Claude Code. Sections:
1. **What Claude Code is**, in two sentences: an AI that works inside a folder on your computer, writing and editing files and running commands while you describe what you want.
2. **What you need:** a computer, a Claude account with Claude Code access (link to the official page that explains this), and about 20 minutes.
3. **Set it up:** link to the official install instructions; summarize the steps at a high level; note the desktop app as an alternative if the terminal feels scary (verify it's current).
4. **Your first build:** make a new empty folder, open Claude Code in it, paste a peak prompt (button: "Get a beginner-friendly prompt" → `/scenes/confetti`), and open `index.html` in your browser.
5. **Make it yours:** change one thing at a time; use the follow-up prompts; describe what you see vs. what you want.
6. **Helpful habits:** ask for a plan before big changes (link to the official docs on plan mode), and know how to undo (link to the official docs on checkpoints or rewind, if current).
7. **Next:** links to Word bank, Fix it, Put it online.

### §11.2 Fix it (`/fix`)
A list of symptoms. Each has: what's probably happening (one sentence) and **what to tell Claude Code** (a copyable message). Symptoms:
- The page is blank.
- Nothing moves.
- It's laggy or my laptop fan spins up.
- It looks wrong on my phone.
- The colors look wrong in dark mode.
- Text is hard to read.
- Claude Code changed things I didn't ask for.
- It worked, then broke after a change.
- I don't know how to open the file.
- I got an error message.
Plus a general section: how to describe a problem (what you did, what you expected, what happened) and how to open the browser console and copy errors (Chrome, Safari, Firefox; verify current menu names).

### §11.3 Put it online (`/ship`)
Three routes, easiest first, each with steps, what it's good for, and the official link:
1. **Drag and drop:** Netlify's drag-and-drop deploy for a folder (verify the current flow).
2. **GitHub Pages:** free hosting from a GitHub repository.
3. **Ask Claude Code to do it:** a copyable prompt: "Help me put this folder online for free. Walk me through each step, explain anything you need me to click or sign up for, and tell me the final link."
Ends with: how to share the link, and how to update the site later.

---

## §12 Word bank (`/words`)

A visual dictionary of the words that make animation prompts work. Each term has: the word, a one-sentence plain definition, a **mini live demo** (small, under 240px tall, paused until on screen), "Say it in a prompt" (a copyable example sentence), and "Seen in" links to scenes that use it.

Launch terms (24): easing, ease-in / ease-out, spring, stiffness, damping, velocity, momentum, impulse, gravity, drag (air resistance), lerp (smoothing), stagger, parallax, scroll-linked, marquee, particle system, flow field, trail, blend mode, variable font, opacity, transform (move, scale, rotate, skew), frame rate (60fps), reduced motion.

The page has a search box that filters terms as you type, and A–Z anchors. Each term has its own anchor (`/words#damping`) so scene pages can deep-link.

Mini demos are tiny modules with the same interface as scenes (§16.3) but no params panel: at most one inline slider where it teaches the concept (for example, `damping` has a slider and a bouncing dot).

---

## §13 Gallery (`/gallery`)

- A responsive grid of all 50 scenes. Tiles use their own scene's world, so the grid reads as a patchwork of color (§6.7). Each tile shows a live, low-cost preview (paused until on screen, lower particle counts) in the scene's world, the use-case title, one line, tags, difficulty, and time.
- Filters by use case: All, Portfolio, Events, Landing pages, Backgrounds, Headlines, Just for fun. Filter state is in the URL (`?tag=events`).
- Sort: Featured (default), Newest, Easiest first.
- Only previews in view run; at most 4 previews animate at once. Others show their still frame.
- Avoid the generic identical-card look: tiles have no shadows or borders; each tile is the live scene itself with its caption below.

---

## §14 Weekly drops (`/drops`)

- A drop = a new scene (or a new world) plus a short note. Content entries in `src/content/drops/` with frontmatter: `title`, `date`, `scene` (slug) or `world` (id), `summary`.
- `/drops` lists drops newest first. The home page shows the latest one. `/rss.xml` publishes them.
- Adding a weekly drop is a repeatable task with its own command (`/new-scene`), so the owner can ask Claude Code to make one each week.
- Launch with one drop: "Hello, peak" (the site itself).

---

## §15 About (`/about`)

The maker's page (portfolio). Placeholders the owner fills in: `[YOUR NAME]`, `[ONE-LINE BIO]`, `[WHAT YOU'RE LOOKING FOR, e.g. internships, freelance, collaborators]`, `[CONTACT LINK]`, `[SOCIAL LINKS]`. Uses the `tilt` card scene as the header with the owner's name. Includes a short "Why I made peak" paragraph that the owner writes (leave a clearly marked placeholder, don't invent one).

---

## §16 Technical architecture

### §16.1 Stack
- **Astro** (latest stable at setup time, static output) with **TypeScript strict**.
- No UI framework. Interactive parts are plain TypeScript modules mounted from Astro components via `<script>` tags.
- Plain CSS with custom properties. No CSS framework.
- Content: Astro content collections with Markdown/MDX for guides, words, drops.
- Testing: Vitest (unit), Playwright (end-to-end and screenshots).
- Formatting: Prettier with the Astro plugin.
- Dependency allowlist: `astro`, `@astrojs/mdx`, `@astrojs/sitemap`, `@astrojs/rss`, `typescript`, `vitest`, `@playwright/test`, `prettier`, `prettier-plugin-astro`. Anything else needs the owner's OK. No animation, color, or physics libraries: color math and physics are written in this repo.

### §16.2 Folder structure
```
src/
  pages/            index.astro, gallery.astro, tour.astro, scenes/[slug].astro, start.astro, fix.astro,
                    ship.astro, words.astro, drops/index.astro, drops/[slug].astro, about.astro,
                    rss.xml.ts, 404.astro
  layouts/          Base.astro, Guide.astro
  components/       Header, Footer, WorldRail, SceneStage, Playground, controls/*, PromptPanel,
                    WorldPicker, CopyButton, Toast, TermChip, MiniDemo, BottomSheet
  engine/           scheduler.ts, pointer.ts, canvas.ts, scroll.ts, motion.ts (pause + reduced
                    motion), audio.ts, fullscreen.ts
  kits/             easing.ts, text.ts, physics.ts, field.ts, render.ts (§16.8)
  theme/            color.ts (sRGB↔OKLab, mix, contrast, ensureContrast), worlds.ts,
                    store.ts (current Theme + subscribe), journey.ts (scroll blending), apply.ts,
                    living.ts (accent drift, §6.7)
  scenes/           registry.ts, types.ts, <slug>/{index.ts, params.ts, prompt.ts, meta.ts}
  words/            <term>.ts mini demos
  prompt/           builder.ts, blocks.ts (where/experience/rules), quick.ts
  state/            url.ts (encode/decode/validate params)
  analytics/        track.ts (no-op by default)
  content/          config.ts, guides/*.mdx, words/*.md, drops/*.md
  styles/           global.css, tokens.css, type.css
tests/
  unit/             color.test.ts, journey.test.ts, living.test.ts, prompt.test.ts, url.test.ts,
                    params.test.ts, flash.test.ts, kits/*.test.ts
  e2e/              pages.spec.ts, playground.spec.ts, journey.spec.ts, tour.spec.ts, a11y.spec.ts,
                    mobile.spec.ts
reference/          peak-prototype.html, riso-demo.html (read-only)
docs/               PRD.md, SCENES.md, PLAN.md, DECISIONS.md, PROMPT_TESTS.md
```

### §16.3 Scene module interface
```ts
// src/scenes/types.ts
export type ParamValue = number | string | boolean;
export type Params = Record<string, ParamValue>;

interface ParamBase {
  id: string;            // stable, used in URLs
  label: string;         // plain language, shown in UI
  help: string;          // one or two sentences, shown in the info popover
  group: 'Look' | 'Motion' | 'Interaction' | 'Advanced'; // Advanced is collapsed (§8.5)
  term?: string;         // word-bank id, e.g. 'damping'
  key?: boolean;         // included in the Quick prompt
  rebuild?: boolean;     // changing it rebuilds the scene (debounced)
  phraseIn?: string;     // another param whose phrase already states this value (§10.4)
  phrase: (value: any, all: Params) => string; // §10.4
}
export type Param =
  | (ParamBase & { kind: 'slider'; min: number; max: number; step: number; default: number; unit?: string; invertDisplay?: boolean })
  | (ParamBase & { kind: 'text'; maxLength: number; default: string })
  | (ParamBase & { kind: 'toggle'; default: boolean })
  | (ParamBase & { kind: 'select'; options: { value: string; label: string }[]; default: string })
  | (ParamBase & { kind: 'datetime'; default: () => string });

export interface SceneMeta {
  slug: string; title: string; summary: string; useCase: string;
  tags: string[]; difficulty: 'Easy' | 'Medium' | 'Spicy'; minutes: number;
  world: WorldId; terms: string[];
  howItWorks: string[];        // §9.5 sentences, may contain **term** markers
  whatElse: string[];          // §9.5 ideas
  wants: string;               // §10.2 "What I want"
  lookLines: string[]; behaviorLines: string[]; interactionLines: string[];
}

export interface SceneContext {
  theme: Theme;                // current theme (updated via setTheme)
  reducedMotion: boolean;
  isSmall: boolean;            // under 700px wide
  quality: 'full' | 'preview'; // gallery previews use 'preview' (lower counts)
  sound: SoundHooks;
}

export interface SceneInstance {
  resize(): void;
  update(dt: number, t: number): void;  // called by the scheduler only while visible and playing
  still(): void;                        // draw a meaningful static frame
  setParams(next: Params): void;
  setTheme(theme: Theme): void;
  restart(): void;
  destroy(): void;                      // remove every listener, observer, timer; free canvases
}

export interface SceneModule {
  meta: SceneMeta;
  params: Param[];
  followUps: (p: Params) => string[];
  create(host: HTMLElement, params: Params, ctx: SceneContext): SceneInstance;
}
```

### §16.4 Engine
- **Scheduler:** exactly one `requestAnimationFrame` loop for the whole page. Scenes register and unregister. Per frame: compute `dt` (seconds, clamped to 0.05), tick scroll velocity, call `update` on scenes that are visible (IntersectionObserver, 80px margin) and not paused. Stops entirely when the page is paused or nothing is visible.
- **Frame factor:** physics ported from the prototype uses `f = min(dt × 60, 2.5)` so it behaves the same at 60Hz and 120Hz.
- **Canvas helper:** sizes to its host with ResizeObserver, devicePixelRatio capped at 2, `setTransform` so scene math is in CSS pixels.
- **Pointer helper:** pointer events relative to the host; `{ x, y, active, down }`; handles leave and cancel; `touch-action: pan-y` on stages.
- **Scroll helper:** smoothed scroll velocity and direction (prototype logic), readable from any element (window or an inner scroller).
- **Motion:** global paused state; starts paused under `prefers-reduced-motion: reduce`; reacts to changes; when paused, every visible scene renders `still()`.
- **Theme store:** holds the current `Theme`; `subscribe(fn)`; scenes receive `setTheme` on change. Writes CSS variables via `apply.ts`. Applies living-color drift (§6.7) on top of the base or blended theme.
- **Fonts:** wait for Anybody (`document.fonts.load`, 2.5s timeout) before building text-sampled scenes, then rebuild text-dependent scenes once.

### §16.5 Theme engine
- `color.ts`: hex ↔ sRGB ↔ linear ↔ OKLab conversion, `mixOklab(a, b, t)`, WCAG relative luminance and `contrast(a, b)`, `ensureContrast(fg, bg, min)` (§6.3). Pure functions, fully unit-tested.
- `worlds.ts`: the table in §7 as typed data, plus derived tokens. Types:
  ```ts
  export type WorldId = 'dreamhouse' | 'dunes' | 'doomsday' | 'abyss' | 'glacier' | 'arcade' | 'matcha' | 'riso'
    | 'aurora' | 'lava' | 'vapor' | 'blueprint' | 'golden' | 'cherry' | 'newsprint' | 'toxic' | 'custom';
  export interface Theme {
    id: WorldId; name: string; mode: 'light' | 'dark';
    ground: string; surface: string; ink: string; inkSoft: string;
    c1: string; c2: string; c3: string;
    accentText: string; focus: string; line: string; headerBg: string;
    blend: 'multiply' | 'lighter' | 'source-over';
  }
  ```
- `journey.ts`: maps a scroll position and section boundaries to `{ from, to, t }` and the blended `Theme`.

### §16.6 Content collections
`guides` (MDX: title, description, lastChecked, sources[]), `words` (Markdown: term, definition, sayIt, demo id, seenIn[]), `drops` (Markdown: title, date, scene?, world?, summary). Schemas validated with Astro's content config.

### §16.7 State and storage
URL query for scene state (§9.6). `localStorage` only for sound on/off, Living colors on/off (§6.7) and the last custom palette, wrapped in try/catch, with the page working normally when storage is unavailable.

### §16.8 Shared kits
Build these once in `src/kits/` and reuse them instead of rewriting physics in every scene. Kits are plain TypeScript with no dependencies (no animation, physics or color libraries), take the frame factor `f` (§16.4) wherever they step physics, and read colors only from the theme. A scene module wires kits together and adds its own look and params, so scenes stay small.
- **Text kit (`text.ts`):** text to points (sampled from an offscreen canvas: `particles`, `sand`, `marbles`), text to per-letter boxes (position, size and baseline of each letter: `skid`, `tumble`, `fridge`), and letter outlines as paths (`neon`, `shatter`, `rubber`). Always waits for Anybody through the font helper (§16.4) and re-runs once the font arrives.
- **Physics kit (`physics.ts`):** circles with a spatial hash for collisions; rigid boxes with rotation; springs (positional and single-value); verlet points with distance constraints for ropes and cloth, including tearing; gravity and drag.
- **Field kit (`field.ts`):** seeded smooth noise (2D and 3D), flow fields, and a simple low-resolution fluid (advect, diffuse, project) for `smoke` and `fire`.
- **Render kit (`render.ts`):** batched dots, lines and trails (one path per color), a low-resolution metaball renderer (`lava`), and glow through blend modes and stacked strokes, never `shadowBlur` in hot loops.
- **Easing library (`easing.ts`):** in, out and in-out curves (quad, cubic, quart, expo, back, elastic, bounce), smoothstep and smootherstep, and a damped-spring helper. All pure functions.
- **Tests:** every kit has unit tests for its math (for example: collisions conserve momentum within tolerance, constraints converge, noise is deterministic for a seed and continuous, easing curves return 0 at 0 and 1 at 1) and a micro-benchmark spot check (for example, 2,000 circles in the spatial hash step in under 2ms on the dev machine).

---

## §17 Accessibility and motion

- Target WCAG 2.2 AA.
- **Reduced motion:** under `prefers-reduced-motion: reduce`, every scene starts paused and shows its still frame; the global Play button starts motion on request; smooth scrolling is off; world crossfades on scene pages are instant. Scroll-linked color blending stays (§6.6). Living colors and Cycle worlds start paused along with everything else, and Tour autoplay jumps instead of scrolling smoothly (§6.7).
- **Pause:** a global Pause/Play button in the header, always visible, keyboard reachable. Pausing stops the scheduler.
- **Keyboard:** every control reachable and operable; visible `:focus-visible` ring (3px, `--focus`, 3px offset); the bottom sheet and menu trap focus while open and return it when closed; Esc closes them.
- **Screen readers:** stages are `aria-hidden` canvases with a visually hidden description of the scene; each control has a label; copy actions announce via a polite live region ("Prompt copied").
- **Contrast:** §6.3 guardrails; also tested in e2e on every page in each world.
- **Touch:** targets ≥ 44px; stages use `touch-action: pan-y`; no gesture is required to use the site.
- **No flashing:** follow §8.2: never more than 3 flashes per second and no large or full-screen flashes. This covers `neon`, `lightning`, `glitch`, `fireworks`, `fire`, `moire`, `tunnel` and anything else that flickers. The confetti and warp scenes must not strobe.

---

## §18 Visual design system

- **Type:** Anybody only (Google Fonts, `ital,wdth,wght@0,50..150,100..900;1,50..150,100..900`), with fallback `"Anybody", "Arial Narrow", "Helvetica Neue", Arial, sans-serif`. Always set `font-weight` alongside `font-variation-settings`.
  - Display / scene titles: clamp(2rem, 5vw, 4rem), wdth 125, wght 800, line-height 1.02.
  - h2: clamp(1.5rem, 3vw, 2.3rem), wdth 125, wght 800.
  - Body: clamp(1rem, 1.2vw, 1.125rem), wdth 95, wght 450, line-height 1.5, line length ≤ 68ch.
  - Small UI text: 0.875rem, wdth 90, wght 600.
- **The wordmark** "peak" stretches from wdth 50 to 150 with page scroll progress (from the prototype).
- **Layout:** left-aligned text, generous whitespace, full-bleed stages. Content pages: a single 68ch column with a wide gutter.
- **Buttons:** pill-shaped. Primary: ink background, ground text. Secondary: 1.5px currentColor border, transparent background. Copy buttons show a check icon for 1.5s after copying.
- **Panels and sheets:** `--surface` background, `--line` borders, 16px radius on panels, 24px on the bottom sheet's top corners. No drop shadows except a single soft one on the bottom sheet so it reads as floating.
- **Icons:** inline SVG, 1.75px stroke, `currentColor`.
- **Motion in the UI:** UI motion only answers an action (opening a sheet, confirming a copy, switching tabs). 150–250ms, ease-out. No scroll-triggered fade-ins on content.
- **Avoid:** gradient washes as decoration, identical rounded cards with grey shadows, ALL-CAPS eyebrow labels, emoji in UI, arrows appended to button text, glassmorphism, a custom cursor replacing the real one.
- **Copy voice:** plain, second person, sentence case, short. Buttons say exactly what happens ("Copy prompt", toast "Prompt copied"). Errors say what happened and what to do, without apologizing.

---

## §19 Performance budgets

- Content pages (start, fix, ship, words, about, drops): Lighthouse mobile Performance ≥ 95, Accessibility ≥ 95, Best Practices ≥ 95, SEO ≥ 95.
- Home and scene pages: Lighthouse mobile Performance ≥ 85; Largest Contentful Paint < 2.5s on a simulated mid-range phone; no long tasks over 100ms after load except the first particle sampling.
- JavaScript: each scene is its own chunk, loaded only on pages that use it. Home page initial JS ≤ 60 KB gzipped before scene chunks.
- Frame time: on a mid-range laptop, scripting ≤ 8ms per frame for any single scene at default params.
- Gallery: ≤ 4 previews animating at once.
- Tour: at most 2 scenes running at once; scenes more than two screens away are destroyed (§6.7).
- Living colors: drift recomputed at most 20 times per second; CSS variables written only when they change.
- Phones: every scene uses its lower `isSmall` counts (SCENES.md).
- Fonts: preconnect to Google Fonts; `display=swap`.

---

## §20 Analytics and feedback (optional)

- `track(event, data)` is a no-op by default. If the owner enables a privacy-friendly provider later (decision for the owner), it plugs in here. No cookies, no personal data.
- Events: `prompt_copied` (scene, options), `prompt_downloaded`, `followup_copied`, `share_copied`, `world_changed`, `it_worked`, `it_didnt`.
- "Did it work?" buttons: if `PUBLIC_FEEDBACK_URL` is set at build time, "It didn't" opens that form in a new tab with the scene slug and the prompt options in the query string; otherwise the buttons only fire `track` and show "Thanks, noted."

---

## §21 Testing strategy

- **Unit (Vitest):** color math round-trips and known values; `ensureContrast`; the contrast guardrail across every pair of the 16 worlds (§6.3, §6.7); living-color drift stays within ±12° and never changes text tokens; shared kits (§16.8); flash limits for every ⚠ scene (§8.2); prompt builder snapshots for each scene × 3 targets × 2 detail levels × 2 experience levels at defaults; every param's phrase appears in the prompt and changes when its value changes; URL encode/decode round-trips, clamping, and rejection of junk; params schema validity (defaults within range, unique ids, help text present).
- **End-to-end (Playwright):** every route loads with zero console errors; home journey changes `--ground` as you scroll; scene pages: changing a slider updates the prompt, Copy prompt puts text on the clipboard, Share my version round-trips state through the URL, Reset restores defaults; reduced-motion emulation starts paused; Tour: autoplay advances and stops on input, Shuffle order round-trips through the URL, and no more than 2 scenes run at once; mobile viewport (390×844): the bottom sheet opens, closes, and doesn't block scrolling; keyboard-only run through a scene page.
- **Visual:** a script captures each scene's still frame in each of 2 worlds for review, and generates OG images (§22).
- **Manual:** the prompt quality test (§10.8) and the friend test (PLAN Phase 12).

---

## §22 SEO and sharing

- Unique `<title>` and meta description per page. Canonical URLs. `sitemap.xml` via `@astrojs/sitemap`. `robots.txt`.
- Open Graph and Twitter card images: one per scene (a still frame in its world with the title), one for the home page, one generic. Generated at build time by a Playwright script and committed to `public/og/`.
- Scene pages with custom params keep the scene's default OG image.

---

## §23 Deployment

- Static build (`astro build` → `dist/`).
- Host: the owner chooses Vercel, Netlify, or GitHub Pages (decision recorded in `docs/DECISIONS.md`). Set up a GitHub repository and automatic deploys on push to `main`, with preview deploys for branches where the host supports it.
- `PUBLIC_SITE_URL` and `PUBLIC_FEEDBACK_URL` are environment variables.
- Never deploy without the owner's go-ahead.

---

## §24 Backlog (not in v1)

- More scenes: photo to particles (local only, no upload), 3D tilt gallery, audio-reactive visualizer (microphone, opt-in). (Loading screens, cursor trails, liquid-style text and page transitions moved into v1.1 as `loaders`, `trail`, `melt` and `curtain`.)
- A "starter kit" download: a zipped folder with a `CLAUDE.md` tuned for beginners plus the prompt.
- Localized prompts and guides.
- Community submissions.

---

## §25 Risks and open questions

| Risk | Mitigation |
|---|---|
| Generated prompts don't reproduce the demo well. | §10.8 testing before launch; phrase-level fixes; snapshot tests prevent regressions. |
| Light↔dark blends make text unreadable mid-scroll. | §6.3 `ensureContrast` + automated guardrail test. |
| Too many canvases tank performance on phones. | One scheduler, visibility gating, quality presets, gallery cap of 4 live previews. |
| Claude Code facts in the guides go stale. | Link to official docs, keep wording general, "Last checked" date on every guide. |
| Trademarked names creep into UI or prompts. | Original world names only (§7); a unit test fails if any world name, page copy, or generated prompt contains the whole word "Barbie" or "Dune" (case-insensitive, word boundaries, so "Spice Dunes" is fine). |
| 50 scenes is a big build; quality could slip toward the end. | Shared kits (§16.8); one scene per step with the same definition of done (§8.4); a checkpoint at the end of every wave in PLAN. |
| Flashing scenes (neon, lightning, glitch, fireworks…) could harm visitors. | §8.2 limits, capped params, an automated flash test per scene, flicker off under reduced motion. |
| Living colors could make text unreadable or feel restless. | Text tokens never drift; drift is small (±12°) and slow (30s); the header toggle turns it off; it stops when motion is paused. |
| The Tour page could run out of memory or frame budget with 50 scenes. | At most 2 running, mount/destroy by distance, phone counts, e2e check of the running count. |

Open questions for the owner (record answers in `docs/DECISIONS.md`):
1. Which host: Vercel, Netlify, or GitHub Pages?
2. Enable analytics? Which provider?
3. Feedback form URL for "It didn't work"?
4. About page details (§15).
5. Domain name?
