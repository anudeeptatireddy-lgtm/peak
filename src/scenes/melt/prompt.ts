import type { Params } from '../types';

export function followUps(p: Params): string[] {
  return [
    'Make the drops leave little puddles that spread at the bottom of the screen.',
    `Make it melt faster (speed ${Number(p.meltSpeed) * 2}) when the page has been open for a minute.`,
    'Color the melted parts with a warm gradient from my accent colors.',
    'Make my phone tilt change which way the wax drips.',
  ];
}
