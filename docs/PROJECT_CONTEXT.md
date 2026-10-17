# peak: full project handoff

You're continuing a project that was started in another Claude account. The plan hasn't changed. Your job is to pick up exactly where the last session stopped. Everything you need is in this message and in the repo.

## 0. Do this first
1. Save this entire message, word for word, as docs/PROJECT_CONTEXT.md. Add this line near the top of CLAUDE.md: "At the start of every session, read docs/PROJECT_CONTEXT.md and docs/HANDOFF.md." Commit as "docs: project context for handoff".
2. Run git pull. Read CLAUDE.md, docs/HANDOFF.md, docs/PLAN.md, docs/DECISIONS.md and docs/PROMPT_TESTS.md. Read docs/PRD.md and docs/SCENES.md only in the sections you need.
3. Check the real state: git log --oneline -30, git status, npm install, npm run check, npm run test:e2e.
4. Tell me in 10 lines or fewer: what's done, what's half-done, whether the tests pass, and what you'll do next. Then carry on, unless something needs me.

## 1. About me and how I work
- I'm the owner, and I'm new to coding. Explain things plainly and give exact commands.
- I usually control you from my phone while you run on my Mac. Keep updates short: what changed, the live link, three things to try on my phone, and anything you need from me.
- My usage is limited, so work efficiently (section 10).
- Project folder: ~/Documents/peak. Code: a public GitHub repo named "peak" (check git remote -v). Live site: https://peak-teal.vercel.app/ on Vercel. It deploys automatically on every push to main and stays noindex until launch.

## 2. The point of peak
Anyone can tweak any animation's physics, colors and text until it looks exactly right, then copy one precise prompt, so Claude Code builds it right the first time instead of the visitor burning tokens trying to describe motion in words.
Home page headline: "Don't describe it. Tweak it, copy it, build it."

