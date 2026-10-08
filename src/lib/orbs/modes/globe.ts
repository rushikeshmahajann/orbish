import { angleDelta, defineOrb, latLonSphere, makeProjector, resolutionScale } from "../core";

/** searching → dotted globe with a sweeping scan band */
export const globe = defineOrb({
  defaults: { latRings: 17, lonDensity: 44, rBase: 0.6, rDepth: 1.7, rBoost: 1, inkFar: 0.62, inkSpan: 0.54, scanMul: 1, dimBase: 1, rsPow: 0.6, rMin: 0.3 },
  scaling: { pairs: [["latRings", "lonDensity"]], radius: ["rBase", "rDepth"] },
  tuning: {
    64: { speed: 2.015, count: 0.42, size: 1.15, extra: { scanMul: 4.08, dimBase: 0.45 } },
    20: { speed: 2.665, count: 0.105, size: 1.75, extra: { scanMul: 4.335, dimBase: 0.45 } },
  },
  dots(size, time, o) {
    const c = size / 2, R = c * 0.82;
    const project = makeProjector(time * 0.5, 0.4 + 0.06 * Math.sin(time * 0.35), c, c, R);
    const scanAngle = time * (0.5 + 1.2 * o.scanMul);
    const rs = resolutionScale(size, o.rsPow);
    return latLonSphere(o.latRings, o.lonDensity).map((p) => {
      const [x, y, z] = project(p.x, p.y, p.z);
      const depth = (z + 1) / 2;
      const d = angleDelta(p.lon + time * 0.5, scanAngle);
      const scan = Math.exp(-(d * d) / 0.18) * Math.max(0, z);
      return {
        x, y, z,
        r: (o.rBase + o.rDepth * depth + o.rBoost * scan) * rs,
        white: o.inkFar - o.inkSpan * depth,
        a: o.dimBase + (1 - o.dimBase) * Math.min(1, scan),
      };
    });
  },
});
