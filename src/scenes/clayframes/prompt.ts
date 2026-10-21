import type { Params } from '../types';

export function followUps(p: Params): string[] {
  return [
    'Add a soft squelch sound when I press, off until I click once.',
    `Let me pinch a letter to stretch it, then let it relax back over ${p.relax} seconds.`,
    'Give the clay a little wobble in the whole letter when I press it hard.',
    'Add a small clay ball that rolls across the name and leaves a track.',
  ];
}
