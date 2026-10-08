import { defineOrb, makeProjector, resolutionScale, smoothstep, withDepth, type Dot, type Vec3 } from "../core";

// print bottom → top, hold, dissolve, pause
const PRINT = 2.6, HOLD = 0.6, FADE = 0.7, REST = 0.3, CYCLE = PRINT + HOLD + FADE + REST;
const SHELL = 0.9;

const latticeCache = new Map<number, Vec3[]>();

/** Grid points that lie within half a cell of the sphere's surface: a voxelised shell. */
function lattice(grid: number): Vec3[] {
  const hit = latticeCache.get(grid);
  if (hit) return hit;
  const step = 2 / (grid - 1), out: Vec3[] = [];
  for (let i = 0; i < grid; i++)
    for (let j = 0; j < grid; j++)
      for (let k = 0; k < grid; k++) {
        const p: Vec3 = [-1 + i * step, -1 + j * step, -1 + k * step];
        if (Math.abs(Math.hypot(...p) - SHELL) < step * 0.55) out.push(p);
      }
  latticeCache.set(grid, out);
  return out;
}

/** printing → a voxel sphere is 3D-printed layer by layer while a print head circles the current layer */
export const voxel = defineOrb({
  defaults: { grid: 11, rBase: 0.7, rDepth: 1.6, rFresh: 1, rHead: 1.6, inkFar: 0.62, inkSpan: 0.54, rsPow: 0.6, rMin: 0.3 },
  scaling: { radius: ["rBase", "rDepth", "rFresh", "rHead"] },
  tuning: {
    64: { speed: 1, count: 1, size: 1 },
    20: { speed: 1, count: 1, size: 1.6, extra: { grid: 7 } },
  },
  dots(size, time, o) {
    const c = size / 2;
    const project = makeProjector(time * 0.35, 0.45, c, c, c * 0.76);
    const at = withDepth(project, SHELL);
    const rs = resolutionScale(size, o.rsPow);
    const t = time % CYCLE;
    const step = 2 / (o.grid - 1);
    const level = -SHELL - step + (2 * SHELL + 2 * step) * Math.min(1, t / PRINT);
    const fade = t < PRINT + HOLD ? 1 : 1 - smoothstep(Math.min(1, (t - PRINT - HOLD) / FADE));
    const dots: Dot[] = [];
    for (const p of lattice(o.grid)) {
      const [x, y, z, depth] = at(...p);
      if (p[1] > level) {
        dots.push({ x, y, z, r: 0.5 * rs, white: 0.8, a: 0.08 }); // not printed yet
        continue;
      }
      const fresh = Math.exp(-(((level - p[1]) / (step * 1.2)) ** 2)); // newest layer still glowing
      dots.push({
        x, y, z,
        r: (o.rBase + o.rDepth * depth + o.rFresh * fresh) * rs,
        white: o.inkFar - o.inkSpan * depth - 0.2 * fresh,
        a: fade,
      });
    }
    if (t < PRINT) {
      const rad = Math.sqrt(Math.max(0, SHELL * SHELL - level * level));
      for (let j = 0; j < 5; j++) {
        const a = time * 9 - j * 0.25;
        const [x, y, z, depth] = at(Math.cos(a) * rad, level + step * 0.3, Math.sin(a) * rad);
        dots.push({ x, y, z: z + 0.5, r: (o.rHead * (1 - j * 0.18) + depth) * rs, white: 0.1 + j * 0.1, a: 1 - j * 0.18 });
      }
    }
    return dots;
  },
});
