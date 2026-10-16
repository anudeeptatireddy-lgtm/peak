import type { SceneMeta } from '../types';

export const meta: SceneMeta = {
  slug: 'ripple',
  title: 'Ripple background',
  summary: 'A calm dot grid. Drop ripples into it and push the dots around.',
  useCase: 'An interactive background for a landing page.',
  tags: ['Backgrounds', 'Landing pages'],
  difficulty: 'Medium',
  minutes: 20,
  world: 'abyss',
  terms: ['easing', 'opacity', 'blend-mode'],
  howItWorks: [
    'The background is a grid of small dots that each remember their home spot.',
    'A click starts a ring that grows outward at a steady speed and fades over time.',
    "Dots near the ring get pushed along it and light up in the ring's color; where colors overlap they mix with a **blend mode**.",
    'Your cursor gently pushes nearby dots away, and when nobody is around, ripples start on their own.',
  ],
  whatElse: [
    'A landing page background behind a big headline.',
    'A contact section where every click leaves a ripple.',
    'A loading screen that ripples while it waits.',
  ],
  wants:
    'A calm, full-screen grid of small dots. When I click, a ring ripples out from that spot, pushing the dots outward and lighting them up in color as it passes. My cursor pushes nearby dots away. When nobody is interacting, ripples start by themselves every few seconds.',
  lookLines: [
    'The canvas is transparent over the background and cleared every frame. Size it for devicePixelRatio (capped at 2) and draw in CSS pixels.',
  ],
  behaviorLines: [
    'Run one requestAnimationFrame loop. dt = seconds since the last frame, clamped to 0.05; t = seconds the loop has run (the sum of dt). Ring start times and ages use t.',
    "A click lands between frames: its ring starts at the previous frame's t.",
    'Rebuild the grid on every resize (all dots back to rest).',
    'Automatic ring positions call Math.random() for x, then y.',
    'Reduced-motion still frame: two rings from (width / 2, 45% of the height), 0.9s and 0.35s old, in the first and second accent, with no easing (dots jump straight to their displaced position and glow).',
  ],
  interactionLines: [
    'Click or tap (on release): a ring at that point, which also counts as the latest click for the automatic ripples.',
    'pointermove and pointerdown on the canvas make the pointer active (a finger only while it is down); pointerleave and pointercancel make it inactive.',
  ],
};
