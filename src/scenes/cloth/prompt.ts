import type { Params } from '../types';

export function followUps(p: Params): string[] {
  return [
    'Put my hero image on the cloth, so pulling it apart reveals the page underneath.',
    `Make it tougher to tear (tear ${Math.min(6, Number(p.tear) + 1)}) and let the torn pieces pile up on the floor.`,
    'Add a soft ripping sound when a link breaks, off until I click once.',
    'Let the scroll position set the breeze, so the sheet billows as I scroll.',
  ];
}
