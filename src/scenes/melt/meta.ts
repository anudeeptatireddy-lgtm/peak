import type { SceneMeta } from '../types';

export const meta: SceneMeta = {
  slug: 'melt',
  title: 'Melting text',
  summary: 'A big word that slowly sags and drips like hot wax. Hover a letter to cool it.',
  useCase: 'A summer event poster or a surreal portfolio headline.',
  tags: ['Headlines', 'Events'],
  difficulty: 'Medium',
  minutes: 20,
  world: 'golden',
  terms: ['gravity', 'lerp', 'variable-font'],
  howItWorks: [
    'The word is drawn once on a hidden canvas, then copied onto the screen in thin vertical strips.',
    'Each strip has its own melt amount, and a strip is stretched further down the more it has melted.',
    'Neighboring strips melt at slightly different speeds, which makes the wax look uneven.',
    'Your cursor cools nearby strips: their melt eases back to zero (a **lerp**), and drops of wax fall with **gravity**.',
  ],
  whatElse: [
    'A summer festival poster whose title melts in the heat.',
    'A "this site is under construction" page that slowly melts.',
    'A portfolio headline that hardens when you hover it.',
  ],
  wants:
    'A big word that slowly sags and drips like hot wax: thin vertical strips of each letter stretch downward at different rates, and drops form and fall. Moving my cursor over a letter cools it: it snaps back up and hardens, then slowly starts melting again.',
  lookLines: [
    'A full-screen canvas (100svh, at least 540px), transparent, cleared every frame. Size it (and the hidden canvas) for devicePixelRatio (capped at 2) and do all math in CSS pixels.',
  ],
  behaviorLines: [
    'Run one requestAnimationFrame loop. dt = seconds since the last frame, clamped to 0.05; f = min(dt × 60, 2.5).',
    'Draw the word on the hidden canvas again (and rebuild the strips, all solid) on every resize, once the Anybody font has finished loading, and when the main text color changes.',
  ],
  interactionLines: ['Listen for pointer events on the canvas, which has touch-action: pan-y.'],
};
