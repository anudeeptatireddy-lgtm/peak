import type { Params } from '../types';

export function followUps(p: Params): string[] {
  return [
    'Add a soft tick sound for each tick of the escapement, off until I click once.',
    `Use ${Math.min(30, Number(p.gears) + 6)} gears and give the bigger gears spokes and a polished rim.`,
    'Put a real clock face behind the gears with hands that show the current time.',
    'When the name is complete, show my tagline underneath in plain text.',
  ];
}
