import { defineOrb, latLonSphere, makeProjector, resolutionScale } from "../core";

const PERIOD = 3.2, BASE = 0.3, BOOST = 3.4;

/** warming → the sphere spins up until its dots smear into short streaks, then coasts back down */
export const spin = defineOrb({
  defaults: { latRings: 13, lonDensity: 34, streak: 3, rBase: 0.6, rDepth: 1.7, inkFar: 0.62, inkSpan: 0.54, rsPow: 0.6, rMin: 0.3 },
  scaling: { pairs: [["latRings", "lonDensity"]], radius: ["rBase", "rDepth"] },
  tuning: {
    64: { speed: 1, count: 0.5, size: 1.05 },
    20: { speed: 1, count: 0.15, size: 1.8, extra: { streak: 2 } },
  },
  dots(size, time, o) {
    const c = size / 2;
    const rs = resolutionScale(size, o.rsPow);
    // ω = BASE + BOOST·sin²(πt/P); angle is its exact integral, so the spin never jumps
    const w = BASE + BOOST * Math.sin((Math.PI * time) / PERIOD) ** 2;
    const angle = BASE * time + BOOST * (time / 2 - (PERIOD / (4 * Math.PI)) * Math.sin((2 * Math.PI * time) / PERIOD));
    const blur = (w - BASE) / BOOST;
    const sphere = latLonSphere(o.latRings, o.lonDensity);
    const dots = [];
    for (let k = 0; k <= o.streak; k++) {
      const project = makeProjector(angle - k * w * 0.03, 0.35, c, c, c * 0.82);
      const fade = k === 0 ? 1 : blur * (1 - k / (o.streak + 1)) * 0.7;
      if (fade < 0.03) continue;
      for (const p of sphere) {
        const [x, y, z] = project(p.x, p.y, p.z);
        const depth = (z + 1) / 2;
        dots.push({ x, y, z, r: (o.rBase + o.rDepth * depth) * (k ? 0.75 : 1) * rs, white: o.inkFar - o.inkSpan * depth, a: fade });
      }
    }
    return dots;
  },
});
