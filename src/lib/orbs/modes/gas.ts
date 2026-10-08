import { defineOrb, fibonacciSphere, hash, makeProjector, resolutionScale, withDepth, type Dot } from "../core";

/** diffusing → particles jostle through the whole volume of the ball, bouncing off an invisible wall */
export const gas = defineOrb({
  defaults: { particles: 110, ghost: 120, rBase: 0.8, rDepth: 1.3, rsPow: 0.6, rMin: 0.3 },
  scaling: { linear: ["particles", "ghost"], radius: ["rBase", "rDepth"] },
  tuning: {
    64: { speed: 1, count: 1, size: 1 },
    20: { speed: 1, count: 0.32, size: 1.8 },
  },
  dots(size, time, o) {
    const c = size / 2;
    const at = withDepth(makeProjector(time * 0.1, 0.3, c, c, c * 0.84));
    const rs = resolutionScale(size, o.rsPow);
    const dots: Dot[] = [];
    for (let i = 0; i < o.ghost; i++) {
      const [x, y, z, depth] = at(...fibonacciSphere(i, o.ghost));
      dots.push({ x, y, z, r: (0.45 + 0.5 * depth) * rs, white: 0.78, a: 0.15 + 0.3 * depth });
    }
    for (let i = 0; i < o.particles; i++) {
      // two incommensurate sines per axis ≈ a wandering path; fold anything outside the ball back in
      const q = [0, 1, 2].map((k) => {
        const f1 = 0.5 + 0.7 * hash(i, 1 + k), f2 = 0.9 + 1.1 * hash(i, 4 + k);
        return 0.65 * Math.sin(time * f1 + hash(i, 7 + k) * 6.3) + 0.45 * Math.sin(time * f2 + hash(i, 10 + k) * 6.3);
      });
      let len = Math.hypot(q[0], q[1], q[2]);
      if (len > 0.97) {
        const k = (0.97 - (len - 0.97)) / len; // bounce
        q[0] *= k; q[1] *= k; q[2] *= k; len = 0.97 - (len - 0.97);
      }
      const [x, y, z, depth] = at(q[0], q[1], q[2]);
      dots.push({ x, y, z, r: (o.rBase + o.rDepth * depth) * rs, white: 0.5 - 0.42 * depth, a: 0.55 + 0.45 * depth });
    }
    return dots;
  },
});
