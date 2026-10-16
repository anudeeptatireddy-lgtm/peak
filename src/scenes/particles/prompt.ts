import type { Params } from '../types';

export function followUps(p: Params): string[] {
  return [
    'Make the dots change color depending on how fast they are moving.',
    'Replace the dots with small emoji of my choice: ✨.',
    'Add a soft pop sound when the dots explode, using the Web Audio API, off until I click once.',
    `Make the word change every 5 seconds between: ${String(p.text)}, HELLO, BYE.`,
  ];
}
