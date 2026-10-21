import type { SceneMeta } from '../types';

export const meta: SceneMeta = {
  slug: 'gatherround',
  title: 'Gather Round',
  summary:
    'Scroll and people walk onto a plaza from every edge, until together they spell your name.',
  useCase: 'Nonprofits, community groups and civic campaigns.',
  tags: ['Nonprofits', 'Events'],
  difficulty: 'Medium',
  minutes: 45,
  world: 'aurora',
  terms: ['scroll-linked', 'velocity', 'stagger'],
  howItWorks: [
    'Each person has a spot sampled from the name and walks in from a random edge, in a shuffled order (a **stagger**), so the name fills in evenly.',
    'Every frame a person turns their **velocity** a little toward their spot, along a gently curved path, slowing as they arrive.',
    'Nearby people push each other apart, so they step around one another instead of overlapping.',
    'Scrolling brings more people or sends them away (**scroll-linked**), and the counter shows how many are standing in place.',
  ],
  whatElse: [
    'A nonprofit page where each person is one supporter.',
    'A petition page whose crowd grows with the signature count.',
    'A community event invite that fills the plaza as you read.',
  ],
  wants:
    'An empty plaza seen from above. A few small figures walk in; as I scroll, more arrive from every edge, each finding a spot, stepping around each other, until together they spell a name. A counter shows how many are standing together.',
  lookLines: [
    'A full-screen canvas (100svh, at least 540px), transparent over the background and cleared every frame. Size it for devicePixelRatio (capped at 2) and do all math in CSS pixels.',
  ],
  behaviorLines: [
    'Run one requestAnimationFrame loop. dt = seconds since the last frame, clamped to 0.05; f = min(dt × 60, 2.5).',
    'Lay out the spots again on every resize and once more when the Anybody font has finished loading; nothing is drawn before the font loads. Use a seeded random number generator so the crowd is the same every visit.',
    'Reduced-motion still frame: the whole crowd standing on their spots, forming the name, with the counter at its full number.',
  ],
  interactionLines: ['The canvas has touch-action: pan-y, so vertical swipes still scroll.'],
};