The problem: people recognize great work when they see it but can't describe it, and Claude Code can only build what you describe. People get stuck at five points, and every feature maps to one of them:
1. Discover (what's possible): the home journey, the gallery, and the Tour.
2. Describe: the playground (sliders for everything), the live prompt builder, and the word bank.
3. Set up: the Start here guide.
4. Fix: the Fix it guide (symptom, then the exact message to send Claude Code).
5. Ship: the Put it online guide.
Audience: curious beginners around me (friends, classmates, coworkers), plus developers and designers. About half arrive on phones.

## 3. What peak is
- Pages: Home (/), Gallery, Tour (/tour), a page for each scene (/scenes/[slug]), Start here (/start), Fix it (/fix), Put it online (/ship), Word bank (/words), Drops (/drops) plus /rss.xml, About, and 404.
- Scene pages: the live animation (the stage) plus a panel with three tabs: Tweak, Prompt, and How it works. On phones the panel is a bottom sheet.
  - Tweak: controls generated automatically from each scene's settings, in Look, Motion, and Interaction groups, plus a collapsed Advanced group. Every number that affects the result is a slider; nothing is hard-coded. Also: a world picker (16 worlds plus custom colors), Shuffle world, Cycle worlds (a new world every 8 seconds), Reset, Surprise me, and Share my version (settings saved in the URL).
  - Prompt: a live prompt that updates with every change. Options: Where is this going? (New page / Add to my project / React component), How much detail? (Detailed / Quick, under 150 words), Your experience (I'm new / I've done this). Buttons: Copy prompt, Download as PROMPT.md, follow-up prompts with copy buttons, and Did it work? (It worked / It didn't).
  - How it works: 3–5 plain-language sentences with word-bank links.
  - Also: Just play (fidget mode, full-screen), optional synthesized sound (off by default).
- The prompt must be self-contained (never mentions peak or this repo), deterministic, and include every value that differs from the default plus the key defaults, so the result matches what the visitor saw with no follow-up questions. If Cycle worlds is on, the prompt asks for a slow crossfade between the chosen palettes, with their hex values.
- Guides: facts about Claude Code, Vercel, Netlify, GitHub Pages and browsers come from official docs, linked under Sources with a "Last checked" date. Never write install commands, prices or plan details from memory. If something can't be verified, write [OWNER: verify ...].
- Word bank: 24 or more terms, each with a mini live demo, a "say it in a prompt" example, and links to the scenes that use it.
- Drops: a new animation each week, added with /new-scene.
- About: my portfolio page, using the tilt card. Ask me for my details (section 11).

## 4. The 50 animations (full specs are in docs/SCENES.md)
- Text (20): particles, elastic, velocity, scramble, marbles (the headline shatters into glass marbles that pile up, then fly back on click; Spicy), skid (letters drive in like cars and skid to a stop with skid marks; Spicy), melt, tumble, fridge, typewriter, splitflap, kinetic, shatter, flag, extrude, echo, sand, neon (Spicy), rubber, fire (Spicy).
- Physics (14): ripple, flow, warp, confetti, goo, drop, pluck, cloth (Spicy), fireworks, blackhole (Spicy), flock, lightning (Spicy), smoke (Spicy), filings.
- Shapes (10): overprint, halftone, tilt, kaleido, morph, moire, tunnel (Spicy), lava, fold, glitch (Spicy).
- Interface (6): magnetic, countdown, trail, curtain, jelly, loaders.
- Safety: anything that flashes (neon, lightning, glitch, fireworks) never flashes more than 3 times per second, with no large full-screen flashes.
- The first six (particles, elastic, velocity, ripple, flow, warp) are ported from reference/peak-prototype.html and must match it (section 11). Drop, pluck, overprint and halftone came from an earlier demo and were adopted on purpose.

## 5. Color: 16 worlds that are always changing
Original names only. Never use film or brand names (like Barbie or Dune) in the UI, URLs, metadata or prompts. There's a test for this.
- Dreamhouse (light): ground #FFE3F1, surface #FFF4FA, ink #4A0532, inkSoft #8A2B66, accents #FF1F8E #1FA9DB #FFC21A
- Spice Dunes (light): #E8C9A0, #F3DDBE, #2A1405, #5E3517, accents #D9561A #8C2F14 #2F6FA3
- Doomsday (dark): #1E1412, #2B1D19, #F1E6DC, #BFAEA1, accents #FF3B1F #FF9F1C #B5E61D
- Abyss (dark): #021B2E, #06293F, #DDF7FF, #93BFD3, accents #00E6D2 #8B7DFF #FF5FC8
- Glacier (light): #E6F2F8, #F4FAFD, #0B2A3C, #3D5F73, accents #1679BF #2BA7D6 #E64545
- Neon Arcade (dark): #1B0A33, #2A1250, #FFF0FB, #CDB0EA, accents #FF2E97 #00D9FF #FFE14D
- Matcha (light): #ECF1DC, #F6F9EC, #1D3321, #47604B, accents #3F8A22 #D98A1F #D0473F
- Riso, light and dark (content pages; follows the system setting): light #F4F2FF, #FFFFFF, #1A1240, #4E4777, accents #EC1C7F #2A47EA #FF7A00 / dark #160E44, #21185A, #F4F1FF, #BDB5EA, accents #FF4FA3 #3EE6D0 #FFD23F
- Aurora (dark): #06161A, #0C2329, #E8FFF8, #9CC9BE, accents #3DF5A8 #6C7BFF #E66CFF
- Lava Lamp (dark): #240B1C, #34112A, #FFEDE3, #E0AFA0, accents #FF5A1F #FF2E88 #FFC23D
- Vapor Mall (light): #F6E8FF, #FDF6FF, #2B1240, #6A4C86, accents #FF71CE #01CDFE #B967FF
- Blueprint (dark): #0B2A5B, #12376F, #F0F6FF, #A9C3EA, accents #7FD3FF #FFD447 #FF7A59
- Golden Hour (light): #FFE8CC, #FFF3E3, #3A1A0A, #7A4A2A, accents #FF8A3D #D9467A #7B5CD6
- Cherry Cola (dark): #2A0A0E, #3A1015, #FFF1E6, #E3B5AC, accents #E8203A #FFB38A #FFE9C7
- Newsprint (light): #ECECEA, #F7F7F5, #111111, #4A4A4A, accents #E3001B #111111 #8C8C8C
- Toxic (dark): #10140A, #1A2010, #F1FFD9, #B5C99A, accents #B6FF1A #FF6A00 #9B5CFF
(Order for each: ground, surface, ink, inkSoft, then accents c1 c2 c3. The source of truth is src/theme/worlds.ts.)

How the color keeps changing:
- Home journey: 12 featured animations, each in its own world, blending on scroll in OKLab with smootherstep. It starts Dreamhouse, then Spice Dunes, then Doomsday, then the order Claude Code proposed, which I approved. There's a world rail on the right.
- Tour (/tour): all 50 back to back, blending between each one. Shuffle order and Autoplay (12 seconds per animation, stops as soon as I touch anything). At most 2 animations run at once.
- Living colors: the accents drift about ±12° of hue over a 30-second loop. Header toggle, on by default. Stops when paused. Text colors never drift.
- Scene pages: Shuffle world and Cycle worlds. Gallery: every tile is shown in its own world.
- Contrast: text always passes through ensureContrast (at least 4.5:1 for ink and inkSoft, 3:1 for accent display text) at every blend step. The canvas blend mode depends on how light the ground is: multiply if it's light, lighter if it's dark, source-over in between.

## 6. Tech
- Astro (static output) with TypeScript strict. TypeScript is pinned to 6.0.3 because 7 doesn't work with astro check yet. @astrojs/check was approved and added to the allowlist. Plain CSS with custom properties. No UI framework and no animation, physics or color libraries.
- Allowlist: astro, @astrojs/check, @astrojs/mdx, @astrojs/sitemap, @astrojs/rss, typescript, vitest, @playwright/test, prettier, prettier-plugin-astro, plus @vercel/analytics only if Vercel's docs say it's needed. Pin exact versions. Ask me before adding anything else.
- Architecture: one requestAnimationFrame loop for the whole site (the scheduler), and only on-screen scenes run. Every scene implements the interface in src/scenes/types.ts (resize, update, still, setParams, setTheme, restart, destroy). Controls are generated from each scene's settings. The theme store publishes colors, and scenes never call getComputedStyle per frame. Color math (OKLab, contrast, ensureContrast) lives in src/theme/color.ts. The prompt builder is pure and deterministic. Canvas pixel density is capped at 2. Physics uses f = min(dt × 60, 2.5).
- Shared kits (build once, reuse): a text kit (text to points, letter boxes, paths), a physics kit (circles with a spatial hash, rigid boxes, springs, verlet rope and cloth), a field kit (noise, flow fields, low-res fluid), a render kit (batched dots, lines and trails, metaballs), and easing.
- Tests: Vitest unit tests and Playwright end-to-end tests on desktop (1280×800) and phone (390×844).
- Commands: npm run dev, build, preview, check (astro check + tsc + prettier + vitest), test:e2e, format. Shortcuts in .claude/commands: /next, /check, /new-scene, /new-world.

## 7. Decisions already made (don't reopen these)
- Host: Vercel, code on GitHub (public repo "peak"). Domain: none for now; use the vercel.app address, which is also PUBLIC_SITE_URL.
- noindex and a disallow-all robots.txt until launch.
- Analytics: Vercel Web Analytics for page views. Turn on custom events only if they're free on the Hobby plan; otherwise track() stays a no-op. No cookies, no personal data.
- Feedback: no form. "It didn't work" shows "Thanks, noted" and a link to /fix.
- Wave 1 choices approved: stand-ins on the home page until the real scenes arrive, reading the particle settings as scales on the prototype's numbers, the contrast-checked accent text color on the third marquee row, the new trail fading in flow, and committing straight to main.
- Never turn on anything paid, buy a domain, or deploy anything other than the normal push to main without asking me.

## 8. How we got here
1. In a chat, we built a single-file prototype with six animations (now reference/peak-prototype.html).
2. We decided the site needed a point: bridging the gap between people and Claude Code. Then we wrote CLAUDE.md, docs/PRD.md, docs/PLAN.md, docs/DECISIONS.md and the four commands.
3. Setup: TypeScript pinned to 6.0.3, @astrojs/check added.
4. A mistake to remember: one session went off-plan and published a standalone demo ("Six small machines") as "the final site". It was corrected. The deliverable is always this Astro project, never a standalone demo.
5. The scope grew to 50 animations, 16 worlds, the Tour, living colors, and shared kits, recorded in docs/PRD.md, docs/SCENES.md and a rewritten docs/PLAN.md built around Waves 1–9.
6. Wave 1 was finished: the 16 worlds, color math, the home journey with 12 sections, the world rail, living colors, the six ported scenes, the header, footer and placeholder pages, and the engine. It ended with 64 unit tests and 92 end-to-end tests, all passing.
7. GitHub and Vercel were set up. The site went live at https://peak-teal.vercel.app/.
8. I noticed the hero "peak" on the live site doesn't match the prototype. That proves the whole point: describing motion is hard, even with the source code. So I asked for two things, and they were in progress at the handoff (about 8 hours of work were estimated):
   - Part 1, parity: make the hero match the prototype, prove it with a permanent parity test, do the same for the other five ported scenes, and prove the particles prompt can rebuild it in a fresh session.
   - Part 2, sharpen the point: the new headline, every number as a slider (with an Advanced group), prompts that include all non-default values, and a test that every number affecting the output is either a setting or a listed constant with a reason.
9. Usage ran low on the old account, so we're continuing here.

## 9. What to do next, in order
1. Read docs/HANDOFF.md and the git log to find exactly where Part 1 and Part 2 stopped. Finish them.
2. Then continue docs/PLAN.md wave by wave. If PLAN.md's numbering differs from this list, follow PLAN.md.
   - Wave 2: scene pages, the playground, the prompt builder, Shuffle and Cycle worlds.
   - Wave 3: shared kits, then text scenes 4–13.
   - Wave 4: text scenes 14–20.
   - Wave 5: physics scenes 24–34.
   - Wave 6: shape scenes 35–44.
   - Wave 7: interface scenes 45–50.
   - Wave 8: gallery, Tour, guides, word bank, drops, About.
   - Wave 9: polish, performance, accessibility, launch, and the friend-test kit.
3. Don't wait for me at checkpoints. Only stop for things only I can do: logins, About details, anything that costs money, and scope changes.

## 10. Working rules (including how to save my usage)
- Follow CLAUDE.md. Work one step at a time, tick the box in PLAN.md, log decisions in DECISIONS.md, and commit after each step.
- Keep docs/HANDOFF.md up to date at the end of every step: current step, status, next actions, and anything waiting on me. That's what makes switching accounts seamless. If I say "wrap up", or if you notice usage running low, stop at a clean point, update HANDOFF.md, commit and push.
- Save usage: read only the PRD and SCENES sections a step needs. Run unit tests while working, the full suite at the end of each step, and the full end-to-end suite plus a deploy at the end of each wave. Only take screenshots to check visual changes, and don't loop on them.
- Never publish standalone demos or artifacts as "the site".
- Don't invent facts, names or bios. Use clearly marked placeholders.
- Copy should be plain, second person and sentence case. Buttons say exactly what happens. Nothing may flash more than 3 times per second. Every scene has a still frame for reduced motion, supports pause, cleans up completely, and works with touch without blocking scrolling.

## 11. How to check and ship
Parity method (for the six ported scenes):
- Compare reference/peak-prototype.html and our scene side by side in Playwright at 1280×800 and 390×844.
- Use the same seeded random numbers on both pages (override Math.random with addInitScript), Riso light with living colors off, and the Anybody font fully loaded.
- Take screenshots mid-intro and after the dots settle. They must differ by less than 2% of pixels after settling, and the motion must feel the same.
- Hero facts to check: Anybody at weight 900 with fontStretch 'expanded' (set again after every font change), size min(H×0.46, W×0.42) fitted to 82% of the width (92% under 700px), centered at 43% of the height (40% under 700px), sampling gap starting at max(3, round(size/80)) with alpha threshold 140, at most 3,800 dots (1,700 under 700px), round dots with radius gap × 0.32 to 0.54, springs 0.02 to 0.055, damping 0.86, cursor reach clamp(W×0.16, 70, 150), cursor push (1 − d/R)² × 9, and the intro starting from random positions with velocities of ±6.

Prompt test (every scene, logged in docs/PROMPT_TESTS.md):
- Give the scene's default prompt (Detailed + New page + I'm new) to a fresh subagent working in an empty temporary folder with no access to this repo.
- Render its result under the same seeded conditions and compare it to our scene. If it fails, fix the scene's phrases or meta and retest once.
- If usage is tight: test all Spicy scenes plus one easy scene per wave, and list the untested ones for me.

End of every wave:
- Full test suite passes, push to main, wait for the Vercel deploy, run the smoke tests against the live URL.
- If a deploy fails, read the build log, fix it, and push again.
- Send me a short update with the live link and three things to try on my phone.

About page: when you get there, ask me in one message for my name, a one-line bio, what I'm looking for, a contact link, and social links. Keep working on other steps while you wait. If I haven't answered by launch, leave clearly marked placeholders and list them.

Launch (end of Wave 9):
- Remove noindex and the disallow rule, and make sure the sitemap and canonical URLs use the live address.
- Make sure OG images exist for every scene and the home page.
- Record Lighthouse scores in DECISIONS.md and fix anything below the PRD budgets.
- Write docs/TESTING_WITH_FRIENDS.md: a 60–90 minute script where testers find an animation, tweak it, build it with Claude Code, and put it online, plus notes templates and a 5-question survey.
- Run the full end-to-end suite against the live site.
- Send me a final report: the live link, what's done, any failed prompt tests, any placeholders left, and anything I still need to do.

---

# Update 1

Status update since the handoff prompt was written. This replaces section 9, step 1.

## Where we are
- Part 1 (parity) and Part 2 (sharpening) are done. Waves 1–5 are done. Wave 6 steps 6.1 (overprint) and 6.2 (halftone) are done. docs/HANDOFF.md has the details.
- npm run check passes. The full e2e suite passes except the prompt tests for flow, warp, marbles and skid.
- Half-done then: cloth and smoke prompt-test pages not compared; goo retest.
- The Wave 5 wrap-up wasn't done: deploy, live tests, owner update.

## Next, in order
1. Compare cloth, smoke and goo, and log the results.
2. Finish the Wave 5 wrap-up.
3. Continue Wave 6: 6.3 tilt, 6.4 kaleido, 6.5 morph, 6.6 moiré with its flash test. Then keep going through the plan.

## Owner's answers
1. No third retest of flow, warp, marbles and skid yet. First, using the outputs already there (no new runs), explain why each one failed, in one or two lines each: was the look or behavior actually wrong (colors, size, density, speed, how it reacts to clicks and holds), or did it only fail because random numbers and timing differ?
2. Change the pass rule for prompt tests, but not for parity tests (ours vs the prototype stays pixel-based). A prompt test passes when the fresh build matches on things you can measure: the same palette, element counts within ±10%, speeds and settle times within ±20%, the same reaction to every interaction, and the same layout. Add a side-by-side screenshot for the owner to judge by eye. Write this rule into docs/PRD.md and docs/PROMPT_TESTS.md, then re-judge all previous prompt tests with it using the outputs already there, without new runs.
3. After that, only retest scenes that fail because of a real difference in look or behavior. Fix their phrases first, then retest one scene to confirm the fix works before retesting the rest. Tell the owner the estimated token cost before any retest over 100k tokens.
4. Fix the flaky drop test properly: give the scheduler a test mode with a fixed 1/60s timestep and seeded randomness, so physics runs the same every time. Unskip the drop test and use this mode in all parity tests.
5. About page: the owner will send details when step 8.14 is reached.
6. Friend test: later, as planned.

7. Project folder moved on 2026-10-17: it is now ~/peak (was ~/Documents/peak). Open Claude Code in ~/peak.
