Add a new color world to peak: $ARGUMENTS

1. Propose a world in the format of PRD §7: an original public name (no film or brand names), an internal "inspired by" note, mode (light or dark), and hex values for ground, surface, ink, inkSoft, c1, c2, c3. Show me the palette and wait for my OK.
2. Add it to `src/theme/worlds.ts` and the table in `docs/PRD.md` §7.
3. Run the tests. Every world must keep ink and inkSoft at 4.5:1 or better on ground and surface, and if it's placed in the home journey, the blend guardrail must pass for its neighbors.
4. If I asked for it to be in the home journey, update `src/theme/journey.ts` and tell me which scene it's paired with.
5. Commit as `world: <id>` and tell me where to see it.
