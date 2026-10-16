# peak: Build plan

This is the order to build peak in (PRD v1.1: 50 scenes, 16 worlds, always-changing color). Work top to bottom, one step at a time. Each step names the PRD or SCENES.md sections to read, what to do, and how to know it's done.

**How to run it in Claude Code:** type `/next`. Claude Code finds the first unchecked step, builds it, runs its checks, ticks the box, commits, and stops so you can look. Type `/next` again for the next step.

**Waves and wrap-ups:** the build is split into waves. Checkpoints 0 and 1 were owner reviews (done). From Wave 2 on, the owner asked Claude Code not to wait (2026-10-16): each wave ends with a **Wrap-up** box instead. When `/next` reaches one, it:
1. runs the full suite (`npm run check` and `npm run test:e2e`); everything must pass;
2. pushes to `main`, waits for the Vercel deploy to finish (if it fails: read the build log, fix, push again);
3. runs the live smoke tests (`npm run test:live`);
4. sends the owner a short update: what's new, the live link, three things to try on a phone, anything that needs them;
5. ticks the box and continues with the next wave.
Only logins, the About page details and anything that costs money wait for the owner.

**Prompt tests (PRD §10.8):** after a wave's scenes are done, each scene's default prompt (Detailed + New page + I'm new) goes to a fresh subagent working in an empty temporary folder outside this repo. Claude Code opens the result in a browser, compares it with the real scene, and logs pass or fail in `docs/PROMPT_TESTS.md`. A failure is fixed in the scene's phrases or meta (never the test) and retested once. To save the owner's usage, each wave tests its Spicy scenes plus at least one easy scene; untested scenes are listed in `docs/PROMPT_TESTS.md`.

Legend: `[ ]` to do · `[x]` done · **Owner** = something only you can decide or do.

---

## Definition of done for every scene step

Unless a step says otherwise, a scene step is done when:
1. It matches its entry in `docs/SCENES.md` and the scene definition of done in PRD §8.4. Ported scenes pass the parity test against their source (`tests/e2e/parity.spec.ts`, PRD §8.6).
1b. Every number that shapes it is a param or a reasoned `FIXED` constant (PRD §8.5, `tests/unit/constants.test.ts`).
2. Every param visibly changes the scene on `/dev/scenes`, and has a label, help text and prompt phrase.
3. `still()` draws a meaningful frame; pause and reduced motion work.
4. `destroy()` leaves nothing behind (e2e: mount and destroy 20 times, listener count back to baseline, no console errors).
5. It works at 390×844 with touch, uses its phone counts, and never blocks vertical scrolling (PRD §8.3).
6. Schema validator, prompt snapshot and phrase-coverage tests pass (from Wave 2 on; Wave 1 ports get theirs in step 2.10).
7. Scenes marked ⚠ pass the flash test (PRD §8.2).
8. Scripting stays within 8ms per frame at defaults on the dev machine (spot-check in DevTools).
9. It has a row in `docs/PROMPT_TESTS.md` (from step 2.13 on): tested by a fresh subagent, or marked "not tested" with the reason.
10. If it's one of the 12 featured on the home page (PRD §6.1), it replaces its stand-in there.

---

## Phase 0: Project setup

- [x] **0.1 Scaffold the project** · PRD §16.1, §16.2
  - Do: Create an Astro project in this folder (static output, TypeScript strict, no UI framework integration). Add `@astrojs/mdx`, `@astrojs/sitemap`, `@astrojs/rss`. Add Vitest, Playwright (Chromium + WebKit), Prettier with the Astro plugin. Pin exact versions (no `^` or `~`), choosing releases at least two weeks old. Create the folder structure from §16.2 with empty placeholder files where useful. This folder already contains `CLAUDE.md`, `.claude/`, `docs/`, and `reference/`: scaffold without overwriting or deleting any of them (for example, scaffold into a temporary folder and move the files in).
  - Scripts in `package.json`: `dev`, `build`, `preview`, `format`, `test` (vitest run), `test:e2e` (playwright), `check` (astro check + tsc --noEmit + prettier --check + vitest run).
  - Done when: `npm run dev` serves a blank page, `npm run build` succeeds, `npm run check` passes.

- [x] **0.2 Repo hygiene**
  - Do: `git init` if needed, a `.gitignore` (node_modules, dist, .astro, test results, `.env`), `.env.example` with `PUBLIC_SITE_URL` and `PUBLIC_FEEDBACK_URL`, a short `README.md` (what peak is, how to run it, link to docs). Keep `docs/DECISIONS.md` as it is. Add the folders new in PRD v1.1 §16.2 (`src/kits/`) with placeholders.
  - Done when: first commit exists and `npm run check` passes.

- [x] **0.3 Test harness smoke tests**
  - Do: One trivial Vitest test and one Playwright test that loads `/` and asserts zero console errors. Configure Playwright to run against `astro preview`, with a desktop project (1280×800) and a mobile project (390×844, touch).
  - Done when: `npm run check` and `npm run test:e2e` both pass.

- [x] **Checkpoint 0 (Owner):** run `npm run dev` and confirm the page opens. Answer the open questions in `docs/DECISIONS.md` when you can (the ones marked "Needed by" say which wave they block).

---

## Wave 1: The vertical slice (foundations, six ported scenes, the color engine)

Goal: the home page scrolls through 12 worlds with living colors, using the six prototype scenes.

- [x] **1.1 Color math** · PRD §6.3, §16.5
  - Do: `src/theme/color.ts`: hex parse/format, sRGB ↔ linear ↔ OKLab ↔ OKLCH, `mixOklab`, gamut fitting (reduce chroma until in sRGB), relative luminance, `contrast`, `ensureContrast(fg, bg, min)` (move OKLab L away from the background until the minimum is met; fall back to pure black or white).
  - Done when: unit tests cover round-trips (error < 1/255), OKLCH hue rotation keeps L and C, gamut fitting always returns valid sRGB, known contrast values (#000 vs #FFF = 21), and `ensureContrast` reaching 4.5 for every ground from #000 to #FFF in 64 steps.

- [x] **1.2 Worlds as data** · PRD §7
  - Do: `src/theme/worlds.ts` with all 16 worlds (the 8 from v1.0 including Riso light and dark, plus Aurora, Lava Lamp, Vapor Mall, Blueprint, Golden Hour, Cherry Cola, Newsprint, Toxic). Compute derived tokens (`accentText`, `focus`, `line`, `headerBg`, `blend`).
  - Done when: unit tests check every world's ink and inkSoft ≥ 4.5:1 on ground and surface, `accentText` ≥ 3:1, and that no public name contains the whole words "Barbie" or "Dune".

- [x] **1.3 Theme store and CSS variables** · PRD §16.4, §16.5
  - Do: `store.ts` (current Theme, `subscribe`), `apply.ts` (writes `--ground`, `--surface`, `--ink`, `--ink-soft`, `--c1..3`, `--accent-text`, `--focus`, `--line`, `--header-bg` on `:root`, only when changed). Riso follows `prefers-color-scheme` and updates live.
  - Done when: a unit test confirms `apply` skips unchanged values; switching the OS theme on a test page flips Riso without a reload.

- [x] **1.4 Global styles and type** · PRD §18
  - Do: `tokens.css`, `type.css`, `global.css`: the type scale, Anybody font loading with fallbacks, focus ring, buttons (primary/secondary pill), base layout, safe-area padding for notched phones, `.sr-only`.
  - Done when: a `/dev/styleguide` page (excluded from the sitemap and production nav) shows type, buttons, focus states, and swatches for all 16 worlds, and passes an automated contrast check.

- [x] **1.5 Layout shell** · PRD §5, §17
  - Do: `Base.astro`, `Header.astro` (wordmark that stretches with scroll progress; nav: Gallery, Tour, Start here, Words, Drops; mobile menu sheet with focus trap; Pause/Play button; Living colors toggle (wired up in 1.15); Sound toggle placeholder), `Footer.astro` (the five-step journey links, credit, RSS). Placeholder pages for every route in §5, including `/tour`, so links work.
  - Done when: every route loads with zero console errors (e2e), keyboard tab order is logical, the mobile menu opens/closes with Esc and returns focus.

- [x] **1.6 Engine** · PRD §16.4, §17
  - Do: `scheduler.ts` (single rAF, register/unregister, visibility via IntersectionObserver, dt clamp, skips frames where no time has passed, stops when idle), `canvas.ts`, `pointer.ts` (including press-and-hold drag start, PRD §8.3), `scroll.ts` (window or inner scroller), `motion.ts` (global pause, reduced-motion start state, live updates, `still()` on pause), font-ready helper. Port behavior from `reference/peak-prototype.html` where it exists.
  - Done when: unit tests cover dt clamping, zero-dt frames, and scroll velocity smoothing; an e2e test with reduced motion emulated confirms the scheduler doesn't start until Play is pressed.

- [x] **1.7 Scene types and registry** · PRD §16.3, §8.4
  - Do: `src/scenes/types.ts` exactly as §16.3, `registry.ts` (slug → lazy import). A schema validator used by tests: unique ids, defaults within range, help text and phrase present for every param, every `term` exists in the word list (stub list for now), rate params of ⚠ scenes capped (PRD §8.2).
  - Done when: `npm run check` passes with the registry empty.

For steps 1.8–1.13: read the scene's section of `reference/peak-prototype.html` and its entry in `docs/SCENES.md`, then create `src/scenes/<slug>/` with `meta.ts`, `params.ts` (defaults equal to the prototype's constants), `prompt.ts` (phrases and follow-ups; full prompts come in Wave 2, but write phrases now), and `index.ts`. Add the scene to `/dev/scenes`, a page that renders any scene full-screen with a raw debug panel of its params (built in 1.8).

- [x] **1.8 `particles`** · SCENES.md #1
- [x] **1.9 `elastic`** · SCENES.md #2
- [x] **1.10 `velocity`** · SCENES.md #3 (including the inner scroller for scene pages)
- [x] **1.11 `ripple`** · SCENES.md #21
- [x] **1.12 `flow`** · SCENES.md #22
- [x] **1.13 `warp`** · SCENES.md #23
  - Done when (each): the scene definition of done at the top of this file, items 1–5 and 8.

- [x] **1.14 Journey math** · PRD §6.2, §6.3, §6.4
  - Do: `src/theme/journey.ts`: given section boundaries, their worlds and the scroll position, return `{ from, to, t }` (35%-of-viewport blend zones, smootherstep) and the blended Theme (OKLab mix, `ensureContrast` on ink, inkSoft, accentText, blend mode from ground L). It must work for any order of worlds (the Tour reuses it).
  - Done when: unit tests cover hold zones and zone edges, and the **contrast guardrail**: every ordered pair of the 16 worlds sampled at t = 0…1 in 0.01 steps meets §6.3 minimums.

- [x] **1.15 Living colors** · PRD §6.7 (item 3)
  - Do: `src/theme/living.ts`: OKLCH hue drift of c1–c3 (±12°, 30-second loop, phases 0°/120°/240°, gamut-fitted), applied after blending; recomputed at most 20 times a second; CSS variables written only on change. Wire the header toggle (remembered in `localStorage` with try/catch). Stops when motion is paused and under reduced motion.
  - Done when: unit tests confirm drift never exceeds ±12°, text tokens are byte-identical with drift on and off, and outputs are valid sRGB; e2e: `--c1` changes over 3 seconds with the toggle on and stays fixed with it off or when paused.

- [x] **1.16 Home journey** · PRD §6.1, §6.5, §18
  - Do: Build the home page: hero (`particles`), the 11 featured sections in the order from §6.1, then How it works (Matcha, 4 numbered steps with tiny loops) and a Start here call to action (the latest drop row comes in Wave 8). Each section full-viewport with its caption and "Tweak it and get the prompt" button. World order from `journey.ts` config. Slots whose scene isn't built yet show a stand-in (one of the six ported scenes, rotating, in that slot's world). Header, buttons, focus ring, scrims and captions read only from CSS variables; scenes update via `setTheme` (no `getComputedStyle` in frames). Add the world rail (dots per section, active dot larger, click scrolls, hidden under 700px, keyboard and screen-reader labels).
  - Done when: scrolling top to bottom blends through all 12 worlds plus Matcha with no hard cuts; e2e asserts `--ground` changes across sections; only on-screen scenes run (scheduler debug count); e2e screenshots at 7 scroll positions show readable header and captions; an automated contrast check passes at 50 sampled scroll positions.

