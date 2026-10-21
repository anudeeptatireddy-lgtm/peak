import type { Param } from '../types';
import { leanParams } from '../cursor-params';

// Every number that shapes this scene is a param (owner, 2026-10-16).

const fmt = (v: number, d = 3) => String(Number(v.toFixed(d)));
const pct = (v: number) => `${fmt(v * 100, 1)}%`;

const message = (n: number, def: string): Param => ({
  kind: 'text',
  id: `msg${n}`,
  label: `Message ${n}`,
  help: n === 1 ? 'The first message on the board.' : 'Leave it empty to skip it.',
  group: 'Look',
  maxLength: 20,
  default: def,
  key: n === 1,
  phrase:
    n === 1
      ? (v: string, all) => {
          const list = [v, all.msg2, all.msg3, all.msg4]
            .map(String)
            .filter((s) => s.trim().length)
            .map((s) => `"${s.toUpperCase()}"`);
          return `The board shows these messages in turn, in capitals: ${list.join(', ')}. It has one tile per character of the longest message; shorter messages are centered with blank tiles (floor of half the spare tiles on the left).`;
        }
      : (v: string) => `Message ${n} is "${v}".`,
  ...(n === 1 ? {} : { phraseIn: 'msg1' }),
});

export const params: Param[] = [
  /* ---------- Look ---------- */
  message(1, 'NOW BOARDING'),
  message(2, 'GATE 50'),
  message(3, 'ON TIME'),
  message(4, ''),
  {
    kind: 'select',
    id: 'charset',
    label: 'Characters',
    help: 'Which characters each tile flips through.',
    group: 'Look',
    options: [
      { value: 'letters', label: 'Letters' },
      { value: 'alnum', label: 'Letters and numbers' },
    ],
    default: 'alnum',
    phrase: (v: string) =>
      `Each tile flips forward through the sequence "${v === 'letters' ? ' ABCDEFGHIJKLMNOPQRSTUVWXYZ' : ' ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'}" (${v === 'letters' ? 'letters' : 'letters and numbers'}, with a space first for blank), wrapping around; any character a message needs that isn't in it is added to the end. Every tile starts blank.`,
  },
  /* ---------- Motion ---------- */
  {
    kind: 'slider',
    id: 'flipSpeed',
    label: 'Flip time',
    help: 'How long one flap takes to fall.',
    group: 'Motion',
    min: 40,
    max: 300,
    step: 5,
    default: 90,
    unit: 'ms',
    key: true,
    phrase: (v: number, all) =>
      `One flip takes ${v}ms. In its first half the top flap (the old character's top half) falls forward: rotateX from 0 to −90deg with ease-in-quad, hinged at its bottom edge; behind it the static top already shows the new character's top. In its second half the bottom flap (the new character's bottom half) lands: rotateX from 90deg to 0 with ease-out-quad, hinged at its top edge, covering the old bottom. A moving flap is darkened: filter brightness(1 − ${all.shade} × how far it is from flat, 0 to 1). The tiles use perspective ${all.perspective} × the tile height and backface-visibility: hidden.`,
  },
  {
    kind: 'slider',
    id: 'stagger',
    label: 'Delay between tiles',
    help: 'Each tile starts flipping this much after the tile to its left.',
    group: 'Motion',
    term: 'stagger',
    min: 0,
    max: 120,
    step: 5,
    default: 30,
    unit: 'ms',
    key: true,
    phrase: (v: number) =>
      `To show a message, tile i (left to right) starts flipping ${v}ms × i later, then flips one character after another, back to back, until it reaches its character.`,
  },
  {
    kind: 'slider',
    id: 'hold',
    label: 'Time on each message',
    help: 'How long a message stays before the board flips to the next.',
    group: 'Motion',
    min: 1,
    max: 15,
    step: 0.5,
    default: 5,
    unit: 's',
    phrase: (v: number) =>
      `When every tile has landed, the message stays ${v}s, then the board flips to the next message (looping). A click or tap skips to the next message right away.`,
  },
  /* ---------- Advanced ---------- */
  {
    kind: 'slider',
    id: 'boardFit',
    label: 'Board width',
    help: 'The widest the board can be, as a share of the screen.',
    group: 'Advanced',
    min: 0.5,
    max: 0.98,
    step: 0.01,
    default: 0.9,
    phrase: (v: number, all) =>
      `Tile width = min(${all.tileMax}rem, ${pct(v)} of the section width ÷ (tiles + (tiles − 1) × ${all.gap})); tile height = ${all.tileRatio} × the width; tiles sit in one row, ${all.gap} × the tile width apart, centered in a full-screen section (100svh, at least 540px).`,
  },
  {
    kind: 'slider',
    id: 'tileMax',
    label: 'Largest tile',
    help: 'Tiles never get wider than this.',
    group: 'Advanced',
    min: 1.5,
    max: 6,
    step: 0.1,
    default: 3.6,
    unit: 'rem',
    phrase: (v: number) => `Tiles at most ${v}rem.`,
    phraseIn: 'boardFit',
  },
  {
    kind: 'slider',
    id: 'tileRatio',
    label: 'Tile shape',
    help: 'Tile height as a multiple of its width.',
    group: 'Advanced',
    min: 1.1,
    max: 2.2,
    step: 0.05,
    default: 1.5,
    phrase: (v: number) => `Tiles ${v}× tall.`,
    phraseIn: 'boardFit',
  },
  {
    kind: 'slider',
    id: 'gap',
    label: 'Tile gap',
    help: 'Space between tiles, as a share of the tile width.',
    group: 'Advanced',
    min: 0.02,
    max: 0.4,
    step: 0.01,
    default: 0.08,
    phrase: (v: number) => `Gap ${v}.`,
    phraseIn: 'boardFit',
  },
  {
    kind: 'slider',
    id: 'fontScale',
    label: 'Letter size',
    help: 'Letter size as a share of the tile height.',
    group: 'Advanced',
    min: 0.3,
    max: 0.95,
    step: 0.01,
    default: 0.54,
    phrase: (v: number, all) =>
      `A tile is a rounded rectangle (radius ${all.radius} × its width) in the surface color; its character is Anybody weight ${all.weight}, font size ${v} × the tile height, centered, in the main text color, with line-height equal to the tile height. Each half is an element with overflow: hidden showing the top or bottom half of the character, and a ${all.splitLine} × tile height line in the background color separates the halves.`,
  },
  {
    kind: 'slider',
    id: 'radius',
    label: 'Tile rounding',
    help: 'How round the tile corners are, as a share of the width.',
    group: 'Advanced',
    min: 0,
    max: 0.3,
    step: 0.01,
    default: 0.1,
    phrase: (v: number) => `Radius ${v}.`,
    phraseIn: 'fontScale',
  },
  {
    kind: 'slider',
    id: 'splitLine',
    label: 'Split line',
    help: 'Thickness of the line between the flap halves, as a share of the tile height.',
    group: 'Advanced',
    min: 0,
    max: 0.08,
    step: 0.005,
    default: 0.025,
    phrase: (v: number) => `Split ${v}.`,
    phraseIn: 'fontScale',
  },
  {
    kind: 'slider',
    id: 'weight',
    label: 'Weight',
    help: 'How bold the letters are.',
    group: 'Advanced',
    term: 'variable-font',
    min: 100,
    max: 900,
    step: 50,
    default: 700,
    phrase: (v: number) => `Weight ${v}.`,
    phraseIn: 'fontScale',
  },
  {
    kind: 'slider',
    id: 'perspective',
    label: 'Depth',
    help: 'Perspective distance, in tile heights. Smaller looks deeper.',
    group: 'Advanced',
    term: 'transform',
    min: 2,
    max: 12,
    step: 0.5,
    default: 5,
    phrase: (v: number) => `Perspective ${v}.`,
    phraseIn: 'flipSpeed',
  },
  {
    kind: 'slider',
    id: 'shade',
    label: 'Flap shading',
    help: 'How dark a flap gets while it turns.',
    group: 'Advanced',
    min: 0,
    max: 0.8,
    step: 0.05,
    default: 0.45,
    phrase: (v: number) => `Shade ${v}.`,
    phraseIn: 'flipSpeed',
  },
  ...leanParams,
];
