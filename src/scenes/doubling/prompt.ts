import type { Params } from '../types';

export function followUps(p: Params): string[] {
  return [
    'Show my savings rate under the counter, and make each step one year of growth at that rate.',
    `Use ${Math.min(12, Number(p.doublings) + 1)} doublings and add a soft coin clink on each split, off until I click once.`,
    'Put my call-to-action button on the table once the name is complete.',
    'Make the coins stack into a rising line chart instead of the name.',
  ];
}
