import type { SceneMeta } from '../types';

export const meta: SceneMeta = {
  slug: 'pluck',
  title: 'Strings',
  summary: 'A row of strings you can strum. Sweep across them and they bend, slip free and ring.',
  useCase: 'An interactive header for a musician, or a playful section divider.',
  tags: ['Landing pages', 'Just for fun'],
  difficulty: 'Easy',
  minutes: 15,
  world: 'aurora',
  terms: ['spring', 'damping', 'stiffness', 'blend-mode'],
  howItWorks: [
    'Each string remembers how far its middle is pushed sideways, and a **spring** pulls it back.',
    'When your pointer crosses a string it grabs it and bends it into a triangle, until you pull too far and it slips free.',
    'Then it rings: it overshoots back and forth, and **damping** makes each swing a little smaller. Tighter strings (more **stiffness**) ring faster.',
    'Ringing strings light up in the accent colors; in dark worlds they glow, layered with a **blend mode** that adds light.',
  ],
  whatElse: [
    'A musician’s homepage header.',
    'A section divider you can strum.',
    'A playful "loading" bar that rings when it fills.',
  ],
  wants:
    'Vertical strings span the screen. Sweeping across them grabs each string in turn; it bends with my pointer until pulled too far, then lets go and rings with a damped vibration. Resting strings are soft gray; ringing ones light up in the accent colors, and in dark worlds they glow. When idle, an invisible hand strums them now and then.',
  lookLines: ['Size the canvas for devicePixelRatio (capped at 2) and do all math in CSS pixels.'],
  behaviorLines: [
    'Run one requestAnimationFrame loop. dt = seconds since the last frame, clamped to 0.05; f = min(dt × 60, 2.5).',
    'Rebuild the strings on every resize; string i keeps its offset and velocity.',
    'Reduced-motion still frame: the strings as they are (at rest when the page loads).',
  ],
  interactionLines: [
    'Listen for pointer events on the canvas (touch-action: pan-y): a mouse plucks whenever it moves over the canvas, a finger while it touches (sideways drags strum; vertical swipes still scroll).',
  ],
};
