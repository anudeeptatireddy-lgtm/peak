import type { SceneMeta } from '../types';

export const meta: SceneMeta = {
  slug: 'filings',
  title: 'Iron filings',
  summary: 'Thousands of iron filings turn to trace the field of a magnet that follows your cursor.',
  useCase: 'A science-y or "drawn to you" background.',
  tags: ['Backgrounds', 'Just for fun'],
  difficulty: 'Medium',
  minutes: 20,
  world: 'toxic',
  terms: ['lerp', 'blend-mode'],
  howItWorks: [
    'A bar magnet is two poles, north and south; each pushes or pulls with a strength that falls off with the square of the distance.',
    'At every filing the pulls of all the poles are added up, which gives the direction of the field there.',
    'Each filing turns a little of the way toward that direction every frame (a **lerp** of its angle), so the lines settle smoothly instead of snapping.',
    'Filings in a strong field are drawn in a brighter color, so the area around the poles glows; they are drawn as short lines in a few batches with a **blend mode**.',
  ],
  whatElse: [
    'A science or physics course landing page.',
    'A "drawn to you" background for a dating or community site.',
    'A hero where the field gathers around the sign-up button.',
  ],
  wants:
    'Thousands of tiny iron filings scattered across the screen. A magnet follows my cursor and the filings turn to trace its field lines, glowing brighter near the poles. Clicking leaves a magnet behind, so I can build up a pattern with a few magnets.',
  lookLines: [
    'A full-screen canvas (100svh, at least 540px), transparent over the background and cleared every frame. Size it for devicePixelRatio (capped at 2) and do all math in CSS pixels.',
  ],
  behaviorLines: [
    'Run one requestAnimationFrame loop. dt = seconds since the last frame, clamped to 0.05; f = min(dt × 60, 2.5).',
    'Scatter the filings again on every resize; magnets stay.',
    'Reduced-motion still frame: only the cursor magnet, in the middle, pointing right, after 120 frames of turning with f = 1.',
  ],
  interactionLines: ['The canvas has touch-action: pan-y, so vertical swipes still scroll.'],
};
