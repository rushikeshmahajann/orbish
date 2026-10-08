import { defineOrb, fibonacciSphere, makeProjector, resolutionScale, smoothstep, type Dot } from "../core";

const HOLD = 1.1, MORPH = 1.0, HALF = HOLD + MORPH;

/** building → sphere dots flow into a cube (edges light up), then relax back into a sphere */
export const cube = defineOrb({
  defaults: { dots: 420, half: 0.6, rBase: 0.6, rDepth: 1.7, rEdge: 0.5, rsPow: 0.6, rMin: 0.3 },
  scaling: { linear: ["dots"], radius: ["rBase", "rDepth", "rEdge"] },
  tuning: {
    64: { speed: 1.5, count: 0.45, size: 1.05 },
    20: { speed: 1.7, count: 0.12, size: 1.85 },
  },
  dots(size, time, o) {
    const c = size / 2, R = c * 0.82;
    // sphere → cube → sphere, holding at each end
    const t = time % (2 * HALF);
    const leg = t < HALF ? t : t - HALF;
    const f = leg < HOLD ? 0 : smoothstep((leg - HOLD) / MORPH);
    const b = t < HALF ? f : 1 - f;
    const project = makeProjector(time * 0.45, 0.5 + 0.12 * Math.sin(time * 0.6), c, c, R);
    const rs = resolutionScale(size, o.rsPow);
    const maxMag = Math.max(1, o.half * Math.sqrt(3));
    const dots: Dot[] = [];
    for (let i = 0; i < o.dots; i++) {
      const [sx, sy, sz] = fibonacciSphere(i, o.dots);
      const ax = Math.abs(sx), ay = Math.abs(sy), az = Math.abs(sz);
      const big = Math.max(ax, ay, az);
      const k = o.half / big; // push the point out radially onto the cube surface
      const s = 1 + (k - 1) * b;
      const [x, y, z] = project(sx * s, sy * s, sz * s);
      const depth = Math.max(0, Math.min(1, (z / maxMag + 1) / 2));
      // near an edge, the second-largest coordinate is almost as big as the largest
      const second = ax + ay + az - big - Math.min(ax, ay, az);
      const edge = b * smoothstep(Math.max(0, (second / big - 0.82) / 0.18));
      dots.push({
        x, y, z,
        r: (o.rBase + o.rDepth * depth + o.rEdge * edge) * rs,
        white: 0.62 - 0.54 * depth - 0.15 * edge,
        a: 0.6 + 0.4 * Math.max(depth, edge),
      });
    }
    return dots;
  },
});
