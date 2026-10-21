import type { Params } from '../types';

export function followUps(p: Params): string[] {
  return [
    'Tie the crowd to my real supporter count, so one figure is one supporter.',
    `Use ${Math.min(3000, Number(p.crowd) + 400)} people and let a few carry tiny signs.`,
    'When the name is complete, have everyone wave by swaying their shoulders together.',
    'Add my call-to-action button under the crowd once it is full.',
  ];
}