- [x] **Checkpoint 1 (Owner):** scroll the home page slowly, then fast, on your laptop and your phone, and watch the colors change: 12 worlds blending on scroll, accents drifting with Living colors on, steady with it off. This is the moment to adjust world colors or the home order (edit `worlds.ts` / `journey.ts`, or ask Claude Code to).

---

## Phase D: Deploy (before Wave 2)

- [x] **D.1 Repo safety and noindex** · PRD §22, §23
  - Do: confirm `.env*` and secrets are git-ignored and nothing private is tracked; add a `noindex` robots meta tag on every page and a disallow-all `public/robots.txt`. Both come off at launch (step 9.9).
  - Done when: `git ls-files` shows no secrets; e2e confirms the meta tag on every route and the robots.txt contents.
- [x] **D.2 GitHub**
  - Do: create the public GitHub repo `peak` and push `main`.
  - Done when: the repo exists and `main` is pushed.
- [x] **D.3 Vercel** · PRD §23
  - Do: following Vercel's official docs for a static Astro site, create the Vercel project from the GitHub repo (build command `astro build`, output `dist`, Node version from `engines`), with automatic deploys on push to `main`. Set `PUBLIC_SITE_URL` to the `vercel.app` address and redeploy. Add `npm run test:live` (Playwright smoke tests against `PEAK_LIVE_URL`).
  - Done when: the live URL serves the site, a push to `main` deploys by itself, and `npm run test:live` passes.
