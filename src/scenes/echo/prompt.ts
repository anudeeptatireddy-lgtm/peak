import type { Params } from '../types';

export function followUps(p: Params): string[] {
  return [
    'Make the echoes trail behind my cursor instead of a word.',
    `Use more echoes (${Math.min(30, Number(p.copies) + 8)}) and let them shrink as they fade.`,
    'Let the word change every few seconds between three words I choose.',
    'Make the echoes tilt in the direction the word is moving.',
  ];
}
