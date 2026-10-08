import { defineOrb, latLonSphere, makeProjector, resolutionScale, withDepth, type Dot } from "../core";

/** compressing → two plates press the sphere into a pancake and let it spring back; its volume never changes, so the rim bulges */
export const squeeze = defineOrb({
  defaults: { latRings: 15, lonDensity: 40, plateDots: 13, rBase: 0.6, rDepth: 1.6, inkFar: 0.62, inkSpan: 0.54, rsPow: 0.6, rMin: 0.3 },
  scaling: { pairs: [["latRings", "lonDensity"]], linear: ["plateDots"], radius: ["rBase", "rDepth"] },
  tuning: {
    64: { speed: 1, count: 0.42, size: 1.05 },
    20: { speed: 1, count: 0.12, size: 1.75 },
  },
  dots(size, time, o) {
    const c = size / 2, S = (c * 0.84) / 1.52;
    const project = makeProjector(time * 0.25, 0.3, c, c, S);
    const at = withDepth(project, 1.5);
    const rs = resolutionScale(size, o.rsPow);
    const h = 0.75 + 0.3 * Math.cos(time * 1.3); // half-height between the plates
    const sxz = 1 / Math.sqrt(h); // keep the volume constant
    const stress = (1.05 - h) / 0.6;
    const dots: Dot[] = [];
    for (const p of latLonSphere(o.latRings, o.lonDensity)) {
      const [x, y, z, depth] = at(p.x * sxz, p.y * h, p.z * sxz);
      const rim = 1 - Math.abs(p.y);
      dots.push({ x, y, z, r: (o.rBase + o.rDepth * depth) * (1 + 0.25 * stress * rim) * rs, white: o.inkFar - o.inkSpan * depth - 0.15 * stress * rim });
    }
    for (const side of [-1, 1])
      for (const pz of [-0.5, 0, 0.5])
        for (let k = 0; k < o.plateDots; k++) {
          const px = -1.5 + (3 * k) / (o.plateDots - 1);
          const [x, y, z, depth] = at(px, side * h * 1.04, pz);
          dots.push({ x, y, z: z + (side > 0 ? 0.01 : -0.01), r: (0.5 + 0.4 * depth) * rs, white: 0.6 - 0.2 * depth, a: 0.35 + 0.35 * depth });
        }
    return dots;
  },
});
