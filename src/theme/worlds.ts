// The color worlds (PRD §7) as data, plus the tokens derived from them.
// Adding a world is a data-only change: add an entry to WORLD_DEFS and WORLD_ORDER.

import { ensureContrast, hexToOklab, withAlpha } from './color';

export type WorldId =
  | 'dreamhouse'
  | 'dunes'
  | 'doomsday'
  | 'abyss'
  | 'glacier'
  | 'arcade'
  | 'matcha'
  | 'riso'
  | 'aurora'
  | 'lava'
  | 'vapor'
  | 'blueprint'
  | 'golden'
  | 'cherry'
  | 'newsprint'
  | 'toxic'
  | 'custom';

export type Mode = 'light' | 'dark';
export type BlendMode = 'multiply' | 'lighter' | 'source-over';

/** The hand-picked colors of one world (one mode). */
export interface Palette {
  ground: string;
  surface: string;
  ink: string;
  inkSoft: string;
  c1: string;
  c2: string;
  c3: string;
}

export interface WorldDef {
  id: Exclude<WorldId, 'custom'>;
  /** Public, original name. Never a film or brand name. */
  name: string;
  /** Internal note only; never shown in UI, URLs, metadata or prompts. */
  inspiredBy: string;
  mode: Mode;
  palette: Palette;
  /** Only Riso has a second variant. */
  dark?: Palette;
}

export interface Theme extends Palette {
  id: WorldId;
  name: string;
  mode: Mode;
  accentText: string;
  focus: string;
  line: string;
  headerBg: string;
  blend: BlendMode;
}

export const WORLD_DEFS: Record<Exclude<WorldId, 'custom'>, WorldDef> = {
  dreamhouse: {
    id: 'dreamhouse',
    name: 'Dreamhouse',
    inspiredBy: 'Pink plastic dollhouse',
    mode: 'light',
    palette: {
      ground: '#FFE3F1',
      surface: '#FFF4FA',
      ink: '#4A0532',
      inkSoft: '#8A2B66',
      c1: '#FF1F8E',
      c2: '#1FA9DB',
      c3: '#FFC21A',
    },
  },
  dunes: {
    id: 'dunes',
    name: 'Spice Dunes',
    inspiredBy: 'Desert-planet sci-fi',
    mode: 'light',
    palette: {
      ground: '#E8C9A0',
      surface: '#F3DDBE',
      ink: '#2A1405',
      inkSoft: '#5E3517',
      c1: '#D9561A',
      c2: '#8C2F14',
      c3: '#2F6FA3',
    },
  },
  doomsday: {
    id: 'doomsday',
    name: 'Doomsday',
    inspiredBy: 'End-of-the-world ember and fallout',
    mode: 'dark',
    palette: {
      ground: '#1E1412',
      surface: '#2B1D19',
      ink: '#F1E6DC',
      inkSoft: '#BFAEA1',
      c1: '#FF3B1F',
      c2: '#FF9F1C',
      c3: '#B5E61D',
    },
  },
  abyss: {
    id: 'abyss',
    name: 'Abyss',
    inspiredBy: 'Bioluminescent deep sea',
    mode: 'dark',
    palette: {
      ground: '#021B2E',
      surface: '#06293F',
      ink: '#DDF7FF',
      inkSoft: '#93BFD3',
      c1: '#00E6D2',
      c2: '#8B7DFF',
      c3: '#FF5FC8',
    },
  },
  glacier: {
    id: 'glacier',
    name: 'Glacier',
    inspiredBy: 'Arctic ice',
    mode: 'light',
    palette: {
      ground: '#E6F2F8',
      surface: '#F4FAFD',
      ink: '#0B2A3C',
      inkSoft: '#3D5F73',
      c1: '#1679BF',
      c2: '#2BA7D6',
      c3: '#E64545',
    },
  },
  arcade: {
    id: 'arcade',
    name: 'Neon Arcade',
    inspiredBy: '80s synthwave',
    mode: 'dark',
    palette: {
      ground: '#1B0A33',
      surface: '#2A1250',
      ink: '#FFF0FB',
      inkSoft: '#CDB0EA',
      c1: '#FF2E97',
      c2: '#00D9FF',
      c3: '#FFE14D',
    },
  },
  matcha: {
    id: 'matcha',
    name: 'Matcha',
    inspiredBy: 'Calm green tea',
    mode: 'light',
    palette: {
      ground: '#ECF1DC',
      surface: '#F6F9EC',
      ink: '#1D3321',
      inkSoft: '#47604B',
      c1: '#3F8A22',
      c2: '#D98A1F',
      c3: '#D0473F',
    },
  },
  riso: {
    id: 'riso',
    name: 'Riso',
    inspiredBy: 'Risograph print',
    mode: 'light',
    palette: {
      ground: '#F4F2FF',
      surface: '#FFFFFF',
      ink: '#1A1240',
      inkSoft: '#4E4777',
      c1: '#EC1C7F',
      c2: '#2A47EA',
      c3: '#FF7A00',
    },
    dark: {
      ground: '#160E44',
      surface: '#21185A',
      ink: '#F4F1FF',
      inkSoft: '#BDB5EA',
      c1: '#FF4FA3',
      c2: '#3EE6D0',
      c3: '#FFD23F',
    },
  },
  aurora: {
    id: 'aurora',
    name: 'Aurora',
    inspiredBy: 'Northern lights',
    mode: 'dark',
    palette: {
      ground: '#06161A',
      surface: '#0C2329',
      ink: '#E8FFF8',
      inkSoft: '#9CC9BE',
      c1: '#3DF5A8',
      c2: '#6C7BFF',
      c3: '#E66CFF',
    },
  },
  lava: {
    id: 'lava',
    name: 'Lava Lamp',
    inspiredBy: 'Retro wax lamp',
    mode: 'dark',
    palette: {
      ground: '#240B1C',
      surface: '#34112A',
      ink: '#FFEDE3',
      inkSoft: '#E0AFA0',
      c1: '#FF5A1F',
      c2: '#FF2E88',
      c3: '#FFC23D',
    },
  },
  vapor: {
    id: 'vapor',
    name: 'Vapor Mall',
    inspiredBy: 'Vaporwave pastels',
    mode: 'light',
    palette: {
      ground: '#F6E8FF',
      surface: '#FDF6FF',
      ink: '#2B1240',
      inkSoft: '#6A4C86',
      c1: '#FF71CE',
      c2: '#01CDFE',
      c3: '#B967FF',
    },
  },
  blueprint: {
    id: 'blueprint',
    name: 'Blueprint',
    inspiredBy: 'Technical drawing',
    mode: 'dark',
    palette: {
      ground: '#0B2A5B',
      surface: '#12376F',
      ink: '#F0F6FF',
      inkSoft: '#A9C3EA',
      c1: '#7FD3FF',
      c2: '#FFD447',
      c3: '#FF7A59',
    },
  },
  golden: {
    id: 'golden',
    name: 'Golden Hour',
    inspiredBy: 'Sunset light',
    mode: 'light',
    palette: {
      ground: '#FFE8CC',
      surface: '#FFF3E3',
      ink: '#3A1A0A',
      inkSoft: '#7A4A2A',
      c1: '#FF8A3D',
      c2: '#D9467A',
      c3: '#7B5CD6',
    },
  },
  cherry: {
    id: 'cherry',
    name: 'Cherry Cola',
    inspiredBy: 'Soda-fountain red',
    mode: 'dark',
    palette: {
      ground: '#2A0A0E',
      surface: '#3A1015',
      ink: '#FFF1E6',
      inkSoft: '#E3B5AC',
      c1: '#E8203A',
      c2: '#FFB38A',
      c3: '#FFE9C7',
    },
  },
  newsprint: {
    id: 'newsprint',
    name: 'Newsprint',
    inspiredBy: 'Black-and-red newspaper print',
    mode: 'light',
    palette: {
      ground: '#ECECEA',
      surface: '#F7F7F5',
      ink: '#111111',
      inkSoft: '#4A4A4A',
      c1: '#E3001B',
      c2: '#111111',
      c3: '#8C8C8C',
    },
  },
  toxic: {
    id: 'toxic',
    name: 'Toxic',
    inspiredBy: 'Acid green and hazard orange',
    mode: 'dark',
    palette: {
      ground: '#10140A',
      surface: '#1A2010',
      ink: '#F1FFD9',
      inkSoft: '#B5C99A',
      c1: '#B6FF1A',
      c2: '#FF6A00',
      c3: '#9B5CFF',
    },
  },
};

