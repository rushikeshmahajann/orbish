import { defineOrb, latLonSphere, makeProjector, resolutionScale, smoothstep } from "../core";

// open → lids close → closed → lids open
const OPEN = 2.2, CLOSE = 0.14, SHUT = 0.08, REOPEN = 0.22, CYCLE = OPEN + CLOSE + SHUT + REOPEN;

function lid(time: number) {
  const t = time % CYCLE;
  if (t < OPEN) return 0;
  if (t < OPEN + CLOSE) return smoothstep((t - OPEN) / CLOSE);
  if (t < OPEN + CLOSE + SHUT) return 1;
  return 1 - smoothstep((t - OPEN - CLOSE - SHUT) / REOPEN);
}

/** idling → the sphere glances side to side and blinks, lids meeting at the equator */
export const blink = defineOrb({
  defaults: { latRings: 17, lonDensity: 44, rBase: 0.6, rDepth: 1.7, inkFar: 0.62, inkSpan: 0.54, rsPow: 0.6, rMin: 0.3 },
  scaling: { pairs: [["latRings", "lonDensity"]], radius: ["rBase", "rDepth"] },
  tuning: {
    64: { speed: 1, count: 0.42, size: 1.1 },
    20: { speed: 1, count: 0.105, size: 1.75 },
  },
  dots(size, time, o) {
    const c = size / 2;
    const project = makeProjector(0.6 * Math.sin(time * 0.5), 0.3 + 0.08 * Math.sin(time * 0.31), c, c, c * 0.82);
    const rs = resolutionScale(size, o.rsPow);
    const open = Math.max(0.07, 1 - lid(time)); // a thin line stays at full close
    return latLonSphere(o.latRings, o.lonDensity).map((p) => {
      const [x, y, z] = project(p.x, p.y, p.z);
      const depth = (z + 1) / 2;
      const vis = smoothstep(Math.max(0, Math.min(1, (open - Math.abs(p.y)) / 0.08 + 0.5)));
      return { x, y, z, r: (o.rBase + o.rDepth * depth) * rs, white: o.inkFar - o.inkSpan * depth, a: vis };
    });
  },
});
