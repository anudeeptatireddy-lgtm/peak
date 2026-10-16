// Fixed numbers shared by every scene, each with the reason it isn't a slider
// (owner, 2026-10-16: every number that shapes a scene is a param or listed here).

export const SHARED = {
  /** PRD §8.3: phones and narrow windows use their own counts below this width. */
  SMALL_SCREEN: 700,
  /** PRD §13: gallery previews draw fewer things so 4 can run at once. */
  PREVIEW_SCALE: 0.4,
  /** Full circle in radians. */
  TAU: Math.PI * 2,
  /** Every world has three accent inks (PRD §7). */
  INKS: 3,
  /** Canvas pixels are RGBA: four bytes each. */
  RGBA: 4,
  /** Speeds are written in pixels per frame at 60 frames per second (PRD §16.4). */
  FPS: 60,
  /** Converts a share (0–1) to a CSS percentage. */
  PERCENT: 100,
} as const;

export const SHARED_REASONS: Record<keyof typeof SHARED, string> = {
  SMALL_SCREEN: 'The phone breakpoint from PRD §8.3, shared by every scene and the site layout.',
  PREVIEW_SCALE: 'Gallery previews only (PRD §13); never affects a scene page or a prompt.',
  TAU: 'Mathematical constant.',
  INKS: 'The palette structure: every world has exactly three accent colors.',
  RGBA: 'The canvas pixel format.',
  FPS: 'The unit speeds are written in (per 60Hz frame), so scenes run the same at 120Hz.',
  PERCENT: 'Unit conversion only.',
};
