import { defineOrb, hash, latLonSphere, makeProjector, resolutionScale, sunflower, withDepth, type Dot } from "../core";

/** settling → a snow globe: a handful of flakes drift down inside a faint glass sphere */
export const snow = defineOrb({
  defaults: { latRings: 13, lonDensity: 34, flakes: 36, mound: 22, rBase: 0.5, rDepth: 1.2, rFlake: 0.9, rsPow: 0.6, rMin: 0.3 },
  scaling: { pairs: [["latRings", "lonDensity"]], linear: ["flakes", "mound"], radius: ["rBase", "rDepth", "rFlake"] },
  tuning: {
    64: { speed: 1, count: 0.55, size: 1.05 },
    20: { speed: 1, count: 0.2, size: 1.8 },
  },
  dots(size, time, o) {
    const c = size / 2;
    const at = withDepth(makeProjector(time * 0.15, 0.3, c, c, c * 0.82));
    const rs = resolutionScale(size, o.rsPow);
    const dots: Dot[] = [];
    for (const p of latLonSphere(o.latRings, o.lonDensity)) {
      const [x, y, z, depth] = at(p.x, p.y, p.z);
      dots.push({ x, y, z, r: (o.rBase + o.rDepth * depth) * rs, white: 0.72 - 0.25 * depth, a: 0.2 + 0.35 * depth });
    }
    for (let i = 0; i < o.flakes; i++) {
      const fall = (hash(i, 1.3) + time * 0.12 * (0.6 + 0.4 * hash(i, 2.1))) % 1;
      const y = 0.8 - fall * 1.55;
      const room = Math.sqrt(Math.max(0, 1 - y * y)) * 0.85; // stay inside the glass
      const rho = Math.sqrt(hash(i, 3.4)) * room, a = hash(i, 4.6) * 2 * Math.PI + time * 0.2 + 0.3 * Math.sin(time + i);
      const [x, py, z, depth] = at(Math.cos(a) * rho, y, Math.sin(a) * rho);
      dots.push({ x, y: py, z, r: (o.rFlake + 0.6 * depth) * rs, white: 0.35 - 0.25 * depth, a: Math.min(1, fall * 6, (1 - fall) * 6) });
    }
    for (let k = 0; k < o.mound; k++) {
      const [dx, dz] = sunflower(k, o.mound);
      const [x, y, z, depth] = at(dx * 0.6, -0.8 - 0.04 * (1 - dx * dx - dz * dz), dz * 0.6);
      dots.push({ x, y, z, r: (o.rFlake + 0.5 * depth) * rs, white: 0.4 - 0.2 * depth });
    }
    return dots;
  },
});
