import type { Params } from '../types';

export function followUps(p: Params): string[] {
  return [
    'Put my headline in front and let the smoke curl around the letters.',
    `Make the smoke linger longer (fade ${Math.min(0.999, Number(p.fade) + 0.008).toFixed(3)}) and drift slowly to the right.`,
    'Let a click release a big puff of smoke from that spot.',
    'Pause the simulation when the section scrolls out of view to save battery.',
  ];
}
