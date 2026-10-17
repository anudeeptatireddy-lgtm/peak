import type { Param } from '../types';
import { FIXED } from './constants';

// Every number that shapes this scene is a param (owner, 2026-10-16).

export const params: Param[] = [
  /* ---------- Look ---------- */
  {
    kind: 'text',
    id: 'pages',
    label: 'Page names',
    help: 'Three page names separated by commas.',
    group: 'Look',
    maxLength: 54,
    default: 'Home, Work, Contact',
    key: true,
    phrase: (v: string) =>
      `A tiny ${FIXED.PAGES}-page site in a full-screen section (100svh, at least 540px): a row of ${FIXED.PAGES} real link buttons at the top named ${v} (split at commas, trimmed, each cut to ${FIXED.MAX_NAME} characters, at least ${FIXED.NAV_HEIGHT}rem tall, the current one underlined), and below it the current page: its name as a heading in the main text color (${FIXED.TITLE_SIZE}rem, bold) with "${FIXED.BODY}" under it in the soft text color. The first page shows at the start. Clicking a link plays a transition, swaps the page halfway through it, and moves keyboard focus to the new page's heading.`,
  },
  {
    kind: 'select',
    id: 'style',
    label: 'Transition',
    help: 'The way one page gives way to the next.',
    group: 'Look',
    options: [
      { value: 'curtain', label: 'Curtain' },
      { value: 'wipe', label: 'Wipe' },
      { value: 'iris', label: 'Iris' },
      { value: 'slats', label: 'Slats' },
      { value: 'random', label: 'Random' },
    ],
    default: 'curtain',
    key: true,
    phrase: (v: string, all) =>
      `Transition: ${v}${v === 'random' ? ` (pick one of ${FIXED.STYLES.join(', ')} at random each time)` : ''}. A transition lasts ${all.duration}s with progress p from 0 to 1 (driven by the animation clock). Cover: c = the easing applied to clamp(2p, 0, 1); reveal: r = the easing applied to clamp(2p − 1, 0, 1). The page swaps at p = 0.5, when it is fully covered. The cover is drawn over the section in accent colors with the blend of normal painting. Curtain: two panels, the left one in the first accent and the right in the second, each half the width, with vertical dark stripes ${FIXED.FOLD}px wide at ${FIXED.FOLD_SHADE} opacity for folds; they slide in from the sides (translateX from ∓100% to 0 by c) and back out (to ∓100% by r). Wipe: one panel in the first accent whose right edge leans ${FIXED.WIPE_SKEW} of the width, polygon(0 0, X 0, X − ${FIXED.WIPE_SKEW} × width 100%, 0 100%), with X growing from 0 to (1 + ${FIXED.WIPE_SKEW}) × width by c and then its left edge following the same way by r. Iris: a full-section panel in the third accent clipped to a circle at the clicked point whose radius grows from 0 to the distance to the farthest corner by c, then shrinks back to 0 by r. Slats: ${all.slats} vertical slats alternating the three accents, each scaling in height from 0 to full by c and back by r, with slat i starting ${all.stagger}ms × i later than the one before.`,
  },
  {
    kind: 'slider',
    id: 'slats',
    label: 'Slat count',
    help: 'How many slats the Slats transition uses.',
    group: 'Look',
    min: 4,
    max: 20,
    step: 1,
    default: 10,
    phrase: (v: number) => `${v} slats.`,
    phraseIn: 'style',
  },
  /* ---------- Motion ---------- */
  {
    kind: 'slider',
    id: 'duration',
    label: 'Duration',
    help: 'How long a transition takes, in seconds.',
    group: 'Motion',
    min: 0.3,
    max: 2,
    step: 0.1,
    default: 0.9,
    unit: 's',
    key: true,
    phrase: (v: number) => `Duration ${v}s.`,
    phraseIn: 'style',
  },
  {
    kind: 'select',
    id: 'feel',
    label: 'Easing',
    help: 'How the cover and reveal accelerate.',
    group: 'Motion',
    term: 'easing',
    options: [
      { value: 'smooth', label: 'Smooth' },
      { value: 'snappy', label: 'Snappy' },
      { value: 'bouncy', label: 'Bouncy' },
    ],
    default: 'smooth',
    key: true,
    phrase: (v: string) =>
      v === 'smooth'
        ? 'Smooth easing is ease-in-out cubic: p < 0.5 ? 4p³ : 1 − (−2p + 2)³ ÷ 2.'
        : v === 'snappy'
          ? 'Snappy easing is ease-out expo: p = 1 ? 1 : 1 − 2^(−10p).'
          : 'Bouncy easing is ease-out back (overshoot 1.70158): 1 + 2.70158 × (p − 1)³ + 1.70158 × (p − 1)², so panels overshoot a little and settle.',
  },
  {
    kind: 'slider',
    id: 'stagger',
    label: 'Slat stagger',
    help: 'How much later each slat starts than the one before, in milliseconds.',
    group: 'Motion',
    min: 0,
    max: 150,
    step: 5,
    default: 60,
    unit: 'ms',
    phrase: (v: number) => `Slat stagger ${v}ms.`,
    phraseIn: 'style',
  },
];
