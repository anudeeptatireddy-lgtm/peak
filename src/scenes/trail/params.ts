import type { Param } from '../types';
import { FIXED } from './constants';

// Every number that shapes this scene is a param (owner, 2026-10-16).

export const params: Param[] = [
  /* ---------- Look ---------- */
  {
    kind: 'select',
    id: 'look',
    label: 'Look',
    help: 'What the trail is made of: a smooth ribbon, a round-headed snake, or separate dots.',
    group: 'Look',
    options: [
      { value: 'ribbon', label: 'Ribbon' },
      { value: 'snake', label: 'Snake' },
      { value: 'dots', label: 'Dots' },
    ],
    default: 'ribbon',
    key: true,
    phrase: (v: string, all) =>
      `A full-screen canvas (100svh, at least 540px), transparent, cleared every frame. A chain of ${all.length} points: point 0 (the head) follows a target, and every other point follows the one before it. Width of point i (0 = head, ${Number(all.length) - 1} = tail) is ${all.width}px × (1 − ${all.taper} × i ÷ ${Number(all.length) - 1}). ${
        v === 'ribbon'
          ? `Ribbon: a smooth Catmull-Rom curve through the points (${FIXED.SAMPLES} samples per link), drawn as a strip: offset each sample by half its width along the curve's normal on both sides and fill the shape, as small quads one per link.`
          : v === 'snake'
            ? `Snake: for each link draw a line with round caps from point i to point i + 1, as wide as point i, overlapping the next by ${FIXED.OVERLAP}.`
            : 'Dots: a filled circle at each point with radius half its width.'
      } Colors: ${all.color === 'one' ? 'the whole trail is the first accent color.' : `blend through the accents along the trail, the first accent at the head, the second at ${FIXED.MIDDLE} of the way, the third at the tail, mixed in OKLab.`} A glow: first draw the same trail again, ${FIXED.GLOW_SCALE} × as wide, at ${all.glow} × ${FIXED.GLOW_ALPHA} opacity with the blend mode above (a flat second accent color, or the first for one accent); then draw the trail itself with normal blending (source-over). Leave the normal cursor visible.`,
  },
  {
    kind: 'slider',
    id: 'length',
    label: 'Length',
    help: 'How many points the trail has. More points make a longer trail.',
    group: 'Look',
    min: 5,
    max: 120,
    step: 5,
    default: 40,
    key: true,
    phrase: (v: number) => `${v} points.`,
    phraseIn: 'look',
  },
  {
    kind: 'slider',
    id: 'width',
    label: 'Width',
    help: 'How thick the head of the trail is, in pixels.',
    group: 'Look',
    min: 2,
    max: 40,
    step: 1,
    default: 14,
    unit: 'px',
    key: true,
    phrase: (v: number) => `Width ${v}px.`,
    phraseIn: 'look',
  },
  {
    kind: 'slider',
    id: 'taper',
    label: 'Taper',
    help: 'How much thinner the tail is than the head. 0 keeps it the same; 1 ends in a point.',
    group: 'Look',
    min: 0,
    max: 1,
    step: 0.05,
    default: 0.8,
    phrase: (v: number) => `Taper ${v}.`,
    phraseIn: 'look',
  },
  {
    kind: 'select',
    id: 'color',
    label: 'Color',
    help: 'One accent color, or a blend through all three along the trail.',
    group: 'Look',
    options: [
      { value: 'one', label: 'One accent' },
      { value: 'blend', label: 'Blend' },
    ],
    default: 'blend',
    phrase: (v: string) => `Color ${v === 'one' ? 'one accent' : 'blend'}.`,
    phraseIn: 'look',
  },
  {
    kind: 'slider',
    id: 'glow',
    label: 'Glow',
    help: 'How strong the soft glow around the trail is. 0 turns it off.',
    group: 'Look',
    min: 0,
    max: 1,
    step: 0.05,
    default: 0.6,
    phrase: (v: number) => `Glow ${v}.`,
    phraseIn: 'look',
  },
  /* ---------- Motion ---------- */
  {
    kind: 'slider',
    id: 'follow',
    label: 'Follow tightness',
    help: 'How closely each point follows the one before it. Higher is tighter and shorter-lagging.',
    group: 'Motion',
    term: 'lerp',
    min: 0.05,
    max: 0.6,
    step: 0.01,
    default: 0.3,
    key: true,
    phrase: (v: number, all) =>
      `Each frame, with f = min(dt × 60, 2.5) and k = 1 − (1 − ${v})^f: the head moves toward the target by lerp(head, target, k), and then each point i from 1 to the tail moves toward the already-moved point i − 1 by lerp(point i, point i − 1, k). The target is the pointer while it is over the canvas (a finger while it touches). When nobody is pointing it swims by itself: x = center x + width × ${all.swimReach} × sin(t × ${all.swimSpeed} × ${FIXED.IDLE_X}), y = center y + height × ${all.swimReach} × sin(t × ${all.swimSpeed} × ${FIXED.IDLE_Y} + ${FIXED.IDLE_PHASE}). All points start at the center.`,
  },
  /* ---------- Advanced ---------- */
  {
    kind: 'slider',
    id: 'swimSpeed',
    label: 'Swim speed',
    help: 'How fast the trail swims around by itself when nobody is pointing.',
    group: 'Advanced',
    min: 0.2,
    max: 2,
    step: 0.05,
    default: 0.6,
    phrase: (v: number) => `Swim speed ${v}.`,
    phraseIn: 'follow',
  },
  {
    kind: 'slider',
    id: 'swimReach',
    label: 'Swim reach',
    help: 'How far from the middle the trail swims, as a share of the screen.',
    group: 'Advanced',
    min: 0.1,
    max: 0.45,
    step: 0.01,
    default: 0.3,
    phrase: (v: number) => `Swim reach ${v}.`,
    phraseIn: 'follow',
  },
];
