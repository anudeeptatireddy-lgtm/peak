// Fixed values in `anamorphic` that are not sliders, each with its reason.

export const FIXED = {
  /** The name is sampled on a grid starting this many px apart… */
  START_GAP: 3,
  /** …widened until it gives no more points than there are shards, up to this gap. */
  MAX_GAP: 80,
  /** A pixel counts as part of the letters above this alpha. */
  ALPHA_CUTOFF: 128,
  /** Focal length of the camera as a share of the shorter screen side, at perspective 1. */
  FOCAL: 1.2,
  /** Shards never come closer to the camera than this share of the focal length. */
  NEAR_LIMIT: 0.6,
  /** Up-and-down orbit as a share of the side-to-side orbit. */
  PITCH_SHARE: 0.6,
  /** The smallest shard is this share of the shard size (the largest is the full size). */
  SHARD_MIN: 0.6,
  /** The idle path's up-and-down wave runs this many times faster than its side-to-side wave. */
  IDLE_RATIO: 2,
  /** Phone tilt (degrees) that counts as a full orbit, either way. */
  GYRO_RANGE: 30,
  /** Phone pitch (degrees) held in a hand at rest, so leaning is measured from there. */
  GYRO_REST: 45,
  /** Height of the "Use motion" button in rem: a comfortable touch target. */
  BUTTON_HEIGHT: 2.75,
  /** Gap between the "Use motion" button and the bottom of the section, in rem. */
  BUTTON_BOTTOM: 1.5,
  /** Side padding of the "Use motion" button in rem. */
  BUTTON_PAD: 1.25,
  /** Corner radius of the "Use motion" button: any value this large makes a pill. */
  PILL: 999,
  /** Corners of a triangle shard and of a four-sided shard. */
  TRI: 3,
  QUAD: 4,
  /** Degrees in half a turn, to turn the orbit slider into radians. */
  HALF_TURN: 180,
  /** Seed for the shards' depths, sizes and turns, so the layout is the same every visit. */
  SEED: 63,
} as const;

export const FIXED_REASONS: Record<keyof typeof FIXED, string> = {
  START_GAP: 'Where the sampling search starts; the shard count decides the real spacing.',
  MAX_GAP: 'Ends the sampling search for very long names; never reached at normal sizes.',
  ALPHA_CUTOFF: 'Half opacity: the edge of the anti-aliased letters.',
  FOCAL: 'A natural lens at perspective 1; the Perspective slider scales it.',
  NEAR_LIMIT: 'Keeps every shard in front of the camera, so none flips or blows up.',
  PITCH_SHARE: 'Screens are wider than tall, so the vertical orbit is gentler.',
  SHARD_MIN: 'A little size variety so the shards read as broken pieces, not a grid.',
  IDLE_RATIO: 'A figure-eight path that crosses the sweet spot twice per loop.',
  GYRO_RANGE: 'A comfortable full lean of a phone; the browser reports tilt in degrees.',
  GYRO_REST: 'The pitch of a phone held to read; leaning is measured from it.',
  BUTTON_HEIGHT: 'At least 44px tall, the touch-target minimum (PRD §8.3).',
  BUTTON_BOTTOM: 'Layout gap so the button clears the screen edge.',
  BUTTON_PAD: 'Comfortable side padding for a touch button.',
  PILL: 'Any radius this large gives a pill shape.',
  TRI: 'Geometry: a triangle has three corners.',
  QUAD: 'Geometry: a four-sided piece has four corners.',
  HALF_TURN: 'Unit conversion from degrees to radians.',
  SEED: 'A fixed layout so the scene and its prompt look the same every visit.',
};
