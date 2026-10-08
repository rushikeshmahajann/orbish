import { defineOrb, latLonSphere, makeProjector, resolutionScale, rotateY } from "../core";

/** refining → striped meridians wring into spirals as the top and bottom twist against each other */
export const twist = defineOrb({
  defaults: { latRings: 16, lonDensity: 42, twist: 2.2, stripes: 6, rBase: 0.6, rDepth: 1.7, rMark: 0.7, inkFar: 0.62, inkSpan: 0.54, rsPow: 0.6, rMin: 0.3 },
  scaling: { pairs: [["latRings", "lonDensity"]], radius: ["rBase", "rDepth", "rMark"] },
  tuning: {
    64: { speed: 1.3, count: 0.45, size: 1.05 },
    20: { speed: 1.5, count: 0.13, size: 1.8, extra: { stripes: 4 } },
  },
  dots(size, time, o) {
    const c = size / 2;
    const project = makeProjector(time * 0.2, 0.38, c, c, c * 0.82);
    const rs = resolutionScale(size, o.rsPow);
    const amount = o.twist * Math.sin(time * 1.2);
    return latLonSphere(o.latRings, o.lonDensity).map((p) => {
      const [x, y, z] = project(...rotateY([p.x, p.y, p.z], amount * p.y)); // twist grows toward the poles
      const depth = (z + 1) / 2;
      const mark = Math.cos(o.stripes * p.lon) > 0.88 ? 1 : 0;
      return {
        x, y, z,
        r: (o.rBase + o.rDepth * depth + o.rMark * mark) * rs,
        white: o.inkFar - o.inkSpan * depth - 0.22 * mark + 0.08 * (1 - mark),
        a: mark ? 1 : 0.45 + 0.55 * depth,
      };
    });
  },
});
