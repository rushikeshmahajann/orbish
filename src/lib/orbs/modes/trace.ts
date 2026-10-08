import { defineOrb, fibonacciSphere, makeProjector, resolutionScale, withDepth, type Dot, type Vec3 } from "../core";

/** Where tracer `n` is at time τ: a Lissajous-style path wandering over the sphere. */
function path(tau: number, n: number): Vec3 {
  const lat = 1.15 * Math.sin(tau * (1.1 + 0.4 * n) + n);
  const lon = tau * (0.8 + 0.3 * n) + 0.7 * Math.sin(tau * 0.6 + n * 2);
  return [Math.cos(lat) * Math.cos(lon), Math.sin(lat), Math.cos(lat) * Math.sin(lon)];
}

/** tracing → comets draw looping, fading trails across the surface of a faint sphere */
export const trace = defineOrb({
  defaults: { ghost: 170, tracers: 2, trail: 46, gap: 0.035, lift: 1.03, rBase: 0.6, rDepth: 1.4, rHead: 1.6, rsPow: 0.6, rMin: 0.3 },
  scaling: { linear: ["ghost", "trail"], radius: ["rBase", "rDepth", "rHead"] },
  tuning: {
    64: { speed: 1.3, count: 0.8, size: 1 },
    20: { speed: 1.4, count: 0.35, size: 1.8, extra: { gap: 0.07 } },
  },
  dots(size, time, o) {
    const c = size / 2;
    const at = withDepth(makeProjector(time * 0.2, 0.35, c, c, (c * 0.84) / o.lift), o.lift);
    const rs = resolutionScale(size, o.rsPow);
    const dots: Dot[] = [];
    for (let i = 0; i < o.ghost; i++) {
      const [x, y, z, depth] = at(...fibonacciSphere(i, o.ghost));
      dots.push({ x, y, z, r: (0.5 + 0.6 * depth) * rs, white: 0.75 - 0.2 * depth, a: 0.25 + 0.35 * depth });
    }
    for (let n = 0; n < o.tracers; n++) {
      for (let k = 0; k < o.trail; k++) {
        const fade = 1 - k / o.trail;
        const p = path(time - k * o.gap, n);
        const [x, y, z, depth] = at(p[0] * o.lift, p[1] * o.lift, p[2] * o.lift);
        dots.push({
          x, y, z,
          r: (o.rBase * 0.5 + o.rHead * fade * fade + o.rDepth * 0.6 * depth) * rs,
          white: 0.5 - 0.42 * depth - 0.1 * fade,
          a: fade * (0.4 + 0.6 * depth),
        });
      }
    }
    return dots;
  },
});
