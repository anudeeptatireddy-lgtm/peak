# Decisions log

Record owner answers, trade-offs, and deviations from the PRD here, newest first. Format: date, decision, why.

## Open questions (PRD §25), answered by the owner on 2026-10-16
1. Host: **Vercel**, with the code on GitHub. Every push to `main` deploys.
2. Analytics: **Vercel Web Analytics** for page views, set up as Vercel's docs describe for a static Astro site. Custom events (PRD §20) only if they are free on the Hobby plan; otherwise `track()` stays a no-op. No cookies, no personal data.
3. Feedback form: **none yet**. `PUBLIC_FEEDBACK_URL` stays empty; "It didn't" shows "Thanks, noted" and a link to `/fix`.
4. About page details: the owner will provide them when asked at the About step (PLAN 8.14); placeholders until then.
5. Domain: **none for now**; the free `vercel.app` address. `PUBLIC_SITE_URL` is set to it once it exists.

## Waiting on the owner
- About page details (name, one-line bio, what you're looking for, contact link, social links): asked at PLAN 8.14.

## Earlier questions (all settled)
1. Prompts must never contain "peak", but `particles` defaults to the word "peak". The owner delegated the remaining calls; decided in step 2.8 (see log).
2. `countdown`'s default date breaks byte-identical prompts. Decided in step 7.2 (see log).
3. Quick prompts under 150 words vs the long "existing project" block. Decided in step 2.9 (see log).
4. Particle and flow defaults vs the prototype: resolved in step 1.8, approved by the owner.
5. Home order and featured lineup: **approved by the owner** on 2026-10-16.

## Log

**2026-10-17, prompt builder (steps 2.8–2.9, done early for the hero work) and the sharper point of peak.**
- Earlier question 1 decided: the rule "prompts never contain peak" means a prompt never refers to this site or repository. The visitor's own text is quoted as given, even if it is the word "peak" (the `particles` default). The test swaps every text param for another word and then checks that "peak" appears nowhere.
- Earlier question 3 decided: Quick prompts list key params plus anything the visitor changed as short "Label: value" lines, with a one-line target, so every Quick prompt stays under 150 words for all three targets (tested).
- Detailed prompts state every value exactly once: params whose value is already part of another param's sentence set `phraseIn` (a small addition to the PRD §16.3 param type) and get no line of their own. Particles' Detailed prompt went from about 1,240 words to about 1,040.
- Part 2 (owner, 2026-10-16): every number in the six built scenes is now a param (with an Advanced group) or a `FIXED` constant with a written reason; `tests/unit/constants.test.ts` fails on any other number in scene code. `ScrollVelocity` takes its tuning from `velocity`'s params. PRD §0, §8.5, §8.6, §9.2, §10.4, §10.6 and §16.3 and SCENES.md were updated; the home headline is now "Don't describe it. Tweak it, copy it, build it."
- Particles' new dots (first build or extra dots after a resize) always swarm in when the intro is on, exactly like the prototype.

**2026-10-17, parity for the other five ported scenes.** `tests/e2e/parity.spec.ts` now runs a scripted scenario per scene against the prototype at 1280×800 and 390×844 (2% bar), all passing three runs in a row:
- `elastic` (idle wave, hover) and `velocity` (start, 2s drift): matched without code changes once both pages step frames in lockstep (one long fast-forward of the fake clock delivered frames slightly differently to the two pages).
- `warp` (cruise, warp, slowing): fixed. The prototype re-seeds its stars on every resize, including the one when the font arrives; ours only rebuilt when the size changed. It now rebuilds on every resize. The magnetic button is hidden in both pages during the comparison: ours sits centered in the stage, the prototype's sits in its caption (a deliberate layout difference, because on the home page the caption belongs to the page).
- `ripple` (automatic rings, cursor, click): fixed. A click ring now starts at the previous frame's time, as the prototype's does, and the grid rebuilds on every resize like the prototype's. Found a prototype race: on a phone its first animation frame can run before its canvas is sized, so its first automatic ring starts at the top-left corner of a 1×1 canvas. Ours sizes first and does not copy that; the test compares after that first ring has expired.
- `flow` (trails, stir): fixed. Restored the prototype's way of fading trails (painting the ground color over them, which leaves faint gray ghost trails), replacing the transparent fade from step 1.12. The canvas is repainted only when the ground color changes (a world change or journey blend), as the prototype's `onTheme` did; living colors don't touch the ground, so they never wipe trails. Particles age by one per frame, as in the prototype, and the field rebuilds on every resize. Because a flow field never settles, one extra loading frame on either page would show forever, so the live field is compared by where its ink sits (a 24×16 grid, average difference under 2% per cell) rather than pixel by pixel. The prototype's reduced-motion still frame for flow is blank; ours draws the 70 steps SCENES #22 asks for.

**2026-10-17, hero parity fixed.** `particles` now waits for Anybody before sampling (exactly like the prototype), builds again whenever it's resized, takes clicks on release, lets a finger push dots, caps phones at exactly 1,700 dots, and draws springs as 0.02 + random × 0.035. Every number in the scene is now a param (Advanced group for the less important ones) whose default is the prototype's constant. Result of `tests/e2e/parity.spec.ts` (Chromium, seeded random, paused fake clock): **fewer than 0.01% of pixels differ** at both 1280×800 and 390×844 for the swarm-in at 0.5s, the settled word, the cursor hole and the click blast (permanent bar: 2%). Test-harness lessons, kept in the file: Playwright's fake clock keeps running in real time unless paused (`pauseAt`), only drives `requestAnimationFrame` in Chromium (so both sizes run in Chromium with phone emulation), and `goto()` waits for web fonts unless told to stop at `domcontentloaded`. The pointer helper now records taps on `click` for every scene (the prototype's `ripple` also used `click`).

