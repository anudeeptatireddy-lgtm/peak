import type { Params } from '../types';

export function followUps(p: Params): string[] {
  return [
    'Make the links in my navigation scramble like this when I hover them.',
    `Slow the decode down to ${Number(p.duration) * 2}s and make the first line glow while it scrambles.`,
    'Add a soft clicking sound for each letter that settles, off until I click once.',
    'Make it start decoding only when the lines scroll into view.',
  ];
}
