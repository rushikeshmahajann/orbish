import { defineOrb, fibonacciSphere, hash, makeProjector, resolutionScale, smoothstep, type Dot } from "../core";

// tight → burst out → drift → gather back
const TIGHT = 1.0, BURST = 0.6, DRIFT = 0.4, GATHER = 1.3, CYCLE = TIGHT + BURST + DRIFT + GATHER;

function scatter(time: number) {
  const t = time % CYCLE;
  if (t < TIGHT) return 0;
  if (t < TIGHT + BURST) return 1 - (1 - (t - TIGHT) / BURST) ** 3; // fast ease-out burst
  if (t < TIGHT + BURST + DRIFT) return 1;
  return 1 - smoothstep((t - TIGHT - BURST - DRIFT) / GATHER);
}

/** gathering → a tight sphere bursts into a swirling cloud, then pulls itself back together */
export const swarm = defineOrb({
  defaults: { dots: 360, spread: 0.65, swirl: 2.4, rBase: 0.6, rDepth: 1.7, rsPow: 0.6, rMin: 0.3 },
  scaling: { linear: ["dots"], radius: ["rBase", "rDepth"] },
  tuning: {
    64: { speed: 1.4, count: 0.5, size: 1.05 },
    20: { speed: 1.6, count: 0.14, size: 1.85 },
  },
  dots(size, time, o) {
    const c = size / 2, R = (c * 0.86) / (1 + o.spread);
    const project = makeProjector(time * 0.4, 0.4, c, c, R);
    const rs = resolutionScale(size, o.rsPow);
    const s = scatter(time);
    const maxMag = 1 + o.spread;
    const dots: Dot[] = [];
    for (let i = 0; i < o.dots; i++) {
      const [px, py, pz] = fibonacciSphere(i, o.dots);
      const out = 1 + s * o.spread * (0.35 + 0.65 * hash(i, 2.2));
      const twist = s * (hash(i, 3.3) - 0.5) * o.swirl; // each dot swirls its own way around the axis
      const ct = Math.cos(twist), st = Math.sin(twist);
      const lift = s * (hash(i, 5.7) - 0.5) * 0.5;
      const [x, y, z] = project((px * ct - pz * st) * out, (py + lift) * out, (px * st + pz * ct) * out);
      const depth = Math.max(0, Math.min(1, (z / maxMag + 1) / 2));
      dots.push({
        x, y, z,
        r: (o.rBase + o.rDepth * depth) * (1 - 0.3 * s) * rs,
        white: 0.62 - 0.54 * depth + 0.1 * s,
        a: 0.5 + 0.5 * depth,
      });
    }
    return dots;
  },
});
