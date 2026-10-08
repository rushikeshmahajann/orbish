import { clamp01, defineOrb, hash, latLonSphere, makeProjector, resolutionScale, rotateZ, smoothstep, sunflower, type Dot, type Vec3 } from "../core";

const POUR = 3.2, FLIP = 0.8, CYCLE = POUR + FLIP;

/** waiting → sand drains from the top cap to the bottom through the middle, then the sphere flips over */
export const hourglass = defineOrb({
  defaults: {
    latRings: 17, lonDensity: 44, stream: 14, surface: 28, fill: 0.9,
    rBase: 0.6, rDepth: 1.7, rSand: 0.6, inkFar: 0.62, inkSpan: 0.54, rsPow: 0.6, rMin: 0.3,
  },
  scaling: { pairs: [["latRings", "lonDensity"]], linear: ["stream", "surface"], radius: ["rBase", "rDepth", "rSand"] },
  tuning: {
    64: { speed: 1, count: 0.42, size: 1.1 },
    20: { speed: 1, count: 0.11, size: 1.8 },
  },
  dots(size, time, o) {
    const c = size / 2;
    const project = makeProjector(time * 0.3, 0.3, c, c, c * 0.82);
    const rs = resolutionScale(size, o.rsPow);
    const n = Math.floor(time / CYCLE), t = time - n * CYCLE;
    const f = Math.min(1, t / POUR); // fraction of sand that has fallen
    const flip = (n + (t > POUR ? smoothstep((t - POUR) / FLIP) : 0)) * Math.PI; // cumulative: no snap on loop
    const up = n % 2 ? -1 : 1; // which model pole is currently on top
    const topLevel = 1 - o.fill * (1 - f), botLevel = -1 + o.fill * f;
    const dots: Dot[] = [];
    const put = (p: Vec3, r: number, rDepth: number, white: number, a: number) => {
      const [x, y, z] = project(...rotateZ(p, flip));
      const depth = clamp01((z + 1) / 2);
      dots.push({ x, y, z, r: (r + rDepth * depth) * rs, white: white - o.inkSpan * depth, a: a * (0.5 + 0.5 * depth) });
    };

    for (const p of latLonSphere(o.latRings, o.lonDensity)) {
      const h = p.y * up;
      const sand = h > topLevel || h < botLevel;
      if (sand) put([p.x, p.y, p.z], o.rBase, o.rDepth, o.inkFar, 1);
      else put([p.x, p.y, p.z], o.rBase * 0.4, o.rDepth * 0.35, o.inkFar + 0.25, 0.35);
    }
    // flat sand surfaces where each pile meets the empty glass
    for (const level of [topLevel, botLevel]) {
      if (Math.abs(level) > 0.97) continue;
      const rad = Math.sqrt(1 - level * level) * 0.95;
      for (let k = 0; k < o.surface; k++) {
        const [dx, dz] = sunflower(k, o.surface);
        put([dx * rad, level * up, dz * rad], o.rSand, o.rDepth * 0.5, o.inkFar + 0.05, 0.85);
      }
    }
    if (f > 0.01 && f < 0.99) {
      for (let k = 0; k < o.stream; k++) {
        const s = (k / o.stream + time * 1.8) % 1;
        const h = topLevel - s * (topLevel - botLevel);
        const jx = (hash(k, 1.1) - 0.5) * 0.04, jz = (hash(k, 2.3) - 0.5) * 0.04;
        put([jx, h * up, jz], o.rSand, o.rDepth * 0.4, o.inkFar - 0.1, 1);
      }
    }
    return dots;
  },
});
