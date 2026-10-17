import type { SceneMeta } from '../types';

export const meta: SceneMeta = {
  slug: 'goo',
  title: 'Gooey blobs',
  summary: 'Colored blobs orbit and melt into each other. One follows your cursor.',
  useCase: 'A playful background or menu.',
  tags: ['Backgrounds', 'Just for fun'],
  difficulty: 'Easy',
  minutes: 15,
  world: 'dreamhouse',
  terms: ['spring', 'damping', 'transform'],
  howItWorks: [
    'The blobs are plain circles, blurred together by an SVG filter and then sharpened again.',
    'Where two blurs overlap, the sharpening joins them, so close blobs melt into one gooey shape.',
    'Blobs circle the middle on their own oval paths, moved only with a **transform**, which keeps it smooth.',
    'One blob chases your cursor on a **spring**, and **damping** settles it.',
  ],
  whatElse: [
    'A playful background behind a hero.',
    'A menu whose items melt together on hover.',
    'A gooey loading indicator.',
  ],
  wants:
    'Colored blobs orbit slowly and melt into each other when they touch. One blob follows my cursor on a spring and merges with whatever it passes. A click drops a new blob.',
  lookLines: ['Blobs are filled in their accent color. Keep a visually hidden description for screen readers; the SVG is aria-hidden.'],
  behaviorLines: [
    'Run one requestAnimationFrame loop. dt = seconds since the last frame, clamped to 0.05; f = min(dt × 60, 2.5); t = seconds the loop has run (the sum of dt).',
    'Reduced-motion still frame: every blob where its orbit puts it at t = 2.4s.',
  ],
  interactionLines: ['The SVG has touch-action: pan-y.'],
};
