import { defineOrb, latLonSphere, makeProjector, resolutionScale, rotateAxis, type Vec3 } from "../core";

/** Angular speed of the cloud band at height y: neighbouring bands shear past each other. */
const band = (y: number) => 0.25 + 0.55 * Math.sin(y * 5.5);

/** streaming → cloud bands flow at different speeds while a great spot swirls in the south */
export const jupiter = defineOrb({
  defaults: { latRings: 19, lonDensity: 46, spot: 0.42, spotY: -0.38, swirl: 2.6, rBase: 0.6, rDepth: 1.7, rSpot: 0.7, inkFar: 0.62, inkSpan: 0.54, rsPow: 0.6, rMin: 0.3 },
  scaling: { pairs: [["latRings", "lonDensity"]], radius: ["rBase", "rDepth", "rSpot"] },
  tuning: {
    64: { speed: 1.4, count: 0.38, size: 1.1 },
    20: { speed: 1.6, count: 0.1, size: 1.8 },
  },
  dots(size, time, o) {
    const c = size / 2;
    const project = makeProjector(0.3, 0.32, c, c, c * 0.82); // no global spin: the bands carry the motion
    const rs = resolutionScale(size, o.rsPow);
    const sl = time * band(o.spotY), scl = Math.sqrt(1 - o.spotY * o.spotY);
    const S: Vec3 = [Math.cos(sl) * scl, o.spotY, Math.sin(sl) * scl];
    return latLonSphere(o.latRings, o.lonDensity).map((p) => {
      const cl = Math.hypot(p.x, p.z), lon = p.lon + time * band(p.y);
      let q: Vec3 = [cl * Math.cos(lon), p.y, cl * Math.sin(lon)];
      const d = Math.acos(Math.max(-1, Math.min(1, q[0] * S[0] + q[1] * S[1] + q[2] * S[2])));
      let swirl = 0;
      if (d < o.spot) {
        swirl = 1 - d / o.spot; // 0 at the rim, so dots enter the vortex smoothly
        q = rotateAxis(q, S, swirl * swirl * o.swirl + time * 1.5 * swirl);
      }
      const [x, y, z] = project(...q);
      const depth = (z + 1) / 2;
      const stripe = 0.5 + 0.5 * Math.sin(p.y * 9);
      return {
        x, y, z,
        r: (o.rBase + o.rDepth * depth + o.rSpot * swirl) * rs,
        white: o.inkFar - o.inkSpan * depth + 0.14 * stripe - 0.22 * swirl,
      };
    });
  },
});
