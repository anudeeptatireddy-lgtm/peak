# Handoff: 2026-10-17

Work stopped at a clean point because the owner is switching Claude accounts. Everything below is committed in "handoff: save state" and pushed to `main`. Pushing deploys to Vercel. The pushed code is tested, but the live smoke run for this deploy hasn't been done yet (see action 2).

## Exact step

**The Wave 5 wrap-up** (`docs/PLAN.md`, the "Wave 5 wrap-up" box, still unticked) is in progress. Wave 6 steps 6.1 and 6.2 are already done and ticked: they were built while the Wave 5 prompt-test agents ran.

Wrap-up routine progress for Wave 5:
1. Full suite: done. `npm run check` passes, with 616 unit tests. `npm run test:e2e` passes, apart from the expected prompt-test failures listed below. The one surprise was `drop`'s desktop prototype parity, an expected failure that passed; it is now a documented skip (see DECISIONS).
2. Push and wait for the deploy: the push happens with this handoff commit. Waiting for the deploy (`bash scripts/wait-for-deploy.sh`) is **not done**.
3. Live smoke tests (`npm run test:live`): **not done**.
4. Owner update: **not sent** (draft below).
5. Prompt tests: 2 of 5 compared (both pass); 3 still open, below.

## Finished

- **All 11 Wave 5 scenes** (5.1–5.11): `confetti`, `goo`, `drop`, `pluck`, `cloth`, `fireworks` (⚠ flash-tested), `blackhole`, `flock`, `lightning` (⚠ flash-tested), `smoke`, `filings`. Each has unit and e2e coverage and a DECISIONS entry.
- **Kit additions:** `Fluid` (in `src/kits/field.ts`) gained dye channels and `confine()` (vorticity), with tests and a benchmark.
- **Fix for a visible reset:** non-text Wave 5 scenes no longer rebuild when the web font arrives; they only rebuild on a real size change.
- **Prompt builder:** `SceneMeta.blends: false` makes a prompt say "no blending" (used by `goo`).
- **Wave 6:** 6.1 `overprint` and 6.2 `halftone`, ported from `reference/riso-demo.html`. Both pass prototype parity at both sizes.
- **Helper scripts** are now in the repo:
  - `scripts/prompt-tests/gen-prompts.ts` writes test prompts.
  - `scripts/prompt-tests/shoot.mjs` takes screenshots.

## Half-done

The three open Wave 5 prompt tests. The agents worked in a temporary folder outside the repo, which may disappear after a restart:
`/private/tmp/claude-501/-Users-madhutatireddy-Library-Application-Support-Claude-scratch-workspaces-d24ee8df-f595-46f4-981e-f3e5f0e02001-49c2241e-2397-48a8-8d3d-bbf9e92b0df8-scratch-2026-10-16-172c37/32a06c7d-27a0-4e58-bb58-05a842429dea/scratchpad/`

| Scene | State | Files in the repo | What's left |
|---|---|---|---|
| `cloth` | Agent **finished**; its page is final. | `docs/prompt-tests/cloth/PROMPT.md`, `draft-index.html` | Rename `draft-index.html` to `index.html`. Add `compare.json` that hides only the agent's title, hint and Play/Pause button (read the page to find their selectors). Run the comparison and log the result. |
| `smoke` | Agent **finished**; its page is final. | `docs/prompt-tests/smoke/PROMPT.md`, `draft-index.html` | Same as cloth. Watch for one likely difference: the agent also starts the idle plume when the pointer has sat still over the page for 1s, while ours only starts it once the pointer has left. If the comparison fails on that, tighten the plume phrase ("away" means not over the canvas), then retest once. |
| `goo` (retest) | Retest agent was **still running**. Run 1 failed only on blending; the fix is in. | `docs/prompt-tests/goo/PROMPT.md` (retest prompt), `compare.json`, `run1/` | If `scratchpad/ptest5b/goo/index.html` exists, copy it to `docs/prompt-tests/goo/index.html` and compare. Otherwise rerun with the saved prompt. This is goo's one allowed retest. |

**How to compare a page:**
```
npx playwright test tests/e2e/prompt-parity.spec.ts -g "cloth"
```
Scripted moments for all five scenes are already in `tests/e2e/scenarios.ts`. A scene is only compared once it has both `index.html` and `compare.json`.

**How to run a prompt test:**
- Copy the scene's `PROMPT.md` into a new empty folder outside the repo.
- Brief a fresh agent: "You are acting as a fresh Claude Code session… Your ONLY working folder is <path>… Read PROMPT.md and do what it asks."
- Rules for the agent: nothing outside that folder, no web, put the result in a single `index.html`.
- Rules for us: fix phrases or meta, never the test, then retest once.

