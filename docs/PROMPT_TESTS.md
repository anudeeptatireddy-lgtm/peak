# Prompt tests (PRD §10.8)

How every scene's prompt is tested (owner, 2026-10-16): the Detailed + New page + I'm new prompt at defaults goes to a **fresh subagent in an empty folder outside this repo**, with no access to the peak code. Its `index.html` is saved in `docs/prompt-tests/<slug>/` with the exact `PROMPT.md` it got, and `tests/e2e/prompt-parity.spec.ts` renders it next to our scene under identical conditions (same seed, size and frames, Riso light, living colors off). Both pages go through the same scripted moments as the prototype parity test (`tests/e2e/scenarios.ts`: intro, cursor, clicks, presses). Only the titles, hints and Play buttons the agent added around the animation are hidden (listed in `docs/prompt-tests/<slug>/compare.json`). Run 1 of a retested scene is kept in `docs/prompt-tests/<slug>/run1/`. A logged failure stays in the test as an expected failure (`expect: "fail"` in its `compare.json`) until it's retested. Pass = under 2% of pixels differ at 1280×800 and 390×844 at every compared moment (for `flow`, whose field never settles, under 0.02 average ink difference per cell of a 24×16 grid, as in the prototype parity test). A failing prompt is fixed in the scene's phrases or meta (never the test) and retested once.

