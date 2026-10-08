import { defineOrb, fibonacciSphere, hash, makeProjector, resolutionScale, rotateX, rotateY, withDepth, type Dot, type Vec3 } from "../core";

/** delegating → small dotted moons on inclined orbits circle a central planet, trailing dust */
export const moons = defineOrb({
  defaults: {
    dots: 260, moonDots: 36, moons: 3, planet: 0.55, orbit: 0.88, moonR: 0.13, trail: 8,
    rBase: 0.6, rDepth: 1.6, rMoon: 0.45, inkFar: 0.62, inkSpan: 0.54, rsPow: 0.6, rMin: 0.3,
  },
  scaling: { linear: ["dots", "moonDots", "trail"], radius: ["rBase", "rDepth", "rMoon"] },
  tuning: {
    64: { speed: 1.4, count: 0.65, size: 1 },
    20: { speed: 1.6, count: 0.2, size: 1.8, extra: { moons: 2 } },
  },
  dots(size, time, o) {
    const c = size / 2, maxMag = o.orbit + o.moonR;
    const project = makeProjector(time * 0.15, 0.35, c, c, (c * 0.88) / maxMag);
    const atPlanet = withDepth(project, o.planet), atOrbit = withDepth(project, maxMag);
    const rs = resolutionScale(size, o.rsPow);
    const dots: Dot[] = [];
    for (let i = 0; i < o.dots; i++) {
      const g = fibonacciSphere(i, o.dots);
      const [x, y, z, depth] = atPlanet(g[0] * o.planet, g[1] * o.planet, g[2] * o.planet);
      dots.push({ x, y, z, r: (o.rBase + o.rDepth * depth) * rs, white: o.inkFar - o.inkSpan * depth });
    }
    for (let m = 0; m < o.moons; m++) {
      const inc = (hash(m, 1.1) - 0.5) * 1.4, node = (m / o.moons) * 2 * Math.PI;
      const speed = 0.7 + 0.5 * hash(m, 2.2);
      const center = (th: number): Vec3 => rotateY(rotateX([Math.cos(th) * o.orbit, 0, Math.sin(th) * o.orbit], inc), node);
      const th = time * speed + m * 2.1;
      const [cx, cy, cz] = center(th);
      for (let i = 0; i < o.moonDots; i++) {
        const g = fibonacciSphere(i, o.moonDots);
        const [x, y, z, depth] = atOrbit(cx + g[0] * o.moonR, cy + g[1] * o.moonR, cz + g[2] * o.moonR);
        dots.push({ x, y, z, r: (o.rMoon + 1.1 * depth) * rs, white: 0.5 - 0.42 * depth });
      }
      for (let k = 1; k <= o.trail; k++) {
        const [x, y, z, depth] = atOrbit(...center(th - k * 0.08));
        dots.push({ x, y, z, r: (o.rMoon * 0.8 + 0.5 * depth) * rs, white: 0.7 - 0.3 * depth, a: (1 - k / (o.trail + 1)) * 0.6 });
      }
    }
    return dots;
  },
});
