# Prompt tests (PRD §10.8)

How every scene's prompt is tested (owner, 2026-10-16): the Detailed + New page + I'm new prompt at defaults goes to a **fresh subagent in an empty folder outside this repo**, with no access to the peak code. Its `index.html` is saved in `docs/prompt-tests/<slug>/` with the exact `PROMPT.md` it got, and `tests/e2e/prompt-parity.spec.ts` renders it next to our scene under identical conditions (same seed, size and frames, Riso light, living colors off). Pass = under 2% of pixels differ at 1280×800 and 390×844 at every compared moment. A failing prompt is fixed in the scene's phrases or meta (never the test) and retested once.

| # | Scene | Date | Options | Result | What was wrong | Fix made |
|---|---|---|---|---|---|---|
| 1 | `particles` | 2026-10-17 | Detailed · New page · I'm new | **Pass** | Nothing at 2%. Settled, cursor-hole and click-blast frames pixel-identical; the 0.5s swarm-in frame differs by 0.04% (desktop) and 0.01% (phone). | Earlier in the same session the prompt was rewritten so every number is stated once and the random-number order is spelled out. |
| 2 | `elastic` | | | pending | | |
| 3 | `velocity` | | | pending | | |
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
| 21 | `ripple` | | | pending | | |
| 22 | `flow` | | | pending | | |
| 23 | `warp` | | | pending | | |
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

