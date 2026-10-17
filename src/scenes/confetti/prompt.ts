import type { Params } from '../types';

export function followUps(p: Params): string[] {
  return [
    'Add a soft pop sound for each burst, off until I click once.',
    `Change the message to "Congratulations!" and fire ${Math.min(600, Number(p.count) * 2)} pieces on the first burst.`,
    'Make the confetti land and pile up at the bottom instead of falling off.',
    'Fire a burst when someone presses a "Celebrate" button.',
  ];
}
