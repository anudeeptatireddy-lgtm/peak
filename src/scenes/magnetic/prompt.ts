import type { Params } from '../types';

export function followUps(p: Params): string[] {
  return [
    'Make each button link to a section of my page and scroll smoothly when pressed.',
    `Make the pull stronger (${Math.min(0.8, Number(p.pull) + 0.2).toFixed(2)}) on touch screens and weaker with a mouse.`,
    'Add a soft shadow that grows as a button is pulled toward the cursor.',
    'Add a small arrow icon after each label that slides out when the button is pulled.',
  ];
}
