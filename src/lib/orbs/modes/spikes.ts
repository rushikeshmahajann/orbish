import { defineOrb, fibonacciSphere, makeProjector, resolutionScale, withDepth, type Dot } from "../core";

/** speaking → spikes rise out of the sphere in syllable-like bursts, like a 3D audio visualiser */
export const spikes = defineOrb({
  defaults: { dots: 170, core: 0.6, reach: 0.38, spikeDots: 3, rBase: 0.6, rDepth: 1.6, rSpike: 0.5, inkFar: 0.62, inkSpan: 0.54, rsPow: 0.6, rMin: 0.3 },
  scaling: { linear: ["dots"], radius: ["rBase", "rDepth", "rSpike"] },
  tuning: {
    64: { speed: 1.2, count: 0.85, size: 1 },
    20: { speed: 1.3, count: 0.3, size: 1.8, extra: { spikeDots: 2 } },
  },
  dots(size, time, o) {
    const c = size / 2, maxMag = o.core + o.reach;
    const at = withDepth(makeProjector(time * 0.3, 0.35, c, c, (c * 0.88) / maxMag), maxMag);
    const rs = resolutionScale(size, o.rsPow);
    // overall loudness: bursts and pauses, like speech
    const level = 0.3 + 0.7 * Math.abs(Math.sin(time * 2.3) * Math.sin(time * 0.9 + 1));
    const dots: Dot[] = [];
    for (let i = 0; i < o.dots; i++) {
      const [px, py, pz] = fibonacciSphere(i, o.dots);
      const lon = Math.atan2(pz, px);
      let amp = (0.5 + 0.5 * Math.sin(time * 6.1 + py * 4.2)) * (0.5 + 0.5 * Math.sin(time * 3.7 + lon * 3 + py * 2));
      amp = amp * amp * level;
      const [x, y, z, depth] = at(px * o.core, py * o.core, pz * o.core);
      dots.push({ x, y, z, r: (o.rBase + o.rDepth * depth) * rs, white: o.inkFar - o.inkSpan * depth - 0.15 * amp });
      if (amp < 0.06) continue;
      for (let k = 1; k <= o.spikeDots; k++) {
        const rr = o.core + (o.reach * amp * k) / o.spikeDots;
        const [sx, sy, sz, sd] = at(px * rr, py * rr, pz * rr);
        dots.push({
          x: sx, y: sy, z: sz,
          r: (o.rSpike + 0.9 * sd) * (1 - (0.25 * k) / o.spikeDots) * rs,
          white: 0.45 - 0.35 * sd,
          a: (0.4 + 0.6 * sd) * (1 - (0.35 * k) / o.spikeDots),
        });
      }
    }
    return dots;
  },
});
