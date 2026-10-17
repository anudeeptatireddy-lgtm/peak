import type { Params } from '../types';

export function followUps(p: Params): string[] {
  return [
    'Place the nodes on the letters of my headline, so the arcs trace the words.',
    `Let a click send a strike that chains through ${Math.min(3, Number(p.chain) + 2)} nodes, still at most 3 strikes a second.`,
    'Add a quiet electric crackle for each strike, off until I click once.',
    'Make the nodes drift slowly, so the network keeps changing shape.',
  ];
}
