"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

// The route before this one, within this tab's visit. Module state, so it
// survives client-side navigations (document.referrer does not change on
// those, so it cannot tell an in-app arrival from a direct one).
let current: string | null = null;
let previous: string | null = null;

/** Records route changes. Mounted once, in the root layout. */
export function NavHistory() {
  const pathname = usePathname();
  useEffect(() => {
    if (pathname !== current) {
      previous = current;
      current = pathname;
    }
  }, [pathname]);
  return null;
}

/** The in-app route the visitor came from, or null if they arrived directly. */
export const previousPath = () => previous;
