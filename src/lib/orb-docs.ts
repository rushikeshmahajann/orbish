// What the orb pages say about props. Site-only: none of this ships in the
// registry. The settings table is typed against every orb's public keys, so a
// setting added to a mode fails the build until it is documented here.

import { ORB_MODES, ORB_STATES, customizeOrb, orbParamKeys, resolveOrb, type OrbMode, type OrbParamKey, type OrbState } from "@/lib/orbs";
import { MODE_DESCRIPTIONS } from "./orb-descriptions";

type AnyParamKey = { [M in OrbMode]: OrbParamKey<M> }[OrbMode];

/** One line per setting. Where a name means different things in different orbs, MODE_PARAM_DOCS refines it. */
const PARAM_DOCS: Record<AnyParamKey, string> = {
  amp: "How far the surface swells in and out, as a share of the radius.",
  angle: "How far each petal swings open, in radians.",
  arcDots: "Dots along each arc between two nodes.",
  arm: "Length of each glint's star arms, as a share of the orb's size.",
  azimuths: "Field lines around the axis in each shell.",
  ball: "Radius of the ball.",
  ballR: "Radius of each sphere before they merge.",
  bandMul: "Multiplier on the number of lanes across the ribbon.",
  base: "Resting radius of the sphere between beats.",
  bubbles: "Bubbles rising at once.",
  chance: "Chance, 0 to 1, that any given moment glitches.",
  clusters: "Small spheres that make up the large one.",
  core: "Radius of the inner sphere.",
  coreDensity: "Dots around each ring of the core.",
  coreDots: "Dots in the core the petals reveal.",
  coreRings: "Latitude rings in the core.",
  density: "Dot density of every shell.",
  detune: "How far the spiral angle drifts from the golden angle; higher shows stronger spiral arms.",
  dimBase: "Brightness of dots outside the scan band, 0 to 1.",
  dots: "Dots on the sphere.",
  drops: "Drops landing at once.",
  edgeDots: "Dots along each edge.",
  faceDots: "Dots on each exposed cut face.",
  far: "Farthest the camera pulls back, in radii.",
  fill: "How full each half is with sand, 0 to 1.",
  flakes: "Snowflakes drifting at once.",
  floor: "Height of the floor the ball lands on; -1 is the bottom.",
  flow: "How fast dots stream from source to sink.",
  from: "How far out the sparks start, in planet radii.",
  gap: "Spacing between parts.",
  ghost: "Dots in the faint guide sphere behind the effect.",
  ghostN: "Dots in the faint guide sphere behind the effect.",
  grid: "Voxel grid resolution along each side.",
  half: "Half the cube's side, in sphere radii.",
  height: "Height of the flat map.",
  hop: "Height of each bounce.",
  lag: "How far the top trails the base as it swings.",
  laneDots: "Dots in each ring lane.",
  lanes: "Number of lanes.",
  latRings: "Latitude rings on the sphere.",
  lift: "Height above the surface.",
  lineDots: "Dots along each field line.",
  lonDensity: "Dots around the equator; rings nearer the poles get proportionally fewer.",
  maxLevel: "Deepest subdivision level.",
  mergedR: "Radius of the sphere once the two have merged.",
  miniR: "Radius of each small sphere.",
  moonDots: "Dots on each moon.",
  moonR: "Radius of each moon.",
  moons: "Number of moons.",
  mound: "Dots in the snow mound at the bottom.",
  moveCount: "Turns in each scramble.",
  near: "Closest the camera comes, in radii.",
  nodes: "Number of nodes.",
  offset: "Largest misalignment between the two layers, in radians.",
  orbit: "Orbit radius of the moons.",
  particles: "Number of particles.",
  perCluster: "Dots in each small sphere.",
  perRing: "Dots around the widest ring.",
  petals: "Number of petals.",
  planet: "Radius of the planet.",
  plateDots: "Dots along each row of the plates.",
  pool: "How far the beads slide toward the low point, 0 to 1.",
  rate: "How fast the surface vibrates.",
  reach: "How far the effect reaches.",
  ringDots: "Dots on the gyroscope ring.",
  ringIn: "Inner radius of the rings.",
  ringOut: "Outer radius of the rings.",
  rings: "Latitude rings on the sphere.",
  ripple: "Dots in the splash ripple below.",
  rise: "How fast the contour rings climb.",
  scanMul: "Speed of the scan band sweeping the globe.",
  sea: "Sea level; higher means less land.",
  seamDots: "Dots along the drawn seam.",
  segs: "Dots along each lane.",
  sep: "Distance between the two spheres before they merge.",
  shadowDots: "Dots in the shadow on the floor.",
  shellDots: "Dots in the shock shell each beat sends out.",
  slices: "Number of contour rings.",
  spikeDots: "Dots along each spike.",
  spin: "1 lets the ribbon tumble; 0 holds it in place.",
  spot: "Radius of the great spot, in radians.",
  spotY: "Latitude of the great spot, from -1 (south) to 1 (north).",
  spread: "How far the dots scatter when the swarm bursts.",
  streak: "Ghost copies drawn behind each dot as it speeds up.",
  streaks: "Wind streaks on the globe at once.",
  stream: "Grains in the falling stream.",
  streams: "Sparks rushing in at once.",
  stripes: "Marker stripes around the sphere.",
  surface: "Dots on each surface of the sand.",
  swing: "How far the sphere swings, in radians.",
  swirl: "Strength of the swirl.",
  tempo: "How often each dot flashes.",
  tide: "How far each sphere stretches toward the other.",
  tilt: "Tilt of the planet and its rings, in radians.",
  tracers: "Number of comets.",
  trail: "Dots in each trail.",
  turns: "Times the seam winds around the sphere.",
  twist: "Strength of the twist.",
  waterDots: "Dots along the water line.",
  width: "Width of the flat map.",
  wobMul: "Multiplier on how much the ribbon's edges wave.",
};

