import { clamp01, defineOrb, fibonacciSphere, hash, makeProjector, resolutionScale, withDepth, type Dot } from "../core";

const RING = 8; // tiny dots that compose one hollow bubble

/** bubbling → hollow rings (each drawn as a circle of tiny dots) rise over the sphere and pop at the top */
export const bubbles = defineOrb({
  defaults: { ghost: 110, bubbles: 34, rRing: 1.6, rsPow: 0.6, rMin: 0.25 },
  scaling: { linear: ["ghost", "bubbles"], radius: ["rRing"] },
  tuning: {
    64: { speed: 1, count: 1, size: 1 },
    20: { speed: 1, count: 0.35, size: 1.5 },
  },
  dots(size, time, o) {
    const c = size / 2;
    const at = withDepth(makeProjector(time * 0.2, 0.35, c, c, c * 0.8), 1.05);
    const rs = resolutionScale(size, o.rsPow);
    const dots: Dot[] = [];
    for (let i = 0; i < o.ghost; i++) {
      const [x, y, z, depth] = at(...fibonacciSphere(i, o.ghost));
      dots.push({ x, y, z, r: (0.45 + 0.5 * depth) * rs, white: 0.78, a: 0.15 + 0.3 * depth });
    }
    for (let i = 0; i < o.bubbles; i++) {
      const u = (hash(i, 1.3) + time * 0.11 * (0.7 + 0.6 * hash(i, 2.4))) % 1;
      const py = -0.92 + 1.84 * u, pr = Math.sqrt(Math.max(0, 1 - py * py)) * 1.03;
      const lon = hash(i, 3.5) * 2 * Math.PI + 0.25 * Math.sin(time + i);
      const [x, y, z, depth] = at(Math.cos(lon) * pr, py, Math.sin(lon) * pr);
      const pop = clamp01((u - 0.9) / 0.1); // bursts over the last stretch
      const radius = o.rRing * (0.7 + 0.6 * hash(i, 4.6)) * (0.6 + 0.6 * depth) * (1 + 2.5 * pop) * rs;
      const a = (0.35 + 0.65 * depth) * (1 - pop) * clamp01(u * 10);
      if (a < 0.03) continue;
      for (let k = 0; k < RING; k++) {
        const ang = (k / RING) * 2 * Math.PI + time * 0.3;
        dots.push({ x: x + Math.cos(ang) * radius, y: y + Math.sin(ang) * radius, z, r: 0.5 * (1 + 0.3 * depth) * rs, white: 0.45 - 0.3 * depth, a });
      }
      dots.push({ x: x - radius * 0.4, y: y - radius * 0.4, z: z + 0.001, r: 0.55 * rs, white: 0.1, a }); // glint
    }
    return dots;
  },
});
