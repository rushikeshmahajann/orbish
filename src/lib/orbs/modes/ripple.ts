import { defineOrb, hash, latLonSphere, makeProjector, resolutionScale, type Vec3 } from "../core";

const PERIOD = 2.4;

/** Drop `k`'s current impact point (model space) and age 0..1. Each cycle lands somewhere new. */
function drop(time: number, k: number, drops: number): { at: Vec3; age: number } {
  const t = time / PERIOD + k / drops;
  const n = Math.floor(t);
  const lon = hash(n * 7 + k, 1.3) * 2 * Math.PI;
  const y = hash(n * 7 + k, 4.1) * 1.6 - 0.8;
  const r = Math.sqrt(1 - y * y);
  return { at: [r * Math.cos(lon), y, r * Math.sin(lon)], age: t - n };
}

/** recalling → drops land on the sphere and send rings rippling across its surface */
export const ripple = defineOrb({
  defaults: { latRings: 17, lonDensity: 44, drops: 2, reach: 2.4, rBase: 0.6, rDepth: 1.7, rWave: 1.6, inkFar: 0.62, inkSpan: 0.54, rsPow: 0.6, rMin: 0.3 },
  scaling: { pairs: [["latRings", "lonDensity"]], radius: ["rBase", "rDepth", "rWave"] },
  tuning: {
    64: { speed: 1.5, count: 0.42, size: 1.1 },
    20: { speed: 1.7, count: 0.105, size: 1.75 },
  },
  dots(size, time, o) {
    const c = size / 2, R = c * 0.8;
    const project = makeProjector(time * 0.3, 0.42 + 0.06 * Math.sin(time * 0.4), c, c, R);
    const rs = resolutionScale(size, o.rsPow);
    const drops = Array.from({ length: o.drops }, (_, k) => drop(time, k, o.drops));
    return latLonSphere(o.latRings, o.lonDensity).map((p) => {
      let wave = 0;
      for (const d of drops) {
        // geodesic distance from the impact vs. how far the wavefront has travelled
        const dist = Math.acos(Math.max(-1, Math.min(1, p.x * d.at[0] + p.y * d.at[1] + p.z * d.at[2])));
        const front = d.age * o.reach;
        const w = Math.exp(-((dist - front) ** 2) / 0.05) * (1 - d.age) ** 1.5;
        const splash = Math.exp(-(dist * dist) / 0.02) * Math.max(0, 1 - d.age * 5);
        wave = Math.max(wave, w, splash);
      }
      const lift = 1 + 0.07 * wave; // wavefront bulges outward slightly
      const [x, y, z] = project(p.x * lift, p.y * lift, p.z * lift);
      const depth = Math.min(1, (z + 1) / 2);
      return {
        x, y, z,
        r: (o.rBase + o.rDepth * depth + o.rWave * wave * Math.max(0.3, depth)) * rs,
        white: o.inkFar - o.inkSpan * depth - 0.2 * wave,
        a: 0.55 + 0.45 * Math.max(wave, depth),
      };
    });
  },
});
