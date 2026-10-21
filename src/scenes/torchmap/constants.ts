// Fixed values in `torchmap` that are not sliders, each with its reason.

export const FIXED = {
  /** A pixel counts as part of the letters above this alpha. */
  ALPHA_CUTOFF: 128,
  /** The flicker radius changes by at most this share at full flicker amount. */
  FLICKER_CAP: 0.08,
  /** The second flicker wave runs at this share of the first's rate… */
  FLICKER_SLOW: 0.62,
  /** …offset by this phase (radians)… */
  FLICKER_PHASE: 1,
  /** …and the faster wave makes up this share of the flicker. */
  FLICKER_MIX: 0.6,
  /** The name never takes more than this share of the map's width. */
  MAP_FIT: 0.92,
  /** Phones show at most this many screens of map. */
  MAP_CAP_SMALL: 2,
  /** A stone tile fills this share of its cell. */
  TILE_FILL: 0.86,
  /** Stone tiles are the soft text color mixed this far toward the map. */
  STONE_MIX: 0.35,
  /** One map feature (tree, rock or pond) per this many square pixels of map. */
  FEATURE_AREA: 9000,
  /** Features are this many tile sizes across, smallest to largest. */
  FEATURE_MIN: 0.8,
  FEATURE_MAX: 2.6,
  /** Features keep this many tile sizes clear of the name. */
  FEATURE_CLEAR: 1.5,
  /** A tile counts as found once its fog is this far cleared. */
  FOUND: 0.6,
  /** The torch's warm light is accent 2 at this opacity at its center. */
  TORCH_ALPHA: 0.22,
  /** Found tiles glow in accent 1 at up to this opacity during the celebration. */
  GLOW_ALPHA: 0.55,
  /** The glow reaches full strength this many seconds after the last letter is found. */
  GLOW_RISE: 2.5,
  /** Sparks rise this many px a second… */
  SPARK_RISE: 24,
  /** …live this many seconds… */
  SPARK_LIFE: 3,
  /** …and are this many px across. */
  SPARK_SIZE: 2.5,
  /** The idle torch weaves up and down the name by this share of the name's height. */
  IDLE_WEAVE: 0.35,
  /** The idle torch weaves this many times per 1000px of travel. */
  IDLE_WAVES: 3,
  /** Px of travel per unit of weave phase: 1000px. */
  PER_THOUSAND: 1000,
  /** Largest value of one color channel byte. */
  BYTE: 255,
  /** Seed for the map's features and the sparks. */
  SEED: 84,
} as const;

export const FIXED_REASONS: Record<keyof typeof FIXED, string> = {
  ALPHA_CUTOFF: 'Half opacity: the edge of the anti-aliased letters.',
  FLICKER_CAP:
    'Flash safety (PRD §8.2): the torch changes size only a little, so it never flashes.',
  FLICKER_SLOW: 'A second, slower wave so the flicker never looks like a metronome.',
  FLICKER_PHASE: 'Keeps the two flicker waves from peaking together at the start.',
  FLICKER_MIX: 'The faster wave leads, the slower one adds variety.',
  MAP_FIT: 'Layout margin so the outer letters never touch the map edge.',
  MAP_CAP_SMALL: 'SCENES.md #84: phones cap the map at 2 screens.',
  TILE_FILL: 'A thin grout line between stones, so the path reads as tiles.',
  STONE_MIX: 'Stones are a quiet gray that reads on any map color.',
  FEATURE_AREA: 'A map with something to find in every screenful, without clutter.',
  FEATURE_MIN: 'Size range of the hand-drawn map features.',
  FEATURE_MAX: 'Size range of the hand-drawn map features.',
  FEATURE_CLEAR: 'Keeps trees and ponds off the stone path so the name stays readable.',
  FOUND: 'More than half cleared: the visitor has clearly seen the tile.',
  TORCH_ALPHA: 'A warm tint that reads as firelight without washing out the map.',
  GLOW_ALPHA: 'Flash safety: a gentle glow, never a burst of light.',
  GLOW_RISE: 'Flash safety: the celebration fades in slowly over seconds.',
  SPARK_RISE: 'Slow drifting sparks, not fireworks.',
  SPARK_LIFE: 'Long enough to drift, short enough to keep the map clear.',
  SPARK_SIZE: 'Small dots: sparks, not confetti.',
  IDLE_WEAVE: 'The idle torch covers the letters’ height as it passes.',
  IDLE_WAVES: 'A gentle weave so the idle torch looks like someone exploring.',
  PER_THOUSAND: 'Unit conversion for the weave.',
  BYTE: 'The canvas pixel format: opacity is stored as 0 to 255.',
  SEED: 'A fixed map so the scene and its prompt look the same every visit.',
};
