// Fixed values in `shatter` that are not sliders, each with its reason.

export const FIXED = {
  /** Each split point is the piece's center nudged by up to this share of its size. */
  SPLIT_JITTER: 0.5,
  /** Shards count as home (and fuse) once closer than this, in px and radians. */
  HOME_DIST: 0.5,
  HOME_ANGLE: 0.01,
  /** A shard needs at least this many corners (a cut that grazes a corner makes none). */
  MIN_CORNERS: 3,
} as const;

export const FIXED_REASONS: Record<keyof typeof FIXED, string> = {
  SPLIT_JITTER:
    'Keeps cracks crossing the middle of each piece, so shards come out glass-like rather than as slivers; the shard count setting decides how many.',
  HOME_DIST:
    'Below half a pixel the shard is visually home; it only decides when the fuse shimmer starts.',
  HOME_ANGLE:
    'Below a hundredth of a radian the shard looks straight; it only decides when the fuse shimmer starts.',
  MIN_CORNERS: 'Geometry: a polygon has at least three corners; it only skips degenerate cuts.',
};
