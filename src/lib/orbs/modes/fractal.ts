import { defineOrb, fibonacciSphere, hash, makeProjector, resolutionScale, rotateX, rotateY, withDepth, type Dot } from "../core";

/** recursing → a sphere made of little spheres, each spinning on its own; one at a time swells and shrinks */
export const fractal = defineOrb({
  defaults: { clusters: 32, perCluster: 12, miniR: 0.16, rBase: 0.5, rDepth: 1.3, rsPow: 0.6, rMin: 0.3 },
  scaling: { linear: ["clusters"], radius: ["rBase", "rDepth"] },
  tuning: {
    64: { speed: 1, count: 1, size: 1 },
    20: { speed: 1, count: 0.38, size: 1.6, extra: { perCluster: 7, miniR: 0.2 } },
  },
  dots(size, time, o) {
    const c = size / 2, maxMag = 1 + o.miniR * 1.8;
    const at = withDepth(makeProjector(time * 0.2, 0.35, c, c, (c * 0.86) / maxMag), maxMag);
    const rs = resolutionScale(size, o.rsPow);
    const focus = (time * 0.7) % o.clusters; // which cluster is currently swelling
    const dots: Dot[] = [];
    for (let k = 0; k < o.clusters; k++) {
      const [cx, cy, cz] = fibonacciSphere(k, o.clusters);
      const dist = Math.min(Math.abs(k - focus), o.clusters - Math.abs(k - focus));
      const swell = 1 + 0.8 * Math.max(0, 1 - dist);
      const rr = o.miniR * swell;
      const spin = time * (0.8 + 1.2 * hash(k, 1.3)) * (hash(k, 2.1) > 0.5 ? 1 : -1);
      for (let i = 0; i < o.perCluster; i++) {
        const g = rotateY(rotateX(fibonacciSphere(i, o.perCluster), hash(k, 3.7) * 3), spin);
        const [x, y, z, depth] = at(cx + g[0] * rr, cy + g[1] * rr, cz + g[2] * rr);
        dots.push({ x, y, z, r: (o.rBase + o.rDepth * depth) * (0.8 + 0.2 * swell) * rs, white: 0.6 - 0.5 * depth - 0.15 * (swell - 1) });
      }
    }
    return dots;
  },
});
