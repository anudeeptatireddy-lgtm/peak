import type { SceneMeta } from '../types';

export const meta: SceneMeta = {
  slug: 'peekaboo',
  title: 'Peekaboo',
  summary: 'Little animals hide behind your name, duck when you come close, then peek out again.',
  useCase: 'Kids’ brands, toys and children’s learning apps.',
  tags: ['Kids', 'Cursor'],
  difficulty: 'Medium',
  minutes: 50,
  world: 'matcha',
  terms: ['spring', 'lerp', 'easing'],
  howItWorks: [
    'Each animal is drawn behind a letter, so the letter hides whatever part of it is behind.',
    'Every animal has two spots: peeking out (over the top or round a side) and hiding (behind its letter). It moves between them on a **spring**, squashing and stretching with its speed.',
    'When the cursor comes close, it ducks; after a delay it peeks out again on the side away from the cursor. Each animal has its own timing.',
    'The pupils follow the cursor with a slight lag (a **lerp** each frame).',
  ],
  whatElse: [
    'A toy shop’s header where animals peek out from the logo.',
    'A learning app’s welcome screen with one animal per letter of the child’s name.',
    'A 404 page where everyone hides when you arrive.',
  ],
  wants:
    'Big chunky letters spell a name, with little original animals (simple round heads with round, pointy or long ears) hiding behind them. Their eyes follow the cursor with a slight lag; when the cursor gets close they duck behind the letters with a quick squash, then peek out the other side once it moves away, each with its own timing.',
  lookLines: [
    'A full-screen canvas (100svh, at least 540px), transparent over the background and cleared every frame. Size it for devicePixelRatio (capped at 2) and do all math in CSS pixels.',
  ],
  behaviorLines: [
    'Run one requestAnimationFrame loop. dt = seconds since the last frame, clamped to 0.05; f = min(dt × 60, 2.5).',
    'Lay out the letters and animals again on every resize and once more when the Anybody font has finished loading; nothing is drawn before the font loads. Use a seeded random number generator so the animals are the same every visit.',
    'Reduced-motion still frame: every animal peeking out, looking straight ahead.',
  ],
  interactionLines: ['The canvas has touch-action: pan-y, so vertical swipes still scroll.'],
};
