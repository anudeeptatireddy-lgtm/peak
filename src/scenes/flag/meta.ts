import type { SceneMeta } from '../types';

export const meta: SceneMeta = {
  slug: 'flag',
  title: 'Flag text',
  summary: 'A headline printed on a banner that ripples in the breeze. Move to blow a gust.',
  useCase: 'A festival banner or a team or club page.',
  tags: ['Events', 'Headlines'],
  difficulty: 'Medium',
  minutes: 20,
  world: 'matcha',
  terms: ['transform', 'damping', 'blend-mode'],
  howItWorks: [
    'The banner is painted once on a hidden canvas, then copied to the screen in thin vertical strips.',
    'Each strip is shifted up or down by two sine waves added together, growing from still at the pole to most at the free end.',
    'Where the cloth tilts, a thin layer of shadow or light is laid over the strip, so the folds catch the light.',
    'Moving the cursor builds up a gust that makes the waves taller, and **damping** lets it die down again.',
  ],
  whatElse: [
    'A festival banner that waves above the lineup.',
    'A team page with every member’s name on a pennant.',
    'A "we’re hiring" flag on a careers page.',
  ],
  wants:
    'A headline printed on a fabric banner that ripples in a steady breeze, with light and shade following the folds. Moving my cursor blows a gust that sends a stronger wave through the cloth.',
  lookLines: [
    'A full-screen canvas (100svh, at least 540px), transparent, cleared every frame. Size it (and the hidden canvas) for devicePixelRatio (capped at 2) and do all math in CSS pixels.',
  ],
  behaviorLines: [
    'Run one requestAnimationFrame loop. dt = seconds since the last frame, clamped to 0.05; f = min(dt × 60, 2.5); t = seconds the loop has run (the sum of dt).',
    'Paint the hidden banner again on every resize, once the Anybody font has finished loading, and when the colors change.',
    'Reduced-motion still frame: the banner at t = 1.3s, no gust.',
  ],
  interactionLines: ['The canvas has touch-action: pan-y.'],
};
