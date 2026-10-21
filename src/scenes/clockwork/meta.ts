import type { SceneMeta } from '../types';

export const meta: SceneMeta = {
  slug: 'clockwork',
  title: 'Clockwork',
  summary: 'Move the cursor to wind a chain of meshing gears that tick your name into place.',
  useCase: 'A watch, engineering, craft or automotive brand.',
  tags: ['Brands', 'Cursor'],
  difficulty: 'Spicy',
  minutes: 60,
  world: 'blueprint',
  terms: ['momentum', 'spring', 'easing'],
  howItWorks: [
    'The gears form one chain. Each gear turns the opposite way to the one before it, at a speed set by their teeth: a small gear turns faster than the big gear driving it.',
    'Each gear’s angle is worked out from its neighbor’s every frame, so the teeth always mesh exactly.',
    'Moving the cursor winds a spring. An escapement lets the first gear move one tooth per tick while the spring has energy, and each tick swings the letters a little closer to their places.',
    'Loose gears wobble after each tick (a small **spring**), and every tick snaps in with **easing**.',
  ],
  whatElse: [
    'A watch brand page where the hero winds up as you arrive.',
    'An engineering firm’s intro that builds its name from its own machinery.',
    'A progress bar made of gears that turns as an upload finishes.',
  ],
  wants:
    'A chain of meshing gears behind a name, like the inside of a watch. Moving the cursor winds a mainspring; an escapement then ticks the gears forward one tooth at a time, and each tick swings the letters of the name a little further into place until it is complete.',
  lookLines: [
    'A full-screen canvas (100svh, at least 540px), transparent over the background and cleared every frame. Size it for devicePixelRatio (capped at 2) and do all math in CSS pixels.',
  ],
  behaviorLines: [
    'Run one requestAnimationFrame loop. dt = seconds since the last frame, clamped to 0.05; f = min(dt × 60, 2.5).',
    'Lay out the gears and letters again on every resize and once more when the Anybody font has finished loading; letters are not drawn before the font loads. Use a seeded random number generator so the layout is the same every visit.',
    'Reduced-motion still frame: every letter in place, the gears at rest, the spring half wound.',
  ],
  interactionLines: ['The canvas has touch-action: pan-y, so vertical swipes still scroll.'],
  unreleased: true,
};
