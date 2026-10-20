# Handoff: 2026-10-20 (launched; realism proposal waiting for the owner's OK)

Everything is committed and pushed to `main`; pushing deploys to Vercel (https://peak-teal.vercel.app, still `noindex`).

## Exact step

Waves 1 to 9 are built and the site **launched on 2026-10-18** (step 9.7: `noindex` removed, robots open, sitemap on). Still open from Wave 9: **9.8** (share previews and Lighthouse; the phone timing check was interrupted) and **9.9** (final deploy and checks). On 2026-10-20 the owner proposed a **Realism standard** (PRD §8.8) and 16 new scenes (SCENES 54 to 69). The docs are updated and the work is planned as **Wave 10** in `docs/PLAN.md`, but **nothing is built: waiting for the owner's OK to the token estimate** (DECISIONS, 2026-10-20). Order after OK: finish 9.8 and 9.9, then the realism kit, then the pilot (`velvet`, `soap`), then the owner's verdict.

The project folder is `~/peak`.

## Update 1 status

- **Measured pass rule for prompt tests:** done (PRD §8.7, `docs/PROMPT_TESTS.md`, `judge()` in `tests/e2e/parity-helpers.ts`). Every run writes `docs/prompt-tests/<slug>/side-by-side-<size>.png`.
- **Test mode:** done in `src/engine/testmode.ts`: seeded random numbers and a fixed step. The step is 16ms, not 1/60s: Playwright's fake clock fires frames every 16ms and the demos measure that; a 1/60s step made every parity test mismatch. See DECISIONS.
- **`drop` desktop parity** is still skipped. Our side is now fully deterministic; the variation left starts in the demo's loop. A fix needs a way to start the demo's loop on a known frame.

## Side-by-side pictures (ours vs the fresh build)

Saved in the repo, committed: `docs/prompt-tests/<scene>/side-by-side-desktop.png` and `side-by-side-mobile.png`, for all 17 prompt-tested scenes. Left picture: built from the prompt. Right: peak. Examples: `docs/prompt-tests/cloth/`, `smoke/`, `flow/`, `warp/`, `marbles/`, `skid/`. They are rewritten every time `tests/e2e/prompt-parity.spec.ts` runs.

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

- **About page details** (name, one-line bio, why you made peak, what you're looking for, contact link, social links). `/about` shows marked `[PLACEHOLDER]`s until then (list in DECISIONS, 8.14).
- **Smoke retest** (one fresh agent, about 150k tokens). Skipped; no retests are allowed without your OK.
- **`tailor` decision:** matches by eye but not on the measure. Accept as is, or retest.
- **OK to the Wave 10 token estimate**, and phone photos or videos for `velvet` and `soap` (what to film is in DECISIONS, 2026-10-20).
- **Which scene is the jello wordmark?** No scene has that name (nearest: `melt`, `jelly`).
- **Review "Overnight choices for owner review"** in `docs/DECISIONS.md`.
- **Friend test** with 3-5 people at Checkpoint 9.
- **Unchanged:** nothing paid, no domain purchase, no cookies or personal data.
