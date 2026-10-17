import type { SceneMeta } from '../types';
import { FIXED } from './constants';

export const meta: SceneMeta = {
  slug: 'curtain',
  title: 'Page transitions',
  summary: 'A tiny three-page site plays a curtain, wipe, iris or slats transition between pages.',
  useCase: 'Moving between pages of a portfolio or a small site.',
  tags: ['Portfolio', 'Landing pages'],
  accessible: true,
  difficulty: 'Medium',
  minutes: 20,
  world: 'cherry',
  terms: ['easing', 'stagger', 'reduced-motion'],
  howItWorks: [
    'Clicking a link does not swap the page at once: a cover (curtain panels, a wipe, a growing circle or a row of slats) slides over the old page first.',
    'When the cover is complete, the page behind it is swapped, and the cover slides away to reveal the new one.',
    'An **easing** curve decides how the cover accelerates, and a **stagger** starts each slat a little after the one before.',
    'With **reduced motion** turned on, every transition becomes a short fade instead.',
  ],
  whatElse: [
    'Page transitions for a portfolio built with single-page navigation.',
    'A theatrical reveal between chapters of a story.',
    'A slideshow where each slide change has a flourish.',
  ],
  wants:
    'A tiny three-page site where clicking a link plays a transition before the next page appears: theater curtains closing and opening, a diagonal wipe, an iris circle or slats. Focus moves to the new page heading.',
  lookLines: [],
  behaviorLines: [
    'Run one requestAnimationFrame loop. dt = seconds since the last frame, clamped to 0.05.',
    `Reduced motion: every transition is only a fade of the cover color in and out, ${FIXED.FADE_TIME}s each way.`,
    'Reduced-motion still frame: the first page, no transition running.',
  ],
  interactionLines: [
    'Links are real buttons, so they work with the keyboard; the stage keeps touch-action: pan-y.',
  ],
};
