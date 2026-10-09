"use client";

import { ORB_STATES, ShimmerText, ThinkingOrb, type OrbState, type ThinkingOrbProps } from "@/lib/orbs";

type LiveOrbProps = Pick<ThinkingOrbProps, "color" | "speed" | "dotScale" | "density" | "params" | "theme" | "mode" | "paused"> & {
  state: OrbState;
  /** Pixel size, as written in the example. */
  size?: number;
  /** Small mono caption under the status line, e.g. the prop value on show. */
  label?: string;
  /** Status line beside the orb. Defaults to the state's own label. */
  message?: string;
};

/**
 * One live orb on an Example's preview panel, laid out like the landing Usage
 * preview: the orb, its shimmering status line beside it, and a mono caption
 * underneath. ThinkingOrb pauses itself off-screen, so a page of these costs
 * nothing until scrolled to.
 */
export function LiveOrb({ state, size = 48, label, message, theme = "dark", ...orb }: LiveOrbProps) {
  // On a light surface the text goes dark. data-theme also flips the shimmer
  // highlight (shimmer.css) from white to dark ink, so it shows on white.
  const light = theme === "light";
  return (
    <div data-theme={light ? "light" : undefined} className="flex items-center gap-4 px-6 py-3">
      <ThinkingOrb state={state} size={size} theme={theme} {...orb} />
      <div className="min-w-0">
        <ShimmerText
          className={`block font-display text-base font-medium tracking-tight whitespace-nowrap ${light ? "text-black/45" : "text-white/30"}`}
        >
          {message ?? ORB_STATES[state].label}
        </ShimmerText>
        {label && <p className={`truncate font-mono text-[11px] ${light ? "text-black/60" : "text-white/45"}`}>{label}</p>}
      </div>
    </div>
  );
}

/** Two-column grid of LiveOrbs, for an Example's preview side. */
export function LiveOrbGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 items-center gap-x-3 gap-y-4 sm:grid-cols-2">{children}</div>;
}
