import type { Params } from '../types';

export function followUps(p: Params): string[] {
  return [
    'Make an animal give a little wave when I click it.',
    `Use ${Math.min(15, Number(p.animals) + 4)} animals and give each one a tiny tail that wags while it peeks.`,
    'Add a soft giggle sound when they peek out, off until I click once.',
    'Make them blink every few seconds, each at its own moment.',
  ];
}
