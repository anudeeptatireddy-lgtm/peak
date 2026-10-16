# Decisions log

Record owner answers, trade-offs, and deviations from the PRD here, newest first. Format: date, decision, why.

## Open questions (PRD §25)
1. Host (Vercel, Netlify, or GitHub Pages): pending
2. Analytics on or off, and which provider: pending
3. Feedback form URL for "It didn't work": pending
4. About page details (PRD §15): pending
5. Domain name: pending

## Waiting on the owner
From the kit review (2026-10-16), renumbered to the v1.1 waves:
1. Prompts must never contain "peak" (PLAN 2.8), but `particles` defaults to the word "peak". Needed by step 2.8 (Wave 2).
2. `countdown` defaults to "7 days from page load", which breaks byte-identical prompts and snapshots (PRD §10.1). Needed by step 7.2 (Wave 7).
3. Quick prompts must be under 150 words (PRD §10.6), but the "Add to my existing project" block alone is about 60 words. Needed by step 2.9 (Wave 2).
4. ~~Some `particles` and `flow` defaults differ from the prototype.~~ Resolved in step 1.8 without changing either: see the log entry for step 1.8.

From the v1.1 scope update (2026-10-16):
5. The proposed home order and featured lineup (PRD §6.1). Needed by step 1.16 (Wave 1); easy to change later in `journey.ts`.

## Log

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
