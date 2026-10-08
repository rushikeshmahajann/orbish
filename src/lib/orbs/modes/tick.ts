import { defineOrb, latLonSphere, makeProjector, resolutionScale } from "../core";

const TICK = 0.5, MOVE = 0.35, STEPS = 12;

/** easeOutElastic: overshoots and settles, like a second hand */
const elastic = (f: number) => (f >= 1 ? 1 : f <= 0 ? 0 : 2 ** (-10 * f) * Math.sin((f * 10 - 0.75) * ((2 * Math.PI) / 3)) + 1);

/** ticking → time moves in discrete steps: the sphere clicks round a twelfth at a time, springing past and settling */
export const tick = defineOrb({
  defaults: { latRings: 15, lonDensity: 40, rBase: 0.6, rDepth: 1.7, rMark: 1.3, inkFar: 0.62, inkSpan: 0.54, rsPow: 0.6, rMin: 0.3 },
  scaling: { pairs: [["latRings", "lonDensity"]], radius: ["rBase", "rDepth", "rMark"] },
  tuning: {
    64: { speed: 1, count: 0.42, size: 1.05 },
    20: { speed: 1, count: 0.11, size: 1.8 },
  },
  dots(size, time, o) {
    const c = size / 2;
    const n = Math.floor(time / TICK), f = (time - n * TICK) / (TICK * MOVE);
    const angle = ((n + elastic(f)) * 2 * Math.PI) / STEPS;
    const project = makeProjector(-angle, 0.35, c, c, c * 0.82);
    const rs = resolutionScale(size, o.rsPow);
    const knock = Math.exp(-f * 4) * 0.12; // tiny jolt on every tick
    return latLonSphere(o.latRings, o.lonDensity).map((p) => {
      const [x, y, z] = project(p.x, p.y, p.z);
      const depth = (z + 1) / 2;
      const mark = p.lon === 0;
      return {
        x, y, z,
        r: (o.rBase + o.rDepth * depth + (mark ? o.rMark : 0)) * (1 + knock) * rs,
        white: o.inkFar - o.inkSpan * depth - (mark ? 0.3 : 0),
        a: mark ? 1 : 0.55 + 0.45 * depth,
      };
    });
  },
});
