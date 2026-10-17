import type { Params } from '../types';

export function followUps(p: Params): string[] {
  return [
    `When "${String(p.text)}" is spelled out, show my email address under it with a copy button.`,
    'Add a little click sound when a letter snaps into place, off until I click once.',
    'Let me drag single letters directly with the mouse, too.',
    'Make the magnets wobble a little when they snap, like real plastic letters.',
  ];
}
