import type { SceneMeta } from '../types';

export const meta: SceneMeta = {
  slug: 'rubber',
  title: 'Rubber letters',
  summary: 'Big soft letters. Grab one and pull: it stretches, then snaps back and wobbles.',
  useCase: 'A playful headline that begs to be touched.',
  tags: ['Just for fun', 'Headlines'],
  difficulty: 'Medium',
  minutes: 25,
  world: 'lava',
  terms: ['spring', 'damping', 'transform', 'lerp'],
  howItWorks: [
    'Each letter has a stretch: how far, and in which direction, it is being pulled.',
    'Drawing the letter stretched is one **transform**: longer along the pull and a little thinner across it.',
    'While you hold it, the stretch eases toward your pointer (a **lerp**).',
    'Let go and a **spring** pulls the stretch back to zero; it overshoots, and **damping** settles the wobble.',
  ],
  whatElse: [
    'A playful headline on a kids’ or toy brand page.',
    'Buttons that stretch toward the cursor before you click.',
    'A logo you can pull and let snap back.',
  ],
  wants:
    'Big, soft letters. When I grab one and pull, it stretches like rubber toward my pull. When I let go it snaps back and wobbles until it settles.',
  lookLines: [
    'A full-screen canvas (100svh, at least 540px), transparent, cleared every frame. Size it for devicePixelRatio (capped at 2) and do all math in CSS pixels.',
  ],
  behaviorLines: [
    'Run one requestAnimationFrame loop. dt = seconds since the last frame, clamped to 0.05; f = min(dt × 60, 2.5).',
    'Lay the word out again on every resize and once the Anybody font has finished loading.',
    'Reduced-motion still frame: every letter at rest except the middle one (index floor(count ÷ 2)), caught mid-wobble with V pointing straight up at 0.35 × max stretch × font size.',
  ],
  interactionLines: [
    'Press on a letter (inside its box) to grab it: a mouse at once, a finger after holding still for 0.25s, so swipes still scroll (touch-action: pan-y). Release lets go. Draw the held letter last.',
  ],
};
