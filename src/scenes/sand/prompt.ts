import type { Params } from '../types';

export function followUps(p: Params): string[] {
  return [
    'Add a soft whoosh when I swipe, off until I click once.',
    'Make the grains pile up at the bottom of the screen before they drift back.',
    `Use more grains (${Math.min(8000, Number(p.grains) + 2000)}) and make them slightly darker the longer they have been flying.`,
    'Reveal a second word under the sand when I blow the first one away.',
  ];
}
