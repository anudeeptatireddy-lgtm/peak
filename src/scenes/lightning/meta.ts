import type { SceneMeta } from '../types';

export const meta: SceneMeta = {
  slug: 'lightning',
  title: 'Lightning',
  summary: 'Electric arcs jump from your cursor to glowing nodes and crackle on to their neighbors.',
  useCase: 'An electric hero for a tech or music event.',
  tags: ['Backgrounds', 'Events'],
  difficulty: 'Spicy',
  minutes: 30,
  world: 'toxic',
  terms: ['blend-mode', 'opacity'],
  howItWorks: [
    'Each bolt starts as a straight line; it is split in half again and again, and every new middle point is pushed a random amount to the side, which makes it jagged.',
    'Now and then a side branch grows off the bolt the same way.',
    'A node that gets hit glows, then passes a weaker arc on to its nearest neighbor; the glow comes from stroking each arc a few times, wider and fainter, with an additive **blend mode**.',
    'Arcs fade out by **opacity** in a fraction of a second, and for safety there are never more than 3 strikes a second.',
  ],
  whatElse: [
    'An electric hero for a tech conference or a music night.',
    'A "connect" visual for a networking or social app.',
    'A power-up moment when a user unlocks a feature.',
  ],
  wants:
    'Small glowing nodes scattered across a dark screen. Electric arcs jump from my cursor to the nearest node, crackling and branching; the node that gets hit glows and passes a weaker arc on to its neighbor. Every so often an arc jumps between two nodes by itself.',
  lookLines: [
    'A full-screen canvas (100svh, at least 540px), transparent over the background and cleared every frame. Size it for devicePixelRatio (capped at 2) and do all math in CSS pixels.',
  ],
  behaviorLines: [
    'Run one requestAnimationFrame loop. dt = seconds since the last frame, clamped to 0.05; f = min(dt × 60, 2.5). Each frame: age and remove arcs, fade the node glows, then strike if one is due, then draw.',
    'Scatter the nodes again on every resize.',
    'Reduced-motion still frame: one arc (no chain, full power, age 0) between the node nearest 30%/45% of the width/height and the node nearest 70%/55%, both glowing.',
  ],
  interactionLines: ['The canvas has touch-action: pan-y, so swipes still scroll.'],
};
