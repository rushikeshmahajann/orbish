import { defineOrb, latLonSphere, makeProjector, resolutionScale, withDepth, type Dot } from "../core";

const LIFT = 0.55, R = 0.5;

/** reflecting → a striped sphere hovers over still water; its reflection wavers in slow ripples beneath */
export const mirror = defineOrb({
  defaults: { latRings: 15, lonDensity: 40, stripes: 6, waterDots: 26, rBase: 0.6, rDepth: 1.6, rMark: 0.6, inkFar: 0.62, inkSpan: 0.54, rsPow: 0.6, rMin: 0.3 },
  scaling: { pairs: [["latRings", "lonDensity"]], linear: ["waterDots"], radius: ["rBase", "rDepth", "rMark"] },
  tuning: {
    64: { speed: 1, count: 0.42, size: 1.05 },
    20: { speed: 1, count: 0.12, size: 1.75, extra: { stripes: 4 } },
  },
  dots(size, time, o) {
    const c = size / 2, S = c * 0.8;
    const project = makeProjector(0.3, 0.2, c, c, S);
    const at = withDepth(project, 1.05);
    const rs = resolutionScale(size, o.rsPow);
    const spin = time * 0.6;
    const dots: Dot[] = [];
    for (const p of latLonSphere(o.latRings, o.lonDensity)) {
      const cl = Math.hypot(p.x, p.z), lon = p.lon + spin;
      const wx = cl * Math.cos(lon) * R, wy = LIFT + p.y * R, wz = cl * Math.sin(lon) * R;
      const mark = Math.cos(o.stripes * p.lon) > 0.85 ? 1 : 0;
      const [x, y, z, depth] = at(wx, wy, wz);
      dots.push({ x, y, z, r: (o.rBase + o.rDepth * depth + o.rMark * mark) * rs, white: o.inkFar - o.inkSpan * depth - 0.2 * mark, a: mark ? 1 : 0.5 + 0.5 * depth });
      // mirrored copy: flipped through the water plane, nudged sideways by ripples, fading with depth
      const ripple = 0.03 * Math.sin(wy * 16 - time * 3) + 0.015 * Math.sin(wx * 11 + time * 2.2);
      const [mx, my, mz, md] = at(wx + ripple, -wy, wz);
      dots.push({ x: mx, y: my, z: mz - 1, r: (o.rBase * 0.8 + o.rDepth * 0.8 * md + o.rMark * 0.7 * mark) * rs, white: o.inkFar + 0.15 - o.inkSpan * 0.7 * md - 0.1 * mark, a: (0.12 + 0.3 * md) * (1.3 - wy) });
    }
    for (let k = 0; k < o.waterDots; k++) {
      const wx = -1.1 + (2.2 * k) / (o.waterDots - 1);
      const [x, y, z] = project(wx, 0.004 * Math.sin(wx * 9 + time * 2.5), 0);
      dots.push({ x, y, z: z - 2, r: 0.5 * rs, white: 0.7, a: 0.4 });
    }
    return dots;
  },
});
