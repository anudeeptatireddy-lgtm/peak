import type { Params } from '../types';

export function followUps(p: Params): string[] {
  return [
    'Add a soft clink and a pour sound, off until I click once.',
    `Make the cup bigger (${Math.min(95, Number(p.cupSize) + 10)}% of the screen height) on phones.`,
    'Let a click make a small heart in the foam where I click.',
    'Add a spoon that stirs the foam when I drag, swirling the letters.',
  ];
}