- [ ] **D.4 Vercel Web Analytics** · PRD §20
  - Do: page views as Vercel's docs describe for a static Astro site; custom events only if free on the Hobby plan (otherwise `track()` stays a no-op). No cookies, no personal data.
  - Done when: the analytics script loads on the live site with no console errors; the decision about custom events is logged with its source.

---

## Wave 2: Scene pages, playground, prompt builder, Shuffle and Cycle worlds

Goal: every later scene gets the playground and prompts for free.

- [ ] **2.1 Scene page layout** · PRD §9.1, §9.4
  - Do: `/scenes/[slug]` (static paths from the registry): title block, stage, desktop side panel with three tabs, collapse button; stage controls (Pause/Play, Just play, Restart).
  - Done when: all six ported scenes render on their pages in their default world; tabs are keyboard-operable (arrow keys between tabs).

- [ ] **2.2 Controls from the schema** · PRD §9.2
  - Do: `components/controls/*` for slider, range pair, text (with counter), toggle, select/segmented, datetime. Groups, labels, info popovers with help text and word-bank links. Debounced rebuild for `rebuild: true` params.
  - Done when: every param of every built scene has a working control; changing values updates the stage live; screen readers announce labels and values.

- [ ] **2.3 World picker and custom colors** · PRD §9.2, §7
  - Done when: the picker shows 16 swatches (two rows on desktop, one swipeable row on phones); picking a world crossfades the page and stage in 400ms (instant under reduced motion); custom colors derive a readable ink automatically; contrast tests pass for 20 random custom palettes.

