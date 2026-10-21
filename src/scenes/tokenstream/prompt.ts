import type { Params } from '../types';

export function followUps(p: Params): string[] {
  return [
    'Show a small counter of how many chunks the sentence was split into.',
    `Let me type my own sentence, and keep chunks of at most ${p.chunk} letters.`,
    'Give each chunk a tiny number label, like a token id, under its chip.',
    'Play a soft click as each chunk docks, off until I click once.',
  ];
}
