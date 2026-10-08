import GradualBlur from "./GradualBlur";
import SideRays from "./SideRays";
import { DeferredRingField } from "./DeferredRingField";
import { LitWordmark } from "./LitWordmark";
import { cn } from "@/lib/utils";

/** The "orbish" wordmark — Helvetica Neue, white fading to grey. Shared with the footer. */
export const WORDMARK_CLASS =
  "text-center font-display font-normal tracking-tighter bg-linear-to-b/srgb from-white from-[39.13%] to-neutral-400 to-[76.52%] bg-clip-text text-transparent";

/**
 * The hero: the "orbish" wordmark over the dotted cursor field, lit by a
 * sheet of diagonal rays entering along the whole top edge, with a fade and
 * a blur dissolving the bottom edge. The rays canvas and the dots share one
 * light definition (src/lib/rays.ts), so the dots glow where a ray crosses them.
 */
export function WordmarkBand({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative flex h-[60vh] w-full items-center justify-center overflow-hidden",
        className,
      )}
    >
      {/* Fills the box behind the heading; the field's host is 100%/100%,
          so it needs a sized, positioned parent. */}
      <div className="absolute inset-0" aria-hidden="true">
        <DeferredRingField
          density={300}
          dotSize={50}
          speed={5}
          cameraDistance={180}
          ring={{ radius: 12, width: 9, push: 50, turbulence: 100 }}
        />
      </div>
      {/* The rays. .side-rays-container is z-index 3, so this sits above the
          field canvas and below the blur (5) and the heading (10). */}
      <div className="absolute inset-0" aria-hidden="true">
        <SideRays rayColor1="#ffffff" rayColor2="#9a9a9a" opacity={0.55} />
      </div>

      {/* Fade-out: the page background rising over the bottom of the field and
          rays. z-4 sits above the rays (3) and below the blur (5), so the
          blur still softens the seam and the heading stays clear. */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 z-4 h-[45%] bg-linear-to-t from-(--bg) to-transparent"
      />

      {/* Lit by the same rays as the dots: beams crossing the word brighten
          it, the gaps between them dim it. */}
      <LitWordmark
        className={cn("relative z-10 leading-none text-7xl", WORDMARK_CLASS)}
      >
        orbish
      </LitWordmark>

      {/* zIndex 5 keeps this above the rays (z-3) but below the
          heading (z-10), so it smears the background and never the text.
          The component's own default is 1000, which would blur the heading. */}
      <GradualBlur
        target="parent"
        position="bottom"
        height="7rem"
        strength={1}
        saturation={1.5}
        divCount={5}
        curve="bezier"
        exponential
        opacity={1}
        zIndex={5}
      />
    </div>
  );
}
