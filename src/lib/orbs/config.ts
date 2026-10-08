import type { OrbDefinition, OrbOptions, OrbScaling } from "./core";
import { ORB_MODES, type OrbMode } from "./modes";

/** Semantic states your app talks in, mapped to a visual mode and a label. */
export const ORB_STATES = {
  searching: { mode: "globe", label: "Searching…" },
  solving: { mode: "rubik", label: "Solving…" },
  listening: { mode: "wave", label: "Listening…" },
  composing: { mode: "ribbon", label: "Composing…" },
  recalling: { mode: "ripple", label: "Recalling…" },
  decoding: { mode: "dial", label: "Decoding…" },
  building: { mode: "cube", label: "Building…" },
  connecting: { mode: "network", label: "Connecting…" },
  sensing: { mode: "field", label: "Sensing…" },
  drafting: { mode: "spiral", label: "Drafting…" },
  gathering: { mode: "swarm", label: "Gathering…" },
  pondering: { mode: "eclipse", label: "Pondering…" },
  exploring: { mode: "saturn", label: "Exploring…" },
  delegating: { mode: "moons", label: "Delegating…" },
  syncing: { mode: "heartbeat", label: "Syncing…" },
  imagining: { mode: "blob", label: "Imagining…" },
  learning: { mode: "absorb", label: "Learning…" },
  speaking: { mode: "spikes", label: "Speaking…" },
  comparing: { mode: "split", label: "Comparing…" },
  refining: { mode: "twist", label: "Refining…" },
  securing: { mode: "cage", label: "Securing…" },
  waiting: { mode: "hourglass", label: "Waiting…" },
  streaming: { mode: "jupiter", label: "Streaming…" },
  celebrating: { mode: "sparkle", label: "Celebrating…" },
  unfolding: { mode: "bloom", label: "Unfolding…" },
  bouncing: { mode: "bounce", label: "Bouncing…" },
  printing: { mode: "voxel", label: "Printing…" },
  pairing: { mode: "binary", label: "Pairing…" },
  tracing: { mode: "trace", label: "Tracing…" },
  mapping: { mode: "unwrap", label: "Mapping…" },
  balancing: { mode: "gyro", label: "Balancing…" },
  pinging: { mode: "satellite", label: "Pinging…" },
  loading: { mode: "reveal", label: "Loading…" },
  toggling: { mode: "halves", label: "Toggling…" },
  layering: { mode: "shells", label: "Layering…" },
  growing: { mode: "grow", label: "Growing…" },
  warming: { mode: "spin", label: "Warming…" },
  brewing: { mode: "drip", label: "Brewing…" },
  settling: { mode: "snow", label: "Settling…" },
  idling: { mode: "blink", label: "Idling…" },
  harmonizing: { mode: "phyllotaxis", label: "Harmonizing…" },
  resonating: { mode: "moire", label: "Resonating…" },
  studying: { mode: "focus", label: "Studying…" },
  wobbling: { mode: "jelly", label: "Wobbling…" },
  ticking: { mode: "tick", label: "Ticking…" },
  reconsidering: { mode: "invert", label: "Reconsidering…" },
  zooming: { mode: "dolly", label: "Zooming…" },
  debugging: { mode: "glitch", label: "Debugging…" },
  examining: { mode: "contour", label: "Examining…" },
  organizing: { mode: "relax", label: "Organizing…" },
  multiplying: { mode: "mitosis", label: "Multiplying…" },
  immersing: { mode: "inside", label: "Immersing…" },
  circulating: { mode: "convection", label: "Circulating…" },
  diffusing: { mode: "gas", label: "Diffusing…" },
  recursing: { mode: "fractal", label: "Recursing…" },
  detailing: { mode: "tessellate", label: "Detailing…" },
  surveying: { mode: "terrain", label: "Surveying…" },
  vibrating: { mode: "harmonic", label: "Vibrating…" },
  weighing: { mode: "beads", label: "Weighing…" },
  reflecting: { mode: "mirror", label: "Reflecting…" },
  bubbling: { mode: "bubbles", label: "Bubbling…" },
  gusting: { mode: "wind", label: "Gusting…" },
  converging: { mode: "fireflies", label: "Converging…" },
  compressing: { mode: "squeeze", label: "Compressing…" },
} as const satisfies Record<string, { mode: OrbMode; label: string }>;

