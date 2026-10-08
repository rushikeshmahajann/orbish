import { defineOrb, fibonacciSphere, makeProjector, resolutionScale, rotateX, rotateY, withDepth, type Dot } from "../core";

/** balancing → one bold equator ring wobbles and precesses like a gyroscope on a faint sphere */
export const gyro = defineOrb({
  defaults: { ghost: 160, ringDots: 48, rBase: 0.6, rDepth: 1.6, rsPow: 0.6, rMin: 0.3 },
  scaling: { linear: ["ghost", "ringDots"], radius: ["rBase", "rDepth"] },
  tuning: {
    64: { speed: 1.2, count: 0.8, size: 1.05 },
    20: { speed: 1.3, count: 0.35, size: 1.8 },
  },
  dots(size, time, o) {
    const c = size / 2;
    const at = withDepth(makeProjector(0, 0.3, c, c, c * 0.82));
    const rs = resolutionScale(size, o.rsPow);
    const dots: Dot[] = [];
    for (let i = 0; i < o.ghost; i++) {
      const [x, y, z, depth] = at(...fibonacciSphere(i, o.ghost));
      dots.push({ x, y, z, r: (0.5 + 0.6 * depth) * rs, white: 0.75, a: 0.2 + 0.3 * depth });
    }
    const tilt = 0.45 + 0.15 * Math.sin(time * 1.7);
    for (let k = 0; k < o.ringDots; k++) {
      const a = (k / o.ringDots) * 2 * Math.PI;
      const p = rotateY(rotateX([Math.cos(a), 0, Math.sin(a)], tilt), time * 1.2);
      const [x, y, z, depth] = at(...p);
      dots.push({ x, y, z, r: (o.rBase + o.rDepth * depth) * rs, white: 0.5 - 0.45 * depth });
    }
    return dots;
  },
});
