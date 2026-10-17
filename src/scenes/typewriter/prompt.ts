import type { Params } from '../types';

export function followUps(p: Params): string[] {
  return [
    'Add a soft clack sound for every key and a ding at the end of each line, off until I click once.',
    `Type faster (${Number(p.speed) + 8} keys per second) and let me press any key to skip to the end.`,
    'Start typing only when the text scrolls into view.',
    'Make the paper scroll up a line at each carriage return, like a real typewriter.',
  ];
}
