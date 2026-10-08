import { clamp01, defineOrb, hash, makeProjector, resolutionScale, rotateAxis, type Dot, type Vec3 } from "../core";

/** circulating → dots well up at one point, stream across the whole surface and drain into the opposite point */
export const convection = defineOrb({
  defaults: { dots: 260, flow: 0.16, twist: 1.4, rBase: 0.6, rDepth: 1.7, inkFar: 0.62, inkSpan: 0.54, rsPow: 0.6, rMin: 0.3 },
  scaling: { linear: ["dots"], radius: ["rBase", "rDepth"] },
  tuning: {
    64: { speed: 1, count: 0.7, size: 1.05 },
    20: { speed: 1, count: 0.2, size: 1.8 },
  },
  dots(size, time, o) {
    const c = size / 2;
    const project = makeProjector(0.2, 0.35, c, c, c * 0.82);
    const rs = resolutionScale(size, o.rsPow);
    // the source slowly wanders, so the whole flow pattern tumbles
    const sa = time * 0.12, sb = 0.5 * Math.sin(time * 0.17);
    const S: Vec3 = [Math.cos(sa) * Math.cos(sb), Math.sin(sb), Math.sin(sa) * Math.cos(sb)];
    const U: Vec3 = Math.abs(S[1]) < 0.9 ? [-S[2], 0, S[0]] : [1, 0, 0]; // any vector ⟂ S
    const ul = Math.hypot(...U); U[0] /= ul; U[1] /= ul; U[2] /= ul;
    const dots: Dot[] = [];
    for (let i = 0; i < o.dots; i++) {
      const s = (hash(i, 1.1) + time * o.flow * (0.8 + 0.4 * hash(i, 2.2))) % 1; // 0 at source, 1 at sink
      const lon = hash(i, 3.3) * 2 * Math.PI + s * o.twist; // slight spiral drift
      const p = rotateAxis(rotateAxis(S, U, s * Math.PI), S, lon); // walk down a meridian, then spin around S
      const [x, y, z] = project(...p);
      const depth = (z + 1) / 2;
      const life = clamp01(s * 8) * clamp01((1 - s) * 8); // fade at birth and death
      const speedy = Math.sin(Math.PI * s); // fastest across the equator
      dots.push({ x, y, z, r: (o.rBase + o.rDepth * depth) * (0.7 + 0.5 * speedy) * rs, white: o.inkFar - o.inkSpan * depth, a: life * (0.5 + 0.5 * depth) });
    }
    return dots;
  },
});
