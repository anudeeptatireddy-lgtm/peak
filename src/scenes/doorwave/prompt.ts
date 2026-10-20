import type { Params } from '../types';

export function followUps(p: Params): string[] {
  return [
    'Make each letter room a link to a page of my site, with a focus ring on its door.',
    `Use ${Math.min(12, Number(p.floors) + 2)} floors and put a small plant or lamp in some empty rooms.`,
    'Turn it into night: dark walls, and only the open rooms glow.',
    'Add a soft door creak when a door opens, off until I click once.',
  ];
}
