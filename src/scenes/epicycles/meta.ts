import type { SceneMeta } from '../types';

export const meta: SceneMeta = {
  slug: 'epicycles',
  title: 'Epicycles',
  summary:
    'A chain of spinning circles draws your name; move up and down to go from blobby to crisp.',
  useCase: 'A math, music, data or technical brand.',
  tags: ['Backgrounds', 'Tech & AI'],
  difficulty: 'Medium',
  minutes: 30,
  world: 'arcade',
  terms: ['trail', 'easing', 'blend-mode'],
  howItWorks: [
    'The name’s outline is turned into one long closed path, and a Fourier transform splits that path into circles, each spinning at its own whole-number speed.',
    'Put the circles end to end and the tip of the last one draws the outline, leaving a glowing **trail**. The biggest circles go first.',
    'Few circles give a blobby shape; more circles add the corners. Moving up and down sets how many are active, with **easing**.',
    'The pen lifts between letters, so only the letters are drawn.',
  ],
  whatElse: [
    'A music brand’s hero where the circles turn in time with a song.',
    'A data company intro that draws its logo from its own math.',
    'A math lesson page that shows how circles add up to any shape.',
  ],
  wants:
    'A chain of spinning circles, end to end, whose tip traces the outline of a name with a glowing trail. Moving the cursor up and down adds or removes circles, so the name goes from blobby to crisp. Clicking restarts the trace.',
  lookLines: [
    'A full-screen canvas (100svh, at least 540px), transparent over the background and cleared every frame. Size it for devicePixelRatio (capped at 2) and do all math in CSS pixels.',
  ],
  behaviorLines: [
    'Run one requestAnimationFrame loop. dt = seconds since the last frame, clamped to 0.05; f = min(dt × 60, 2.5).',
    'Trace the outline and compute the circles again on every resize and once more when the Anybody font has finished loading; nothing is drawn before the font loads.',
    'Reduced-motion still frame: the whole finished trace, with the circles faint, at the start of the cycle.',
  ],
  interactionLines: [
    'The canvas has touch-action: pan-y, so vertical swipes still scroll; on touch screens press and hold, then drag up and down.',
  ],
};