**2026-10-16, hero parity audit (owner request), before any fix.** A new Playwright parity test (`tests/e2e/parity.spec.ts`) renders `reference/peak-prototype.html` (only its particles section, header and caption hidden) and our `particles` scene on `/dev/parity` side by side: 1280×800 and 390×844, the same mulberry32-seeded `Math.random`, Riso light, living colors off, Anybody held back 0.7s so both pages must wait for it, and Playwright's fake clock so both step identical frames. First run, settled frame: **7% of pixels differ at 1280×800, 3% at 390×844** (images in `docs/parity/before/`). Every difference found, checked against the owner's list:
1. **Font (the visible bug).** Our scene sampled the word as soon as the stage had a size, which on a slow connection is before Anybody arrives, so it drew a fallback font. When the font arrived, the mount helper called `resize()` again, but the scene only rebuilt when the size changed, so the fallback letters stayed for good. The prototype draws nothing until the font is ready (or 2.5s pass) and then samples. On the live site this depends on network speed, which is why it looked fine on a fast connection and wrong on the owner's.
2. `fontStretch = 'expanded'`: set again after every font change in both. Same.
3. Size `min(H×0.46, W×0.42)`, fit to 82% of the width (92% under 700px): same.
4. Vertical position 43% (40% under 700px): same.
5. Sampling: gap starts at `max(3, round(size/80))`, alpha threshold 140, gap grows until the dots fit, capped at 14: same. **Dot cap under 700px differs: ours was 3,800 × 0.45 = 1,710, the prototype's is 1,700.** That came from reading the settings as scales, and it can change the chosen grid gap.
6. Dots: round, radius gap × (0.32 + random × 0.22), one random ink each, theme blend mode: same.
7. Springs: the prototype draws 0.02 + random × 0.035; ours drew 0.0375 × (0.5333 + random × 0.9333). Equal to about 5 decimal places, but not exactly. Also from the scales reading.
8. Damping 0.86 per frame (frame factor `f`): same.
9. Cursor reach `clamp(W×0.16, 70, 150)` and push `(1 − d/R)² × 9`: same.
10. **Touch push differs:** ours ignored touch for the cursor push; the prototype pushes dots while a finger is down (until the browser takes over for scrolling).
11. **Click blast trigger differs:** ours fired on `pointerdown`, the prototype on `click`. Ours could explode when a phone visitor merely started a scroll on the hero, and fired before release. The blast formula and its random-number order are the same.
12. Intro: random positions and velocities of ±6 in both. **Ours skipped the scatter under reduced motion**, which consumes the random numbers differently (the still frame snaps to the word either way).
13. Device pixel ratio capped at 2, canvas filling its section, sampling in CSS pixels: same.
14. Section height: home sections are min 560px tall vs the prototype's 540px; the same at both test sizes (only differs on screens shorter than 560px).
15. Header and captions: neither covers the word at either size; the home page's world rail sits at the far right edge, clear of the "k".
16. Colors: the home hero is in Dreamhouse (by design, PRD §6.1); the parity test uses the prototype's Riso light.

