import { defineOrb, makeProjector, resolutionScale, withDepth, type Dot } from "../core";

const GOLDEN = Math.PI * (3 - Math.sqrt(5));

/**
 * harmonizing → the golden angle that keeps a Fibonacci sphere uniform is nudged a hair off and back;
 * spiral arms (parastichies) bloom across the surface and dissolve into evenness again.
 */
export const phyllotaxis = defineOrb({
  defaults: { dots: 320, detune: 0.03, rBase: 0.6, rDepth: 1.7, inkFar: 0.62, inkSpan: 0.54, rsPow: 0.6, rMin: 0.3 },
  scaling: { linear: ["dots"], radius: ["rBase", "rDepth"] },
  tuning: {
    64: { speed: 1, count: 0.75, size: 1 },
    20: { speed: 1, count: 0.25, size: 1.8, extra: { detune: 0.06 } },
  },
  dots(size, time, o) {
    const c = size / 2;
    const at = withDepth(makeProjector(time * 0.15, 0.5, c, c, c * 0.82));
    const rs = resolutionScale(size, o.rsPow);
    const angle = GOLDEN + o.detune * Math.sin(time * 0.45) ** 3; // lingers near golden, swings out briefly
    const dots: Dot[] = [];
    for (let i = 0; i < o.dots; i++) {
      const y = 1 - (2 * (i + 0.5)) / o.dots, r = Math.sqrt(1 - y * y), th = i * angle;
      const [x, py, z, depth] = at(r * Math.cos(th), y, r * Math.sin(th));
      dots.push({ x, y: py, z, r: (o.rBase + o.rDepth * depth) * rs, white: o.inkFar - o.inkSpan * depth });
    }
    return dots;
  },
});
