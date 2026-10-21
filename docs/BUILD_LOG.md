# Build log

One line per scene built from the backlog: scene, live link, tokens used, problems. Tokens come from the 5-hour usage meter before and after each scene, so they are **approximate**; chunks 1 to 3 were measured per chunk, so their per-scene numbers are a third of the chunk ("approx").

| Date | Scene | Live link | Tokens (approx) | Problems |
|---|---|---|---|---|
| 2026-10-21 | `signalpaths` (80) | https://peak-teal.vercel.app/scenes/signalpaths | approx 30k of new work (chunk 1: meter 22% → 35%, mostly re-reading a long session) | Strongest paths formed where the cursor started; fixed with "Seek the name". |
| 2026-10-21 | `domino` (64) | https://peak-teal.vercel.app/scenes/domino | approx 30k (chunk 1) | None. |
| 2026-10-21 | `pendulum` (62) | https://peak-teal.vercel.app/scenes/pendulum | approx 30k (chunk 1) | None. |
| 2026-10-21 | `platformarrival` (81) | https://peak-teal.vercel.app/scenes/platformarrival | approx 4% of the meter (chunk 2: 37% → 49%) | Window frame hard to see in dark worlds; fixed. |
| 2026-10-21 | `doorwave` (82) | https://peak-teal.vercel.app/scenes/doorwave | approx 4% of the meter (chunk 2) | A radius-only wave never opened the whole name; letter doors now stay open. |
| 2026-10-21 | `resonanceplate` (83) | https://peak-teal.vercel.app/scenes/resonanceplate | approx 4% of the meter (chunk 2) | Spicy: prompt test waits for the owner's OK (about 0.1 to 0.15M). |
| 2026-10-21 | `anamorphic` (63) | https://peak-teal.vercel.app/scenes/anamorphic | approx 6% of the meter (chunk 3: 10% → 29%) | Letters still a little soft at the default shard size. |
| 2026-10-21 | `coilstairs` (65) | https://peak-teal.vercel.app/scenes/coilstairs | approx 6% of the meter (chunk 3) | None. |
| 2026-10-21 | `clockwork` (66) | https://peak-teal.vercel.app/scenes/clockwork | approx 6% of the meter (chunk 3) | Spicy: prompt test waits for the owner's OK (about 0.1 to 0.15M). |
| 2026-10-21 | `infinitezoom` (89) | https://peak-teal.vercel.app/scenes/infinitezoom | approx 3% of the meter (32% → 35%) | Spicy: prompt test waits for the owner's OK. One tuning round (skylight too big). |
| 2026-10-21 | `torchmap` (84, ⚠) | https://peak-teal.vercel.app/scenes/torchmap | approx 4% of the meter (35% → 39%) | None; flash test added and passing. |
| 2026-10-21 | `doubling` (85) | https://peak-teal.vercel.app/scenes/doubling | approx 4% of the meter (39% → 43%, including the full suite) | Counter overlapped the stage buttons on phones; moved down. |
| 2026-10-21 | `peekaboo` (86) | https://peak-teal.vercel.app/scenes/peekaboo | approx 4% of the meter (43% → 47%) | Heads used capital height on lowercase letters; fixed. |

**Summary after 9 scenes (2026-10-21):** three chunks used about 13%, 12% and 19% of the 5-hour meter (about 15% per chunk, 5% per scene). In tokens of new work, roughly 30k to 60k per scene; the estimate was 60k to 100k per Medium scene, so all nine stayed within it.

**Summary after 12 scenes (2026-10-21; the 3 built one at a time):** `infinitezoom`, `torchmap` and `doubling` used about 3%, 4% and 4% of the 5-hour meter (11% for the three, about 3.7% per scene, including docs, live checks and one full suite), compared with about 5% per scene in chunks 1 to 3. Since the meter started at 10% in this session: 33% for 12 scenes' worth of work here (3 built in chunk 3, 9 released, 3 more built), about 2.8% per scene. In tokens this is roughly 30k to 40k of new work per scene, within the 60k to 100k estimate (Spicy 110k to 150k). Full suite green apart from the known-flaky `flow` parity, which passed alone.
