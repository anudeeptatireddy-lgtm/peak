import type { Param } from '../types';
import { FIXED } from './constants';

// Every number that shapes this scene is a param (owner, 2026-10-16).

export const params: Param[] = [
  /* ---------- Look ---------- */
  {
    kind: 'text',
    id: 'text',
    label: 'Name',
    help: 'The name hidden behind the fog.',
    group: 'Look',
    maxLength: 16,
    default: 'Your brand',
    key: true,
    phrase: (v: string, all) =>
      `A full-screen canvas (100svh, at least 540px). Behind the glass there is a colorful scene: a linear gradient at ${FIXED.BACK_ANGLE}° through the three accent colors, with three soft circles on it in the accent colors at ${FIXED.BLOB_ALPHA} opacity (center x, center y, radius as shares of the width, the height and the short side: ${FIXED.BLOBS.map((b) => `(${b.join(', ')})`).join(', ')}), and the name "${v}" centered at ${FIXED.TEXT_Y * 100}% of the height in the main text color, Anybody weight ${FIXED.TEXT_WEIGHT}, font size min(height × ${FIXED.TEXT_SIZE}, width × ${FIXED.TEXT_FIT} ÷ letter count ÷ ${FIXED.TEXT_EM}). Over it lies a pane of fogged glass: a copy of that scene blurred by ${all.blur}px (draw it at 1 ÷ blur size, then scale it up by doubling with smoothing until it is full size), then covered with the surface color at ${all.fog} opacity. The fog is only where the fog amount is high: keep a fog amount from 0 (clear) to 1 (thick) for every ${FIXED.MASK_CELL}px square of the screen, all starting at 1, and show the sharp scene wherever it is low, blending smoothly: the picture you see is the sharp scene with the fogged copy over it at that cell's fog amount (build the fogged copy at ${FIXED.FOG_SCALE} × the screen size, mask it by the fog amounts, then scale it up).`,
  },
  {
    kind: 'slider',
    id: 'fog',
    label: 'Fog thickness',
    help: 'How white and thick the fog is. 0 is just blur.',
    group: 'Look',
    min: 0,
    max: 1,
    step: 0.05,
    default: 0.8,
    key: true,
    phrase: (v: number) => `Fog thickness ${v}.`,
    phraseIn: 'text',
  },
  {
    kind: 'slider',
    id: 'blur',
    label: 'Blur behind the fog',
    help: 'How blurry the scene is behind the fog, in pixels.',
    group: 'Look',
    min: 2,
    max: 40,
    step: 1,
    default: 16,
    unit: 'px',
    phrase: (v: number) => `Blur ${v}px.`,
    phraseIn: 'text',
  },
  /* ---------- Motion ---------- */
  {
    kind: 'slider',
    id: 'returnTime',
    label: 'Fog return',
    help: 'How long the fog takes to creep back over a wiped area, in seconds.',
    group: 'Motion',
    min: 2,
    max: 20,
    step: 1,
    default: 6,
    unit: 's',
    key: true,
    phrase: (v: number, all) =>
      `Every frame the fog creeps back: for each cell below 1, fog += dt ÷ ${v} × (${all.creep} + (1 − ${all.creep}) × the largest fog amount among its four neighbors), up to 1, so a wiped area refills from its edges inwards (use the real dt in seconds).`,
  },
  {
    kind: 'slider',
    id: 'creep',
    label: 'Even regrowth',
    help: 'How much of the fog return happens everywhere at once, instead of creeping in from the edges.',
    group: 'Advanced',
    min: 0,
    max: 1,
    step: 0.05,
    default: 0.3,
    phrase: (v: number) => `Even regrowth ${v}.`,
    phraseIn: 'returnTime',
  },
  /* ---------- Interaction ---------- */
  {
    kind: 'slider',
    id: 'wipe',
    label: 'Wipe width',
    help: 'How wide a wipe is, as a percentage of the screen width.',
    group: 'Interaction',
    min: 2,
    max: 20,
    step: 1,
    default: 6,
    unit: '%',
    key: true,
    phrase: (v: number) =>
      `While the pointer is over the canvas (a finger while it touches), wipe: walk along the pointer's path every few pixels and, around each point, clear the fog in a circle of radius ${v}% of the width ÷ 2 with a soft edge: set each cell's fog amount to at most smoothstep(0, 1, (distance − radius × (1 − ${FIXED.WIPE_EDGE})) ÷ (radius × ${FIXED.WIPE_EDGE})), so the center is fully clear and the edge fades back to fog.`,
  },
  {
    kind: 'slider',
    id: 'drip',
    label: 'Drip chance',
    help: 'How often beads form where you wipe and run down. 0 turns drips off.',
    group: 'Interaction',
    min: 0,
    max: 1,
    step: 0.05,
    default: 0.3,
    key: true,
    phrase: (v: number, all) =>
      v === 0
        ? 'There are no drips.'
        : `Drips: for every ${FIXED.DRIP_SPACING}px of wiping, with probability ${v} start one drip at the pointer's x and ${FIXED.DRIP_START} × the wipe radius below the pointer. A drip runs straight down at ${all.dripSpeed}px per second for a random distance between ${FIXED.DRIP_LEN / 2} and ${FIXED.DRIP_LEN} of the screen height (one Math.random() for the distance), clearing a line of half-width ${FIXED.DRIP_RADIUS}px as it goes, with a round bead of radius ${FIXED.DRIP_BEAD}px at its head drawn in the surface color at 0.8 opacity with a faint outline; it disappears when it stops, leaving the clear line to fill back in like any wiped area.`,
  },
  /* ---------- Advanced ---------- */
  {
    kind: 'slider',
    id: 'dripSpeed',
    label: 'Drip speed',
    help: 'How fast a drip runs down, in pixels per second.',
    group: 'Advanced',
    min: 20,
    max: 200,
    step: 10,
    default: 80,
    unit: 'px/s',
    phrase: (v: number) => `Drip speed ${v}px per second.`,
    phraseIn: 'drip',
  },
];
