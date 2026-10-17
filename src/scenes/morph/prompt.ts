import type { Params } from '../types';

export function followUps(p: Params): string[] {
  return [
    'Add my logo as one of the shapes in the list, so it appears in the cycle.',
    `Morph faster (${Math.max(0.3, Number(p.duration) - 0.4).toFixed(1)}s) and hold each shape a little longer.`,
    'Fill the shape with a gradient of the three inks instead of flat color.',
    'Show the name of each shape under it while it holds, then fade it out as the morph starts.',
  ];
}
