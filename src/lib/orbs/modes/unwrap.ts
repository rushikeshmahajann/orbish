import { angleDelta, clamp01, defineOrb, latLonSphere, makeProjector, resolutionScale, smoothstep } from "../core";

// globe → unroll → flat map → roll back up
const GLOBE = 1.4, UNROLL = 0.9, FLAT = 1.0, ROLL = 0.9, CYCLE = GLOBE + UNROLL + FLAT + ROLL;

function flatness(time: number) {
  const t = time % CYCLE;
  if (t < GLOBE) return 0;
  if (t < GLOBE + UNROLL) return smoothstep((t - GLOBE) / UNROLL);
  if (t < GLOBE + UNROLL + FLAT) return 1;
  return 1 - smoothstep((t - GLOBE - UNROLL - FLAT) / ROLL);
}

/** mapping → the spinning globe peels open into a flat, scrolling map, then wraps back up */
export const unwrap = defineOrb({
  defaults: { latRings: 15, lonDensity: 36, width: 1.25, height: 0.62, rBase: 0.6, rDepth: 1.7, inkFar: 0.62, inkSpan: 0.54, rsPow: 0.6, rMin: 0.3 },
  scaling: { pairs: [["latRings", "lonDensity"]], radius: ["rBase", "rDepth"] },
  tuning: {
    64: { speed: 1.2, count: 0.5, size: 1.05 },
    20: { speed: 1.4, count: 0.13, size: 1.8 },
  },
  dots(size, time, o) {
    const c = size / 2, R = (c * 0.88) / o.width;
    const yaw = time * 0.4;
    const project = makeProjector(yaw, 0.3, c, c, R);
    const rs = resolutionScale(size, o.rsPow);
    const b = flatness(time);
    return latLonSphere(o.latRings, o.lonDensity).map((p) => {
      const [sx, sy, sz] = project(p.x, p.y, p.z);
      // map coordinates in view space: u = 0 is the meridian currently facing us
      const u = angleDelta(p.lon - yaw, Math.PI / 2);
      const mx = c - (u / Math.PI) * o.width * R;
      const my = c - (Math.asin(p.y) / (Math.PI / 2)) * o.height * R;
      const x = sx + (mx - sx) * b, y = sy + (my - sy) * b;
      const z = sz + (Math.cos(u) * 0.2 - sz) * b;
      const depth = clamp01(((sz + 1) / 2) * (1 - b) + 0.75 * b);
      const seam = smoothstep(clamp01((Math.abs(u) - 2.6) / 0.5)); // hide the wrap-around seam on the map
      return {
        x, y, z,
        r: (o.rBase + o.rDepth * depth) * rs,
        white: o.inkFar - o.inkSpan * depth,
        a: 1 - b * seam,
      };
    });
  },
});
