import { defineOrb, fibonacciSphere, makeProjector, resolutionScale, type Dot } from "../core";

/** composing → ghost sphere wrapped by a wavy flowing ribbon */
export const ribbon = defineOrb({
  defaults: { lanes: 5, segs: 88, ghostN: 150, rBase: 1.1, rDepth: 1.7, spin: 1, bandMul: 1, wobMul: 1, rsPow: 0.6, rMin: 0.3 },
  scaling: { pairs: [["lanes", "segs"]], linear: ["ghostN"], radius: ["rBase", "rDepth"] },
  tuning: {
    64: { speed: 2.34, count: 0.25, size: 0.85, extra: { spin: 0, bandMul: 3.9, wobMul: 1 } },
    20: { speed: 3.12, count: 0.051, size: 1.073, extra: { spin: 0, bandMul: 4.94, wobMul: 1 } },
  },
  dots(size, time, o) {
    const c = size / 2, R = c * 0.78;
    const project = makeProjector(time * 0.1 * o.spin, 0.3, c, c, 1);
    const rs = resolutionScale(size, o.rsPow);
    const dots: Dot[] = [];
    for (let i = 0; i < o.ghostN; i++) {
      const g = fibonacciSphere(i, o.ghostN);
      const [x, y, z] = project(g[0] * R, g[1] * R, g[2] * R);
      const depth = (z / R + 1) / 2;
      dots.push({ x, y, z, r: 0.8 * rs, white: 0.78, a: 0.1 + 0.22 * depth });
    }
    // orient the ribbon's great-circle plane (slowly tumbling)
    const yaw = time * 0.24 * o.spin, tilt = 0.55 + 0.3 * Math.sin(time * 0.18) * o.spin;
    const ax = Math.cos(yaw), ay = 0, az = Math.sin(yaw);
    const bx = -az * Math.sin(tilt), by = Math.cos(tilt), bz = ax * Math.sin(tilt);
    const nx = ay * bz - az * by, ny = az * bx - ax * bz, nz = ax * by - ay * bx;
    const bands = Math.max(1, Math.round(o.lanes * o.bandMul));
    const mid = (bands - 1) / 2;
    for (let l = 0; l < bands; l++) {
      const offset = (l - mid) * 0.075;
      const edge = Math.abs(l - mid) / Math.max(1, mid);
      for (let s = 0; s < o.segs; s++) {
        const t = (s / o.segs) * 2 * Math.PI;
        const wob = (0.16 * Math.sin(t * 3 - time * 1.7 + l * 0.22) + 0.07 * Math.sin(t * 5 + time * 1.1)) * o.wobMul;
        const off = offset + wob;
        const px = ax * Math.cos(t) + bx * Math.sin(t) + nx * off;
        const py = ay * Math.cos(t) + by * Math.sin(t) + ny * off;
        const pz = az * Math.cos(t) + bz * Math.sin(t) + nz * off;
        const len = Math.sqrt(px * px + py * py + pz * pz);
        const [x, y, z] = project((px / len) * R, (py / len) * R, (pz / len) * R);
        const depth = (z / R + 1) / 2;
        dots.push({
          x, y, z,
          r: (o.rBase + o.rDepth * depth) * (1 - 0.25 * edge) * rs,
          white: 0.52 - 0.44 * depth + 0.18 * edge,
          a: 0.4 + 0.6 * depth,
        });
      }
    }
    return dots;
  },
});
