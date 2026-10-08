import { defineOrb, latLonSphere, makeProjector, resolutionScale, rotateX, withDepth, type Dot, type Vec3 } from "../core";

const ORBIT = 1.28;

/** pinging → a single satellite circles the globe; the ground beneath it glows faintly */
export const satellite = defineOrb({
  defaults: { latRings: 15, lonDensity: 40, trail: 10, rBase: 0.6, rDepth: 1.7, rSat: 1.6, inkFar: 0.62, inkSpan: 0.54, rsPow: 0.6, rMin: 0.3 },
  scaling: { pairs: [["latRings", "lonDensity"]], linear: ["trail"], radius: ["rBase", "rDepth", "rSat"] },
  tuning: {
    64: { speed: 1.3, count: 0.42, size: 1.05 },
    20: { speed: 1.4, count: 0.105, size: 1.8 },
  },
  dots(size, time, o) {
    const c = size / 2;
    const project = makeProjector(time * 0.2, 0.35, c, c, (c * 0.86) / ORBIT);
    const atGlobe = withDepth(project), atSpace = withDepth(project, ORBIT);
    const rs = resolutionScale(size, o.rsPow);
    const orbit = (a: number): Vec3 => rotateX([Math.cos(a), 0, Math.sin(a)], 0.6);
    const th = time * 1.4, sat = orbit(th);
    const dots: Dot[] = [];
    for (const p of latLonSphere(o.latRings, o.lonDensity)) {
      const glow = Math.exp(-(1 - (p.x * sat[0] + p.y * sat[1] + p.z * sat[2])) / 0.04);
      const [x, y, z, depth] = atGlobe(p.x, p.y, p.z);
      dots.push({ x, y, z, r: (o.rBase + o.rDepth * depth + 0.6 * glow) * rs, white: o.inkFar - o.inkSpan * depth - 0.15 * glow });
    }
    for (let k = 0; k <= o.trail; k++) {
      const q = orbit(th - k * 0.06), fade = 1 - k / (o.trail + 1);
      const [x, y, z, depth] = atSpace(q[0] * ORBIT, q[1] * ORBIT, q[2] * ORBIT);
      dots.push({ x, y, z, r: (k ? 0.5 + 0.5 * fade : o.rSat) * (0.7 + 0.6 * depth) * rs, white: 0.3 - 0.25 * depth, a: k ? fade * 0.6 : 1 });
    }
    return dots;
  },
});
