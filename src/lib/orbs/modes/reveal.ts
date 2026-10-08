import { clamp01, defineOrb, fibonacciSphere, hash, makeProjector, resolutionScale, smoothstep, withDepth, type Dot } from "../core";

// fade in top → bottom, hold, fade out top → bottom, rest
const IN = 1.4, HOLD = 0.6, OUT = 1.0, REST = 0.3, CYCLE = IN + HOLD + OUT + REST;

/** loading → dots fade in from the north pole down, hold for a beat, then fade away the same way */
export const reveal = defineOrb({
  defaults: { dots: 300, rBase: 0.6, rDepth: 1.7, inkFar: 0.62, inkSpan: 0.54, rsPow: 0.6, rMin: 0.3 },
  scaling: { linear: ["dots"], radius: ["rBase", "rDepth"] },
  tuning: {
    64: { speed: 1.1, count: 0.65, size: 1.05 },
    20: { speed: 1.2, count: 0.18, size: 1.8 },
  },
  dots(size, time, o) {
    const c = size / 2;
    const at = withDepth(makeProjector(time * 0.3, 0.35, c, c, c * 0.82));
    const rs = resolutionScale(size, o.rsPow);
    const t = time % CYCLE;
    const dots: Dot[] = [];
    for (let i = 0; i < o.dots; i++) {
      const g = fibonacciSphere(i, o.dots);
      const order = (1 - g[1]) / 2 * 0.8 + hash(i, 6.1) * 0.2; // top first, with a little grain
      const shown = t < IN + HOLD ? clamp01((t / IN - order * 0.75) / 0.25) : 1 - clamp01(((t - IN - HOLD) / OUT - order * 0.75) / 0.25);
      if (shown <= 0) continue;
      const v = smoothstep(shown);
      const [x, y, z, depth] = at(...g);
      dots.push({ x, y, z, r: (o.rBase + o.rDepth * depth) * (0.4 + 0.6 * v) * rs, white: o.inkFar - o.inkSpan * depth, a: v });
    }
    return dots;
  },
});