| # | Scene | Date | Options | Result | What was wrong | Fix made |
|---|---|---|---|---|---|---|
| 1 | `particles` | 2026-10-17 | Detailed · New page · I'm new | **Pass** | Nothing at 2%. Settled, cursor-hole and click-blast frames pixel-identical; the 0.5s swarm-in frame differs by 0.04% (desktop) and 0.01% (phone). | Earlier in the same session the prompt was rewritten so every number is stated once and the random-number order is spelled out. |
| 2 | `elastic` | 2026-10-17 | Detailed · New page · I'm new | **Pass** | Nothing at 2% (idle wave and hover, both sizes). A first run looked like a fail on desktop, but the test itself hid the page's own hover target; fixed in the test harness (it now hides only the agent's extra UI), not by loosening the bar. | None needed. |
| 3 | `velocity` | 2026-10-17 | Detailed · New page · I'm new | **Pass on retest** | Run 1 (in `run1/`): 15% desktop, 7% phone. Rows sat 32px too high and 112px further left. The prompt said the stack "sits 8vh above center via bottom padding", but that padding lifts it only 4vh; and nothing forbade rows wider than the screen, so the agent added a 7rem bleed for the lean. Retest: nothing at 2%. | Layout phrase: an 8vh bottom padding that lifts the stack half that far; each row exactly as wide as the section. |
| 4 | `scramble` | 2026-10-17 | Detailed · New page · I'm new | **Pass** | Nothing at 2% (mid-decode at 0.4s and settled, both sizes). Mid-decode frames are identical, down to which random symbols show. The agent darkened the third accent to 3:1 exactly as the prompt asked. | None needed. |
| 5 | `marbles` | 2026-10-17 | Detailed · New page · I'm new | **Fail** (retest pending) | Whole word, settled pile (ink signature) and rebuild all match. The frame 0.25s after the shatter differs (6% desktop, 3% phone): marbles start packed together, so collision order and rounding snowball, and the prompt didn't pin either down. | Behavior lines now spell out the collision pair order (grid cells one diameter wide, marbles in index order, j > i, pushes applied immediately) and Float32Array storage. |
| 6 | `skid` | 2026-10-17 | Detailed · New page · I'm new | **Fail** (retest pending) | Parked frame identical. The arrival was ahead (10% desktop): the agent started the entrance at page load, while ours starts once the font has loaded, and the prompt only said "when the page loads". Replays started about a frame apart (3%). | The entrance now starts when the letters are first laid out, after the font loads; clicks are handled right after t += dt. |
| 7 | `melt` | | | not tested yet | Wave 3 tests its Spicy scenes plus one easy scene (owner rule, to save usage). | Built 2026-10-17; listed here as untested, as the owner asked. |
| 8 | `tumble` | | | not tested yet | Wave 3 tests its Spicy scenes plus one easy scene (owner rule, to save usage). | Built 2026-10-17; listed here as untested, as the owner asked. |
| 9 | `fridge` | | | not tested yet | Wave 3 tests its Spicy scenes plus one easy scene (owner rule, to save usage). | Built 2026-10-17; listed here as untested, as the owner asked. |
| 10 | `typewriter` | | | not tested yet | Wave 3 tests its Spicy scenes plus one easy scene (owner rule, to save usage). | Built 2026-10-17; listed here as untested, as the owner asked. |
| 11 | `splitflap` | | | not tested yet | Wave 3 tests its Spicy scenes plus one easy scene (owner rule, to save usage). | Built 2026-10-17; listed here as untested, as the owner asked. |
| 12 | `kinetic` | | | not tested yet | Wave 3 tests its Spicy scenes plus one easy scene (owner rule, to save usage). | Built 2026-10-17; listed here as untested, as the owner asked. |
| 13 | `shatter` | | | not tested yet | Wave 3 tests its Spicy scenes plus one easy scene (owner rule, to save usage). | Built 2026-10-17; listed here as untested, as the owner asked. |
| 14 | `flag` | | | pending | | |
| 15 | `extrude` | | | pending | | |
| 16 | `echo` | | | pending | | |
| 17 | `sand` | | | pending | | |
| 18 | `neon` | | | pending | | |
| 19 | `rubber` | | | pending | | |
| 20 | `fire` | | | pending | | |
| 21 | `ripple` | 2026-10-17 | Detailed · New page · I'm new | **Pass** | Nothing at 2% (automatic ripples, cursor, click; both sizes). | None needed. |
| 22 | `flow` | 2026-10-17 | Detailed · New page · I'm new | **Fail after retest** (fix made, not yet retested) | Run 1: 0.06 ink difference (bar 0.02). I blamed the update order and fixed that phrase; the retest still scored 0.06. Real cause, found after: our scene rebuilds once more when the web font finishes loading, and the prompt never said so, so the particles were seeded differently. Proof: the retest page plus that one rebuild scores 0.007–0.019. | Run 1: update order spelled out. After retest: the rebuild sentence now includes "once more when the Anybody font has finished loading". The one retest is used; a third run waits for the owner. |
| 23 | `warp` | 2026-10-17 | Detailed · New page · I'm new | **Fail after retest** (fix made, not yet retested) | Run 1: off-screen stars respawned at a random depth (prompt only said "respawns"). Retest: same 3–9% while warping. Real cause, found after: the same missing font-load rebuild as `flow` (cruise frames passed only because sparse stars cover under 2% of pixels either way). Proof: the retest page plus that one rebuild passes every moment. | Run 1: respawn depth and stroke order spelled out. After retest: the rebuild sentence includes the font-load rebuild. The one retest is used; a third run waits for the owner. |
| 24 | `confetti` | | | pending | | |
| 25 | `goo` | | | pending | | |
| 26 | `drop` | | | pending | | |
| 27 | `pluck` | | | pending | | |
| 28 | `cloth` | | | pending | | |
| 29 | `fireworks` | | | pending | | |
| 30 | `blackhole` | | | pending | | |
| 31 | `flock` | | | pending | | |
| 32 | `lightning` | | | pending | | |
| 33 | `smoke` | | | pending | | |
| 34 | `filings` | | | pending | | |
| 35 | `overprint` | | | pending | | |
| 36 | `halftone` | | | pending | | |
| 37 | `tilt` | | | pending | | |
| 38 | `kaleido` | | | pending | | |
| 39 | `morph` | | | pending | | |
| 40 | `moire` | | | pending | | |
| 41 | `tunnel` | | | pending | | |
| 42 | `lava` | | | pending | | |
| 43 | `fold` | | | pending | | |
| 44 | `glitch` | | | pending | | |
| 45 | `magnetic` | | | pending | | |
| 46 | `countdown` | | | pending | | |
| 47 | `trail` | | | pending | | |
| 48 | `curtain` | | | pending | | |
| 49 | `jelly` | | | pending | | |
| 50 | `loaders` | | | pending | | |

## Not tested yet

Scenes are tested as their wave finishes. To save the owner's usage, each wave tests its Spicy scenes plus at least one easy scene; any scene left untested is listed here with the reason.

