import type { SceneMeta } from '../types';

export const meta: SceneMeta = {
  slug: 'elastic',
  title: 'Stretchy headline',
  summary: 'Each letter swells wider and bolder as your cursor comes close.',
  useCase: 'A bold headline for an event poster or club page.',
  tags: ['Events', 'Headlines'],
  difficulty: 'Easy',
  minutes: 15,
  world: 'dunes',
  terms: ['variable-font', 'lerp', 'easing'],
  howItWorks: [
    'The font has two dials built in: width and weight. That is a **variable font**.',
    'Each letter measures how far it is from your cursor and turns both dials up the closer it is, with a soft bell-shaped falloff.',
    'Instead of jumping, each letter moves a little toward its target every frame (that is **lerp**, or smoothing).',
    'When you are away, a slow wave rolls through the letters so it never sits still.',
  ],
  whatElse: [
    'An event poster where the date stretches as you read it.',
    'A club name that breathes on its own.',
    'A navigation bar where each link swells under the cursor.',
  ],
  wants:
    'A huge headline where each letter swells wider and bolder as my cursor gets close, with a slightly misprinted two-color shadow. When I am not touching it, a slow wave rolls through the letters.',
  lookLines: [
    'The word is set very large (up to about a fifth of the screen width) in Anybody, centered, one line, in the main text color.',
    'Each letter is its own inline-block span so it can change width and weight on its own.',
    'Each letter has two hard shadows in the first two accent colors, offset in opposite directions like a misprint, growing with the letter.',
  ],
  behaviorLines: [
    'Each letter has an influence value from 0 to 1 that drives its width, weight, shadow offset and a small lift.',
    "When the cursor is over the word, a letter's target is exp(−k²), where k is its distance from the cursor in letter widths divided by the reach.",
    'When idle, letter i targets (0.5 + 0.5 × sin(time × wave speed − i × 0.85))².',
  ],
  interactionLines: [
    'Mouse: move across the word.',
    'Touch: drag sideways across the word; vertical swipes still scroll the page.',
  ],
};
