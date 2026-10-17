import type { Param } from '../types';
import { FIXED } from './constants';

// Every number that shapes this scene is a param (owner, 2026-10-16).

export const params: Param[] = [
  /* ---------- Look ---------- */
  {
    kind: 'slider',
    id: 'segments',
    label: 'Mirror segments',
    help: 'How many wedges the picture is mirrored into.',
    group: 'Look',
    min: 3,
    max: 16,
    step: 1,
    default: 8,
    key: true,
    phrase: (v: number, all) =>
      `A full-screen canvas (100svh, at least 540px), transparent, cleared and redrawn every frame. The circle around the center is cut into ${v} wedges, each w = 2π ÷ ${v} wide. Draw only into one wedge (angles 0 to w) of a hidden same-size canvas: a point at angle θ from the center is folded into the wedge, θ' = (θ − turn angle) mod ${all.alternate ? '2w, then w × 2 − θ′ if it is above w' : 'w'}. Each frame draw that hidden canvas ${v} times around the center, clipped to the wedge: copy k is rotated by turn angle + k × w${all.alternate ? ', and every odd copy is rotated to (k + 1) × w and flipped, so neighbors mirror each other and the seams line up' : ''}.`,
  },
  {
    kind: 'toggle',
    id: 'alternate',
    label: 'Mirror every other segment',
    help: 'Flip every second wedge so neighbors mirror each other. Off repeats the same wedge.',
    group: 'Look',
    default: true,
    phrase: (v: boolean) =>
      v ? 'Every other wedge is mirrored.' : 'Every wedge is a plain rotated copy (no mirroring).',
    phraseIn: 'segments',
  },
  {
    kind: 'slider',
    id: 'brush',
    label: 'Brush size',
    help: 'How thick the drawn lines are, in pixels.',
    group: 'Look',
    min: 1,
    max: 20,
    step: 1,
    default: 4,
    unit: 'px',
    key: true,
    phrase: (v: number, all) =>
      `Strokes are lines ${v}px wide with round ends, drawn from the previous folded point to the new one at ${FIXED.STROKE_ALPHA} opacity (skip a line that jumps more than ${FIXED.SEAM_JUMP} of a wedge in one step, because it crossed a seam). The stroke color is one of the three accents, switching to the next every ${all.colorEvery}px drawn.`,
  },
  /* ---------- Motion ---------- */
  {
    kind: 'slider',
    id: 'turnSpeed',
    label: 'Turn speed',
    help: 'How fast the whole picture turns. 0 holds it still.',
    group: 'Motion',
    min: 0,
    max: 1,
    step: 0.01,
    default: 0.15,
    key: true,
    phrase: (v: number) =>
      `The turn angle increases by ${v} × ${FIXED.TURN_RATE} radians per second. Points you draw stay under the pointer: subtract the turn angle before folding.`,
  },
  {
    kind: 'slider',
    id: 'fade',
    label: 'Fade',
    help: 'How much old strokes fade each frame. 0 never fades; higher clears faster.',
    group: 'Motion',
    term: 'trail',
    min: 0,
    max: 0.1,
    step: 0.001,
    default: 0.01,
    key: true,
    phrase: (v: number) =>
      `Every frame, before drawing new strokes, erase ${v} × f of the hidden canvas (draw a full-size rectangle with destination-out at that opacity), so old strokes fade away.`,
  },
  /* ---------- Interaction ---------- */
  {
    kind: 'toggle',
    id: 'autoDraw',
    label: 'Draw by itself when idle',
    help: 'When nobody is drawing, a point wanders and draws for you.',
    group: 'Interaction',
    default: true,
    phrase: (v: boolean, all) =>
      v
        ? `Drawing follows the pointer while it is over the canvas (on touch: while a finger is held down after a ~250ms hold). Otherwise a point draws on its own: x = center x + short side × ${all.autoReach} × 0.5 × sin(t × ${all.autoSpeed} × ${FIXED.AUTO_X}), y = center y + short side × ${all.autoReach} × 0.5 × sin(t × ${all.autoSpeed} × ${FIXED.AUTO_Y} + ${FIXED.AUTO_PHASE}).`
        : 'Drawing happens only while the pointer is over the canvas (on touch: while a finger is held down after a ~250ms hold); nothing draws by itself.',
  },
  /* ---------- Advanced ---------- */
  {
    kind: 'slider',
    id: 'autoSpeed',
    label: 'Self-draw speed',
    help: 'How fast the wandering point moves.',
    group: 'Advanced',
    min: 0.2,
    max: 3,
    step: 0.05,
    default: 1,
    when: { id: 'autoDraw', is: [true] },
    phrase: (v: number) => `Self-draw speed ${v}.`,
    phraseIn: 'autoDraw',
  },
  {
    kind: 'slider',
    id: 'autoReach',
    label: 'Self-draw reach',
    help: 'How far from the center the wandering point goes, as a share of the short side.',
    group: 'Advanced',
    min: 0.2,
    max: 1,
    step: 0.05,
    default: 0.7,
    when: { id: 'autoDraw', is: [true] },
    phrase: (v: number) => `Self-draw reach ${v}.`,
    phraseIn: 'autoDraw',
  },
  {
    kind: 'slider',
    id: 'colorEvery',
    label: 'Color change distance',
    help: 'How many pixels of line are drawn before the color switches to the next accent.',
    group: 'Advanced',
    min: 20,
    max: 300,
    step: 10,
    default: 80,
    unit: 'px',
    phrase: (v: number) => `Color change every ${v}px.`,
    phraseIn: 'brush',
  },
];
