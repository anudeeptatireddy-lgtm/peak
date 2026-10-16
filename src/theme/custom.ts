// Custom colors (PRD §9.2): the visitor picks the ground and three accents; the
// text colors are derived so they always pass contrast.

import { contrast, ensureContrast, hexToOklab, mixOklab } from './color';
import { themeFromPalette, type Theme } from './worlds';
import type { CustomColors } from '../state/url';

export function customTheme(c: CustomColors): Theme {
  const light = hexToOklab(c.ground).L >= 0.6;
  const ink = ensureContrast(c.ground, c.ground, 10);
  const inkSoft = ensureContrast(c.ground, c.ground, 5.2);
  const mixed = mixOklab(c.ground, light ? '#FFFFFF' : ink, light ? 0.5 : 0.08);
  // Mid-tone grounds have little contrast to spare: keep panels on the ground then.
  const surface = contrast(inkSoft, mixed) >= 4.5 ? mixed : c.ground;
  return themeFromPalette('custom', 'Custom', light ? 'light' : 'dark', {
    ground: c.ground,
    surface,
    ink,
    inkSoft,
    c1: c.c1,
    c2: c.c2,
    c3: c.c3,
  });
}
