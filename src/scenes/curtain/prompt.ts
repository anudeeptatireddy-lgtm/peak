import type { Params } from '../types';

export function followUps(p: Params): string[] {
  return [
    'Make each page a real page of my site and play the transition when the address changes, using the browser history.',
    `Make the transition ${Math.max(0.3, Number(p.duration) - 0.3).toFixed(1)}s long on phones and longer on desktop.`,
    'Give each page its own transition style, so Work uses the iris and Contact uses the curtain.',
    'Let the visitor swipe left and right to move between pages on a phone.',
  ];
}