**2026-10-16, steps D.1–D.4: GitHub, Vercel, analytics.**
- GitHub: public repo https://github.com/anudeeptatireddy-lgtm/peak (created with the logged-in `gh` CLI).
- Vercel: project `peak` under the `qwertyuiop20` scope, created with the logged-in Vercel CLI (`vercel link`), which also connected the GitHub repo so every push to `main` deploys. Live address: **https://peak-teal.vercel.app**. Per Vercel's docs (vercel.com/docs/frameworks/frontend/astro, checked 2026-10-16), a static Astro site deploys with zero configuration; `vercel.json` still pins the framework, `astro build` and `dist` so the settings live in the repo. `engines.node` is `22.x` to match local Node 22. `PUBLIC_SITE_URL` is set for Production.
- The Vercel CLI wrote a `.env.local` with a short-lived OIDC token; it is git-ignored (`.env.*`). `.vercel/` is ignored too.
- Analytics: `@vercel/analytics` 2.0.1 (the newest release at least two weeks old; owner-approved) with its `<Analytics />` Astro component in `Base.astro`, as vercel.com/docs/analytics/quickstart describes. It renders only when building on Vercel (`VERCEL=1`), so local previews and tests never load it. Web Analytics also has to be switched on once in the Vercel dashboard (owner action). Custom events: Vercel's pricing page (vercel.com/docs/analytics/limits-and-pricing, checked 2026-10-16) lists Custom Events as not available on Hobby, so `track()` stays a no-op.
- Live smoke tests: `npm run test:live` (pages, noindex, home journey against `PEAK_LIVE_URL`, default https://peak-teal.vercel.app); `npm run test:live:full` runs everything. Page tests ignore errors from Vercel's own `/_vercel/` analytics requests.

**2026-10-16, owner answers after Wave 1.** Approved: the Wave 1 checkpoint, the home order, the stand-ins, reading particle settings as scales on the prototype's numbers, the accent text color on the third marquee row, the new trail fading in `flow`, and committing straight to `main`. New instructions: deploy to GitHub + Vercel before Wave 2; continue through Waves 2–9 without waiting at checkpoints (only logins, About details and anything that costs money need the owner); at the end of each wave run the full suite, push, wait for the deploy, smoke-test the live site and send a short update; run the PRD §10.8 prompt tests with fresh subagents in empty folders outside the repo; keep the site `noindex` with a disallow-all `robots.txt` until launch. PLAN.md was updated to match: a deploy phase before Wave 2, wave wrap-up boxes instead of owner checkpoints, and the launch steps at the end of Wave 9.

**2026-10-16, step 1.16: home journey.** The home page follows the proposed v1.1 order (open question 5 still waits for the owner's OK; the order lives in `HOME_JOURNEY` in `src/theme/journey.ts`). Eight featured scenes don't exist yet, so their slots show stand-ins in the slot's world (rotating `flow`, `warp`, `ripple`, `particles`), each labeled "Stand-in until … arrives in wave N"; the rail always uses the featured scene's name. The home page caps running scenes at 2 (`setMaxActive(2)`), because the 80px visibility margin can otherwise let three aligned sections run at once. `elastic` and `velocity` sections have no bottom scrim, as in the prototype. Scenes mount when they come within one screen of the viewport. A basic `/scenes/<slug>` page shows each built scene full-screen in its world so the "Tweak it and get the prompt" buttons work before Wave 2 adds the playground. The How it works illustrations are CSS loops that pause with motion and stop under reduced motion.

**2026-10-16, step 1.15: living colors.** `src/theme/living.ts` installs a transform in the theme store that rotates c1–c3 in OKLCH (±12°, 30-second loop). It ticks with a 50ms `setInterval` (20 times a second) rather than `requestAnimationFrame`, so the page keeps exactly one rAF loop and colors still drift on pages without scenes. The drift clock only advances while it runs, so pausing freezes the colors where they are. Near-gray accents (Newsprint's black and gray) have no hue to rotate and stay put.

**2026-10-16, steps 1.11–1.13: `ripple`, `flow`, `warp`.** `ripple` uses scene time instead of the prototype's wall clock, so pausing freezes rings in place. `flow` fades its trails with `destination-out` on a transparent canvas instead of painting the ground color over them; the look is the same, but home-page color blends no longer wipe the trails every frame (risk 11 from the kit review). Faint 1–2% residue can remain where many trails crossed; to revisit in the Wave 9 performance and polish pass if it shows. Stirring needs a press-and-hold on touch (PRD §8.3). `warp` creates its own magnetic button inside the stage (centered, 64% down) so the scene is self-contained; the cursor pull is mouse-only.

**2026-10-16, steps 1.9–1.10: `elastic` and `velocity`.** Both are DOM scenes styled inline so they carry no global CSS. Row 3 of `velocity` uses `--accent-text` instead of the prototype's raw `--c1`, because PRD §7 says accent-colored text must use the contrast-checked token. When its host has `data-inner-scroll="true"` (scene pages and `/dev/scenes`), `velocity` adds an invisible, endless scroll area over the stage (three screens tall, quietly recentered) and reads velocity from it; otherwise it reads the window. Its still frame has no lean, as PRD SCENES #3 says.

**2026-10-16, step 1.8: `particles`.** Open question 4 resolved by reading the PRD's particle settings as scales on the prototype's own formulas, so the defaults reproduce the prototype exactly: snap-back strength is the center of each dot's random stiffness (default 0.0375, randomized ±47% = the prototype's 0.02–0.055); cursor reach is the maximum (the prototype's 16% of screen width, clamped to 70–150px); click blast is the strongest kick (the prototype's 14–40 range = 35–100% of 40); dot size multiplies the prototype's 0.32–0.54 × spacing; density uses 45% under 700px (the prototype's 1700 ≈ 3800 × 0.45). The same approach will keep `flow` at the prototype's 500-particle floor. Touch drags don't push dots (PRD: "drag does nothing"). `/dev/scenes` shows any scene with a raw params panel, and `tests/e2e/scenes.spec.ts` runs the browser checks from the scene definition of done for every registered scene (console errors, still frame under reduced motion, `touch-action: pan-y`, and listener counts after 20 remounts via the Chrome DevTools Protocol).

**2026-10-16, step 1.7: scene types and registry.** `src/scenes/types.ts` follows PRD §16.3 exactly (plus a `SoundHooks` interface it references). The registry uses Vite's lazy `import.meta.glob` over `src/scenes/*/index.ts`, so adding a scene folder registers it and each scene stays its own chunk. The validator checks schemas, phrases (no `undefined`/`NaN`, no internal ids), terms and 3–5 follow-ups. Flash rate caps (PLAN 1.7) are checked by each ⚠ scene's flash test instead of the generic validator, since rate params differ per scene. `src/engine/mount.ts` wires a scene to the scheduler, theme store, ResizeObserver and font loading, and undoes all of it in `destroy()`.

**2026-10-16, step 1.6: engine.** One rAF loop in `src/engine/scheduler.ts`; frames where no time has passed are skipped (the bug that hid the first scene in the riso demo). The loop stops whenever nothing visible is running. Scroll sources are only ticked while some scene runs. `setMaxActive(n)` caps running scenes (gallery 4, Tour 2) by visibility. The ResizeObserver lives in the scene mount helper (step 1.7) rather than the canvas helper, so one observer drives `resize()` for canvas and DOM scenes alike. Touch drags that need free movement start after a 250ms press-and-hold; once started, the page stops scrolling under the finger. The dev servers (`astro dev`, `astro preview`) move themselves into the background when an AI agent runs them; `npx astro dev stop` stops a backgrounded one.

**2026-10-16, step 1.2: worlds as data.** All 16 worlds live in `src/theme/worlds.ts`; Riso's dark palette is a second variant of the same world (`getWorld('riso', 'dark')`), so `WorldId` stays as in PRD §16.5. The internal "inspired by" notes avoid brand names too (Dreamhouse's says "Pink plastic dollhouse"). `accentText` and `focus` are both c1 pushed to 3:1 on the ground.

