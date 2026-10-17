import type { SceneMeta } from '../types';
import { FIXED } from './constants';

export const meta: SceneMeta = {
  slug: 'loaders',
  title: 'Loading pack',
  summary:
    'Six original loading animations in plain CSS: dots, a bouncing trio, a ring, bars, a morphing square and an orbiting pair.',
  useCase: "Loading screens and spinners that don't look like everyone else's.",
  tags: ['Landing pages', 'Portfolio'],
  difficulty: 'Easy',
  minutes: 10,
  world: 'glacier',
  accessible: true,
  terms: ['stagger', 'easing', 'transform'],
  howItWorks: [
    'Each loader is a few tiny shapes and one CSS animation that repeats forever, so there is no JavaScript to slow your page down.',
    'Three of them use a **stagger**: every dot or bar starts its animation a little after the one before, which makes the motion travel along the row.',
    'The bouncing trio squashes on the ground and stretches in the air with a **transform**, like a rubber ball.',
    'The ring draws itself by shortening and lengthening a dashed outline.',
  ],
  whatElse: [
    'A loading screen for an app or a portfolio.',
    'A spinner on a button while a form sends.',
    'A pack of loaders for a design system.',
  ],
  wants:
    'A pack of six small, original loading animations made with plain CSS only: a dot chase, a bouncing trio, a self-drawing ring, stacking bars, a morphing square and an orbiting pair. Clicking one shows it big in the middle.',
  lookLines: [
    'Use plain CSS keyframes wherever possible, so each loader is easy to drop into any site.',
  ],
  behaviorLines: [
    'Under reduced motion every loader stays still, paused halfway through its loop.',
    `Reduced-motion still frame: every loader at ${FIXED.STILL_AT} of its loop.`,
  ],
  interactionLines: ['The grid cells are real buttons, so they work with the keyboard.'],
};
