"use client";

import SideRays from "@/components/SideRays";

// The tile surface (bg-white/2) over the page's oklch(0.145 0 0), as a solid
// colour, so the scrim below can fade into it.
const TILE_BG = "oklch(0.168 0 0)";
const tileWithAlpha = (alpha: number) => TILE_BG.replace(")", ` / ${alpha})`);

/**
 * "Playground — coming soon", a full-width feature card. Where soonish runs its
 * slats shader, this runs the hero's light rays, so the card belongs to the
 * same world as the landing page. SideRays pauses off-screen and honours
 * reduced motion.
 */
export function PlaygroundCard() {
  return (
    <div className="relative isolate overflow-hidden rounded-md sm:col-span-2" style={{ background: TILE_BG }}>
      <div aria-hidden="true" className="absolute inset-0 -z-10">
        <SideRays rayColor1="#ffffff" rayColor2="#9a9a9a" opacity={0.5} />
      </div>
      {/* Scrim: near-solid under the copy, fading out so the rays show on the right. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
        style={{ background: `linear-gradient(90deg, ${TILE_BG} 0%, ${tileWithAlpha(0.95)} 52%, ${tileWithAlpha(0)} 90%)` }}
      />
      <div className="pointer-events-none flex min-h-56 max-w-md flex-col justify-end gap-2 p-6">
        <span className="flex items-center gap-2 font-mono text-xs text-white/40">
          <span aria-hidden="true" className="size-1.5 rounded-full" style={{ background: "var(--brand)", boxShadow: "0 0 6px var(--brand)" }} />
          Coming soon
        </span>
        <p className="font-display text-xl font-medium tracking-tight text-white">Playground</p>
        <p className="text-sm leading-6 text-white/55">Tune any orb&apos;s settings live, then copy the code.</p>
      </div>
    </div>
  );
}
