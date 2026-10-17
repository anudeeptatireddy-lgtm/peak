import type { SceneMeta } from '../types';

export const meta: SceneMeta = {
  slug: 'kinetic',
  title: 'Kinetic poster',
  summary: 'Bold words on a strict grid that scale, turn, swap and change color on the beat.',
  useCase: 'An event poster or a manifesto page.',
  tags: ['Events', 'Headlines'],
  difficulty: 'Medium',
  minutes: 20,
  world: 'newsprint',
  terms: ['easing', 'transform', 'frame-rate'],
  howItWorks: [
    'A steady clock counts beats, and every beat triggers one move from a short repeating pattern.',
    'Each move is a **transform**: a word scales up, turns a quarter turn or swaps places with another.',
    'The **easing** of every move decides the feel: soft, snappy with a little overshoot, or mechanical.',
    'Moves follow the clock, not the **frame rate**, so the poster keeps time on any screen.',
  ],
  whatElse: [
    'A festival poster that moves to the beat of its lineup.',
    'A manifesto page where key words keep rearranging.',
    'A title card for a video or talk.',
  ],
  wants:
    'Bold words sit on a strict grid and change on a steady beat: one scales up, one turns 90°, two swap places, a block of color slides in, like a moving Swiss poster. The sequence loops. A click switches to the next grid.',
  lookLines: [
    'Keep the words in a visually hidden element for screen readers and mark the poster aria-hidden.',
    'Position each cell absolutely from its current place in the grid (so swaps can slide), with the word and its color block inside.',
  ],
  behaviorLines: [
    'Run one requestAnimationFrame loop. dt = seconds since the last frame, clamped to 0.05; t = seconds the loop has run (the sum of dt). Beats use t.',
    'Recompute cell sizes and word sizes on every resize and once the Anybody font has finished loading.',
    'Reduced-motion still frame: the poster after the first four beats, every move finished.',
  ],
  interactionLines: ['A click or tap (on release) anywhere on the section switches the grid.'],
};
