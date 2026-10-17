import type { Params } from '../types';

export function followUps(p: Params): string[] {
  return [
    `Make the ${p.featured} loader overlay the whole page and fade away when my page has loaded.`,
    'Add a short line of text under the featured loader, like "Brewing your page".',
    'Show a progress percentage in the middle of the ring.',
    'Let me copy the CSS of any loader with one button.',
  ];
}
