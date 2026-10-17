import type { Params } from '../types';

export function followUps(p: Params): string[] {
  return [
    'Turn the blobs into a menu: each blob is a link that grows when I hover it.',
    `Make it gooier (${Math.min(30, Number(p.goo) + 6)}) and let blobs split apart when I drag through them.`,
    'Add a soft blob sound when two blobs merge, off until I click once.',
    'Put my headline on top in a color that stays readable over the blobs.',
  ];
}
