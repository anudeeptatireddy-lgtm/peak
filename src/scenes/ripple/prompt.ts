import type { Params } from '../types';

export function followUps(p: Params): string[] {
  return [
    'Put a big headline in the middle of the grid that wobbles when a ring passes under it.',
    'Add a soft water-drop sound for each ripple, off until I click once.',
    `Make the rings move at ${Number(p.speed) * 2}px per second while I hold the mouse down.`,
    'Make dots near the cursor slowly drift toward it instead of away.',
  ];
}
