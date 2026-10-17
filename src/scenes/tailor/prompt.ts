import type { Params } from '../types';

export function followUps(p: Params): string[] {
  return [
    'Add a soft rip sound when the shears cut, off until I click once.',
    `Let a click replay the cut with the ${p.cutPath === 'wavy' ? 'diagonal' : 'wavy'} path.`,
    'Add a small label card that is revealed when the cloth falls away, with a button to my shop.',
    'Make the cut start when the page scrolls into view instead of on load.',
  ];
}
