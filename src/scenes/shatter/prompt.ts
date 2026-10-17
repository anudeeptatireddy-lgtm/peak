import type { Params } from '../types';

export function followUps(p: Params): string[] {
  return [
    'Add a glass-breaking sound when a word shatters, off until I click once.',
    `Break each word into more pieces (${Math.min(60, Number(p.shards) * 2)}) and let them bounce off the bottom of the screen.`,
    'Reveal a hidden message behind a word when it shatters.',
    'Make the whole line shatter when I shake my phone.',
  ];
}
