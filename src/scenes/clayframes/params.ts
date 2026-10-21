import type { Param } from '../types';

// Every number that shapes this scene is a param (owner, 2026-10-16).

export const params: Param[] = [
  /* ---------- Look ---------- */
  {
    kind: 'text',
    id: 'text',
    label: 'Name',
    help: 'The name made of clay.',
    group: 'Look',
    maxLength: 14,
    default: 'Your brand',
    key: true,
    phrase: (v: string, all) =>
      `The name is "${v}". Once the Anybody font has loaded, draw it on a hidden canvas the size of the stage: weight ${all.weight}, centered at 55% of the height, font size ${all.letterSize}px, shrunk if needed so it is at most 90% of the width. Trace its outlines (marching squares at alpha 128), simplify them to within 0.6px and resample every 3px. A loop inside another loop is a hole in it; each outer loop with its holes is one clay piece, numbered left to right.`,
  },
  {
    kind: 'slider',
    id: 'letterSize',
    label: 'Letter size',
    help: 'Font size of the clay letters, in pixels.',
    group: 'Look',
    min: 40,
    max: 220,
    step: 5,
    default: 120,
    unit: 'px',
    key: true,
    phrase: (v: number) => `Letter size ${v}px.`,
    phraseIn: 'text',
  },
  {
    kind: 'slider',
    id: 'weight',
    label: 'Weight',
    help: 'How chunky the letters are.',
    group: 'Advanced',
    term: 'variable-font',
    min: 300,
    max: 900,
    step: 50,
    default: 850,
    phrase: (v: number) => `Weight ${v}.`,
    phraseIn: 'text',
  },
  {
    kind: 'slider',
    id: 'colorVar',
    label: 'Color variation',
    help: 'How much each clay piece’s color strays toward the next accent.',
    group: 'Advanced',
    min: 0,
    max: 1,
    step: 0.05,
    default: 0.3,
    phrase: (v: number) =>
      `Clay piece k is accent (k mod 3) + 1, mixed toward the next accent by ${v} × a seeded random amount, filled with the even-odd rule so holes stay open.`,
  },
  {
    kind: 'slider',
    id: 'jitter',
    label: 'Outline jitter',
    help: 'How much the outlines boil from frame to frame.',
    group: 'Look',
    min: 0,
    max: 1,
    step: 0.05,
    default: 0.5,
    key: true,
    phrase: (v: number) =>
      v > 0
        ? `Every frame, each outline point moves along its normal by ${v} × 2.2% of the letter size × (sin(s ÷ 26 + a) + 0.5 sin(s ÷ 13 + b)) ÷ 1.5, where s is the distance along its loop in px and a, b are new random phases for every loop and frame, so the clay boils like stop motion.`
        : 'The outlines do not boil.',
  },
  {
    kind: 'slider',
    id: 'clayTexture',
    label: 'Clay texture',
    help: 'How much grain the clay shows.',
    group: 'Look',
    min: 0,
    max: 1,
    step: 0.05,
    default: 0.5,
    phrase: (v: number) =>
      v > 0
        ? `Clay grain: specks scattered (seeded) over a 4px grid of letter pixels, 3 per 1,000 px² at full texture × ${v}, each a 1.6px dot at opacity ${v} × 0.35, alternating the light and shade inks; specks stay put.`
        : 'The clay is smooth, with no grain.',
  },
  {
    kind: 'slider',
    id: 'lighting',
    label: 'Lighting',
    help: 'How strongly light from the top left shapes the clay.',
    group: 'Advanced',
    min: 0,
    max: 1,
    step: 0.05,
    default: 0.6,
    phrase: (v: number) =>
      v > 0
        ? `Light comes from the top left. The shade ink is whichever of the background and text colors is darker, the light ink the other. Let o = ${v} × 3% of the letter size. Under the letters, fill them shifted by (o, o) in the shade ink at opacity ${v} × 0.35. Clipped to the letters, stroke the outlines shifted by (o, o) with a 2o-wide line in the light ink at opacity ${v} × 0.5, and shifted by (−o, −o) in the shade ink at opacity ${v} × 0.4.`
        : 'No lighting: the clay is flat.',
  },
  {
    kind: 'slider',
    id: 'edgeSoft',
    label: 'Edge softness',
    help: 'How soft the clay’s edges look.',
    group: 'Advanced',
    min: 0,
    max: 1,
    step: 0.05,
    default: 0.4,
    phrase: (v: number) =>
      v > 0
        ? `Before filling, stroke each piece's outline in its own color with a line ${v} × 3% of the letter size wide at opacity 0.35, for a soft rim.`
        : 'The edges are crisp.',
  },
  /* ---------- Motion ---------- */
  {
    kind: 'slider',
    id: 'fps',
    label: 'Frame rate',
    help: 'Frames per second; low rates look like stop motion.',
    group: 'Motion',
    term: 'frame-rate',
    min: 6,
    max: 24,
    step: 1,
    default: 12,
    key: true,
    phrase: (v: number) =>
      `The picture only changes ${v} times a second: keep a clock, and redraw only when 1 ÷ ${v} s has passed since the last frame; in between, leave the canvas as it is.`,
  },
  {
    kind: 'slider',
    id: 'relax',
    label: 'Relax time',
    help: 'Seconds for a thumbprint to fade back out of the clay.',
    group: 'Motion',
    min: 2,
    max: 30,
    step: 1,
    default: 10,
    unit: 's',
    phrase: (v: number) =>
      `A print's depth is 1 − smoothstep(0, ${v}, its age in seconds); prints at depth 0 are removed, and at most 40 are kept (oldest first out).`,
  },
  /* ---------- Interaction ---------- */
  {
    kind: 'slider',
    id: 'thumb',
    label: 'Thumbprint size',
    help: 'Width of a thumbprint, in pixels.',
    group: 'Interaction',
    min: 10,
    max: 80,
    step: 1,
    default: 36,
    unit: 'px',
    phrase: (v: number, all) =>
      `Clicking or tapping presses a thumbprint ${v}px wide (radius r = ${v} ÷ 2, height 0.78 × the width, at a random angle); pressing and dragging (on touch screens after a short hold) leaves one every 1.2 r of movement; a hovering mouse presses at depth 0.3 without leaving a print. After ${all.idleWait}s without input, an invisible finger presses a print at a random point on the letters every ${all.idleEvery}s. Clipped to the letters, a print is a darker ellipse in the shade ink at opacity depth × 0.28, 6 fingerprint ridges (concentric ellipses) at opacity depth × 0.3, and a lit rim (the lower-right half of its edge) in the light ink at opacity depth × 0.45.`,
  },
  {
    kind: 'slider',
    id: 'squish',
    label: 'Squish amount',
    help: 'How far a press pushes the clay’s outline.',
    group: 'Interaction',
    min: 0,
    max: 1,
    step: 0.05,
    default: 0.6,
    key: true,
    phrase: (v: number) =>
      v > 0
        ? `Each print pushes outline points within 1.3 r of it straight away from its center by depth × ${v} × 0.45 r × (1 − distance ÷ 1.3 r)², so the clay squishes.`
        : 'Prints do not move the outline.',
  },
  {
    kind: 'slider',
    id: 'idleWait',
    label: 'Idle wait',
    help: 'Seconds without input before the invisible finger starts.',
    group: 'Advanced',
    min: 1,
    max: 15,
    step: 0.5,
    default: 3,
    unit: 's',
    phrase: (v: number) => `Wait ${v}s.`,
    phraseIn: 'thumb',
  },
  {
    kind: 'slider',
    id: 'idleEvery',
    label: 'Idle press gap',
    help: 'Seconds between the invisible finger’s presses.',
    group: 'Advanced',
    min: 0.5,
    max: 6,
    step: 0.5,
    default: 1.5,
    unit: 's',
    phrase: (v: number) => `Every ${v}s.`,
    phraseIn: 'thumb',
  },
];
