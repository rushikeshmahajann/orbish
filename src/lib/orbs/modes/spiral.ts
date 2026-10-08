import { defineOrb, fibonacciSphere, makeProjector, resolutionScale, type Dot } from "../core";

// draw the seam → hold → erase from the top → pause
const WRITE = 1.8, HOLD = 0.4, ERASE = 1.2, REST = 0.3, CYCLE = WRITE + HOLD + ERASE + REST;

/** drafting → one continuous seam is drawn around the sphere pole to pole, then erased */
export const spiral = defineOrb({
  defaults: { seamDots: 160, turns: 5, ghostN: 140, rBase: 0.6, rDepth: 1.7, rHead: 1.8, rsPow: 0.6, rMin: 0.3 },
  scaling: { linear: ["seamDots", "ghostN"], radius: ["rBase", "rDepth", "rHead"] },
  tuning: {
    64: { speed: 1.3, count: 0.75, size: 1.05 },
    20: { speed: 1.5, count: 0.3, size: 1.8, extra: { turns: 3 } },
  },
  dots(size, time, o) {
    const c = size / 2, R = c * 0.82;
    const project = makeProjector(time * 0.4, 0.45, c, c, R);
    const rs = resolutionScale(size, o.rsPow);
    const t = time % CYCLE;
    const ease = (e: number) => 1 - (1 - Math.min(1, Math.max(0, e))) ** 2;
    const head = ease(t / WRITE);
    const tail = ease((t - WRITE - HOLD) / ERASE);
    const writing = t < WRITE;
    const dots: Dot[] = [];

    for (let i = 0; i < o.ghostN; i++) {
      const g = fibonacciSphere(i, o.ghostN);
      const [x, y, z] = project(g[0], g[1], g[2]);
      const depth = (z + 1) / 2;
      dots.push({ x, y, z, r: 0.75 * rs, white: 0.8, a: 0.1 + 0.2 * depth });
    }
    for (let i = 0; i <= o.seamDots; i++) {
      const v = i / o.seamDots;
      if (v > head || v < tail) continue;
      const polar = Math.PI * v, lon = o.turns * 2 * Math.PI * v;
      const [x, y, z] = project(Math.sin(polar) * Math.cos(lon), Math.cos(polar), Math.sin(polar) * Math.sin(lon));
      const depth = (z + 1) / 2;
      const pen = writing ? Math.exp(-((head - v) ** 2) / 0.0012) : 0; // bright pen tip
      dots.push({
        x, y, z,
        r: (o.rBase + o.rDepth * depth + o.rHead * pen) * rs,
        white: 0.6 - 0.52 * depth - 0.2 * pen,
        a: 0.45 + 0.55 * Math.max(depth, pen),
      });
    }
    return dots;
  },
});
