import type { Params } from '../types';

export function followUps(p: Params): string[] {
  return [
    'Put my studio name on top in big type, with the dots swelling behind it.',
    `Make the misprint stronger (${Math.min(1, Number(p.misprint) + 0.2).toFixed(1)} × the spacing) when I scroll fast.`,
    'Turn the dots into tiny squares, like a different print screen.',
    'Let a long press leave a lasting dent in the dots that slowly heals.',
  ];
}
