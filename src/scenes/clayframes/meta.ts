import type { SceneMeta } from '../types';

export const meta: SceneMeta = {
  slug: 'clayframes',
  title: 'Clay Frames',
  summary:
    'Your name in clay at a choppy stop-motion frame rate; press to leave thumbprints that slowly smooth out.',
  useCase: 'A food, kids’ or craft brand.',
  tags: ['Brands', 'Just for fun', 'Kids'],
  difficulty: 'Medium',
  minutes: 35,
  world: 'lava',
  terms: ['frame-rate', 'easing', 'blend-mode'],
  howItWorks: [
    'The name’s outlines are traced and redrawn only a few times a second, a low **frame rate** that looks like stop motion.',
    'Every frame the outlines get new random wobbles, so the clay seems to boil like hand-moved plasticine.',
    'A press leaves a thumbprint: a dent with ridges that pushes the outline out of the way, then relaxes over a few seconds with **easing**.',
    'Light from the top left (a shifted shadow, edge light and shade) gives the flat shapes their clay depth.',
  ],
  whatElse: [
    'A kids’ brand page where visitors squish the logo.',
    'A bakery or food brand hero in dough instead of clay.',
    'A craft studio page where each letter is a different color of clay.',
  ],
  wants:
    'A name made of colorful clay, shown at a choppy stop-motion frame rate with outlines that wobble a little every frame. Pressing leaves thumbprints with fingerprint ridges that squish the letters, and the prints slowly relax away.',
  lookLines: [
    'A full-screen canvas (100svh, at least 540px), transparent over the background. Size it for devicePixelRatio (capped at 2) and do all math in CSS pixels.',
  ],
  behaviorLines: [
    'Run one requestAnimationFrame loop. dt = seconds since the last frame, clamped to 0.05.',
    'Trace the outlines again on every resize and once more when the Anybody font has finished loading; nothing is drawn before the font loads. Use a seeded random number generator for colors, grain and the idle finger.',
    'Reduced-motion still frame: one frame with two thumbprints, at 30% and 72% of the way along the name.',
  ],
  interactionLines: [
    'The canvas has touch-action: pan-y, so vertical swipes still scroll; on touch screens tap to press, or press and hold, then drag.',
  ],
};
