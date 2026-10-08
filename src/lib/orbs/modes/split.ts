import { defineOrb, fibonacciSphere, makeProjector, resolutionScale, rotateX, smoothstep, withDepth, type Dot, type Vec3 } from "../core";

// closed → open → twist halves a quarter turn → close
const CLOSED = 0.8, OPEN = 0.6, TWIST = 0.9, CLOSE = 0.6, CYCLE = CLOSED + OPEN + TWIST + CLOSE;
const GOLDEN = Math.PI * (3 - Math.sqrt(5));

/** comparing → the sphere splits into two hemispheres that twist opposite ways, then rejoin */
export const split = defineOrb({
  defaults: { dots: 320, faceDots: 46, gap: 0.24, rBase: 0.6, rDepth: 1.7, inkFar: 0.62, inkSpan: 0.54, rsPow: 0.6, rMin: 0.3 },
  scaling: { linear: ["dots", "faceDots"], radius: ["rBase", "rDepth"] },
  tuning: {
    64: { speed: 1.2, count: 0.6, size: 1.05 },
    20: { speed: 1.4, count: 0.17, size: 1.8 },
  },
  dots(size, time, o) {
    const c = size / 2, maxMag = 1 + o.gap;
    const at = withDepth(makeProjector(time * 0.25 + 0.5, 0.35, c, c, (c * 0.86) / maxMag), maxMag);
    const rs = resolutionScale(size, o.rsPow);
    const n = Math.floor(time / CYCLE), t = time - n * CYCLE;
    const open =
      t < CLOSED ? 0 : t < CLOSED + OPEN ? smoothstep((t - CLOSED) / OPEN) : t < CLOSED + OPEN + TWIST ? 1 : 1 - smoothstep((t - CLOSED - OPEN - TWIST) / CLOSE);
    const turn = t < CLOSED + OPEN ? 0 : t < CLOSED + OPEN + TWIST ? smoothstep((t - CLOSED - OPEN) / TWIST) : 1;
    const phi = ((n + turn) * Math.PI) / 2; // cumulative, so the loop never snaps back
    const dots: Dot[] = [];
    const place = (p: Vec3, side: number): Vec3 => {
      const [x, y, z] = rotateX(p, side * phi);
      return [x + side * o.gap * open, y, z];
    };
    for (let i = 0; i < o.dots; i++) {
      const g = fibonacciSphere(i, o.dots);
      const [x, y, z, depth] = at(...place(g, g[0] >= 0 ? 1 : -1));
      dots.push({ x, y, z, r: (o.rBase + o.rDepth * depth) * rs, white: o.inkFar - o.inkSpan * depth });
    }
    if (open > 0.02) {
      // the exposed cut faces: sunflower-packed disks
      for (const side of [-1, 1]) {
        for (let k = 0; k < o.faceDots; k++) {
          const r = Math.sqrt((k + 0.5) / o.faceDots) * 0.96, a = k * GOLDEN;
          const [x, y, z, depth] = at(...place([side * 0.001, r * Math.cos(a), r * Math.sin(a)], side));
          dots.push({ x, y, z, r: (o.rBase * 0.7 + 0.8 * depth) * rs, white: 0.72 - 0.3 * depth, a: open * 0.7 });
        }
      }
    }
    return dots;
  },
});
