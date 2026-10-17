import type { Params } from '../types';

export function followUps(p: Params): string[] {
  return [
    'Let each card open a short description when tapped, with the card growing like jelly to fill the screen.',
    `Make the cards ${Number(p.cardW) + 40}px wide and let them bump into each other when dragged.`,
    'Add a soft shadow under each card that stretches as the card is lifted.',
    'Save where the visitor leaves each card and put it there next visit.',
  ];
}
