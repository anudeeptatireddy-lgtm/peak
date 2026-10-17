import type { Params } from '../types';

export function followUps(p: Params): string[] {
  return [
    `Let a click save the picture as a PNG, and add a button that clears the canvas.`,
    `Let me pick the brush color from a row of swatches instead of cycling through the palette.`,
    `Try ${Math.min(16, Number(p.segments) + 4)} segments and switch to a thicker brush (${Number(p.brush) + 4}px).`,
    'Add a soft glow around the strokes, and make the pattern pulse slowly.',
  ];
}
