import type { Params } from '../types';

export function followUps(p: Params): string[] {
  return [
    `Make the film thicker (${Math.min(1200, Number(p.thickness) + 200)}nm) so the colors last longer before they drain.`,
    'Let a faint breath of wind sway the films on its own, so the colors shimmer even when no one is touching the page.',
    'Re-dip every letter with a new film every 30 seconds, so the colors never run out.',
    'Add a soft reflection of the name on a dark wet surface under the wire.',
  ];
}
