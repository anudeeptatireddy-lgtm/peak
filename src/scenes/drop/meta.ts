import type { SceneMeta } from '../types';

export const meta: SceneMeta = {
  slug: 'drop',
  title: 'Ink-ball pile',
  summary: 'Balls in three inks fall in and pile up. Tap to drop another; shove the pile around.',
  useCase: 'A playful footer or a "drop us a line" contact section.',
  tags: ['Just for fun', 'Backgrounds'],
  difficulty: 'Medium',
  minutes: 20,
  world: 'cherry',
  terms: ['gravity', 'momentum', 'blend-mode', 'frame-rate'],
  howItWorks: [
    'Every ball falls with **gravity** and bounces off the floor, the walls and the other balls.',
    'When two balls overlap they are pushed apart, and if they are moving toward each other they trade **momentum**: heavier balls push lighter ones more.',
    'Each frame runs the physics three times in smaller steps, which keeps the pile steady at any **frame rate**.',
    'Where balls overlap, their inks mix with a **blend mode**, like overprinted ink.',
  ],
  whatElse: [
    'A "drop us a line" contact section where every message adds a ball.',
    'A footer that fills up as you scroll.',
    'A tip jar where every tip drops in a coin.',
  ],
  wants:
    'Balls in three inks fall in and pile up at the bottom, their colors overprinting where they overlap. Tapping drops another ball where I tap. Moving through the pile shoves it around and it settles again.',
  lookLines: [
    'Size the canvas for devicePixelRatio (capped at 2) and do all math in CSS pixels.',
    'Draw balls as circles in their accent color, one path per accent (skipping any still above the top), using the blend mode above.',
  ],
  behaviorLines: [
    'Run one requestAnimationFrame loop. dt = seconds since the last frame, clamped to 0.05; f = min(dt × 60, 2.5).',
    'On resize, recompute the sizes and floor, and keep each ball inside the side walls. The starting balls are made once, on the first resize.',
    'Reduced-motion still frame: the balls where they are.',
  ],
  interactionLines: ['The canvas has touch-action: pan-y.'],
};
