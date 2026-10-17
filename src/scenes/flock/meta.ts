import type { SceneMeta } from '../types';

export const meta: SceneMeta = {
  slug: 'flock',
  title: 'Flock',
  summary: 'Hundreds of birds swirl in flocks and scatter away from your cursor.',
  useCase: 'A calm, alive background for a landing page.',
  tags: ['Backgrounds', 'Just for fun'],
  difficulty: 'Medium',
  minutes: 25,
  world: 'aurora',
  terms: ['velocity', 'lerp'],
  howItWorks: [
    'Each bird only looks at the birds close to it, found quickly with a grid of cells instead of checking every pair.',
    'It follows three rules: keep a little personal space, fly the same way as its neighbors (match their **velocity**), and drift toward the middle of its group.',
    'Each rule nudges its heading a little every frame, a bit like a **lerp** toward where the rules want it to go, so turns stay smooth.',
    'Your cursor counts as a predator: birds near it steer away, and the flock closes up again behind it.',
  ],
  whatElse: [
    'A calm background behind a landing-page headline.',
    'A school of fish for an ocean or travel site.',
    'A "we work together" visual for a team or about page.',
  ],
  wants:
    'Hundreds of small arrow-shaped birds swirling across the whole screen in flocks: they keep their distance, line up with their neighbors and stick together. My cursor is a predator: they scatter away from it and regroup behind it.',
  lookLines: [
    'A full-screen canvas (100svh, at least 540px), transparent over the background and cleared every frame. Size it for devicePixelRatio (capped at 2) and do all math in CSS pixels.',
  ],
  behaviorLines: [
    'Run one requestAnimationFrame loop. dt = seconds since the last frame, clamped to 0.05; f = min(dt × 60, 2.5).',
    'Place the birds again on every resize.',
    'Reduced-motion still frame: the flock after 240 frames of flocking with f = 1 and no pointer.',
  ],
  interactionLines: ['The canvas has touch-action: pan-y, so vertical swipes still scroll.'],
};
