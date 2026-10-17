import type { Params } from '../types';

export function followUps(p: Params): string[] {
  return [
    'Add a soft wind sound that gets louder with the gusts, off until I click once.',
    `Make the breeze stronger (wind ${Math.min(2, Number(p.wind) + 0.6).toFixed(1)}) when I scroll.`,
    'Put a row of small pennants with my team members’ names under the main banner.',
    'Let me upload a logo to print on the banner next to the text.',
  ];
}
