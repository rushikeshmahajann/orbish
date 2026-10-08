import type { HTMLAttributes } from "react";
import "./shimmer.css";

/** Text with a highlight sweeping across it. Base color comes from `className`; highlight from --shimmer-hi (see shimmer.css). */
export function ShimmerText({ children, className = "", ...rest }: HTMLAttributes<HTMLSpanElement> & { children: string }) {
  return (
    <span className={`orb-shimmer ${className}`} data-text={children} {...rest}>
      {children}
    </span>
  );
}
