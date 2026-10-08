import { clamp01, defineOrb, fibonacciSphere, hash, makeProjector, randomOnSphere, resolutionScale, withDepth, type Dot, type Vec3 } from "../core";

const LIFE = 2.2, DT = 0.05;

/** Gradient of a smooth scalar field over space, analytic. */
function grad(x: number, y: number, z: number, t: number): Vec3 {
  const a = 2.7 * x + 0.3 * t, b = 1.9 * y, cc = 2.3 * z - 0.2 * t, d = 2.1 * x, e = 3.4 * y + 1.7 * z + 0.4 * t;
  return [
    2.7 * Math.cos(a) * Math.cos(b) - 2.1 * Math.sin(cc) * Math.sin(d),
    -1.9 * Math.sin(a) * Math.sin(b) + 1.7 * Math.cos(e),
    2.3 * Math.cos(cc) * Math.cos(d) + 0.85 * Math.cos(e),
  ];
}

/** Wind at surface point p: the surface curl of the field (normal × gradient), so it never piles up or thins out. */
function windAt(p: Vec3, t: number): Vec3 {
  const g = grad(p[0], p[1], p[2], t);
  return [p[1] * g[2] - p[2] * g[1], p[2] * g[0] - p[0] * g[2], p[0] * g[1] - p[1] * g[0]];
}

/** gusting → short streaks ride a swirling wind field over the globe, like a live weather map */
export const wind = defineOrb({
  defaults: { ghost: 120, streaks: 80, trail: 4, rBase: 0.5, rHead: 1.1, rsPow: 0.6, rMin: 0.3 },
  scaling: { linear: ["ghost", "streaks"], radius: ["rBase", "rHead"] },
  tuning: {
    64: { speed: 1, count: 1, size: 1 },
    20: { speed: 1, count: 0.35, size: 1.7, extra: { trail: 2 } },
  },
  dots(size, time, o) {
    const c = size / 2;
    const at = withDepth(makeProjector(time * 0.12, 0.35, c, c, c * 0.82));
    const rs = resolutionScale(size, o.rsPow);
    const dots: Dot[] = [];
    for (let i = 0; i < o.ghost; i++) {
      const [x, y, z, depth] = at(...fibonacciSphere(i, o.ghost));
      dots.push({ x, y, z, r: (0.45 + 0.5 * depth) * rs, white: 0.78, a: 0.15 + 0.3 * depth });
    }
    for (let i = 0; i < o.streaks; i++) {
      const u = time / LIFE + hash(i, 1.7), gen = Math.floor(u), age = (u - gen) * LIFE;
      let p = randomOnSphere(i + gen * 977, 5.1);
      const steps = Math.floor(age / DT), path: Vec3[] = [p];
      for (let s = 0; s < steps; s++) {
        const w = windAt(p, time);
        const q: Vec3 = [p[0] + w[0] * DT * 0.35, p[1] + w[1] * DT * 0.35, p[2] + w[2] * DT * 0.35];
        const l = Math.hypot(...q);
        p = [q[0] / l, q[1] / l, q[2] / l];
        path.push(p);
      }
      const life = clamp01(age * 4) * clamp01((LIFE - age) * 2);
      for (let k = 0; k <= o.trail; k++) {
        const q = path[path.length - 1 - k];
        if (!q) break;
        const [x, y, z, depth] = at(q[0] * 1.01, q[1] * 1.01, q[2] * 1.01);
        const fade = 1 - k / (o.trail + 1);
        dots.push({ x, y, z, r: (o.rBase + o.rHead * fade * depth) * rs, white: 0.35 - 0.25 * depth + 0.1 * k, a: life * fade * (0.4 + 0.6 * depth) });
      }
    }
    return dots;
  },
});
