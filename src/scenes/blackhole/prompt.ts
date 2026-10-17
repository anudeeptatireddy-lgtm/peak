import type { Params } from '../types';

export function followUps(p: Params): string[] {
  return [
    'Put my headline in the middle and let the grid and particles bend around it.',
    `Add a second, smaller black hole (pull ${Math.max(0.2, Number(p.mass) / 2)}) that orbits the first.`,
    'Add a low rumble that gets louder as particles fall in, off until I click once.',
    'Make the hole slowly drift back to the center when I let go.',
  ];
}
