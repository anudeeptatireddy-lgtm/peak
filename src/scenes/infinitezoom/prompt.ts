import type { Params } from '../types';

export function followUps(p: Params): string[] {
  return [
    'Show a different word on each level, cycling through my three services.',
    `Draw ${Math.min(6, Number(p.depth) + 1)} levels and add tiny cars moving along the streets.`,
    'Make it night: dark streets, lit windows on the rooftops, and a glowing skylight.',
    'Link the skylight: clicking it opens my contact page.',
  ];
}
