import type { SceneMeta } from '../types';

export const meta: SceneMeta = {
  slug: 'domino',
  title: 'Domino Run',
  summary: 'Dominoes trace your name; scroll and they topple one after another to print it.',
  useCase: 'A launch, countdown or storytelling intro.',
  tags: ['Intros', 'Events'],
  difficulty: 'Medium',
  minutes: 40,
  world: 'matcha',
  terms: ['spring', 'damping', 'stagger', 'scroll-linked'],
  howItWorks: [
    'The outline of each letter is traced, and dominoes are stood along it at even spacing, seen from above.',
    'Scrolling moves a "front" along the chain (**scroll-linked**): dominoes behind it fall, the one at the front leans, and the rest stand, so they go one after another like a **stagger**.',
    'Each domino swings toward its target angle on a **spring** with **damping**, and bounces a little when it lands.',
    'A fallen domino shows its colored face, so the toppled chain prints the name; scrolling back stands them up again.',
  ],
  whatElse: [
    'A launch page where scrolling knocks down the countdown.',
    'A story intro that topples into the title.',
    'A "how it works" page where each step falls into the next.',
  ],
  wants:
    'Dominoes, seen from above, standing in a winding path along the outlines of the letters of a name. Scrolling topples them one after another, and the faces landing up print the name in color. Scrolling back stands them up again. Clicking a domino flicks it and the chain runs on by itself.',
  lookLines: [
    'A full-screen canvas (100svh, at least 540px), transparent over the background and cleared every frame. Size it for devicePixelRatio (capped at 2) and do all math in CSS pixels.',
  ],
  behaviorLines: [
    'Run one requestAnimationFrame loop. dt = seconds since the last frame, clamped to 0.05; f = min(dt × 60, 2.5).',
    'Lay out the dominoes again on every resize and once more when the Anybody font has finished loading; nothing is drawn before the font loads.',
    'Reduced-motion still frame: the front halfway along the chain, every domino at its target angle (half toppled, the name half printed).',
  ],
  interactionLines: ['The canvas has touch-action: pan-y, so vertical swipes still scroll.'],
};
