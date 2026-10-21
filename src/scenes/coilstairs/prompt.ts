import type { Params } from '../types';

export function followUps(p: Params): string[] {
  return [
    'Put my call-to-action button on the bottom step, and have the letters land beside it.',
    `Use ${Math.min(10, Number(p.steps) + 2)} stairs and make each letter a different accent.`,
    'Add a soft boing sound on each landing, off until I click once.',
    'Make the stairs wind around in a spiral instead of coming straight toward me.',
  ];
}
