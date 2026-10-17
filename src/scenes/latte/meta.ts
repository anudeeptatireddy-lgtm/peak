import type { SceneMeta } from '../types';
import { FIXED } from './constants';

export const meta: SceneMeta = {
  slug: 'latte',
  title: 'Latte pour',
  summary:
    'Look down into a cup as a thin stream of milk blooms into foam and draws a name in latte-art strokes.',
  useCase: 'A café brand intro.',
  tags: ['Brands', 'Intros'],
  difficulty: 'Spicy',
  minutes: 40,
  world: 'dunes',
  accessible: true,
  terms: ['lerp', 'easing', 'frame-rate'],
  howItWorks: [
    'The coffee is a grid of tiny squares, each remembering how much white foam sits on it.',
    'A thin stream of milk lands at the center and lays foam in a soft blob, plus a few rings that spread outward like a bloom.',
    'Then the landing spot zigzags through the letters of your name, laying foam as it goes, which is how a barista fills a shape.',
    'When the stream lifts, the foam slowly spreads into its neighbors, so the edges soften and settle.',
  ],
  whatElse: [
    'An intro for a café, a roastery or a coffee subscription.',
    'A reveal for a dessert or a drinks menu.',
    'A loading animation that pours your name.',
  ],
  wants:
    'Looking straight down into a cup of dark coffee with a speckled, tiger-striped crema, a thin stream of milk pours in from the top edge. Where it lands white foam blooms in soft rings, then the stream drags through the surface, filling the letters of a name in loose latte-art strokes. The stream lifts away and the foam settles, edges softening. The cup turns a few degrees toward the cursor.',
  lookLines: ['Size the canvas for devicePixelRatio (capped at 2) and do all math in CSS pixels.'],
  behaviorLines: [
    'Run one requestAnimationFrame loop. dt = seconds since the last frame, clamped to 0.05; f = min(dt × 60, 2.5); t = seconds since the pour started.',
    `Reduced-motion still frame: run the whole pour and the ${FIXED.SETTLE}s of settling at 60 frames a second, then draw: the finished latte art with ${FIXED.STEAM_CURLS} faint curls of steam above the cup (wavy lines rising to ${FIXED.STEAM_H} × R above the cup, in the main text color at ${FIXED.STEAM_ALPHA} opacity).`,
  ],
  interactionLines: [
    'The stage has touch-action: pan-y, so vertical swipes still scroll. On phones the cup can turn with the device tilt after a tap on "Use motion".',
  ],
};
