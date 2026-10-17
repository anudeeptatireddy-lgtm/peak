import type { SceneMeta } from '../types';
import { FIXED } from './constants';

export const meta: SceneMeta = {
  slug: 'trail',
  title: 'Cursor trail',
  summary: 'A glowing ribbon follows your cursor, curling behind it and tapering at the tail.',
  useCase: 'A portfolio that feels alive under your hand.',
  tags: ['Portfolio', 'Just for fun'],
  difficulty: 'Easy',
  minutes: 10,
  world: 'abyss',
  terms: ['lerp', 'trail', 'blend-mode'],
  howItWorks: [
    'The trail is a chain of points. The first point chases the cursor, and each point chases the one in front of it, using a **lerp** so every point glides.',
    'Because each point lags a little behind the last, the chain curls and swings like a tail, and it catches up when you stop.',
    'The ribbon is a smooth curve through the points that gets thinner toward the tail, coloured by blending through the three accents.',
    'When nobody is pointing, the head swims around on its own.',
  ],
  whatElse: [
    'A cursor effect for a portfolio or studio site.',
    'A playful background that reacts to touch.',
    'A loading animation that swims around the screen.',
  ],
  wants:
    'A glowing ribbon follows my cursor, curling smoothly behind it and tapering at the tail. When I stop, the tail catches up and coils. When I leave it alone it swims around by itself. My normal cursor stays visible.',
  lookLines: ['Size the canvas for devicePixelRatio (capped at 2) and do all math in CSS pixels.'],
  behaviorLines: [
    'Run one requestAnimationFrame loop. dt = seconds since the last frame, clamped to 0.05; f = min(dt × 60, 2.5); t = seconds the loop has run (the sum of dt).',
    `Reduced-motion still frame: run the swimming ${FIXED.STILL_FRAMES} frames at f = 1 and dt = 1/60 from the start, then draw the trail.`,
  ],
  interactionLines: [
    'The stage has touch-action: pan-y, so vertical swipes still scroll; dragging a finger sideways leads the trail, otherwise it swims.',
  ],
};
