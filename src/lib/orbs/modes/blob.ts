import { defineOrb, latLonSphere, makeProjector, resolutionScale, withDepth } from "../core";

/** Smooth pseudo-noise over the sphere surface, roughly -1..1, drifting with time. */
function flow(x: number, y: number, z: number, t: number) {
  const a = Math.sin(3.1 * x + 1.3 * t) * Math.sin(2.7 * y - 1.1 * t) * Math.sin(3.3 * z + 0.9 * t) * 1.6;
  const b = 0.45 * Math.sin(5.2 * x + 2.1 * y - 1.7 * t) + 0.35 * Math.sin(4.1 * z - 1.9 * y + 1.4 * t);
  return (a + b) * 0.5;
}

/** imagining → a liquid sphere whose surface bulges and rolls like a slow lava lamp */
export const blob = defineOrb({
  defaults: { latRings: 17, lonDensity: 44, amp: 0.16, rBase: 0.6, rDepth: 1.7, inkFar: 0.62, inkSpan: 0.54, rsPow: 0.6, rMin: 0.3 },
  scaling: { pairs: [["latRings", "lonDensity"]], radius: ["rBase", "rDepth"] },
  tuning: {
    64: { speed: 1.2, count: 0.42, size: 1.1 },
    20: { speed: 1.4, count: 0.105, size: 1.75, extra: { amp: 0.12 } },
  },
  dots(size, time, o) {
    const c = size / 2, maxMag = 1 + o.amp;
    const at = withDepth(makeProjector(time * 0.3, 0.4, c, c, (c * 0.84) / maxMag), maxMag);
    const rs = resolutionScale(size, o.rsPow);
    return latLonSphere(o.latRings, o.lonDensity).map((p) => {
      const n = flow(p.x, p.y, p.z, time);
      const rad = 1 + o.amp * n;
      const [x, y, z, depth] = at(p.x * rad, p.y * rad, p.z * rad);
      const crest = Math.max(0, n);
      return {
        x, y, z,
        r: (o.rBase + o.rDepth * depth) * (1 + 0.3 * crest) * rs,
        white: o.inkFar - o.inkSpan * depth - 0.14 * crest,
        a: 0.6 + 0.4 * depth,
      };
    });
  },
});
