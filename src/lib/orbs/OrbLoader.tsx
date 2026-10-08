"use client";

import { ORB_STATES } from "./config";
import { ShimmerText } from "./ShimmerText";
import { ThinkingOrb, type ThinkingOrbProps } from "./ThinkingOrb";

/** Orb + shimmering status label, laid out inline (small) or stacked (large). */
export function OrbLoader({ label, className = "", ...orb }: ThinkingOrbProps & { label?: string }) {
  const { state = "searching", size = 20 } = orb;
  const inline = size <= 42;
  return (
    <div
      role="status"
      className={`flex items-center ${inline ? "flex-row gap-2" : "flex-col gap-3"} ${className}`}
    >
      <ThinkingOrb {...orb} size={size} aria-hidden />
      <ShimmerText className="text-sm font-medium text-current/50">{label ?? ORB_STATES[state].label}</ShimmerText>
    </div>
  );
}
