import { defineOrb, fibonacciSphere, hash, makeProjector, resolutionScale, withDepth, type Dot } from "../core";

/** celebrating → a spinning mirror ball whose facets flash with star-shaped glints */
export const sparkle = defineOrb({
  defaults: { dots: 300, rBase: 0.6, rDepth: 1.5, rGlint: 1.8, arm: 0.035, rsPow: 0.6, rMin: 0.3, inkFar: 0.62, inkSpan: 0.54 },
  scaling: { linear: ["dots"], radius: ["rBase", "rDepth", "rGlint"] },
  tuning: {
    64: { speed: 1.2, count: 0.7, size: 1.05 },
    20: { speed: 1.3, count: 0.2, size: 1.8, extra: { arm: 0.05 } },
  },
  dots(size, time, o) {
    const c = size / 2;
    const at = withDepth(makeProjector(time * 0.6, 0.35, c, c, c * 0.8));
    const rs = resolutionScale(size, o.rsPow);
    const dots: Dot[] = [];
    for (let i = 0; i < o.dots; i++) {
      const g = fibonacciSphere(i, o.dots);
      const [x, y, z, depth] = at(...g);
      dots.push({ x, y, z, r: (o.rBase + o.rDepth * depth) * rs, white: o.inkFar - o.inkSpan * depth + 0.1 * hash(i, 4.2) });
      // a sharp, rare flash per facet, only on the side facing us
      const glint = Math.max(0, Math.sin(time * (1.5 + 2.5 * hash(i, 1.3)) + hash(i, 2.7) * 20)) ** 30 * depth;
      if (glint < 0.05) continue;
      dots.push({ x, y, z: z + 2, r: (o.rBase + o.rGlint * glint) * rs, white: 0.02 });
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        for (let j = 1; j <= 2; j++) {
          const off = j * size * o.arm * glint;
          dots.push({ x: x + dx * off, y: y + dy * off, z: z + 2, r: 0.6 * (1 - j * 0.3) * rs, white: 0.05, a: glint * (1 - j * 0.3) });
        }
      }
    }
    return dots;
  },
});
