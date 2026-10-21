import type { Params } from '../types';

export function followUps(p: Params): string[] {
  return [
    'Show the current number of circles in a small label in the corner.',
    `Use up to ${Math.min(200, Number(p.circles) + 40)} circles and color each ring by its speed.`,
    'Make the trace draw in time with a soft hum, off until I click once.',
    'Draw my tagline under the name with the same circles once the name is done.',
  ];
}
