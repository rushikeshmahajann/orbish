import { clamp01, defineOrb, fibonacciSphere, hash, makeProjector, resolutionScale, smoothstep, withDepth, type Dot } from "../core";

// grow from a seed → hold → shrink back → rest
const GROW = 1.3, HOLD = 0.8, SHRINK = 0.8, REST = 0.3, CYCLE = GROW + HOLD + SHRINK + REST;

/** growing → the sphere sprouts from a single point, each dot pushing out on its own beat */
export const grow = defineOrb({
  defaults: { dots: 260, rBase: 0.6, rDepth: 1.7, inkFar: 0.62, inkSpan: 0.54, rsPow: 0.6, rMin: 0.3 },
  scaling: { linear: ["dots"], radius: ["rBase", "rDepth"] },
  tuning: {
    64: { speed: 1, count: 0.7, size: 1.05 },
    20: { speed: 1.1, count: 0.2, size: 1.8 },
  },
  dots(size, time, o) {
    const c = size / 2;
    const at = withDepth(makeProjector(time * 0.35, 0.4, c, c, c * 0.82));
    const rs = resolutionScale(size, o.rsPow);
    const t = time % CYCLE;
    const g = t < GROW ? t / GROW : t < GROW + HOLD ? 1 : t < GROW + HOLD + SHRINK ? 1 - (t - GROW - HOLD) / SHRINK : 0;
    const dots: Dot[] = [];
    for (let i = 0; i < o.dots; i++) {
      const s = smoothstep(clamp01((g - hash(i, 3.7) * 0.5) / 0.5)); // staggered per dot
      if (s <= 0.01) continue;
      const p = fibonacciSphere(i, o.dots);
      const [x, y, z, depth] = at(p[0] * s, p[1] * s, p[2] * s);
      dots.push({ x, y, z, r: (o.rBase + o.rDepth * depth) * (0.4 + 0.6 * s) * rs, white: o.inkFar - o.inkSpan * depth, a: s });
    }
    return dots;
  },
});
