import type { Params } from '../types';

export function followUps(p: Params): string[] {
  return [
    'Play a soft plucked-string note when I cross a thread, off until I click once.',
    `Use two thread colors, switching every ${Math.round(Number(p.threads) / 2)} threads.`,
    'Show a small counter of threads laid so far.',
    'Add a wooden board texture behind the nails.',
  ];
}
