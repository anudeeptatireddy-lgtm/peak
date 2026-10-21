import type { SceneMeta } from '../types';

export const meta: SceneMeta = {
  slug: 'stringart',
  title: 'String Art',
  summary:
    'A thread races from nail to nail and builds your name from straight lines as you scroll; move across the threads to pluck them.',
  useCase: 'A craft, jewelry, design-studio or portfolio hero.',
  tags: ['Portfolio', 'Brands'],
  difficulty: 'Medium',
  minutes: 40,
  world: 'newsprint',
  terms: ['scroll-linked', 'stiffness', 'damping'],
  howItWorks: [
    'Nails sit along the letter outlines. A route is planned ahead: from each nail, the thread goes to whichever nail’s straight line covers the most letter that is still empty, and avoids the background.',
    'Hundreds of light threads overlap, so the letters appear by density. Scrolling lays more thread or takes it back (**scroll-linked**).',
    'Crossing a thread plucks it: a spring with **stiffness** from the tension pulls its bow back, and **damping** lets the vibration die away.',
  ],
  whatElse: [
    'A jewelry brand hero in fine gold thread.',
    'A design studio portfolio that weaves its name as you scroll down.',
    'A music page where plucking each thread plays a note.',
  ],
  wants:
    'Nails around the outlines of a name, and a single thread racing from nail to nail in straight lines, building the name by density as I scroll. Moving the pointer across the threads plucks them, and they vibrate and settle.',
  lookLines: [
    'A full-screen canvas (100svh, at least 540px), transparent over the background and cleared every frame. Size it for devicePixelRatio (capped at 2) and do all math in CSS pixels.',
  ],
  behaviorLines: [
    'Run one requestAnimationFrame loop. dt = seconds since the last frame, clamped to 0.05; f = min(dt × 60, 2.5).',
    'Place the nails and plan the route again on every resize, on any change to the name, nails, threads or search, and once more when the Anybody font has finished loading; nothing is drawn before the font loads. Use a seeded random number generator so the piece is the same every visit.',
    'Reduced-motion still frame: the finished piece with every thread at rest.',
  ],
  interactionLines: ['The canvas has touch-action: pan-y, so vertical swipes still scroll.'],
};