## Tests

- **Unit:** 616 pass (`npx vitest run`). `npm run check` passes (types, Astro, Prettier).
- **E2E:** the full suite passed, except the expected prompt-parity failures below.
  - Run since then: Wave 5 and 6.1/6.2 scene and playground specs (pass), plus prototype parity for `overprint` and `halftone` (pass).
  - `drop` desktop parity is now a documented skip (it depends on timing).
- **Prompt parity, passing:** `particles`, `elastic`, `velocity`, `scramble`, `echo`, `neon`, `fire`, `ripple`, `lightning`, `blackhole`.
- **Prompt parity, failing after retest** (expected failures, fixes made, waiting on the owner): `flow`, `warp`, `marbles`, `skid`.
- **Not tested yet, by owner rule** (Spicy scenes plus one easy scene per wave), listed in `docs/PROMPT_TESTS.md`:
  - Wave 3: `melt`, `tumble`, `fridge`, `typewriter`, `splitflap`, `kinetic`, `shatter`.
  - Wave 4: `flag`, `extrude`, `sand`, `rubber`.
  - Wave 5: `confetti`, `fireworks`, `flock`, `filings`.
  - `drop` and `pluck` are covered by prototype parity instead.

## Known bugs and loose ends

- **Font-load reset in older scenes.** Some scenes before Wave 5 also reset when the web font loads; `flow` and `warp` do, and their prompts say so. Others, such as `ripple` and `sand`, haven't been checked. Audit this in 9.3 (performance pass). Don't change `flow` or `warp` without redoing their prompt tests.
- **`drop` desktop prototype parity is skipped.** The demo's loop starts up to a frame later under the test clock (documented).
- **The goo retest agent** belonged to the old account's session. If it finished, its page only exists in the temporary scratchpad folder (`ptest5b/goo/index.html`). Cloth's and smoke's final pages are saved in the repo.

## Next 5 actions, in order

1. **Finish the three open prompt tests** (cloth, smoke, goo retest) as described above. Log each in `docs/PROMPT_TESTS.md`, and change "not compared yet" or "retest pending" to the result.
2. **Finish the Wave 5 wrap-up:**
   - `bash scripts/wait-for-deploy.sh`, then `npm run test:live`. If a deploy fails, read the build log, fix and push.
   - Send the owner update (draft below) and tick the Wave 5 wrap-up box in `docs/PLAN.md`.
3. **6.3 `tilt`:** holographic card (SCENES.md #37). Ask for motion permission only after a tap, with a graceful fallback when it's denied.
4. **6.4 `kaleido`** and **6.5 `morph`** (SCENES.md #38, #39).
5. **6.6 `moire`** (⚠). It needs a flash test like `fireworks` and `lightning`: keep the simulation in its own file with no DOM, and add a test to `tests/unit/flash.test.ts`.

Then continue 6.7–6.10 and the Wave 6 wrap-up, per `docs/PLAN.md`. Wave 6 prompt tests should cover its Spicy scenes plus one easy scene, at least `overprint` or `halftone`, which are already proven against the demo.

## Waiting on the owner

- **Third retest of `flow`, `warp`, `marbles`, `skid`.** Each has had its one retest. Root causes are found and fixed in the prompts. A third run needs the owner's OK (about 550k tokens for all four).
- **About page details** (name, one-line bio, what you're looking for, contact link, social links). Asked at step 8.14.
- **Friend test** with 3–5 people at Checkpoint 9.
- **Unchanged:** nothing paid, no domain purchase, no cookies or personal data.

## Draft owner update (Wave 5, not sent yet)

> Wave 5 is built: 11 particle and physics scenes. Live at https://peak-teal.vercel.app once the deploy finishes.
> Try on a phone: (1) **Tearable cloth**: press and hold, then drag hard until it rips, and double-tap to rehang. (2) **Fireworks**: tap fast; it never does more than 3 bursts a second. (3) **Smoke**: drag a finger sideways across it.
> Also new: four more home-page slots (cloth, fireworks, flock, lightning) now show their real scenes.
> Prompt tests: lightning and blackhole rebuild correctly from the prompt alone. Goo's first test found a real prompt issue (blending), now fixed and being retested. Cloth and smoke pages are built and waiting to be compared.
> Needs you: OK for a third retest of flow, warp, marbles and skid (about 550k tokens), whenever you like.
