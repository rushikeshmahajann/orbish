import { defineOrb, fibonacciSphere, makeProjector, resolutionScale, rotateAxis, smoothstep, withDepth, type Dot, type Vec3 } from "../core";

// closed → open → hold → close
const CLOSED = 0.9, OPEN = 1.0, HOLD = 0.7, CLOSE = 0.9, CYCLE = CLOSED + OPEN + HOLD + CLOSE;

function openness(time: number) {
  const t = time % CYCLE;
  if (t < CLOSED) return 0;
  if (t < CLOSED + OPEN) return smoothstep((t - CLOSED) / OPEN);
  if (t < CLOSED + OPEN + HOLD) return 1;
  return 1 - smoothstep((t - CLOSED - OPEN - HOLD) / CLOSE);
}

/** unfolding → the sphere splits into petals hinged at the base that open like a flower, revealing a core */
export const bloom = defineOrb({
  defaults: { dots: 340, petals: 6, angle: 0.85, coreDots: 40, rBase: 0.6, rDepth: 1.7, inkFar: 0.62, inkSpan: 0.54, rsPow: 0.6, rMin: 0.3 },
  scaling: { linear: ["dots", "coreDots"], radius: ["rBase", "rDepth"] },
  tuning: {
    64: { speed: 1.2, count: 0.65, size: 1.05 },
    20: { speed: 1.4, count: 0.18, size: 1.8, extra: { petals: 5 } },
  },
  dots(size, time, o) {
    const c = size / 2;
    const open = openness(time), theta = o.angle * open;
    const sc = 1 / (1 + Math.sin(theta)); // shrink as the petals fan out, so it always fits
    const lift = 0.25 * open;
    const at = withDepth(makeProjector(time * 0.35, 0.45, c, c, c * 0.84), 1);
    const rs = resolutionScale(size, o.rsPow);
    const wedge = (2 * Math.PI) / o.petals;
    const dots: Dot[] = [];
    for (let i = 0; i < o.dots; i++) {
      const g = fibonacciSphere(i, o.dots);
      const lon = (Math.atan2(g[2], g[0]) + 2 * Math.PI) % (2 * Math.PI);
      const phi = (Math.floor(lon / wedge) + 0.5) * wedge;
      const hinge: Vec3 = [Math.sin(phi), 0, -Math.cos(phi)]; // horizontal axis through the south pole
      const v = rotateAxis([g[0], g[1] + 1, g[2]], hinge, theta);
      const [x, y, z, depth] = at(v[0] * sc, (v[1] - 1 + lift) * sc, v[2] * sc);
      dots.push({ x, y, z, r: (o.rBase + o.rDepth * depth) * rs, white: o.inkFar - o.inkSpan * depth });
    }
    if (open > 0.05) {
      for (let i = 0; i < o.coreDots; i++) {
        const g = fibonacciSphere(i, o.coreDots), cr = 0.3 * open;
        const [x, y, z, depth] = at(g[0] * cr * sc, (g[1] * cr - 0.55 + lift) * sc, g[2] * cr * sc);
        dots.push({ x, y, z, r: (o.rBase * 0.8 + 1.2 * depth) * rs, white: 0.3 - 0.25 * depth, a: open });
      }
    }
    return dots;
  },
});
