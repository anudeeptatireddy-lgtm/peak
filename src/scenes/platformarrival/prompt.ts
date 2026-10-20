import type { Params } from '../types';

export function followUps(p: Params): string[] {
  return [
    'Add a second stop: keep scrolling past the station and the train leaves for a second station with my tagline on its sign.',
    `Use ${Math.min(8, Number(p.layers) + 2)} layers and add tiny poles and trees on the nearest one.`,
    'Make it night: a moon behind the far hills and lit windows in a town layer.',
    'Add a soft rail clatter that slows with the train, off until I click once.',
  ];
}
