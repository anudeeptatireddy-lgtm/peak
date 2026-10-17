import type { SceneMeta } from '../types';
import { FIXED } from './constants';

export const meta: SceneMeta = {
  slug: 'lava',
  title: 'Lava lamp',
  summary: 'Soft blobs of wax rise, cool and sink, stretching, merging and splitting.',
  useCase: 'A cozy, retro background.',
  tags: ['Backgrounds', 'Just for fun'],
  difficulty: 'Medium',
  minutes: 20,
  world: 'lava',
  terms: ['blend-mode', 'lerp', 'velocity'],
  howItWorks: [
    'Every blob is a soft ball, and the picture is drawn from the sum of all the balls: where two get close their fields add up and the blobs melt together.',
    'Each blob has a heat. Wax at the bottom heats up and rises, wax at the top cools down and sinks, just like a real lamp, with a bit of drag and **velocity**.',
    'The field is worked out on a coarse grid and scaled up smoothly, which keeps it fast.',
    'Colors are stacked through a **blend mode**: a glowing skirt, the body and a hot core.',
  ],
  whatElse: [
    'A cozy retro background for a music or coffee site.',
    'A calming loop for a meditation page.',
    'A lamp on a "chill" corner of a game menu.',
  ],
  wants:
    'A lava lamp: soft blobs of wax that rise from the bottom, cool and sink, stretching, merging and splitting. A click warms the lamp and sends more blobs up.',
  lookLines: ['Size the canvas for devicePixelRatio (capped at 2) and do all math in CSS pixels.'],
  behaviorLines: [
    'Run one requestAnimationFrame loop. dt = seconds since the last frame, clamped to 0.05; f = min(dt × 60, 2.5); t = seconds the loop has run (the sum of dt).',
    `Reduced-motion still frame: run the simulation ${FIXED.STILL_FRAMES} frames at f = 1 and dt = 1/60 from the starting layout and draw it, so blobs are mid-rise.`,
  ],
  interactionLines: [
    'The stage has touch-action: pan-y, so vertical swipes still scroll; a tap warms the lamp.',
  ],
};
