import type { Param } from '../types';

// Every number that shapes this scene is a param (owner, 2026-10-16).

const fmt = (v: number, d = 3) => String(Number(v.toFixed(d)));
const pct = (v: number) => `${fmt(v * 100, 1)}%`;

const word = (n: number, def: string): Param => ({
  kind: 'text',
  id: `word${n}`,
  label: `Word ${n}`,
  help: n === 1 ? 'The first word on the poster.' : 'Leave it empty to use fewer words.',
  group: 'Look',
  maxLength: 12,
  default: def,
  key: n === 1,
  phrase:
    n === 1
      ? (v: string, all) => {
          const list = [v, all.word2, all.word3, all.word4]
            .map(String)
            .filter((s) => s.trim().length)
            .map((s) => `"${s.toUpperCase()}"`);
          return `The poster's words are ${list.join(', ')}, in capitals; cell i shows word (i mod the number of words).`;
        }
      : (v: string) => `Word ${n} is "${v}".`,
  ...(n === 1 ? {} : { phraseIn: 'word1' }),
});

export const params: Param[] = [
  /* ---------- Look ---------- */
  word(1, 'MOVE'),
  word(2, 'SHAPE'),
  word(3, 'TYPE'),
  word(4, 'TIME'),
  {
    kind: 'select',
    id: 'grid',
    label: 'Grid',
    help: 'How the poster is divided. Phones always use the stacked grid.',
    group: 'Look',
    options: [
      { value: '2x2', label: '2×2' },
      { value: '3x3', label: '3×3' },
      { value: 'stacked', label: 'Stacked' },
    ],
    default: '2x2',
    key: true,
    phrase: (v: string, all) =>
      `The poster is a ${v === 'stacked' ? 'single column with one row per word' : `${v.replace('x', '×')} grid`} (always the single column on screens under 700px wide), ${pct(Number(all.posterFit))} of the section's width and ${all.posterAspect} × that tall, centered in a full-screen section (100svh, at least 540px). Every cell holds one word in Anybody weight ${all.weight}, font-stretch ${all.width}%, in the main text color, sized so it is ${pct(Number(all.fill))} of the cell's width, centered. A click or tap switches to the next grid (2×2, 3×3, stacked, then back).`,
  },
  {
    kind: 'toggle',
    id: 'colorBlocks',
    label: 'Color blocks',
    help: 'Blocks of color slide in behind some words.',
    group: 'Look',
    default: true,
    phrase: (v: boolean) =>
      v
        ? 'A "block" move toggles a block of color behind the word: it slides in from the left edge of the cell (scaleX 0 → 1, transform-origin left) in accent (cell index mod 3), and the word turns the background color; the next block move on that cell slides it out to the right.'
        : 'There are no color blocks: leave "block" moves out of the pattern.',
  },
  {
    kind: 'toggle',
    id: 'rotate',
    label: 'Allow turns',
    help: 'Words can turn 90° on the beat.',
    group: 'Look',
    default: true,
    phrase: (v: boolean) =>
      v
        ? 'A "turn" move turns the word a quarter turn (to 90°, or back to 0° if it is already turned).'
        : 'Words never turn: leave "turn" moves out of the pattern.',
  },
  /* ---------- Motion ---------- */
  {
    kind: 'slider',
    id: 'tempo',
    label: 'Tempo',
    help: 'Beats per minute: one move per beat.',
    group: 'Motion',
    min: 40,
    max: 160,
    step: 1,
    default: 96,
    unit: ' bpm',
    key: true,
    phrase: (v: number, all) =>
      `On every beat (60 ÷ ${v} seconds apart, from when the animation starts), make one move from the repeating pattern scale, turn, swap, block, scale, block, turn, swap (minus any moves that are switched off), on cell (beat number × 5) mod the number of cells. A "scale" move grows the word to ${all.scaleAmt}× and back within one beat (scale = 1 + (${all.scaleAmt} − 1) × sin(π × progress)). A "swap" move trades the cell's place with the cell (cell + 1 + beat mod (cells − 1)) mod cells, both sliding to their new places. Moves other than scale take ${all.moveBeats} of a beat.`,
  },
  {
    kind: 'select',
    id: 'feel',
    label: 'Motion feel',
    help: 'How each move eases.',
    group: 'Motion',
    term: 'easing',
    options: [
      { value: 'soft', label: 'Soft' },
      { value: 'snappy', label: 'Snappy' },
      { value: 'mechanical', label: 'Mechanical' },
    ],
    default: 'snappy',
    key: true,
    phrase: (v: string) =>
      v === 'soft'
        ? 'Moves ease with ease-in-out-cubic (soft).'
        : v === 'snappy'
          ? 'Moves ease with ease-out-back (snappy: they overshoot a little and settle).'
          : 'Moves are mechanical: linear, finished in 0.3 of the usual move time, then they hold.',
  },
  /* ---------- Advanced ---------- */
  {
    kind: 'slider',
    id: 'scaleAmt',
    label: 'Scale-up size',
    help: 'How big a word grows on a scale move.',
    group: 'Advanced',
    term: 'transform',
    min: 1.1,
    max: 2,
    step: 0.05,
    default: 1.4,
    phrase: (v: number) => `Grows to ${v}×.`,
    phraseIn: 'tempo',
  },
  {
    kind: 'slider',
    id: 'moveBeats',
    label: 'Move length',
    help: 'How much of a beat each move takes.',
    group: 'Advanced',
    min: 0.2,
    max: 1,
    step: 0.05,
    default: 0.5,
    phrase: (v: number) => `Moves take ${v} beat.`,
    phraseIn: 'tempo',
  },
  {
    kind: 'slider',
    id: 'posterFit',
    label: 'Poster width',
    help: 'Poster width as a share of the screen.',
    group: 'Advanced',
    min: 0.4,
    max: 0.98,
    step: 0.01,
    default: 0.82,
    phrase: (v: number) => `Poster ${pct(v)} wide.`,
    phraseIn: 'grid',
  },
  {
    kind: 'slider',
    id: 'posterAspect',
    label: 'Poster shape',
    help: 'Poster height as a multiple of its width.',
    group: 'Advanced',
    min: 0.4,
    max: 1.4,
    step: 0.05,
    default: 0.6,
    phrase: (v: number) => `Poster ${v}× tall.`,
    phraseIn: 'grid',
  },
  {
    kind: 'slider',
    id: 'fill',
    label: 'Word fill',
    help: 'How much of its cell a word fills, side to side.',
    group: 'Advanced',
    min: 0.4,
    max: 0.95,
    step: 0.01,
    default: 0.8,
    phrase: (v: number) => `Words fill ${pct(v)}.`,
    phraseIn: 'grid',
  },
  {
    kind: 'slider',
    id: 'weight',
    label: 'Weight',
    help: 'How bold the words are.',
    group: 'Advanced',
    term: 'variable-font',
    min: 100,
    max: 900,
    step: 50,
    default: 850,
    phrase: (v: number) => `Weight ${v}.`,
    phraseIn: 'grid',
  },
  {
    kind: 'slider',
    id: 'width',
    label: 'Letter width',
    help: 'The font’s width axis, in percent.',
    group: 'Advanced',
    min: 50,
    max: 150,
    step: 5,
    default: 110,
    unit: '%',
    phrase: (v: number) => `Width ${v}%.`,
    phraseIn: 'grid',
  },
];
