import type { Params } from '../types';

export function followUps(p: Params): string[] {
  return [
    'Make the letters also tilt slightly toward the cursor as they swell.',
    `Add a second line under "${String(p.text)}" in a smaller size that reacts the same way.`,
    'When I click, make every letter jump to full width for a moment and settle back with a bounce.',
    'Use the device tilt on phones instead of a drag to move the swell.',
  ];
}
