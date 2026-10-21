import type { SceneMeta } from '../types';

export const meta: SceneMeta = {
  slug: 'splitflap',
  title: 'Split-flap board',
  summary: 'A departures board whose tiles clatter through the alphabet into each message.',
  useCase: 'An event schedule, a departures-board headline or a launch announcement.',
  tags: ['Events', 'Headlines', 'Travel'],
  difficulty: 'Medium',
  minutes: 20,
  world: 'blueprint',
  terms: ['transform', 'stagger', 'easing'],
  howItWorks: [
    'Each tile is split into a top and a bottom half, and only one flap moves at a time.',
    'A flip folds the old top half down and then lands the new bottom half, both with a 3D **transform** and an **easing** curve.',
    'Tiles flip through the alphabet one character after another until they reach their letter, each starting a little after its neighbor (a **stagger**).',
    'The whole message is in an accessible label, so screen readers hear the words instead of the flipping.',
  ],
  whatElse: [
    'A conference schedule that flips to the next talk.',
    'A countdown board for a launch.',
    'A restaurant "today’s special" sign.',
  ],
  wants:
    'A board of split-flap tiles, like an old airport departures board. Each tile flips through the characters (the top half falls, the bottom half lands) until it reaches its letter, so the message clatters into place. Every few seconds the board flips to the next message.',
  lookLines: [
    'Give the board an aria-label with the current message (updated on each change) and mark the tiles aria-hidden; no live-region announcements.',
  ],
  behaviorLines: [
    'Run one requestAnimationFrame loop. dt = seconds since the last frame, clamped to 0.05; t = seconds the loop has run (the sum of dt). Flip times use t; a tile that falls behind does several flips in one frame.',
    'The first message starts flipping in when the animation starts. Recompute tile sizes on every resize.',
    'Reduced-motion still frame: the first message, every flap at rest.',
  ],
  interactionLines: [
    'A click or tap (on release) anywhere on the section skips to the next message.',
  ],
};
