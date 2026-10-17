import type { SceneMeta } from '../types';

export const meta: SceneMeta = {
  slug: 'tumble',
  title: 'Falling letters',
  summary: 'Letters drop in as blocks and stack up. Grab one and throw it at the others.',
  useCase: 'A playful "about me" headline or a 404 page.',
  tags: ['Just for fun', 'Headlines'],
  difficulty: 'Medium',
  minutes: 25,
  world: 'toxic',
  terms: ['gravity', 'momentum', 'stagger', 'stiffness'],
  howItWorks: [
    'Each letter is a block made of four corner points joined by six invisible sticks, so it stays rigid but can tip and spin.',
    'Every frame **gravity** pulls the corners down, then the sticks are pulled back to their lengths a few times; more passes make the blocks feel stiffer (**stiffness**).',
    'Blocks that overlap are pushed apart along the shortest way out, which is what lets them stack and knock each other over.',
    'When you let go of a letter it keeps its speed (**momentum**), and the letters drop in one after another (a **stagger**).',
  ],
  whatElse: [
    'A 404 page whose numbers fall over.',
    'An "about me" headline you can knock down.',
    'A word game where you build words from falling letters.',
  ],
  wants:
    'The letters of my headline drop from the top one by one and stack on the floor as tilted blocks. I can grab any letter to drag and throw it; it tumbles and knocks the others over. A double-click drops them all again in order.',
  lookLines: [
    'A full-screen canvas (100svh, at least 540px), transparent, cleared every frame. Size it for devicePixelRatio (capped at 2) and do all math in CSS pixels.',
    'Draw each block at its center (the average of its corners), rotated by the angle of its top edge.',
  ],
  behaviorLines: [
    'Run one requestAnimationFrame loop. dt = seconds since the last frame, clamped to 0.05; f = min(dt × 60, 2.5).',
    'The letters drop when the page loads; lay them out again and drop them all once more on every resize and once the Anybody font has finished loading.',
  ],
  interactionLines: [
    'The canvas has touch-action: pan-y so vertical swipes scroll; once a finger has grabbed a letter, it stops the page from scrolling.',
  ],
};