/** Display order for pickers and swatches. */
export const WORLD_ORDER: Exclude<WorldId, 'custom'>[] = [
  'dreamhouse',
  'dunes',
  'doomsday',
  'lava',
  'cherry',
  'toxic',
  'aurora',
  'abyss',
  'blueprint',
  'arcade',
  'vapor',
  'golden',
  'matcha',
  'glacier',
  'newsprint',
  'riso',
];

/** PRD §6.4: the canvas composite mode follows the ground's OKLab lightness. */
export function blendFor(ground: string): BlendMode {
  const L = hexToOklab(ground).L;
  if (L >= 0.62) return 'multiply';
  if (L <= 0.45) return 'lighter';
  return 'source-over';
}

/**
 * Builds a full Theme from a palette: text colors pass through ensureContrast
 * (PRD §6.3) and the derived tokens are computed (PRD §7 notes).
 */
export function themeFromPalette(
  id: WorldId,
  name: string,
  mode: Mode,
  p: Palette,
  ensureText = true,
): Theme {
  const ink = ensureText ? ensureContrast(p.ink, p.ground, 4.5) : p.ink;
  const inkSoft = ensureText ? ensureContrast(p.inkSoft, p.ground, 4.5) : p.inkSoft;
  const accent = ensureContrast(p.c1, p.ground, 3);
  return {
    id,
    name,
    mode,
    ...p,
    ink,
    inkSoft,
    accentText: accent,
    focus: accent,
    line: withAlpha(ink, 0.14),
    headerBg: withAlpha(p.ground, 0.74),
    blend: blendFor(p.ground),
  };
}

/** The Theme for a world. Riso picks its variant from `mode` (defaults to light). */
export function getWorld(id: Exclude<WorldId, 'custom'>, mode: Mode = 'light'): Theme {
  const def = WORLD_DEFS[id];
  const useDark = mode === 'dark' && def.dark;
  const palette = useDark && def.dark ? def.dark : def.palette;
  return themeFromPalette(id, def.name, useDark ? 'dark' : def.mode, palette);
}

/** Every world as a Theme, including Riso's dark variant. */
export function allThemes(): Theme[] {
  const out: Theme[] = [];
  for (const id of WORLD_ORDER) {
    out.push(getWorld(id));
    if (WORLD_DEFS[id].dark) out.push(getWorld(id, 'dark'));
  }
  return out;
}

export function isWorldId(v: string): v is Exclude<WorldId, 'custom'> {
  return Object.prototype.hasOwnProperty.call(WORLD_DEFS, v);
}
