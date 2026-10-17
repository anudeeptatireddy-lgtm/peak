import type { SceneMeta } from '../types';

export const meta: SceneMeta = {
  slug: 'overprint',
  title: 'Overprint blobs',
  summary: 'Three ink blobs chase your cursor on springs and mix where they overlap.',
  useCase: 'A bold, playful hero background.',
  tags: ['Backgrounds', 'Landing pages'],
  difficulty: 'Easy',
  minutes: 15,
  world: 'riso',
  terms: ['spring', 'damping', 'blend-mode', 'stagger'],
  howItWorks: [
    'Each blob is tied to a point near the cursor by its own **spring**, from snappy to lazy, with **damping** so it settles instead of bouncing forever.',
    'The three target points sit on a small triangle that slowly turns, so the blobs never stack exactly.',
    'Each blob’s edge wobbles with two sine waves, and it stretches along the way it’s moving when it moves fast.',
    'Where blobs overlap, their inks mix through a **blend mode**; a click makes them jump one after another, a short **stagger**.',
  ],
  whatElse: [
    'A playful hero behind a big headline.',
    'A "say hi" section where the blobs follow you to the button.',
    'A loading screen while a page gets ready.',
  ],
  wants:
    'Three big ink blobs that chase my cursor, each on a spring of a different speed, arranged in a slowly turning triangle. Where they overlap the inks mix into new colors. Fast movement stretches them in the direction they travel, a click makes them jump in a quick staggered pulse, and when I leave them alone they wander.',
  lookLines: ['Size the canvas for devicePixelRatio (capped at 2) and do all math in CSS pixels.'],
  behaviorLines: [
    'Run one requestAnimationFrame loop. dt = seconds since the last frame, clamped to 0.05; f = min(dt × 60, 2.5); t = seconds the loop has run (the sum of dt).',
    'The blobs start (once, on the first resize) at x = width × (0.48 + i × 0.07), y = height × (0.42 + (i mod 2) × 0.05), at rest, scale 1.',
    'Reduced-motion still frame: the blobs where they start, overlapping in a trefoil, at t = 0.',
  ],
  interactionLines: ['The canvas has touch-action: pan-y, so vertical swipes still scroll.'],
};
