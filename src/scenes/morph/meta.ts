import type { SceneMeta } from '../types';
import { FIXED } from './constants';
import { FORMULAS } from './shapes';

export const meta: SceneMeta = {
  slug: 'morph',
  title: 'Shape morph',
  summary:
    'A shape melts into the next with a jelly overshoot, in inks that follow slightly out of step.',
  useCase: 'A friendly hero or a logo-like animation.',
  tags: ['Hero', 'Logos'],
  difficulty: 'Medium',
  minutes: 20,
  world: 'matcha',
  terms: ['easing', 'lerp', 'blend-mode'],
  howItWorks: [
    'Every shape is drawn as the same number of points around its outline, always starting at the top and going clockwise.',
    'To change shape, each point slides in a straight line to the matching point of the next shape, using a **lerp**.',
    'An **easing** curve decides how the slide feels: smooth, bouncy (it overshoots and settles like jelly) or snappy.',
    'Up to three inks draw the shape, each a little behind the one before, and they overlap through a **blend mode**.',
  ],
  whatElse: [
    'A friendly hero animation for a kids or education site.',
    'A logo that changes shape to show different features.',
    'A loading animation that turns into the finished icon.',
  ],
  wants:
    'A big shape in the middle of the page that smoothly melts into the next shape (circle, star, heart, blob and around again) with a jelly overshoot each time. Up to three inks draw it, following slightly out of step. A click or tap skips to the next shape.',
  lookLines: [
    'Size the canvas for devicePixelRatio (capped at 2) and do all math in CSS pixels.',
    ...FORMULAS,
  ],
  behaviorLines: [
    'Run one requestAnimationFrame loop. dt = seconds since the last frame, clamped to 0.05; f = min(dt × 60, 2.5); t = seconds the loop has run (the sum of dt).',
    `Reduced-motion still frame: the first shape ${FIXED.STILL_PROGRESS * 100}% of the way into the second, with all inks at the same progress (no lag).`,
  ],
  interactionLines: [
    'The stage has touch-action: pan-y, so vertical swipes still scroll. A click or tap ends the current wait or morph at once and starts morphing to the shape after it.',
  ],
};
