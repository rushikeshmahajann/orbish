import { defineOrb, hash, latLonSphere, makeProjector, resolutionScale, type Vec3 } from "../core";

type Move = { axis: number; lo: number; hi: number; ang: number };
type Progress = { amount: number[]; active: number };

const movesCache = new Map<number, Move[]>();

/** Fixed pseudo-random "turns": an axis, a coordinate slice [lo,hi), and ±90°. */
function buildMoves(count: number): Move[] {
  const cached = movesCache.get(count);
  if (cached) return cached;
  const moves: Move[] = [];
  for (let i = 0; i < count; i++) {
    const axis = Math.min(2, Math.floor(hash(i, 2.3) * 3)); // 0=x, 1=y, 2=z
    const lo = -1 + 0.5 * Math.min(3, Math.floor(hash(i, 5.9) * 4));
    const dir = hash(i, 7.7) < 0.5 ? 1 : -1;
    moves.push({ axis, lo, hi: lo + 0.5, ang: (dir * Math.PI) / 2 });
  }
  movesCache.set(count, moves);
  return moves;
}

/** Scramble → unscramble → rest loop. Returns each move's applied fraction (0..1). */
function progress(time: number, count: number, perMove: number, pause: number): Progress {
  const cycle = 2 * count * perMove + pause;
  const t = time % cycle;
  const amount = new Array<number>(count).fill(0);
  let active = -1;
  if (t < 2 * count * perMove) {
    const step = Math.floor(t / perMove);
    const frac = (t - step * perMove) / perMove;
    const eased = 1 - (1 - Math.min(1, frac / 0.7)) ** 3;
    if (step < count) {
      for (let k = 0; k < step; k++) amount[k] = 1;
      amount[step] = eased;
      active = step;
    } else {
      const k = 2 * count - 1 - step;
      for (let j = 0; j < k; j++) amount[j] = 1;
      amount[k] = 1 - eased;
      active = k;
    }
  }
  return { amount, active };
}

/** Apply all currently active slice turns to one point. */
function applyTurns(point: Vec3, moves: Move[], prog: Progress): [number, number, number, boolean] {
  let [x, y, z] = point;
  let inActive = false;
  for (let i = 0; i < moves.length; i++) {
    if (prog.amount[i] <= 0) continue;
    const m = moves[i];
    const coord = m.axis === 0 ? x : m.axis === 1 ? y : z;
    if (coord < m.lo || coord >= m.hi) continue;
    if (i === prog.active) inActive = true;
    const ang = m.ang * prog.amount[i];
    const c = Math.cos(ang), s = Math.sin(ang);
    if (m.axis === 0) { const t = y * c - z * s; z = y * s + z * c; y = t; }
    else if (m.axis === 1) { const t = x * c + z * s; z = -x * s + z * c; x = t; }
    else { const t = x * c - y * s; y = x * s + y * c; x = t; }
  }
  return [x, y, z, inActive];
}

/** solving → sphere whose slices rotate like a Rubik's cube */
export const rubik = defineOrb({
  defaults: { latRings: 15, lonDensity: 40, moveCount: 14, rBase: 0.6, rDepth: 1.7, rActive: 0.3, inkFar: 0.62, inkSpan: 0.54, rsPow: 0.6, rMin: 0.3 },
  scaling: { pairs: [["latRings", "lonDensity"]], radius: ["rBase", "rDepth", "rActive"] },
  tuning: {
    64: { speed: 1.82, count: 0.35, size: 1.05 },
    20: { speed: 1.95, count: 0.088, size: 1.9 },
  },
  dots(size, time, o) {
    const c = size / 2, R = c * 0.82;
    const project = makeProjector(time * 0.55, 0.35 + 0.1 * Math.sin(time * 0.9), c, c, R);
    const rs = resolutionScale(size, o.rsPow);
    const moves = buildMoves(o.moveCount);
    const prog = progress(time, o.moveCount, 0.42, 1.2);
    return latLonSphere(o.latRings, o.lonDensity).map((p) => {
      const [rx, ry, rz, active] = applyTurns([p.x, p.y, p.z], moves, prog);
      const [x, y, z] = project(rx, ry, rz);
      const depth = (z + 1) / 2;
      return {
        x, y, z,
        r: (o.rBase + o.rDepth * depth + (active ? o.rActive : 0)) * rs,
        white: o.inkFar - o.inkSpan * depth - (active ? 0.14 : 0),
      };
    });
  },
});
