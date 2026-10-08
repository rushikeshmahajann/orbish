import { defineOrb, latLonSphere, makeProjector, resolutionScale } from "../core";

/**
 * reconsidering → the depth cue flips sign: far dots become big, dark and painted on top, so the
 * sphere reads as a hollow bowl spinning the other way, then pops back to solid (depth-inversion illusion).
 */
export const invert = defineOrb({
  defaults: { latRings: 17, lonDensity: 44, rBase: 0.6, rDepth: 1.7, inkFar: 0.62, inkSpan: 0.54, rsPow: 0.6, rMin: 0.3 },
  scaling: { pairs: [["latRings", "lonDensity"]], radius: ["rBase", "rDepth"] },
  tuning: {
    64: { speed: 1, count: 0.42, size: 1.1 },
    20: { speed: 1, count: 0.105, size: 1.75 },
  },
  dots(size, time, o) {
    const c = size / 2;
    const project = makeProjector(time * 0.5, 0.35, c, c, c * 0.82);
    const rs = resolutionScale(size, o.rsPow);
    const s = Math.tanh(3 * Math.cos(time * 0.55)); // +1 convex … −1 concave, with a brief flat moment between
    return latLonSphere(o.latRings, o.lonDensity).map((p) => {
      const [x, y, z] = project(p.x, p.y, p.z);
      const depth = 0.5 + (z / 2) * s;
      return { x, y, z: z * s, r: (o.rBase + o.rDepth * depth) * rs, white: o.inkFar - o.inkSpan * depth };
    });
  },
});
