import type { SceneMeta } from '../types';

export const meta: SceneMeta = {
  slug: 'resonanceplate',
  title: 'Resonance Plate',
  summary:
    'Sand on a vibrating plate dances into patterns as you tune it, and one pitch spells your name.',
  useCase: 'A wellness, sound bath, music or meditation intro.',
  tags: ['Intros', 'Cursor'],
  difficulty: 'Spicy',
  minutes: 75,
  world: 'glacier',
  terms: ['particle-system', 'easing'],
  howItWorks: [
    'A square metal plate vibrates in patterns called modes. Each mode has still lines where the plate does not move; sand shaken off the moving parts collects on them (these are Chladni figures).',
    'Each grain is part of a **particle system**: it hops at random by an amount set by how much the plate moves under it, and slides a little downhill toward the nearest still line.',
    'Moving the cursor sideways changes the pitch, which picks the mode. The pitch follows the cursor with **easing**, so patterns morph smoothly.',
    'Near one special pitch the field blends into a shape built from the name (low on the letters), and a gentle lock pulls the pitch there.',
  ],
  whatElse: [
    'A meditation app intro that settles into the logo on a held breath.',
    'A music page where real audio frequency picks the pattern.',
    'A loading screen that resolves into the name when ready.',
  ],
  wants:
    'A square metal plate covered in fine sand, seen from above. Moving the cursor left and right changes the pitch, and the sand jitters and migrates into the plate’s real vibration patterns (Chladni figures), morphing smoothly between them. At one special pitch, with a gentle magnetic pull toward it, the sand resolves into a name.',
  lookLines: [
    'A full-screen canvas (100svh, at least 540px), transparent over the background and cleared every frame. Size it for devicePixelRatio (capped at 2) and do all math in CSS pixels.',
  ],
  behaviorLines: [
    'Run one requestAnimationFrame loop. dt = seconds since the last frame, clamped to 0.05. Pitch and target start at 0; recompute the field grid every frame.',
    'Lay out again on every resize and build the name field once more when the Anybody font has finished loading; before that the name field is 1 everywhere and the name pitch shows only modes.',
    'Reduced-motion still frame: the pitch at the name, and every grain placed at a random spot where the field is below 0.02 (on the letters).',
  ],
  interactionLines: ['The canvas has touch-action: pan-y, so vertical swipes still scroll.'],
  unreleased: true,
};
