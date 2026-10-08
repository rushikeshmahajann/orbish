import { defineOrb, latLonSphere, makeProjector, resolutionScale, smoothstep } from "../core";

const STEP = 1.4, TURN = 0.6;

/** toggling → one hemisphere dark, one light; the divide swings half a turn, pauses, swings again */
export const halves = defineOrb({
  defaults: { latRings: 17, lonDensity: 44, rBase: 0.6, rDepth: 1.7, inkFar: 0.62, inkSpan: 0.54, rsPow: 0.6, rMin: 0.3 },
  scaling: { pairs: [["latRings", "lonDensity"]], radius: ["rBase", "rDepth"] },
  tuning: {
    64: { speed: 1, count: 0.42, size: 1.1 },
    20: { speed: 1, count: 0.105, size: 1.75 },
  },
  dots(size, time, o) {
    const c = size / 2;
    const project = makeProjector(time * 0.15, 0.35, c, c, c * 0.82);
    const rs = resolutionScale(size, o.rsPow);
    const n = Math.floor(time / STEP);
    const a = (n + smoothstep(Math.min(1, (time - n * STEP) / TURN))) * Math.PI; // cumulative half turns
    const nx = Math.cos(a), nz = Math.sin(a);
    return latLonSphere(o.latRings, o.lonDensity).map((p) => {
      const [x, y, z] = project(p.x, p.y, p.z);
      const depth = (z + 1) / 2;
      const on = smoothstep(Math.max(0, Math.min(1, (p.x * nx + p.z * nz) / 0.25 + 0.5)));
      return {
        x, y, z,
        r: (o.rBase + o.rDepth * depth) * (0.45 + 0.55 * on) * rs,
        white: o.inkFar - o.inkSpan * depth * on + 0.2 * (1 - on),
        a: 0.3 + 0.7 * on,
      };
    });
  },
});
