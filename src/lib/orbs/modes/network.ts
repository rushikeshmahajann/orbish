import { defineOrb, fibonacciSphere, hash, makeProjector, resolutionScale, type Dot, type Vec3 } from "../core";

/** Point `u` (0..1) along the great circle from a to b. */
function slerp(a: Vec3, b: Vec3, u: number): Vec3 {
  const cos = Math.max(-1, Math.min(1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2]));
  const w = Math.acos(cos), s = Math.sin(w) || 1;
  const ka = Math.sin((1 - u) * w) / s, kb = Math.sin(u * w) / s;
  return [a[0] * ka + b[0] * kb, a[1] * ka + b[1] * kb, a[2] * ka + b[2] * kb];
}

/** connecting → nodes on a faint sphere, linked by arcs that carry travelling pulses */
export const network = defineOrb({
  defaults: { nodes: 9, ghostN: 130, arcDots: 14, lift: 0.14, rBase: 0.6, rDepth: 1.5, rNode: 1.6, rPulse: 1.2, rsPow: 0.6, rMin: 0.3 },
  scaling: { linear: ["ghostN", "arcDots"], radius: ["rBase", "rDepth", "rNode", "rPulse"] },
  tuning: {
    64: { speed: 1.4, count: 0.6, size: 1 },
    20: { speed: 1.6, count: 0.2, size: 1.8, extra: { nodes: 6 } },
  },
  dots(size, time, o) {
    const c = size / 2, R = c * 0.74;
    const project = makeProjector(time * 0.35, 0.4, c, c, R);
    const rs = resolutionScale(size, o.rsPow);
    const maxMag = 1 + o.lift;
    const dots: Dot[] = [];
    const push = (p: Vec3, r: number, white: number, a: number) => {
      const [x, y, z] = project(p[0], p[1], p[2]);
      const depth = Math.max(0, Math.min(1, (z / maxMag + 1) / 2));
      dots.push({ x, y, z, r: r * (0.5 + depth) * rs, white: white - 0.4 * depth, a: a * (0.45 + 0.55 * depth) });
    };

    for (let i = 0; i < o.ghostN; i++) push(fibonacciSphere(i, o.ghostN), 0.8, 0.95, 0.35);

    // scattered node positions (fixed; the whole sphere rotates)
    const nodes = Array.from({ length: o.nodes }, (_, i): Vec3 => {
      const y = hash(i, 4.4) * 1.7 - 0.85, lon = hash(i, 9.1) * 2 * Math.PI, r = Math.sqrt(1 - y * y);
      return [r * Math.cos(lon), y, r * Math.sin(lon)];
    });
    const glow = new Array<number>(o.nodes).fill(0);

    for (let i = 0; i < o.nodes; i++) {
      for (const step of [1, 3]) {
        const j = (i + step) % o.nodes, a = nodes[i], b = nodes[j];
        const at = (u: number): Vec3 => {
          const p = slerp(a, b, u), h = 1 + o.lift * Math.sin(Math.PI * u); // arch off the surface
          return [p[0] * h, p[1] * h, p[2] * h];
        };
        for (let k = 1; k < o.arcDots; k++) push(at(k / o.arcDots), 0.55, 0.75, 0.55);
        // pulse travelling i → j with a short fading tail
        const u = (time * (0.3 + 0.25 * hash(i * 5 + step, 2.7)) + hash(i * 5 + step, 6.3)) % 1;
        for (let k = 0; k < 4; k++) {
          const uk = u - k * 0.035;
          if (uk > 0) push(at(uk), o.rPulse * (1 - k * 0.2), 0.3 + k * 0.1, 1 - k * 0.22);
        }
        glow[j] = Math.max(glow[j], Math.exp(-((1 - u) ** 2) / 0.004));
      }
    }
    nodes.forEach((p, i) => push(p, o.rNode + 1.2 * glow[i], 0.4 - 0.25 * glow[i], 1));
    return dots;
  },
});