/** Settings whose meaning depends on the orb. */
const MODE_PARAM_DOCS: Partial<Record<OrbMode, Partial<Record<AnyParamKey, string>>>> = {
  split: { gap: "How far the two halves part, in radii." },
  trace: { gap: "Time between neighbouring trail dots, in seconds.", lift: "Height of the comet trails above the surface, in radii." },
  network: { lift: "How high the arcs arch above the surface, in radii." },
  mitosis: { maxLevel: "Deepest division: the sphere fills to 2^maxLevel cells." },
  tessellate: { maxLevel: "Finest subdivision shown: 0, 1 or 2." },
  field: { particles: "Particles travelling along each field line.", core: "Radius of the dotted core." },
  gas: { particles: "Particles in the volume." },
  ripple: { reach: "How far each wave travels across the surface, in radians." },
  spikes: { reach: "Length of the longest spike, in radii.", core: "Radius of the sphere the spikes grow from." },
  cage: { core: "Radius of the sphere inside the cage." },
  twist: { twist: "How far the poles wring against each other, in radians." },
  convection: { twist: "How much the dots spiral as they travel from source to sink." },
  swarm: { swirl: "How far each dot swirls around the axis as the swarm bursts." },
  jupiter: { swirl: "How tightly the great spot winds the bands around it." },
};

/** The size the documented defaults are measured at: ThinkingOrb's default. */
export const DOC_SIZE = 96;

export type PropRow = { name: string; type: string; default?: string; description: string };

const fmt = (value: number) => String(Number(value.toFixed(3)));

/** The orb's own settings, with their values at DOC_SIZE. */
export function paramRows(state: OrbState): PropRow[] {
  const mode = ORB_STATES[state].mode;
  const { opts } = customizeOrb(resolveOrb(mode, DOC_SIZE), {});
  const overrides = MODE_PARAM_DOCS[mode] ?? {};
  return orbParamKeys(mode).map((key) => ({
    name: key,
    type: "number",
    default: fmt(opts[key] ?? (ORB_MODES[mode].defaults as Record<string, number>)[key]),
    description: overrides[key as AnyParamKey] ?? PARAM_DOCS[key as AnyParamKey],
  }));
}

/** Props every orb shares. */
export const COMMON_PROPS: PropRow[] = [
  { name: "size", type: "number", default: "96", description: "Width and height in CSS pixels. Small orbs (42px and under) and large ones (over 160px) are retuned automatically." },
  { name: "theme", type: '"dark" | "light" | "auto"', default: '"auto"', description: "Light dots on dark or dark dots on light. Auto reads the nearest data-theme, then the system setting." },
  { name: "color", type: "string", description: "Tints the dots. Any CSS colour, including var(--…) and currentColor. Depth shading still applies." },
  { name: "speed", type: "number", default: "1", description: "Multiplier on the orb's tuned speed." },
  { name: "dotScale", type: "number", default: "1", description: "Multiplies every dot's size." },
  { name: "density", type: "number", default: "1", description: "Multiplies the number of dots. 0.5 halves them, 2 doubles them." },
  { name: "params", type: "object", description: "This orb's own settings, listed below. Absolute values, applied after density and dotScale." },
  { name: "paused", type: "boolean", default: "false", description: "Freeze on the current frame." },
  { name: "…canvas props", type: "HTMLAttributes", description: "className, style, aria-* and the rest pass through to the <canvas>." },
];

/** "Searching…" → "Searching". */
export const orbTitle = (state: OrbState) => ORB_STATES[state].label.replace(/…$/, "");

export const orbDescription = (state: OrbState) => MODE_DESCRIPTIONS[ORB_STATES[state].mode];

/** PascalCase component name, as the registry wrapper exports it. */
export const orbComponent = (state: OrbState) => `${state.replace(/(^|-)([a-z0-9])/g, (_, __, c: string) => c.toUpperCase())}Orb`;
