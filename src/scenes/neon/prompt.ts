import type { Params } from '../types';

export function followUps(p: Params): string[] {
  return [
    'Add a quiet electric hum while the sign is on, off until I click once.',
    'Show "open" during my opening hours and "closed" (in a dimmer color) outside them.',
    `Make the tubes thicker (${Number(p.tube) + 3}px) and add a dark brick wall texture behind the sign.`,
    'Draw a neon arrow under the sign pointing to my menu.',
  ];
}
