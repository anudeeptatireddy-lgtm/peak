import type { Params } from '../types';

export function followUps(p: Params): string[] {
  return [
    'Add a soft crackling sound, off until I click once.',
    `Make the flames taller (height ${Math.min(2, Number(p.height) + 0.5)}) for a few seconds when I click.`,
    'Make sparks float up from the flames now and then.',
    'Let the flames burn away the letters slowly, revealing a new word underneath.',
  ];
}
