# Handoff: 2026-10-21 (nine backlog scenes live; building the rest one scene at a time)

Everything is committed and pushed to `main`; pushing deploys to Vercel (https://peak-teal.vercel.app, live and open to search engines since 2026-10-18).

## Exact step

**Backlog (2026-10-21):** the nine scenes from chunks 1 to 3 are **live**: `pendulum`, `anamorphic`, `domino`, `coilstairs`, `clockwork`, `signalpaths`, `platformarrival`, `doorwave`, `resonanceplate` are in the gallery (63 scenes with `infinitezoom`), the Tour (60) and the sitemap, each with a drop on /drops and in RSS. New gallery chips: Tech & AI, Travel, Real estate, Wellness. **New way of working (owner):** one session builds the remaining ANIMATED scenes one at a time, live on build, without waiting between scenes; rules, test cadence and stop rules in DECISIONS (2026-10-21, "Scenes go live on build") and PLAN. Log: `docs/BUILD_LOG.md`. `infinitezoom` (89) is live too (Spicy). **Next:** `torchmap` (84, ⚠ flash test), then `doubling`, `peekaboo`, `gatherround`, `epicycles`, `tokenstream`, `clayframes`, `stringart`. Waiting on the owner: prompt tests for the Spicy `resonanceplate`, `clockwork` and `infinitezoom` (about 0.1 to 0.15M each); `anamorphic`'s letters are still a little soft at the default shard size.

Earlier state:

Waves 1 to 9 are built; the site launched on 2026-10-18. 9.8 and 9.9 are on hold (owner's instruction). **Wave 10 pilot round 1 is built on the branch `realism-pilot` (not on `main`)**: the realism kit, `velvet` (#55) and `soap` (#56). No reference photos yet, so no §8.8 side-by-side and **no prompt tests** (owner's rule: only after the owner approves the look). Next: the owner films the references (list in DECISIONS, 2026-10-20), I make `reference-vs-ours.png` side-by-sides, the owner judges, at most one more round, then prompt tests for the pilots only if approved. The other 14 Batch 1 scenes and the 20 Batch 2 scenes (SCENES 70 to 89, specs only; added 2026-10-20) are a Drops backlog in `docs/PLAN.md` (one per week via `/new-scene`, Batch 2's top five first, each needing a token estimate and the owner's OK before building).

The project folder is `~/peak` (`/Users/madhutatireddy/peak`) and it is **the only repo**. `~/Documents/peak` is an old leftover folder (not a git repo; a stale handoff and an empty cache): ignore it, and do not delete it without the owner's OK.

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

- **Batch 3 (SCENES 90 to 100, added 2026-10-21)** is an idea bank like Batch 2: nothing is scheduled without your OK and a token estimate.

- **The owner's reference clips** for `velvet` and `soap` (in `reference/realism/<scene>/`, git-ignored). Then I make the side-by-sides.
- **The footer's "Made by" credit stays removed, and `/about` stays hidden (404),** until the owner sends their About details (restore steps in DECISIONS, 2026-10-20).
- **Next backlog scene is `wafershine`** (OK'd 2026-10-20): ask for the CD or DVD reference video only when it is next to build, after the pilot and launch.
- **About page details** (name, one-line bio, why you made peak, what you're looking for, contact link, social links). `/about` shows marked `[PLACEHOLDER]`s until then (list in DECISIONS, 8.14).
- **Smoke retest** (one fresh agent, about 150k tokens). Skipped; no retests are allowed without your OK.
- **`tailor` decision:** matches by eye but not on the measure. Accept as is, or retest.
- **OK to the Wave 10 token estimate**, and phone photos or videos for `velvet` and `soap` (what to film is in DECISIONS, 2026-10-20).
- **Backlog needing the owner's spec:** the jello wordmark (public name must avoid the trademark) and the 21 unbuilt industry ideas in `docs/INDUSTRY_HEROES.md`.
- **Reference media for the pilot** goes in `reference/realism/` (git-ignored; never committed).
- **Review "Overnight choices for owner review"** in `docs/DECISIONS.md`.
- **Friend test** with 3-5 people at Checkpoint 9.
- **Unchanged:** nothing paid, no domain purchase, no cookies or personal data.
