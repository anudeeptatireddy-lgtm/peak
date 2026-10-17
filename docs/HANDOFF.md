# Handoff: 2026-10-17 (updated after step 6.5)

Work stopped at a clean point because the owner is switching Claude accounts. Everything below is committed in "handoff: save state" and pushed to `main`. Pushing deploys to Vercel. The pushed code is tested, but the live smoke run for this deploy hasn't been done yet (see action 2).

## Exact step

All 50 scenes plus the three gallery-only industry heroes (`fogged`, `tailor`, `latte`) are built. Wave 7 and Wave 7b are wrapped up (full suite 608 passed; live smoke 80, live phone and gallery checks 72 passed). Wave 8: **8.1 and 8.2 (gallery and its filters/sort) are done.** Next: **8.3 Tour** (`/tour`, all scenes in catalog order using `src/scenes/catalog.ts`; the industry heroes (51-53) are gallery-only, so the Tour plays the first 50), then 8.4 Tour Shuffle and Autoplay, 8.5 Home (latest drop; home stays the 12 featured scenes, now with the black hole and confetti in the lava and glitch slots), then the guides (8.6 to 8.9: facts must come from official docs with a Last checked date), words (8.10 to 8.12), drops (8.13), About (8.14: ask the owner for details in one message), 404 (8.15).

The project folder is `~/peak`.

## Update 1 status

- **Measured pass rule for prompt tests:** done (PRD §8.7, `docs/PROMPT_TESTS.md`, `judge()` in `tests/e2e/parity-helpers.ts`). Every run writes `docs/prompt-tests/<slug>/side-by-side-<size>.png`.
- **Test mode:** done in `src/engine/testmode.ts`: seeded random numbers and a fixed step. The step is 16ms, not 1/60s: Playwright's fake clock fires frames every 16ms and the demos measure that; a 1/60s step made every parity test mismatch. See DECISIONS.
- **`drop` desktop parity** is still skipped. Our side is now fully deterministic; the variation left starts in the demo's loop. A fix needs a way to start the demo's loop on a known frame.

## Side-by-side pictures (ours vs the fresh build)

Saved in the repo, committed: `docs/prompt-tests/<scene>/side-by-side-desktop.png` and `side-by-side-mobile.png`, for all 17 prompt-tested scenes. Left picture: built from the prompt. Right: peak. Examples: `docs/prompt-tests/cloth/`, `smoke/`, `flow/`, `warp/`, `marbles/`, `skid/`. They are rewritten every time `tests/e2e/prompt-parity.spec.ts` runs.

## Wave 6 prompt tests (done 2026-10-18: moire, tunnel and glitch pass)

By the owner's rule: all Spicy scenes plus one easy one. Spicy: `moire`, `tunnel`, `glitch`. Easy one: none needed (`overprint` and `halftone` are proven against the demo). Three fresh agents, about 150k tokens each, about 450k in total. Not started.

## Retest estimate

`smoke` fails (real plume difference): one fresh agent run, about 100-150k tokens (agents have been costing about 90-110k each). `tailor` could be retested the same way if the owner wants. Nothing else needs a retest.

## Prompt-test state (measured rule)

- Pass: particles, elastic, velocity, scramble, echo, neon, fire, ripple, lightning, blackhole, goo, cloth, flow, warp, marbles, skid, moire, tunnel, glitch, fogged, latte.
- Fails on the measure but matches by eye: `tailor` (cloth physics diverge mid-cut; its threads linger). Not chased; owner may decide.
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

## Draft owner update (Waves 5 to 7b, not sent yet)

> All 50 animations are built, plus three extra gallery-only ones (Fogged bottle, Tailor's cut, Latte pour). The gallery is live at https://peak-teal.vercel.app/gallery with filters and sort. The home page keeps its 12 featured scenes (the black hole and confetti are back in two slots).
> Try on a phone: (1) Gallery: pick Events, then try Easiest first. (2) Fogged bottle: drag a finger sideways across it. (3) Tilt the phone on Holographic card after tapping "Use motion".
> The site now has a phone-readiness test (no sideways scroll, 44px taps) on every page and scene.
> Prompt tests: all new scenes pass except Tailor's cut, which matches by eye but not on the measure; Smoke still waits on a retest.
> Needs you: OK to retest Smoke (about 100-150k tokens), and your About-page details when you are ready.
