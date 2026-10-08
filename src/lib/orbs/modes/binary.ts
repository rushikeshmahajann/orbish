import { defineOrb, fibonacciSphere, makeProjector, resolutionScale, rotateY, smoothstep, withDepth, type Dot } from "../core";

// orbit apart → merge → hold as one → split
const APART = 1.6, MERGE = 0.8, HOLD = 0.6, SPLIT = 0.8, CYCLE = APART + MERGE + HOLD + SPLIT;

function merged(time: number) {
  const t = time % CYCLE;
  if (t < APART) return 0;
  if (t < APART + MERGE) return smoothstep((t - APART) / MERGE);
  if (t < APART + MERGE + HOLD) return 1;
  return 1 - smoothstep((t - APART - MERGE - HOLD) / SPLIT);
}

/** pairing → two spheres orbit, stretch toward each other, fuse into one, then pull apart again */
export const binary = defineOrb({
  defaults: { dots: 150, sep: 0.55, ballR: 0.42, mergedR: 0.6, tide: 0.35, rBase: 0.6, rDepth: 1.6, inkFar: 0.62, inkSpan: 0.54, rsPow: 0.6, rMin: 0.3 },
  scaling: { linear: ["dots"], radius: ["rBase", "rDepth"] },
  tuning: {
    64: { speed: 1.2, count: 0.9, size: 1 },
    20: { speed: 1.3, count: 0.3, size: 1.8 },
  },
  dots(size, time, o) {
    const c = size / 2, maxMag = o.sep + o.ballR + o.tide * o.ballR;
    const at = withDepth(makeProjector(0.2, 0.4, c, c, (c * 0.86) / maxMag), maxMag);
    const rs = resolutionScale(size, o.rsPow);
    const m = merged(time);
    const d = o.sep * (1 - m), rr = o.ballR + (o.mergedR - o.ballR) * m;
    const th = time * 1.3, dx = Math.cos(th), dz = Math.sin(th);
    const stretch = 0.3 + 0.7 * Math.sin(Math.PI * m); // strongest mid-merge
    const dots: Dot[] = [];
    for (const s of [1, -1]) {
      const cx = dx * d * s, cz = dz * d * s;
      const tx = -dx * s, tz = -dz * s; // toward the partner
      for (let i = 0; i < o.dots; i++) {
        // offset the second ball's pattern so the merged sphere interleaves instead of doubling up
        const g = rotateY(fibonacciSphere(i, o.dots), s > 0 ? 0 : 0.37);
        const pull = Math.max(0, g[0] * tx + g[2] * tz) ** 3 * o.tide * stretch * (1 - m);
        const [x, y, z, depth] = at(cx + (g[0] + tx * pull) * rr, g[1] * rr, cz + (g[2] + tz * pull) * rr);
        dots.push({ x, y, z, r: (o.rBase + o.rDepth * depth) * rs, white: o.inkFar - o.inkSpan * depth - 0.12 * pull });
      }
    }
    return dots;
  },
});
