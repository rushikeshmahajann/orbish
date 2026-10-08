import { defineOrb, makeProjector, resolutionScale, smoothstep, withDepth, type Dot, type Vec3 } from "../core";

const PHI = (1 + Math.sqrt(5)) / 2;
const ICO_V: Vec3[] = (
  [[-1, PHI, 0], [1, PHI, 0], [-1, -PHI, 0], [1, -PHI, 0], [0, -1, PHI], [0, 1, PHI], [0, -1, -PHI], [0, 1, -PHI], [PHI, 0, -1], [PHI, 0, 1], [-PHI, 0, -1], [-PHI, 0, 1]] as Vec3[]
).map((v) => { const l = Math.hypot(...v); return [v[0] / l, v[1] / l, v[2] / l]; });
const ICO_F = [[0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11], [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8], [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9], [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1]];

type Geo = { verts: Vec3[]; edges: [Vec3, Vec3][] };
const geoCache = new Map<number, Geo>();

/** Geodesic sphere of frequency f: every icosahedron face cut into f² triangles, pushed onto the sphere. */
function geodesic(f: number): Geo {
  const hit = geoCache.get(f);
  if (hit) return hit;
  const verts = new Map<string, Vec3>(), edges = new Map<string, [Vec3, Vec3]>();
  const key = (p: Vec3) => p.map((v) => v.toFixed(4)).join(",");
  const put = (p: Vec3) => { const k = key(p); if (!verts.has(k)) verts.set(k, p); return k; };
  for (const [a, b, c] of ICO_F) {
    const A = ICO_V[a], B = ICO_V[b], C = ICO_V[c];
    const grid = (i: number, j: number): Vec3 => {
      const k = f - i - j, p: Vec3 = [A[0] * i + B[0] * j + C[0] * k, A[1] * i + B[1] * j + C[1] * k, A[2] * i + B[2] * j + C[2] * k];
      const l = Math.hypot(...p);
      return [p[0] / l, p[1] / l, p[2] / l];
    };
    for (let i = 0; i <= f; i++)
      for (let j = 0; j <= f - i; j++) {
        const p = grid(i, j), kp = put(p);
        for (const [di, dj] of [[1, 0], [0, 1], [1, -1]]) {
          const ni = i + di, nj = j + dj;
          if (ni < 0 || nj < 0 || ni + nj > f) continue;
          const q = grid(ni, nj), kq = put(q);
          edges.set([kp, kq].sort().join("|"), [p, q]);
        }
      }
  }
  const geo = { verts: [...verts.values()], edges: [...edges.values()] };
  geoCache.set(f, geo);
  return geo;
}

const LEVELS = [1, 2, 4], HOLD = 1.2, FADE = 0.8, STEP = HOLD + FADE;

/** detailing → a geodesic dome that subdivides its triangles finer and finer, then coarsens again */
export const tessellate = defineOrb({
  defaults: { maxLevel: 2, edgeDots: 5, rVert: 1.4, rEdge: 0.5, rDepth: 1.2, rsPow: 0.6, rMin: 0.3 },
  scaling: { radius: ["rVert", "rEdge", "rDepth"] },
  tuning: {
    64: { speed: 1, count: 1, size: 1 },
    20: { speed: 1, count: 1, size: 1.6, extra: { maxLevel: 1, edgeDots: 2 } },
  },
  dots(size, time, o) {
    const c = size / 2;
    const at = withDepth(makeProjector(time * 0.3, 0.4, c, c, c * 0.82));
    const rs = resolutionScale(size, o.rsPow);
    const seq = [...LEVELS.slice(0, o.maxLevel + 1), ...LEVELS.slice(1, o.maxLevel).reverse()]; // 1,2,4,2
    const t = time % (seq.length * STEP), i = Math.floor(t / STEP), w = t - i * STEP;
    const b = w < HOLD ? 0 : smoothstep((w - HOLD) / FADE);
    const dots: Dot[] = [];
    const draw = (f: number, alpha: number) => {
      if (alpha < 0.03) return;
      const { verts, edges } = geodesic(f), per = Math.max(1, Math.round(o.edgeDots / f));
      for (const v of verts) {
        const [x, y, z, depth] = at(...v);
        dots.push({ x, y, z, r: (o.rVert / Math.sqrt(f) + o.rDepth * depth) * rs, white: 0.4 - 0.3 * depth, a: alpha });
      }
      for (const [p, q] of edges)
        for (let k = 1; k <= per; k++) {
          const u = k / (per + 1), m: Vec3 = [p[0] + (q[0] - p[0]) * u, p[1] + (q[1] - p[1]) * u, p[2] + (q[2] - p[2]) * u];
          const l = Math.hypot(...m);
          const [x, y, z, depth] = at(m[0] / l, m[1] / l, m[2] / l);
          dots.push({ x, y, z, r: (o.rEdge + 0.7 * depth) * rs, white: 0.7 - 0.35 * depth, a: alpha * (0.4 + 0.6 * depth) });
        }
    };
    draw(seq[i], 1 - b);
    draw(seq[(i + 1) % seq.length], b);
    return dots;
  },
});
