import { defineOrb, hash, latLonSphere, makeProjector, resolutionScale, smoothstep } from "../core";

// scramble → hold → cascade back into alignment → hold aligned
const OUT = 0.9, HOLD = 0.5, BACK = 1.1, REST = 0.8, CYCLE = OUT + HOLD + BACK + REST;

/** Each latitude ring's angular offset at this moment. Rings unlock top-to-bottom on the way back. */
function ringOffset(ring: number, rings: number, time: number) {
  const n = Math.floor(time / CYCLE);
  const t = time - n * CYCLE;
  const target = (hash(ring, n + 0.37) * 2 - 1) * Math.PI * 1.2;
  if (t < OUT) return target * smoothstep(Math.min(1, t / OUT));
  if (t < OUT + HOLD) return target;
  const lag = (ring / rings) * 0.45; // cascade: each ring clicks home a little after the one above
  const f = Math.max(0, Math.min(1, (t - OUT - HOLD - lag) / (BACK - 0.45)));
  return target * (1 - smoothstep(f));
}

/** decoding → latitude rings spin like combination-lock dials, then click back into line */
export const dial = defineOrb({
  defaults: { latRings: 15, lonDensity: 40, rBase: 0.6, rDepth: 1.7, rMark: 1.4, inkFar: 0.62, inkSpan: 0.54, rsPow: 0.6, rMin: 0.3 },
  scaling: { pairs: [["latRings", "lonDensity"]], radius: ["rBase", "rDepth", "rMark"] },
  tuning: {
    64: { speed: 1.6, count: 0.38, size: 1.05 },
    20: { speed: 1.8, count: 0.1, size: 1.9 },
  },
  dots(size, time, o) {
    const c = size / 2, R = c * 0.82;
    const project = makeProjector(time * 0.25 - 0.6, 0.38, c, c, R);
    const rs = resolutionScale(size, o.rsPow);
    const offsets = Array.from({ length: o.latRings + 1 }, (_, a) => ringOffset(a, o.latRings, time));
    return latLonSphere(o.latRings, o.lonDensity).map((p) => {
      const cl = Math.hypot(p.x, p.z);
      const lon = p.lon + offsets[p.ring];
      const [x, y, z] = project(cl * Math.cos(lon), p.y, cl * Math.sin(lon));
      const depth = (z + 1) / 2;
      const mark = p.lon === 0; // first dot of every ring forms the marker line
      return {
        x, y, z,
        r: (o.rBase + o.rDepth * depth + (mark ? o.rMark : 0)) * rs,
        white: o.inkFar - o.inkSpan * depth - (mark ? 0.3 : 0),
        a: mark ? 1 : 0.5 + 0.5 * depth,
      };
    });
  },
});
