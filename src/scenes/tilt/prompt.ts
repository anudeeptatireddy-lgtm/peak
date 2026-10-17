import type { Params } from '../types';

export function followUps(p: Params): string[] {
  return [
    'Add a small avatar photo at the top of the card and a row of three link icons at the bottom.',
    `Let a click flip the card over to show a second side, with the same ${p.maxTilt}° tilt on the back.`,
    'Make the foil react to scroll speed too, so it shimmers while the page moves.',
    'Add a faint rainbow border that brightens as the card tilts.',
  ];
}
