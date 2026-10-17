import type { Params } from '../types';

export function followUps(p: Params): string[] {
  return [
    'Add a soft plop sound when a ball lands, off until I click once.',
    `Let up to ${Math.min(150, Number(p.maxBalls) + 40)} balls pile up and make the oldest fade out instead of vanishing.`,
    'Add a button that tips the pile out of the bottom of the screen.',
    'Drop a ball every time someone sends my contact form.',
  ];
}
