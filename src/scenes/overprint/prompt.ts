import type { Params } from '../types';

export function followUps(p: Params): string[] {
  return [
    'Put my headline on top in big type, with the blobs moving behind it.',
    `Make the blobs bigger (${Math.min(35, Number(p.size) + 6)}% of the screen) and slower to follow.`,
    'Add a soft "blop" sound when they jump, off until I click once.',
    'Let me drag one blob away from the others and watch it spring back.',
  ];
}
