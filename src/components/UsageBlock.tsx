"use client";

import { ORB_STATES, ShimmerText, ThinkingOrb, type OrbState } from "@/lib/orbs";
import { PreviewTabs } from "./PreviewTabs";

// Each preview pairs an orb with the status line an agent would show while it
// runs, so the block reads as agents mid-turn rather than specimens in a box.
const PREVIEW: OrbState[] = ["searching", "pondering", "composing", "debugging"];

// The snippet is generated from the first preview's state, so the code can
// never claim to render something the preview doesn't show. The import path is
// where the shadcn registry will install the engine (components/orbish).
const USAGE = `import { ThinkingOrb } from "@/components/orbish";

<ThinkingOrb state="${PREVIEW[0]}" />`;

export function UsageBlock() {
  return (
    <PreviewTabs
      label="Usage view"
      code={
        // overflow-x-auto keeps a long line inside the field rather than
        // widening the column.
        <pre className="w-full overflow-x-auto bg-transparent p-4 font-mono text-sm tracking-tight text-white/70">
          <code>{USAGE}</code>
        </pre>
      }
      preview={
        // Orb where a caret would be, status text where typing would be.
        <div className="grid w-full grid-cols-2 items-center gap-2.5 py-8">
          {PREVIEW.map((state) => (
            <div key={state} className="flex items-center justify-center gap-4 rounded-md px-4 py-6">
              <ThinkingOrb state={state} size={72} theme="dark" />
              <div>
                <ShimmerText className="font-display text-lg font-medium tracking-tight text-white/30">{ORB_STATES[state].label}</ShimmerText>
                <p className="text-sm text-white/70 capitalize">{state}</p>
              </div>
            </div>
          ))}
        </div>
      }
    />
  );
}
