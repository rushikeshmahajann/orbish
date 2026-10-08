/**
 * The hero's light: the ray field the SideRays canvas paints. Kept as a
 * shared GLSL snippet so anything else drawn in the hero can be lit by the
 * same rays by compiling it and sampling at its own screen position.
 *
 * Unlike react-bits' SideRays, which fans rays out of one corner, this is a
 * sheet of parallel rays: every beam travels in the same diagonal direction
 * and enters along the whole top edge, like low sun through a window. Their
 * brightness across the sheet is a stack of incommensurate sine bands, with
 * slow clustered gaps, so the beams come unevenly rather than as a grating,
 * and each layer drifts at its own pace.
 */

export type RayLight = Readonly<{
  /**
   * Direction the rays travel, degrees from the x axis with y pointing down:
   * 90 is straight down, less leans right, more leans left. Keep it within
   * 25..155 so the light still enters from the top.
   */
  angleDeg: number;
  /** How many beams fit across one viewport height; roughly bands per height. */
  density: number;
  /** How fast the bands drift. */
  speed: number;
  /** Brightness at the top edge and how fast it dies as the light travels down. */
  intensity: number;
  falloff: number;
  /** Heights the light has already travelled on entry: softens the top edge. */
  entry: number;
  /** Mix between the two band layers: 0 is only the fast one, 1 only the slow one. */
  blend: number;
}>;

export const RAY_LIGHT: RayLight = Object.freeze({
  angleDeg: 65,
  density: 14,
  speed: 2.5,
  intensity: 3,
  falloff: 1.6,
  entry: 0.35,
  blend: 0.75,
});

const f = (value: number) => value.toFixed(6);

/**
 * GLSL for the ray field, with the light's constants baked in.
 *
 *   rayField(fragCoord, resolution, time) → (band layer 1, band layer 2, brightness)
 *   rayLight(fragCoord, resolution, time) → the blended light at that pixel, unclamped
 *
 * `fragCoord` is gl_FragCoord.xy (y up from the bottom); `resolution` is the
 * drawing-buffer size in the same pixels; `time` is seconds.
 */
export function rayLightGlsl(light: RayLight = RAY_LIGHT): string {
  const a = (light.angleDeg * Math.PI) / 180;
  return `
const vec2  RAY_DIR       = vec2(${f(Math.cos(a))}, ${f(Math.sin(a))});
const vec2  RAY_PERP      = vec2(${f(-Math.sin(a))}, ${f(Math.cos(a))});
const float RAY_DENSITY   = ${f(light.density)};
const float RAY_SPEED     = ${f(light.speed)};
const float RAY_INTENSITY = ${f(light.intensity)};
const float RAY_FALLOFF   = ${f(light.falloff)};
const float RAY_ENTRY     = ${f(light.entry)};
const float RAY_BLEND     = ${f(light.blend)};

// Brightness across the sheet at perpendicular position u (in beams): three
// sines at unrelated frequencies make the beams uneven, and a much slower
// fourth gates whole stretches down so they arrive in clusters.
float rayBands(float u, float speed, float time) {
  float s  = 0.55 + 0.45 * sin(u * 1.00 + time * speed * 0.30);
  s       *= 0.55 + 0.45 * sin(u * 0.41 + 1.7 - time * speed * 0.12);
  s       += 0.20 * sin(u * 2.30 + 0.6 + time * speed * 0.21);
  s       *= 0.55 + 0.45 * smoothstep(-0.2, 0.6, sin(u * 0.21 + time * speed * 0.05));
  return clamp(s, 0.0, 1.0);
}

vec3 rayField(vec2 fragCoord, vec2 res, float time) {
  // y down from the top, in viewport heights
  vec2 coord = vec2(fragCoord.x, res.y - fragCoord.y) / res.y;
  float u = dot(coord, RAY_PERP) * RAY_DENSITY;
  float r1 = rayBands(u, RAY_SPEED, time);
  float r2 = rayBands(u * 0.63 + 2.0, RAY_SPEED * 0.2, time + 11.0);
  // heights the light has travelled since entering at the top edge
  float travelled = coord.y / max(RAY_DIR.y, 0.2);
  float bright = RAY_INTENSITY * 0.25 / pow(travelled + RAY_ENTRY, RAY_FALLOFF);
  return vec3(r1, r2, bright);
}

float rayLight(vec2 fragCoord, vec2 res, float time) {
  vec3 fld = rayField(fragCoord, res, time);
  return (fld.x * (1.0 - RAY_BLEND) + fld.y * RAY_BLEND) * 0.9 * fld.z;
}
`;
}

/* ---------- the same light, in JavaScript ----------
 * A line-for-line port of rayBands / rayField / rayLight above, for DOM
 * elements that should be lit by the rays (the hero wordmark). Keep the two in
 * step: a change to the GLSL bands needs the same change here. */

const smoothstep = (e0: number, e1: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)));
  return t * t * (3 - 2 * t);
};

function rayBandsJs(u: number, speed: number, time: number): number {
  let s = 0.55 + 0.45 * Math.sin(u * 1.0 + time * speed * 0.3);
  s *= 0.55 + 0.45 * Math.sin(u * 0.41 + 1.7 - time * speed * 0.12);
  s += 0.2 * Math.sin(u * 2.3 + 0.6 + time * speed * 0.21);
  s *=
    0.55 +
    0.45 * smoothstep(-0.2, 0.6, Math.sin(u * 0.21 + time * speed * 0.05));
  return Math.min(1, Math.max(0, s));
}

/**
 * The light at one point, exactly as the shaders compute it.
 * `x` and `yFromTop` are in the same units as `height`, the height of the
 * canvas the rays are drawn on (CSS pixels are fine: the field is scale-free,
 * so only the height sets its scale). `time` is seconds on the rAF clock.
 */
export function rayLightAt(
  x: number,
  yFromTop: number,
  height: number,
  time: number,
  light: RayLight = RAY_LIGHT,
): number {
  const a = (light.angleDeg * Math.PI) / 180;
  const cx = x / height;
  const cy = yFromTop / height;
  const u = (cx * -Math.sin(a) + cy * Math.cos(a)) * light.density;
  const r1 = rayBandsJs(u, light.speed, time);
  const r2 = rayBandsJs(u * 0.63 + 2.0, light.speed * 0.2, time + 11.0);
  const travelled = cy / Math.max(Math.sin(a), 0.2);
  const bright =
    (light.intensity * 0.25) / Math.pow(travelled + light.entry, light.falloff);
  return (r1 * (1 - light.blend) + r2 * light.blend) * 0.9 * bright;
}