- [ ] **2.4 Shuffle world and Cycle worlds** · PRD §6.7 (item 4)
  - Done when: Shuffle world always picks a different world; Cycle worlds crossfades every 8 seconds (1.5-second crossfade) through a loop of four, pauses with motion, switches instantly under reduced motion, and Shuffle while cycling picks a new loop; e2e: with Cycle on, `--ground` changes within 9 seconds.

- [ ] **2.5 Reset, Surprise me, Share my version** · PRD §9.2, §9.6
  - Do: `src/state/url.ts` encode/decode with validation and clamping (params, `w`, custom colors, `cycle`); `replaceState` debounced; Share uses the Web Share API on phones when available, else the clipboard.
  - Done when: unit tests round-trip every built scene's params and the cycle loop; junk and out-of-range values are clamped or dropped; e2e: change three params and turn on Cycle worlds, copy the share URL, open it in a new page, same state.

- [ ] **2.6 Mobile bottom sheet** · PRD §9.1
  - Done when: at 390×844 the sheet peeks with tab names and Copy prompt, drags to 50% and 90%, closes with a swipe down or Esc, doesn't block the stage's gestures when peeking, traps focus when expanded.

- [ ] **2.7 Fidget mode** · PRD §9.7
  - Done when: Just play hides UI and enters fullscreen where supported; drags start immediately (no press-and-hold); Esc, the exit button, and `F` work; focus returns to the Just play button.

