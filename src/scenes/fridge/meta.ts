import type { SceneMeta } from '../types';

export const meta: SceneMeta = {
  slug: 'fridge',
  title: 'Fridge magnets',
  summary: 'Magnet letters slide toward your cursor and click into place to spell a word.',
  useCase: 'A playful contact page or a "say hi" section.',
  tags: ['Portfolio', 'Just for fun'],
  difficulty: 'Easy',
  minutes: 20,
  world: 'glacier',
  terms: ['lerp', 'drag', 'impulse'],
  howItWorks: [
    'Every letter is a magnet with a position and a speed, lying at its own angle.',
    'Near the cursor, letters speed up toward it, and friction (**drag**) slows them down again.',
    'When a letter of the word comes close to its spot on the line, it locks and glides the rest of the way (a **lerp**), straightening as it goes.',
    'Shake the cursor and every letter gets a random kick (an **impulse**) and scatters.',
  ],
  whatElse: [
    'A contact section where visitors spell "hello" to reveal your email.',
    'A kids’ spelling game.',
    'A guest message board made of magnets.',
  ],
  wants:
    'Chunky magnet letters lie scattered at angles. When my cursor comes near, letters slide toward it like magnets. When I bring them near the middle line they click into place one by one to spell the word. Shaking the cursor fast scatters them again.',
  lookLines: [
    'A full-screen canvas (100svh, at least 540px), transparent, cleared every frame. Size it for devicePixelRatio (capped at 2) and do all math in CSS pixels.',
  ],
  behaviorLines: [
    'Run one requestAnimationFrame loop. dt = seconds since the last frame, clamped to 0.05; f = min(dt × 60, 2.5).',
    'Draw locked magnets after free ones, so the word stays on top.',
    'Lay the slots out again (keeping every magnet where it is) on every resize and once the Anybody font has finished loading.',
  ],
  interactionLines: [
    'A mouse pulls whenever it is over the canvas; a finger after it has been held still for 0.25s (press and hold, then drag), so swipes still scroll (touch-action: pan-y).',
  ],
};
