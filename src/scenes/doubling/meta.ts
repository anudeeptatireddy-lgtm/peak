import type { SceneMeta } from '../types';

export const meta: SceneMeta = {
  slug: 'doubling',
  title: 'Doubling',
  summary: 'One coin doubles with every scroll, until the stacks spell your name.',
  useCase: 'Fintech, savings and investing apps.',
  tags: ['Finance', 'Landing pages'],
  difficulty: 'Medium',
  minutes: 45,
  world: 'golden',
  terms: ['scroll-linked', 'spring', 'easing'],
  blends: false,
  howItWorks: [
    'Every scroll step doubles the coins: each coin splits in two, and the halves spin as they slide to their new places.',
    'The coins stand in stacks whose heights follow the name’s outline, so each step looks like a growing bar chart. At the last step every coin lands on its spot and the stacks spell the name.',
    'When the coins land, the stacks sway on a **spring** and settle, taller stacks swaying more.',
    'Scrolling moves through the steps (**scroll-linked**), and the counter **eases** between numbers.',
  ],
  whatElse: [
    'A savings app’s hero that shows compound growth.',
    'An investing page where each scroll is a year of returns.',
    'A fundraising page whose stacks grow toward the goal.',
  ],
  wants:
    'A single coin on a table. Each scroll step splits every coin in two, with a little spin, and the coins slide into neat stacks that wobble and settle. The stack heights form a rising chart, and at the last step they become the silhouette of a name. A counter above eases between the numbers.',
  lookLines: [
    'A full-screen canvas (100svh, at least 540px), transparent over the background and cleared every frame. Size it for devicePixelRatio (capped at 2) and do all math in CSS pixels.',
  ],
  behaviorLines: [
    'Run one requestAnimationFrame loop. dt = seconds since the last frame, clamped to 0.05; f = min(dt × 60, 2.5).',
    'Lay out the coins again on every resize and once more when the Anybody font has finished loading; nothing is drawn before the font loads.',
    'Reduced-motion still frame: the last step, every coin on its spot forming the name, no wobble, the counter at its final number.',
  ],
  interactionLines: ['The canvas has touch-action: pan-y, so vertical swipes still scroll.'],
};