- [x] **2.8 Builder core** · PRD §10.1, §10.2, §10.3, §10.5
  - **Owner first:** answer open question 1 in `docs/DECISIONS.md` (the word "peak" in prompts).
  - Do: `src/prompt/builder.ts` and `blocks.ts`: assemble the Detailed prompt from scene meta, theme, params (phrases), target block, rules, experience block. Pure function, no DOM.
  - Done when: snapshot tests for every built scene × 3 targets × 2 experience levels at defaults; the output never contains repository paths or internal param ids, and follows the owner's answer on "peak" (test).

- [x] **2.9 Quick prompt** · PRD §10.6
  - **Owner first:** answer open question 3 (Quick prompt length).
  - Done when: snapshots for every built scene; Quick prompts meet the agreed word limit (test); only `key: true` params appear.

- [ ] **2.10 Phrase coverage** · PRD §10.4
  - Done when: a test changes each param of each built scene to a non-default value and asserts the prompt text changed and contains the new value; phrases read as plain sentences (no ids, no `undefined`, no `NaN`). This also completes item 6 of the scene definition of done for the six Wave 1 ports.

- [ ] **2.11 Cycle worlds in prompts** · PRD §6.7 (item 5), §10.2
  - Done when: with Cycle worlds on, the Detailed prompt lists all four palettes with their hex values plus the crossfade and contrast lines, and the Quick prompt adds its one line; snapshot tests cover it; with Cycle off, prompts are byte-identical to before.

- [ ] **2.12 Prompt tab UI** · PRD §9.3
  - Do: live prompt block with word count, the three option controls, Copy prompt (Clipboard API with a fallback for older Safari), toast + live-region announcement, Download as PROMPT.md, Next steps follow-ups with copy buttons, Did it work? buttons wired to `track` (§20).
  - Done when: e2e: changing a slider updates the prompt within 100ms; Copy puts the exact visible text on the clipboard; download produces a `.md` file with the same text.

- [ ] **2.13 Prompt test log** · PRD §10.8
  - Do: Create `docs/PROMPT_TESTS.md` with a table: scene, date, prompt options, result (pass/fail), what was wrong, fix made. One row per scene for all 50, marked "pending".
  - Done when: the file exists with 50 rows.

- [ ] **Wave 2 wrap-up:** run the wrap-up routine at the top of this file. Prompt tests for this wave's scenes. This wave's prompt tests cover the six Wave 1 scenes (they get prompts in this wave). Things for the owner to try: open a scene page on your phone, tweak it, try Shuffle world and Cycle worlds, and share the link with yourself. If prompts are failing, fixing them matters more than any later wave.

---

## Wave 3: Shared kits, then text scenes 4–13

- [ ] **3.1 Easing library** · PRD §16.8
- [ ] **3.2 Text kit** · PRD §16.8
- [ ] **3.3 Physics kit** · PRD §16.8
- [ ] **3.4 Field kit** · PRD §16.8
- [ ] **3.5 Render kit** · PRD §16.8
  - Done when (each kit): unit tests for its math and the micro-benchmark spot check in §16.8 pass; no DOM access except the text kit's offscreen canvas.
- [ ] **3.6 Move the ported scenes onto the kits**
  - Do: where it removes duplicated code, switch the six Wave 1 scenes to the kits, without changing how they look or feel.
  - Done when: still frames before and after match closely (visual diff), snapshot tests unchanged, `npm run check` and `npm run test:e2e` pass.

Use `/new-scene` for each scene below. Done when: the scene definition of done at the top of this file.

