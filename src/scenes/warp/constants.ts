// Fixed values in `warp` that are not sliders, each with its reason.

export const FIXED = {
  /** Stars more than this many pixels off screen respawn far away (prototype). */
  MARGIN: 60,
  /** The magnetic button's styling follows the site's primary button (PRD §18). */
  BUTTON_FONT: '1.05rem',
  BUTTON_MIN_HEIGHT: '48px',
  BUTTON_PADDING: '0 1.6rem',
  BUTTON_LAYER: '3',
  CENTER: '50%',
  CENTER_SHIFT: '-50% -50%',
  /** A zero-length line needs a tiny length to draw a dot (prototype). */
  DOT_NUDGE: 0.01,
} as const;

export const FIXED_REASONS: Record<keyof typeof FIXED, string> = {
  MARGIN: 'Stars are already off screen at that point, so the exact margin never shows.',
  BUTTON_FONT:
    'Button chrome follows the design system so it matches every other button on the page.',
  BUTTON_MIN_HEIGHT:
    'The 48px touch target from the design system (PRD §17 asks for at least 44px).',
  BUTTON_PADDING:
    'Button chrome follows the design system so it matches every other button on the page.',
  BUTTON_LAYER:
    'Keeps the button above the canvas so it can be clicked; stacking order, not looks.',
  CENTER: 'Centers the button horizontally (its vertical position is a slider).',
  CENTER_SHIFT: 'Moves the button by half its own size so its middle sits on the chosen point.',
  DOT_NUDGE: 'A hundredth of a pixel so a star at rest still draws as a dot; invisible otherwise.',
};
