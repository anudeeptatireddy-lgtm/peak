import type { Params } from '../types';

export function followUps(p: Params): string[] {
  return [
    'Make the tunnel pulse in time with an audio track, off until I click once.',
    `Try the ${p.ringShape === 'hexagon' ? 'square' : 'hexagon'} ring shape and bring the stripes down to 6.`,
    'Add a headline in the middle that stays still while the tunnel moves past it.',
    'Let the tunnel change color through the palette every ten seconds.',
  ];
}
