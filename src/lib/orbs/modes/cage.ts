import { defineOrb, fibonacciSphere, makeProjector, resolutionScale, rotateX, rotateY, withDepth, type Dot, type Vec3 } from "../core";

const VERTS: Vec3[] = [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]];
// octahedron edges: every vertex pair except opposites
const EDGES = VERTS.flatMap((_, i) => VERTS.map((_, j) => [i, j]).filter(([a, b]) => a < b && Math.floor(a / 2) !== Math.floor(b / 2)));

/** securing → a breathing sphere held inside a counter-rotating octahedral cage */
export const cage = defineOrb({
  defaults: { dots: 220, core: 0.55, edgeDots: 9, rBase: 0.6, rDepth: 1.6, rVert: 1.3, rEdge: 0.5, inkFar: 0.62, inkSpan: 0.54, rsPow: 0.6, rMin: 0.3 },
  scaling: { linear: ["dots", "edgeDots"], radius: ["rBase", "rDepth", "rVert", "rEdge"] },
  tuning: {
    64: { speed: 1.3, count: 0.7, size: 1 },
    20: { speed: 1.5, count: 0.22, size: 1.8 },
  },
  dots(size, time, o) {
    const c = size / 2;
    const project = makeProjector(time * 0.3, 0.35, c, c, c * 0.84);
    const atCore = withDepth(project, o.core), atCage = withDepth(project);
    const rs = resolutionScale(size, o.rsPow);
    const breathe = o.core * (1 + 0.04 * Math.sin(time * 2.4));
    const dots: Dot[] = [];
    for (let i = 0; i < o.dots; i++) {
      const g = fibonacciSphere(i, o.dots);
      const [x, y, z, depth] = atCore(g[0] * breathe, g[1] * breathe, g[2] * breathe);
      dots.push({ x, y, z, r: (o.rBase + o.rDepth * depth) * rs, white: o.inkFar - o.inkSpan * depth });
    }
    const orient = (v: Vec3) => rotateY(rotateX(v, 0.6 + 0.3 * Math.sin(time * 0.5)), -time * 0.9);
    const verts = VERTS.map(orient);
    for (const [a, b] of EDGES) {
      const va = verts[a], vb = verts[b];
      for (let k = 1; k < o.edgeDots; k++) {
        const f = k / o.edgeDots;
        const [x, y, z, depth] = atCage(va[0] + (vb[0] - va[0]) * f, va[1] + (vb[1] - va[1]) * f, va[2] + (vb[2] - va[2]) * f);
        dots.push({ x, y, z, r: (o.rEdge + 0.8 * depth) * rs, white: 0.68 - 0.4 * depth, a: 0.4 + 0.6 * depth });
      }
    }
    for (const v of verts) {
      const [x, y, z, depth] = atCage(...v);
      dots.push({ x, y, z, r: (o.rVert + 1.2 * depth) * rs, white: 0.4 - 0.3 * depth });
    }
    return dots;
  },
});
