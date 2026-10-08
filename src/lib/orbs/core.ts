/* ============================================================
   Orb engine core
   Every orb is the same pipeline:
     generate 3D points → rotate/project → depth-sort → paint shaded dots
   An orb definition only produces Dots; the engine does the painting.
   ============================================================ */

export type Vec3 = [number, number, number];

/** One painted dot. `white` 0..1 is ink lightness (inverted in dark mode); `a` is alpha. */
export type Dot = { x: number; y: number; z: number; r: number; white: number; a?: number };

export type OrbOptions = Record<string, number>;

/** Pure function: (pixel size, animation time, resolved options) → dots to paint. */
export type OrbDots = (size: number, time: number, o: OrbOptions) => Dot[];

/** Per-size tuning. `count` thins out dots, `size` fattens them, `speed` sets the base tempo. */
export type SizeTuning = { speed: number; count: number; size: number; extra?: OrbOptions };

/** Which option keys get scaled when an orb is shrunk (see config.ts). */
export type OrbScaling = {
  /** 2D grids: both keys scale by √count so total dots scale by `count`. */
  pairs?: [string, string][];
  /** Plain counts: scale linearly by `count`. */
  linear?: string[];
  /** Fractional densities: scale linearly, floor 0.02. */
  icon?: string[];
  /** Dot radii: multiplied by `size`. */
  radius?: string[];
};

export type OrbDefinition = {
  dots: OrbDots;
  defaults: OrbOptions;
  scaling?: OrbScaling;
  /**
   * Tuning buckets: 20 for inline sizes (≤ 42px), 64 for the usual range, `large` for > 160px.
   * When `large` is omitted it inherits 64's speed and extras at full default density.
   */
  tuning: { 64: SizeTuning; 20: SizeTuning; large?: SizeTuning };
};

export const defineOrb = <T extends OrbDefinition>(def: T) => def;

/* ---------- math helpers ---------- */

/** Deterministic sine-hash "random" — stable frame to frame, no real RNG. */
export function hash(i: number, seed: number) {
  const n = Math.sin(i * 12.9898 + seed * 78.233) * 43758.5453;
  return n - Math.floor(n);
}

/** Evenly scattered points on a unit sphere (golden-angle spiral). */
export function fibonacciSphere(i: number, count: number): Vec3 {
  const golden = Math.PI * (3 - Math.sqrt(5));
  const y = 1 - (2 * (i + 0.5)) / count;
  const r = Math.sqrt(1 - y * y);
  const theta = i * golden;
  return [r * Math.cos(theta), y, r * Math.sin(theta)];
}

/** Smallest signed difference between two angles. */
export function angleDelta(a: number, b: number) {
  return Math.atan2(Math.sin(a - b), Math.cos(a - b));
}

export const smoothstep = (e: number) => e * e * (3 - 2 * e);

/** Dot radius scales gently with canvas size. */
export const resolutionScale = (size: number, pow: number) => (size / 300) ** pow;

/**
 * Builds a rotate-then-project function: yaw (around vertical), then pitch (tilt).
 * Returns [screenX, screenY, depthZ]; depthZ stays in model units (for sorting/shading).
 */
export function makeProjector(yaw: number, pitch: number, cx: number, cy: number, scale: number) {
  const sinP = Math.sin(pitch), cosP = Math.cos(pitch);
  const sinY = Math.sin(yaw), cosY = Math.cos(yaw);
  return (x: number, y: number, z: number): Vec3 => {
    const rx = x * cosY + z * sinY;
    const rz = -x * sinY + z * cosY;
    const ry = y * cosP - rz * sinP;
    const depthZ = y * sinP + rz * cosP;
    return [cx + rx * scale, cy - ry * scale, depthZ];
  };
}

export type SpherePoint = { x: number; y: number; z: number; ring: number; lon: number };

const sphereCache = new Map<string, SpherePoint[]>();

/** Unit sphere as latitude rings; dots per ring shrink toward the poles. Cached per density. */
export function latLonSphere(rings: number, lonDensity: number): SpherePoint[] {
  const key = `${rings}:${lonDensity}`;
  const cached = sphereCache.get(key);
  if (cached) return cached;
  const out: SpherePoint[] = [];
  for (let a = 0; a <= rings; a++) {
    const lat = -Math.PI / 2 + (a / rings) * Math.PI;
    const cl = Math.cos(lat), sl = Math.sin(lat);
    const n = Math.max(1, Math.round(Math.abs(cl) * lonDensity));
    for (let b = 0; b < n; b++) {
      const lon = (b / n) * 2 * Math.PI;
      out.push({ x: cl * Math.cos(lon), y: sl, z: cl * Math.sin(lon), ring: a, lon });
    }
  }
  sphereCache.set(key, out);
  return out;
}

