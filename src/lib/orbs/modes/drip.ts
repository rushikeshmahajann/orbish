import { defineOrb, latLonSphere, makeProjector, resolutionScale, type Dot } from "../core";

// swell → fall → splash
const FORM = 0.9, FALL = 0.55, SPLASH = 0.45, CYCLE = FORM + FALL + SPLASH;
const FLOOR = -1.75;

/** brewing → a drop gathers beneath the sphere, falls, and leaves a small ripple below */
export const drip = defineOrb({
  defaults: { latRings: 15, lonDensity: 40, ripple: 18, rBase: 0.6, rDepth: 1.7, rDrop: 1.8, inkFar: 0.62, inkSpan: 0.54, rsPow: 0.6, rMin: 0.3 },
  scaling: { pairs: [["latRings", "lonDensity"]], linear: ["ripple"], radius: ["rBase", "rDepth", "rDrop"] },
  tuning: {
    64: { speed: 1, count: 0.42, size: 1.1 },
    20: { speed: 1, count: 0.11, size: 1.8 },
  },
  dots(size, time, o) {
    const c = size / 2;
    const project = makeProjector(time * 0.25, 0.2, c, c * 0.76, c * 0.58); // sphere sits high, leaving room to fall
    const rs = resolutionScale(size, o.rsPow);
    const t = time % CYCLE;
    const swell = t < FORM ? t / FORM : 0;
    const dots: Dot[] = [];
    for (const p of latLonSphere(o.latRings, o.lonDensity)) {
      const sag = 0.08 * swell * Math.max(0, -p.y) ** 6; // bottom stretches toward the drop
      const [x, y, z] = project(p.x, p.y - sag, p.z);
      const depth = (z + 1) / 2;
      dots.push({ x, y, z, r: (o.rBase + o.rDepth * depth) * rs, white: o.inkFar - o.inkSpan * depth });
    }
    let dy = 0, dr = 0;
    if (t < FORM) { dy = -1.04 - 0.1 * swell; dr = swell; }
    else if (t < FORM + FALL) { const f = (t - FORM) / FALL; dy = -1.14 + (FLOOR + 1.14) * f * f; dr = 1; }
    if (dr > 0) {
      const [x, y, z] = project(0, dy, 0);
      dots.push({ x, y, z: z + 1, r: o.rDrop * (0.3 + 0.7 * dr) * rs, white: 0.2 });
    }
    if (t >= FORM + FALL) {
      const f = (t - FORM - FALL) / SPLASH;
      for (let k = 0; k < o.ripple; k++) {
        const a = (k / o.ripple) * 2 * Math.PI, rad = 0.1 + 0.45 * f;
        const [x, y, z] = project(Math.cos(a) * rad, FLOOR, Math.sin(a) * rad);
        dots.push({ x, y, z, r: 0.7 * rs, white: 0.4, a: (1 - f) * 0.8 });
      }
    }
    return dots;
  },
});
