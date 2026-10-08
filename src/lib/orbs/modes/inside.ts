import { defineOrb, latLonSphere, makeProjector, resolutionScale } from "../core";

/**
 * immersing → the camera sits at the centre looking out: the whole sky is squeezed into a disc
 * (what is ahead is at the middle, what is behind is at the rim), and the dome wheels around you.
 */
export const inside = defineOrb({
  defaults: { latRings: 17, lonDensity: 44, stripes: 8, rBase: 0.5, rFront: 1.9, rsPow: 0.6, rMin: 0.3 },
  scaling: { pairs: [["latRings", "lonDensity"]], radius: ["rBase", "rFront"] },
  tuning: {
    64: { speed: 1, count: 0.5, size: 1.05 },
    20: { speed: 1, count: 0.14, size: 1.7, extra: { stripes: 5 } },
  },
  dots(size, time, o) {
    const c = size / 2, R = c * 0.86;
    const view = makeProjector(time * 0.35, 0.5 * Math.sin(time * 0.3), 0, 0, 1); // just the rotation
    const rs = resolutionScale(size, o.rsPow);
    return latLonSphere(o.latRings, o.lonDensity).map((p) => {
      const [vx, vyDown, vz] = view(p.x, p.y, p.z);
      const ahead = Math.max(-1, Math.min(1, vz));
      const theta = Math.acos(ahead); // 0 = straight ahead, π = directly behind
      const rim = theta / Math.PI;
      const len = Math.hypot(vx, vyDown) || 1;
      const mark = Math.cos(o.stripes * p.lon) > 0.75 ? 1 : 0; // meridian stripes make the wheeling visible
      return {
        x: c + (vx / len) * rim * R,
        y: c + (vyDown / len) * rim * R,
        z: ahead,
        r: (o.rBase + o.rFront * (1 - rim) ** 1.5 + 0.3 * mark) * rs,
        white: 0.12 + 0.6 * rim - 0.1 * mark,
        a: mark ? 1 : 0.45 + 0.55 * (1 - rim),
      };
    });
  },
});
