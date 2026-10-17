import type { Param } from '../types';
import { FIXED } from './constants';

// Every number that shapes this scene is a param (owner, 2026-10-16).

export const params: Param[] = [
  /* ---------- Look ---------- */
  {
    kind: 'select',
    id: 'featured',
    label: 'Show large',
    help: 'Which loader is shown big in the middle. Clicking a loader in the grid picks it too.',
    group: 'Look',
    options: FIXED.KINDS.map((k) => ({ value: k, label: FIXED.NAMES[k]! })),
    default: 'ring',
    key: true,
    phrase: (v: string, all) =>
      `A full-screen section (100svh, at least 540px) with six small loading animations in a grid under one big featured one (${FIXED.NAMES[v]}). Grid: ${FIXED.COLS} columns of two rows (${FIXED.COLS_SMALL} columns of three on screens under 700px wide); every cell is a real button at least 44px tall with a 2px border in the line color (the featured one's border in the main text color, aria-pressed true), with the loader centered. Clicking a cell makes it the featured one, shown ${FIXED.FEATURE_SCALE} × bigger in the middle above the grid. Use plain CSS keyframes only (no JavaScript animation, no libraries) so each loader can be copied into any site. Every loader is ${all.size}px square, its lines are ${all.thickness}px thick, its loops take (loop seconds ÷ ${all.speed}). Loop seconds: dot chase ${FIXED.LOOP.dots}, bouncing trio ${FIXED.LOOP.bounce}, ring ${FIXED.LOOP.ring}, stacking bars ${FIXED.LOOP.bars}, morphing square ${FIXED.LOOP.morph}, orbiting pair ${FIXED.LOOP.orbit}. Colors: ${all.colors === 'one' ? 'every loader uses the first accent color' : 'the three accents in turn: dots, bars and orbit pieces take the first, second and third accent by their position (the orbit pair uses the first and second); the ring uses the first, the bounce balls the second, the morphing square the third'}. The loaders: (1) Dot chase: three dots, each ${all.size}px × 0.25, 12% of the size apart, each scales 0.4 to 1 and back and fades 0.4 to 1 over the loop, each starting an eighth of the loop after the one before. (2) Bouncing trio: three balls of 0.26 × the size, bottom-aligned, 10% of the size apart, each squashes (scale 1.25 wide by 0.75 tall) on the ground and rises half the size while stretching to 0.9 by 1.1, ease-in-out, 0.15 of a loop apart. (3) Ring: an SVG circle (viewBox 100, radius 50 minus half the stroke, stroke width ${all.thickness} × 100 ÷ ${all.size}, round caps, pathLength 100) that draws itself (stroke-dashoffset 100 to 0 in the first half of the loop, then 0 to −100 so it erases from the start) while the whole SVG turns once every 1.4 loops. (4) Stacking bars: five bars, each ${all.thickness}px wide (at least 10% of the size) and as tall as the size, 8% apart, bottom-aligned, scaling in height from 0.2 to 1 and back, each starting a tenth of a loop after the one before. (5) Morphing square: a square outline (70% of the size, border ${all.thickness}px) whose corner radius goes 12% to 50% to 12% while it turns 360° and shrinks to 0.8 at the middle. (6) Orbiting pair: two dots of 0.22 × the size at the top and bottom of a faint circle (the same border thickness, 20% opacity) that turns once per loop.`,
  },
  {
    kind: 'slider',
    id: 'size',
    label: 'Size',
    help: 'How big each loader is, in pixels.',
    group: 'Look',
    min: 16,
    max: 120,
    step: 2,
    default: 48,
    unit: 'px',
    key: true,
    phrase: (v: number) => `Size ${v}px.`,
    phraseIn: 'featured',
  },
  {
    kind: 'slider',
    id: 'thickness',
    label: 'Line thickness',
    help: 'How thick the lines are, in pixels.',
    group: 'Look',
    min: 1,
    max: 10,
    step: 1,
    default: 4,
    unit: 'px',
    key: true,
    phrase: (v: number) => `Thickness ${v}px.`,
    phraseIn: 'featured',
  },
  {
    kind: 'select',
    id: 'colors',
    label: 'Colors',
    help: 'One accent color for every loader, or all three accents.',
    group: 'Look',
    options: [
      { value: 'one', label: 'One accent' },
      { value: 'all', label: 'All three' },
    ],
    default: 'all',
    phrase: (v: string) => `Colors ${v === 'one' ? 'one accent' : 'all three'}.`,
    phraseIn: 'featured',
  },
  /* ---------- Motion ---------- */
  {
    kind: 'slider',
    id: 'speed',
    label: 'Speed',
    help: 'How fast the loaders loop, as a multiple of their natural speed.',
    group: 'Motion',
    min: 0.25,
    max: 3,
    step: 0.05,
    default: 1,
    unit: '×',
    key: true,
    phrase: (v: number) => `Speed ${v}.`,
    phraseIn: 'featured',
  },
];