/* ---------- painter ---------- */

/** An sRGB colour, each channel 0..255. */
export type Rgb = readonly [number, number, number];

/**
 * Painter's algorithm: back-to-front filled circles.
 *
 * Without a tint the dots are grayscale ink. With one, the same ink value
 * scales the tint instead: on dark the brightest dots are the tint and far
 * ones fade toward black; on light the darkest dots are the tint and far ones
 * fade toward white. So every mode's depth shading carries over to colour.
 */
export function depthPaint(ctx: CanvasRenderingContext2D, dots: Dot[], dark: boolean, rMin = 0.3, tint?: Rgb) {
  dots.sort((p, q) => p.z - q.z);
  for (const pt of dots) {
    const alpha = pt.a ?? 1;
    if (alpha < 0.02) continue;
    const white = Math.min(1, Math.max(0, pt.white));
    if (tint) {
      const k = dark ? 1 - white : white;
      const [r, g, b] = dark ? tint.map((c) => Math.round(c * k)) : tint.map((c) => Math.round(c + (255 - c) * k));
      ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`;
    } else {
      const shade = Math.round((dark ? 1 - white : white) * 255);
      ctx.fillStyle = `rgba(${shade},${shade},${shade},${alpha})`;
    }
    ctx.beginPath();
    ctx.arc(pt.x, pt.y, Math.max(rMin, pt.r), 0, Math.PI * 2);
    ctx.fill();
  }
}

/* ---------- composition helpers ---------- */

export type Projector = ReturnType<typeof makeProjector>;

export const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

export function rotateX([x, y, z]: Vec3, a: number): Vec3 {
  const c = Math.cos(a), s = Math.sin(a);
  return [x, y * c - z * s, y * s + z * c];
}

export function rotateY([x, y, z]: Vec3, a: number): Vec3 {
  const c = Math.cos(a), s = Math.sin(a);
  return [x * c + z * s, y, -x * s + z * c];
}

/** Wraps a projector to also return depth 0 (back) .. 1 (front), normalised by the shape's max radius. */
export function withDepth(project: Projector, maxMag = 1) {
  return (px: number, py: number, pz: number): [number, number, number, number] => {
    const [x, y, z] = project(px, py, pz);
    return [x, y, z, clamp01((z / maxMag + 1) / 2)];
  };
}

export function rotateZ([x, y, z]: Vec3, a: number): Vec3 {
  const c = Math.cos(a), s = Math.sin(a);
  return [x * c - y * s, x * s + y * c, z];
}

/** Rotate v by angle a around the unit axis k (Rodrigues). */
export function rotateAxis(v: Vec3, k: Vec3, a: number): Vec3 {
  const c = Math.cos(a), s = Math.sin(a);
  const dot = k[0] * v[0] + k[1] * v[1] + k[2] * v[2];
  const cx = k[1] * v[2] - k[2] * v[1], cy = k[2] * v[0] - k[0] * v[2], cz = k[0] * v[1] - k[1] * v[0];
  return [
    v[0] * c + cx * s + k[0] * dot * (1 - c),
    v[1] * c + cy * s + k[1] * dot * (1 - c),
    v[2] * c + cz * s + k[2] * dot * (1 - c),
  ];
}

const GOLDEN = Math.PI * (3 - Math.sqrt(5));

/** Evenly packed point k of n on a unit disk (sunflower pattern), as [x, y]. */
export function sunflower(k: number, n: number): [number, number] {
  const r = Math.sqrt((k + 0.5) / n), a = k * GOLDEN;
  return [r * Math.cos(a), r * Math.sin(a)];
}

/** Point `u` (0..1) along the great circle from unit vectors a to b. */
export function slerp(a: Vec3, b: Vec3, u: number): Vec3 {
  const cos = Math.max(-1, Math.min(1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2]));
  const w = Math.acos(cos), s = Math.sin(w) || 1;
  const ka = Math.sin((1 - u) * w) / s, kb = Math.sin(u * w) / s;
  return [a[0] * ka + b[0] * kb, a[1] * ka + b[1] * kb, a[2] * ka + b[2] * kb];
}

/** Uniformly "random" unit vector for index i (deterministic). */
export function randomOnSphere(i: number, seed: number): Vec3 {
  const y = hash(i, seed) * 2 - 1, lon = hash(i, seed + 11.7) * 2 * Math.PI, r = Math.sqrt(1 - y * y);
  return [r * Math.cos(lon), y, r * Math.sin(lon)];
}
