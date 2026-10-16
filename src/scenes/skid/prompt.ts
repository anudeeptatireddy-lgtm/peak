import type { Params } from '../types';

export function followUps(p: Params): string[] {
  return [
    'Add a tire screech sound when each letter skids, off until I click once.',
    `Make the letters drive in from the right instead, at ${Number(p.speed) + 10}px per frame.`,
    'Make each letter a different accent color, like a row of race cars.',
    'Make the letters play their entrance when the headline scrolls into view.',
  ];
}
