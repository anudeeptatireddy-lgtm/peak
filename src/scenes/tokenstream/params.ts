import type { Param } from '../types';
import { sweepParams } from '../cursor-params';

// Every number that shapes this scene is a param (owner, 2026-10-16).

const fmt = (v: number, d = 3) => String(Number(v.toFixed(d)));
const pct = (v: number) => `${fmt(v * 100, 1)}%`;

/** The sentence around the name; NAME is replaced by the visitor's name. */
export const SENTENCES: Record<string, string> = {
  hello: 'Say hello to NAME, made for you.',
  launch: 'Today we launch NAME for everyone.',
  story: 'Write a short story about NAME.',
};

const STACKS: Record<string, string> = {
  column:
    'one column centered half a bar’s room (0.3 + 2.4 chip heights) left of the middle, so chips and bars together are centered, chips 1.15 chip heights apart, using a font small enough that the column is at most 50% of the height (and at most 1.1 × the sentence size)',
  grid: 'a grid of ceil(√chunks) columns, each as wide as the widest chip plus its bar room, centered the same way, rows 1.15 chip heights apart, using a font small enough that the grid is at most 50% of the height and 92% of the width (and at most 1.1 × the sentence size)',
};

export const params: Param[] = [
  /* ---------- Look ---------- */
  {
    kind: 'text',
    id: 'text',
    label: 'Name',
    help: 'The name the chunks reassemble into.',
    group: 'Look',
    maxLength: 14,
    default: 'Your brand',
    key: true,
    phrase: (v: string, all) =>
      `The name is "${v}". Once the Anybody font has loaded, the finished name is set in Anybody weight ${all.weight}, centered at 60% of the height, font size = height × ${all.textHeight}, shrunk if needed so the docked chips are at most ${pct(Number(all.fitWidth))} of the width. Each name chunk docks where its letters sit in that line, moved right by (2 × 0.18 + 0.05) × the font size for every chunk before it, so the chips sit side by side with thin seams.`,
  },
  {
    kind: 'select',
    id: 'sentence',
    label: 'Sentence shown',
    help: 'The sentence the name appears in before it is split.',
    group: 'Advanced',
    options: [
      { value: 'hello', label: 'Say hello' },
      { value: 'launch', label: 'Launch' },
      { value: 'story', label: 'Story' },
    ],
    default: 'hello',
    phrase: (v: string) =>
      `The sentence (the "${v}" one) reads "${SENTENCES[v]}", with the name in place of NAME, set in Anybody weight 600, centered at 24% of the height, at the largest font size (up to 6% of the height) where the whole line, gaps included, is at most 92% of the width. If that is under 20px, break the line before the word start nearest its middle and fit the longer of the two lines instead; the lines sit 1.15 chip heights apart.`,
  },
  {
    kind: 'slider',
    id: 'chunk',
    label: 'Chunk size',
    help: 'How many letters each chunk holds, at most.',
    group: 'Look',
    min: 1,
    max: 6,
    step: 1,
    default: 3,
    key: true,
    phrase: (v: number) =>
      `Split the sentence into chunks the way a language model splits text into tokens: each word (and each punctuation mark on its own) is cut into pieces of at most ${v} letters from the left. The name's own chunks are the ones that will dock.`,
  },
  {
    kind: 'slider',
    id: 'chunkColors',
    label: 'Chunk colors',
    help: 'How many of the world’s accents the chunks use.',
    group: 'Advanced',
    min: 1,
    max: 3,
    step: 1,
    default: 3,
    phrase: (v: number) =>
      `Chunk i keeps one color the whole way: accent (i mod ${v}) + 1, mixed 25% toward the background, drawn as a chip 1.35 font sizes tall with 0.18 font sizes of padding each side and corners rounded by 0.25 of its height; its text is the text color, adjusted until it has a contrast of at least 4.5 with the chip.`,
  },
  {
    kind: 'slider',
    id: 'lines',
    label: 'Line opacity',
    help: 'How visible the thin lines linking related chunks are.',
    group: 'Look',
    min: 0,
    max: 1,
    step: 0.05,
    default: 0.4,
    phrase: (v: number, all) =>
      v > 0
        ? `Thin 1px lines in the soft text color at opacity ${v} link related chunks: each chunk to the next piece of the same word, plus ${all.lineCount} extra seeded links from a name chunk to a random other chunk. Each is a curve bowing upward by 35% of its length, drawn behind the chips; they fade in as the sentence splits and stay to the end.`
        : 'No link lines are drawn.',
  },
  {
    kind: 'slider',
    id: 'lineCount',
    label: 'Line count',
    help: 'How many extra links join the name’s chunks to others.',
    group: 'Advanced',
    min: 0,
    max: 40,
    step: 1,
    default: 12,
    phrase: (v: number) => `Links ${v}.`,
    phraseIn: 'lines',
  },
  {
    kind: 'select',
    id: 'stack',
    label: 'Stack layout',
    help: 'How the chunks line up while they are weighed.',
    group: 'Advanced',
    options: [
      { value: 'column', label: 'Column' },
      { value: 'grid', label: 'Grid' },
    ],
    default: 'column',
    phrase: (v: string) => `The stack (${v}) is centered at 55% of the height: ${STACKS[v]}.`,
  },
  {
    kind: 'select',
    id: 'quality',
    label: 'Quality',
    help: 'High draws small shadows under the chips; fast skips them.',
    group: 'Advanced',
    options: [
      { value: 'high', label: 'High' },
      { value: 'fast', label: 'Fast' },
    ],
    default: 'high',
    phrase: (v: string) =>
      v === 'high'
        ? 'High quality: each chip has a shadow, the same rounded shape in the line color, 0.12 chip heights lower.'
        : 'Quality is fast: no chip shadows.',
  },
  /* ---------- Motion ---------- */
  {
    kind: 'slider',
    id: 'shuffle',
    label: 'Shuffle time',
    help: 'Seconds per swap while the chunks are weighed.',
    group: 'Motion',
    min: 0.2,
    max: 2,
    step: 0.1,
    default: 0.8,
    unit: 's',
    phrase: (v: number) =>
      `Stage 4, weighing: every ${v}s two random chips in the stack swap places (seeded). Each chip eases toward its slot by 1 − e^(−dt × 4 ÷ ${v}) per frame and swings sideways by 0.35 × the height it still has to travel, so chips pass beside each other. Each chip shows a weight bar to its right (0.3 chip heights away, 0.22 thick, up to 2.4 chip heights long, in its color): weights start at 0.5 and over the stage rise to 0.9 for the name's chunks and sink to 0.2 for the rest, wobbling by ±0.12 at 1.7 cycles a second; bars fade in over the stage's first half and out as docking runs.`,
  },
  {
    kind: 'slider',
    id: 'overshoot',
    label: 'Snap overshoot',
    help: 'How far each chunk overshoots as it snaps into the name.',
    group: 'Motion',
    term: 'easing',
    min: 0,
    max: 0.5,
    step: 0.05,
    default: 0.2,
    key: true,
    phrase: (v: number) =>
      `Stage 5, docking: each name chunk moves from its stack slot to its place in the finished name, growing to the name's font size, with back-out easing 1 + (s + 1)(t − 1)³ + s(t − 1)², s = ${v} × 8.5, so it snaps in and settles. The other chunks fade out and sink 1.5 chip heights.`,
  },
  {
    kind: 'slider',
    id: 'stagger',
    label: 'Stagger',
    help: 'How spread out in time the chunks move, from together to one after another.',
    group: 'Advanced',
    term: 'stagger',
    min: 0,
    max: 0.9,
    step: 0.05,
    default: 0.5,
    phrase: (v: number) =>
      `Stage 3, stacking: every chunk flies from the sentence to its slot in the stack, shrinking or growing to the stack's font size, with cubic in-out easing. In stages 3 and 5 chunk i of n starts at (i ÷ (n − 1)) × ${v} of the stage and takes the rest (1 − ${v}), a stagger.`,
  },
  /* ---------- Interaction ---------- */
  {
    kind: 'slider',
    id: 'scrub',
    label: 'Scroll for the whole story',
    help: 'Pixels of scrolling that play every stage.',
    group: 'Interaction',
    term: 'scroll-linked',
    min: 500,
    max: 6000,
    step: 100,
    default: 2400,
    unit: 'px',
    phrase: (v: number, all) =>
      `A progress P from 0 to 1 plays five equal stages: 1, the sentence types in letter by letter as plain text; 2, gaps of 0.4 × the font size open between chunks and the chips fade in behind them; 3, stacking; 4, weighing; 5, docking. P starts (and restarts) at 0.2, with the sentence already typed. Scrolling changes P by (scroll change in px) ÷ ${v}; a sideways drag does the same. After ${all.idleWait}s without input, P plays by itself to 1 over ${all.idleTime}s, holds ${all.idleHold}s, plays back to 0 at the same pace, and repeats. On the scene's own page the scroll is an invisible endless scroll area over the canvas, so the page itself doesn't move.`,
  },
  /* ---------- Advanced ---------- */
  {
    kind: 'slider',
    id: 'idleWait',
    label: 'Idle wait',
    help: 'Seconds without scrolling before the story plays by itself.',
    group: 'Advanced',
    min: 0.5,
    max: 10,
    step: 0.5,
    default: 1.5,
    unit: 's',
    phrase: (v: number) => `Wait ${v}s.`,
    phraseIn: 'scrub',
  },
  {
    kind: 'slider',
    id: 'idleTime',
    label: 'Idle story time',
    help: 'Seconds for the whole story when it plays by itself.',
    group: 'Advanced',
    min: 4,
    max: 30,
    step: 1,
    default: 12,
    unit: 's',
    phrase: (v: number) => `Play ${v}s.`,
    phraseIn: 'scrub',
  },
  {
    kind: 'slider',
    id: 'idleHold',
    label: 'Idle rest',
    help: 'Seconds the finished name stays before the story plays back.',
    group: 'Advanced',
    min: 0,
    max: 10,
    step: 0.5,
    default: 3,
    unit: 's',
    phrase: (v: number) => `Rest ${v}s.`,
    phraseIn: 'scrub',
  },
  {
    kind: 'slider',
    id: 'textHeight',
    label: 'Name size',
    help: 'Font size of the finished name as a share of the screen height.',
    group: 'Advanced',
    min: 0.08,
    max: 0.4,
    step: 0.01,
    default: 0.14,
    phrase: (v: number) => `Height ${v}.`,
    phraseIn: 'text',
  },
  {
    kind: 'slider',
    id: 'fitWidth',
    label: 'Widest name',
    help: 'The finished name never gets wider than this share of the screen.',
    group: 'Advanced',
    min: 0.4,
    max: 0.95,
    step: 0.01,
    default: 0.86,
    phrase: (v: number) => `At most ${pct(v)}.`,
    phraseIn: 'text',
  },
  {
    kind: 'slider',
    id: 'weight',
    label: 'Weight',
    help: 'How bold the finished name is.',
    group: 'Advanced',
    term: 'variable-font',
    min: 300,
    max: 900,
    step: 50,
    default: 750,
    phrase: (v: number) => `Weight ${v}.`,
    phraseIn: 'text',
  },
  ...sweepParams(2400),
];
