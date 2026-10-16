import type { Param } from '../types';

const fmt = (v: number, d = 3) => String(Number(v.toFixed(d)));

export const params: Param[] = [
  {
    kind: 'text',
    id: 'text',
    label: 'Your word',
    help: 'The word the dots spell. Short words look best.',
    group: 'Look',
    maxLength: 12,
    default: 'peak',
    key: true,
    rebuild: true,
    phrase: (v: string) =>
      `The word is "${v}", set in Anybody at weight 900 and its widest width, as large as fits within 82% of the screen width (92% on screens under 700px).`,
  },
  {
    kind: 'slider',
    id: 'density',
    label: 'How many dots',
    help: 'The most dots the word can use. More dots look finer but cost more.',
    group: 'Look',
    term: 'particle-system',
    min: 1000,
    max: 6000,
    step: 100,
    default: 3800,
    rebuild: true,
    phrase: (v: number) =>
      `Use at most about ${v.toLocaleString('en-US')} dots on desktop and 45% of that on screens under 700px wide: sample the word on a grid and widen the grid until the count fits.`,
  },
  {
    kind: 'slider',
    id: 'dotSize',
    label: 'Dot size',
    help: 'How big each dot is, relative to the spacing between dots.',
    group: 'Look',
    min: 0.5,
    max: 1.5,
    step: 0.05,
    default: 1,
    unit: '×',
    phrase: (v: number) =>
      `Each dot's radius is between ${fmt(0.32 * v)} and ${fmt(0.54 * v)} times the grid spacing (picked at random per dot).`,
  },
  {
    kind: 'slider',
    id: 'stiffness',
    label: 'Snap-back strength',
    help: 'How strongly each dot is pulled back home. Higher snaps back faster.',
    group: 'Motion',
    term: 'stiffness',
    key: true,
    min: 0.005,
    max: 0.1,
    step: 0.0005,
    default: 0.0375,
    phrase: (v: number) =>
      `Each dot is tied to its home by a spring with stiffness around ${fmt(v, 4)}, randomized per dot between ${fmt(v * 0.533, 4)} and ${fmt(v * 1.467, 4)} so they arrive at different times (higher snaps back faster).`,
  },
  {
    kind: 'slider',
    id: 'bounce',
    label: 'Bounciness',
    help: 'How much speed each dot keeps every frame. Closer to 1 is bouncier and slower to settle.',
    group: 'Motion',
    term: 'damping',
    key: true,
    min: 0.7,
    max: 0.97,
    step: 0.01,
    default: 0.86,
    phrase: (v: number) =>
      `Damping: multiply each dot's velocity by ${fmt(v, 2)} every frame (closer to 1 means bouncier and slower to settle).`,
  },
  {
    kind: 'slider',
    id: 'cursorRadius',
    label: 'Cursor reach',
    help: 'How far from the cursor dots get pushed away.',
    group: 'Interaction',
    min: 40,
    max: 300,
    step: 5,
    default: 150,
    unit: 'px',
    phrase: (v: number) =>
      `The cursor pushes dots within ${v}px away (16% of the screen width, but at least ${Math.min(70, v)}px and at most ${v}px).`,
  },
  {
    kind: 'slider',
    id: 'cursorForce',
    label: 'Cursor push',
    help: 'How hard the cursor pushes dots.',
    group: 'Interaction',
    min: 0,
    max: 20,
    step: 0.5,
    default: 9,
    phrase: (v: number) =>
      `Cursor push strength ${fmt(v, 1)}: a dot at distance d gets pushed away by (1 − d / reach)² × ${fmt(v, 1)}.`,
  },
  {
    kind: 'slider',
    id: 'explosion',
    label: 'Click blast',
    help: 'How hard a click throws the dots outward.',
    group: 'Interaction',
    term: 'impulse',
    key: true,
    min: 0,
    max: 80,
    step: 1,
    default: 40,
    phrase: (v: number) =>
      `A click kicks every dot away from the click point with a random strength between ${fmt(v * 0.35, 1)} and ${v}, weaker with distance (down to 30% at the far edge), plus a little random jitter.`,
  },
  {
    kind: 'toggle',
    id: 'intro',
    label: 'Swarm in on load',
    help: 'Start with the dots scattered across the screen so they fly into the word.',
    group: 'Motion',
    default: true,
    phrase: (v: boolean) =>
      v
        ? 'On load, start every dot at a random spot on the screen with a small random velocity so they swarm into the word.'
        : 'On load, start every dot already in place in the word.',
  },
];
