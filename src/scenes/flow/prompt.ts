import type { Params } from '../types';

export function followUps(p: Params): string[] {
  return [
    'Make particles near my cursor glow brighter, even without pressing.',
    `Let me switch between ${Number(p.count)} particles and half that with a small button, for slower computers.`,
    'Slowly shift the three colors over a minute so the wallpaper changes mood.',
    'Put my name in the middle and make the particles flow around the letters.',
  ];
}
