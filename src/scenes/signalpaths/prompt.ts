import type { Params } from '../types';

export function followUps(p: Params): string[] {
  return [
    'Put my product tagline under the name once the paths have learned it.',
    `Make it learn faster (learning ${Math.min(1, Number(p.learning) + 0.3).toFixed(1)}) so the name shows up within two seconds.`,
    'Add a faint data-hum sound that rises with the number of signals, off until I click once.',
    'Let a click fire a big burst of signals from that spot.',
  ];
}