**2026-10-16, step 0.3 and Checkpoint 0.**
- Playwright runs against `astro preview` on port 4329 with two projects: `desktop` (Chromium, 1280×800) and `mobile` (WebKit, iPhone 13 profile at 390×844, touch). Chromium and WebKit were installed with `npx playwright install chromium webkit`.
- Astro 7's preview server moves itself into the background when it detects an AI agent, which made Playwright think it had crashed. The test server command adds `--ignore-lock`, which keeps it in the foreground.
- `test` is back to plain `vitest run` now that a unit test exists.
- Checkpoint 0 ticked: the owner said "Keep going. Don't stop" after reviewing the v1.1 docs, and the dev server was confirmed to serve the page in step 0.1.

**2026-10-16, step 0.2: repo hygiene.** Git repository created on branch `main`. No global git identity was set on this Mac, so the repo-local identity uses the owner's name and school email. `.gitignore` also keeps `.env*` files out of git (except `.env.example`).

**2026-10-16, scope update to PRD v1.1 (owner message).** peak now launches with 50 scenes (about 20 text effects), 16 color worlds, always-changing color (home journey of 12, a Tour page, living colors, Shuffle and Cycle worlds on scene pages, cycling in prompts, a patchwork gallery) and shared kits. The owner's message wins over the v1.0 PRD; these v1.0 rules changed:
- 12 scenes → 50, now specified in `docs/SCENES.md`. PRD §8 keeps only the rules for all scenes; the definition of done moved from §8.13 to §8.4 (references in `CLAUDE.md` and `/new-scene` updated).
- 8 worlds → 16 (§7, §16.5 `WorldId`); the world picker shows 16 swatches.
- The home page features 12 scenes instead of 6, in a new order (§6.1).
- The contrast guardrail now covers every pair of worlds, not just the home order, because the Tour can put any two side by side (§6.3).
- Loading screens, cursor trails, liquid text and page transitions moved from the backlog into v1.1 (§24).
- `localStorage` may also hold the Living colors setting (§16.7).
- PLAN.md was rewritten around 9 waves; step 0.1 stays done. Checkpoints are now checkboxes, ticked only after the owner's OK.
- Correction from the owner: the standalone artifact published earlier is not the final design. The deliverable is this Astro project; `CLAUDE.md` now says never to publish a standalone demo as the final site.

