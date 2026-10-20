// The velvet fragment shader (PRD §8.8): one pass, every pixel. Layers, in order:
// (1) the fiber lean from the brushed field, turned by crush mottle and per-fiber noise,
// (2) wrap diffuse light on the leaning surface, (3) a Kajiya-Kay highlight along the fibers,
// (4) a rim sheen where fibers lie flat, (5) per-fiber brightness and a few sparkles,
// (6) the dent, (7) lamp falloff, then exposure and gamma. Every shaping number is a uniform.

import { FS_HEADER, GLSL_NOISE } from '../../kits/gl';

export const VELVET_FS = `${FS_HEADER}
${GLSL_NOISE}
uniform sampler2D u_field;
uniform vec2 u_size;        // CSS size of the canvas
uniform vec3 u_body;        // body color (light, not sRGB)
uniform vec3 u_sheenCol;    // sheen color (light)
uniform vec3 u_light;       // unit vector from the surface to the lamp
uniform float u_pile;       // pile length 0..1
uniform float u_sheen;      // sheen strength 0..1
uniform float u_dent;       // dent strength 0..1
uniform float u_fiberSize;  // px per fiber cell
uniform float u_fiberStrength;
uniform float u_sheenPow;
uniform float u_ambient;
uniform float u_crush;      // 0..1
uniform float u_detail;     // 1 = full fiber detail, 0 = skip the finest layer
uniform float u_tiltGain;
uniform float u_wrap;
uniform float u_rimPow;
uniform float u_rimWeight;
uniform float u_kkWeight;
uniform float u_fiberLum;
uniform float u_sparkRate;
uniform float u_sparkGain;
uniform float u_dentDark;
uniform float u_dentSheen;
uniform float u_falloff;
uniform float u_exposure;
uniform float u_gamma;
uniform float u_fiberTurn;  // radians a fiber may turn at full fiber strength
uniform float u_crushTurn;  // radians the crush may turn the pile at full crush
uniform float u_crushScale; // fibers per crush patch
uniform float u_tangentGain;
uniform float u_kkGate;
uniform float u_crushSize;  // px per big crush fold
uniform float u_crushRelief;
uniform float u_crushEps;
uniform vec4 u_wave0;       // fold waves: direction x, direction y, frequency, phase
uniform vec4 u_wave1;
uniform vec4 u_wave2;
uniform vec4 u_wave3;
uniform float u_waveWeight;
uniform float u_warp;       // how much noise bends the waves into creases
uniform float u_satinPow;
uniform float u_satinWeight;
uniform float u_leanRef;    // lean length at which the sheen is full
uniform float u_sheenFloor; // share of the sheen even upright fibers show

float ridge(vec2 w, vec4 k) {
  return 1.0 - abs(sin(dot(w, k.xy) * k.z + k.w));
}

// Height of the big folds: four creased waves, bent by a little noise.
float foldHeight(vec2 p) {
  vec2 w = p + u_warp * vec2(fbm(p * 0.5), fbm(p * 0.5 + 7.7));
  return u_waveWeight * (ridge(w, u_wave0) + ridge(w, u_wave1) + ridge(w, u_wave2) + ridge(w, u_wave3));
}

vec2 rot(vec2 v, float a) {
  float c = cos(a);
  float s = sin(a);
  return vec2(c * v.x - s * v.y, s * v.x + c * v.y);
}

void main() {
  vec2 uv = v_uv;
  vec4 f = texture2D(u_field, uv);
  vec2 lean = f.rg * 2.0 - 1.0;
  float dent = f.b;
  vec2 px = vec2(uv.x, 1.0 - uv.y) * u_size;

  // Per-fiber randomness: a tiny turn of each fiber's lean, and its own brightness.
  vec2 cell = floor(px / u_fiberSize);
  float h1 = hash21(cell);
  float h2 = hash21(cell + 31.7);
  float turn = (h1 - 0.5) * u_fiberStrength * u_fiberTurn;
  // Crush: slow patches of pile that lean differently.
  float m = fbm(px / (u_fiberSize * u_crushScale)) - 0.5;
  turn += m * u_crush * u_crushTurn;
  vec2 L = rot(lean, turn);
  // Flip y: the field's y runs down the screen, the shader's runs up.
  L.y = -L.y;

  float len = length(L) * u_pile;
  vec3 lamp = vec3(u_light.x, -u_light.y, u_light.z);
  // The big folds of crushed cloth: a smooth height from noise, its slope tilts the surface.
  vec2 cp = px / u_crushSize;
  float h0 = foldHeight(cp);
  vec2 slope = vec2(foldHeight(cp + vec2(u_crushEps, 0.0)) - h0, foldHeight(cp + vec2(0.0, u_crushEps)) - h0) / u_crushEps;
  vec3 fold = vec3(-slope.x, slope.y, 0.0) * u_crushRelief * u_crush;
  vec3 N = normalize(vec3(L * u_tiltGain * u_pile, 1.0) + fold);
  vec3 V = vec3(0.0, 0.0, 1.0);
  vec3 T = normalize(vec3(L * u_pile * u_tangentGain, 1.0));
  vec3 H = normalize(lamp + V);

  float diffuse = clamp((dot(N, lamp) + u_wrap) / (1.0 + u_wrap), 0.0, 1.0);
  float sinTH = sqrt(max(0.0, 1.0 - dot(T, H) * dot(T, H)));
  float kk = pow(sinTH, u_sheenPow) * smoothstep(0.0, 0.5, dot(N, lamp) + u_kkGate);
  float rim = pow(1.0 - max(dot(N, V), 0.0), u_rimPow);
  float lying = u_sheenFloor + (1.0 - u_sheenFloor) * clamp(len / u_leanRef, 0.0, 1.0);
  float satin = pow(max(dot(N, H), 0.0), u_satinPow);
  float sheen = u_sheen * lying * (kk * u_kkWeight + rim * u_rimWeight + satin * u_satinWeight);

  float fibre = 1.0 + (h2 - 0.5) * u_fiberLum * u_fiberStrength * u_detail;
  float spark = step(u_sparkRate, h1) * u_sparkGain * u_sheen * u_detail * kk;

  vec3 col = u_body * (u_ambient + diffuse * (1.0 - u_ambient)) * fibre;
  col += u_sheenCol * (sheen + spark) * (1.0 - u_dentSheen * dent);
  col *= 1.0 - u_dentDark * dent * u_dent;

  // The lamp lights the near side of the cloth more than the far side.
  float along = dot(uv - 0.5, normalize(lamp.xy + 0.0001)) + 0.5;
  col *= mix(1.0 - u_falloff, 1.0, clamp(along, 0.0, 1.0));

  col *= u_exposure;
  gl_FragColor = vec4(pow(col, vec3(1.0 / u_gamma)), 1.0);
}`;
