import { clamp01, defineOrb, latLonSphere, makeProjector, resolutionScale, smoothstep, withDepth } from "../core";

/** pondering → a light source circles the sphere; day side swells, night side fades, the terminator glows */
export const eclipse = defineOrb({
  defaults: { latRings: 17, lonDensity: 44, rBase: 0.6, rDepth: 1.7, rRim: 1.1, inkFar: 0.62, inkSpan: 0.54, rsPow: 0.6, rMin: 0.3 },
  scaling: { pairs: [["latRings", "lonDensity"]], radius: ["rBase", "rDepth", "rRim"] },
  tuning: {
    64: { speed: 1.3, count: 0.42, size: 1.1 },
    20: { speed: 1.5, count: 0.105, size: 1.75 },
  },
  dots(size, time, o) {
    const c = size / 2;
    const at = withDepth(makeProjector(time * 0.2, 0.35, c, c, c * 0.82));
    const rs = resolutionScale(size, o.rsPow);
    const la = time * 0.9;
    const lx = Math.cos(la) * 0.95, ly = 0.31, lz = Math.sin(la) * 0.95; // light direction (unit)
    return latLonSphere(o.latRings, o.lonDensity).map((p) => {
      const [x, y, z, depth] = at(p.x, p.y, p.z);
      const lit = p.x * lx + p.y * ly + p.z * lz;
      const day = smoothstep(clamp01((lit + 0.1) / 0.3));
      const rim = Math.exp(-(lit * lit) / 0.006);
      return {
        x, y, z,
        r: ((o.rBase + o.rDepth * depth) * (0.3 + 0.7 * day) + o.rRim * rim * depth) * rs,
        white: o.inkFar - o.inkSpan * depth * day - 0.15 * rim + 0.2 * (1 - day),
        a: 0.2 + 0.8 * Math.max(day, rim),
      };
    });
  },
});