- [ ] **3.7 `scramble`** · SCENES.md #4
- [ ] **3.8 `marbles`** · SCENES.md #5 (featured on the home page)
- [ ] **3.9 `skid`** · SCENES.md #6
- [ ] **3.10 `melt`** · SCENES.md #7
- [ ] **3.11 `tumble`** · SCENES.md #8
- [ ] **3.12 `fridge`** · SCENES.md #9
- [ ] **3.13 `typewriter`** · SCENES.md #10
- [ ] **3.14 `splitflap`** · SCENES.md #11
- [ ] **3.15 `kinetic`** · SCENES.md #12
- [ ] **3.16 `shatter`** · SCENES.md #13

- [ ] **Wave 3 wrap-up:** run the wrap-up routine at the top of this file. Prompt tests for this wave's scenes. Things for the owner to try: play with each new text scene on desktop and phone (`/dev/scenes` and its scene page); run the prompt test for at least two of them.

---

## Wave 4: Text scenes 14–20

- [ ] **4.1 `flag`** · SCENES.md #14
- [ ] **4.2 `extrude`** · SCENES.md #15
- [ ] **4.3 `echo`** · SCENES.md #16
- [ ] **4.4 `sand`** · SCENES.md #17
- [ ] **4.5 `neon`** · SCENES.md #18 (⚠ flash test; featured)
- [ ] **4.6 `rubber`** · SCENES.md #19
- [ ] **4.7 `fire`** · SCENES.md #20 (⚠ flash test)

- [ ] **Wave 4 wrap-up:** run the wrap-up routine at the top of this file. Prompt tests for this wave's scenes. Things for the owner to try: play with each new scene on desktop and phone; check that `neon` and `fire` never feel strobe-like; run at least two prompt tests.

---

## Wave 5: Particles and physics 24–34

- [ ] **5.1 `confetti`** · SCENES.md #24 (build the burst as a reusable module; `countdown` uses it)
- [ ] **5.2 `goo`** · SCENES.md #25
- [ ] **5.3 `drop`** · SCENES.md #26 (port from `reference/riso-demo.html`)
- [ ] **5.4 `pluck`** · SCENES.md #27 (port from `reference/riso-demo.html`)
- [ ] **5.5 `cloth`** · SCENES.md #28 (featured)
- [ ] **5.6 `fireworks`** · SCENES.md #29 (⚠ flash test; featured)
- [ ] **5.7 `blackhole`** · SCENES.md #30
- [ ] **5.8 `flock`** · SCENES.md #31 (featured)
- [ ] **5.9 `lightning`** · SCENES.md #32 (⚠ flash test; featured)
- [ ] **5.10 `smoke`** · SCENES.md #33
- [ ] **5.11 `filings`** · SCENES.md #34

- [ ] **Wave 5 wrap-up:** run the wrap-up routine at the top of this file. Prompt tests for this wave's scenes. Things for the owner to try: play with each new scene on desktop and phone, and scroll the home page again: four more featured slots now show their real scenes.

---

## Wave 6: Shapes and optical 35–44

- [ ] **6.1 `overprint`** · SCENES.md #35 (port from `reference/riso-demo.html`)
- [ ] **6.2 `halftone`** · SCENES.md #36 (port from `reference/riso-demo.html`)
- [ ] **6.3 `tilt`** · SCENES.md #37 (motion permission only after a tap; graceful fallback when denied)
- [ ] **6.4 `kaleido`** · SCENES.md #38
- [ ] **6.5 `morph`** · SCENES.md #39
- [ ] **6.6 `moire`** · SCENES.md #40 (⚠ flash test)
- [ ] **6.7 `tunnel`** · SCENES.md #41 (⚠ flash test)
- [ ] **6.8 `lava`** · SCENES.md #42 (featured)
- [ ] **6.9 `fold`** · SCENES.md #43 (inner scroller on scene pages, like `velocity`)
- [ ] **6.10 `glitch`** · SCENES.md #44 (⚠ flash test; featured)

- [ ] **Wave 6 wrap-up:** run the wrap-up routine at the top of this file. Prompt tests for this wave's scenes. Things for the owner to try: play with each new scene; scroll the home page: every featured slot should now show its real scene.

