import type { Param } from '../types';
import { leanParams } from '../cursor-params';
import { FIXED } from './constants';

// Every number that shapes this scene is a param (owner, 2026-10-16).

export const params: Param[] = [
  /* ---------- Look ---------- */
  {
    kind: 'text',
    id: 'shapes',
    label: 'Shapes',
    help: 'Shapes to cycle through, separated by commas: circle, square, triangle, star, heart, blob, flower.',
    group: 'Look',
    maxLength: 60,
    default: 'circle, star, heart, blob',
    key: true,
    phrase: (v: string, all) =>
      `A full-screen canvas (100svh, at least 540px), transparent, cleared every frame. Cycle through these shapes in order, then around again: ${v}. The shape is centered, with its farthest point ${all.size}% of the short side across (diameter), so radius = short side × ${all.size} ÷ 100 ÷ 2.`,
  },
  {
    kind: 'slider',
    id: 'size',
    label: 'Shape size',
    help: 'How big the shape is, as a percentage of the shorter side of the screen.',
    group: 'Look',
    min: 20,
    max: 80,
    step: 1,
    default: 50,
    unit: '%',
    key: true,
    phrase: (v: number) => `Shape size ${v}%.`,
    phraseIn: 'shapes',
  },
  {
    kind: 'slider',
    id: 'layers',
    label: 'Ink layers',
    help: 'How many inks draw the shape (1 to 3).',
    group: 'Look',
    min: 1,
    max: 3,
    step: 1,
    default: 3,
    key: true,
    phrase: (v: number, all) =>
      `Draw the shape with ${v} ink layer${v === 1 ? '' : 's'}: layer L (0, 1, 2) is filled with the L-th accent color at ${all.layerAlpha} opacity using the blend mode above, and starts L × ${all.layerLag} of the morph time after the first, so its progress is p = clamp((seconds since the morph began − L × ${all.layerLag} × morph time) ÷ morph time, 0, 1); the morph is over when the last layer reaches 1. Each layer is a closed path through its 120 points, drawn ${all.inkShrink} × L smaller (scale 1 − L × ${all.inkShrink}) so the inks show as rings.`,
  },
  /* ---------- Motion ---------- */
  {
    kind: 'slider',
    id: 'duration',
    label: 'Morph time',
    help: 'How long each change of shape takes, in seconds.',
    group: 'Motion',
    min: 0.3,
    max: 3,
    step: 0.1,
    default: 1.2,
    unit: 's',
    key: true,
    phrase: (v: number, all) =>
      `Wait ${all.hold}s on each shape, then morph to the next over ${v}s: every point moves from its place in the old shape to the same-numbered point of the new shape by lerp(old, new, e), e = the ${all.feel} curve applied to the progress p (0 to 1).`,
  },
  {
    kind: 'slider',
    id: 'hold',
    label: 'Hold time',
    help: 'How long each shape rests before the next morph, in seconds.',
    group: 'Motion',
    min: 0,
    max: 5,
    step: 0.1,
    default: 1,
    unit: 's',
    phrase: (v: number) => `Hold ${v}s.`,
    phraseIn: 'duration',
  },
  {
    kind: 'select',
    id: 'feel',
    label: 'Easing',
    help: 'How the change of shape feels.',
    group: 'Motion',
    term: 'easing',
    options: [
      { value: 'smooth', label: 'Smooth' },
      { value: 'bouncy', label: 'Bouncy' },
      { value: 'snappy', label: 'Snappy' },
    ],
    default: 'bouncy',
    key: true,
    phrase: (v: string) =>
      v === 'smooth'
        ? 'Smooth easing is ease-in-out cubic: p < 0.5 ? 4p³ : 1 − (−2p + 2)³ ÷ 2.'
        : v === 'snappy'
          ? 'Snappy easing is ease-out expo: p = 1 ? 1 : 1 − 2^(−10p).'
          : `Bouncy easing is ease-out back with overshoot ${FIXED.OVERSHOOT}: 1 + 2.70158 × (p − 1)³ + ${FIXED.OVERSHOOT} × (p − 1)², so the shape overshoots the next one and settles back like jelly (e goes above 1).`,
  },
  /* ---------- Advanced ---------- */
  {
    kind: 'slider',
    id: 'layerLag',
    label: 'Ink lag',
    help: 'How far each extra ink trails the one before, as a share of the morph time.',
    group: 'Advanced',
    min: 0,
    max: 0.4,
    step: 0.01,
    default: 0.12,
    phrase: (v: number) => `Ink lag ${v}.`,
    phraseIn: 'layers',
  },
  {
    kind: 'slider',
    id: 'layerAlpha',
    label: 'Ink opacity',
    help: 'How see-through each ink layer is.',
    group: 'Advanced',
    min: 0.3,
    max: 1,
    step: 0.05,
    default: 0.85,
    phrase: (v: number) => `Ink opacity ${v}.`,
    phraseIn: 'layers',
  },
  {
    kind: 'slider',
    id: 'inkShrink',
    label: 'Ink shrink',
    help: 'How much smaller each extra ink is, so the colors show as rings.',
    group: 'Advanced',
    min: 0,
    max: 0.2,
    step: 0.01,
    default: 0.08,
    phrase: (v: number) => `Ink shrink ${v}.`,
    phraseIn: 'layers',
  },
  ...leanParams,
];
