import { clamp01, defineOrb, makeProjector, resolutionScale, withDepth, type Dot } from "../core";

/**
 * examining → sliced at equal heights instead of equal latitudes: flat contour rings that rise
 * forever, swelling through the equator and shrinking to a point at the top as new ones are born below.
 */
export const contour = defineOrb({
  defaults: { slices: 14, perRing: 46, rise: 0.22, rBase: 0.6, rDepth: 1.7, inkFar: 0.62, inkSpan: 0.54, rsPow: 0.6, rMin: 0.3 },
  scaling: { pairs: [["slices", "perRing"]], radius: ["rBase", "rDepth"] },
  tuning: {
    64: { speed: 1, count: 0.45, size: 1.05 },
    20: { speed: 1, count: 0.13, size: 1.8 },
  },
  dots(size, time, o) {
    const c = size / 2;
    const at = withDepth(makeProjector(time * 0.2, 0.5, c, c, c * 0.82));
    const rs = resolutionScale(size, o.rsPow);
    const scroll = (time * o.rise) % 1;
    const dots: Dot[] = [];
    for (let j = 0; j < o.slices; j++) {
      const y = -1 + ((j + scroll) / o.slices) * 2;
      const rad = Math.sqrt(Math.max(0, 1 - y * y));
      const n = Math.max(3, Math.round(o.perRing * rad));
      const life = clamp01(Math.min(j + scroll, o.slices - j - scroll)); // fade in at the base, out at the top
      for (let k = 0; k < n; k++) {
        const a = (k / n) * 2 * Math.PI + j * 0.4;
        const [x, py, z, depth] = at(Math.cos(a) * rad, y, Math.sin(a) * rad);
        dots.push({ x, y: py, z, r: (o.rBase + o.rDepth * depth) * rs, white: o.inkFar - o.inkSpan * depth, a: life });
      }
    }
    return dots;
  },
});
