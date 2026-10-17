# Handoff: 2026-10-17

Work stopped at a clean point because the owner is switching Claude accounts. Everything below is committed in "handoff: save state" and pushed to `main`. Pushing deploys to Vercel. The pushed code is tested, but the live smoke run for this deploy hasn't been done yet (see action 2).

## Exact step

**Wave 5 wrap-up is done** (suite green, deployed, live smoke 80 passed). Next: **6.3 `tilt`** (SCENES.md #37), then 6.4 `kaleido`, 6.5 `morph`, 6.6 `moire` (flash test), 6.7-6.10, Wave 6 wrap-up. Wave 6 steps 6.1 and 6.2 are done.

## Prompt-test state

- Passing: particles, elastic, velocity, scramble, echo, neon, fire, ripple, lightning, blackhole, goo (retest).
- Desktop passes, phone fails: `cloth` (2.16% vs 2%, near-miss), `smoke` (4.3-4.6% vs 2%). One retest each still allowed, not run.
- Failing after retest: flow, warp, marbles, skid (third retest needs the owner's OK, about 550k tokens).
- Untested by rule: see docs/PROMPT_TESTS.md.

## Known bugs and loose ends

- **Font-load reset in older scenes.** Some scenes before Wave 5 also reset when the web font loads; `flow` and `warp` do, and their prompts say so. Others, such as `ripple` and `sand`, haven't been checked. Audit this in 9.3 (performance pass). Don't change `flow` or `warp` without redoing their prompt tests.
- **`drop` desktop prototype parity is skipped.** The demo's loop starts up to a frame later under the test clock (documented).
- **All five Wave 5 prompt-test agents finished.** Every final page is saved in the repo (`draft-index.html` for cloth, smoke and the goo retest), so nothing depends on the temporary scratchpad folder any more.

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
