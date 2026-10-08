"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons";
import { previousPath } from "@/components/NavHistory";

/**
 * Back to the orb grid. A real link to "/" (so it works without JS and can be
 * opened in a new tab), but when the visitor came here from the grid it goes
 * back through history instead, which returns them to the same scroll
 * position in the grid rather than the top of the page.
 */
export function BackButton() {
  const router = useRouter();
  return (
    <Link
      href="/"
      onClick={(e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
        if (previousPath() === "/") {
          e.preventDefault();
          router.back();
        }
      }}
      // Icon-only, so the name goes on the link for screen readers and as a tooltip.
      aria-label="Back to all orbs"
      title="Back to all orbs"
      className="custom-button grid size-9 place-items-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-white/40"
    >
      <HugeiconsIcon icon={ArrowLeft01Icon} size={18} color="currentColor" strokeWidth={1.75} aria-hidden="true" />
    </Link>
  );
}
