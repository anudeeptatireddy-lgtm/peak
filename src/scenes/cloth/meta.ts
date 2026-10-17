import type { SceneMeta } from '../types';

export const meta: SceneMeta = {
  slug: 'cloth',
  title: 'Tearable cloth',
  summary: 'A sheet hangs from a rail and sways in a breeze. Drag to stretch it; pull hard and it tears.',
  useCase: 'A show-off background, or a "pull back the curtain" reveal.',
  tags: ['Just for fun', 'Backgrounds'],
  difficulty: 'Spicy',
  minutes: 30,
  world: 'blueprint',
  terms: ['gravity', 'stiffness', 'damping'],
  howItWorks: [
    'The sheet is a grid of points joined by short links, like threads in a net, and the top row is pinned to a rail.',
    'Each frame every point keeps drifting the way it was going (with a little **damping**), then **gravity** and a gentle breeze pull on it.',
    'Then every link is nudged back to its own length a few times (the **stiffness**), which is what holds the sheet together.',
    'Grabbing pins the points under your cursor to it; stretch a link too far and it snaps, so the sheet tears where you pull hardest.',
  ],
  whatElse: [
    'A curtain over a hero section that you tear open to reveal the page.',
    'A launch page where the announcement hides behind a sheet.',
    'A playful 404 page: rip the error away.',
  ],
  wants:
    'A sheet of cloth hanging from a rail at the top of the screen, swaying gently in a breeze. I can grab it and drag it around; it swings and stretches, and if I pull hard enough it tears apart. Double-clicking hangs a fresh sheet.',
  lookLines: [
    'The canvas is transparent over the background and cleared every frame. Size it for devicePixelRatio (capped at 2) and do all math in CSS pixels.',
  ],
  behaviorLines: [
    'Run one requestAnimationFrame loop. dt = seconds since the last frame, clamped to 0.05; f = min(dt × 60, 2.5); t = seconds the loop has run (the sum of dt).',
    'Each frame, in this order: check for double-clicks, start or end a grab, move the points (gravity and breeze), move the held point to the pointer, relax the links, draw.',
    'Hang a fresh sheet on every resize.',
    'Reduced-motion still frame: the sheet after 240 frames of the physics with f = 1 (t advancing 1/60s each) and no pointer.',
  ],
  interactionLines: ['The canvas has touch-action: pan-y.'],
};
