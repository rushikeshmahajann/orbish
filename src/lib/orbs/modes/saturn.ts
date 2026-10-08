import { defineOrb, hash, latLonSphere, makeProjector, resolutionScale, rotateX, withDepth, type Dot } from "../core";

/** exploring → a tilted planet inside a textured ring; inner lanes orbit faster */
export const saturn = defineOrb({
  defaults: {
    latRings: 13, lonDensity: 34, planet: 0.58, lanes: 4, laneDots: 64, ringIn: 0.8, ringOut: 1.1, tilt: 0.42,
    rBase: 0.6, rDepth: 1.6, rRing: 0.5, inkFar: 0.62, inkSpan: 0.54, rsPow: 0.6, rMin: 0.3,
  },
  scaling: { pairs: [["latRings", "lonDensity"], ["lanes", "laneDots"]], radius: ["rBase", "rDepth", "rRing"] },
  tuning: {
    64: { speed: 1.4, count: 0.4, size: 1.05 },
    20: { speed: 1.6, count: 0.12, size: 1.8 },
  },
  dots(size, time, o) {
    const c = size / 2;
    const project = makeProjector(time * 0.25, 0.3, c, c, (c * 0.9) / o.ringOut);
    const atPlanet = withDepth(project, o.planet), atRing = withDepth(project, o.ringOut);
    const rs = resolutionScale(size, o.rsPow);
    const dots: Dot[] = [];
    for (const p of latLonSphere(o.latRings, o.lonDensity)) {
      const [x, y, z, depth] = atPlanet(...rotateX([p.x * o.planet, p.y * o.planet, p.z * o.planet], o.tilt));
      dots.push({ x, y, z, r: (o.rBase + o.rDepth * depth) * rs, white: o.inkFar - o.inkSpan * depth });
    }
    for (let l = 0; l < o.lanes; l++) {
      const rad = o.ringIn + ((o.ringOut - o.ringIn) * l) / Math.max(1, o.lanes - 1);
      const spin = time * (0.5 - 0.08 * l);
      for (let k = 0; k < o.laneDots; k++) {
        const ang = (k / o.laneDots) * 2 * Math.PI + spin;
        const [x, y, z, depth] = atRing(...rotateX([Math.cos(ang) * rad, 0, Math.sin(ang) * rad], o.tilt));
        const texture = 0.55 + 0.45 * hash(l * 97 + k, 3.3); // dusty, uneven ring
        dots.push({ x, y, z, r: (o.rRing + 0.9 * depth) * rs, white: 0.72 - 0.45 * depth, a: texture * (0.3 + 0.7 * depth) });
      }
    }
    return dots;
  },
});
