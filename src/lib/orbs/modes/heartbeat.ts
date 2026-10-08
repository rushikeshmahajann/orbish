import { defineOrb, fibonacciSphere, latLonSphere, makeProjector, resolutionScale, withDepth, type Dot } from "../core";

const BEAT = 1.5, REACH = 0.55;

/** A fast-attack, slow-decay kick starting at t0. */
const kick = (t: number, t0: number) => (t < t0 ? 0 : 2.2 * (1 - Math.exp(-(t - t0) * 40)) * Math.exp(-(t - t0) * 9));

/** syncing → lub-dub: the sphere beats twice and rests, each beat sending out a faint shock shell */
export const heartbeat = defineOrb({
  defaults: { latRings: 15, lonDensity: 40, shellDots: 90, base: 0.74, rBase: 0.6, rDepth: 1.7, inkFar: 0.62, inkSpan: 0.54, rsPow: 0.6, rMin: 0.3 },
  scaling: { pairs: [["latRings", "lonDensity"]], linear: ["shellDots"], radius: ["rBase", "rDepth"] },
  tuning: {
    64: { speed: 1, count: 0.4, size: 1.05 },
    20: { speed: 1, count: 0.105, size: 1.8 },
  },
  dots(size, time, o) {
    const c = size / 2, maxMag = o.base + REACH;
    const project = makeProjector(time * 0.25, 0.4, c, c, (c * 0.88) / maxMag);
    const at = withDepth(project, o.base * 1.1);
    const rs = resolutionScale(size, o.rsPow);
    const tp = time % BEAT;
    const env = Math.min(1, kick(tp, 0) + 0.65 * kick(tp, 0.26));
    const rad = o.base * (1 + 0.1 * env);
    const dots: Dot[] = [];
    for (const p of latLonSphere(o.latRings, o.lonDensity)) {
      const [x, y, z, depth] = at(p.x * rad, p.y * rad, p.z * rad);
      dots.push({
        x, y, z,
        r: (o.rBase + o.rDepth * depth) * (1 + 0.35 * env) * rs,
        white: o.inkFar - o.inkSpan * depth - 0.15 * env,
      });
    }
    const age = tp / BEAT; // shell launched by the first beat drifts out and fades
    const shellR = o.base + age * REACH;
    const atShell = withDepth(project, shellR);
    for (let i = 0; i < o.shellDots; i++) {
      const g = fibonacciSphere(i, o.shellDots);
      const [x, y, z, depth] = atShell(g[0] * shellR, g[1] * shellR, g[2] * shellR);
      dots.push({ x, y, z, r: (0.5 + 0.6 * depth) * rs, white: 0.6 - 0.3 * depth, a: 0.5 * (1 - age) ** 2 });
    }
    return dots;
  },
});
