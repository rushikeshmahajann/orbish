"use client";

import dynamic from "next/dynamic";
import { useEffect, useState, type ComponentProps } from "react";
import type CursorRingFieldComponent from "@/components/originkit/ui/cursor-ring-field";
import { oklchToHex } from "@/lib/color";

// ssr: false because the effect is a WebGL canvas — there is nothing to
// prerender, and it keeps the shaders out of the initial bundle.
const CursorRingField = dynamic(
  () => import("@/components/originkit/ui/cursor-ring-field"),
  { ssr: false },
);

// The field paints its own host background and takes hex, so the page tokens
// are resolved here rather than read from CSS. BG mirrors --bg in globals.css.
const BG = oklchToHex("oklch(0.145 0 0)");
// Monochrome palette, light → dark across the points: white, mid grey, and a
// grey just above the page background so the far points still read.
const INK = ["oklch(1 0 0)", "oklch(0.7 0 0)", "oklch(0.38 0 0)"].map(
  oklchToHex,
);

/**
 * The hero's dotted cursor field, mounted only once the browser is idle.
 *
 * The hero is decoration behind the heading, so it should never compete with
 * first paint: the chunk is not even requested until the main thread has
 * settled, and the page's real content paints without waiting on it.
 */
export function DeferredRingField(
  props: Omit<
    ComponentProps<typeof CursorRingFieldComponent>,
    "colors" | "background"
  >,
) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Safari has no requestIdleCallback; a short timeout is close enough.
    if (typeof window.requestIdleCallback === "function") {
      const id = window.requestIdleCallback(() => setReady(true), {
        timeout: 2000,
      });
      return () => window.cancelIdleCallback(id);
    }
    const id = window.setTimeout(() => setReady(true), 200);
    return () => window.clearTimeout(id);
  }, []);

  if (!ready) return null;
  return <CursorRingField {...props} background={BG} colors={INK} />;
}
