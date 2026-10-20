// Fixed values in `doorwave` that are not sliders, each with its reason.

export const FIXED = {
  /** Isometric slope: one step along the building moves this far down (2:1 isometric). */
  ISO: 0.5,
  /** A floor is this many door cells tall… */
  FLOOR_RATIO: 1.4,
  /** …and a door is this share of the floor's height. */
  DOOR_HEIGHT: 0.72,
  /** Walkways stick out this many cells in front of the doors. */
  WALK: 0.6,
  /** The building is this many cells deep (its side face and roof). */
  DEPTH: 2,
  /** The walkway railing is this share of a floor tall. */
  RAIL: 0.22,
  /** A letter is at most this share of its doorway's width. */
  LETTER_FIT: 0.8,
  /** Doors within this share of the wave radius open all the way. */
  FULL_OPEN: 0.4,
  /** Outline and railing width in px. */
  LINE: 1.5,
  /** A letter door counts as opened by the wave above this share of open. */
  OPENED: 0.5,
  /** Degrees in half a turn (the open angle is set in degrees). */
  HALF_TURN: 180,
  /** The inner scroll area on scene pages is this many screens tall… */
  INNER_SCREENS: 3,
  /** …and recenters within half a screen of either end. */
  RECENTER_LOW: 0.5,
  RECENTER_HIGH: 1.5,
} as const;

export const FIXED_REASONS: Record<keyof typeof FIXED, string> = {
  ISO: 'The standard 2:1 isometric angle that pixel-art buildings use.',
  FLOOR_RATIO: 'Leaves a lintel above each door and room for the walkway below the next floor.',
  DOOR_HEIGHT: 'A door that reads as a door, with wall above it.',
  WALK: 'Deep enough to show light spilling onto it, shallow enough not to hide the floor below.',
  DEPTH: 'Gives the block a visible side and roof without taking over the screen.',
  RAIL: 'A waist-high railing at the scale of the doors.',
  LETTER_FIT: 'Keeps a sliver of lit room on both sides of each letter.',
  FULL_OPEN: 'A plateau in the middle of the wave so the doors under the cursor stand fully open.',
  LINE: 'Hairlines that survive the scale on phones.',
  OPENED: 'Halfway open is when a letter is readable, so that starts its linger.',
  HALF_TURN: 'Unit conversion only: degrees to radians.',
  INNER_SCREENS: 'Part of the invisible endless scroll area on scene pages; never shows.',
  RECENTER_LOW: 'Part of the invisible endless scroll area on scene pages; never shows.',
  RECENTER_HIGH: 'Part of the invisible endless scroll area on scene pages; never shows.',
};
