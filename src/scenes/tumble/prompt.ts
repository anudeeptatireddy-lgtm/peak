import type { Params } from '../types';

export function followUps(p: Params): string[] {
  return [
    'Add a soft thud sound when a letter lands hard, off until I click once.',
    `Make gravity lighter (${Number(p.gravity) / 2}) so the letters float down like on the moon.`,
    'Let me tilt my phone to tip the pile over.',
    'Add a button that spells a new word with the same blocks.',
  ];
}
