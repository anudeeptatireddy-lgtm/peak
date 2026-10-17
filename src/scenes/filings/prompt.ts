import type { Params } from '../types';

export function followUps(p: Params): string[] {
  return [
    'Scatter the filings only inside the letters of my headline, so the words light up near the magnet.',
    `Let me drag the placed magnets around (up to ${p.maxMagnets} of them) and flip one with a double-click.`,
    'Make the filings slowly creep toward the poles and pile up there.',
    'Add a faint tick as filings snap into line, off until I click once.',
  ];
}
