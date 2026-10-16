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
  lookLines: ['No canvas: the headline is real text in the page, on the background color.'],
  behaviorLines: [
    'Run one requestAnimationFrame loop. dt = seconds since the last frame, clamped to 0.05; t = seconds the loop has run (the sum of dt).',
    'Reduced-motion still frame: every letter at the idle-wave value for t = 0.4.',
  ],
  interactionLines: [
    'pointermove and pointerdown on the section set the pointer position and make it active; pointerleave and pointercancel make it inactive, and so does lifting a finger.',
    'On touch, drag sideways across the word; vertical swipes still scroll the page (touch-action: pan-y on the section).',
  ],
};
