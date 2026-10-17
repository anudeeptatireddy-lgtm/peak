import type { Params } from '../types';

export function followUps(p: Params): string[] {
  return [
    'Give each string a soft pluck sound in a scale, off until I click once.',
    `Make the strings ring longer (ring ${Math.min(0.998, Number(p.ring) + 0.006).toFixed(3)}).`,
    'Make the strings horizontal, like a harp lying on its side.',
    'Let me tap a string to pluck just that one.',
  ];
}
