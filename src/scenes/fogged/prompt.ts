import type { Params } from '../types';

export function followUps(p: Params): string[] {
  return [
    'Let the fog come back faster at the edges of the screen and slower in the middle.',
    `Make the fog thicker (${Math.min(1, Number(p.fog) + 0.15).toFixed(2)}) and the wipe wider.`,
    'Draw a faint handprint where the visitor first touches the glass.',
    'Fog the glass again with a long breath when the page loads, then let it clear slowly.',
  ];
}
