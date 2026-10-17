import type { Params } from '../types';

export function followUps(p: Params): string[] {
  return [
    'Make the word turn as I scroll down the page instead of following the cursor.',
    `Make it deeper (${Math.min(60, Number(p.depth) + 16)} layers) and add a soft shadow under it.`,
    'Let me drag to spin the word all the way around.',
    'Make each letter turn on its own, a little behind the one before it.',
  ];
}
