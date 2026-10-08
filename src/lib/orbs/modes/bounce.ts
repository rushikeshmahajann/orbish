import { clamp01, defineOrb, fibonacciSphere, makeProjector, resolutionScale, rotateY, type Dot } from "../core";

const PERIOD = 1.1;

/** bouncing → a dotted ball hops, squashes on landing and stretches its shadow across the floor */
export const bounce = defineOrb({
  defaults: { dots: 220, ball: 0.42, hop: 0.95, floor: -0.85, shadowDots: 22, rBase: 0.6, rDepth: 1.6, inkFar: 0.62, inkSpan: 0.54, rsPow: 0.6, rMin: 0.3 },
  scaling: { linear: ["dots", "shadowDots"], radius: ["rBase", "rDepth"] },
  tuning: {
    64: { speed: 1, count: 0.75, size: 1 },
    20: { speed: 1, count: 0.25, size: 1.8 },
  },
  dots(size, time, o) {
    const c = size / 2;
    const project = makeProjector(0.4, 0.22, c, c, c * 0.84);
    const rs = resolutionScale(size, o.rsPow);
    const u = (time % PERIOD) / PERIOD;
    const h = 4 * u * (1 - u); // parabolic hop, 0 at contact
    const squash = clamp01(1 - h / 0.14);
    const sy = 1 - 0.28 * squash, sxz = 1 + 0.16 * squash;
    const cy = o.floor + o.ball * sy + h * o.hop;
    const zc = project(0, cy, 0)[2];
    const dots: Dot[] = [];
    for (let i = 0; i < o.dots; i++) {
      const g = rotateY(fibonacciSphere(i, o.dots), time * 1.6);
      const [x, y, z] = project(g[0] * o.ball * sxz, cy + g[1] * o.ball * sy, g[2] * o.ball * sxz);
      const depth = clamp01((z - zc) / (2 * o.ball) + 0.5);
      dots.push({ x, y, z, r: (o.rBase + o.rDepth * depth) * rs, white: o.inkFar - o.inkSpan * depth - 0.1 * squash });
    }
    for (let l = 1; l <= 3; l++) {
      // contact shadow: tight and dark on landing, wide and faint at the top of the hop
      const rad = (0.12 + 0.13 * l) * (1 + 0.6 * h) * sxz;
      const count = Math.max(4, Math.round((o.shadowDots * l) / 3));
      for (let k = 0; k < count; k++) {
        const a = (k / count) * 2 * Math.PI;
        const [x, y, z] = project(Math.cos(a) * rad, o.floor, Math.sin(a) * rad);
        dots.push({ x, y, z: z - 5, r: 0.7 * rs, white: 0.5, a: 0.5 * (1 - 0.65 * h) * (1 - l * 0.22) });
      }
    }
    return dots;
  },
});
