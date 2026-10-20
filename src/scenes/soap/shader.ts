// The soap film fragment shader (PRD §8.8). Layers, in order: the dark room behind the film;
// the film's colors from thin-film interference (two-beam, summed over visible wavelengths and
// turned into color with the CIE 1931 curves), lit by a window it mirrors, with the view angle
// and mirror direction changing across the film and with every bulge; the wire as dark metal
// with a highlight; and falling droplets. Every shaping number comes from `FIXED` or a uniform.

import { FS_HEADER, GLSL_NOISE } from '../../kits/gl';
import { FIXED } from './constants';

const f = (n: number) => (Number.isInteger(n) ? n.toFixed(1) : String(n));

export const SOAP_FS = `${FS_HEADER}
${GLSL_NOISE}
#define LAMBDAS ${FIXED.LAMBDA[2]}
#define MAX_DROPS ${FIXED.MAX_DROPS}
uniform sampler2D u_film;   // R thickness, G bulge, B film flag
uniform sampler2D u_mask;   // R film area, G wire
uniform vec2 u_size;        // CSS size
uniform vec2 u_texel;       // one film cell in texture units
uniform vec2 u_maskTexel;
uniform float u_n;          // refractive index
uniform float u_reflect;    // window reflection strength
uniform float u_sat;        // color strength
uniform float u_stride;     // 1 = every wavelength, 2 = every other (phone)
uniform vec2 u_window;      // window center in reflection-direction units
uniform vec3 u_bg;
uniform vec3 u_wire;
uniform float u_thickMax;
uniform float u_bulgeSlope;
uniform float u_eyeDist;
uniform float u_mullion;
uniform float u_lamStep;
uniform float u_yNorm;
uniform vec2 u_winSize;
uniform float u_winSoft;
uniform float u_winLight;
uniform float u_room;
uniform float u_filmGain;
uniform float u_tone;
uniform float u_blackFilm;
uniform float u_vignette;
uniform float u_wireSpec;
uniform float u_wirePow;
uniform float u_wireRound;
uniform float u_dropRim;
uniform float u_dropRimPow;
uniform float u_dropGlint;
uniform float u_dropGlintPow;
uniform float u_dropShade;
uniform float u_dither;
uniform float u_dropCount;
uniform vec4 u_drops[MAX_DROPS]; // x, y (CSS px), radius, alpha
uniform vec4 u_cmf[LAMBDAS];      // per wavelength: the CIE x, y, z weights and the wavelength (nm)
uniform vec3 u_r0;                // row 0 of XYZ to RGB
uniform vec3 u_r1;
uniform vec3 u_r2;


// Light mirrored from direction r: a dim room with one bright window that has a cross of bars.
float env(vec2 r) {
  vec2 d = abs(r - u_window);
  float w = (1.0 - smoothstep(u_winSize.x, u_winSize.x + u_winSoft, d.x))
          * (1.0 - smoothstep(u_winSize.y, u_winSize.y + u_winSoft, d.y));
  float bars = smoothstep(u_mullion, u_mullion * 2.0, min(d.x, d.y));
  return u_room + u_winLight * u_reflect * w * bars;
}

float bulgeAt(vec2 t) {
  return texture2D(u_film, t).g * 2.0 - 1.0;
}

void main() {
  vec2 uv = v_uv;
  vec2 tuv = vec2(uv.x, 1.0 - uv.y);
  vec2 px = tuv * u_size;
  float aspect = u_size.x / u_size.y;
  vec2 centered = vec2((tuv.x - 0.5) * aspect, 0.5 - tuv.y);

  // Behind the film: a dark room with a soft vignette.
  float vig = dot(tuv - 0.5, tuv - 0.5) * 2.0;
  vec3 col = u_bg * (1.0 - u_vignette * vig);

  vec4 cell = texture2D(u_film, tuv);
  vec4 m = texture2D(u_mask, tuv);
  float film = cell.b * m.r;
  if (film > 0.003) {
    float d = cell.r * u_thickMax;
    // The bulge tilts the film: its slope is the surface normal's lean.
    float bx = bulgeAt(tuv + vec2(u_texel.x, 0.0)) - bulgeAt(tuv - vec2(u_texel.x, 0.0));
    float by = bulgeAt(tuv + vec2(0.0, u_texel.y)) - bulgeAt(tuv - vec2(0.0, u_texel.y));
    vec3 N = normalize(vec3(-bx * u_bulgeSlope, by * u_bulgeSlope, 1.0));
    vec3 V = normalize(vec3(-centered.x, centered.y, u_eyeDist));
    float cosI = clamp(dot(N, V), 0.05, 1.0);
    float sinT2 = (1.0 - cosI * cosI) / (u_n * u_n);
    float cosT = sqrt(1.0 - sinT2);
    float r0 = (u_n - 1.0) / (u_n + 1.0);
    r0 *= r0;
    float R = r0 + (1.0 - r0) * pow(1.0 - cosI, 5.0);
    vec3 xyz = vec3(0.0);
    float step_ = u_lamStep;
    for (int i = 0; i < LAMBDAS; i++) {
      if (mod(float(i), u_stride) > 0.5) continue;
      vec4 c = u_cmf[i];
      float delta = 12.566370614 * u_n * d * cosT / c.w;
      float I = clamp(2.0 * R * (1.0 - cos(delta)), 0.0, 1.0);
      xyz += c.xyz * I;
    }
    xyz *= step_ * u_stride / u_yNorm;
    vec3 rgb = vec3(dot(u_r0, xyz), dot(u_r1, xyz), dot(u_r2, xyz));
    vec3 r = reflect(-V, N);
    float light = env(r.xy);
    rgb = max(rgb, vec3(0.0)) + vec3(u_blackFilm);
    float lum = dot(rgb, vec3(0.2126, 0.7152, 0.0722));
    rgb = mix(vec3(lum), rgb, u_sat);
    col += rgb * light * u_filmGain * film;
  }

  // The wire: dark metal, rounded by its own edge, with a highlight toward the window.
  float g = m.g;
  if (g > 0.003) {
    float gx = texture2D(u_mask, tuv + vec2(u_maskTexel.x, 0.0)).g - texture2D(u_mask, tuv - vec2(u_maskTexel.x, 0.0)).g;
    float gy = texture2D(u_mask, tuv + vec2(0.0, u_maskTexel.y)).g - texture2D(u_mask, tuv - vec2(0.0, u_maskTexel.y)).g;
    vec3 n = normalize(vec3(-gx * u_wireRound, gy * u_wireRound, 1.0));
    vec3 L = normalize(vec3(u_window, 1.0));
    vec3 H = normalize(L + vec3(0.0, 0.0, 1.0));
    float diff = max(dot(n, L), 0.0);
    float spec = pow(max(dot(n, H), 0.0), u_wirePow) * u_wireSpec;
    vec3 wcol = u_wire * (0.25 + 0.75 * diff) + vec3(spec);
    col = mix(col, wcol, clamp(g, 0.0, 1.0));
  }

  // Droplets: a bright rim, a glint where they mirror the window, and a little shade.
  vec3 glintDir = normalize(vec3(u_window, 1.0));
  for (int i = 0; i < MAX_DROPS; i++) {
    vec4 dr = u_drops[i];
    if (dr.w <= 0.0) continue;
    vec2 p = px - dr.xy;
    float q = length(p) / dr.z;
    if (q >= 1.0) continue;
    vec3 n3 = vec3(p.x / dr.z, -p.y / dr.z, sqrt(1.0 - q * q));
    float rim = pow(q, u_dropRimPow) * u_dropRim;
    float glint = pow(max(dot(n3, glintDir), 0.0), u_dropGlintPow) * u_dropGlint;
    col = col * (1.0 - u_dropShade * dr.w * (1.0 - q * q)) + vec3(rim + glint) * dr.w * u_reflect;
  }

  col = vec3(1.0) - exp(-col * u_tone);
  col = pow(col, vec3(1.0 / ${f(FIXED.GAMMA)}));
  col += (hash21(gl_FragCoord.xy) - 0.5) / 255.0 * u_dither;
  gl_FragColor = vec4(col, 1.0);
}`;
