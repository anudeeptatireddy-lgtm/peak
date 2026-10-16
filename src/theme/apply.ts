// Writes the current theme to CSS custom properties on :root (PRD §16.4),
// touching only the properties whose values actually changed.

import type { Theme } from './worlds';

export interface StyleTarget {
  style: { setProperty(name: string, value: string): void };
}

export function themeVars(t: Theme): Record<string, string> {
  return {
    '--ground': t.ground,
    '--surface': t.surface,
    '--ink': t.ink,
    '--ink-soft': t.inkSoft,
    '--c1': t.c1,
    '--c2': t.c2,
    '--c3': t.c3,
    '--accent-text': t.accentText,
    '--focus': t.focus,
    '--line': t.line,
    '--header-bg': t.headerBg,
    '--scrim': t.ground,
    '--blend': t.blend,
    'color-scheme': t.mode,
  };
}

/** Returns an apply function bound to `target`. Each call returns how many properties it wrote. */
export function createApplier(target: StyleTarget): (theme: Theme) => number {
  const last = new Map<string, string>();
  return (theme) => {
    let writes = 0;
    for (const [name, value] of Object.entries(themeVars(theme))) {
      if (last.get(name) === value) continue;
      target.style.setProperty(name, value);
      last.set(name, value);
      writes++;
    }
    return writes;
  };
}
