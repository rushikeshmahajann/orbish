import { defineOrb, hash, latLonSphere, makeProjector, resolutionScale } from "../core";

const RATE = 7; // glitch slots per second

/**
 * debugging → the hash seed itself is time-varying: most slots are calm, but now and then a slot
 * fires and the globe tears into shifted scanline bands with dropped dots, then snaps back.
 */
export const glitch = defineOrb({
  defaults: { latRings: 17, lonDensity: 44, chance: 0.28, rBase: 0.6, rDepth: 1.7, inkFar: 0.62, inkSpan: 0.54, rsPow: 0.6, rMin: 0.3 },
  scaling: { pairs: [["latRings", "lonDensity"]], radius: ["rBase", "rDepth"] },
  tuning: {
    64: { speed: 1, count: 0.42, size: 1.1 },
    20: { speed: 1, count: 0.105, size: 1.75 },
  },
  dots(size, time, o) {
    const c = size / 2;
    const project = makeProjector(time * 0.4, 0.35, c, c, c * 0.8);
    const rs = resolutionScale(size, o.rsPow);
    const slot = Math.floor(time * RATE);
    const live = hash(slot, 1.7) < o.chance;
    const bands = [0, 1].map((b) => ({
      y: hash(slot, 2.3 + b) * size,
      h: (0.06 + 0.12 * hash(slot, 3.1 + b)) * size,
      dx: (hash(slot, 4.7 + b) - 0.5) * 0.18 * size, // stays inside the canvas margin
    }));
    return latLonSphere(o.latRings, o.lonDensity).map((p, i) => {
      const [px, py, z] = project(p.x, p.y, p.z);
      let x = px, y = py;
      const depth = (z + 1) / 2;
      let a = 1;
      if (live) {
        for (const b of bands) if (Math.abs(y - b.y) < b.h / 2) x += b.dx;
        if (hash(i, slot + 0.5) > 0.86) a = 0; // dropped samples
        y = Math.round(y / 2) * 2; // coarse scanlines while glitching
      }
      return { x, y, z, r: (o.rBase + o.rDepth * depth) * rs, white: o.inkFar - o.inkSpan * depth - (live ? 0.08 : 0), a };
    });
  },
});
