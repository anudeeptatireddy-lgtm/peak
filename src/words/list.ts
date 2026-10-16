// Word-bank term ids (PRD §12). The full entries arrive in PLAN step 8.10; scenes
// link to these ids and the schema validator checks every link resolves.

export const WORD_IDS = [
  'easing',
  'ease-in-out',
  'spring',
  'stiffness',
  'damping',
  'velocity',
  'momentum',
  'impulse',
  'gravity',
  'drag',
  'lerp',
  'stagger',
  'parallax',
  'scroll-linked',
  'marquee',
  'particle-system',
  'flow-field',
  'trail',
  'blend-mode',
  'variable-font',
  'opacity',
  'transform',
  'frame-rate',
  'reduced-motion',
] as const;

export type WordId = (typeof WORD_IDS)[number];

export function isWordId(v: string): v is WordId {
  return (WORD_IDS as readonly string[]).includes(v);
}
