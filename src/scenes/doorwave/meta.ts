import type { SceneMeta } from '../types';

export const meta: SceneMeta = {
  slug: 'doorwave',
  title: 'Door Wave',
  summary:
    'Doors on an isometric block swing open around your cursor, and lit rooms spell your name.',
  useCase: 'A real estate, property, rental or coworking intro.',
  tags: ['Intros', 'Cursor'],
  difficulty: 'Medium',
  minutes: 50,
  world: 'dreamhouse',
  terms: ['spring', 'damping', 'scroll-linked'],
  howItWorks: [
    'The building is drawn in isometric: each step along the wall also moves down by half a step, so every face keeps the same angle.',
    'Every door is a **spring**: its target is open near the cursor and closed farther away, and it swings toward that target with a little overshoot. **Damping** sets how quickly it settles.',
    'The middle floor hides one letter per room. Letter doors stay open for a few seconds after the wave passes, so one sweep spells the whole name.',
    'When you are not pointing, the wave sweeps by itself, and scrolling moves it along (**scroll-linked**).',
  ],
  whatElse: [
    'A property site where each open door links to a listing.',
    'A coworking page that opens the doors of free desks.',
    'An advent calendar with one door per day.',
  ],
  wants:
    'An isometric apartment block with dozens of front doors on walkways. As the cursor passes, doors swing open with a small overshoot in a wave around it, revealing warmly lit rooms and spilling light onto the walkways. The rooms on the middle floor each hold a letter, so with those doors open they spell a name across the building.',
  lookLines: [
    'A full-screen canvas (100svh, at least 540px), transparent over the background and cleared every frame. Size it for devicePixelRatio (capped at 2) and do all math in CSS pixels.',
  ],
  behaviorLines: [
    'Run one requestAnimationFrame loop. dt = seconds since the last frame, clamped to 0.05. All doors start closed.',
    'Lay out the block again on every resize and size the letters once more when the Anybody font has finished loading; letters are not drawn before the font loads.',
    'Reduced-motion still frame: the cursor point in the middle of the middle floor, every door at its target, and every letter door open (the whole name visible).',
  ],
  interactionLines: ['The canvas has touch-action: pan-y, so vertical swipes still scroll.'],
  unreleased: true,
};
