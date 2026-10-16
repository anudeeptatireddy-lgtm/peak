// Color math for peak (PRD §6.3, §16.5). Pure functions, no DOM.
// sRGB channels are 0..1. OKLab/OKLCH follow Björn Ottosson's definitions.

export interface RGB {
  r: number;
  g: number;
  b: number;
}
export interface Lab {
  L: number;
  a: number;
  b: number;
}
export interface LCH {
  L: number;
  C: number;
  /** Hue in degrees, 0..360. */
  h: number;
}

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

/* ---------- hex ---------- */

export function parseHex(hex: string): RGB {
  let h = hex.trim().replace(/^#/, '');
  if (h.length === 3) h = h.replace(/./g, (c) => c + c);
  if (!/^[0-9a-fA-F]{6}$/.test(h)) throw new Error(`Not a hex color: ${hex}`);
  const n = parseInt(h, 16);
  return { r: ((n >> 16) & 255) / 255, g: ((n >> 8) & 255) / 255, b: (n & 255) / 255 };
}

export function isHex(value: string): boolean {
  return /^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(value.trim());
}

export function toHex({ r, g, b }: RGB): string {
  const ch = (v: number) =>
    Math.round(clamp01(v) * 255)
      .toString(16)
      .padStart(2, '0');
  return `#${ch(r)}${ch(g)}${ch(b)}`.toUpperCase();
}

/* ---------- sRGB transfer ---------- */

export function srgbToLinear(c: number): number {
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

export function linearToSrgb(c: number): number {
  const s = Math.sign(c);
  const a = Math.abs(c);
  return a <= 0.0031308 ? c * 12.92 : s * (1.055 * Math.pow(a, 1 / 2.4) - 0.055);
}

/* ---------- OKLab ---------- */

export function rgbToOklab({ r, g, b }: RGB): Lab {
  const lr = srgbToLinear(r);
  const lg = srgbToLinear(g);
  const lb = srgbToLinear(b);
  const l = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb);
  const m = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb);
  const s = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb);
  return {
    L: 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    a: 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    b: 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  };
}

/** May return channels outside 0..1 when the color is out of the sRGB gamut. */
export function oklabToRgb({ L, a, b }: Lab): RGB {
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return {
    r: linearToSrgb(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
    g: linearToSrgb(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
    b: linearToSrgb(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s),
  };
}

export function oklabToOklch({ L, a, b }: Lab): LCH {
  const C = Math.hypot(a, b);
  let h = (Math.atan2(b, a) * 180) / Math.PI;
  if (h < 0) h += 360;
  return { L, C, h };
}

export function oklchToOklab({ L, C, h }: LCH): Lab {
  const rad = (h * Math.PI) / 180;
  return { L, a: C * Math.cos(rad), b: C * Math.sin(rad) };
}

export const hexToOklab = (hex: string): Lab => rgbToOklab(parseHex(hex));
export const hexToOklch = (hex: string): LCH => oklabToOklch(hexToOklab(hex));

/* ---------- gamut ---------- */

const EPS = 1e-6;

export function inGamut({ r, g, b }: RGB): boolean {
  return r >= -EPS && r <= 1 + EPS && g >= -EPS && g <= 1 + EPS && b >= -EPS && b <= 1 + EPS;
}

/** Keeps lightness and hue, lowering chroma until the color fits in sRGB. */
export function fitGamut(lch: LCH): RGB {
  const L = clamp01(lch.L);
  const direct = oklabToRgb(oklchToOklab({ ...lch, L }));
  if (inGamut(direct)) return direct;
  let lo = 0;
  let hi = lch.C;
  for (let i = 0; i < 24; i++) {
    const mid = (lo + hi) / 2;
    if (inGamut(oklabToRgb(oklchToOklab({ L, C: mid, h: lch.h })))) lo = mid;
    else hi = mid;
  }
  const rgb = oklabToRgb(oklchToOklab({ L, C: lo, h: lch.h }));
  return { r: clamp01(rgb.r), g: clamp01(rgb.g), b: clamp01(rgb.b) };
}

export const oklchToHex = (lch: LCH): string => toHex(fitGamut(lch));
export const oklabToHex = (lab: Lab): string => oklchToHex(oklabToOklch(lab));

/* ---------- mixing and hue ---------- */

/** Interpolates two hex colors in OKLab (t = 0 gives a, t = 1 gives b). */
export function mixOklab(a: string, b: string, t: number): string {
  if (t <= 0) return toHex(parseHex(a));
  if (t >= 1) return toHex(parseHex(b));
  const A = hexToOklab(a);
  const B = hexToOklab(b);
  return oklabToHex({
    L: A.L + (B.L - A.L) * t,
    a: A.a + (B.a - A.a) * t,
    b: A.b + (B.b - A.b) * t,
  });
}

/** Rotates a color's OKLCH hue by `deg`, keeping lightness and chroma (gamut-fitted). */
export function rotateHue(hex: string, deg: number): string {
  if (deg === 0) return toHex(parseHex(hex));
  const lch = hexToOklch(hex);
  if (lch.C < 1e-4) return toHex(parseHex(hex));
  return oklchToHex({ ...lch, h: (((lch.h + deg) % 360) + 360) % 360 });
}

/* ---------- contrast ---------- */

/** WCAG 2 relative luminance. */
export function luminance(hex: string): number {
  const { r, g, b } = parseHex(hex);
  return 0.2126 * srgbToLinear(r) + 0.7152 * srgbToLinear(g) + 0.0722 * srgbToLinear(b);
}

/** WCAG 2 contrast ratio, 1..21. */
export function contrast(a: string, b: string): number {
  const la = luminance(a);
  const lb = luminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

/**
 * Returns `fg` if it already meets `min` against `bg`. Otherwise moves fg's OKLab
 * lightness away from the background (toward white or black, whichever can give more
 * contrast) by the smallest amount that meets `min`. Falls back to pure white or black.
 */
export function ensureContrast(fg: string, bg: string, min: number): string {
  const fgHex = toHex(parseHex(fg));
  if (contrast(fgHex, bg) >= min) return fgHex;
  const towardWhite = contrast('#FFFFFF', bg) >= contrast('#000000', bg);
  const target = towardWhite ? 1 : 0;
  const lch = hexToOklch(fgHex);
  const at = (L: number) => oklchToHex({ ...lch, L });
  if (contrast(at(target), bg) < min) return towardWhite ? '#FFFFFF' : '#000000';
  let lo = lch.L; // fails
  let hi = target; // passes
  for (let i = 0; i < 30; i++) {
    const mid = (lo + hi) / 2;
    if (contrast(at(mid), bg) >= min) hi = mid;
    else lo = mid;
  }
  return at(hi);
}

/** Hex plus alpha as an rgba() string, for CSS. */
export function withAlpha(hex: string, alpha: number): string {
  const { r, g, b } = parseHex(hex);
  return `rgba(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)}, ${alpha})`;
}
