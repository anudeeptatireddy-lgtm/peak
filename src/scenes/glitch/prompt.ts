import type { Params } from '../types';

export function followUps(p: Params): string[] {
  return [
    'Add a short digital crackle sound with each burst, off until I click once.',
    `Make the split wider (${Math.min(20, Number(p.split) + 6)}px) and add scan lines over the headline only.`,
    'Let the headline glitch once when it scrolls into view.',
    'Swap the headline for my logo image and glitch that instead.',
  ];
}
