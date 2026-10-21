import type { Params } from '../types';

export function followUps(p: Params): string[] {
  return [
    'Add a second viewpoint, the top-left corner, where the same shards spell my tagline.',
    `Use ${Math.min(600, Number(p.shards) + 120)} shards and make them slowly spin around their own centers.`,
    'Show a small dot that guides the visitor toward the sweet spot until the name forms once.',
    'Give the shards a soft drop shadow so their depth reads more clearly.',
  ];
}
