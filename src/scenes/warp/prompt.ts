import type { Params } from '../types';

export function followUps(p: Params): string[] {
  return [
    'Add a rising whoosh sound while I hold, made with the Web Audio API, off until I click once.',
    'Make the stars curve slightly toward the cursor while warping.',
    `When I click "${String(p.buttonText)}", warp for one second before scrolling to the top.`,
    'Put a countdown in the middle and warp automatically when it reaches zero.',
  ];
}
