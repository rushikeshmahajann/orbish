import { clamp01, defineOrb, makeProjector, randomOnSphere, resolutionScale, smoothstep, withDepth, type Dot, type Vec3 } from "../core";

const STEPS = 28;
// scattered → relax into even spacing → hold → scatter again
const RELAX = 2.4, HOLD = 0.9, SCATTER = 0.5, REST = 0.4, CYCLE = RELAX + HOLD + SCATTER + REST;

const cache = new Map<number, Vec3[][]>();

/** Precomputed trajectory: random clumps, then STEPS rounds of mutual repulsion on the sphere surface. */
function trajectory(n: number): Vec3[][] {
  const hit = cache.get(n);
  if (hit) return hit;
  let pts = Array.from({ length: n }, (_, i) => randomOnSphere(i, 3.3));
  const frames = [pts];
  const step = 0.9 / n;
  for (let s = 0; s < STEPS; s++) {
    const next: Vec3[] = pts.map((p, i) => {
      let fx = 0, fy = 0, fz = 0;
      for (let j = 0; j < n; j++) {
        if (j === i) continue;
        const q = pts[j], dx = p[0] - q[0], dy = p[1] - q[1], dz = p[2] - q[2];
        const d2 = dx * dx + dy * dy + dz * dz + 0.002;
        const f = 1 / (d2 * Math.sqrt(d2));
        fx += dx * f; fy += dy * f; fz += dz * f;
      }
      const m = Math.hypot(fx, fy, fz) || 1, cap = Math.min(1, 40 / m); // tame the first violent pushes
      const x = p[0] + fx * step * cap, y = p[1] + fy * step * cap, z = p[2] + fz * step * cap;
      const len = Math.hypot(x, y, z);
      return [x / len, y / len, z / len];
    });
    frames.push(next);
    pts = next;
  }
  cache.set(n, frames);
  return frames;
}

/** organizing → dots start in random clumps and push each other apart until the sphere is evenly covered */
export const relax = defineOrb({
  defaults: { dots: 170, rBase: 0.6, rDepth: 1.7, inkFar: 0.62, inkSpan: 0.54, rsPow: 0.6, rMin: 0.3 },
  scaling: { linear: ["dots"], radius: ["rBase", "rDepth"] },
  tuning: {
    64: { speed: 1, count: 1, size: 1.05 },
    20: { speed: 1, count: 0.3, size: 1.8 },
  },
  dots(size, time, o) {
    const c = size / 2;
    const at = withDepth(makeProjector(time * 0.25, 0.35, c, c, c * 0.82));
    const rs = resolutionScale(size, o.rsPow);
    const t = time % CYCLE;
    // progress through the trajectory: eased forward, quick snap back
    const prog = t < RELAX ? 1 - (1 - t / RELAX) ** 2.2 : t < RELAX + HOLD ? 1 : t < RELAX + HOLD + SCATTER ? 1 - smoothstep((t - RELAX - HOLD) / SCATTER) : 0;
    const frames = trajectory(o.dots);
    const fi = prog * STEPS, k = Math.min(STEPS - 1, Math.floor(fi)), f = fi - k;
    const tension = 1 - clamp01(prog); // clumped dots read heavier
    const dots: Dot[] = [];
    for (let i = 0; i < o.dots; i++) {
      const a = frames[k][i], b = frames[k + 1][i];
      const p = [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f];
      const len = Math.hypot(p[0], p[1], p[2]);
      const [x, y, z, depth] = at(p[0] / len, p[1] / len, p[2] / len);
      dots.push({ x, y, z, r: (o.rBase + o.rDepth * depth) * (1 + 0.25 * tension) * rs, white: o.inkFar - o.inkSpan * depth - 0.1 * tension });
    }
    return dots;
  },
});
