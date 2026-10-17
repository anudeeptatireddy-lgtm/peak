import type { Params } from '../types';

export function followUps(p: Params): string[] {
  return [
    'Put my headline in the middle and make the birds flow around it instead of over it.',
    `Let a click drop a crumb that attracts the birds for a few seconds (cursor fear ${p.fear} stays).`,
    'Add a soft rustle of wings when they scatter, off until I click once.',
    'Make the flock follow my scroll position, drifting down the page with me.',
  ];
}
