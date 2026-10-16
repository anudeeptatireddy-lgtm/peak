# peak: project memory for Claude Code

## What this is
peak is a website that closes the gap between people and Claude Code. Visitors see an animation they love, tweak it with sliders, copy a ready-made prompt, and build their own version with Claude Code. It also teaches animation vocabulary, helps first-timers set up Claude Code, fix problems, and put their page online. peak launches with 50 animations. As you scroll the home page, the whole site blends through 16 color "worlds", and the accent colors slowly drift inside each one.

- Full spec: `docs/PRD.md` (sections are numbered §0–§25; read the ones a step references, not the whole file every time).
- Scene catalog, one entry per scene (all 50): `docs/SCENES.md`.
- Build order: `docs/PLAN.md`.
- Decisions and owner answers: `docs/DECISIONS.md`.
- Prompt test results: `docs/PROMPT_TESTS.md`.
- Working prototype of the first six scenes: `reference/peak-prototype.html` (read-only; source of truth for their physics and feel).
- Riso demo with four more scenes (`overprint`, `halftone`, `pluck`, `drop`): `reference/riso-demo.html` (read-only; same rule).

## How to work
- Work through `docs/PLAN.md` one step at a time, in order. Don't start a step until the previous step's "Done when" checks pass.
- Before coding a step, read the PRD sections it lists. If the PRD and PLAN disagree, the PRD wins; log it in `docs/DECISIONS.md`.
- Port the six prototype scenes and the four riso-demo scenes from `reference/`. Don't reinvent their physics; turn their constants into params with the same defaults.
- The deliverable is this Astro project. Never publish a standalone demo (a single HTML file or an artifact) as the final site.
- After each step: run `npm run check` (and `npm run test:e2e` when the step touches pages), fix until green, tick the step's box in `docs/PLAN.md`, log decisions in `docs/DECISIONS.md`, commit as `step N.M: <summary>`. Then stop and tell the owner, in plain language, what changed and what to open in the browser.
- At a **Checkpoint**, stop and wait for the owner.
- Ask the owner before: adding a dependency not on the allowlist, changing world colors or names, deleting files, changing the PRD's scope, deploying, or anything that costs money.
- The owner may be new to coding. Explain things plainly, and give exact commands to run.

## Commands
- `npm run dev`: local dev server
- `npm run build` / `npm run preview`: production build and preview
- `npm run check`: astro check + tsc + prettier --check + vitest run
- `npm run test:e2e`: Playwright (desktop + mobile projects)
- `npm run format`: Prettier write

## Stack and dependencies
Astro (static output) + TypeScript strict. Plain CSS with custom properties. No UI framework, no CSS framework, no animation/color/physics libraries.
Allowlist: astro, @astrojs/mdx, @astrojs/sitemap, @astrojs/rss, @astrojs/check (owner-approved 2026-10-16), typescript, vitest, @playwright/test, prettier, prettier-plugin-astro.
Pin exact versions (no ^ or ~), choosing releases at least two weeks old.

## Architecture rules (PRD §16)
- Exactly one requestAnimationFrame loop (`src/engine/scheduler.ts`). Scenes never call rAF themselves.
- Shared text, physics, field, render and easing code lives in `src/kits/` (PRD §16.8). Scenes use the kits instead of rewriting physics.
- Flashing scenes follow PRD §8.2: never more than 3 flashes per second, no large or full-screen flashes.
- Scenes implement the interface in `src/scenes/types.ts` (PRD §16.3) and are lazy-loaded from `registry.ts`.
- Playground controls are generated from each scene's params schema. Never hand-build per-scene controls.
- Colors come from the theme store. No hard-coded colors in scenes or components; no `getComputedStyle` inside frames.
- Color math is in `src/theme/color.ts` and blends in OKLab. Text colors always pass through `ensureContrast`.
- The prompt builder is pure (no DOM) and deterministic.
- Canvas: devicePixelRatio capped at 2; batch draws into one path per color; physics uses `f = min(dt * 60, 2.5)`.
- Every scene has `still()` for reduced motion and a `destroy()` that removes every listener, observer, and timer.

## Content rules
- Facts about Claude Code, hosting providers, and browsers must come from official docs, linked in the guide's Sources with a "Last checked" date. Never write install commands, prices, or plan details from memory. If you can't verify it, leave `[OWNER: verify …]`.
- World names are original (PRD §7). Never use film or brand names like Barbie or Dune in visible UI, URLs, metadata, or generated prompts.
- Copy is plain, second person, sentence case. Buttons say exactly what happens. No lorem ipsum; use clearly marked `[PLACEHOLDER]`s for things only the owner knows.
- Don't add UI decoration the PRD lists under "Avoid" (§18).

## Definition of done for a scene (PRD §8.4, and the checklist at the top of `docs/PLAN.md`)
Module + params schema (labels, help, phrases) + 3–5 follow-ups + How it works + linked terms + still frame + clean destroy + mobile behavior + passing schema, snapshot, and phrase-coverage tests + flash test for ⚠ scenes + a row in `docs/PROMPT_TESTS.md`.
