import type { Params } from '../types';

export function followUps(p: Params): string[] {
  return [
    'Add a boing sound when a letter snaps back, off until I click once.',
    `Make the letters stretchier (${Math.min(2, Number(p.stretch) + 0.5)}) and let neighbors wobble a little too.`,
    'Make each letter wobble by itself now and then when nobody touches it.',
    'Let me pull a letter right off the line and drop it somewhere else.',
  ];
}