---

## Wave 7: Interface and micro-interactions 45–50

- [ ] **7.1 `magnetic`** · SCENES.md #45
- [ ] **7.2 `countdown`** · SCENES.md #46 (**Owner first:** answer open question 2 on its default date; live region once per minute; handles past dates by showing "It's time"; reuses the confetti burst)
- [ ] **7.3 `trail`** · SCENES.md #47
- [ ] **7.4 `curtain`** · SCENES.md #48
- [ ] **7.5 `jelly`** · SCENES.md #49
- [ ] **7.6 `loaders`** · SCENES.md #50

- [ ] **Wave 7 wrap-up:** run the wrap-up routine at the top of this file. Prompt tests for this wave's scenes. Things for the owner to try: play with each new scene on desktop and phone. All 50 scenes now exist.

---

## Wave 8: Gallery, Tour, guides, word bank, drops, About

- [ ] **8.1 Gallery grid and previews** · PRD §13, §6.7 (item 6)
  - Done when: all 50 scenes appear as live previews in `quality: 'preview'`, each tile in its own world (a patchwork); at most 4 animate at once (debug counter); off-screen tiles show still frames.
- [ ] **8.2 Gallery filters and sort** · PRD §13
  - Done when: tag filters and sort work, state is in the URL, the empty state (if any filter yields nothing) says what to do next.
- [ ] **8.3 Tour page** · PRD §6.7 (item 2)
  - Do: `/tour`: all 50 scenes full-screen in catalog order, colors blending between every one (reuse `journey.ts`), caption and "Tweak it and get the prompt" per scene, an "N of 50" counter. Mount within one screen, destroy beyond two.
  - Done when: e2e: `--ground` changes between every pair of neighbors; never more than 2 scenes running (scheduler debug count); memory stays flat scrolling end to end (no growth in mounted scene count); zero console errors.
- [ ] **8.4 Tour Shuffle and Autoplay** · PRD §6.7 (item 2)
  - Done when: Shuffle order reorders scenes and worlds and round-trips through the URL; Reset order restores catalog order; Autoplay advances every 12 seconds and stops on pointer down, wheel, touch or any key (e2e); under reduced motion it jumps instead of scrolling smoothly.
