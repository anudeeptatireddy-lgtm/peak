# Handoff: 2026-10-17 (updated after step 6.5)

Work stopped at a clean point because the owner is switching Claude accounts. Everything below is committed in "handoff: save state" and pushed to `main`. Pushing deploys to Vercel. The pushed code is tested, but the live smoke run for this deploy hasn't been done yet (see action 2).

## Exact step

Steps 6.3 `tilt`, 6.4 `kaleido` and 6.5 `morph` are done. Next: 6.6 `moire` (flash test, like `fireworks`), then 6.7 to 6.10 and the Wave 6 wrap-up. The project folder is now `~/peak` (it was `~/Documents/peak`). The Wave 5 wrap-up is done; its live smoke run passed (80 passed, 20 skipped) and was repeated after step 6.5.

## Update 1 status

- **Measured pass rule for prompt tests:** done (PRD §8.7, `docs/PROMPT_TESTS.md`, `judge()` in `tests/e2e/parity-helpers.ts`). Every run writes `docs/prompt-tests/<slug>/side-by-side-<size>.png`.
- **Test mode:** done in `src/engine/testmode.ts`: seeded random numbers and a fixed step. The step is 16ms, not 1/60s: Playwright's fake clock fires frames every 16ms and the demos measure that; a 1/60s step made every parity test mismatch. See DECISIONS.
- **`drop` desktop parity** is still skipped. Our side is now fully deterministic; the variation left starts in the demo's loop. A fix needs a way to start the demo's loop on a known frame.

## Side-by-side pictures (ours vs the fresh build)

Saved in the repo, committed: `docs/prompt-tests/<scene>/side-by-side-desktop.png` and `side-by-side-mobile.png`, for all 17 prompt-tested scenes. Left picture: built from the prompt. Right: peak. Examples: `docs/prompt-tests/cloth/`, `smoke/`, `flow/`, `warp/`, `marbles/`, `skid/`. They are rewritten every time `tests/e2e/prompt-parity.spec.ts` runs.

## Wave 6 prompt tests (waiting on the owner's OK)

By the owner's rule: all Spicy scenes plus one easy one. Spicy: `moire`, `tunnel`, `glitch`. Easy one: none needed (`overprint` and `halftone` are proven against the demo). Three fresh agents, about 150k tokens each, about 450k in total. Not started.

## Retest estimate

Only `smoke` still fails. One fresh agent run: about 150k tokens. Nothing else needs a retest.

## Prompt-test state (measured rule)

- Pass: particles, elastic, velocity, scramble, echo, neon, fire, ripple, lightning, blackhole, goo, cloth, flow, warp, marbles, skid.
- Fail (real behavior difference): `smoke`. The plume phrase is fixed; a retest needs the owner's OK (about 150k tokens).
- Untested by rule: see `docs/PROMPT_TESTS.md`.

## Known bugs and loose ends

- **Font-load reset in older scenes.** Some scenes before Wave 5 also reset when the web font loads; `flow` and `warp` do, and their prompts say so. Others, such as `ripple` and `sand`, haven't been checked. Audit this in 9.3 (performance pass). Don't change `flow` or `warp` without redoing their prompt tests.
- **`drop` desktop prototype parity is skipped.** The demo's loop starts up to a frame later under the test clock (documented).
- **All five Wave 5 prompt-test agents finished.** Every final page is saved in the repo (`draft-index.html` for cloth, smoke and the goo retest), so nothing depends on the temporary scratchpad folder any more.

## Waiting on the owner

- **Smoke retest** (one fresh agent, about 150k tokens). Skipped for now.
- **About page details** (name, one-line bio, what you're looking for, contact link, social links). Asked at step 8.14.
- **Friend test** with 3-5 people at Checkpoint 9.
- **Unchanged:** nothing paid, no domain purchase, no cookies or personal data.

## Draft owner update (Wave 5, not sent yet)

> Wave 5 is built: 11 particle and physics scenes, live at https://peak-teal.vercel.app. Live checks pass.
> Try on a phone: (1) **Tearable cloth**: press and hold, then drag hard until it rips, and double-tap to rehang. (2) **Fireworks**: tap fast; it never does more than 3 bursts a second. (3) **Smoke**: drag a finger sideways across it.
> Also new: four more home-page slots (cloth, fireworks, flock, lightning) now show their real scenes. Since then I added tilt, kaleido and morph from Wave 6.
> Prompt tests (new measured rule): cloth, goo, lightning and blackhole rebuild correctly from the prompt alone. Smoke has one real difference (the idle plume), phrase fixed, retest waiting on you.
> Needs you: OK to retest smoke (about 150k tokens).
