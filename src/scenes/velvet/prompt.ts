import type { Params } from '../types';

export function followUps(p: Params): string[] {
  return [
    `Make the pile longer (${Math.min(1, Number(p.pileLength) + 0.2).toFixed(2)}) and the sheen stronger, so the cloth looks more luxurious.`,
    'Let the lamp drift slowly around the screen, so the sheen slides across the cloth.',
    'Leave a faint fingertip mark where the visitor first touches the cloth.',
    'When the page loads, brush the name in by itself with one slow stroke, then let it relax.',
  ];
}
