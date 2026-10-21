import type { Params } from '../types';

export function followUps(p: Params): string[] {
  return [
    'Hide three treasure chests on the map that open with a small bounce when the torch finds them.',
    `Make the torch ${Math.min(300, Number(p.torch) + 60)}px and add a soft crackle sound, off until I click once.`,
    'Show a small mini-map in the corner that fills in as I explore.',
    'When the name is found, reveal my call-to-action button under it.',
  ];
}
