import { defineOrb, hash, latLonSphere, makeProjector, resolutionScale, withDepth, type Dot, type Vec3 } from "../core";

/** learning → sparks rush in from every direction and flash the sphere where they land */
export const absorb = defineOrb({
  defaults: {
    latRings: 13, lonDensity: 34, planet: 0.6, streams: 28, from: 1.3, trail: 4,
    rBase: 0.6, rDepth: 1.6, rSpark: 1, rGlow: 1.3, inkFar: 0.62, inkSpan: 0.54, rsPow: 0.6, rMin: 0.3,
  },
  scaling: { pairs: [["latRings", "lonDensity"]], linear: ["streams"], radius: ["rBase", "rDepth", "rSpark", "rGlow"] },
  tuning: {
    64: { speed: 1.3, count: 0.45, size: 1.05 },
    20: { speed: 1.5, count: 0.14, size: 1.8, extra: { trail: 2 } },
  },
  dots(size, time, o) {
    const c = size / 2;
    const project = makeProjector(time * 0.25, 0.4, c, c, (c * 0.9) / o.from);
    const atPlanet = withDepth(project, o.planet), atSpace = withDepth(project, o.from);
    const rs = resolutionScale(size, o.rsPow);
    const dots: Dot[] = [];
    const hits: { dir: Vec3; arrive: number }[] = [];

    for (let s = 0; s < o.streams; s++) {
      const phase = time * (0.45 + 0.3 * hash(s, 1.7)) + hash(s, 2.9);
      const n = Math.floor(phase), f = phase - n;
      // each spark picks a fresh direction every trip
      const y = hash(s * 31 + n, 4.4) * 2 - 1, lon = hash(s * 31 + n, 5.5) * 2 * Math.PI, r = Math.sqrt(1 - y * y);
      const dir: Vec3 = [r * Math.cos(lon), y, r * Math.sin(lon)];
      const rr = o.from - (o.from - o.planet) * f ** 1.6; // accelerates inward
      hits.push({ dir, arrive: Math.exp(-(((1 - f) / 0.07) ** 2)) });
      for (let k = 0; k <= o.trail; k++) {
        const rk = rr + k * 0.05 * (0.3 + f);
        if (rk > o.from) break;
        const [px, py, pz, depth] = atSpace(dir[0] * rk, dir[1] * rk, dir[2] * rk);
        dots.push({
          x: px, y: py, z: pz,
          r: o.rSpark * (1 - k / (o.trail + 1)) * (0.6 + 0.7 * depth) * rs,
          white: 0.35 + 0.1 * k - 0.25 * depth,
          a: (1 - k / (o.trail + 1)) * Math.min(1, f * 5),
        });
      }
    }
    for (const p of latLonSphere(o.latRings, o.lonDensity)) {
      let glow = 0;
      for (const h of hits) {
        const near = 1 - (p.x * h.dir[0] + p.y * h.dir[1] + p.z * h.dir[2]);
        if (near < 0.08) glow = Math.max(glow, Math.exp(-near / 0.012) * h.arrive);
      }
      const [x, y, z, depth] = atPlanet(p.x * o.planet, p.y * o.planet, p.z * o.planet);
      dots.push({
        x, y, z,
        r: (o.rBase + o.rDepth * depth + o.rGlow * glow) * rs,
        white: o.inkFar - o.inkSpan * depth - 0.25 * glow,
      });
    }
    return dots;
  },
});
