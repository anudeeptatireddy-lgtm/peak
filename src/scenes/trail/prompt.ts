import type { Params } from '../types';

export function followUps(p: Params): string[] {
  return [
    `Make the trail longer (${Math.min(120, Number(p.length) + 30)} points) and let it fade out when the cursor stops for a while.`,
    'Make the trail change color with how fast the cursor moves.',
    'Swap the ribbon for a row of little stars that twinkle.',
    'Hide the trail on touch screens and show it only for mouse users.',
  ];
}
