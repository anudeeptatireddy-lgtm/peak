import type { SceneMeta } from '../types';
import { FIXED } from './constants';

export const meta: SceneMeta = {
  slug: 'fold',
  title: 'Paper fold',
  summary: 'A sheet with a headline folds and unfolds like origami as you scroll.',
  useCase: 'A storytelling landing page or an invitation.',
  tags: ['Landing pages', 'Events'],
  difficulty: 'Medium',
  minutes: 20,
  world: 'golden',
  terms: ['transform', 'easing', 'scroll-linked'],
  howItWorks: [
    'The sheet is cut into panels, and each panel is hinged to the one before it with a 3D **transform**, so a small turn at every crease adds up to a big fold.',
    'The fold is **scroll-linked**: how far you have scrolled sets how folded the paper should be, and the paper eases toward that, which feels like it has weight.',
    'Panels that tilt toward you are shaded darker and panels that tilt away are lighter, so the creases read as real paper.',
    'Scrolling further folds the sheet up small, then unfolds it again.',
  ],
  whatElse: [
    'A storytelling landing page that opens as you read.',
    'An invitation that unfolds to reveal the details.',
    'A product reveal where the box opens as you scroll.',
  ],
  wants:
    'A sheet of paper with a headline on it, cut into panels that fold and unfold like origami as I scroll. The creases shade as they bend, and at the end the sheet folds up small.',
  lookLines: [],
  behaviorLines: [
    'Run one requestAnimationFrame loop. dt = seconds since the last frame, clamped to 0.05; f = min(dt × 60, 2.5).',
    `Reduced-motion still frame: the sheet half folded (fold amount ${FIXED.STILL_FOLD}), nothing moving.`,
  ],
  interactionLines: [
    'Use the page scroll. The stage has touch-action: pan-y, so vertical swipes still scroll.',
  ],
};
