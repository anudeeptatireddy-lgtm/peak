import type { Params } from '../types';

export function followUps(p: Params): string[] {
  return [
    'Let each panel carry a different line of my invitation, readable when the sheet is open.',
    `Try ${Math.min(8, Number(p.panels) + 2)} panels for a finer fold.`,
    'Add a soft shadow under the sheet that shrinks as it folds up.',
    'Open the sheet once when the page loads, then follow the scroll.',
  ];
}
