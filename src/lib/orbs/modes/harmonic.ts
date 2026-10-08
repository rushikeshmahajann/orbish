import { defineOrb, latLonSphere, makeProjector, resolutionScale } from "../core";

type Mode = (x: number, y: number, z: number) => number;
// real spherical harmonics (unnormalised, scaled to peak near ±1): lobed standing-wave patterns
const MODES: Mode[] = [
  (x, y, z) => (x * x - z * z) * 1.0,                          // Y₂² : four lobes round the equator
  (x, y) => x * (5 * y * y - 1) * 0.7,                        // Y₃¹ : lobes stacked in two bands
  (x, y, z) => (x * x * x - 3 * x * z * z) * 1.0,            // Y₃³ : six lobes
  (x, y, z) => (x * x - z * z) * (7 * y * y - 1) * 0.5,      // Y₄² : checkerboard
  (x, y, z) => y * (2 * y * y - 3 * (x * x + z * z)) * 0.6,  // Y₃⁰ : rings, for contrast
];
const HOLD = 2.4, FADE = 0.7, STEP = HOLD + FADE;

/** vibrating → the surface rings like a bell in standing-wave patterns: lobes swell in and out, nodal lines stay still */
export const harmonic = defineOrb({
  defaults: { latRings: 17, lonDensity: 44, amp: 0.14, rate: 3.2, rBase: 0.6, rDepth: 1.7, inkFar: 0.62, inkSpan: 0.54, rsPow: 0.6, rMin: 0.3 },
  scaling: { pairs: [["latRings", "lonDensity"]], radius: ["rBase", "rDepth"] },
  tuning: {
    64: { speed: 1, count: 0.42, size: 1.1 },
    20: { speed: 1, count: 0.105, size: 1.75 },
  },
  dots(size, time, o) {
    const c = size / 2, maxMag = 1 + o.amp;
    const project = makeProjector(time * 0.2, 0.4, c, c, (c * 0.84) / maxMag);
    const rs = resolutionScale(size, o.rsPow);
    const t = time % (MODES.length * STEP), i = Math.floor(t / STEP), w = t - i * STEP;
    const b = w < HOLD ? 0 : (w - HOLD) / FADE;
    const A = MODES[i], B = MODES[(i + 1) % MODES.length];
    const osc = Math.sin(time * o.rate);
    return latLonSphere(o.latRings, o.lonDensity).map((p) => {
      const shape = A(p.x, p.y, p.z) * (1 - b) + B(p.x, p.y, p.z) * b;
      const rad = 1 + o.amp * shape * osc;
      const [x, y, z] = project(p.x * rad, p.y * rad, p.z * rad);
      const depth = (z / maxMag + 1) / 2;
      const node = Math.exp(-((shape / 0.12) ** 2)); // still dots along the nodal lines
      const swing = Math.abs(shape * osc);
      return {
        x, y, z,
        r: (o.rBase + o.rDepth * depth) * (1 + 0.5 * swing) * (1 - 0.35 * node) * rs,
        white: o.inkFar - o.inkSpan * depth - 0.15 * swing + 0.2 * node,
      };
    });
  },
});