Choices made while writing v1.1 (the owner can override any of them):
- Home order and lineup (§6.1): Dreamhouse `particles`, Spice Dunes `elastic`, Doomsday `velocity`, Lava Lamp `lava`, Cherry Cola `marbles`, Toxic `lightning`, Aurora `flock`, Abyss `ripple`, Blueprint `cloth`, Neon Arcade `neon`, Vapor Mall `glitch`, Golden Hour `fireworks`, then Matcha for How it works. Only two light↔dark crossings, down from six. Until a featured scene exists, its slot shows a built scene in that slot's world.
- Default worlds for new scenes: three per world (four for Glacier and Neon Arcade), chosen to fit each scene, so the gallery is a patchwork.
- The four riso-demo scenes are ported from `reference/riso-demo.html` (added to the repo, read-only) with its constants as defaults. `overprint` and `halftone` default to Riso, `pluck` to Aurora, `drop` to Cherry Cola.
- Tour is in the header nav. Its Shuffle order lives in the URL; Autoplay is off on load.
- Living colors starts paused under reduced motion (it's autonomous motion) and is remembered in `localStorage`.
- Cycle worlds loops through four worlds (the current one plus three random), stored in the URL as `cycle=…`, with a 1.5-second crossfade, so shared links and prompts reproduce it.
- Flash rule details (§8.2): no single brightness change over a quarter of the stage; flicker stays off under reduced motion even after Play; the rule also covers `fire`, `moire` and `tunnel`; each ⚠ scene gets an automated flash test.
- Touch (§8.3): drags that need free movement start after a ~250ms press-and-hold so swipes still scroll; Just play mode drops that delay.
- The 10 Spicy scenes are exactly the ones the owner marked.

**2026-10-16, step 0.1: project scaffold.**
- Wrote the Astro setup by hand (package.json, astro.config.mjs, tsconfig.json) instead of running the create-astro template, so nothing in `CLAUDE.md`, `.claude/`, `docs/` or `reference/` could be overwritten.
- Pinned versions: the newest stable release of each package published on or before 2026-10-02 (two weeks before setup). astro 7.3.5, @astrojs/mdx 8.0.2, @astrojs/sitemap 3.7.4, @astrojs/rss 4.0.19, vitest 5.0.3, @playwright/test 1.63.0, prettier 3.9.9, prettier-plugin-astro 1.1.0, @astrojs/check 0.9.10. `.npmrc` sets `save-exact=true` so future installs stay pinned.
- TypeScript is 6.0.3, not 7.0.2: @astrojs/check only supports TypeScript 5 and 6.
- Added @astrojs/check (owner approved): `astro check` in the `check` script needs it. Added to the allowlist in `CLAUDE.md`.
- npm 10.9.9 crashed ("Cannot read properties of null (reading 'edgesOut')") while resolving Vitest's peer dependency on Vite. Vitest was installed once with `--legacy-peer-deps`; it uses the Vite that Astro already installs. Plain `npm install` and `npm ci` both work afterwards with the lockfile.
- `test` runs `vitest run --passWithNoTests` until step 0.3 adds the first test; Vitest only looks in `tests/unit/` so it never picks up Playwright specs.
- Prettier skips `CLAUDE.md`, `docs/`, `reference/` and `.claude/` so owner-provided files keep their formatting.
- The sitemap is skipped (with a build warning) until `PUBLIC_SITE_URL` is set.
- Empty folders from PRD §16.2 hold a `.gitkeep` so they survive in git.
- Not committed: there is no git repository yet. Step 0.2 creates it and makes the first commit.
