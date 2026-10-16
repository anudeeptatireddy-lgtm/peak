import type { Params } from '../types';

export function followUps(p: Params): string[] {
  return [
    'Add a fourth row of small emoji that drifts the opposite way.',
    `Make "${String(p.line1)}" change color slowly through my accent colors as it moves.`,
    'Pause the rows while my cursor is over them.',
    'Add a thin line between the rows that stretches with scroll speed.',
  ];
}
