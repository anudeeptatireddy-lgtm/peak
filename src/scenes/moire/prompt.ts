import type { Params } from '../types';

export function followUps(p: Params): string[] {
  return [
    'Put my name in big type on top and let the pattern ripple around it.',
    `Try the ${p.pattern === 'lines' ? 'rings' : 'lines'} pattern for a different look, keeping the same speed limit.`,
    'Let a click change the pattern between lines, rings and dots.',
    'Add a soft vignette so the edges of the pattern fade out.',
  ];
}
