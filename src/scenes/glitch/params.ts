import type { Param } from '../types';
import { FIXED } from './constants';

// Every number that shapes this scene is a param (owner, 2026-10-16).

export const params: Param[] = [
  /* ---------- Look ---------- */
  {
    kind: 'text',
    id: 'text',
    label: 'Your headline',
    help: 'The word or short phrase that glitches.',
    group: 'Look',
    maxLength: 16,
    default: 'glitch',
    key: true,
    phrase: (v: string, all) =>
      `A full-screen canvas (100svh, at least 540px), transparent, cleared every frame. The headline "${v}" is centered at ${FIXED.TEXT_Y * 100}% of the height, in Anybody weight ${all.weight} and font stretch ${all.width}%, font size = min(height × ${all.size}, width × ${FIXED.FIT} ÷ letter count × ${FIXED.EM_INV}), one line, textAlign center, textBaseline middle. When calm it is drawn once in the main text color. During a burst it is drawn as three color channels (one copy each in the first, second and third accent color, at ${FIXED.CHANNEL_ALPHA} opacity, with the blend mode above), cut into ${all.slices} horizontal slices of equal height, each slice shifted sideways. Draw each channel into its own offscreen image with ${FIXED.PAD} × the font size of padding so nothing is cut off, then draw the slices from it.`,
  },
  {
    kind: 'slider',
    id: 'slices',
    label: 'Slices',
    help: 'How many horizontal slices the headline tears into.',
    group: 'Look',
    min: 2,
    max: 20,
    step: 1,
    default: 8,
    key: true,
    phrase: (v: number) => `${v} slices.`,
    phraseIn: 'text',
  },
  {
    kind: 'slider',
    id: 'split',
    label: 'Color split',
    help: 'How far the three ink channels pull apart, in pixels. In the still frame it is the resting split.',
    group: 'Look',
    min: 0,
    max: 20,
    step: 1,
    default: 6,
    unit: 'px',
    key: true,
    phrase: (v: number) =>
      `Color split ${v}px: at the middle of a burst the first channel is moved ${v}px left, the third ${v}px right and the second stays put (multiply by the burst envelope below).`,
  },
  {
    kind: 'slider',
    id: 'intensity',
    label: 'Intensity',
    help: 'How violent a burst is: how many slices jump and how far.',
    group: 'Look',
    min: 0,
    max: 1,
    step: 0.05,
    default: 0.5,
    key: true,
    phrase: (v: number, all) =>
      `When a burst starts, give each slice a random sideways jump: with probability ${v} it jumps (otherwise 0), by (random between −1 and 1) × ${v} × ${all.jump} × the font size (one Math.random() for whether it jumps and one for how far, per slice, top to bottom; the same jumps for all three channels). The jumps are fixed for the whole burst.`,
  },
  /* ---------- Motion ---------- */
  {
    kind: 'slider',
    id: 'burst',
    label: 'Burst length',
    help: 'How long a burst lasts, in seconds.',
    group: 'Motion',
    min: 0.1,
    max: 1,
    step: 0.05,
    default: 0.3,
    unit: 's',
    key: true,
    phrase: (v: number) =>
      `A burst lasts ${v}s. Its envelope e rises and falls smoothly: e = sin(π × p), p = time into the burst ÷ ${v}. Slice jumps and the color split are multiplied by e, so the headline tears apart then snaps clean.`,
  },
  {
    kind: 'slider',
    id: 'autoEvery',
    label: 'Random glitch every',
    help: 'How often a burst happens by itself, in seconds. 0 turns it off.',
    group: 'Motion',
    min: 0,
    max: 10,
    step: 0.5,
    default: 4,
    unit: 's',
    key: true,
    phrase: (v: number) =>
      v === 0
        ? 'No automatic glitches: bursts only happen when the visitor triggers them.'
        : `A burst also starts by itself: after each burst, wait ${v}s × a random number between ${1 - FIXED.AUTO_SPREAD} and ${1 + FIXED.AUTO_SPREAD} before the next automatic one.`,
  },
  /* ---------- Interaction ---------- */
  {
    kind: 'toggle',
    id: 'hover',
    label: 'Burst on hover or tap',
    help: 'A burst starts when the pointer moves onto the headline, or when you tap it.',
    group: 'Interaction',
    default: true,
    phrase: (v: boolean) =>
      v
        ? 'A burst starts when the pointer moves onto the headline (its text box), and when the headline is clicked or tapped.'
        : 'Hovering and tapping do nothing: only the automatic glitches happen.',
  },
  /* ---------- Advanced ---------- */
  {
    kind: 'slider',
    id: 'size',
    label: 'Headline size',
    help: 'Headline height as a share of the stage height.',
    group: 'Advanced',
    min: 0.15,
    max: 0.6,
    step: 0.01,
    default: 0.3,
    phrase: (v: number) => `Size ${v}.`,
    phraseIn: 'text',
  },
  {
    kind: 'slider',
    id: 'weight',
    label: 'Letter weight',
    help: 'How heavy the letters are.',
    group: 'Advanced',
    min: 100,
    max: 900,
    step: 50,
    default: 900,
    phrase: (v: number) => `Weight ${v}.`,
    phraseIn: 'text',
  },
  {
    kind: 'slider',
    id: 'jump',
    label: 'Slice jump distance',
    help: 'The farthest a slice can jump, as a share of the font size.',
    group: 'Advanced',
    min: 0.05,
    max: 1,
    step: 0.05,
    default: 0.4,
    phrase: (v: number) => `Jump ${v}.`,
    phraseIn: 'intensity',
  },
  {
    kind: 'slider',
    id: 'width',
    label: 'Letter width',
    help: 'How wide the letters are (the font stretch).',
    group: 'Advanced',
    min: 50,
    max: 150,
    step: 5,
    default: 100,
    unit: '%',
    phrase: (v: number) => `Font stretch ${v}%.`,
    phraseIn: 'text',
  },
];
