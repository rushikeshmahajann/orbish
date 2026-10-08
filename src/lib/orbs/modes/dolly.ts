import { defineOrb, latLonSphere, makeProjector, resolutionScale } from "../core";

/**
 * zooming → a real perspective camera dolly-zooms: it rushes in while the lens widens to keep the
 * outline fixed, so the near side bulges like a fisheye and flattens back out.
 */
export const dolly = defineOrb({
  defaults: { latRings: 15, lonDensity: 40, near: 1.3, far: 7, rBase: 0.6, rDepth: 1.4, inkFar: 0.62, inkSpan: 0.54, rsPow: 0.6, rMin: 0.3 },
  scaling: { pairs: [["latRings", "lonDensity"]], radius: ["rBase", "rDepth"] },
  tuning: {
    64: { speed: 1, count: 0.42, size: 1.05 },
    20: { speed: 1, count: 0.11, size: 1.8 },
  },
  dots(size, time, o) {
    const c = size / 2, R = c * 0.84;
    const view = makeProjector(time * 0.3, 0.3, 0, 0, 1); // view space, unit sphere
    const rs = resolutionScale(size, o.rsPow);
    const D = o.near + (o.far - o.near) * (0.5 + 0.5 * Math.sin(time * 0.7)) ** 2; // camera distance
    const f = Math.sqrt(D * D - 1); // focal length that keeps the silhouette radius at exactly 1
    return latLonSphere(o.latRings, o.lonDensity).map((p) => {
      const [vx, vyDown, vz] = view(p.x, p.y, p.z);
      const k = f / (D - vz);
      const depth = (vz + 1) / 2;
      return {
        x: c + vx * k * R,
        y: c + vyDown * k * R,
        z: vz,
        r: (o.rBase + o.rDepth * depth) * Math.min(2.2, Math.max(0.5, k)) * rs,
        white: o.inkFar - o.inkSpan * depth,
      };
    });
  },
});
