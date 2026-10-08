import { defineOrb, fibonacciSphere, makeProjector, resolutionScale, smoothstep, withDepth, type Dot, type Vec3 } from "../core";

const STAGE = 0.9, SPLIT = 0.45; // seconds per generation; portion spent dividing
const MIN_LEVEL = 3; // 8 dots

const parentCache = new Map<number, number[]>();

/** For the 2^L-dot sphere, which dot of the 2^(L-1)-dot sphere each one buds from (its nearest). */
function parents(level: number): number[] {
  const hit = parentCache.get(level);
  if (hit) return hit;
  const n = 2 ** level, m = n / 2;
  const big = Array.from({ length: m }, (_, i) => fibonacciSphere(i, m));
  const out = Array.from({ length: n }, (_, j) => {
    const p = fibonacciSphere(j, n);
    let best = 0, bestD = -2;
    for (let i = 0; i < m; i++) {
      const d = p[0] * big[i][0] + p[1] * big[i][1] + p[2] * big[i][2];
      if (d > bestD) { bestD = d; best = i; }
    }
    return best;
  });
  parentCache.set(level, out);
  return out;
}

/** multiplying → eight cells divide again and again until the sphere is full, then merge back down */
export const mitosis = defineOrb({
  defaults: { maxLevel: 8, rBase: 0.6, rDepth: 1.7, inkFar: 0.62, inkSpan: 0.54, rsPow: 0.6, rMin: 0.3 },
  scaling: { radius: ["rBase", "rDepth"] },
  tuning: {
    64: { speed: 1, count: 1, size: 1 },
    20: { speed: 1, count: 1, size: 1.7, extra: { maxLevel: 6 } },
  },
  dots(size, time, o) {
    const c = size / 2;
    const at = withDepth(makeProjector(time * 0.3, 0.35, c, c, c * 0.82));
    const rs = resolutionScale(size, o.rsPow);
    const span = o.maxLevel - MIN_LEVEL, cycle = 2 * span * STAGE;
    const t = time % cycle;
    const stage = Math.floor(t / STAGE), within = (t - stage * STAGE) / STAGE;
    const growing = stage < span;
    // level shown and how far the division (or merge) between level and level+1 has gone
    const level = MIN_LEVEL + (growing ? stage : 2 * span - 1 - stage); // 3…7 up, then 7…3 down
    const raw = growing ? Math.max(0, (within - (1 - SPLIT)) / SPLIT) : Math.max(0, 1 - within / SPLIT);
    const b = smoothstep(raw); // 0 = all at the parent level, 1 = children fully apart
    const n = 2 ** (level + 1), par = parents(level + 1);
    const maxN = 2 ** o.maxLevel;
    const sizeMul = (maxN / (n / (1 + b))) ** 0.33; // fewer cells → fatter cells
    const dots: Dot[] = [];
    for (let j = 0; j < n; j++) {
      const child = fibonacciSphere(j, n), parent = fibonacciSphere(par[j], n / 2);
      const p: Vec3 = [parent[0] + (child[0] - parent[0]) * b, parent[1] + (child[1] - parent[1]) * b, parent[2] + (child[2] - parent[2]) * b];
      const len = Math.hypot(...p);
      const [x, y, z, depth] = at(p[0] / len, p[1] / len, p[2] / len);
      // siblings overlap at b=0: pinch radius so two half-born cells read as one
      const pinch = 1 - 0.3 * (1 - b);
      dots.push({ x, y, z, r: (o.rBase + o.rDepth * depth) * sizeMul * pinch * rs, white: o.inkFar - o.inkSpan * depth, a: 0.7 + 0.3 * b });
    }
    return dots;
  },
});
