import type { SceneMeta } from '../types';

export const meta: SceneMeta = {
  slug: 'neon',
  title: 'Neon sign',
  summary: 'A neon sign that buzzes on letter by letter, glows, and flickers now and then.',
  useCase: 'A café, bar or late-night event page.',
  tags: ['Headlines', 'Events'],
  difficulty: 'Spicy',
  minutes: 25,
  world: 'arcade',
  terms: ['blend-mode', 'stagger', 'opacity', 'reduced-motion'],
  howItWorks: [
    'Each letter is drawn as an outline, the glass tube, with a hot, almost white core.',
    'The halo is the same outline drawn several times, wider and fainter each time, added together with a **blend mode** that makes light brighter where it overlaps.',
    'Letters warm up one after another (a **stagger**), and now and then a single letter dips in **opacity**.',
    'Flickers are capped at three a second and never touch the whole sign; with **reduced motion** there is no flicker at all.',
  ],
  whatElse: [
    'A café or bar homepage sign.',
    'An "open" badge that lights up during opening hours.',
    'A late-night event title.',
  ],
  wants:
    'A neon-tube sign. The tubes buzz on letter by letter with a short, gentle flicker, then glow steadily with a soft halo. Now and then one letter dims briefly and comes back. Hovering a letter makes it glow brighter.',
  lookLines: [
    'A full-screen canvas (100svh, at least 540px), transparent, cleared every frame. Size it for devicePixelRatio (capped at 2) and do all math in CSS pixels. Keep the sign text in a visually hidden element for screen readers.',
  ],
  behaviorLines: [
    'Run one requestAnimationFrame loop. dt = seconds since the last frame, clamped to 0.05; f = min(dt × 60, 2.5); t = seconds the loop has run (the sum of dt).',
    'Lay the sign out again on every resize and once the Anybody font has finished loading.',
    'Reduced-motion still frame: the sign fully lit, no flicker.',
  ],
  interactionLines: [
    'The canvas has touch-action: pan-y. A tap (on release) on a letter brightens it.',
  ],
};
