import { defineOrb, latLonSphere, makeProjector, resolutionScale } from "../core";

/** listening → sphere whose latitude rings pulse in and out */
export const wave = defineOrb({
  defaults: { rings: 15, lonDensity: 40, rBase: 0.6, rDepth: 1.7, rsPow: 0.6, rMin: 0.3 },
  scaling: { pairs: [["rings", "lonDensity"]], radius: ["rBase", "rDepth"] },
  tuning: {
    64: { speed: 4.388, count: 0.341, size: 1 },
    20: { speed: 3.998, count: 0.105, size: 1.6 },
  },
  dots(size, time, o) {
    const c = size / 2, R = c * 0.874;
    const project = makeProjector(time * 0.18, 0.38, c, c, 1);
    const rs = resolutionScale(size, o.rsPow);
    return latLonSphere(o.rings, o.lonDensity).map((p) => {
      const f = 0.62 * Math.sin(time * 2.1 - p.ring * 0.52) + 0.38 * Math.sin(time * 1.27 + p.ring * 0.83);
      const rad = R * (0.88 + 0.105 * f);
      const [x, y, z] = project(p.x * rad, p.y * rad, p.z * rad);
      const depth = (z / R + 1) / 2;
      const crest = Math.max(0, f);
      return {
        x, y, z,
        r: (o.rBase + o.rDepth * depth) * (1 + 0.4 * crest) * rs,
        white: 0.66 - 0.56 * depth - 0.1 * crest,
      };
    });
  },
});
