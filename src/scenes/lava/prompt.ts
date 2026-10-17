import type { Params } from '../types';

export function followUps(p: Params): string[] {
  return [
    'Put my logo in the middle and let the blobs flow around it.',
    `Use ${Math.min(24, Number(p.blobs) + 8)} smaller blobs for a busier lamp.`,
    'Make the lamp slowly change color through the palette over a minute.',
    'Warm the lamp when the page scrolls instead of on a click.',
  ];
}
