import type { SceneMeta } from '../types';

export const meta: SceneMeta = {
  slug: 'shatter',
  title: 'Shattering words',
  summary: 'Click a word and it cracks into glass shards that fly, spin, fall and fuse back.',
  useCase: 'A dramatic reveal or a "break the ice" intro.',
  tags: ['Headlines', 'Portfolio'],
  difficulty: 'Medium',
  minutes: 25,
  world: 'glacier',
  terms: ['impulse', 'gravity', 'lerp'],
  howItWorks: [
    'Each word is a pane of glass: its box is cut in two again and again along random lines until it has enough shards.',
    'Every shard is drawn by clipping to its shape and drawing the word inside, so it carries its own piece of the letters.',
    'A click gives each shard a kick away from the click (an **impulse**), a spin, and **gravity** pulls it down.',
    'Then each shard glides home a share of the way every frame (a **lerp**), and the cracks shimmer as it fuses.',
  ],
  whatElse: [
    'An intro line visitors can smash.',
    'A "break the ice" icebreaker on a team page.',
    'A dramatic reveal where a cover word shatters to show what’s behind it.',
  ],
  wants:
    'A line of words sits calmly. When I click a word, it cracks along jagged lines into glass shards that fly out, spin and fall, catching small glints of light. After a moment the shards fly back and fuse, with a short shimmer along the cracks.',
  lookLines: [
    'A full-screen canvas (100svh, at least 540px), transparent, cleared every frame. Size it for devicePixelRatio (capped at 2) and do all math in CSS pixels. Keep the line in a visually hidden element for screen readers; the canvas is aria-hidden.',
  ],
  behaviorLines: [
    'Run one requestAnimationFrame loop. dt = seconds since the last frame, clamped to 0.05; f = min(dt × 60, 2.5).',
    'A click or tap (on release) inside a whole word’s box shatters that word; clicks on broken words do nothing.',
    'Lay the line out again (all words whole) on every resize and once the Anybody font has finished loading.',
  ],
  interactionLines: ['The canvas has touch-action: pan-y, so swipes still scroll.'],
};
