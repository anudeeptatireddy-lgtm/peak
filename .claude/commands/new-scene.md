Add a new scene to peak: $ARGUMENTS

Follow the lean scene process (docs/DECISIONS.md, 2026-10-21): one pass per scene, only the new scene's tests while building, one screenshot pair, the full suite and docs once per chunk, prompt tests only for Spicy scenes. New scenes get `unreleased: true` in `meta.ts` and stay out of `CATALOG_ORDER` until the owner releases them as a drop.

1. If `docs/SCENES.md` already describes this scene, follow that entry. Otherwise, write a new numbered entry in `docs/SCENES.md` in the same format (use case, world, what happens, interactions, params with ranges and defaults, still frame, mobile notes, tags, difficulty, time) and show it to me for approval before writing code.
2. Create `src/scenes/<slug>/` with `meta.ts`, `params.ts`, `prompt.ts`, and `index.ts`, implementing the interface in `src/scenes/types.ts`, built on the shared kits in `src/kits/` (PRD §16.8), and meeting the definition of done in PRD §8.4 and at the top of `docs/PLAN.md`.
3. Register it in `src/scenes/registry.ts` and make sure its scene page and gallery tile work (once those pages exist). If it's featured on the home page (PRD §6.1), replace its stand-in there.
4. Add snapshot and phrase-coverage tests; make sure the schema validator passes.
5. Add a row to `docs/PROMPT_TESTS.md` marked "pending".
6. If this is a weekly drop, add `src/content/drops/<date>-<slug>.md` with a title, date, scene slug, and a one-line summary.
7. Run `npm run check` and `npm run test:e2e`, commit as `scene: <slug>`, and tell me how to try it.
