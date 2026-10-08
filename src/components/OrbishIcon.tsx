import { ThinkingOrb } from "@/lib/orbs";
import { cn } from "@/lib/utils";

/**
 * PLACEHOLDER brand mark — swap for the real orbish logo when it exists.
 *
 * Until then: the house bezel tile (the same .custom-button surface as the
 * package switcher) holding a small live orb. The tile's
 * 20.3125% radius matches the soonish app icon, so the real mark can drop into
 * the same footprint. `size` is the tile; the orb takes ~72% of it.

 */
export function OrbishIcon({ size = 40, className }: { size?: number; className?: string }) {
  const orb = Math.round(size * 0.72);
  return (
    <span
      role="img"
      aria-label="orbish"
      className={cn("custom-button inline-grid shrink-0 place-items-center", className)}
      style={{
        width: size,
        height: size,
        borderRadius: "20.3125%",
        background: "radial-gradient(circle at 50% 35%, oklch(0.269 0 0) 0%, oklch(0.205 0 0) 55%, oklch(0.168 0 0) 100%)",
      }}
    >
      <ThinkingOrb mode="globe" size={orb} theme="dark" aria-hidden className="block" />
    </span>
  );
}
