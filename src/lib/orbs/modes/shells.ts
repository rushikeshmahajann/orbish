import { defineOrb, fibonacciSphere, makeProjector, resolutionScale, rotateX, rotateY, withDepth, type Dot } from "../core";

const LAYERS = [
  { r: 0.36, n: 40, spin: 0.7, tilt: 0.5, ink: 0.25 },
  { r: 0.65, n: 90, spin: -0.45, tilt: -0.3, ink: 0.42 },
  { r: 0.94, n: 160, spin: 0.25, tilt: 0.15, ink: 0.6 },
];

/** layering → three nested dotted shells, each turning its own way */
export const shells = defineOrb({
  defaults: { density: 1, rBase: 0.55, rDepth: 1.5, rsPow: 0.6, rMin: 0.3 },
  scaling: { icon: ["density"], radius: ["rBase", "rDepth"] },
  tuning: {
    64: { speed: 1.2, count: 0.9, size: 1 },
    20: { speed: 1.3, count: 0.3, size: 1.8 },
  },
  dots(size, time, o) {
    const c = size / 2;
    const project = makeProjector(0, 0.35, c, c, c * 0.84);
    const rs = resolutionScale(size, o.rsPow);
    const dots: Dot[] = [];
    for (const L of LAYERS) {
      const at = withDepth(project, L.r), n = Math.max(8, Math.round(L.n * o.density));
      for (let i = 0; i < n; i++) {
        const g = rotateY(rotateX(fibonacciSphere(i, n), L.tilt), time * L.spin);
        const [x, y, z, depth] = at(g[0] * L.r, g[1] * L.r, g[2] * L.r);
        dots.push({ x, y, z, r: (o.rBase + o.rDepth * depth * L.r) * rs, white: L.ink - 0.3 * depth, a: 0.45 + 0.55 * depth });
      }
    }
    return dots;
  },
});
