import type { SceneMeta } from '../types';
import { FIXED } from './constants';

export const meta: SceneMeta = {
  slug: 'fogged',
  title: 'Fogged bottle',
  summary:
    'Wipe a pane of fogged glass to reveal a colorful scene and a name, while beads run down and the fog creeps back.',
  useCase: 'A perfume, skincare or drinks brand reveal.',
  tags: ['Reveals', 'Brands'],
  difficulty: 'Medium',
  minutes: 30,
  world: 'aurora',
  terms: ['blend-mode', 'lerp', 'opacity'],
  howItWorks: [
    'Behind the glass is a colorful picture with your name on it. In front is a blurred, whitened copy of the same picture: the fog.',
    'The fog has an amount for every small square of the screen. Moving the cursor sets the amount to zero in a soft circle around it, which lets the sharp picture show through, using **opacity** to blend the two.',
    'Every frame the fog creeps back, fastest next to fog that is still thick, so a wiped patch refills from its edges.',
    'Now and then a bead forms where you wiped and runs down, clearing a thin line as it goes.',
  ],
  whatElse: [
    'A reveal for a perfume or skincare brand.',
    'A steamy-window hero for a spa or a tea shop.',
    'A scratch-to-reveal for a drinks launch.',
  ],
  wants:
    'A pane of fogged glass over a colorful scene with a name on it. My cursor wipes the fog away in a soft trail, revealing sharp color and the name. Small beads form where I wipe and sometimes run down. Over a few seconds the fog creeps back in from the edges of each wiped area.',
  lookLines: ['Size the canvas for devicePixelRatio (capped at 2) and do all math in CSS pixels.'],
  behaviorLines: [
    'Run one requestAnimationFrame loop. dt = seconds since the last frame, clamped to 0.05.',
    `Reduced-motion still frame: all fog, except one band across the middle (wiped from ${FIXED.STILL_BAND[1] * 100}% to ${FIXED.STILL_BAND[2] * 100}% of the width at ${FIXED.STILL_BAND[0] * 100}% of the height, at the wipe width), and two drips: at ${FIXED.STILL_DRIPS.map((d) => `${d[0]! * 100}% of the width, run ${d[1]! * 100}% of the height down from the band`).join(' and at ')}, each with its clear line and bead.`,
  ],
  interactionLines: [
    'The stage has touch-action: pan-y, so vertical swipes still scroll; dragging a finger sideways wipes.',
  ],
};
