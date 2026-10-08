import { defineOrb, latLonSphere, makeProjector, resolutionScale, rotateY, type Vec3 } from "../core";

/** Low-frequency "elevation" over the sphere; positive is land. */
function elevation([x, y, z]: Vec3, t: number) {
  const a = Math.sin(2.1 * x + 0.3 * t) * Math.cos(1.7 * y) + Math.sin(1.9 * z - 0.2 * t) * Math.cos(2.3 * x + 0.1 * t);
  const b = 0.5 * Math.sin(3.7 * y + 1.3 * z + 0.25 * t) * Math.cos(3.1 * x);
  return (a + b) * 0.6;
}

/** surveying → a globe with continents: coasts picked out, land dark, ocean faint, plates drifting over ages */
export const terrain = defineOrb({
  defaults: { latRings: 19, lonDensity: 48, sea: 0.12, rBase: 0.6, rDepth: 1.7, rLand: 0.5, rsPow: 0.6, rMin: 0.3 },
  scaling: { pairs: [["latRings", "lonDensity"]], radius: ["rBase", "rDepth", "rLand"] },
  tuning: {
    64: { speed: 1, count: 0.5, size: 1.05 },
    20: { speed: 1, count: 0.13, size: 1.8 },
  },
  dots(size, time, o) {
    const c = size / 2;
    const project = makeProjector(time * 0.3, 0.35, c, c, c * 0.82);
    const rs = resolutionScale(size, o.rsPow);
    return latLonSphere(o.latRings, o.lonDensity).map((p) => {
      const h = elevation(rotateY([p.x, p.y, p.z], time * 0.05), time); // continents drift as well as morph
      const [x, y, z] = project(p.x, p.y, p.z);
      const depth = (z + 1) / 2;
      const land = Math.max(0, Math.min(1, (h - o.sea) / 0.1 + 0.5));
      const coast = Math.exp(-(((h - o.sea) / 0.05) ** 2));
      return {
        x, y, z,
        r: (o.rBase + o.rDepth * depth + o.rLand * land + 0.4 * coast) * rs,
        white: 0.75 - 0.55 * depth * (0.4 + 0.6 * land) - 0.2 * land - 0.15 * coast,
        a: 0.35 + 0.65 * Math.max(land, coast, depth * 0.6),
      };
    });
  },
});
