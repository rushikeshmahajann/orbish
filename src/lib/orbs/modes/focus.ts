import { defineOrb, latLonSphere, makeProjector, resolutionScale } from "../core";

/**
 * studying → depth of field: dot size follows distance from a focal plane that racks front to back,
 * so one slice of the sphere is crisp while the rest swells into soft, pale bokeh.
 */
export const focus = defineOrb({
  defaults: { latRings: 15, lonDensity: 40, rSharp: 0.7, rBlur: 2.4, rsPow: 0.6, rMin: 0.3 },
  scaling: { pairs: [["latRings", "lonDensity"]], radius: ["rSharp", "rBlur"] },
  tuning: {
    64: { speed: 1, count: 0.42, size: 1.05 },
    20: { speed: 1, count: 0.11, size: 1.7 },
  },
  dots(size, time, o) {
    const c = size / 2;
    const project = makeProjector(time * 0.25, 0.35, c, c, c * 0.8);
    const rs = resolutionScale(size, o.rsPow);
    const plane = 0.85 * Math.sin(time * 0.9);
    return latLonSphere(o.latRings, o.lonDensity).map((p) => {
      const [x, y, z] = project(p.x, p.y, p.z);
      const blur = Math.min(1, Math.abs(z - plane) / 1.2);
      return {
        x, y, z,
        r: (o.rSharp + o.rBlur * blur * blur) * rs,
        white: 0.12 + 0.6 * blur,
        a: 1 / (1 + 7 * blur * blur),
      };
    });
  },
});
