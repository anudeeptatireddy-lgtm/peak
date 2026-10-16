# Prompt tests (PRD §10.8)

How every scene's prompt is tested (owner, 2026-10-16): the Detailed + New page + I'm new prompt at defaults goes to a **fresh subagent in an empty folder outside this repo**, with no access to the peak code. Its `index.html` is saved in `docs/prompt-tests/<slug>/` with the exact `PROMPT.md` it got, and `tests/e2e/prompt-parity.spec.ts` renders it next to our scene under identical conditions (same seed, size and frames, Riso light, living colors off). Both pages go through the same scripted moments as the prototype parity test (`tests/e2e/scenarios.ts`: intro, cursor, clicks, presses). Only the titles, hints and Play buttons the agent added around the animation are hidden (listed in `docs/prompt-tests/<slug>/compare.json`). Pass = under 2% of pixels differ at 1280×800 and 390×844 at every compared moment (for `flow`, whose field never settles, under 0.02 average ink difference per cell of a 24×16 grid, as in the prototype parity test). A failing prompt is fixed in the scene's phrases or meta (never the test) and retested once.

| # | Scene | Date | Options | Result | What was wrong | Fix made |
|---|---|---|---|---|---|---|
| 1 | `particles` | 2026-10-17 | Detailed · New page · I'm new | **Pass** | Nothing at 2%. Settled, cursor-hole and click-blast frames pixel-identical; the 0.5s swarm-in frame differs by 0.04% (desktop) and 0.01% (phone). | Earlier in the same session the prompt was rewritten so every number is stated once and the random-number order is spelled out. |
| 2 | `elastic` | 2026-10-17 | Detailed · New page · I'm new | **Pass** | Nothing at 2% (idle wave and hover, both sizes). A first run looked like a fail on desktop, but the test itself hid the page's own hover target; fixed in the test harness (it now hides only the agent's extra UI), not by loosening the bar. | None needed. |
| 3 | `velocity` | 2026-10-17 | Detailed · New page · I'm new | Fail (15% desktop, 7% phone), retest running | Rows sat 32px too high and 112px further left. The prompt said the stack "sits 8vh above center via bottom padding", but an 8vh bottom padding lifts it only 4vh; and nothing forbade making rows wider than the screen, so the agent added a 7rem bleed for the lean. | Layout phrase now says the section has an 8vh bottom padding that lifts the stack half that far, and that each row is exactly as wide as the section. |
| 4 | `scramble` | | | pending | | |
| 5 | `marbles` | | | pending | | |
| 6 | `skid` | | | pending | | |
| 7 | `melt` | | | pending | | |
| 8 | `tumble` | | | pending | | |
| 9 | `fridge` | | | pending | | |
| 10 | `typewriter` | | | pending | | |
| 11 | `splitflap` | | | pending | | |
| 12 | `kinetic` | | | pending | | |
| 13 | `shatter` | | | pending | | |
| 14 | `flag` | | | pending | | |
| 15 | `extrude` | | | pending | | |
| 16 | `echo` | | | pending | | |
| 17 | `sand` | | | pending | | |
| 18 | `neon` | | | pending | | |
| 19 | `rubber` | | | pending | | |
| 20 | `fire` | | | pending | | |
| 21 | `ripple` | 2026-10-17 | Detailed · New page · I'm new | **Pass** | Nothing at 2% (automatic ripples, cursor, click; both sizes). | None needed. |
| 22 | `flow` | 2026-10-17 | Detailed · New page · I'm new | Fail (0.06 ink difference vs 0.02), retest running | Same field, but particles drifted apart after the first respawns: the agent updated particles color by color, so respawns drew random numbers in a different order. | Trail phrase now says to update particles in index order, respawning with x, y, life in that order, then stroke the three color paths. |
| 23 | `warp` | 2026-10-17 | Detailed · New page · I'm new | Fail (cruise passed; 7–9% while warping), retest running | Stars that fly off screen respawned at a random depth instead of far away, because the draw step only said "respawns". | Draw phrase now says off-screen stars respawn far away like any respawning star, drawn in index order, and gives the stroke order. |
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

