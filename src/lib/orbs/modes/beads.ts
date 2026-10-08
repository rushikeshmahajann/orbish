import { defineOrb, fibonacciSphere, makeProjector, resolutionScale, slerp, withDepth, type Dot, type Vec3 } from "../core";

/** weighing → beads on the surface slide downhill and pool at the bottom as the sphere tips this way and that */
export const beads = defineOrb({
  defaults: { dots: 220, ghost: 120, pool: 0.62, rBase: 0.6, rDepth: 1.7, inkFar: 0.62, inkSpan: 0.54, rsPow: 0.6, rMin: 0.3 },
  scaling: { linear: ["dots", "ghost"], radius: ["rBase", "rDepth"] },
  tuning: {
    64: { speed: 1, count: 0.8, size: 1.05 },
    20: { speed: 1, count: 0.25, size: 1.8 },
  },
  dots(size, time, o) {
    const c = size / 2;
    const at = withDepth(makeProjector(0, 0.35, c, c, c * 0.82));
    const rs = resolutionScale(size, o.rsPow);
    // "down" wanders around the lower half of the sphere; the pile chases it
    const da = time * 0.6, dy = -0.55 - 0.4 * Math.sin(time * 0.37);
    const dr = Math.sqrt(1 - dy * dy);
    const D: Vec3 = [Math.cos(da) * dr, dy, Math.sin(da) * dr];
    const k = o.pool * (0.55 + 0.45 * Math.sin(time * 0.9)); // beads loosen and gather again
    const dots: Dot[] = [];
    for (let i = 0; i < o.ghost; i++) {
      const [x, y, z, depth] = at(...fibonacciSphere(i, o.ghost));
      dots.push({ x, y, z, r: (0.45 + 0.5 * depth) * rs, white: 0.78, a: 0.15 + 0.3 * depth });
    }
    for (let i = 0; i < o.dots; i++) {
      const p = fibonacciSphere(i, o.dots);
      const toward = (1 - (p[0] * D[0] + p[1] * D[1] + p[2] * D[2])) / 2; // 0 at the bottom, 1 at the top
      const q = slerp(p, D, k * toward ** 0.6); // far beads slide furthest
      const [x, y, z, depth] = at(q[0] * 1.02, q[1] * 1.02, q[2] * 1.02);
      const crowd = 1 - toward * (1 - k);
      dots.push({ x, y, z, r: (o.rBase + o.rDepth * depth) * (0.85 + 0.3 * crowd) * rs, white: o.inkFar - o.inkSpan * depth - 0.1 * crowd });
    }
    return dots;
  },
});
