import type { Params } from '../types';

export function followUps(p: Params): string[] {
  return [
    'Add a soft boom and crackle for each burst, off until I click once.',
    `Launch a finale of ${Math.min(12, Math.round(Number(p.autoEvery) * 2) || 6)} rockets when I press the space bar, still at most 3 bursts a second.`,
    'Put a "Happy New Year" headline in the middle that the sparks fall behind.',
    'Make the sparks twinkle gently as they fade, without ever flashing.',
  ];
}
