import type { Params } from '../types';

export function followUps(p: Params): string[] {
  return [
    'Add a soft clink sound when marbles hit each other hard, off until I click once.',
    `Make the marbles a little bigger (${Number(p.marbleSize) + 2}px) and let me drag single marbles around.`,
    'Let me tilt the pile by tilting my phone (device orientation), with a button to allow it.',
    'Make the headline shatter by itself the first time it scrolls into view.',
  ];
}
