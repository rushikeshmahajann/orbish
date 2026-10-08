import { defineOrb, fibonacciSphere, hash, makeProjector, resolutionScale, smoothstep, withDepth, type Dot } from "../core";

/** converging → every dot blinks to its own rhythm; little by little they fall into step, flash as one, then drift apart */
export const fireflies = defineOrb({
  defaults: { dots: 210, tempo: 3, rBase: 0.5, rDepth: 0.9, rFlash: 1.8, rsPow: 0.6, rMin: 0.3 },
  scaling: { linear: ["dots"], radius: ["rBase", "rDepth", "rFlash"] },
  tuning: {
    64: { speed: 1, count: 0.9, size: 1 },
    20: { speed: 1, count: 0.28, size: 1.8 },
  },
  dots(size, time, o) {
    const c = size / 2;
    const at = withDepth(makeProjector(time * 0.15, 0.35, c, c, c * 0.82));
    const rs = resolutionScale(size, o.rsPow);
    const sync = smoothstep(0.5 + 0.5 * Math.sin(time * 0.35)); // 0 = everyone solo, 1 = in unison
    const dots: Dot[] = [];
    for (let i = 0; i < o.dots; i++) {
      const own = (1 + 0.25 * (hash(i, 1.1) - 0.5)) * o.tempo * time + hash(i, 2.2) * 2 * Math.PI;
      const phase = own * (1 - sync) + o.tempo * time * sync;
      const flash = Math.max(0, Math.cos(phase)) ** 12;
      const [x, y, z, depth] = at(...fibonacciSphere(i, o.dots));
      dots.push({
        x, y, z,
        r: (o.rBase + o.rDepth * depth + o.rFlash * flash) * rs,
        white: 0.72 - 0.25 * depth - 0.55 * flash,
        a: 0.3 + 0.3 * depth + 0.4 * flash,
      });
    }
    return dots;
  },
});