- [ ] **8.5 Home: latest drop and final check**
  - Done when: the home page shows the latest drop row; no stand-ins remain (test fails if any featured slot isn't its own scene).

**Facts rule (PRD §11):** before writing anything about Claude Code, Netlify, GitHub Pages, or browser menus, look it up in the official documentation, link the exact pages in the guide's Sources, and set `lastChecked` to today. Keep wording general where details may change. If you can't verify something, leave a visible `[OWNER: verify …]` note instead of guessing.

- [ ] **8.6 Guide layout and content collection** · PRD §16.6
  - Done when: `Guide.astro` renders MDX with a readable 68ch column, a table of contents for long guides, Sources and Last checked at the bottom, copyable message blocks (a small component with a Copy button).
- [ ] **8.7 Start here** · PRD §11.1
- [ ] **8.8 Fix it** · PRD §11.2 (every symptom has a copyable "what to tell Claude Code" message)
- [ ] **8.9 Put it online** · PRD §11.3
  - Done when (each guide): all sections from the PRD present; every external fact has a source link; Lighthouse content-page budgets met (§19).
- [ ] **8.10 Words content and page** · PRD §12
  - Done when: 24 terms with definition, say-it sentence, seen-in links; search filters as you type; A–Z anchors; deep links like `/words#damping` scroll to and highlight the term. If the 50 scenes need terms the list lacks (for example noise or metaball), propose them to the owner before adding.
- [ ] **8.11 Mini demos**
  - Done when: each term has a mini demo using the engine and scheduler, paused until on screen, still frame under reduced motion; the page stays within the content-page performance budget (only visible demos run).
- [ ] **8.12 Link it up**
  - Done when: every scene's `terms` resolve to real words (validator test); scene info popovers and How it works chips link to the right anchors.
- [ ] **8.13 Drops** · PRD §14
  - Done when: `/drops`, `/drops/[slug]`, `/rss.xml` work; the home page shows the latest drop; one launch drop exists.
- [ ] **8.14 About** · PRD §15
  - Do: ask the owner in one message for their name, a one-line bio, what they're looking for (internships, freelance, collaborators), a contact link, and social links. Keep working on other steps while waiting. Build the page with the `tilt` card; use their answers, or clearly marked placeholders if they haven't answered yet (list them in `docs/DECISIONS.md`).
  - Done when: the page uses the `tilt` card with the owner's name (or a marked placeholder); nothing invented.
- [ ] **8.15 404**
  - Done when: a small playful animation (reuse a scene in preview quality) and links to Home, Gallery, Start here.

- [ ] **Wave 8 wrap-up:** run the wrap-up routine at the top of this file. Prompt tests for this wave's scenes. Things for the owner to try: browse the gallery and the Tour (try Shuffle and Autoplay) on laptop and phone. Read all three guides as if you'd never used Claude Code and note anything confusing.

---

## Wave 9: Polish, performance, accessibility, launch, friend test

- [ ] **9.1 Sound** · PRD §9.8
  - Done when: the header toggle works and is remembered; each scene's hooks play synthesized sounds only after a user gesture; nothing plays when off.
- [ ] **9.2 Accessibility pass** · PRD §17, §8.2
  - Do: keyboard-only walkthrough of every page; screen-reader labels; contrast across all 16 worlds and blends; a flash audit of every ⚠ scene at maximum params; an automated a11y check in e2e on every route (images/controls have accessible names, headings in order, no duplicate ids, focus visible).
  - Done when: all checks pass; findings and fixes logged in `docs/DECISIONS.md`.
- [ ] **9.3 Performance pass** · PRD §19
  - Done when: scene chunks load only where used; per-frame scripting within budget at defaults for all 50 scenes; Tour and gallery running counts within limits on a phone.
- [ ] **9.4 SEO and share images** · PRD §22
  - Done when: titles, descriptions, canonical URLs and the sitemap use the live address; OG images exist for all 50 scenes, the home page and a generic fallback, generated by a script and committed.
- [ ] **9.5 Copy review** · PRD §18 (copy voice)
  - Done when: every page's copy is plain, sentence case, and consistent (button names match their toasts); no lorem ipsum; all owner placeholders listed in `docs/DECISIONS.md`.
- [ ] **9.6 Friend test kit**
  - Do: Create `docs/TESTING_WITH_FRIENDS.md`: a 60–90 minute session script for someone who has never used Claude Code. Tasks: 1) "Find an animation you'd use for something real in your life." 2) "Make it yours with the sliders." 3) "Get it running on your computer with Claude Code." 4) "Put it online and send me the link." What the owner should do (stay quiet, don't help unless they're stuck for 3+ minutes), what to note (every pause, question, and error), and a notes template per tester. Plus a 5-question follow-up survey.
  - Done when: the file exists and is linked from `README.md`.
- [ ] **9.7 Launch: open the site to search engines**
  - Do: remove the `noindex` tag and the disallow rule (robots.txt now allows all and points to the sitemap).
  - Done when: e2e confirms no `noindex` anywhere and the sitemap and canonical URLs use the live address.
- [ ] **9.8 Launch: share previews and Lighthouse**
  - Done when: a link preview of the live home page and one scene page shows the OG image; Lighthouse scores for home, one scene page, gallery, tour, and a guide are recorded in `docs/DECISIONS.md`, and anything below the PRD §19 budgets is fixed.
- [ ] **9.9 Launch: final deploy and checks**
  - Done when: pushed, deployed, the full e2e suite passes against the live site (`npm run test:live:full`), open questions are answered or explicitly deferred, the launch drop is published, and the owner has the final report (live link, what's done, prompt tests that didn't pass, placeholders left, anything else they need to do).

- [ ] **Checkpoint 9 (Owner):** run the friend test with 3–5 people. Turn every place someone got stuck into a new step at the bottom of this file, under "What testers taught us".

---

## What testers taught us

(Empty for now. Add steps here after the friend tests.)
