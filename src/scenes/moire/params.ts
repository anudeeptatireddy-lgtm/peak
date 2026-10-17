import type { Param } from '../types';
import { FIXED } from './constants';

// Every number that shapes this scene is a param (owner, 2026-10-16).

export const params: Param[] = [
  /* ---------- Look ---------- */
  {
    kind: 'select',
    id: 'pattern',
    label: 'Pattern',
    help: 'What each layer is made of: parallel lines, concentric rings or a grid of dots.',
    group: 'Look',
    options: [
      { value: 'lines', label: 'Lines' },
      { value: 'rings', label: 'Rings' },
      { value: 'dots', label: 'Dots' },
    ],
    default: 'rings',
    key: true,
    phrase: (v: string, all) =>
      `A full-screen canvas (100svh, at least 540px), transparent, cleared every frame, with ${all.layers} stacked layers of the same pattern (${v}), each drawn in its own accent color with the blend mode above. ${
        v === 'lines'
          ? `Lines: straight lines ${all.spacing}px apart, each ${all.thickness}px thick, running from top to bottom through the layer's center and across a square ${FIXED.COVER} × the screen diagonal wide.`
          : v === 'rings'
            ? `Rings: circles around the layer's center with radii ${all.spacing}px, ${Number(all.spacing) * 2}px, ${Number(all.spacing) * 3}px and so on out past ${FIXED.COVER} × the half diagonal, each stroked ${all.thickness}px thick.`
            : `Dots: a square grid of filled circles ${all.spacing}px apart, each ${all.thickness}px across, covering a square ${FIXED.COVER} × the screen diagonal wide.`
      } Layer 1 is centered on the screen and never moves. Layer 2 is moved by (offset x, offset y) and rotated by its turn angle about the screen center.`,
  },
  {
    kind: 'slider',
    id: 'spacing',
    label: 'Pattern spacing',
    help: 'Distance between lines, rings or dots in pixels. Smaller spacing is finer and moves more slowly.',
    group: 'Look',
    min: 3,
    max: 20,
    step: 1,
    default: 8,
    unit: 'px',
    key: true,
    phrase: (v: number) => `Spacing ${v}px.`,
    phraseIn: 'pattern',
  },
  {
    kind: 'slider',
    id: 'thickness',
    label: 'Line thickness',
    help: 'How thick the lines, rings or dots are in pixels.',
    group: 'Look',
    min: 0.5,
    max: 6,
    step: 0.5,
    default: 2,
    unit: 'px',
    key: true,
    phrase: (v: number) => `Thickness ${v}px.`,
    phraseIn: 'pattern',
  },
  {
    kind: 'slider',
    id: 'layers',
    label: 'Layers',
    help: 'How many patterns are stacked (2 or 3).',
    group: 'Look',
    min: 2,
    max: 3,
    step: 1,
    default: 2,
    phrase: (v: number) =>
      v === 3
        ? `Layer 3 is in the third accent color and moves ${FIXED.SECOND_SCALE} × as far and as much as layer 2 (the opposite way).`
        : 'Only two layers: layer 1 in the first accent color, layer 2 in the second.',
  },
  /* ---------- Motion ---------- */
  {
    kind: 'slider',
    id: 'drift',
    label: 'Idle drift',
    help: 'How much the pattern drifts by itself when the cursor is away. 0 holds it still.',
    group: 'Motion',
    min: 0,
    max: 1,
    step: 0.05,
    default: 0.3,
    key: true,
    phrase: (v: number, all) =>
      `With no pointer over the canvas, layer 2's target drifts: x = short side × ${all.swayReach} × ${v} × sin(t × ${all.swaySpeed}), y = short side × ${all.swayReach} × ${v} × sin(t × ${all.swaySpeed} × ${FIXED.SWAY_RATIO} + ${FIXED.SWAY_PHASE}), turn = ${all.turn}° × ${v} × sin(t × ${all.swaySpeed} × ${FIXED.TURN_RATIO}).`,
  },
  {
    kind: 'slider',
    id: 'follow',
    label: 'Follow speed',
    help: 'How eagerly the layer follows its target. The speed limit still applies.',
    group: 'Motion',
    term: 'lerp',
    min: 0.01,
    max: 0.3,
    step: 0.01,
    default: 0.08,
    phrase: (v: number, all) =>
      `Each frame layer 2 moves toward its target by a share 1 − (1 − ${v})^f of the remaining distance (slide and turn), but never by more than the speed caps below. h is the cap share for ${all.layers} layers.`,
  },
  /* ---------- Interaction ---------- */
  {
    kind: 'slider',
    id: 'turn',
    label: 'Turn with the cursor',
    help: 'How far the cursor can turn the second layer, in degrees.',
    group: 'Interaction',
    min: 0,
    max: 20,
    step: 1,
    default: 6,
    unit: '°',
    key: true,
    phrase: (v: number, all) =>
      `While the pointer is over the canvas (a finger while it touches), layer 2's target is: offset = (pointer − screen center) × ${all.slide}, turn = ${v}° × clamp((pointer x − center x) ÷ (width ÷ 2), −1, 1).`,
  },
  /* ---------- Advanced ---------- */
  {
    kind: 'slider',
    id: 'slide',
    label: 'Cursor slide',
    help: 'How far the layer slides per pixel the cursor moves from the center.',
    group: 'Advanced',
    min: 0,
    max: 0.5,
    step: 0.01,
    default: 0.15,
    phrase: (v: number) => `Cursor slide ${v}.`,
    phraseIn: 'turn',
  },
  {
    kind: 'slider',
    id: 'swaySpeed',
    label: 'Drift speed',
    help: 'How fast the idle drift cycles, in radians per second. The speed limit still applies.',
    group: 'Advanced',
    min: 0.05,
    max: 1,
    step: 0.05,
    default: 0.3,
    phrase: (v: number) => `Drift speed ${v}.`,
    phraseIn: 'drift',
  },
  {
    kind: 'slider',
    id: 'swayReach',
    label: 'Drift distance',
    help: 'How far the idle drift wanders, as a share of the shorter side.',
    group: 'Advanced',
    min: 0.02,
    max: 0.3,
    step: 0.01,
    default: 0.1,
    phrase: (v: number) => `Drift distance ${v}.`,
    phraseIn: 'drift',
  },
];
