import type { Params } from '../types';

export function followUps(p: Params): string[] {
  return [
    'Add a soft kick drum on every beat, off until I click once.',
    `Speed it up to ${Number(p.tempo) + 24} beats per minute when I hover the poster.`,
    'Let me type my own words into the poster live.',
    'Sync the beat to music from a file I choose.',
  ];
}
