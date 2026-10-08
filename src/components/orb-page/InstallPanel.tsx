"use client";

import { useState, type ReactNode } from "react";
import { InstallField } from "@/components/InstallField";
import { PackageToggle } from "@/components/PackageToggle";
import { SlidingTabs } from "@/components/SlidingTabs";

const TABS = [
  { id: "cli", label: "CLI" },
  { id: "manual", label: "Manual" },
] as const;

/**
 * CLI | Manual. CLI is the package-manager toggle plus this orb's shadcn
 * command; Manual is the files to copy, rendered on the server and passed in.
 * The package-manager choice is shared page-wide (PackageManagerProvider).
 */
export function InstallPanel({ origin, item, manual }: { origin: string; item: string; manual: ReactNode }) {
  const [tab, setTab] = useState<string>("cli");
  return (
    <div className="flex flex-col gap-4">
      <SlidingTabs items={TABS} value={tab} onChange={setTab} label="Install method" />
      {tab === "cli" ? (
        <div className="flex flex-col gap-3">
          <PackageToggle />
          <InstallField origin={origin} item={item} />
          <p className="px-1 text-xs text-white/40">
            Adds this orb to <code className="font-mono text-white/60">components/orbish/orbs</code>, and the engine it runs on to{" "}
            <code className="font-mono text-white/60">components/orbish</code> if it is not there yet.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">{manual}</div>
      )}
    </div>
  );
}
