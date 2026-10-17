import type { SceneMeta } from '../types';

export const meta: SceneMeta = {
  slug: 'sand',
  title: 'Sand text',
  summary: 'A word made of sand. Swipe to blow it away; it drifts back and settles.',
  useCase: 'A beach event page or a calm portfolio intro.',
  tags: ['Headlines', 'Portfolio'],
  difficulty: 'Medium',
  minutes: 20,
  world: 'dunes',
  terms: ['particle-system', 'drag', 'spring', 'damping'],
  howItWorks: [
    'The word is drawn on a hidden canvas, and thousands of spots inside the letters become grains of sand (a **particle system**).',
    'A fast swipe pushes nearby grains along with it, and air **drag** slows them down while they wander a little.',
    'After a pause each grain is pulled back home on a **spring**, and **damping** lets it settle softly.',
    'All grains of one color are drawn in a single batch, so thousands of them stay smooth.',
  ],
  whatElse: [
    'A beach festival page whose title blows away.',
    'A calm portfolio intro you can brush aside.',
    'A message that appears when visitors wipe away the sand.',
  ],
  wants:
    'A word made of thousands of sand grains. A swipe blows grains off in the direction of the swipe in a drifting cloud. After a pause they drift back and settle into the letters.',
  lookLines: [
    'A full-screen canvas (100svh, at least 540px), transparent, cleared every frame. Size it for devicePixelRatio (capped at 2) and do all math in CSS pixels.',
  ],
  behaviorLines: [
    'Run one requestAnimationFrame loop. dt = seconds since the last frame, clamped to 0.05; f = min(dt × 60, 2.5); t = seconds the loop has run (the sum of dt).',
    'Sample the homes again on every resize and once the Anybody font has finished loading; grain i keeps its position, velocity and color and gets home i, new grains start at home.',
  ],
  interactionLines: [
    'Listen for pointer events on the canvas (touch-action: pan-y): a mouse blows whenever it moves fast over the canvas, a finger while it swipes sideways (vertical swipes still scroll).',
  ],
};
