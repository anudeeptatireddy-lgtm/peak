import type { SceneMeta } from '../types';

export const meta: SceneMeta = {
  slug: 'magnetic',
  title: 'Magnetic buttons',
  summary:
    'Buttons that lean toward your cursor, with labels that drift a little further, and squish when pressed.',
  useCase: 'Navigation or call-to-action buttons that feel alive.',
  tags: ['Portfolio', 'Landing pages'],
  difficulty: 'Easy',
  minutes: 10,
  world: 'matcha',
  terms: ['spring', 'damping', 'transform'],
  howItWorks: [
    'Each button measures how far the cursor is from its center, and if it is close enough it aims to move a little toward the cursor.',
    'A **spring** pulls the button to that aim, and **damping** decides how much it wobbles before it settles.',
    'The label moves more than the button body, which makes it look like it floats above the button (parallax), using a **transform**.',
    'Pressing squashes the button flatter and wider, like pressing rubber.',
  ],
  whatElse: [
    'A row of navigation buttons on a portfolio.',
    'A big call-to-action button that follows the cursor.',
    'Social icons that reach toward your pointer.',
  ],
  wants:
    'A row of buttons. Each one is pulled toward my cursor when it is near, with its label moving a bit more than its body, and it squishes slightly when I press it.',
  lookLines: [],
  behaviorLines: [
    'Run one requestAnimationFrame loop. dt = seconds since the last frame, clamped to 0.05; f = min(dt × 60, 2.5).',
    'Reduced-motion still frame: the buttons at rest, with no pull and no squish.',
  ],
  interactionLines: [
    'The stage has touch-action: pan-y, so vertical swipes still scroll; a finger on the screen pulls the nearby buttons.',
  ],
};
