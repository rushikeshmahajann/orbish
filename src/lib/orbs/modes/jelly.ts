import { defineOrb, latLonSphere, makeProjector, resolutionScale } from "../core";

/**
 * wobbling → every dot runs on its own slightly delayed clock: the base turns first and the top
 * follows late, so the sphere shears and sways like jelly each time it swings back.
 */
export const jelly = defineOrb({
  defaults: { latRings: 15, lonDensity: 40, lag: 0.45, swing: 1.1, stripes: 4, rBase: 0.6, rDepth: 1.7, rMark: 0.6, inkFar: 0.62, inkSpan: 0.54, rsPow: 0.6, rMin: 0.3 },
  scaling: { pairs: [["latRings", "lonDensity"]], radius: ["rBase", "rDepth", "rMark"] },
  tuning: {
    64: { speed: 1, count: 0.42, size: 1.05 },
    20: { speed: 1, count: 0.12, size: 1.8, extra: { stripes: 3 } },
  },
  dots(size, time, o) {
    const c = size / 2;
    const rs = resolutionScale(size, o.rsPow);
    const yaw = (t: number) => o.swing * Math.sin(t * 1.4);
    return latLonSphere(o.latRings, o.lonDensity).map((p) => {
      const delay = o.lag * (p.y + 1) * 0.5; // bottom leads, top trails
      const a = yaw(time - delay);
      const cl = Math.hypot(p.x, p.z), lon = p.lon + a;
      const squash = 1 + 0.03 * Math.sin(2.8 * (time - delay)); // a little give
      const [x, y, z] = makeProjector(0, 0.35, c, c, c * 0.8)(cl * Math.cos(lon) * squash, p.y / squash, cl * Math.sin(lon) * squash);
      const depth = (z + 1) / 2;
      const mark = Math.cos(o.stripes * p.lon) > 0.9 ? 1 : 0;
      return {
        x, y, z,
        r: (o.rBase + o.rDepth * depth + o.rMark * mark) * rs,
        white: o.inkFar - o.inkSpan * depth - 0.2 * mark,
        a: mark ? 1 : 0.5 + 0.5 * depth,
      };
    });
  },
});
