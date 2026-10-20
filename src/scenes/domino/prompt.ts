import type { Params } from '../types';

export function followUps(p: Params): string[] {
  return [
    'Start the chain by itself when the section scrolls into view, then reveal my headline underneath.',
    `Make the dominoes bigger (${Math.min(40, Number(p.size) + 6)}px) and add dots on their faces.`,
    'Add a soft clack sound for each domino, off until I click once.',
    'Let me drag to draw my own path of dominoes, then flick the first one.',
  ];
}
