"use client";

import { useState, type ReactNode } from "react";

/**
 * Clips long content to `collapsedHeight` behind a fade, with an Expand
 * button; the reference's "Every prop" block. The content stays in the DOM,
 * so it is searchable and the copy button copies all of it either way.
 */
export function Expandable({ children, collapsedHeight = 240 }: { children: ReactNode; collapsedHeight?: number }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <div className="overflow-hidden" style={{ maxHeight: open ? undefined : collapsedHeight }}>
        {children}
      </div>
      {!open && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex h-28 items-end justify-start rounded-b-lg bg-linear-to-t from-(--bg) to-transparent p-4">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="pointer-events-auto cursor-pointer rounded-md bg-white/8 px-3 py-1 text-sm text-white/80 transition-colors hover:bg-white/12 hover:text-white"
          >
            Expand
          </button>
        </div>
      )}
    </div>
  );
}