export type OrbState = keyof typeof ORB_STATES;

/** Thin out dots: grid pairs by √count (so total dots ∝ count), plain counts linearly. */
function scaleCount(opts: OrbOptions, count: number, s: OrbScaling): OrbOptions {
  const o = { ...opts }, sq = Math.sqrt(count);
  for (const [a, b] of s.pairs ?? []) {
    o[a] = Math.max(2, Math.round(o[a] * sq));
    o[b] = Math.max(2, Math.round(o[b] * sq));
  }
  for (const k of s.linear ?? []) o[k] = Math.max(1, Math.round(o[k] * count));
  for (const k of s.icon ?? []) o[k] = Math.max(0.02, o[k] * count);
  return o;
}

function scaleSize(opts: OrbOptions, mul: number, s: OrbScaling): OrbOptions {
  const o = { ...opts };
  for (const k of s.radius ?? []) o[k] = o[k] * mul;
  return o;
}

export type ResolvedOrb = { def: OrbDefinition; speed: number; opts: OrbOptions };

const cache = new Map<string, ResolvedOrb>();

/**
 * (mode, pixel size) → definition, base speed and final options.
 * Sizes ≤ 42px use the small "20" tuning, everything else the "64" tuning;
 * geometry still scales with the real pixel size, so large orbs stay crisp.
 */
export function resolveOrb(mode: OrbMode, size: number): ResolvedOrb {
  const bucket = size <= 42 ? 20 : size > 160 ? "large" : 64;
  const key = `${mode}-${bucket}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const def: OrbDefinition = ORB_MODES[mode];
  const tuning = bucket === "large" ? (def.tuning.large ?? { ...def.tuning[64], count: 1, size: 1 }) : def.tuning[bucket];
  const scaling = def.scaling ?? {};
  let opts = { ...def.defaults };
  if (tuning.count !== 1) opts = scaleCount(opts, tuning.count, scaling);
  if (tuning.size !== 1) opts = scaleSize(opts, tuning.size, scaling);
  if (tuning.extra) opts = { ...opts, ...tuning.extra };
  const resolved = { def, speed: tuning.speed, opts };
  cache.set(key, resolved);
  return resolved;
}

export type OrbCustomization = {
  /** Multiplies every dot count the mode declares (1 = as tuned). */
  density?: number;
  /** Multiplies every dot radius the mode declares (1 = as tuned). */
  dotScale?: number;
  /** Absolute values for the mode's own settings, applied last. */
  params?: Partial<Record<string, number>>;
};

/**
 * Applies the shared props on top of a resolved orb. `density` and
 * `dotScale` go through the same scaling metadata the size tuning uses, so
 * they mean the same thing on every mode; `params` then overrides individual
 * settings outright.
 */
export function customizeOrb(resolved: ResolvedOrb, { density = 1, dotScale = 1, params }: OrbCustomization): ResolvedOrb {
  const scaling = resolved.def.scaling ?? {};
  let opts = resolved.opts;
  if (density !== 1 && density > 0) opts = scaleCount(opts, density, scaling);
  if (dotScale !== 1 && dotScale > 0) opts = scaleSize(opts, dotScale, scaling);
  if (params) {
    opts = { ...opts };
    for (const [key, value] of Object.entries(params)) if (typeof value === "number" && Number.isFinite(value)) opts[key] = value;
  }
  return opts === resolved.opts ? resolved : { ...resolved, opts };
}
