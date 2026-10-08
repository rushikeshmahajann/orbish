import { defineOrb, hash, latLonSphere, makeProjector, resolutionScale, type Dot } from "../core";

/** sensing → magnetic field lines loop out of a dotted core, particles stream pole to pole */
export const field = defineOrb({
  defaults: {
    coreRings: 9, coreDensity: 22, core: 0.3, azimuths: 6, lineDots: 18, particles: 2,
    rBase: 0.55, rDepth: 1.5, rPart: 1.3, rsPow: 0.6, rMin: 0.3,
  },
  scaling: { pairs: [["coreRings", "coreDensity"]], linear: ["lineDots"], radius: ["rBase", "rDepth", "rPart"] },
  tuning: {
    64: { speed: 1.5, count: 0.7, size: 1 },
    20: { speed: 1.7, count: 0.3, size: 1.8, extra: { azimuths: 4 } },
  },
  dots(size, time, o) {
    const c = size / 2, R = c * 0.86;
    const project = makeProjector(time * 0.3, 0.32 + 0.08 * Math.sin(time * 0.5), c, c, R);
    const rs = resolutionScale(size, o.rsPow);
    const dots: Dot[] = [];
    const push = (x0: number, y0: number, z0: number, r: number, white: number, a: number) => {
      const [x, y, z] = project(x0, y0, z0);
      const depth = (z + 1) / 2;
      dots.push({ x, y, z, r: (r + o.rDepth * depth) * rs, white: white - 0.45 * depth, a: a * (0.5 + 0.5 * depth) });
    };

    // core: a small dotted sphere
    for (const p of latLonSphere(o.coreRings, o.coreDensity)) push(p.x * o.core, p.y * o.core, p.z * o.core, o.rBase * 0.7, 0.55, 1);

    // dipole field line r = L·sin²θ, clipped where it re-enters the core
    const shells = [0.62, 0.82, 1];
    shells.forEach((L, si) => {
      const th0 = Math.asin(Math.sqrt(o.core / L));
      for (let k = 0; k < o.azimuths; k++) {
        const phi = ((k + si * 0.5) / o.azimuths) * 2 * Math.PI;
        const cp = Math.cos(phi), sp = Math.sin(phi);
        const at = (s: number): [number, number, number] => {
          const th = th0 + s * (Math.PI - 2 * th0), st = Math.sin(th), r = L * st * st;
          return [r * st * cp, r * Math.cos(th), r * st * sp];
        };
        for (let d = 1; d < o.lineDots; d++) push(...at(d / o.lineDots), o.rBase * 0.5, 0.78, 0.4);
        for (let p = 0; p < o.particles; p++) {
          const s = (time * (0.28 + 0.12 * (1 - si / 2)) + p / o.particles + hash(k * 3 + si, 1.9)) % 1;
          const swell = Math.sin(Math.PI * s); // brightest out at the equator, faded near the core
          push(...at(s), o.rPart * (0.6 + 0.4 * swell), 0.32, 0.4 + 0.6 * swell);
        }
      }
    });
    return dots;
  },
});
