import { defineOrb, latLonSphere, makeProjector, resolutionScale, rotateX, rotateY, withDepth, type Dot } from "../core";

/**
 * resonating → two identical dense spheres sit almost on top of each other; a tiny misalignment
 * between them throws shimmering interference (moiré) fringes across the surface.
 */
export const moire = defineOrb({
  defaults: { latRings: 22, lonDensity: 56, offset: 0.06, rBase: 0.35, rDepth: 0.9, inkFar: 0.55, inkSpan: 0.45, rsPow: 0.6, rMin: 0.25 },
  scaling: { pairs: [["latRings", "lonDensity"]], radius: ["rBase", "rDepth"] },
  tuning: {
    64: { speed: 1, count: 0.6, size: 1 },
    20: { speed: 1, count: 0.2, size: 1.6, extra: { offset: 0.1 } },
  },
  dots(size, time, o) {
    const c = size / 2;
    const at = withDepth(makeProjector(time * 0.15, 0.35, c, c, c * 0.84));
    const rs = resolutionScale(size, o.rsPow);
    const delta = o.offset * Math.sin(time * 0.6);
    const dots: Dot[] = [];
    for (const layer of [0, 1]) {
      for (const p of latLonSphere(o.latRings, o.lonDensity)) {
        const q = layer ? rotateX(rotateY([p.x, p.y, p.z], delta), delta * 0.6) : ([p.x, p.y, p.z] as const);
        const [x, y, z, depth] = at(q[0], q[1], q[2]);
        dots.push({ x, y, z, r: (o.rBase + o.rDepth * depth) * rs, white: o.inkFar - o.inkSpan * depth, a: 0.8 });
      }
    }
    return dots;
  },
});
